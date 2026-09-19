# AGENTS.md

Static portfolio site (no build step, no package manager, no tests/CI).

## How it runs
- Pure HTML/CSS/JS served by Apache. There are **no npm scripts, lint, or test commands** — don't look for or invent them.
- Must be served over HTTP(S) from the site root. The sub-project pages
  (`arazel-store/`, `foodcraft/`, `whatsapp-enumerator/`) load assets via absolute paths
  (`/css/project.css`, `/js/project.js`), so they **break when opened with `file://`**.
  Use a static server (e.g. `python3 -m http.server`) or deploy to an Apache docroot.
- `.htaccess` forces a 301 to HTTPS + sets HSTS, and blocks dotfiles / `node_modules` /
  `vendor` / `__pycache__`. Local plain-HTTP dev gets redirected; serve with TLS or
  temporarily relax the rule while testing.

## Script wiring (load order matters)
- `index.html`: loads `js/vendor/*.js`, then `js/scene.js`, then `js/app.js`.
  `scene.js` (Three.js hero) must run before `app.js` — keep that order.
- `cv.html`: loads `js/project.js` then `js/cv-i18n.js`.
- `js/vendor/` holds committed copies of three.js, gsap, and ScrollTrigger as **plain
  `<script>` tags (not ES modules, no CDN)**. They are intentionally offline/vendored —
  don't add a bundler, `package.json` deps, or `import` statements for them.

## Pages & shared assets
- `index.html` = main portfolio (3D scene + GSAP ScrollTrigger animations, magnetic buttons).
- `cv.html` = résumé page, shares `css/cv.css` + `css/project.css`.
- Sub-project pages reuse `css/project.css` and `js/project.js`.

## Conventions worth knowing
- i18n (EN/ID) is baked into dictionaries in `js/app.js` and `js/cv-i18n.js`, not a framework.
- Large binary assets (~9 MB: `my-ava.png/.jpeg`) are committed in the repo root — avoid adding
  more large binaries without considering repo size.

## Visitor analytics (self-hosted, PHP + SQLite)
- `js/visitors.js` fires a POST beacon to `visitors/api.php?action=track` once per page load.
  Include it on any page you want counted (already on `index.html` and `cv.html`).
- `visitors/api.php` = JSON API with actions `track` (public, rate-limited + deduped),
  `login`/`logout`/`token` (CSRF-protected), `stats` (auth required). Writes SQLite rows into
  `.data/visits.sqlite` (gitignored; dir must stay writable by the web user). No IPs stored;
  identity = random `vid` in `localStorage`. Same `vid` + `path` within 15 min counts as a
  refresh, not a new visit.
- `visitors/config.php` = shared constants (DB path, passcode `CODE_HASH`, rate limits,
  retention). Edit the passcode hash there and all files inherit it.
- `visitors.php` = the dashboard (SPA). Server-side passcode gate via PHP sessions; passes a
  CSRF token to the API. Canvas trend chart, hour heatmap, tables. EN/ID toggle persists.
- `panel.html` = branded gate page. It posts the passcode to `panel-auth.php`, which validates
  server-side and redirects to `visitors.php` (shared session). The old GoatCounter iframe was
  removed — GoatCounter blocks iframe embedding (`frame-ancestors 'none'`). `panel-auth.php`
  works over plain HTTP, unlike the previous client-side `crypto.subtle` gate which needed HTTPS.
- These are the only PHP files: `visitors.php`, `panel-auth.php`, `visitors/config.php`,
  `visitors/api.php`.
