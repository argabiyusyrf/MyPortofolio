/* ============================================================
   visitors.js — self-hosted visitor beacon (no cookies, no 3rd party).
   Tracks a timestamped page view to visitors/api.php, stored in SQLite.
   Anonymous: only a random visitor id kept in localStorage + basic
   env info (path, referrer, screen, lang, timezone). No personal data.
   Include this file on every page you want counted.
   ============================================================ */

(function () {
	'use strict';

	var TRACK_URL = 'visitors/api.php?action=track';
	var VID_KEY = 'visitors.vid';

	function getVid() {
		var vid = null;
		try { vid = window.localStorage.getItem(VID_KEY); } catch (e) { /* no-op */ }
		if (!vid) {
			vid = 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
			try { window.localStorage.setItem(VID_KEY, vid); } catch (e) { /* no-op */ }
		}
		return vid;
	}

	function send() {
		var data = new URLSearchParams({
			v: getVid(),
			path: location.pathname + location.search,
			ref: document.referrer || '',
			screen: [screen.width, screen.height].join('x'),
			lang: (navigator.language || '').slice(0, 10),
			tz: (function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; } })(),
			ua: navigator.userAgent || ''
		});

		if (navigator.sendBeacon) {
			navigator.sendBeacon(TRACK_URL, new Blob([data.toString()], { type: 'application/x-www-form-urlencoded' }));
			return;
		}
		var xhr = new XMLHttpRequest();
		xhr.open('POST', TRACK_URL, true);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send(data.toString());
	}

	if (document.readyState === 'complete') send();
	else window.addEventListener('load', send);
})();