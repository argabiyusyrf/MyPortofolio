/* ============================================================
   analytics.js — privacy-friendly visitor analytics (no cookies)
   Configure the block below, then include this file on every page.
   Default provider: GoatCounter (free, GDPR-friendly, no cookie).
   ============================================================ */

(function () {
	// ---- Configuration (edit once, applies to all pages) ----
	var CONFIG = {
		provider: 'goatcounter',            // 'goatcounter' | 'plausible'
		goatcounterSite: 'argabiyusyrf', // your GoatCounter code, e.g. 'argaportfolio'
		plausibleDomain: 'REPLACE_WITH_DOMAIN' // your domain, e.g. 'portfolio.example.com'
	};
	// ---------------------------------------------------------

	var ready = function (cb) {
		if (document.readyState !== 'loading') cb();
		else document.addEventListener('DOMContentLoaded', cb);
	};

	// Respect Do Not Track — don't load any analytics script if set.
	var dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
	var trackingDenied = dnt === '1' || dnt === 'yes';

	if (!trackingDenied && CONFIG.provider === 'goatcounter' && CONFIG.goatcounterSite.indexOf('REPLACE') === -1) {
		ready(function () {
			var s = document.createElement('script');
			s.async = true;
			s.src = 'https://gc.zgo.at/count.js';
			s.setAttribute('data-goatcounter', 'https://' + CONFIG.goatcounterSite + '.goatcounter.com/count');
			document.head.appendChild(s);
		});
	} else if (CONFIG.provider === 'plausible' && CONFIG.plausibleDomain.indexOf('REPLACE') === -1) {
		ready(function () {
			var p = document.createElement('script');
			p.async = true;
			p.setAttribute('data-domain', CONFIG.plausibleDomain);
			p.src = 'https://plausible.io/js/script.js';
			document.head.appendChild(p);
		});
	}
})();
