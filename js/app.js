/* ============================================================
   app.js — GSAP film direction & complete interactive feature suite
   Split reveals · scrub word-lights · horizontal works pin ·
   magnetic buttons · custom cursor · theme switcher · soundscape ·
   command palette · case study modal · skill filtering · toasts
   ============================================================ */

(function () {
	var REDUCED = !!window.__REDUCED__;

	gsap.registerPlugin(ScrollTrigger);

	/* ---------------- Toast Notification System ---------------- */

	var toastContainer = document.getElementById('toast-container');
	function showToast(msg) {
		if (!toastContainer) return;
		var toast = document.createElement('div');
		toast.className = 'toast';
		toast.innerHTML = '<span class="toast-dot" aria-hidden="true"></span><span>' + msg + '</span>';
		toastContainer.appendChild(toast);

		setTimeout(function () {
			toast.classList.add('toast-out');
			setTimeout(function () {
				if (toast.parentNode) toast.parentNode.removeChild(toast);
			}, 400);
		}, 3000);
	}

	/* ---------------- Internationalization (EN / ID) ---------------- */

	var currentLang = 'en';

	var I18N = {
		en: {
			preloader: 'initializing scene',
			title: 'argabiyusyrf — Digital Gravity & Light',
			'meta-desc': 'argabiyusyrf — builds cinematic 3D scenes, e-commerce systems, and quiet tooling. A live experiment in digital gravity and light.',
			'og-desc': 'Cinematic 3D scenes, e-commerce systems, quiet tooling.',
			'sound-muted': 'Muted', 'sound-playing': 'Playing',
			'menu-identity': 'identity', 'menu-intent': 'the intent', 'menu-works': 'selected works',
			'menu-journey': 'the journey', 'menu-toolkit': 'the toolkit', 'menu-touch': 'in touch',
			'menu-note': 'indonesia · building on the open web',
			'menu-theme-label': 'Theme:',
			'hero-eyebrow': 'independent builder · cg & code',
			'hero-line2': 'and the <span class="f italic thin">physics</span> of sight',
			'hero-sub': 'I build <em>cinematic 3D scenes</em>, e-commerce systems, and quiet tooling — where every pixel holds weight and every frame carries light.',
			'btn-work': 'enter the work', 'btn-focus': '3D Artifact Focus', 'btn-hello': 'say hello',
			'lat': 'lat', 'lng': 'lng', 'alt': 'alt', 'time': 'time',
			'hero-help': 'press <kbd>h</kbd> to help',
			'scroll': 'scroll',
			'id-chapter': 'identity', 'id-kicker': 'Identity',
			'id-tagline': '3D creative developer · cg & code — Sumatera Barat, Indonesia',
			'id-bio': 'Born between a render farm and a cash register. SMK RPL gave me the foundation; the field gave me the instinct — running a busy kitchen\'s point-of-sale taught me what tired, fast, real users actually need. I shape <em>three.js</em> like clay, <em>GSAP</em> like breath, and the backend until it disappears. Every system ships simple, fast, and quietly heavy.',
			'id-status': 'available for select projects',
			'id-caption': 'webgl · clay · light',
			'id-fact-based': 'based', 'id-fact-status': 'status', 'id-fact-focus': 'focus', 'id-fact-since': 'since',
			'id-fact-work': 'open to work',
			'cv-kicker': 'Curriculum vitae',
			'cv-title': 'The quiet <span class="f italic">resume.</span>',
			'cv-download': 'Download CV',
			'cv-view': 'View CV',
			'cv-card1-h': 'Personal data', 'cv-card2-h': 'Education & learning', 'cv-card3-h': 'Core strengths', 'cv-card4-h': 'Currently exploring',
			'cv-fullname': 'full name', 'cv-birthplace': 'birthplace', 'cv-domicile': 'domicile', 'cv-email': 'email', 'cv-languages': 'languages',
			'cv-lang-val': 'Indonesian (native) · English (working)',
'cv-edu1-year': '2021 — 2024', 'cv-edu1-t': 'SMK Negeri 1 Singkarak · RPL',
			'cv-edu1-d': 'Rekayasa Perangkat Lunak — software foundations: logic, databases, and coding; where my engineering instinct began.',
			'cv-edu2-t': 'Self-taught engineering path',
			'cv-edu2-d': 'WebGL, computer graphics, system architecture — learned by shipping real systems, not courses.',
			'cv-edu3-t': 'Field systems & operations',
			'cv-edu3-d': 'Cashier flows, shift stock tracking, and sales recaps — learned firsthand in a real, busy kitchen.',
			'cv-str1': 'E-commerce & point-of-sale system design',
			'cv-str2': 'Cinematic WebGL & material composition',
			'cv-str3': 'Relational business data, normalized to 3NF',
			'cv-str4': 'Tailwind UI & motion choreography with GSAP',
			'cv-now': 'Real-time ray marching, spatial audio, and keeping a heavy scene fast on cheap iron — the craft of invisible performance.',
			'ab-chapter': 'the intent', 'ab-kicker': 'The intent',
			'ab-title': 'Light is a material. So is code. I treat both like clay —',
			'ab-copy': 'Building started small: a store, a food pipeline, a terminal tool. Every one taught the same lesson — interfaces are scenes, and scenes are stories told with motion. Three.js gives geometry a soul, GSAP gives time a rhythm, and PHP keeps the whole thing running while nobody watches. The result is work that feels lived-in: warm, weighty, impossible to ignore. Pragmatic by default, allergic to sloppy details, and a fast self-directed learner — I bridge real business needs into working code, not theory.',
			'stat-shipped': 'systems shipped', 'stat-stack': 'stacks in rotation', 'stat-ticks': 'ticks of a clock',
			'wk-chapter': 'selected works', 'wk-kicker': 'Selected works',
			'wk-title': 'Small worlds,<br>each with its own <span class="f italic">gravity.</span>',
			'inspect': '3D Inspect', 'case-study': 'Case Study', 'visit-live': 'visit live', 'see-repo': 'see repository',
			'arazel-d': 'Full e-commerce — auth, cart, checkout, and a lean admin panel. No heavyweight framework: a hand-rolled PHP core that stays fast on cheap iron.',
			'foodcraft-d': 'An ordering pipeline where meals flow from menu to doorstep. Templates, controllers, and storage wired into a single clean router.',
			'enumerator-d': 'A CLI that expands partial Indonesian numbers, then checks WhatsApp registration on your own session — with resume, rate-limit, and CSV output.',
			'bookshelf-d': 'A responsive book manager — add, edit, search, filter, and sort titles into "to read" and "finished" shelves, all persisting in your browser.',
			'csirt-d': 'A public-facing site for a Computer Security Incident Response Team — incident awareness, threat assessment, and mitigation planning.',
			'calculator-d': 'A native Android calculator built for the 2024 UKK exam — clean arithmetic UI with expression evaluation, tested under exam pressure.',
			'wk-hint': 'drag — the scene follows the scroll',
			'exp-chapter': 'the journey', 'exp-kicker': 'The journey',
			'exp-title': 'Milestones & <span class="f italic">system builds.</span>',
			't1-badge': '3D & WebGL Systems', 't1-title': 'Cinematic Web & Shader Architectures',
			't1-desc': 'Developing custom Three.js WebGL scenes, shader-based post-processing effects, and GSAP ScrollTrigger pipelines for immersive Web experiences with strict zero-dependency philosophy.',
			't1-li1': 'Built real-time procedural lighting & clay-shading sculpts in vanilla Three.js.',
			't1-li2': 'Engineered physics-based 3D scroll synchronization with sub-pixel camera poses.',
			't2-badge': 'Fullstack Systems', 't2-title': 'E-Commerce, POS & Routing Cores',
			't2-desc': 'Hand-crafted modular PHP backends — full e-commerce and point-of-sale flows without framework overhead. Relational SQL schemas, cart state engines, and Nginx rules tuned for ultra-low latency.',
			't2-li1': 'Implemented custom auth, cart state engines, checkout, and admin dashboards.',
			't2-li2': 'Designed normalized business data (3NF) and sub-120ms renders on low-cost VPS.',
			't3-badge': 'Field Systems & CLI', 't3-title': 'Point-of-Sale Ops & Automation',
			't3-desc': 'Frontline operations at Ayam Geprek Mas Boy — daily cashier flows, shift-based stock tracking, and sales recaps — paired with my own Node.js CLI tools for repetitive data work.',
			't3-li1': 'Ran point-of-sale operations and shift handover stock counts.',
			't3-li2': 'Built Node.js automation — batch processing, rate limits, CSV export.',
			't4-badge': 'SMK RPL · Gov IT', 't4-title': 'Foundations & Government IT',
			't4-desc': 'Rekayasa Perangkat Lunak at SMK Negeri 1 Singkarak, plus time inside Dinas Kominfo Sumbar — where I learned how public institutions structure software, data, and documentation.',
			't4-li1': 'Built software foundations — logic, databases, coding — at SMK RPL.',
			't4-li2': 'Supported real government IT workflows at Diskominfo Sumbar.',
			'sk-chapter': 'the toolkit', 'sk-kicker': 'The toolkit',
			'sk-title': 'Grains of<br>the <span class="f italic">stack.</span>',
			'filter-all': 'All', 'filter-cg': '3D & Frontend', 'filter-be': 'Backend & DB', 'filter-ops': 'DevOps & CLI', 'filter-label': 'filter',
			's1-h': 'Three.js <b>& WebGL</b>',
			's1-d': 'Geometry, materials, light paths, custom procedural shaders, 3D game logic (Unity), and performance budget tuning.',
			's2-h': 'GSAP <b>& ScrollTrigger</b>',
			's2-d': 'Scroll, pin, scrub — time as a tool, multi-phase keyframes, and magnetic UI interactions.',
			's3-h': 'PHP <b>(Vanilla MVC)</b>',
			's3-d': 'Hand-rolled cores, clean router engines, e-commerce & POS flows, zero-dependency session management and security.',
			's4-h': 'MySQL <b>/ Relational SQL</b>',
			's4-d': 'Business data normalized to 3NF, indexed queries, transactions, and performant storage.',
			's5-h': 'Node.js <b>& Tooling</b>',
			's5-d': 'CLI tools, data pipelines, web socket integrations, and headless automation streams.',
			's6-h': 'Nginx <b>& Server Ops</b>',
			's6-d': 'Server configuration, reverse proxy setup, quiet deployments, SSL, and HTTP/2 tuning on Linux/Ubuntu.',
			's7-h': 'Tailwind <b>& UI Engineering</b>',
			's7-d': 'Responsive, modular interfaces — minimalist-chic and liquid-glass systems translated into precise frontend code.',
			's8-h': 'POS <b>& Inventory Logic</b>',
			's8-d': 'Point-of-sale flows, shift-based stock tracking, daily sales recaps, and business data normalized to 3NF.',
			'ft-chapter': 'in touch', 'ft-kicker': 'In touch',
			'ft-title': 'Have a world<br>to <span class="f italic">weigh</span> out?',
			'copy-addr': 'Copy Address',
			'form-title': 'Send a quiet note',
			'ph-name': 'Your name', 'ph-email': 'Your email', 'ph-msg': 'Brief detail or idea...',
			'btn-transmit': 'Transmit Note',
			'ft-meta': 'est. 2022 — the open web',
			'ft-copy': '© <span id="copy-year"></span> argabiyusyrf — all rights reserved',
			'ft-foot': 'built to fade only at the edge of the light.',
			'modal-tag': 'Case Study', 'modal-arch': 'Core Architecture', 'modal-stack': 'Tech Stack & Dependencies',
			'modal-open': 'Open System / Live Demo', 'modal-repo': 'See Repository',
			'help-title': 'Keyboard shortcuts',
			'h1': 'Open command palette', 'h2': 'Cycle visual theme', 'h3': 'Toggle soundscape', 'h4': 'Copy email',
			'h5': 'Download CV', 'h6': '3D artifact focus', 'h7': 'Switch language', 'h8': 'Show shortcuts', 'h9': 'Close overlays / menu',
			'help-foot': 'Shortcuts are ignored while you are typing in a field.',
			'cmdk-ph': 'Type a section or command (e.g. works, theme, audio, contact)...',
			'cmdk-nav': 'Navigation', 'cmdk-cmds': 'Commands',
			'cmdk-hero': 'Hero / Beginning', 'cmdk-identity': 'Act I: Identity', 'cmdk-intent': 'Act II: The Intent',
			'cmdk-works': 'Act III: Selected Works', 'cmdk-journey': 'Act IV: The Journey',
			'cmdk-toolkit': 'Act V: The Toolkit', 'cmdk-contact': 'Act VI: Contact',
			'cmdk-theme': 'Switch Visual Theme', 'cmdk-sound': 'Toggle Ambient Soundscape', 'cmdk-lang': 'Switch Language',
			'cmdk-email': 'Copy Email to Clipboard', 'cmdk-cv': 'Download CV', 'cmdk-3d': 'Activate 3D Artifact Focus',
			'toast-theme': 'Theme switched to ', 'toast-sound-on': 'Ambient soundscape active', 'toast-sound-off': 'Soundscape muted',
			'toast-lang': 'Language switched to ', 'toast-email': 'Email copied to clipboard!', 'toast-cv': 'CV downloaded — opens anywhere',
			'toast-3d': '3D Focus Mode toggled — drag to inspect artifact', 'toast-msg': 'Message transmitted successfully! Thank you.',
			'err-name-required': 'Please tell me your name.', 'err-name-min': 'Name needs at least 2 characters.',
			'err-email-required': 'An email is required.', 'err-email-invalid': "That email doesn't look right.",
			'err-msg-required': 'A short message is required.', 'err-msg-min': 'Message needs at least 10 characters.'
		},
		id: {
			preloader: 'memuat scene',
			title: 'argabiyusyrf — Gravitasi & Cahaya Digital',
			'meta-desc': 'argabiyusyrf — membangun scene 3D sinematik, sistem e-commerce, dan perkakas yang tenang. Sebuah eksperimen hidup tentang gravitasi dan cahaya digital.',
			'og-desc': 'Scene 3D sinematik, sistem e-commerce, perkakas yang tenang.',
			'sound-muted': 'Bisu', 'sound-playing': 'Berputar',
			'menu-identity': 'identitas', 'menu-intent': 'niat', 'menu-works': 'karya terpilih',
			'menu-journey': 'perjalanan', 'menu-toolkit': 'perangkat', 'menu-touch': 'berhubungan',
			'menu-note': 'indonesia · membangun di web terbuka',
			'menu-theme-label': 'Tema:',
			'hero-eyebrow': 'pembangun independen · cg & kode',
			'hero-line2': 'dan <span class="f italic thin">fisika</span> penglihatan',
			'hero-sub': 'Aku membangun <em>scene 3D sinematik</em>, sistem e-commerce, dan perkakas yang tenang — di mana setiap piksel berbobot dan setiap bingkai membawa cahaya.',
			'btn-work': 'masuk ke karya', 'btn-focus': 'Fokus Artefak 3D', 'btn-hello': 'sapa aku',
			'lat': 'lat', 'lng': 'lng', 'alt': 'alt', 'time': 'waktu',
			'hero-help': 'tekan <kbd>h</kbd> untuk bantuan',
			'scroll': 'gulir',
			'id-chapter': 'identitas', 'id-kicker': 'Identitas',
			'id-tagline': 'pengembang kreatif 3D · cg & kode — Sumatera Barat, Indonesia',
			'id-bio': 'Lahir di antara render farm dan mesin kasir. SMK RPL memberiku fondasi; lapangan memberiku naluri — menangani point-of-sale dapur yang sibuk mengajarkan apa yang benar-benar dibutuhkan pengguna yang lelah dan cepat. Kubentuk <em>three.js</em> seperti tanah liat, <em>GSAP</em> seperti napas, dan backend sampai ia menghilang. Setiap sistem hadir sederhana, cepat, dan tenang.',
			'id-status': 'tersedia untuk proyek pilihan',
			'id-caption': 'webgl · tanah liat · cahaya',
			'id-fact-based': 'berbasis', 'id-fact-status': 'status', 'id-fact-focus': 'fokus', 'id-fact-since': 'sejak',
			'id-fact-work': 'terbuka untuk kerja',
			'cv-kicker': 'Curriculum vitae',
			'cv-title': 'Resume yang <span class="f italic">tenang.</span>',
			'cv-download': 'Unduh CV',
			'cv-view': 'Lihat CV',
			'cv-card1-h': 'Data pribadi', 'cv-card2-h': 'Pendidikan & pembelajaran', 'cv-card3-h': 'Keahlian utama', 'cv-card4-h': 'Sedang dijelajahi',
			'cv-fullname': 'nama lengkap', 'cv-birthplace': 'tempat lahir', 'cv-domicile': 'domisili', 'cv-email': 'email', 'cv-languages': 'bahasa',
			'cv-lang-val': 'Indonesia (asli) · Inggris (aktif)',
			'cv-edu1-year': '2021 — 2024', 'cv-edu1-t': 'SMK Negeri 1 Singkarak · RPL',
			'cv-edu1-d': 'Rekayasa Perangkat Lunak — fondasi software: logika, basis data, dan coding; tempat naluri rekayasaku dimulai.',
			'cv-edu2-t': 'Jalur rekayasa otodidak',
			'cv-edu2-d': 'WebGL, grafika komputer, arsitektur sistem — dipelajari dengan merilis sistem nyata, bukan kursus.',
			'cv-edu3-t': 'Sistem & operasional lapangan',
			'cv-edu3-d': 'Alur kasir, pelacakan stok antar shift, dan rekap penjualan — dipelajari langsung di dapur yang sibuk.',
			'cv-str1': 'Desain sistem e-commerce & point-of-sale',
			'cv-str2': 'Komposisi WebGL & material sinematik',
			'cv-str3': 'Data bisnis relasional, ternormalisasi ke 3NF',
			'cv-str4': 'UI Tailwind & koreografi gerak dengan GSAP',
			'cv-now': 'Ray marching real-time, audio spasial, dan menjaga scene berat tetap cepat di hardware murah — seni performa yang tak terlihat.',
			'ab-chapter': 'niat', 'ab-kicker': 'Niat',
			'ab-title': 'Cahaya adalah materi. Kode juga. Keduanya kubentuk seperti tanah liat —',
			'ab-copy': 'Semuanya dimulai kecil: sebuah toko, jalur makanan, perkakas terminal. Masing-masing mengajarkan pelajaran yang sama — antarmuka adalah scene, dan scene adalah cerita yang diceritakan lewat gerak. Three.js memberi jiwa pada geometri, GSAP memberi irama pada waktu, dan PHP menjaga semuanya berjalan saat tak ada yang memperhatikan. Hasilnya adalah karya yang terasa hidup: hangat, berbobot, mustahil diabaikan. Pragmatis sejak awal, alergi pada detail yang ceroboh, dan pembelajar mandiri yang cepat — aku menjembatani kebutuhan bisnis nyata menjadi kode yang berfungsi, bukan teori.',
			'stat-shipped': 'sistem dirilis', 'stat-stack': 'stack yang aktif', 'stat-ticks': 'detak jam',
			'wk-chapter': 'karya terpilih', 'wk-kicker': 'Karya terpilih',
			'wk-title': 'Dunia-dunia kecil,<br>masing-masing dengan <span class="f italic">gravitasinya.</span>',
			'inspect': 'Inspeksi 3D', 'case-study': 'Studi Kasus', 'visit-live': 'kunjungi langsung', 'see-repo': 'lihat repository',
			'arazel-d': 'E-commerce lengkap — autentikasi, keranjang, checkout, dan panel admin yang ramping. Tanpa framework berat: inti PHP buatan tangan yang tetap cepat di hardware murah.',
			'foodcraft-d': 'Jalur pemesanan tempat makanan mengalir dari menu ke depan pintu. Template, controller, dan penyimpanan dirangkai menjadi satu router yang bersih.',
			'enumerator-d': 'CLI yang memperluas nomor Indonesia parsial, lalu memeriksa registrasi WhatsApp pada sesi kamu sendiri — dengan resume, rate-limit, dan output CSV.',
			'bookshelf-d': 'Pengelola buku yang responsif — tambah, edit, cari, filter, dan urutkan judul ke rak "belum dibaca" dan "selesai dibaca", semua tersimpan di browser kamu.',
			'csirt-d': 'Situs publik untuk tim Computer Security Incident Response — kesadaran insiden, penilaian ancaman, dan perencanaan mitigasi.',
			'calculator-d': 'Kalkulator Android native untuk ujian UKK 2024 — UI aritmetika yang bersih dengan evaluasi ekspresi, teruji dalam tekanan ujian.',
			'wk-hint': 'gulir — scene mengikuti gerakan',
			'exp-chapter': 'perjalanan', 'exp-kicker': 'Perjalanan',
			'exp-title': 'Tonggak & <span class="f italic">pembangunan sistem.</span>',
			't1-badge': 'Sistem 3D & WebGL', 't1-title': 'Arsitektur Web & Shader Sinematik',
			't1-desc': 'Mengembangkan scene Three.js WebGL kustom, efek post-processing berbasis shader, dan pipeline GSAP ScrollTrigger untuk pengalaman web imersif dengan filosofi tanpa dependensi yang ketat.',
			't1-li1': 'Membangun pencahayaan prosedural real-time & pahatan clay-shading di Three.js murni.',
			't1-li2': 'Merancang sinkronisasi scroll 3D berbasis fisika dengan pose kamera sub-piksel.',
			't2-badge': 'Sistem Fullstack', 't2-title': 'Inti E-Commerce, POS & Routing',
			't2-desc': 'Backend PHP modular buatan tangan — alur e-commerce dan point-of-sale penuh tanpa beban framework. Skema SQL relasional, mesin state keranjang, dan aturan Nginx yang dioptimalkan untuk latensi sangat rendah.',
			't2-li1': 'Mengimplementasikan auth kustom, mesin state keranjang, checkout, dan dashboard admin.',
			't2-li2': 'Merancang data bisnis ternormalisasi (3NF) dan render di bawah 120ms di VPS murah.',
			't3-badge': 'Sistem Lapangan & CLI', 't3-title': 'Operasi Kasir & Otomasi',
			't3-desc': 'Operasional garis depan di Ayam Geprek Mas Boy — alur kasir harian, pelacakan stok antar shift, dan rekap penjualan — dipadukan dengan perkakas CLI Node.js buatanku untuk pekerjaan data berulang.',
			't3-li1': 'Menjalankan operasi point-of-sale dan penghitungan stok serah terima shift.',
			't3-li2': 'Membangun otomasi Node.js — pemrosesan batch, rate-limit, ekspor CSV.',
			't4-badge': 'SMK RPL · IT Pemda', 't4-title': 'Fondasi & IT Pemerintahan',
			't4-desc': 'Rekayasa Perangkat Lunak di SMK Negeri 1 Singkarak, plus waktu di Dinas Kominfo Sumbar — tempat aku belajar bagaimana institusi publik menata software, data, dan dokumentasi.',
			't4-li1': 'Membangun fondasi software — logika, basis data, coding — di SMK RPL.',
			't4-li2': 'Mendukung alur kerja IT pemerintahan nyata di Diskominfo Sumbar.',
			'sk-chapter': 'perangkat', 'sk-kicker': 'Perangkat',
			'sk-title': 'Butir-butir<br>dari <span class="f italic">stack.</span>',
			'filter-all': 'Semua', 'filter-cg': '3D & Frontend', 'filter-be': 'Backend & DB', 'filter-ops': 'DevOps & CLI', 'filter-label': 'saring',
			's1-h': 'Three.js <b>& WebGL</b>',
			's1-d': 'Geometri, material, jalur cahaya, shader prosedural kustom, logika gim 3D (Unity), dan tuning anggaran performa.',
			's2-h': 'GSAP <b>& ScrollTrigger</b>',
			's2-d': 'Scroll, pin, scrub — waktu sebagai alat, keyframe multi-fase, dan interaksi UI magnetik.',
			's3-h': 'PHP <b>(Vanilla MVC)</b>',
			's3-d': 'Inti buatan tangan, mesin router bersih, alur e-commerce & POS, manajemen sesi dan keamanan tanpa dependensi.',
			's4-h': 'MySQL <b>/ Relational SQL</b>',
			's4-d': 'Data bisnis ternormalisasi hingga 3NF, query berindeks, transaksi, dan penyimpanan berperforma.',
			's5-h': 'Node.js <b>& Perkakas</b>',
			's5-d': 'Perkakas CLI, pipeline data, integrasi web socket, dan aliran otomasi headless.',
			's6-h': 'Nginx <b>& Server Ops</b>',
			's6-d': 'Konfigurasi server, reverse proxy, deployment yang tenang, SSL, dan tuning HTTP/2 di lingkungan Linux/Ubuntu.',
			's7-h': 'Tailwind <b>& UI Engineering</b>',
			's7-d': 'Antarmuka responsif dan modular — sistem minimalist-chic dan liquid-glass diterjemahkan menjadi kode frontend yang presisi.',
			's8-h': 'POS <b>& Logika Inventori</b>',
			's8-d': 'Alur point-of-sale, pelacakan stok antar shift, rekap penjualan harian, dan data bisnis ternormalisasi ke 3NF.',
			'ft-chapter': 'berhubungan', 'ft-kicker': 'Berhubungan',
			'ft-title': 'Punya dunia<br>untuk <span class="f italic">ditimbang</span>?',
			'copy-addr': 'Salin Alamat',
			'form-title': 'Kirim catatan singkat',
			'ph-name': 'Nama kamu', 'ph-email': 'Email kamu', 'ph-msg': 'Detail atau ide singkat...',
			'btn-transmit': 'Kirim Catatan',
			'ft-meta': 'est. 2022 — web terbuka',
			'ft-copy': '© <span id="copy-year"></span> argabiyusyrf — semua hak dilindungi',
			'ft-foot': 'dibuat untuk memudar hanya di ujung cahaya.',
			'modal-tag': 'Studi Kasus', 'modal-arch': 'Arsitektur Inti', 'modal-stack': 'Tech Stack & Dependensi',
			'modal-open': 'Buka Sistem / Demo Langsung', 'modal-repo': 'Lihat Repository',
			'help-title': 'Pintasan keyboard',
			'h1': 'Buka palet perintah', 'h2': 'Ganti tema visual', 'h3': 'Aktifkan soundscape', 'h4': 'Salin email',
			'h5': 'Unduh CV', 'h6': 'Fokus artefak 3D', 'h7': 'Ganti bahasa', 'h8': 'Tampilkan pintasan', 'h9': 'Tutup overlay / menu',
			'help-foot': 'Pintasan diabaikan saat kamu mengetik di kolom input.',
			'cmdk-ph': 'Ketik bagian atau perintah (mis. karya, tema, audio, kontak)...',
			'cmdk-nav': 'Navigasi', 'cmdk-cmds': 'Perintah',
			'cmdk-hero': 'Hero / Awal', 'cmdk-identity': 'Bab I: Identitas', 'cmdk-intent': 'Bab II: Niat',
			'cmdk-works': 'Bab III: Karya Terpilih', 'cmdk-journey': 'Bab IV: Perjalanan',
			'cmdk-toolkit': 'Bab V: Perangkat', 'cmdk-contact': 'Bab VI: Kontak',
			'cmdk-theme': 'Ganti Tema Visual', 'cmdk-sound': 'Aktifkan Soundscape', 'cmdk-lang': 'Ganti Bahasa',
			'cmdk-email': 'Salin Email ke Clipboard', 'cmdk-cv': 'Unduh CV', 'cmdk-3d': 'Aktifkan Fokus Artefak 3D',
			'toast-theme': 'Tema diganti ke ', 'toast-sound-on': 'Soundscape aktif', 'toast-sound-off': 'Soundscape dimatikan',
			'toast-lang': 'Bahasa diganti ke ', 'toast-email': 'Email disalin ke clipboard!', 'toast-cv': 'CV terunduh — bisa dibuka di mana saja',
			'toast-3d': 'Mode Fokus 3D aktif — seret untuk memeriksa artefak', 'toast-msg': 'Pesan terkirim! Terima kasih.',
			'err-name-required': 'Tolong isi nama kamu.', 'err-name-min': 'Nama minimal 2 karakter.',
			'err-email-required': 'Email wajib diisi.', 'err-email-invalid': 'Format email sepertinya salah.',
			'err-msg-required': 'Pesan singkat wajib diisi.', 'err-msg-min': 'Pesan minimal 10 karakter.'
		}
	};

	function t(key) {
		var d = I18N[currentLang];
		return d && d[key] != null ? d[key] : (I18N.en[key] || key);
	}

	function refreshSplits() {
		document.querySelectorAll('.hl-word').forEach(function (w) { splitChars(w); });
		if (REDUCED) {
			gsap.set('.hero-title .hl-char', { yPercent: 0 });
		} else {
			gsap.fromTo('.hero-title .hl-char', { yPercent: 120 }, { yPercent: 0, duration: 0.9, stagger: 0.02, ease: 'expo.out' });
		}
		// rebuild word-scrub triggers for translated text
		wordTriggers.forEach(function (tr) { tr.kill(); });
		wordTriggers = [];
		setupWordScrubs();
	}

	function applyLang(lang, skipRefresh) {
		currentLang = lang;
		document.documentElement.setAttribute('lang', lang === 'id' ? 'id' : 'en');
		var dict = I18N[lang];

		document.querySelectorAll('[data-i18n]').forEach(function (el) {
			var key = el.getAttribute('data-i18n');
			if (dict[key] != null) el.textContent = dict[key];
		});
		document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
			var key = el.getAttribute('data-i18n-html');
			if (dict[key] != null) el.innerHTML = dict[key];
		});
		document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
			var key = el.getAttribute('data-i18n-ph');
			if (dict[key] != null) el.setAttribute('placeholder', dict[key]);
		});

		var metaDesc = document.querySelector('meta[name="description"]');
		if (metaDesc) metaDesc.setAttribute('content', dict['meta-desc'] || metaDesc.getAttribute('content'));
		var ogDesc = document.querySelector('meta[property="og:description"]');
		if (ogDesc) ogDesc.setAttribute('content', dict['og-desc'] || ogDesc.getAttribute('content'));
		if (dict.title) document.title = dict.title;

		var langBtn = document.getElementById('lang-btn');
		var langLabel = langBtn ? langBtn.querySelector('.lang-label') : null;
		if (langLabel) langLabel.textContent = lang.toUpperCase();

		var soundLabel = document.querySelector('.sound-label');
		if (soundLabel && soundPlaying) soundLabel.textContent = t('sound-playing');

		if (typeof renderFormErrors === 'function' && formErrors) renderFormErrors();

		if (!skipRefresh) refreshSplits();
	}

	var langBtn = document.getElementById('lang-btn');
	if (langBtn) {
		langBtn.addEventListener('click', function () {
			var next = currentLang === 'en' ? 'id' : 'en';
			applyLang(next);
			try { localStorage.setItem('portfolio-lang', next); } catch (e) {}
			showToast(t('toast-lang') + (next === 'id' ? 'Bahasa Indonesia' : 'English'));
			playClickSound();
		});
	}

	try {
		var savedLang = localStorage.getItem('portfolio-lang');
		if (savedLang === 'id' || savedLang === 'en') currentLang = savedLang;
	} catch (e) {}
	applyLang(currentLang, true);

	/* ---------------- Web Audio API Ambient Soundscape ---------------- */

	var audioCtx = null;
	var masterGain = null;
	var soundPlaying = false;
	var soundBtn = document.getElementById('sound-btn');
	var soundLabel = soundBtn ? soundBtn.querySelector('.sound-label') : null;

	function initAudio() {
		if (audioCtx) return;
		try {
			var AudioContext = window.AudioContext || window.webkitAudioContext;
			audioCtx = new AudioContext();

			masterGain = audioCtx.createGain();
			masterGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
			masterGain.gain.linearRampToValueAtTime(0.045, audioCtx.currentTime + 4);

			var filter = audioCtx.createBiquadFilter();
			filter.type = 'lowpass';
			filter.frequency.setValueAtTime(680, audioCtx.currentTime);
			filter.Q.setValueAtTime(0.4, audioCtx.currentTime);

			// Cool, calm generative pad (A minor: A2 110 · E3 164.81 · A3 220 · C4 261.63)
			// triangle body + sine air, slow breathing LFOs, gentle stereo spread
			var freqs = [110.00, 164.81, 220.00, 261.63];
			freqs.forEach(function (f, idx) {
				var osc = audioCtx.createOscillator();
				osc.type = idx === 3 ? 'sine' : 'triangle';
				osc.frequency.setValueAtTime(f, audioCtx.currentTime);
				osc.detune.setValueAtTime((Math.random() * 6) - 3, audioCtx.currentTime);

				var oscGain = audioCtx.createGain();
				oscGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
				oscGain.gain.linearRampToValueAtTime(0.16, audioCtx.currentTime + 6);

				var lfo = audioCtx.createOscillator();
				lfo.type = 'sine';
				lfo.frequency.setValueAtTime(0.05 + Math.random() * 0.05, audioCtx.currentTime);
				var lfoGain = audioCtx.createGain();
				lfoGain.gain.setValueAtTime(0.04, audioCtx.currentTime);
				lfo.connect(lfoGain);
				lfoGain.connect(oscGain.gain);

				var node = oscGain;
				if (audioCtx.createStereoPanner) {
					var pan = audioCtx.createStereoPanner();
					pan.pan.setValueAtTime(((idx / 3) * 2 - 1) * 0.45, audioCtx.currentTime);
					node.connect(pan);
					node = pan;
				}

				node.connect(filter);
				osc.connect(oscGain);
				osc.start();
				lfo.start();
			});

			filter.connect(masterGain);
			masterGain.connect(audioCtx.destination);
		} catch (e) {
			console.warn('Web Audio API not supported');
		}
	}

	function playClickSound() {
		if (!audioCtx || !soundPlaying) return;
		try {
			var osc = audioCtx.createOscillator();
			var gain = audioCtx.createGain();
			osc.type = 'sine';
			osc.frequency.setValueAtTime(440, audioCtx.currentTime);
			osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08);
			gain.gain.setValueAtTime(0.035, audioCtx.currentTime);
			gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
			osc.connect(gain);
			gain.connect(audioCtx.destination);
			osc.start();
			osc.stop(audioCtx.currentTime + 0.08);
		} catch (e) {}
	}

	if (soundBtn) {
		soundBtn.addEventListener('click', function () {
			if (!audioCtx) initAudio();

			if (audioCtx && audioCtx.state === 'suspended') {
				audioCtx.resume();
			}

			soundPlaying = !soundPlaying;
			if (masterGain) {
				masterGain.gain.setValueAtTime(soundPlaying ? 0.045 : 0, audioCtx ? audioCtx.currentTime : 0);
			}

			soundBtn.classList.toggle('sound-playing', soundPlaying);
			if (soundLabel) soundLabel.textContent = soundPlaying ? t('sound-playing') : t('sound-muted');
			showToast(soundPlaying ? t('toast-sound-on') : t('toast-sound-off'));
		});
	}

	/* ---------------- Theme Switcher Manager ---------------- */

	var themes = ['studio', 'obsidian', 'solaris'];
	var currentThemeIdx = 0;
	var themeBtn = document.getElementById('theme-btn');
	var themeLabel = themeBtn ? themeBtn.querySelector('.theme-label') : null;

	function setTheme(name) {
		document.documentElement.setAttribute('data-theme', name);
		if (window.SCENE && window.SCENE.setTheme) {
			window.SCENE.setTheme(name);
		}
		var nameCap = name.charAt(0).toUpperCase() + name.slice(1);
		if (themeLabel) themeLabel.textContent = nameCap;

		document.querySelectorAll('.theme-opt').forEach(function (opt) {
			opt.classList.toggle('active', opt.getAttribute('data-set-theme') === name);
		});

		showToast(t('toast-theme') + nameCap);
	}

	if (themeBtn) {
		themeBtn.addEventListener('click', function () {
			currentThemeIdx = (currentThemeIdx + 1) % themes.length;
			setTheme(themes[currentThemeIdx]);
			playClickSound();
		});
	}

	document.querySelectorAll('[data-set-theme]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var tName = btn.getAttribute('data-set-theme');
			setTheme(tName);
			playClickSound();
		});
	});

	/* ---------------- Live Jakarta Time Counter ---------------- */

	var timeEl = document.getElementById('jakarta-time');
	function updateTime() {
		if (!timeEl) return;
		var options = { timeZone: 'Asia/Jakarta', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
		var formatter = new Intl.DateTimeFormat([], options);
		timeEl.textContent = formatter.format(new Date()) + ' WIB';
	}
	setInterval(updateTime, 1000);
	updateTime();

	/* ---------------- Meta Counters (lat / lng / engine) ---------------- */

	var metaEls = document.querySelectorAll('[data-meta]');
	var metaVals = ['-0.7667', '100.6583', '+390 m', 'light'];
	function tickMeta() {
		metaEls.forEach(function (el, i) {
			if (i === 2 || i === 3) { el.textContent = metaVals[i]; return; }
			var tween = { v: 0 };
			gsap.to(tween, {
				v: parseFloat(metaVals[i]),
				duration: 2.4,
				ease: 'power2.out',
				onUpdate: function () {
					el.textContent = tween.v.toFixed(4);
				}
			});
		});
	}
	gsap.delayedCall(2.6, tickMeta);

	/* ---------------- Footer copy year ---------------- */

	var copyYear = document.getElementById('copy-year');
	if (copyYear) copyYear.textContent = new Date().getFullYear();

	/* ---------------- Command Palette (Cmd+K) ---------------- */

	var cmdkModal = document.getElementById('cmdk-modal');
	var cmdkBtn = document.getElementById('cmdk-btn');
	var cmdkInput = document.getElementById('cmdk-input');
	var cmdkResults = document.getElementById('cmdk-results');

	function toggleCmdk(open) {
		if (!cmdkModal) return;
		var isOpen = typeof open === 'boolean' ? open : !cmdkModal.classList.contains('active');
		cmdkModal.classList.toggle('active', isOpen);
		cmdkModal.setAttribute('aria-hidden', !isOpen);
		if (isOpen) {
			setTimeout(function () { if (cmdkInput) cmdkInput.focus(); }, 100);
		} else if (cmdkInput) {
			cmdkInput.value = '';
			filterCmdk('');
		}
	}

	function filterCmdk(query) {
		if (!cmdkResults) return;
		var q = query.toLowerCase().trim();
		var items = cmdkResults.querySelectorAll('.cmdk-item');
		items.forEach(function (item) {
			var txt = item.textContent.toLowerCase();
			if (!q || txt.indexOf(q) !== -1) {
				item.style.display = 'flex';
			} else {
				item.style.display = 'none';
			}
		});
	}

	if (cmdkBtn) {
		cmdkBtn.addEventListener('click', function () { toggleCmdk(); });
	}

	if (cmdkInput) {
		cmdkInput.addEventListener('input', function (e) { filterCmdk(e.target.value); });
	}

	function isTypingEl() {
		var el = document.activeElement;
		if (!el) return false;
		var tag = el.tagName;
		return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
	}

	function runCmdItem(item) {
		if (!item) return;
		var action = item.getAttribute('data-action');
		var target = item.getAttribute('data-target');
		var cmd = item.getAttribute('data-cmd');

		toggleCmdk(false);

		if (action === 'nav' && target) {
			var targetEl = document.querySelector(target);
			if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
		} else if (action === 'cmd') {
			if (cmd === 'theme') { if (themeBtn) themeBtn.click(); }
			else if (cmd === 'sound') { if (soundBtn) soundBtn.click(); }
			else if (cmd === 'lang') { if (langBtn) langBtn.click(); }
			else if (cmd === 'copy-email') copyEmail();
			else if (cmd === 'download-cv') { var b = document.getElementById('download-cv'); if (b) b.click(); }
			else if (cmd === 'inspect-3d') trigger3DInspect();
		}
	}

	function cmdkSelectNext(dir) {
		if (!cmdkResults) return;
		var items = Array.prototype.filter.call(
			cmdkResults.querySelectorAll('.cmdk-item'),
			function (el) { return el.style.display !== 'none'; }
		);
		if (!items.length) return;
		var idx = items.findIndex(function (el) { return el.classList.contains('selected'); });
		var next = idx + dir;
		if (idx === -1) next = dir > 0 ? 0 : items.length - 1;
		if (next < 0) next = items.length - 1;
		if (next >= items.length) next = 0;
		items.forEach(function (el, i) { el.classList.toggle('selected', i === next); });
		items[next].scrollIntoView({ block: 'nearest' });
	}

	if (cmdkModal) {
		cmdkModal.addEventListener('click', function (e) {
			if (e.target === cmdkModal) toggleCmdk(false);
		});

		cmdkResults.querySelectorAll('.cmdk-item').forEach(function (item) {
			item.addEventListener('click', function () { runCmdItem(item); });
		});

		if (cmdkInput) {
			cmdkInput.addEventListener('keydown', function (e) {
				if (e.key === 'ArrowDown') { e.preventDefault(); cmdkSelectNext(1); }
				else if (e.key === 'ArrowUp') { e.preventDefault(); cmdkSelectNext(-1); }
				else if (e.key === 'Enter') {
					e.preventDefault();
					var sel = cmdkResults.querySelector('.cmdk-item.selected');
					if (!sel) cmdkSelectNext(1);
					sel = cmdkResults.querySelector('.cmdk-item.selected');
					if (sel) runCmdItem(sel);
				}
			});
		}
	}

	function toggleShortcutHelp(open) {
		var help = document.getElementById('help-modal');
		if (!help) return;
		var isOpen = typeof open === 'boolean' ? open : !help.classList.contains('active');
		help.classList.toggle('active', isOpen);
		help.setAttribute('aria-hidden', !isOpen);
	}

	window.addEventListener('keydown', function (e) {
		var mod = e.metaKey || e.ctrlKey;

		if (mod && (e.key === 'k' || e.key === 'K')) {
			e.preventDefault();
			toggleCmdk();
			return;
		}

		if (e.key === 'Escape') {
			toggleCmdk(false);
			closeProjectModal();
			toggleShortcutHelp(false);
			document.body.classList.remove('menu-open');
			return;
		}

		if (isTypingEl() || mod || e.altKey) return;

		switch (e.key) {
			case '/': e.preventDefault(); toggleCmdk(true); break;
			case 't': case 'T': if (themeBtn) themeBtn.click(); break;
			case 'm': case 'M': if (soundBtn) soundBtn.click(); break;
			case 'c': case 'C': copyEmail(); break;
			case 'v': case 'V': { var cvb = document.getElementById('download-cv'); if (cvb) cvb.click(); } break;
			case 'i': case 'I': trigger3DInspect(); break;
			case 'l': case 'L': if (langBtn) langBtn.click(); break;
			case 'h': case 'H': toggleShortcutHelp(); break;
		}
	});

	document.querySelectorAll('[data-close-help]').forEach(function (btn) {
		btn.addEventListener('click', function () { toggleShortcutHelp(false); });
	});
	var helpModal = document.getElementById('help-modal');
	if (helpModal) {
		helpModal.addEventListener('click', function (e) {
			if (e.target === helpModal) toggleShortcutHelp(false);
		});
	}

	/* ---------------- 3D Artifact Inspection Trigger ---------------- */

	function trigger3DInspect() {
		if (window.SCENE && window.SCENE.toggleArtifactFocus) {
			window.SCENE.toggleArtifactFocus();
			showToast(t('toast-3d'));
		}
	}
	document.querySelectorAll('.work-inspect-btn, #hero-inspect-btn').forEach(function (btn) {
		btn.addEventListener('click', function (e) {
			e.preventDefault();
			e.stopPropagation();
			trigger3DInspect();
			playClickSound();
		});
	});

	/* ---------------- Project Case Study Modal Data ---------------- */

	var CASE_STUDIES = {
		arazel: {
			title: 'Arazel Store',
			summary: 'A full-featured e-commerce platform designed from first principles using pure PHP without heavy framework dependencies. Built for maximum execution speed, zero cold starts, and minimal server resource consumption on low-cost infrastructure.',
			arch: [
				'Hand-rolled lightweight MVC architecture pattern.',
				'PDO-based MySQL database layer with parameterized queries.',
				'Custom session storage and auth state verification.',
				'Nginx server block configuration for fast static asset serving.'
			],
			tags: ['PHP 8.2', 'MySQL', 'Vanilla JS', 'Nginx', 'MVC Architecture'],
			link: 'https://arazelstore.site.je',
			repo: null
		},
		foodcraft: {
			title: 'Foodcraft Ordering Pipeline',
			summary: 'A streamlined food ordering and delivery pipeline. Features custom routing controllers, template rendering engines, and real-time order state updates from kitchen menu to doorstep delivery.',
			arch: [
				'Custom regex-based HTTP request router.',
				'Modular controller and template view separation.',
				'Relational schema design for dynamic menu options and carts.',
				'Optimized client-side DOM updates with zero heavy libraries.'
			],
			tags: ['PHP', 'Relational SQL', 'HTTP Router', 'CSS Grid', 'RESTful Endpoints'],
			link: 'https://foodycraft.site.je',
			repo: null
		},
		enumerator: {
			title: 'No. Enumerator CLI',
			summary: 'A high-throughput command line tool written in Node.js for partial phone number expansion and automated WhatsApp account registration checking with custom rate-limiting and session recovery.',
			arch: [
				'Headless WhatsApp Web session management via whatsapp-web.js.',
				'Asynchronous queue runner with configurable batch delay.',
				'Automatic state persistence and resume checkpointing.',
				'Clean terminal output formatting and automated CSV export.'
			],
			tags: ['Node.js', 'whatsapp-web.js', 'CLI Engine', 'Async Queue', 'CSV Exporter'],
			link: null,
			repo: 'https://github.com/argabiyusyrf/whatsapp-enumerator'
		},
		bookshelf: {
			title: 'Bookshelf App',
			summary: 'A responsive book collection manager that lets you add, view, edit, search, filter, and sort books, split into "To Read" and "Finished" shelves. All data persists in the browser via the Web Storage API.',
			arch: [
				'Dual-shelf state management for "To Read" and "Finished" books.',
				'Dynamic render pipeline for add, edit, and delete with confirmation.',
				'Live search, filter, and sort across title, author, and year.',
				'Web Storage persistence with dark/light theme support.'
			],
			tags: ['JavaScript', 'Web Storage API', 'Bootstrap', 'Responsive UI'],
			link: 'https://24781065-argaabiyyu-bookshelfapp.netlify.app/',
			repo: 'https://github.com/argabiyusyrf/Bookshelf-APP'
		},
		csirt: {
			title: 'CSIRT Kominfo',
			summary: 'A public-facing website for a Computer Security Incident Response Team — an organization that receives, reviews, and responds to cyber security incident reports, and drives threat assessment, detection, and mitigation planning.',
			arch: [
				'Institutional information architecture for incident response.',
				'Threat assessment and detection awareness sections.',
				'Mitigation planning and security architecture review layout.',
				'Clean, government-aligned visual identity and responsive structure.'
			],
			tags: ['HTML', 'CSS', 'Cyber Security', 'Web', 'Static Site'],
			link: null,
			repo: 'https://github.com/argabiyusyrf/Csirt-Kominfo'
		},
		calculator: {
			title: 'Calculator App',
			summary: 'A native Android calculator built for the 2024 UKK exam. A clean arithmetic interface with expression evaluation, designed to be fast and reliable under exam pressure.',
			arch: [
				'Native Android activity and layout structure.',
				'Expression evaluation and arithmetic display logic.',
				'Minimal, distraction-free UI tuned for exam conditions.',
				'Lightweight Java implementation with zero external runtime dependencies.'
			],
			tags: ['Java', 'Android', 'Native UI', 'Calculator'],
			link: null,
			repo: 'https://github.com/argabiyusyrf/Calculator-App/'
		}
	};

	var projectModal = document.getElementById('project-modal');
	var modalTitle = document.getElementById('modal-project-title');
	var modalSummary = document.getElementById('modal-project-summary');
	var modalArch = document.getElementById('modal-project-arch');
	var modalTags = document.getElementById('modal-project-tags');
	var modalRepoLink = document.getElementById('modal-repo-link');
	var modalLiveLink = document.getElementById('modal-live-link');

	function openProjectModal(pKey) {
		var data = CASE_STUDIES[pKey];
		if (!data || !projectModal) return;

		modalTitle.textContent = data.title;
		modalSummary.textContent = data.summary;

		modalArch.innerHTML = '';
		data.arch.forEach(function (item) {
			var li = document.createElement('li');
			li.textContent = item;
			modalArch.appendChild(li);
		});

		modalTags.innerHTML = '';
		data.tags.forEach(function (tag) {
			var sp = document.createElement('span');
			sp.textContent = tag;
			modalTags.appendChild(sp);
		});

		if (modalRepoLink) {
			modalRepoLink.style.display = data.repo ? '' : 'none';
			modalRepoLink.href = data.repo || '#';
		}
		if (modalLiveLink) {
			modalLiveLink.style.display = data.link ? '' : 'none';
			modalLiveLink.href = data.link || '#';
		}

		projectModal.classList.add('active');
		projectModal.setAttribute('aria-hidden', 'false');
		playClickSound();
	}

	function closeProjectModal() {
		if (!projectModal) return;
		projectModal.classList.remove('active');
		projectModal.setAttribute('aria-hidden', 'true');
	}

	document.querySelectorAll('[data-open-project]').forEach(function (btn) {
		btn.addEventListener('click', function (e) {
			e.preventDefault();
			var pKey = btn.getAttribute('data-open-project');
			openProjectModal(pKey);
		});
	});

	if (projectModal) {
		projectModal.querySelector('.modal-close').addEventListener('click', closeProjectModal);
		projectModal.addEventListener('click', function (e) {
			if (e.target === projectModal) closeProjectModal();
		});
	}

	/* ---------------- Skill Category Filter System ---------------- */

	document.querySelectorAll('.filter-btn').forEach(function (btn) {
		btn.addEventListener('click', function () {
			document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
			btn.classList.add('active');

			var cat = btn.getAttribute('data-filter');
			document.querySelectorAll('.skill').forEach(function (card) {
				var cardCat = card.getAttribute('data-category');
				if (cat === 'all' || cardCat === cat) {
					card.classList.remove('hidden');
				} else {
					card.classList.add('hidden');
				}
			});
			playClickSound();
		});
	});

	/* ---------------- Contact Form & Copy Email ---------------- */

	function copyEmail() {
		var email = 'argaabiyyu4@gmail.com';
		if (navigator.clipboard) {
			navigator.clipboard.writeText(email).then(function () {
				showToast(t('toast-email'));
			});
		} else {
			showToast('Contact: ' + email);
		}
		playClickSound();
	}

	var copyBtn = document.getElementById('copy-email-btn');
	if (copyBtn) copyBtn.addEventListener('click', copyEmail);

	var contactForm = document.getElementById('contact-form');
	var formName = document.getElementById('form-name');
	var formEmail = document.getElementById('form-email');
	var formMsg = document.getElementById('form-msg');
	var formErrors = { name: '', email: '', msg: '' };

	function setFieldError(field, err) {
		formErrors[field] = err || '';
		renderFormErrors();
	}

	function renderFormErrors() {
		var map = { name: formName, email: formEmail, msg: formMsg };
		Object.keys(formErrors).forEach(function (field) {
			var input = map[field];
			var errEl = document.getElementById('err-form-' + field);
			if (!input) return;
			var hasErr = !!formErrors[field];
			input.closest('.form-group').classList.toggle('has-error', hasErr);
			input.setAttribute('aria-invalid', hasErr ? 'true' : 'false');
			if (errEl) {
				errEl.textContent = hasErr ? t(formErrors[field]) : '';
				errEl.classList.toggle('visible', hasErr);
			}
		});
	}

	function validateField(field) {
		if (!formName || !formEmail || !formMsg) return true;
		var v, err = '';
		if (field === 'name' || !field) {
			v = formName.value.trim();
			if (!v) err = 'err-name-required';
			else if (v.length < 2) err = 'err-name-min';
			if (err !== formErrors.name) setFieldError('name', err);
		}
		if (field === 'email' || !field) {
			v = formEmail.value.trim();
			if (!v) err = 'err-email-required';
			else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) err = 'err-email-invalid';
			if (err !== formErrors.email) setFieldError('email', err);
		}
		if (field === 'msg' || !field) {
			v = formMsg.value.trim();
			if (!v) err = 'err-msg-required';
			else if (v.length < 10) err = 'err-msg-min';
			if (err !== formErrors.msg) setFieldError('msg', err);
		}
	}

	if (formName) formName.addEventListener('input', function () { validateField('name'); });
	if (formEmail) formEmail.addEventListener('input', function () { validateField('email'); });
	if (formMsg) formMsg.addEventListener('input', function () { validateField('msg'); });

	function validateAll() {
		validateField('name');
		validateField('email');
		validateField('msg');
		return !formErrors.name && !formErrors.email && !formErrors.msg;
	}

	if (contactForm) {
		contactForm.addEventListener('submit', function (e) {
			e.preventDefault();
			if (!validateAll()) {
				var firstInvalid = contactForm.querySelector('.form-group.has-error input, .form-group.has-error textarea');
				if (firstInvalid) firstInvalid.focus();
				contactForm.classList.remove('form-success');
				return;
			}
			var endpoint = contactForm.getAttribute('action');
			if (!endpoint || endpoint.indexOf('REPLACE_WITH_YOUR_ID') !== -1) {
				showToast('Set the Formspree endpoint in the form action first.');
				return;
			}
			var submitBtn = document.getElementById('form-submit');
			if (submitBtn) submitBtn.disabled = true;
			fetch(endpoint, {
				method: 'POST',
				body: new FormData(contactForm),
				headers: { 'Accept': 'application/json' }
			}).then(function (res) {
				if (res.ok) {
					contactForm.classList.add('form-success');
					showToast(t('toast-msg'));
					contactForm.reset();
					['name', 'email', 'msg'].forEach(function (f) { setFieldError(f, ''); });
					playClickSound();
					setTimeout(function () { contactForm.classList.remove('form-success'); }, 2200);
				} else {
					return res.json().then(function (data) {
						throw new Error((data && data.errors && data.errors[0] && data.errors[0].message) || 'Send failed');
					});
				}
			}).catch(function (err) {
				showToast((err && err.message) ? err.message : 'Could not send — try email instead.');
			}).then(function () {
				if (submitBtn) submitBtn.disabled = false;
			});
		});
	}

	/* ---------------- Download CV (generated on the fly) ---------------- */

	function cvText() {
		var en = [
			'ARGA ABIYYU SYARIF',
			'Full-Stack Web Developer · 3D Creative & Point-of-Sale Systems',
			'Sumatera Barat, Indonesia · UTC+7',
			'argaabiyyu4@gmail.com',
			'',
			'──────────────────────────────',
			'PROFILE',
			'E-commerce, point-of-sale, and quiet tooling — bridging the render farm and the cash register. SMK RPL gave me the foundation; a busy kitchen gave me the instinct. Systems that are simple, fast, and quietly heavy.',
			'',
			'──────────────────────────────',
			'CORE STRENGTHS',
			'· E-commerce & point-of-sale system design',
			'· Cinematic WebGL & material composition',
			'· Relational business data, normalized to 3NF',
			'· Tailwind UI & motion choreography with GSAP',
			'· Node.js CLI tools & data pipelines',
			'· Quiet, dependable Linux / Nginx deployments',
			'',
			'──────────────────────────────',
			'SELECTED WORKS',
			'· Arazel Store — full e-commerce (PHP, MySQL, MVC, Nginx)',
			'· Foodcraft — ordering pipeline (PHP, SQL, custom router)',
			'· No. Enumerator — Node.js CLI (whatsapp-web, rate-limit, CSV)',
			'',
			'──────────────────────────────',
			'EDUCATION & LEARNING',
			'· 2021 — 2024: SMK Negeri 1 Singkarak — Rekayasa Perangkat Lunak',
			'· Self-taught engineering path (WebGL, CG, system architecture)',
			'· 2023: field systems & operations — cashier flows, shift stock, sales recaps',
			'',
			'──────────────────────────────',
			'EXPERIENCE',
			'· Dinas Kominfo Sumbar — government IT workflows and documentation',
			'· Ayam Geprek Mas Boy — point-of-sale operations and inventory',
			'',
			'──────────────────────────────',
			'LANGUAGES',
			'· Indonesian — native',
			'· English — working proficiency',
			'',
			'──────────────────────────────',
			'Status: open to select projects'
		].join('\n');

		var id = [
			'ARGA ABIYYU SYARIF',
			'Web Developer Full-Stack · Sistem Kreatif 3D & Point-of-Sale',
			'Sumatera Barat, Indonesia · UTC+7',
			'argaabiyyu4@gmail.com',
			'',
			'──────────────────────────────',
			'PROFIL',
			'E-commerce, point-of-sale, dan perkakas yang tenang — menjembatani render farm dan mesin kasir. SMK RPL memberiku fondasi; dapur yang sibuk memberiku naluri. Sistem yang sederhana, cepat, dan tenang.',
			'',
			'──────────────────────────────',
			'KEAHLIAN UTAMA',
			'· Desain sistem e-commerce & point-of-sale',
			'· Komposisi WebGL & material sinematik',
			'· Data bisnis relasional, ternormalisasi ke 3NF',
			'· UI Tailwind & koreografi gerak dengan GSAP',
			'· Perkakas CLI Node.js & pipeline data',
			'· Deployment Linux / Nginx yang tenang dan andal',
			'',
			'──────────────────────────────',
			'KARYA TERPILIH',
			'· Arazel Store — e-commerce lengkap (PHP, MySQL, MVC, Nginx)',
			'· Foodcraft — jalur pemesanan (PHP, SQL, router kustom)',
			'· No. Enumerator — CLI Node.js (whatsapp-web, rate-limit, CSV)',
			'',
			'──────────────────────────────',
			'PENDIDIKAN & PEMBELAJARAN',
			'· 2021 — 2024: SMK Negeri 1 Singkarak — Rekayasa Perangkat Lunak',
			'· Jalur rekayasa otodidak (WebGL, CG, arsitektur sistem)',
			'· 2023: sistem & operasional lapangan — alur kasir, stok shift, rekap penjualan',
			'',
			'──────────────────────────────',
			'PENGALAMAN',
			'· Dinas Kominfo Sumbar — alur kerja dan dokumentasi IT pemerintahan',
			'· Ayam Geprek Mas Boy — operasi point-of-sale dan inventori',
			'',
			'──────────────────────────────',
			'BAHASA',
			'· Indonesia — asli',
			'· Inggris — aktif',
			'',
			'──────────────────────────────',
			'Status: terbuka untuk proyek pilihan'
		].join('\n');

		return currentLang === 'id' ? id : en;
	}

	var cvBtn = document.getElementById('download-cv');
	if (cvBtn) {
		cvBtn.addEventListener('click', function () {
			var blob = new Blob([cvText()], { type: 'text/plain;charset=utf-8' });
			var url = URL.createObjectURL(blob);
			var a = document.createElement('a');
			a.href = url;
			a.download = 'argabiyusyrf-cv.txt';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			showToast(t('toast-cv'));
			playClickSound();
		});
	}

	/* ---------------- Helper Splitters for GSAP ---------------- */

	function splitChars(el) {
		var text = el.textContent;
		el.textContent = '';
		var frag = document.createDocumentFragment();
		for (var i = 0; i < text.length; i++) {
			var ch = text[i];
			var sp = document.createElement('span');
			sp.className = 'hl-char';
			sp.innerHTML = '&nbsp;';
			if (ch !== ' ') sp.textContent = ch;
			sp.style.setProperty('--c', i);
			if (ch !== ' ') frag.appendChild(sp);
			else el.appendChild(frag), el.appendChild(document.createTextNode(' ')), frag = document.createDocumentFragment();
		}
		if (frag.childNodes.length) el.appendChild(frag);
		return el;
	}

	function splitWords(el) {
		var words = el.textContent.trim().split(/\s+/);
		el.textContent = '';
		var frag = document.createDocumentFragment();
		words.forEach(function (w, i) {
			var sp = document.createElement('span');
			sp.className = 'word';
			sp.textContent = w;
			sp.style.setProperty('--i', i);
			frag.appendChild(sp);
			if (i < words.length - 1) {
				frag.appendChild(document.createTextNode(' '));
			}
		});
		el.appendChild(frag);
		return el;
	}

	/* ---------------- Preloader ---------------- */

	var preloader = document.getElementById('preloader');
	var introDone = false;
	gsap.timeline()
		.to('.preloader-txt', { opacity: 0.25, duration: 0.6, ease: 'none' }, 0.35)
		.add(function () { if (preloader) preloader.classList.add('done'); }, 1.5)
		.set(preloader, { display: 'none' }, 2.6)
		.add(function () { introDone = true; });

	setTimeout(function () { if (preloader) preloader.classList.add('done'); }, 1800);
	setTimeout(function () {
		if (preloader) preloader.style.display = 'none';
		introDone = true;
	}, 3000);

	/* ---------------- Scene Initialization Hook ---------------- */

	if (window.SCENE) {
		window.addEventListener('load', function () {
			gsap.delayedCall(0.15, function () {
				window.SCENE.init();

				ScrollTrigger.create({
					start: 0,
					end: 'max',
					scrub: true,
					onUpdate: function (self) {
						window.SCENE.state.scroll = self.progress;
					}
				});
			});
		});
	}

	/* ---------------- Hero Chars & Reveals ---------------- */

	document.querySelectorAll('.hl-word').forEach(function (w) { splitChars(w); });
	if (!REDUCED) {
		gsap.fromTo('.hl-char',
			{ yPercent: 120 },
			{ yPercent: 0, duration: 1.1, stagger: 0.024, ease: 'expo.out', delay: 0.85 }
		);
	} else {
		gsap.set('.hl-char', { yPercent: 0 });
	}

	/* ---------------- Hero Exit (scene pulls away) ---------------- */

	if (!REDUCED) {
		gsap.to('.hero-title', {
			yPercent: -22,
			opacity: 0.35,
			filter: 'blur(4px)',
			ease: 'none',
			scrollTrigger: {
				trigger: '.hero',
				start: 'top top',
				end: 'bottom top',
				scrub: true
			}
		});
		gsap.to('.hero-sub, .hero-actions', {
			yPercent: -60,
			opacity: 0,
			ease: 'none',
			scrollTrigger: {
				trigger: '.hero',
				start: 'center center',
				end: 'bottom top',
				scrub: true
			}
		});
		gsap.to('.hero-meta', {
			opacity: 0, ease: 'none',
			scrollTrigger: { trigger: '.hero', start: 'top top', end: '23% top', scrub: true }
		});
	}

	/* ---------------- Marquee Parallax Lock ---------------- */

	if (!REDUCED) {
		gsap.to('.marquee-track', {
			xPercent: -50,
			ease: 'none',
			scrollTrigger: {
				trigger: '.marquee',
				start: 'top bottom',
				end: 'bottom top',
				scrub: 0.6
			}
		});
	}

	/* ---------------- Identity Section Cinematics ---------------- */

	document.querySelectorAll('.identity-title .i-word').forEach(function (w) { splitChars(w); });

	if (!REDUCED) {
		gsap.fromTo('.identity-title .hl-char',
			{ yPercent: 120, rotateX: -45 },
			{
				yPercent: 0, rotateX: 0,
				duration: 1.2,
				stagger: 0.028,
				ease: 'expo.out',
				scrollTrigger: { trigger: '.identity-title', start: 'top 78%', once: true }
			}
		);

		// monogram 3D cinematic intro
		gsap.fromTo('.mono-stage', {
			rotateY: -40, rotateX: 15, scale: 0.6, opacity: 0
		}, {
			rotateY: 0, rotateX: 0, scale: 1, opacity: 1,
			duration: 1.6,
			ease: 'power3.out',
			scrollTrigger: { trigger: '.identity-right', start: 'top 80%', once: true }
		});

		// scroll-driven 3D tilt of the monogram
		gsap.to('.mono-parallax', {
			rotationX: 14,
			rotationY: 18,
			ease: 'none',
			scrollTrigger: {
				trigger: '#identity',
				start: 'top bottom',
				end: 'center center',
				scrub: 1.2
			}
		});

		// facts strip stagger
		gsap.fromTo('.fact', { y: 46, opacity: 0 }, {
			y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: 'power3.out',
			scrollTrigger: { trigger: '.identity-facts', start: 'top 88%', once: true }
		});
	}

	/* ---------------- Chapter & Generic Reveals ---------------- */

	document.querySelectorAll('.chapter').forEach(function (ch) {
		if (REDUCED) { gsap.set(ch, { opacity: 1 }); return; }
		var line = ch.querySelector('.chapter-line');
		var spans = ch.querySelectorAll('span, b');
		gsap.fromTo(ch, { opacity: 0, y: 18 }, {
			opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
			scrollTrigger: { trigger: ch, start: 'top 82%', once: true }
		});
		if (line) {
			gsap.fromTo(line, { scaleX: 0 }, {
				scaleX: 1, duration: 1.4, ease: 'expo.out',
				scrollTrigger: { trigger: ch, start: 'top 80%', toggleActions: 'play none none none' }
			});
		}
		gsap.fromTo(spans, { yPercent: 120 }, {
			yPercent: 0, duration: 0.8, stagger: 0.08, ease: 'expo.out',
			scrollTrigger: { trigger: ch, start: 'top 82%', toggleActions: 'play none none none' }
		});
	});

	document.querySelectorAll('[data-reveal]').forEach(function (el) {
		if (REDUCED) { el.style.opacity = 1; el.style.transform = 'none'; return; }
		gsap.fromTo(el,
			{ y: 40, opacity: 0 },
			{
				y: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
				scrollTrigger: { trigger: el, start: 'top 88%', once: true }
			}
		);
	});

	/* ---------------- Timeline line scrub ---------------- */

	var tlFill = document.querySelector('.timeline-line i');
	if (tlFill) {
		if (REDUCED) {
			gsap.set(tlFill, { scaleY: 1 });
		} else {
			gsap.fromTo(tlFill, { scaleY: 0 }, {
				scaleY: 1, ease: 'none',
				scrollTrigger: { trigger: '.timeline', start: 'top 75%', end: 'bottom 60%', scrub: 0.6 }
			});
		}
	}

	/* ---------------- Scrub Title & Paragraph Words ---------------- */

	var wordTriggers = [];

	function setupWordScrubs() {
		var scrub = document.querySelector('[data-scrub]');
		if (scrub) {
			splitWords(scrub);
			if (REDUCED) {
				gsap.set(scrub.querySelectorAll('.word'), { opacity: 1, color: 'var(--ink)' });
			} else {
				wordTriggers.push(
					gsap.fromTo(scrub.querySelectorAll('.word'), { opacity: 0.1, color: 'var(--muted)' }, {
						opacity: 1, color: 'var(--ink)', stagger: 0.06, ease: 'none',
						scrollTrigger: { trigger: scrub, start: 'top 70%', end: 'bottom 45%', scrub: true }
					}).scrollTrigger
				);
			}
		}

		var warm = document.getElementById('about-copy');
		if (warm) {
			splitWords(warm);
			var words = warm.querySelectorAll('.word');
			if (REDUCED) {
				gsap.set(words, { opacity: 1, color: 'var(--ink-soft)' });
			} else {
				wordTriggers.push(
					gsap.fromTo(words, { opacity: 0.1 }, {
						opacity: 1, stagger: { each: 0.09, from: 'start' }, ease: 'none',
						scrollTrigger: { trigger: warm, start: 'top 75%', end: 'bottom 40%', scrub: true }
					}).scrollTrigger
				);
				var accents = currentLang === 'id'
					? ['hangat', 'berbobot', 'mustahil', 'jiwa', 'irama', 'tanah']
					: ['weighty', 'soul', 'rhythm', 'impossible', 'warm', 'clay'];
				accents.forEach(function (k) {
					words.forEach(function (w) {
						if (w.textContent.toLowerCase() === k) {
							wordTriggers.push(
								gsap.to(w, { color: 'var(--accent)', scrollTrigger: { trigger: w, start: 'top 75%', end: 'bottom 30%', scrub: true } }).scrollTrigger
							);
						}
					});
				});
			}
		}
	}

	setupWordScrubs();

	/* ---------------- Works Horizontal Pinning ---------------- */

	var track = document.querySelector('.works-track');
	var wrap = document.querySelector('.works-scroll');

	var worksKill = null;

	function buildWorks() {
		var media = wrap ? wrap.querySelectorAll('.work-media') : [];
		if (!track || !wrap) return;

		if (worksKill) { worksKill(); worksKill = null; }

		var isStacked = window.innerWidth < 901;
		var dist = function () {
			if (isStacked) return 0;
			return Math.max(0, wrap.scrollWidth - window.innerWidth + (window.innerWidth * 0.12));
		};

		if (!isStacked) {
			var tween = gsap.to(track, {
				x: function () { return -dist(); },
				ease: 'none',
				scrollTrigger: {
					trigger: wrap,
					start: 'top top',
					end: function () { return '+=' + dist(); },
					pin: true,
					scrub: 1,
					invalidateOnRefresh: true,
					anticipatePin: 1
				}
			});

			media.forEach(function (m) {
				gsap.fromTo(m, { scale: 0.88, opacity: 0.25, x: 90 }, {
					scale: 1, opacity: 1, x: 0, ease: 'power2.out', duration: 1.4,
					scrollTrigger: { trigger: m, containerAnimation: tween, start: 'left 92%', end: 'left 58%', scrub: true }
				});
			});
		} else {
			gsap.fromTo(media, { y: 60, scale: 0.92, opacity: 0 }, {
				y: 0, scale: 1, opacity: 1, stagger: 0.12, ease: 'power2.out',
				scrollTrigger: { trigger: track, start: 'top 78%', end: 'bottom 40%', scrub: true }
			});
		}

		worksKill = function () {
			ScrollTrigger.getAll().forEach(function (st) {
				if (st.trigger && st.trigger.closest && st.trigger.closest('.works-scroll')) st.kill();
			});
		};
	}

	if (!REDUCED) {
		buildWorks();

		var worksMQ = window.matchMedia('(max-width: 900px)');
		var worksBreak = function () {
			if (worksKill) { worksKill(); worksKill = null; }
			buildWorks();
			ScrollTrigger.refresh();
		};
		if (worksMQ.addEventListener) worksMQ.addEventListener('change', worksBreak);
		else if (worksMQ.addListener) worksMQ.addListener(worksBreak);
	} else {
		gsap.set('.work-media', { opacity: 1, scale: 1 });
		ScrollTrigger.refresh();
	}

	/* ---------------- Magnetic Buttons & Custom Cursor ---------------- */

	if (!(window.matchMedia('(hover: none)').matches)) {
		document.querySelectorAll('.magnetic').forEach(function (el) {
			var strength = el.classList.contains('btn') ? 0.28 : 0.18;
			el.addEventListener('pointermove', function (e) {
				var r = el.getBoundingClientRect();
				var x = (e.clientX - r.left) / r.width;
				var y = (e.clientY - r.top) / r.height;
				gsap.to(el, {
					x: (x - 0.5) * 34 * strength * 2,
					y: (y - 0.5) * 34 * strength * 2,
					duration: 0.6, ease: 'power3.out'
				});
			});
			el.addEventListener('pointerleave', function () {
				gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1,0.45)' });
			});
		});
	}

	var dot = document.querySelector('.cursor-dot');
	var ring = document.querySelector('.cursor-ring');
	var ringLbl = ring ? ring.querySelector('span') : null;
	var mouseX = innerWidth / 2, mouseY = innerHeight / 2;
	var dotX = mouseX, dotY = mouseY, ringX = mouseX, ringY = mouseY;

	function cursorLoop() {
		dotX += (mouseX - dotX) * 0.28;
		dotY += (mouseY - dotY) * 0.28;
		ringX += (mouseX - ringX) * 0.12;
		ringY += (mouseY - ringY) * 0.12;
		if (dot) gsap.set(dot, { x: dotX, y: dotY });
		if (ring) gsap.set(ring, { x: ringX, y: ringY });
		requestAnimationFrame(cursorLoop);
	}

	if (!(window.matchMedia('(hover: none)').matches) && !REDUCED) {
		document.addEventListener('mousemove', function (e) {
			mouseX = e.clientX; mouseY = e.clientY;
		}, { passive: true });
		cursorLoop();

		var hotspots = document.querySelectorAll('a, button, .work-card, .skill');
		hotspots.forEach(function (el) {
			var label = el.getAttribute('data-txt');
			el.addEventListener('pointerover', function () {
				document.body.classList.add('cursor-hover');
				if (label && ringLbl) ringLbl.textContent = label;
			});
			el.addEventListener('pointerout', function () {
				document.body.classList.remove('cursor-hover');
			});
		});
	}

	/* ---------------- Menu Navigation ---------------- */

	var toggle = document.querySelector('.menu-toggle');
	if (toggle) {
		toggle.addEventListener('click', function (e) {
			e.preventDefault();
			document.body.classList.toggle('menu-open');
			toggle.setAttribute('aria-expanded', document.body.classList.contains('menu-open'));
		});
	}
	document.querySelectorAll('.menu-link').forEach(function (link) {
		link.addEventListener('click', function () { document.body.classList.remove('menu-open'); });
	});

	window.addEventListener('load', function () { ScrollTrigger.refresh(); });

})();
