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
- Large binary assets (~9 MB: `my-ava.png/.jpeg`) are committed in the repo root and there is
  **no `.gitignore` yet** — avoid adding more large binaries without considering repo size.
