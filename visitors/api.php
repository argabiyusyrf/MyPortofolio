<?php
/* ============================================================
   api.php — JSON API for self-hosted visitor analytics.
   Actions:  track · login · logout · stats · token
   Public:   track (rate-limited, deduped)
   Protected: stats, token, logout  (require session)
   ============================================================ */

declare(strict_types=1);

require __DIR__ . '/config.php';

// ── helpers ──────────────────────────────────────────────────
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

function jsonBody(): array {
    $ct = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($ct, 'application/json') !== false) {
        $raw = file_get_contents('php://input');
        $j = json_decode((string)$raw, true);
        return is_array($j) ? $j : [];
    }
    $data = [];
    parse_str((string)file_get_contents('php://input'), $data);
    foreach ($_POST as $k => $v) $data[$k] = $v;
    return $data;
}

function out(int $code, array $data): never {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function initSession(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    session_name(VIS_SESSION_NAME);
    session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax']);
    session_start();
}

function db(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;
    $dir = dirname(VIS_DB_PATH);
    if (!is_dir($dir)) @mkdir($dir, 0777, true);

    $pdo = new PDO('sqlite:' . VIS_DB_PATH);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec('PRAGMA busy_timeout = 2000');
    $pdo->exec('PRAGMA foreign_keys = OFF');

    // NOTE: no WAL mode. WAL leaves persistent -shm/-wal files owned by whoever
    // opened the DB first, so the web user (www-data) and a CLI dev user can end
    // up locked out of each other's files. Default rollback journal keeps only
    // the single DB file. Make it world-writable so both sides can write.
    @chmod(VIS_DB_PATH, 0666);

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS visits (
            id      INTEGER PRIMARY KEY AUTOINCREMENT,
            ts      INTEGER NOT NULL,
            vid     TEXT    NOT NULL,
            path    TEXT    NOT NULL DEFAULT "/",
            ref     TEXT    NOT NULL DEFAULT "",
            screen  TEXT    NOT NULL DEFAULT "",
            lang    TEXT    NOT NULL DEFAULT "",
            tz      TEXT    NOT NULL DEFAULT "",
            ua      TEXT    NOT NULL DEFAULT ""
        );
        CREATE INDEX IF NOT EXISTS idx_visits_ts    ON visits(ts);
        CREATE INDEX IF NOT EXISTS idx_visits_vid   ON visits(vid);
        CREATE INDEX IF NOT EXISTS idx_visits_path  ON visits(path);
        CREATE TABLE IF NOT EXISTS rate (
            key   TEXT    NOT NULL,
            m     INTEGER NOT NULL,
            cnt   INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (key, m)
        );'
    );

    // lightweight migrations: add columns that may be missing from older DBs
    $cols = [];
    foreach ($pdo->query('PRAGMA table_info(visits)') as $c) $cols[] = $c['name'];
    if (!in_array('ua', $cols, true)) {
        $pdo->exec('ALTER TABLE visits ADD COLUMN ua TEXT NOT NULL DEFAULT ""');
    }

    return $pdo;
}

function sanitizePath(string $s): string {
    $s = '/' . ltrim($s, '/');
    return mb_substr($s, 0, 512);
}

function extractRefHost(string $url): string {
    if ($url === '') return '';
    $host = parse_url($url, PHP_URL_HOST) ?? '';
    if ($host === '' || $host === false) return mb_substr($url, 0, 128);
    return mb_substr($host, 0, 128);
}

function parseUA(string $ua): array {
    if ($ua === '') return ['device' => '', 'browser' => ''];
    $device = 'desktop';
    if (preg_match('/Mobile|Android|iPhone|iPad|iPod|Windows Phone|Kindle|Silk|Opera Mini/i', $ua)) $device = 'mobile';
    elseif (preg_match('/iPad|Tablet|PlayBook/i', $ua)) $device = 'tablet';

    $browser = 'other';
    if (preg_match('/Edg(?:e|A|iOS)?\/(\d+)/i', $ua, $m))       $browser = 'Edge ' . $m[1];
    elseif (preg_match('/Chrome\/(\d+)/i', $ua, $m))             $browser = 'Chrome ' . $m[1];
    elseif (preg_match('/Firefox\/(\d+)/i', $ua, $m))            $browser = 'Firefox ' . $m[1];
    elseif (preg_match('/Version\/(\d+).*Safari/i', $ua, $m))   $browser = 'Safari ' . $m[1];
    elseif (preg_match('/Opera[\/ ](\d+)/i', $ua, $m))          $browser = 'Opera ' . $m[1];

    return ['device' => $device, 'browser' => $browser];
}

// ── track ────────────────────────────────────────────────────
function actionTrack(): never {
    $body = jsonBody();
    $vid  = trim((string)($body['v'] ?? $body['vid'] ?? ''));
    $path = trim((string)($body['path'] ?? '/'));
    if ($vid === '' || $path === '') out(204, []);

    $now = time();
    $pdo = db();

    // rate-limit: per vid, per minute
    $min  = (int)floor($now / 60);
    $rkey = hash('sha256', $vid . VIS_SALT);
    $stmt = $pdo->prepare('SELECT cnt FROM rate WHERE key = ? AND m = ?');
    $stmt->execute([$rkey, $min]);
    $cnt = (int)($stmt->fetchColumn() ?: 0);
    if ($cnt >= VIS_RATE_PER_MIN) out(204, []);
    $pdo->prepare('INSERT INTO rate(key,m,cnt) VALUES(?,?,1) ON CONFLICT(key,m) DO UPDATE SET cnt=cnt+1')
        ->execute([$rkey, $min]);
    $pdo->prepare('DELETE FROM rate WHERE m < ?')->execute([$min - 2]);

    // dedup
    $dup = $pdo->prepare('SELECT 1 FROM visits WHERE vid = ? AND path = ? AND ts > ? LIMIT 1');
    $dup->execute([$vid, $path, $now - VIS_DEDUP_SEC]);
    if ($dup->fetchColumn() !== false) out(204, []);

    $ua    = mb_substr((string)($body['ua'] ?? ($_SERVER['HTTP_USER_AGENT'] ?? '')), 0, 300);
    $ref   = mb_substr((string)($body['ref'] ?? ''), 0, 512);
    $scr   = mb_substr((string)($body['screen'] ?? ''), 0, 16);
    $lang  = mb_substr((string)($body['lang'] ?? ''), 0, 10);
    $tz    = mb_substr((string)($body['tz'] ?? ''), 0, 64);

    $pdo->prepare('INSERT INTO visits(ts,vid,path,ref,screen,lang,tz,ua) VALUES(?,?,?,?,?,?,?,?)')
        ->execute([$now, $vid, sanitizePath($path), $ref, $scr, $lang, $tz, $ua]);

    // prune old
    $pdo->prepare('DELETE FROM visits WHERE ts < ?')->execute([$now - VIS_RETENTION_DAYS * 86400]);

    out(204, []);
}

// ── auth ─────────────────────────────────────────────────────
function actionLogin(): never {
    initSession();
    $body = jsonBody();
    $csrf = (string)($_POST['_csrf'] ?? $body['_csrf'] ?? '');
    $code = (string)($_POST['code'] ?? $body['code'] ?? '');

    // CSRF check
    if (!isset($_SESSION['_csrf']) || !hash_equals($_SESSION['_csrf'], $csrf)) {
        out(403, ['ok' => false, 'error' => 'invalid_csrf']);
    }

    if ($code !== '' && hash('sha256', $code) === VIS_CODE_HASH) {
        session_regenerate_id(true);
        $_SESSION['visitors_unlocked'] = true;
        unset($_SESSION['_csrf']);
        out(200, ['ok' => true]);
    }
    out(401, ['ok' => false, 'error' => 'invalid_code']);
}

function actionLogout(): never {
    initSession();
    $body = jsonBody();
    $csrf = (string)($_POST['_csrf'] ?? $body['_csrf'] ?? '');
    if (!isset($_SESSION['_csrf']) || !hash_equals($_SESSION['_csrf'], $csrf)) {
        out(403, ['ok' => false, 'error' => 'invalid_csrf']);
    }
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 3600, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
    out(200, ['ok' => true]);
}

function actionToken(): never {
    initSession();
    if (empty($_SESSION['visitors_unlocked'])) out(401, ['error' => 'unauthorized']);
    $_SESSION['_csrf'] = bin2hex(random_bytes(32));
    out(200, ['token' => $_SESSION['_csrf']]);
}

// ── stats ────────────────────────────────────────────────────
function val(PDO $pdo, string $sql, array $p = []): int {
    $s = $pdo->prepare($sql);
    $s->execute($p);
    return (int)$s->fetchColumn();
}

function rows(PDO $pdo, string $sql, array $p = []): array {
    $s = $pdo->prepare($sql);
    $s->execute($p);
    return $s->fetchAll(PDO::FETCH_ASSOC);
}

function actionStats(): never {
    initSession();
    if (empty($_SESSION['visitors_unlocked'])) out(401, ['error' => 'unauthorized']);

    $pdo = db();

    $today  = strtotime('today');
    $w7     = strtotime('-6 days', $today);
    $m30    = strtotime('-29 days', $today);

    $visitsToday   = val($pdo, 'SELECT COUNT(*) FROM visits WHERE ts >= ?', [$today]);
    $uniquesToday  = val($pdo, 'SELECT COUNT(DISTINCT vid) FROM visits WHERE ts >= ?', [$today]);
    $visitsW7      = val($pdo, 'SELECT COUNT(*) FROM visits WHERE ts >= ?', [$w7]);
    $uniquesW7     = val($pdo, 'SELECT COUNT(DISTINCT vid) FROM visits WHERE ts >= ?', [$w7]);
    $visitsM30     = val($pdo, 'SELECT COUNT(*) FROM visits WHERE ts >= ?', [$m30]);
    $uniquesM30    = val($pdo, 'SELECT COUNT(DISTINCT vid) FROM visits WHERE ts >= ?', [$m30]);
    $visitsAll     = val($pdo, 'SELECT COUNT(*) FROM visits');
    $uniquesAll    = val($pdo, 'SELECT COUNT(DISTINCT vid) FROM visits');

    // trend: last 30 days
    $trend = [];
    foreach (rows($pdo, 'SELECT date(ts,"unixepoch","localtime") d, COUNT(*) v, COUNT(DISTINCT vid) u
                         FROM visits WHERE ts >= ? GROUP BY d ORDER BY d', [$m30]) as $r) {
        $trend[] = ['d' => $r['d'], 'v' => (int)$r['v'], 'u' => (int)$r['u']];
    }

    // hourly
    $hours = [];
    foreach (rows($pdo, 'SELECT strftime("%H",ts,"unixepoch","localtime") h, COUNT(*) n FROM visits GROUP BY h') as $r) {
        $hours[(int)$r['h']] = (int)$r['n'];
    }
    $hourArr = [];
    for ($i = 0; $i < 24; $i++) $hourArr[] = $hours[$i] ?? 0;

    // top pages
    $pages = rows($pdo, 'SELECT path, COUNT(*) v, COUNT(DISTINCT vid) u FROM visits GROUP BY path ORDER BY v DESC LIMIT 15');

    // top referrers (host-only)
    $refs = rows($pdo, 'SELECT ref, COUNT(*) n FROM visits WHERE ref != "" GROUP BY ref ORDER BY n DESC LIMIT 10');
    $refHosts = [];
    foreach ($refs as $r) {
        $host = extractRefHost($r['ref']);
        if ($host === 'google.com' || $host === 'www.google.com') $host = 'Google';
        $refHosts[] = ['host' => $host, 'n' => (int)$r['n']];
    }

    // device / browser breakdown
    $devices   = [];
    $browsers  = [];
    foreach (rows($pdo, 'SELECT ua, COUNT(*) n FROM visits WHERE ua != "" GROUP BY ua ORDER BY n DESC LIMIT 100') as $r) {
        $p = parseUA((string)$r['ua']);
        $devices[$p['device']]  = ($devices[$p['device']]  ?? 0) + (int)$r['n'];
        $browsers[$p['browser']] = ($browsers[$p['browser']] ?? 0) + (int)$r['n'];
    }
    arsort($devices);
    arsort($browsers);
    $deviceList  = array_map(fn($k, $v) => ['name' => $k ?: 'unknown', 'n' => $v], array_keys($devices), array_values($devices));
    $browserList = array_map(fn($k, $v) => ['name' => $k ?: 'unknown', 'n' => $v], array_keys($browsers), array_values($browsers));

    // recent
    $recent = [];
    foreach (rows($pdo, 'SELECT ts, vid, path, ref, screen, lang, ua FROM visits ORDER BY ts DESC LIMIT 25') as $r) {
        $ua = parseUA((string)$r['ua']);
        $recent[] = [
            'ts'     => (int)$r['ts'],
            'vid'    => substr((string)$r['vid'], 0, 8) . '…',
            'path'   => $r['path'],
            'ref'    => extractRefHost((string)$r['ref']) ?: '—',
            'screen' => $r['screen'] ?: '—',
            'lang'   => $r['lang'] ?: '—',
            'device' => $ua['device'],
            'browser'=> $ua['browser'],
        ];
    }

    // lang breakdown
    $langs = [];
    foreach (rows($pdo, 'SELECT lang, COUNT(*) n FROM visits WHERE lang != "" GROUP BY lang ORDER BY n DESC LIMIT 10') as $r) {
        $langs[] = ['name' => $r['lang'], 'n' => (int)$r['n']];
    }

    out(200, [
        'overview' => [
            'visitsToday'  => $visitsToday,
            'uniquesToday' => $uniquesToday,
            'visitsW7'     => $visitsW7,
            'uniquesW7'    => $uniquesW7,
            'visitsM30'    => $visitsM30,
            'uniquesM30'   => $uniquesM30,
            'visitsAll'    => $visitsAll,
            'uniquesAll'   => $uniquesAll,
        ],
        'trend'   => $trend,
        'hours'   => $hourArr,
        'pages'   => $pages,
        'referrers'=> $refHosts,
        'devices' => $deviceList,
        'browsers'=> $browserList,
        'langs'   => $langs,
        'recent'  => $recent,
        'generated_at' => date('c'),
    ]);
}

// ── router ───────────────────────────────────────────────────
try {
    $action = (string)($_GET['action'] ?? $_POST['action'] ?? '');
    $callable = 'action' . ucfirst($action);
    if (function_exists($callable)) {
        $callable();
    } else {
        out(404, ['error' => 'unknown_action']);
    }
} catch (Throwable $e) {
    // log to FPM stderr + optional local debug file, respond JSON
    @file_put_contents(__DIR__ . '/../.data/api-error.log',
        date('c') . ' ' . $e->getMessage() . ' @ ' . basename($e->getFile()) . ':' . $e->getLine() . "\n",
        FILE_APPEND);
    error_log('visitors api: ' . $e->getMessage());
    out(500, ['error' => 'internal_error']);
}