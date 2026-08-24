/* ============================================================
   project.js — case study detail pages
   Theme switcher · scroll reveals
   ============================================================ */

(function () {
	var themes = ['studio', 'obsidian', 'solaris'];
	var root = document.documentElement;
	var btn = document.getElementById('theme-toggle');

	function setTheme(name, persist) {
		root.setAttribute('data-theme', name);
		if (btn) btn.textContent = name.charAt(0).toUpperCase() + name.slice(1);
		if (persist) {
			try { localStorage.setItem('portfolio-theme', name); } catch (e) {}
		}
	}

	try {
		var saved = localStorage.getItem('portfolio-theme');
		if (themes.indexOf(saved) !== -1) setTheme(saved, false);
	} catch (e) {}

	if (btn) {
		btn.addEventListener('click', function () {
			var cur = root.getAttribute('data-theme') || 'studio';
			var idx = themes.indexOf(cur);
			setTheme(themes[(idx + 1) % themes.length], true);
		});
	}

	if ('IntersectionObserver' in window) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (en.isIntersecting) {
					en.target.classList.add('revealed');
					io.unobserve(en.target);
				}
			});
		}, { threshold: 0.12 });
		document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
	} else {
		document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('revealed'); });
	}
})();
