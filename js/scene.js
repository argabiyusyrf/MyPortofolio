/* ============================================================
   scene.js — ceramic sculpture, warm studio light, dust,
   section morphing, 3D cursor light, dynamic themes & 3D inspection.
   Exposes window.SCENE with .init(), .setTheme(), .focusArtifact().
   ============================================================ */

(function () {
	if (!window.__WEBGL__) return;

	var lastTime = performance.now();
	var birthTime = 0;

	var container = document.getElementById('scene-canvas');
	var renderer, scene, camera;
	var sculpture = { group: null, knot: null, core: null, halo: null, shards: [], wire: null, wire2: null, shadow: null };
	var dust = null;
	var cursorLight = null;
	var mouseVec = new THREE.Vector2();

	var state = {
		scroll: 0,        // 0..1 global page progress fed by app.js
		px: 0, py: 0,     // smoothed pointer (-1..1)
		tx: 0, ty: 0,     // raw pointer target
		intro: 1,         // 0..1 dolly-in blend
		theme: 'studio',  // 'studio', 'obsidian', 'solaris'
		inspecting: false,// inspection mode flag
		dragRotate: { x: 0, y: 0, isDragging: false, lastX: 0, lastY: 0 },
		active: true
	};

	// Theme color definitions for WebGL
	var THEMES = {
		studio: {
			fog: 0xece7dc,
			hemiSky: 0xfff6e8, hemiGround: 0xcfc6b2,
			key: 0xffe8cc, rim: 0xbcd4e0, fill: 0xe8e2d4,
			knotColor: 0xe8e1d1, coreColor: 0xd9cbb4,
			accent1: 0xa3765a, accent2: 0x7f8a6b, accent3: 0x2f2c24,
			dustColor: 0xfff7ea
		},
		obsidian: {
			fog: 0x0b0f19,
			hemiSky: 0x1e293b, hemiGround: 0x0f172a,
			key: 0x38bdf8, rim: 0xa855f7, fill: 0x1e1b4b,
			knotColor: 0x1e293b, coreColor: 0x0284c7,
			accent1: 0x38bdf8, accent2: 0xa855f7, accent3: 0x06b6d4,
			dustColor: 0x38bdf8
		},
		solaris: {
			fog: 0x1a1614,
			hemiSky: 0x451a03, hemiGround: 0x1c1917,
			key: 0xf59e0b, rim: 0xef4444, fill: 0x78350f,
			knotColor: 0x292524, coreColor: 0xd97706,
			accent1: 0xf59e0b, accent2: 0xef4444, accent3: 0xb45309,
			dustColor: 0xfde68a
		}
	};

	// cinematic camera keyframes — continuous dolly across section acts
	var POSES = [
		{ s: 0.00, x: 0.0,  y: 0.30, z: 9.6,  lx: 0.0,  ly: 0.0,   roll: 0.00, fov: 38 },
		{ s: 0.10, x: 1.6,  y: 0.50, z: 8.4,  lx: -0.3, ly: 0.05,  roll: -0.03, fov: 38 },
		{ s: 0.26, x: -2.5, y: 0.60, z: 8.1,  lx: 0.65, ly: -0.15, roll: 0.05, fov: 37 },
		{ s: 0.52, x: 0.4,  y: 1.00, z: 6.9,  lx: -0.1, ly: -0.5,  roll: -0.05, fov: 36 },
		{ s: 0.76, x: 2.6,  y: -0.15, z: 8.5, lx: -0.55,ly: 0.25,  roll: 0.065, fov: 37 },
		{ s: 1.00, x: 0.0,  y: 1.80, z: 11.0, lx: 0.0,  ly: -0.75, roll: 0.0,   fov: 38 }
	];

	var lights = {};

	function init() {
		birthTime = performance.now();
		state.intro = 0;

		renderer = new THREE.WebGLRenderer({
			canvas: container,
			antialias: true,
			alpha: true,
			powerPreference: 'high-performance'
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.outputEncoding = THREE.sRGBEncoding;
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.05;
		renderer.shadowMap.enabled = false;

		scene = new THREE.Scene();
		var cfg = THEMES[state.theme];
		scene.fog = new THREE.FogExp2(cfg.fog, 0.016);

		camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 60);
		camera.position.set(0, 0.3, 9.5);
		camera.lookAt(0, 0, 0);

		buildLights();
		buildSculpture();
		buildDust();

		window.addEventListener('resize', onResize);
		window.addEventListener('pointermove', onPointer, { passive: true });
		window.addEventListener('pointerdown', onPointerDown);
		window.addEventListener('pointerup', onPointerUp);

		if (window.__REDUCED__) {
			state.active = false;
			camera.position.set(0, 0.1, 9.6);
			camera.lookAt(0, 0, 0);
		}

		renderer.setAnimationLoop(loop);
	}

	function buildLights() {
		var cfg = THEMES[state.theme];

		lights.hemi = new THREE.HemisphereLight(cfg.hemiSky, cfg.hemiGround, 0.55);
		scene.add(lights.hemi);

		lights.key = new THREE.DirectionalLight(cfg.key, 1.35);
		lights.key.position.set(4, 6, 6);
		scene.add(lights.key);

		lights.rim = new THREE.DirectionalLight(cfg.rim, 0.75);
		lights.rim.position.set(-5, -2, -4);
		scene.add(lights.rim);

		lights.fill = new THREE.DirectionalLight(cfg.fill, 0.35);
		lights.fill.position.set(0, -3, 3);
		scene.add(lights.fill);

		// Dynamic 3D Cursor Light (follows mouse)
		cursorLight = new THREE.PointLight(cfg.key, 1.5, 12);
		cursorLight.position.set(0, 0, 5);
		scene.add(cursorLight);
	}

	function clayMat(hex, sheen, rough, clear) {
		return new THREE.MeshPhysicalMaterial({
			color: hex,
			roughness: rough === undefined ? 0.42 : rough,
			metalness: 0.02,
			sheen: sheen === undefined ? 1 : sheen,
			sheenColor: new THREE.Color(0xf6efe1),
			sheenRoughness: 0.5,
			clearcoat: clear === undefined ? 0.55 : clear,
			clearcoatRoughness: 0.4,
			envMapIntensity: 0.5
		});
	}

	function buildSculpture() {
		var cfg = THEMES[state.theme];

		sculpture.group = new THREE.Group();
		scene.add(sculpture.group);

		// central torus knot
		var knotGeo = new THREE.TorusKnotGeometry(1.15, 0.36, 240, 36, 2, 3);
		sculpture.knot = new THREE.Mesh(knotGeo, clayMat(cfg.knotColor, 0.5, 0.38, 0.9));
		sculpture.group.add(sculpture.knot);

		// inner core
		var coreGeo = new THREE.IcosahedronGeometry(0.62, 4);
		sculpture.core = new THREE.Mesh(coreGeo, clayMat(cfg.coreColor, 0.8, 0.5, 0.4));
		sculpture.group.add(sculpture.core);
		sculpture.shards.push(sculpture.core);

		// wireframe halo
		var haloGeo = new THREE.IcosahedronGeometry(2.9, 1);
		sculpture.halo = new THREE.Mesh(haloGeo, new THREE.MeshBasicMaterial({
			color: 0x8a8677,
			wireframe: true,
			transparent: true,
			opacity: 0.07
		}));
		sculpture.group.add(sculpture.halo);

		// orbiting shards
		var pebbleGeo = new THREE.IcosahedronGeometry(1, 0);
		var accents = [cfg.accent1, cfg.accent2, cfg.accent3, 0xe2b78a];
		for (var i = 0; i < 8; i++) {
			var s = 0.1 + Math.random() * 0.17;
			var m = new THREE.Mesh(pebbleGeo, clayMat(accents[i % accents.length], 0.9, 0.5, 0.8));
			m.scale.setScalar(s);
			var a = (i / 8) * Math.PI * 2 + Math.random() * 0.55;
			var rad = 2.0 + Math.random() * 0.9;
			m.position.set(Math.cos(a) * rad, (Math.random() - 0.5) * 1.7, Math.sin(a) * rad * 0.8);
			m.userData = { base: { a: a, rad: rad, ph: Math.random() * Math.PI * 2, sp: 0.5 + Math.random() * 0.7 } };
			sculpture.group.add(m);
			sculpture.shards.push(m);
		}

		// blueprint rings
		var wireGeo = new THREE.TorusGeometry(2.5, 0.006, 8, 140);
		sculpture.wire = new THREE.Mesh(wireGeo, new THREE.MeshBasicMaterial({
			color: 0x8a8677, transparent: true, opacity: 0.5
		}));
		sculpture.wire.rotation.x = Math.PI / 2.2;
		sculpture.wire.rotation.z = 0.35;
		sculpture.group.add(sculpture.wire);

		var wire2Geo = new THREE.TorusGeometry(3.05, 0.004, 8, 140);
		sculpture.wire2 = new THREE.Mesh(wire2Geo, new THREE.MeshBasicMaterial({
			color: cfg.accent1, transparent: true, opacity: 0.28
		}));
		sculpture.wire2.rotation.x = Math.PI / 1.8;
		sculpture.wire2.rotation.z = -0.5;
		sculpture.group.add(sculpture.wire2);

		// soft contact shadow
		var shadowGeo = new THREE.PlaneGeometry(8, 8);
		var canvas = document.createElement('canvas');
		canvas.width = canvas.height = 256;
		var ctx = canvas.getContext('2d');
		var grd = ctx.createRadialGradient(128, 128, 8, 128, 128, 124);
		grd.addColorStop(0, 'rgba(40,36,26,0.34)');
		grd.addColorStop(0.55, 'rgba(40,36,26,0.16)');
		grd.addColorStop(1, 'rgba(40,36,26,0)');
		ctx.fillStyle = grd;
		ctx.fillRect(0, 0, 256, 256);
		var shadowTex = new THREE.CanvasTexture(canvas);
		sculpture.shadow = new THREE.Mesh(shadowGeo, new THREE.MeshBasicMaterial({
			map: shadowTex, transparent: true, depthWrite: false
		}));
		sculpture.shadow.rotation.x = -Math.PI / 2;
		sculpture.shadow.position.y = -1.7;
		sculpture.shadow.position.z = -0.6;
		scene.add(sculpture.shadow);

		sculpture.group.scale.setScalar(0.001);
	}

	function buildDust() {
		var cfg = THEMES[state.theme];
		var count = window.innerWidth < 720 ? 240 : 480;
		var positions = new Float32Array(count * 3);
		for (var i = 0; i < count; i++) {
			positions[i * 3] = (Math.random() - 0.5) * 26;
			positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
			positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
		}

		var geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

		var mat = new THREE.PointsMaterial({
			color: cfg.dustColor,
			size: 0.022,
			sizeAttenuation: true,
			transparent: true,
			opacity: 0.55,
			depthWrite: false,
			blending: THREE.AdditiveBlending
		});

		dust = new THREE.Points(geo, mat);
		scene.add(dust);
	}

	function setTheme(name) {
		if (!THEMES[name]) return;
		state.theme = name;
		var cfg = THEMES[name];

		if (scene.fog) scene.fog.color.setHex(cfg.fog);
		if (lights.hemi) {
			lights.hemi.color.setHex(cfg.hemiSky);
			lights.hemi.groundColor.setHex(cfg.hemiGround);
		}
		if (lights.key) lights.key.color.setHex(cfg.key);
		if (lights.rim) lights.rim.color.setHex(cfg.rim);
		if (lights.fill) lights.fill.color.setHex(cfg.fill);
		if (cursorLight) cursorLight.color.setHex(cfg.key);

		if (sculpture.knot) sculpture.knot.material.color.setHex(cfg.knotColor);
		if (sculpture.core) sculpture.core.material.color.setHex(cfg.coreColor);
		if (sculpture.wire2) sculpture.wire2.material.color.setHex(cfg.accent1);
		if (dust) dust.material.color.setHex(cfg.dustColor);
	}

	function onResize() {
		if (!camera) return;
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function onPointer(e) {
		state.tx = (e.clientX / window.innerWidth) * 2 - 1;
		state.ty = -((e.clientY / window.innerHeight) * 2 - 1);

		mouseVec.x = state.tx;
		mouseVec.y = state.ty;

		if (state.dragRotate.isDragging) {
			var dx = e.clientX - state.dragRotate.lastX;
			var dy = e.clientY - state.dragRotate.lastY;
			state.dragRotate.x += dx * 0.008;
			state.dragRotate.y += dy * 0.008;
			state.dragRotate.lastX = e.clientX;
			state.dragRotate.lastY = e.clientY;
		}
	}

	function onPointerDown(e) {
		if (state.inspecting) {
			state.dragRotate.isDragging = true;
			state.dragRotate.lastX = e.clientX;
			state.dragRotate.lastY = e.clientY;
		}
	}

	function onPointerUp() {
		state.dragRotate.isDragging = false;
	}

	function smoothstep(a, b, t) {
		var x = Math.max(0, Math.min(1, (t - a) / (b - a)));
		return x * x * (3 - 2 * x);
	}

	function evalPose(sc) {
		var p0 = POSES[0], p1 = POSES[POSES.length - 1];
		for (var i = 0; i < POSES.length; i++) {
			if (POSES[i].s > sc) { p1 = POSES[i]; p0 = POSES[i - 1]; break; }
		}
		var k = p0 === p1 ? 0 : smoothstep(p0.s, p1.s, sc);
		return {
			x: p0.x + (p1.x - p0.x) * k,
			y: p0.y + (p1.y - p0.y) * k,
			z: p0.z + (p1.z - p0.z) * k,
			lx: p0.lx + (p1.lx - p0.lx) * k,
			ly: p0.ly + (p1.ly - p0.ly) * k,
			roll: p0.roll + (p1.roll - p0.roll) * k,
			fov: p0.fov + (p1.fov - p0.fov) * k
		};
	}

	function toggleArtifactFocus(enable) {
		state.inspecting = typeof enable === 'boolean' ? enable : !state.inspecting;
		if (!state.inspecting) {
			state.dragRotate.x = 0;
			state.dragRotate.y = 0;
		}
	}

	function loop() {
		var now = performance.now();
		var dt = Math.min((now - lastTime) / 1000, 0.05);
		lastTime = now;
		var t = now * 0.001;

		var b = (now - birthTime) / 1000;
		var intT = Math.max(0, Math.min(1, (b - 0.4) / 2.2));
		state.intro = intT * intT * (3 - 2 * intT);

		state.px += (state.tx - state.px) * 0.05;
		state.py += (state.ty - state.py) * 0.05;

		var sc = state.scroll;
		var int = state.intro;

		// Move dynamic cursor light in 3D
		if (cursorLight) {
			cursorLight.position.x = state.px * 6;
			cursorLight.position.y = state.py * 4;
			cursorLight.position.z = 4.5 + Math.sin(t * 2) * 0.5;
		}

		// Sculpture Scale & Morphing based on Scroll
		var sTarget = (0.72 + sc * 0.30) * (0.2 + 0.8 * int);
		if (state.inspecting) sTarget = 1.25; // inspect focus zoom

		sculpture.group.scale.setScalar(sTarget);
		sculpture.shadow.material.opacity = state.inspecting ? 0 : 0.9 * int;

		// Knot Morphing Rotations
		var extraX = state.inspecting ? state.dragRotate.y : 0;
		var extraY = state.inspecting ? state.dragRotate.x : 0;

		sculpture.knot.rotation.x = Math.sin(t * 0.22) * 0.45 + sc * 0.6 + extraX;
		sculpture.knot.rotation.y = t * 0.28 + Math.sin(t * 0.5) * 0.35 + sc * 0.9 + extraY;
		sculpture.core.rotation.x = t * 0.12 + extraX;
		sculpture.core.rotation.y = -t * 0.16 + extraY;

		// Halo counter-drift & morphing expansion across sections
		sculpture.halo.rotation.x = -t * 0.04 + Math.sin(t * 0.1) * 0.3;
		sculpture.halo.rotation.y = -t * 0.06 + sc * 1.5;
		sculpture.halo.scale.setScalar(1 + Math.sin(sc * Math.PI) * 0.35);
		sculpture.halo.material.opacity = 0.05 + 0.05 * int;

		// Blueprint rings
		sculpture.wire.rotation.y += dt * 0.05;
		sculpture.wire.rotation.x += dt * 0.015;
		sculpture.wire2.rotation.y -= dt * 0.03;

		// Orbiting shards
		for (var i = 0; i < sculpture.shards.length; i++) {
			var sh = sculpture.shards[i];
			if (!sh.userData.base) continue;
			var pb = sh.userData.base;
			var a = pb.a + t * (0.16 + pb.sp * 0.12) + sc * 0.8;
			var rad = pb.rad * (1 + sc * 0.25);
			sh.position.x = Math.cos(a) * rad;
			sh.position.z = Math.sin(a) * rad * 0.8;
			sh.position.y = Math.sin(t * 0.8 + pb.ph) * 0.45;
			sh.rotation.x = t * 0.6 + pb.ph;
			sh.rotation.y = t * 0.9 + pb.ph;
		}

		// Dust drift
		if (dust) {
			var pos = dust.geometry.attributes.position;
			var arr = pos.array;
			for (var d = 0; d < arr.length; d += 3) {
				arr[d + 1] += dt * 0.014;
				arr[d] += Math.sin(t * 0.16 + d * 1.7) * 0.00028;
				if (arr[d + 1] > 8.5) { arr[d + 1] = -8.5; }
			}
			pos.needsUpdate = true;
		}

		// Camera keyframe interpolation or inspection view
		if (!state.inspecting) {
			var p = evalPose(sc);
			var idle = Math.sin(t * 0.45) * 0.06;

			var camX = p.x + state.px * 0.55 + idle;
			var camY = p.y - state.py * 0.4 + Math.cos(t * 0.38) * 0.05;
			var camZ = p.z + (1 - int) * 2.6;

			camera.position.x += (camX - camera.position.x) * 0.09;
			camera.position.y += (camY - camera.position.y) * 0.09;
			camera.position.z += (camZ - camera.position.z) * 0.09;

			var lookX = p.lx + state.px * 0.35;
			var lookY = p.ly + state.py * 0.3;
			camera.lookAt(lookX, lookY, 0);

			camera.fov += (p.fov - camera.fov) * 0.03;
			camera.updateProjectionMatrix();
			camera.rotation.z = p.roll + state.px * 0.01;
		} else {
			// Inspection camera mode
			camera.position.x += (0 - camera.position.x) * 0.1;
			camera.position.y += (0.2 - camera.position.y) * 0.1;
			camera.position.z += (5.2 - camera.position.z) * 0.1;
			camera.lookAt(0, 0, 0);
		}

		renderer.render(scene, camera);
	}

	window.SCENE = {
		init: init,
		state: state,
		setTheme: setTheme,
		toggleArtifactFocus: toggleArtifactFocus
	};
})();
