/* ============================================================
   cv-i18n.js — CV language switcher (EN / ID)
   Persists to localStorage under the same key as the portfolio.
   ============================================================ */

(function () {
	var dict = {
		en: {
			'tag': 'curriculum vitae',
			'pdf': 'PDF',
			'kicker': 'Programmer & Service Professional',
			'role': 'E-commerce · Point-of-Sale · Web & UI',
			'sub': 'A detail-oriented Software Engineering (RPL) graduate focused on web development — blending technical programming skills with hands-on experience in customer service and fast-paced outlet operations that demand speed and precision.',
			'available': 'available',
			'c-loc': 'Location', 'c-phone': 'Phone', 'c-mail': 'Email', 'c-status': 'Status',
			'open': 'Open to projects',
			'cta-mail': 'Contact Me', 'save-pdf': 'Save PDF',
			's1-t': 'Professional', 's1-te': 'Summary',
			's1-p1': 'A detail-oriented <strong>Software Engineering (RPL)</strong> graduate focused on web development. I combine technical programming skills — HTML, CSS, JavaScript, PHP, and SQL — with practical experience in customer service and outlet operations that demand speed and precision.',
			's1-p2': 'Used to building systems that are simple, fast, and quietly heavy: from government web applications to cashier and inventory flows in a busy kitchen. Focused on reliability, performance, and precise user experience.',
			's2-t': 'Work', 's2-te': 'Experience',
			'j1-t': 'Outlet Crew', 'j1-r': 'Ayam Geprek Mas Boy', 'j1-d': 'Sep 2025 — May 2026',
			'j1-b1': 'Delivered excellent customer service and ensured customer satisfaction.',
			'j1-b2': 'Worked with the team to maintain cleanliness and hit operational targets.',
			'j1-b3': 'Handled payment transactions and coordinated orders accurately.',
			'j2-t': 'Web Programmer — Internship', 'j2-r': 'Diskominfo West Sumatra', 'j2-d': 'Aug 2023 — Nov 2023',
			'j2-b1': 'Built web applications using HTML, CSS, and JavaScript.',
			'j2-b2': 'Optimized UI/UX design and web page performance.',
			'j2-b3': 'Managed database systems using SQL.',
			's3-t': 'Education &', 's3-te': 'Certifications',
			'edu-t': 'Education', 'edu-f': 'Software Engineering',
			'edu-n': 'Graduated as top student with competencies in software development, hardware, and databases.',
			'cert-t': 'Certifications',
			'cert1-d': 'Valid until May 2026', 'cert1-n': 'Certificate of Competency Assessment', 'cert1-e': 'Highly Competent', 'cert1-o': ' · LSP Komputer',
			'cert2-d': '2023', 'cert2-n': 'Internship Certificate', 'cert2-e': 'Very Satisfactory', 'cert2-o': ' · Diskominfo Sumbar',
			's4-t': 'Skills &', 's4-te': 'More',
			'tech-t': 'Technical Skills', 'soft-t': 'Soft Skills', 'lang-t': 'Languages & Hobbies',
			'soft-1': 'Customer Service', 'soft-2': 'Communication', 'soft-3': 'Teamwork', 'soft-4': 'Time Management',
			'lang-1': 'Indonesian — Native', 'lang-2': 'English — Passive', 'hob-1': 'Reading', 'hob-2': 'Sports',
			'foot-role': 'Programmer & Service Professional'
		},
		id: {
			'tag': 'curriculum vitae',
			'pdf': 'PDF',
			'kicker': 'Programmer & Service Professional',
			'role': 'E-commerce · Point-of-Sale · Web & UI',
			'sub': 'Lulusan Rekayasa Perangkat Lunak yang detail dan berorientasi pada pengembangan web — memadukan keahlian teknis dalam pemrograman dengan pengalaman praktis di pelayanan pelanggan dan operasional outlet yang menuntut kecepatan serta ketepatan.',
			'available': 'tersedia',
			'c-loc': 'Lokasi', 'c-phone': 'Telepon', 'c-mail': 'Email', 'c-status': 'Status',
			'open': 'Terbuka untuk proyek',
			'cta-mail': 'Hubungi Saya', 'save-pdf': 'Simpan PDF',
			's1-t': 'Ringkasan', 's1-te': 'Profesional',
			's1-p1': 'Lulusan <strong>Rekayasa Perangkat Lunak</strong> yang detail dan berorientasi pada pengembangan web. Memiliki kombinasi keahlian teknis dalam pemrograman — HTML, CSS, JavaScript, PHP, dan SQL — serta pengalaman praktis dalam pelayanan pelanggan dan operasional outlet yang menuntut kecepatan serta ketepatan.',
			's1-p2': 'Terbiasa membangun sistem yang sederhana, cepat, dan tenang: dari aplikasi web di lingkungan pemerintahan hingga alur kasir dan inventori di dapur yang sibuk. Fokus pada keandalan, performa, dan pengalaman pengguna yang presisi.',
			's2-t': 'Pengalaman', 's2-te': 'Kerja',
			'j1-t': 'Crew Outlet', 'j1-r': 'Ayam Geprek Mas Boy', 'j1-d': 'Sep 2025 — Mei 2026',
			'j1-b1': 'Memberikan pelayanan pelanggan prima dan memastikan kepuasan konsumen.',
			'j1-b2': 'Bekerja sama dengan tim untuk menjaga kebersihan dan target operasional.',
			'j1-b3': 'Mengelola transaksi pembayaran dan koordinasi pesanan dengan akurat.',
			'j2-t': 'Programmer Web — Magang', 'j2-r': 'Diskominfo Sumatera Barat', 'j2-d': 'Agu 2023 — Nov 2023',
			'j2-b1': 'Mengembangkan aplikasi web menggunakan HTML, CSS, dan JavaScript.',
			'j2-b2': 'Mengoptimalkan desain UI/UX dan performa halaman web.',
			'j2-b3': 'Mengelola sistem basis data menggunakan SQL.',
			's3-t': 'Pendidikan &', 's3-te': 'Sertifikasi',
			'edu-t': 'Pendidikan', 'edu-f': 'Rekayasa Perangkat Lunak',
			'edu-n': 'Lulus sebagai siswa terbaik dengan kompetensi di bidang pengembangan software, hardware, dan basis data.',
			'cert-t': 'Sertifikasi',
			'cert1-d': 'Valid hingga Mei 2026', 'cert1-n': 'Certificate of Competency Assessment', 'cert1-e': 'Highly Competent', 'cert1-o': ' · LSP Komputer',
			'cert2-d': '2023', 'cert2-n': 'Sertifikat Magang', 'cert2-e': 'Sangat Memuaskan', 'cert2-o': ' · Diskominfo Sumbar',
			's4-t': 'Keahlian &', 's4-te': 'Lainnya',
			'tech-t': 'Keahlian Teknis', 'soft-t': 'Soft Skills', 'lang-t': 'Bahasa & Hobi',
			'soft-1': 'Customer Service', 'soft-2': 'Komunikasi', 'soft-3': 'Kerja Sama Tim', 'soft-4': 'Manajemen Waktu',
			'lang-1': 'Indonesia — Native', 'lang-2': 'Inggris — Pasif', 'hob-1': 'Membaca', 'hob-2': 'Olahraga',
			'foot-role': 'Programmer & Service Professional'
		}
	};

	var meta = {
		en: { title: 'Arga Abiyyu Syarif — Curriculum Vitae', desc: 'Curriculum Vitae — Arga Abiyyu Syarif. Programmer & Service Professional.', og: 'Programmer & Service Professional. E-commerce, point-of-sale, and outlet operations.' },
		id: { title: 'Arga Abiyyu Syarif — Curriculum Vitae', desc: 'Curriculum Vitae — Arga Abiyyu Syarif. Programmer & Service Professional.', og: 'Programmer & Service Professional. E-commerce, point-of-sale, dan operasional outlet.' }
	};

	var root = document.documentElement;
	var btn = document.getElementById('lang-toggle');

	function setLang(lang, persist) {
		var t = dict[lang] || dict.id;
		root.setAttribute('lang', lang);
		document.querySelectorAll('[data-i18n]').forEach(function (el) {
			var key = el.getAttribute('data-i18n');
			if (t[key] !== undefined) el.textContent = t[key];
		});
		document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
			var key = el.getAttribute('data-i18n-html');
			if (t[key] !== undefined) el.innerHTML = t[key];
		});
		document.title = meta[lang].title;
		var m = meta[lang];
		var md = document.querySelector('meta[name="description"]');
		var og = document.querySelector('meta[property="og:description"]');
		if (md) md.setAttribute('content', m.desc);
		if (og) og.setAttribute('content', m.og);
		if (btn) btn.textContent = lang === 'id' ? 'EN' : 'ID';
		if (persist) {
			try { localStorage.setItem('portfolio-lang', lang); } catch (e) {}
		}
	}

	try {
		var saved = localStorage.getItem('portfolio-lang');
		if (saved === 'en' || saved === 'id') setLang(saved, false);
	} catch (e) {}

	if (btn) {
		btn.addEventListener('click', function () {
			var cur = root.getAttribute('lang') || 'id';
			setLang(cur === 'id' ? 'en' : 'id', true);
		});
	}
})();