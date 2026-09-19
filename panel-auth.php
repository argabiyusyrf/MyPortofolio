<?php
/* ============================================================
   panel-auth.php — server-side passthrough gate for panel.html.
   Validates the passcode (from config.php) and starts the shared
   session, then hands off to the self-hosted dashboard.
   Works over plain HTTP — no crypto.subtle needed.
   ============================================================ */

declare(strict_types=1);

require __DIR__ . '/visitors/config.php';

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_name(VIS_SESSION_NAME);
    session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax']);
    session_start();
}

$code = (string)($_POST['code'] ?? '');

if ($code !== '' && hash('sha256', $code) === VIS_CODE_HASH) {
    session_regenerate_id(true);
    $_SESSION['visitors_unlocked'] = true;
    header('Location: visitors.php');
} else {
    header('Location: panel.html?err=1');
}
exit;