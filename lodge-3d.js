/* ============================================================
   SHIRAUME LODGE — Interactive 3D Property Model
   ------------------------------------------------------------
   A procedurally-built model of the inn and its grounds:
   irimoya roof, engawa veranda, bath annex, moss garden,
   stone path and torii, with Mt. Hiko behind.

   No binary model assets — every volume is generated here, so
   the model re-themes with the site (light = midday, dark = dusk)
   and stays editable in plain code.
   ============================================================ */

import * as THREE from './vendor/three.module.min.js';

/* ── Small utilities ─────────────────────────────────────── */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const lerp  = (a, b, t) => a + (b - a) * t;

/* Deterministic PRNG so the garden lays out the same on every load. */
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* ── Palettes ────────────────────────────────────────────── */

const PALETTE = {
  light: {
    sky:      0xdfe4e2,
    fog:      0xdfe4e2,
    fogNear:  34,
    fogFar:   96,
    moss:     0x556b45,
    grass:    0x62784e,
    gravel:   0xcac2ae,
    stone:    0x8c887e,
    water:    0x415c60,
    timber:   0x6a4632,
    postDark: 0x4a3325,
    plaster:  0xe6dfd0,
    shoji:    0xf3ecda,
    shojiGlow:0x000000,
    shojiEmit:0.0,
    tile:     0x424b52,
    deck:     0x8a6d47,
    cedar:    0x3f5a3c,
    maple:    0x8d5a34,
    mountain: 0x6d7a68,
    hemiSky:  0xdfe6e6,
    hemiGnd:  0x6c6552,
    hemiInt:  1.05,
    sunColor: 0xfff2dc,
    sunInt:   2.5,
    sunPos:   [22, 26, 14],
    fillInt:  0.35,
    lantern:  0.0,
    exposure: 1.0,
    petal:    0xfdf7ee,
    petalOp:  0.75
  },
  dark: {
    sky:      0x1b2230,
    fog:      0x1b2230,
    fogNear:  30,
    fogFar:   92,
    moss:     0x4a5a45,
    grass:    0x53644a,
    gravel:   0x6a6558,
    stone:    0x63605a,
    water:    0x22323c,
    timber:   0x5c4030,
    postDark: 0x3e2c20,
    plaster:  0xa89f8d,
    shoji:    0xffcf8e,
    shojiGlow:0xffa94a,
    shojiEmit:1.0,
    tile:     0x39434c,
    deck:     0x6b5336,
    cedar:    0x42553f,
    maple:    0x6a422a,
    mountain: 0x454f59,
    hemiSky:  0x4a5c7a,
    hemiGnd:  0x2a2620,
    hemiInt:  1.35,
    sunColor: 0x8fa8d4,
    sunInt:   1.15,
    sunPos:   [-20, 16, -10],
    fillInt:  0.5,
    lantern:  1.0,
    exposure: 1.18,
    petal:    0xf3e6d2,
    petalOp:  0.55
  }
};

/* ── Hotspots ────────────────────────────────────────────── */
/* Each anchors to a point on the model and frames a camera view. */

const HOTSPOTS = [
  {
    id: 'roof',
    link: '#story',
    at: [0, 9.4, 0],
    view: { theta: 0.62, phi: 0.92, radius: 24, target: [0, 5.0, 0] },
    en: { label: 'The Original Roofline',  body: 'An irimoya hip-and-gable roof over the inn’s hundred-year-old timber frame. The deep eaves and flared apron are kept; the structure beneath is reinforced.', cta: 'Read the property story' },
    ja: { label: '元の屋根',       body: '築百年の木造軸組を覆う入母屋造りの屋根。深い軒と反りを残し、下の構造を補強します。', cta: '物件の物語を読む' }
  },
  {
    id: 'engawa',
    link: '#rooms',
    at: [-1.6, 1.9, 5.4],
    view: { theta: 0.24, phi: 1.24, radius: 17, target: [-1.0, 2.0, 3.6] },
    en: { label: 'The Engawa',   body: 'A cedar veranda running the garden face of the building — the threshold between tatami and moss, where guests take breakfast and the mountain air.', cta: 'See the five rooms' },
    ja: { label: '縁側',        body: '建物の庭側を走る杉の縁側。畳と苔の境目で、朝食と山の空気を受け取る場所です。', cta: '客室を見る' }
  },
  {
    id: 'yuya',
    link: '#rooms',
    at: [9.4, 3.6, -2.2],
    view: { theta: 1.05, phi: 1.10, radius: 20, target: [7.6, 2.0, -1.4] },
    en: { label: 'Bath House',  body: 'A separate timber annex for the baths, drawing mountain water. Three of the garden rooms downstairs also carry their own private tubs.', cta: 'See the garden rooms' },
    ja: { label: '湯屋',       body: '山の水を引く、浴室のための離れの木造棟。1階の庭園客室も三室が専用風呂を備えます。', cta: '庭園客室を見る' }
  },
  {
    id: 'sando',
    link: '#area',
    at: [-11.5, 4.3, 7.5],
    view: { theta: -0.40, phi: 1.16, radius: 24, target: [-7.5, 2.2, 6.0] },
    en: { label: 'The Sando Approach', body: 'The torii and stepping-stone path set the inn on the old pilgrimage route to Hikosan Jingū — a shrine that has anchored this valley since 740 CE.', cta: 'Explore the area' },
    ja: { label: '参道',              body: '鳥居と飛び石の道が、宿を英彦山神宮への古い巡礼の道に位置づけます。西暦740年からこの谷を守る神社です。', cta: '周辺を見る' }
  },
  {
    id: 'niwa',
    link: '#experience',
    at: [-3.4, 0.9, 10.6],
    view: { theta: 0.08, phi: 1.10, radius: 22, target: [-3.0, 1.2, 8.0] },
    en: { label: 'Moss Garden & Pond', body: 'Moss, maple and a still pond hold the south side of the plot. Stone lanterns light it after dark — switch the site to dark mode to see the grounds at dusk.', cta: 'What a stay includes' },
    ja: { label: '苔庭と池',          body: '苔、モミジ、静かな池が敷地の南側を成します。日が暮れれば石灯籠が灯ります。ダークモードで夕暮れの庭をどうぞ。', cta: '滞在に含まれるもの' }
  }
];

const HOME_VIEW = { theta: 0.55, phi: 1.02, radius: 35, target: [0, 3.2, 0] };

/* ============================================================
   Init
   ============================================================ */

function init(root) {
  const canvas    = root.querySelector('.model-canvas');
  const overlay   = root.querySelector('.model-hotspots');
  const fallback  = root.querySelector('.model-fallback');
  const panel     = root.querySelector('.model-panel');
  const hint      = root.querySelector('.model-hint');
  const btnReset  = root.querySelector('[data-model-reset]');
  const btnSpin   = root.querySelector('[data-model-spin]');
  const btnIn     = root.querySelector('[data-model-zoom="in"]');
  const btnOut    = root.querySelector('[data-model-zoom="out"]');

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch (err) {
    return; // No WebGL — the static fallback stays visible.
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.5, 220);

  /* Render-on-demand: anything that changes the picture calls invalidate(). */
  let dirty = true, running = false, t0 = performance.now();
  function invalidate() { dirty = true; }

  /* ── Lights ─────────────────────────────────────────── */
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 90;
  sun.shadow.camera.left = -26;
  sun.shadow.camera.right = 26;
  sun.shadow.camera.top = 26;
  sun.shadow.camera.bottom = -26;
  sun.shadow.bias = -0.0012;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);
  scene.add(sun.target);

  const fill = new THREE.DirectionalLight(0xbcd0e0, 0.3);
  fill.position.set(-16, 10, -18);
  scene.add(fill);

  /* ── Materials (mutated on theme change) ────────────── */
  const M = {
    moss:     new THREE.MeshStandardMaterial({ roughness: 1.0 }),
    grass:    new THREE.MeshStandardMaterial({ roughness: 1.0 }),
    gravel:   new THREE.MeshStandardMaterial({ roughness: 1.0 }),
    stone:    new THREE.MeshStandardMaterial({ roughness: 0.9 }),
    water:    new THREE.MeshStandardMaterial({ roughness: 0.12, metalness: 0.35 }),
    timber:   new THREE.MeshStandardMaterial({ roughness: 0.85 }),
    postDark: new THREE.MeshStandardMaterial({ roughness: 0.8 }),
    plaster:  new THREE.MeshStandardMaterial({ roughness: 0.95 }),
    shoji:    new THREE.MeshStandardMaterial({ roughness: 0.9 }),
    tile:     new THREE.MeshStandardMaterial({ roughness: 0.62, metalness: 0.12, side: THREE.DoubleSide }),
    deck:     new THREE.MeshStandardMaterial({ roughness: 0.8 }),
    cedar:    new THREE.MeshStandardMaterial({ roughness: 1.0, flatShading: true }),
    maple:    new THREE.MeshStandardMaterial({ roughness: 1.0, flatShading: true }),
    mountain: new THREE.MeshStandardMaterial({ roughness: 1.0, flatShading: true })
  };

  /* ── Build the world ────────────────────────────────── */
  const world = new THREE.Group();
  scene.add(world);

  world.add(buildTerrain(M));
  world.add(buildMountains(M));
  world.add(buildLodge(M));
  world.add(buildAnnex(M));
  world.add(buildEngawa(M));
  world.add(buildTorii(M));
  world.add(buildGarden(M));

  const lanterns = buildLanterns(M);
  world.add(lanterns.group);

  const interiorGlow = new THREE.PointLight(0xffb066, 0, 16, 2);
  interiorGlow.position.set(0, 2.4, 2.0);
  world.add(interiorGlow);

  const petals = reduceMotion ? null : buildPetals();
  if (petals) world.add(petals.points);

  /* ── Theme ──────────────────────────────────────────── */
  let pal = PALETTE.light;

  function applyPalette(name) {
    pal = PALETTE[name] || PALETTE.light;
    scene.background = new THREE.Color(pal.sky);
    scene.fog = new THREE.Fog(pal.fog, pal.fogNear, pal.fogFar);

    M.moss.color.setHex(pal.moss);
    M.grass.color.setHex(pal.grass);
    M.gravel.color.setHex(pal.gravel);
    M.stone.color.setHex(pal.stone);
    M.water.color.setHex(pal.water);
    M.timber.color.setHex(pal.timber);
    M.postDark.color.setHex(pal.postDark);
    M.plaster.color.setHex(pal.plaster);
    M.tile.color.setHex(pal.tile);
    M.deck.color.setHex(pal.deck);
    M.cedar.color.setHex(pal.cedar);
    M.maple.color.setHex(pal.maple);
    M.mountain.color.setHex(pal.mountain);

    M.shoji.color.setHex(pal.shoji);
    M.shoji.emissive.setHex(pal.shojiGlow);
    M.shoji.emissiveIntensity = pal.shojiEmit;

    hemi.color.setHex(pal.hemiSky);
    hemi.groundColor.setHex(pal.hemiGnd);
    hemi.intensity = pal.hemiInt;

    sun.color.setHex(pal.sunColor);
    sun.intensity = pal.sunInt;
    sun.position.set(pal.sunPos[0], pal.sunPos[1], pal.sunPos[2]);
    fill.intensity = pal.fillInt;

    lanterns.lights.forEach(l => { l.intensity = pal.lantern * 2.4; });
    lanterns.flames.forEach(m => { m.material.opacity = pal.lantern; m.visible = pal.lantern > 0; });
    interiorGlow.intensity = pal.lantern * 3.0;

    if (petals) {
      petals.points.material.color.setHex(pal.petal);
      petals.points.material.opacity = pal.petalOp;
    }

    renderer.toneMappingExposure = pal.exposure;
    invalidate();
  }

  const htmlEl = document.documentElement;
  applyPalette(htmlEl.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  new MutationObserver(() => {
    applyPalette(htmlEl.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  }).observe(htmlEl, { attributes: true, attributeFilter: ['data-theme'] });

  /* ── Camera orbit state ─────────────────────────────── */
  const cam = {
    theta: HOME_VIEW.theta, phi: HOME_VIEW.phi, radius: HOME_VIEW.radius,
    target: new THREE.Vector3(...HOME_VIEW.target)
  };
  const goal = {
    theta: cam.theta, phi: cam.phi, radius: cam.radius,
    target: cam.target.clone()
  };

  const PHI_MIN = 0.30, PHI_MAX = 1.44;
  const R_MIN = 11, R_MAX = 48;

  function setView(v, snap) {
    goal.theta = v.theta;
    goal.phi = clamp(v.phi, PHI_MIN, PHI_MAX);
    goal.radius = clamp(v.radius, R_MIN, R_MAX);
    goal.target.set(v.target[0], v.target[1], v.target[2]);
    if (snap) {
      cam.theta = goal.theta; cam.phi = goal.phi; cam.radius = goal.radius;
      cam.target.copy(goal.target);
    }
    invalidate();
  }
  setView(HOME_VIEW, true);

  function positionCamera() {
    const sp = Math.sin(cam.phi);
    camera.position.set(
      cam.target.x + cam.radius * sp * Math.sin(cam.theta),
      cam.target.y + cam.radius * Math.cos(cam.phi),
      cam.target.z + cam.radius * sp * Math.cos(cam.theta)
    );
    camera.lookAt(cam.target);
    sun.target.position.copy(cam.target);
    sun.target.updateMatrixWorld();
  }

  /* ── Pointer / keyboard interaction ─────────────────── */
  let dragging = false, lastX = 0, lastY = 0, pointers = new Map(), pinchDist = 0;
  let engaged = false;               // wheel only zooms once the viewer is engaged
  let autoSpin = !reduceMotion;

  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) { dragging = true; lastX = e.clientX; lastY = e.clientY; }
    if (pointers.size === 2) pinchDist = pinchSpan();
    engaged = true;
    setSpin(false);
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2) {
      const d = pinchSpan();
      if (pinchDist) zoomBy((pinchDist - d) * 0.045);
      pinchDist = d;
      return;
    }
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    goal.theta -= dx * 0.0062;
    goal.phi = clamp(goal.phi - dy * 0.0052, PHI_MIN, PHI_MAX);
    invalidate();
  });

  const endPointer = (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchDist = 0;
    if (pointers.size === 0) dragging = false;
  };
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('pointerleave', endPointer);

  function pinchSpan() {
    const p = [...pointers.values()];
    return Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
  }

  function zoomBy(amount) {
    goal.radius = clamp(goal.radius + amount, R_MIN, R_MAX);
    invalidate();
  }

  /* Wheel scrolls the page until the viewer has been touched, so the
     model never hijacks a reader on their way down the page. */
  canvas.addEventListener('wheel', (e) => {
    if (!engaged) return;
    e.preventDefault();
    zoomBy(e.deltaY * 0.012);
    setSpin(false);
  }, { passive: false });

  document.addEventListener('pointerdown', (e) => {
    if (!root.contains(e.target)) engaged = false;
  });

  canvas.addEventListener('keydown', (e) => {
    const step = 0.14;
    switch (e.key) {
      case 'ArrowLeft':  goal.theta += step; break;
      case 'ArrowRight': goal.theta -= step; break;
      case 'ArrowUp':    goal.phi = clamp(goal.phi - step * 0.6, PHI_MIN, PHI_MAX); break;
      case 'ArrowDown':  goal.phi = clamp(goal.phi + step * 0.6, PHI_MIN, PHI_MAX); break;
      case '+': case '=': zoomBy(-2); break;
      case '-': case '_': zoomBy(2); break;
      default: return;
    }
    e.preventDefault();
    setSpin(false);
    invalidate();
  });

  /* ── Controls ───────────────────────────────────────── */
  function setSpin(on) {
    autoSpin = on && !reduceMotion;
    if (btnSpin) {
      btnSpin.setAttribute('aria-pressed', String(autoSpin));
      btnSpin.classList.toggle('is-on', autoSpin);
    }
    if (autoSpin) invalidate();
  }
  setSpin(!reduceMotion);

  if (btnSpin)  btnSpin.addEventListener('click', () => setSpin(!autoSpin));
  if (btnIn)    btnIn.addEventListener('click', () => { zoomBy(-3); setSpin(false); });
  if (btnOut)   btnOut.addEventListener('click', () => { zoomBy(3); setSpin(false); });
  if (btnReset) btnReset.addEventListener('click', () => { closePanel(); setView(HOME_VIEW); setSpin(false); });

  /* ── Hotspot markers ────────────────────────────────── */
  const markers = HOTSPOTS.map(h => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hotspot';
    btn.dataset.hotspot = h.id;
    btn.innerHTML =
      '<span class="hotspot-dot" aria-hidden="true"></span>' +
      '<span class="hotspot-label">' +
        '<span class="en">' + h.en.label + '</span>' +
        '<span class="ja">' + h.ja.label + '</span>' +
      '</span>';
    btn.addEventListener('click', () => openHotspot(h));
    overlay.appendChild(btn);
    return { h, el: btn, pos: new THREE.Vector3(...h.at) };
  });

  const panelTitleEn = panel.querySelector('[data-panel-title] .en');
  const panelTitleJa = panel.querySelector('[data-panel-title] .ja');
  const panelBodyEn  = panel.querySelector('[data-panel-body] .en');
  const panelBodyJa  = panel.querySelector('[data-panel-body] .ja');
  const panelLink    = panel.querySelector('[data-panel-link]');
  const panelLinkEn  = panelLink.querySelector('.en');
  const panelLinkJa  = panelLink.querySelector('.ja');
  const panelClose   = panel.querySelector('[data-panel-close]');

  function openHotspot(h) {
    panelTitleEn.textContent = h.en.label;
    panelTitleJa.textContent = h.ja.label;
    panelBodyEn.textContent  = h.en.body;
    panelBodyJa.textContent  = h.ja.body;
    panelLinkEn.textContent  = h.en.cta;
    panelLinkJa.textContent  = h.ja.cta;
    panelLink.setAttribute('href', h.link);
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    markers.forEach(m => m.el.classList.toggle('is-active', m.h.id === h.id));
    setSpin(false);
    setView(h.view);
  }

  function closePanel() {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    markers.forEach(m => m.el.classList.remove('is-active'));
  }
  panelClose.addEventListener('click', () => { closePanel(); setView(HOME_VIEW); });

  /* Project each anchor to screen space and park its marker there. */
  const proj = new THREE.Vector3();
  function layoutMarkers(w, h) {
    for (const m of markers) {
      proj.copy(m.pos).project(camera);
      if (proj.z > 1) { m.el.classList.add('is-hidden'); continue; }
      m.el.classList.remove('is-hidden');
      m.el.style.transform =
        'translate(' + ((proj.x * 0.5 + 0.5) * w).toFixed(1) + 'px,' +
        ((-proj.y * 0.5 + 0.5) * h).toFixed(1) + 'px)';
    }
  }

  /* ── Resize ─────────────────────────────────────────── */
  let vw = 0, vh = 0;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    if (w === vw && h === vh) return;
    vw = w; vh = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    invalidate();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  /* ── Render loop ────────────────────────────────────── */
  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);

    const dt = Math.min(0.05, (now - t0) / 1000);
    t0 = now;

    if (autoSpin) goal.theta += dt * 0.075;

    const k = 1 - Math.pow(0.0025, dt);   // frame-rate independent damping
    const moved =
      Math.abs(goal.theta - cam.theta) > 1e-4 ||
      Math.abs(goal.phi - cam.phi) > 1e-4 ||
      Math.abs(goal.radius - cam.radius) > 1e-3 ||
      goal.target.distanceToSquared(cam.target) > 1e-6;

    if (moved) {
      cam.theta  = lerp(cam.theta, goal.theta, k);
      cam.phi    = lerp(cam.phi, goal.phi, k);
      cam.radius = lerp(cam.radius, goal.radius, k);
      cam.target.lerp(goal.target, k);
      dirty = true;
    }

    if (petals) { petals.update(dt); dirty = true; }

    if (dirty) {
      positionCamera();
      renderer.render(scene, camera);
      layoutMarkers(vw, vh);
      dirty = false;
    }
  }

  function start() {
    if (running) return;
    running = true;
    t0 = performance.now();
    requestAnimationFrame(frame);
  }
  function stop() { running = false; }

  /* Only build pixels while the section is actually on screen. */
  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { root.classList.add('is-ready'); resize(); invalidate(); start(); }
      else stop();
    });
  }, { threshold: 0.02 }).observe(root);

  root.classList.add('is-live');
  if (fallback) fallback.hidden = true;
  if (hint) hint.hidden = false;
}

/* ============================================================
   Geometry builders
   ============================================================ */

/* A Japanese hip roof: a flared eave band rising to a hipped cap. */
function hipRoofGeometry(a, b, hBand, inset, hCap) {
  const pos = [];
  const push = (v) => pos.push(v[0], v[1], v[2]);
  const tri  = (p, q, r) => { push(p); push(q); push(r); };
  const quad = (p, q, r, s) => { tri(p, q, r); tri(p, r, s); };

  const outer = [[-a, 0, -b], [a, 0, -b], [a, 0, b], [-a, 0, b]];
  const ia = Math.max(a - inset, 0.2), ib = Math.max(b - inset, 0.2);
  const inner = [[-ia, hBand, -ib], [ia, hBand, -ib], [ia, hBand, ib], [-ia, hBand, ib]];

  for (let i = 0; i < 4; i++) quad(outer[i], outer[(i + 1) % 4], inner[(i + 1) % 4], inner[i]);

  const ridge = Math.max(ia - ib, 0.15);
  const yTop = hBand + hCap;
  const R0 = [-ridge, yTop, 0], R1 = [ridge, yTop, 0];

  quad(inner[0], inner[1], R1, R0);   // north slope
  quad(inner[2], inner[3], R0, R1);   // south slope
  tri(inner[1], inner[2], R1);        // east hip
  tri(inner[3], inner[0], R0);        // west hip

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  g.userData.ridge = { half: ridge, y: yTop };
  return g;
}

function roof(a, b, hBand, inset, hCap, mats) {
  const grp = new THREE.Group();
  const geo = hipRoofGeometry(a, b, hBand, inset, hCap);
  const mesh = new THREE.Mesh(geo, mats.tile);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  grp.add(mesh);

  const { half, y } = geo.userData.ridge;
  const cap = new THREE.Mesh(new THREE.BoxGeometry(half * 2 + 0.25, 0.2, 0.38), mats.tile);
  cap.position.y = y + 0.05;
  cap.castShadow = true;
  grp.add(cap);

  /* Onigawara — the ridge-end tiles. */
  [-1, 1].forEach(s => {
    const orn = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.34, 0.36), mats.tile);
    orn.position.set(s * (half + 0.12), y + 0.2, 0);
    orn.castShadow = true;
    grp.add(orn);
  });
  return grp;
}

function box(w, h, d, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function post(h, r, mat, x, z) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.08, h, 8), mat);
  m.position.set(x, h / 2, z);
  m.castShadow = true;
  return m;
}

/* A run of shoji screens: paper panels behind a timber lattice. */
function shojiWall(width, height, panels, mats) {
  const grp = new THREE.Group();
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mats.shoji);
  paper.position.y = height / 2;
  grp.add(paper);

  const bar = 0.06;
  const railTop = box(width, 0.1, 0.1, mats.timber, 0, height - 0.05, 0.03);
  const railBot = box(width, 0.1, 0.1, mats.timber, 0, 0.05, 0.03);
  grp.add(railTop, railBot);

  for (let i = 0; i <= panels; i++) {
    const x = -width / 2 + (width / panels) * i;
    grp.add(box(bar, height, 0.08, mats.timber, x, height / 2, 0.03));
  }
  const rows = 3;
  for (let r = 1; r < rows; r++) {
    grp.add(box(width, bar * 0.7, 0.07, mats.timber, 0, (height / rows) * r, 0.03));
  }
  return grp;
}

/* ── Terrain ─────────────────────────────────────────────── */

function buildTerrain(mats) {
  const grp = new THREE.Group();

  const ground = new THREE.Mesh(new THREE.CircleGeometry(70, 48), mats.moss);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  grp.add(ground);

  /* Raked gravel court in front of the entrance. */
  const court = new THREE.Mesh(new THREE.CircleGeometry(4.0, 36), mats.gravel);
  court.rotation.x = -Math.PI / 2;
  court.scale.set(1.35, 1, 1);
  court.position.set(-9.0, 0.02, 4.2);
  court.receiveShadow = true;
  grp.add(court);

  /* Stepping stones from the torii to the entrance. */
  const stoneGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.14, 9);
  const rnd = seeded(7);
  for (let i = 0; i < 16; i++) {
    const t = i / 15;
    const x = lerp(-12.6, -0.6, t) + Math.sin(t * 5.2) * 0.55;
    const z = lerp(8.4, 5.6, t) + Math.cos(t * 3.4) * 0.5;
    const s = new THREE.Mesh(stoneGeo, mats.stone);
    s.position.set(x, 0.05, z);
    s.rotation.y = rnd() * Math.PI;
    s.scale.setScalar(0.85 + rnd() * 0.35);
    s.receiveShadow = true;
    grp.add(s);
  }
  return grp;
}

function buildMountains(mats) {
  const grp = new THREE.Group();
  const rnd = seeded(21);
  const peaks = [
    [-34, 22, -62, 30], [4, 30, -74, 40], [38, 20, -58, 26],
    [-58, 15, -40, 22], [62, 14, -34, 20]
  ];
  peaks.forEach(([x, h, z, r]) => {
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7 + Math.floor(rnd() * 3), 2), mats.mountain);
    m.position.set(x, h / 2 - 1.5, z);
    m.rotation.y = rnd() * Math.PI;
    grp.add(m);
  });
  return grp;
}

/* ── The inn ─────────────────────────────────────────────── */

function buildLodge(mats) {
  const grp = new THREE.Group();

  const W = 12, D = 7;                     // footprint
  const FLOOR = 0.55;                      // raised floor height
  const H1 = 2.7, H2 = 2.3;                // storey heights

  grp.add(box(W + 0.7, FLOOR, D + 0.7, mats.stone, 0, FLOOR / 2, 0));

  /* Ground floor: plaster to the north/east/west, shoji to the garden. */
  const g0 = FLOOR;
  grp.add(box(W, H1, 0.3, mats.plaster, 0, g0 + H1 / 2, -D / 2));
  grp.add(box(0.3, H1, D, mats.plaster, -W / 2, g0 + H1 / 2, 0));
  grp.add(box(0.3, H1, D, mats.plaster, W / 2, g0 + H1 / 2, 0));

  const shoji0 = shojiWall(W - 0.6, H1 - 0.25, 8, mats);
  shoji0.position.set(0, g0, D / 2 - 0.05);
  grp.add(shoji0);

  /* Corner and mid posts — the timber frame that is being kept. */
  [-W / 2 + 0.2, -2.2, 2.2, W / 2 - 0.2].forEach(x => {
    [-D / 2 + 0.2, D / 2 - 0.2].forEach(z => {
      const p = post(H1 + FLOOR, 0.17, mats.postDark, x, z);
      grp.add(p);
    });
  });

  /* Floor band between storeys, with the hisashi pent roof over the engawa. */
  const bandY = g0 + H1;
  grp.add(box(W + 0.5, 0.34, D + 0.5, mats.timber, 0, bandY + 0.17, 0));

  const hisashi = new THREE.Mesh(new THREE.BoxGeometry(W + 1.3, 0.13, 2.6), mats.tile);
  hisashi.position.set(0, bandY + 0.30, D / 2 + 1.05);
  hisashi.rotation.x = -0.17;
  hisashi.castShadow = true;
  grp.add(hisashi);
  grp.add(box(W + 1.3, 0.12, 0.2, mats.timber, 0, bandY + 0.08, D / 2 + 2.28));

  /* Upper floor — the two family suites, slightly inset. */
  const u0 = bandY + 0.34;
  const uW = W - 0.5, uD = D - 0.5;
  grp.add(box(uW, H2, 0.28, mats.plaster, 0, u0 + H2 / 2, -uD / 2));
  grp.add(box(0.28, H2, uD, mats.plaster, -uW / 2, u0 + H2 / 2, 0));
  grp.add(box(0.28, H2, uD, mats.plaster, uW / 2, u0 + H2 / 2, 0));

  const shoji1 = shojiWall(uW - 0.5, H2 - 0.3, 6, mats);
  shoji1.position.set(0, u0 + 0.15, uD / 2 - 0.02);
  grp.add(shoji1);

  /* Mountain-facing balcony off the suites. */
  const balcY = u0 + 0.05;
  grp.add(box(uW + 1.0, 0.14, 1.5, mats.deck, 0, balcY, uD / 2 + 0.75));
  grp.add(box(uW + 1.0, 0.1, 0.1, mats.timber, 0, balcY + 0.85, uD / 2 + 1.45));
  for (let i = 0; i <= 12; i++) {
    const x = -(uW + 1.0) / 2 + ((uW + 1.0) / 12) * i;
    grp.add(box(0.06, 0.85, 0.06, mats.timber, x, balcY + 0.45, uD / 2 + 1.45));
  }

  /* The irimoya roof. */
  const r = roof(W / 2 + 1.15, D / 2 + 1.15, 0.7, 1.05, 1.95, mats);
  r.position.y = u0 + H2;
  grp.add(r);

  /* Entrance porch (genkan) on the west gable end. */
  const porch = new THREE.Group();
  porch.add(box(2.6, 0.14, 2.2, mats.deck, 0, 0.5, 0));
  [-1.1, 1.1].forEach(x => porch.add(post(2.4, 0.12, mats.postDark, x, 0.9)));
  const pr = roof(1.7, 1.5, 0.4, 0.6, 0.7, mats);
  pr.position.y = 2.4;
  porch.add(pr);
  porch.position.set(-W / 2 - 1.1, 0, 2.0);
  porch.rotation.y = -Math.PI / 2;
  grp.add(porch);

  /* Noren curtain at the entrance. */
  const noren = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x2f4a3a, roughness: 1, side: THREE.DoubleSide })
  );
  noren.position.set(-W / 2 - 0.15, 2.15, 2.0);
  noren.rotation.y = -Math.PI / 2;
  grp.add(noren);

  return grp;
}

/* The bath house annex, set off the east end. */
function buildAnnex(mats) {
  const grp = new THREE.Group();
  const W = 5, D = 4.4, H = 2.5, FLOOR = 0.4;

  grp.add(box(W + 0.5, FLOOR, D + 0.5, mats.stone, 0, FLOOR / 2, 0));
  grp.add(box(W, H, 0.26, mats.timber, 0, FLOOR + H / 2, -D / 2));
  grp.add(box(0.26, H, D, mats.timber, W / 2, FLOOR + H / 2, 0));
  grp.add(box(0.26, H, D, mats.timber, -W / 2, FLOOR + H / 2, 0));

  const sh = shojiWall(W - 0.5, H - 0.3, 4, mats);
  sh.position.set(0, FLOOR + 0.15, D / 2 - 0.02);
  grp.add(sh);

  const r = roof(W / 2 + 0.85, D / 2 + 0.85, 0.45, 0.75, 1.1, mats);
  r.position.y = FLOOR + H;
  grp.add(r);

  /* Covered walkway back to the main building. */
  const walk = new THREE.Group();
  walk.add(box(3.4, 0.12, 1.6, mats.deck, 0, 0.45, 0));
  [-1.4, 1.4].forEach(x => [-0.6, 0.6].forEach(z => walk.add(post(2.2, 0.09, mats.postDark, x, z))));
  walk.add(box(3.8, 0.12, 2.0, mats.tile, 0, 2.28, 0));
  walk.position.set(-3.9, 0, 0.4);
  grp.add(walk);

  /* Open-air tub beside the annex. */
  const tub = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.7, 16), mats.timber);
  tub.position.set(2.4, 0.55, 3.4);
  tub.castShadow = true;
  grp.add(tub);
  const tubWater = new THREE.Mesh(new THREE.CircleGeometry(0.95, 20), mats.water);
  tubWater.rotation.x = -Math.PI / 2;
  tubWater.position.set(2.4, 0.86, 3.4);
  grp.add(tubWater);

  grp.position.set(8.6, 0, -1.6);
  return grp;
}

/* Engawa: the veranda along the garden face. */
function buildEngawa(mats) {
  const grp = new THREE.Group();
  const W = 13.2, D = 2.2, Y = 0.55;

  const deck = box(W, 0.16, D, mats.deck, 0, Y, 4.6);
  grp.add(deck);

  /* Plank lines. */
  for (let i = 0; i <= 14; i++) {
    const x = -W / 2 + (W / 14) * i;
    grp.add(box(0.03, 0.18, D, mats.timber, x, Y + 0.01, 4.6));
  }

  /* Step stone down to the moss. */
  const step = box(1.8, 0.28, 0.9, mats.stone, -1.6, 0.14, 6.0);
  grp.add(step);

  /* Support posts under the overhang. */
  [-6.0, -2.0, 2.0, 6.0].forEach(x => {
    grp.add(post(2.9, 0.11, mats.postDark, x, 5.5));
  });
  grp.add(box(W, 0.16, 0.16, mats.timber, 0, 2.9, 5.5));

  return grp;
}

/* Torii gate marking the sando approach. */
function buildTorii(mats) {
  const grp = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x8b3a2a, roughness: 0.85 });
  const H = 4.2, span = 3.2;

  [-1, 1].forEach(s => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.27, H, 12), mat);
    p.position.set(s * span / 2, H / 2, 0);
    p.rotation.z = -s * 0.028;
    p.castShadow = true;
    grp.add(p);
  });

  const kasagi = new THREE.Mesh(new THREE.BoxGeometry(span + 1.7, 0.26, 0.5), mat);
  kasagi.position.y = H + 0.05;
  kasagi.castShadow = true;
  grp.add(kasagi);

  const shimagi = new THREE.Mesh(new THREE.BoxGeometry(span + 1.1, 0.2, 0.4), mat);
  shimagi.position.y = H - 0.25;
  grp.add(shimagi);

  const nuki = new THREE.Mesh(new THREE.BoxGeometry(span + 0.7, 0.22, 0.34), mat);
  nuki.position.y = H - 1.0;
  nuki.castShadow = true;
  grp.add(nuki);

  const gaku = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.62, 0.14), mats.postDark);
  gaku.position.y = H - 0.62;
  grp.add(gaku);

  grp.position.set(-13.4, 0, 8.6);
  grp.rotation.y = 0.34;
  return grp;
}

/* Moss garden: pond, planting, boundary hedge. */
function buildGarden(mats) {
  const grp = new THREE.Group();
  const rnd = seeded(1917);

  /* Pond. */
  const pond = new THREE.Mesh(new THREE.CircleGeometry(3.1, 36), mats.water);
  pond.rotation.x = -Math.PI / 2;
  pond.scale.set(1.55, 1, 1);
  pond.position.set(-3.2, 0.035, 10.4);
  grp.add(pond);

  const rimGeo = new THREE.DodecahedronGeometry(0.42, 0);
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    const s = new THREE.Mesh(rimGeo, mats.stone);
    s.position.set(-3.2 + Math.cos(a) * 4.9, 0.12, 10.4 + Math.sin(a) * 3.25);
    s.rotation.set(rnd(), rnd() * Math.PI, rnd());
    s.scale.setScalar(0.55 + rnd() * 0.6);
    s.castShadow = true;
    s.receiveShadow = true;
    grp.add(s);
  }

  /* Moss mounds. */
  const moundGeo = new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(moundGeo, mats.grass);
    m.position.set(-18 + rnd() * 32, -0.06, 8 + rnd() * 9);
    m.scale.set(1.4 + rnd() * 2.0, 0.16 + rnd() * 0.2, 1.4 + rnd() * 2.0);
    m.receiveShadow = true;
    grp.add(m);
  }

  /* Cedars along the back and flanks. */
  const cedarSpots = [
    [-21, -7], [-17, -12], [-9, -15], [1, -16.5], [11, -15],
    [19, -10.5], [23, -3], [-24, 1], [25, 4], [-22, 15], [24, 15]
  ];
  cedarSpots.forEach(([x, z]) => grp.add(cedarTree(x, z, 0.8 + rnd() * 0.6, mats, rnd)));

  /* Maples in the garden. */
  /* Set back from the engawa so the veranda stays in clear view. */
  const mapleSpots = [[-11.5, 12.6], [1.0, 14.4], [11.5, 11.0], [-16.0, 5.0]];
  mapleSpots.forEach(([x, z]) => grp.add(mapleTree(x, z, 0.72 + rnd() * 0.35, mats, rnd)));

  /* Clipped hedge along the road edge. */
  for (let i = 0; i < 11; i++) {
    const h = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.8, 0.9), mats.grass);
    h.position.set(-13 + i * 2.6, 0.4, 19.0);
    h.castShadow = true;
    h.receiveShadow = true;
    grp.add(h);
  }
  return grp;
}

function cedarTree(x, z, scale, mats, rnd) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 3.2, 6), mats.timber);
  trunk.position.y = 1.6;
  trunk.castShadow = true;
  g.add(trunk);
  for (let i = 0; i < 3; i++) {
    const r = 2.2 - i * 0.55, h = 3.4 - i * 0.5;
    const c = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), mats.cedar);
    c.position.y = 2.6 + i * 1.85;
    c.rotation.y = rnd() * Math.PI;
    c.castShadow = true;
    g.add(c);
  }
  g.position.set(x, 0, z);
  g.scale.setScalar(scale);
  return g;
}

function mapleTree(x, z, scale, mats, rnd) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 2.0, 6), mats.timber);
  trunk.position.y = 1.0;
  trunk.castShadow = true;
  g.add(trunk);
  const blob = new THREE.IcosahedronGeometry(1, 0);
  for (let i = 0; i < 6; i++) {
    const b = new THREE.Mesh(blob, mats.maple);
    b.position.set((rnd() - 0.5) * 2.2, 2.2 + rnd() * 1.2, (rnd() - 0.5) * 2.2);
    b.scale.setScalar(0.7 + rnd() * 0.65);
    b.rotation.set(rnd(), rnd(), rnd());
    b.castShadow = true;
    g.add(b);
  }
  g.position.set(x, 0, z);
  g.scale.setScalar(scale);
  return g;
}

/* Stone lanterns — unlit by day, glowing in dark mode. */
function buildLanterns(mats) {
  const group = new THREE.Group();
  const lights = [];
  const flames = [];
  const spots = [[-6.8, 8.2], [-0.4, 12.0], [6.2, 9.2], [-12.2, 7.2]];

  spots.forEach(([x, z]) => {
    const l = new THREE.Group();
    l.add(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.3, 8), mats.stone).translateY(0.15));
    l.add(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.9, 8), mats.stone).translateY(0.75));
    l.add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.34, 0.18, 8), mats.stone).translateY(1.3));

    const boxMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.5, 8), mats.stone);
    boxMesh.position.y = 1.64;
    l.add(boxMesh);

    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xffc477, transparent: true, opacity: 0 })
    );
    flame.position.y = 1.64;
    flame.visible = false;
    l.add(flame);
    flames.push(flame);

    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.42, 8), mats.stone);
    cap.position.y = 2.08;
    l.add(cap);
    l.add(new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), mats.stone).translateY(2.32));

    const pt = new THREE.PointLight(0xffb066, 0, 9, 2);
    pt.position.y = 1.64;
    l.add(pt);
    lights.push(pt);

    l.traverse(o => { if (o.isMesh) o.castShadow = true; });
    l.position.set(x, 0, z);
    l.scale.setScalar(0.82);
    group.add(l);
  });

  return { group, lights, flames };
}

/* A soft round sprite, drawn once — square points read as glitches. */
function petalTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.75)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* Drifting plum petals — 白梅. */
function buildPetals() {
  const COUNT = 90;
  const pos = new Float32Array(COUNT * 3);
  const vel = [];
  const rnd = seeded(404);

  for (let i = 0; i < COUNT; i++) {
    pos[i * 3]     = (rnd() - 0.5) * 44;
    pos[i * 3 + 1] = rnd() * 15 + 3;
    pos[i * 3 + 2] = (rnd() - 0.5) * 40 + 2;
    vel.push({ y: 0.28 + rnd() * 0.35, x: (rnd() - 0.5) * 0.5, p: rnd() * 6.28 });
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const points = new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.22, sizeAttenuation: true, transparent: true, opacity: 0.75,
    depthWrite: false, map: petalTexture(), alphaTest: 0.02
  }));
  points.frustumCulled = false;

  let t = 0;
  function update(dt) {
    t += dt;
    const a = geo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      const v = vel[i];
      a[i * 3 + 1] -= v.y * dt;
      a[i * 3]     += Math.sin(t * 0.8 + v.p) * v.x * dt;
      if (a[i * 3 + 1] < 0.2) {
        a[i * 3 + 1] = 15 + rnd() * 4;
        a[i * 3]     = (rnd() - 0.5) * 40;
        a[i * 3 + 2] = (rnd() - 0.5) * 36 + 4;
      }
    }
    geo.attributes.position.needsUpdate = true;
  }

  return { points, update };
}

/* ============================================================
   Boot — after every declaration above is in scope.
   ============================================================ */

const stage = document.getElementById('model-3d');
if (stage) init(stage);
