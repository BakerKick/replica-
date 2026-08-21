/* ============================================================
   SHIRAUME LODGE — Interactions
   Base behaviors from the approved concept site, plus features
   merged in from the interactive prototype (index 2):
   splash, custom cursor, scroll progress, page transitions,
   hero ticker, counters, room detail views, booking, lightbox.
   ============================================================ */

// ─── LANGUAGE TOGGLE ────────────────────────────────────────
const html = document.documentElement;
function setLang(lang) {
  html.setAttribute('data-lang', lang);
  html.setAttribute('lang', lang === 'ja' ? 'ja' : 'en');
}
document.getElementById('lang-toggle').addEventListener('click', () => {
  setLang(html.getAttribute('data-lang') === 'ja' ? 'en' : 'ja');
});
document.getElementById('mobile-lang-toggle').addEventListener('click', () => {
  setLang(html.getAttribute('data-lang') === 'ja' ? 'en' : 'ja');
  closeMenu();
});

// ─── DAY / NIGHT THEME ──────────────────────────────────────
const themeToggleBtn = document.getElementById('theme-toggle');
const sunSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>';
const moonSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>';
// Unified day/night: real Japan time on load, moon button flips it, choice remembered.
const heroEl = document.getElementById('hero');
function japanIsNight() {
  const h = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', hour: '2-digit', hour12: false }).format(new Date()), 10);
  return h >= 18 || h < 6; // 6pm–6am
}
function applyMode(night) {
  html.classList.toggle('dark', night);
  heroEl.classList.toggle('show-night', night);
  themeToggleBtn.innerHTML = night ? sunSvg : moonSvg;
  themeToggleBtn.setAttribute('aria-label', night ? 'Switch to light mode' : 'Switch to dark mode');
}
let savedMode = null;
try { savedMode = localStorage.getItem('shiraume-hero-mode'); } catch (e) {}
heroEl.classList.add('no-anim');
applyMode(savedMode ? savedMode === 'night' : japanIsNight());
requestAnimationFrame(() => requestAnimationFrame(() => heroEl.classList.remove('no-anim')));
themeToggleBtn.addEventListener('click', () => {
  const night = !html.classList.contains('dark');
  applyMode(night);
  try { localStorage.setItem('shiraume-hero-mode', night ? 'night' : 'day'); } catch (e) {}
});

// ─── HEADER SCROLL STATE ────────────────────────────────────
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20 || VIEW === 'room');
}, { passive: true });

// ─── MOBILE MENU ────────────────────────────────────────────
const mobileMenu = document.getElementById('mobile-menu');
function openMenu() {
  mobileMenu.classList.add('open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
document.getElementById('mobile-menu-btn').addEventListener('click', openMenu);
document.getElementById('mobile-close').addEventListener('click', closeMenu);
document.getElementById('mobile-logo-close').addEventListener('click', (e) => { e.preventDefault(); closeMenu(); });
document.querySelectorAll('.mobile-nav-link').forEach(link => link.addEventListener('click', closeMenu));

// ─── FEATURE FLAGS / ENVIRONMENT ────────────────────────────
const HERO_ENHANCED = document.body.classList.contains('hero-enhanced');
const REDUCED_MOTION = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_POINTER = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

// ─── CUSTOM CURSOR ──────────────────────────────────────────
(function () {
  const c = document.getElementById('cursor');
  if (!c || !FINE_POINTER) return;
  document.body.classList.add('cursor-on');
  document.addEventListener('mousemove', (e) => {
    c.style.left = e.clientX + 'px';
    c.style.top = e.clientY + 'px';
  });
  // Delegated so dynamically inserted room content also grows the cursor
  document.addEventListener('mouseover', (e) => {
    const t = e.target.closest('button, a, select, [onclick], [data-room], .other-link, .gal-grid img, .splash-skip');
    c.classList.toggle('grow', !!t);
  });
})();

// ─── SPLASH SEQUENCE ────────────────────────────────────────
let splashDone = false;
const TAGLINE_JP = '巡礼の宿る　山のほとり';
const TAGLINE_EN = 'Where the pilgrimage rests';

function buildTickerChars(el, text) {
  el.innerHTML = '';
  text.split('').forEach((ch) => {
    const s = document.createElement('span');
    s.className = 'ticker-char';
    s.textContent = (ch === ' ' || ch === '　') ? ' ' : ch;
    el.appendChild(s);
  });
  return el.querySelectorAll('.ticker-char');
}

function animateTagline(text, onDone, hold, dir, speed) {
  const el = document.getElementById('splash-tagline');
  if (!el) return;
  const els = buildTickerChars(el, text);
  const n = els.length;
  const perChar = speed || 150;
  for (let i = 0; i < n; i++) {
    const order = (dir === 'ltr') ? i : (n - 1 - i);
    setTimeout(() => els[i].classList.add('show'), order * perChar);
  }
  if (onDone) setTimeout(onDone, n * perChar + (hold != null ? hold : 700));
}

function hideTagline(onDone) {
  const el = document.getElementById('splash-tagline');
  if (!el) { if (onDone) onDone(); return; }
  const els = el.querySelectorAll('.ticker-char');
  els.forEach((s, i) => setTimeout(() => { s.classList.remove('show'); s.classList.add('hide'); }, i * 22));
  if (onDone) setTimeout(onDone, els.length * 22 + 180);
}

// ─── THE GATE ───────────────────────────────────────────────
// Which gate the splash draws. 'torii' traces the shrine gate that stands
// in the hero photograph, aligned onto it; 'katomado' traces the temple
// window that frames the two feature photographs. One word to switch.
const SPLASH_GATE = 'torii';

// The katomado silhouette, in fractions of its own box.
const KATOMADO = [
  [0, 1], ['L', 0, 0.42],
  ['C', 0.015, 0.2607, 0.11, 0.1666, 0.25, 0.1195],
  ['C', 0.375, 0.0833, 0.44, 0.0543, 0.5, 0],
  ['C', 0.56, 0.0543, 0.625, 0.0833, 0.75, 0.1195],
  ['C', 0.89, 0.1666, 0.985, 0.2607, 1, 0.42],
  ['L', 1, 1],
];

function katomadoPath(x, y, w, h) {
  const px = (u) => (x + u * w).toFixed(2);
  const py = (v) => (y + v * h).toFixed(2);
  let d = `M${px(KATOMADO[0][0])},${py(KATOMADO[0][1])}`;
  for (let i = 1; i < KATOMADO.length; i++) {
    const seg = KATOMADO[i];
    const nums = [];
    for (let k = 1; k < seg.length; k += 2) nums.push(`${px(seg[k])},${py(seg[k + 1])}`);
    d += ` ${seg[0]}${nums.join(' ')}`;
  }
  return d + ' Z';
}

// ─── THE TORII ──────────────────────────────────────────────
// Traced off the gate standing in hero-day.jpg. Every number is a fraction
// of the photograph itself (1376 x 752), so there is one conversion between
// here and the screen and one place for an error to hide.
//
// The heights were settled by drawing candidate horizontals straight across
// the picture and reading which line landed on which member — an earlier
// tracing put the crossbeam on a shadow band below the real one, and that
// was invisible until the lines were laid on bare.
//
// hero-night.jpg is framed identically, to within a third of a percent, so
// one tracing serves both.
const TORII = {
  span: { u0: 0.245, u1: 0.755, vTop: 0.024, vFoot: 0.783 },

  // The top is two members: the kasagi, which lifts at both ends, and the
  // shimaki packed beneath it following the same sweep. Their ends are cut
  // on the slant, which is why the underside is shorter than the top.
  //
  // Each sweep is a cubic, not a quadratic. A quadratic bends evenly and
  // gave a shallow bow; the real sori is flat across the middle and lifts
  // hard in the last part of the span, which is what two controls buy.
  top: {
    uL: 0.245, uR: 0.755, uLb: 0.258, uRb: 0.742, cIn: 0.17,
    topEnd: 0.024, topMid: 0.060,   // upper face
    midEnd: 0.056, midMid: 0.096,   // kasagi over shimaki
    botEnd: 0.086, botMid: 0.127,   // underside
  },

  // The rope slung under the crossbeam, with its paper streamers. It is the
  // most particular thing about this gate and the reason it reads as this
  // torii rather than a torii.
  rope: {
    v0End: 0.248, v0Mid: 0.256, v1End: 0.262, v1Mid: 0.270,
    shide: [0.12, 0.30, 0.50, 0.70, 0.88], shideW: 0.0038, shideH: 0.046,   // along the rope, 0..1
  },

  // The crossbeam reads as passing in front of both posts, so the posts are
  // drawn only below it and the beam is unbroken.
  nuki: { u0: 0.272, u1: 0.700, u0b: 0.276, u1b: 0.697, v0: 0.184, v1: 0.237 },

  // The name board hangs between the two, in front of the crossbeam.
  plaque: { u0: 0.478, u1: 0.520, v0: 0.085, v1: 0.215, inset: 0.005 },

  // Each post head widens into a collar that meets the underside of the
  // shimaki and stands on the crossbeam — so its lower edge is not drawn.
  daiwa: { v0: 0.125, v1: 0.185, r: 0.009, left: [0.344, 0.402], right: [0.598, 0.657] },

  // Shafts, from under the crossbeam to the plinths. They lean, as a real
  // torii does, so the opening between them is a quadrilateral.
  shaftTopV: 0.237, shaftBotV: 0.775,
  left:  { outTop: 0.3521, outBot: 0.3431, inTop: 0.3942, inBot: 0.3961 },
  right: { inTop: 0.6074, inBot: 0.6123, outTop: 0.6510, outBot: 0.6608 },

  base: { left:  { u0: 0.334, u1: 0.408, v0: 0.735, v1: 0.783 },
          right: { u0: 0.601, u1: 0.672, v0: 0.723, v1: 0.772 } },
};

// Follow a leaning shaft edge to any depth, including past the plinths —
// which the opening needs, since it runs off the bottom of the screen.
function postEdge(top, bot, v) {
  return top + (bot - top) * (v - TORII.shaftTopV) / (TORII.shaftBotV - TORII.shaftTopV);
}

// `f` is where the photograph is painted: {x, y, w, h} in screen pixels.
// Only edges that can actually be seen are drawn — where one member passes
// in front of another the hidden line is left out, which is the difference
// between a drawing of a gate and a wireframe of one.
function toriiParts(f) {
  const X = (u) => (f.x + u * f.w).toFixed(2);
  const Y = (v) => (f.y + v * f.h).toFixed(2);
  const T = TORII.top, N = TORII.nuki, P = TORII.plaque, D = TORII.daiwa, B = TORII.base;
  const ctrl = (endV, midV) => 2 * midV - endV;   // quadratic through three points

  // A cubic whose two controls sit at cIn from each end, lifted so the curve
  // passes through midV at the half-way point.
  const sweep = (uA, uB, endV, midV) => {
    const c = (8 * midV - endV - endV) / 6;
    return `M${X(uA)},${Y(endV)} C${X(uA + T.cIn)},${Y(c)} ${X(uB - T.cIn)},${Y(c)} ${X(uB)},${Y(endV)}`;
  };
  const sweepBack = (uA, uB, endV, midV) => {
    const c = (8 * midV - endV - endV) / 6;
    return `C${X(uB - T.cIn)},${Y(c)} ${X(uA + T.cIn)},${Y(c)} ${X(uA)},${Y(endV)}`;
  };

  const topAssembly =
    sweep(T.uL, T.uR, T.topEnd, T.topMid) +
    ` L${X(T.uRb)},${Y(T.botEnd)} ` +
    sweepBack(T.uLb, T.uRb, T.botEnd, T.botMid) + ' Z';

  const shimakiLine = sweep(T.uL + 0.006, T.uR - 0.006, T.midEnd, T.midMid);

  const nuki =
    `M${X(N.u0)},${Y(N.v0)} L${X(N.u1)},${Y(N.v0)} L${X(N.u1b)},${Y(N.v1)} L${X(N.u0b)},${Y(N.v1)} Z`;

  const rect = (u0, u1, v0, v1) =>
    `M${X(u0)},${Y(v0)} L${X(u1)},${Y(v0)} L${X(u1)},${Y(v1)} L${X(u0)},${Y(v1)} Z`;

  const plaque = rect(P.u0, P.u1, P.v0, P.v1) + ' ' +
                 rect(P.u0 + P.inset, P.u1 - P.inset, P.v0 + P.inset * 2, P.v1 - P.inset * 2);

  // Collar: shoulders rounded, lower edge omitted where it meets the beam.
  const collar = (u) => {
    const r = D.r;
    return `M${X(u[0])},${Y(D.v1)} L${X(u[0])},${Y(D.v0 + r)}` +
           ` Q${X(u[0])},${Y(D.v0)} ${X(u[0] + r)},${Y(D.v0)}` +
           ` L${X(u[1] - r)},${Y(D.v0)}` +
           ` Q${X(u[1])},${Y(D.v0)} ${X(u[1])},${Y(D.v0 + r)}` +
           ` L${X(u[1])},${Y(D.v1)}`;
  };

  // Shaft: two edges only. Its head is behind the beam and its foot stands
  // on the plinth, so neither is drawn — and the edges stop at the plinth's
  // top rather than running down through it.
  const shaft = (p, plinthV) => {
    const e = (top, bot) => postEdge(top, bot, plinthV);
    return `M${X(p.outTop)},${Y(TORII.shaftTopV)} L${X(e(p.outTop, p.outBot))},${Y(plinthV)}` +
           ` M${X(p.inTop)},${Y(TORII.shaftTopV)} L${X(e(p.inTop, p.inBot))},${Y(plinthV)}`;
  };

  // The rope hangs between the shafts, sagging under its own weight, with
  // folded paper streamers along it. Drawn last, the way it is hung last.
  const R = TORII.rope;
  const lIn = postEdge(TORII.left.inTop, TORII.left.inBot, R.v0End);
  const rIn = postEdge(TORII.right.inTop, TORII.right.inBot, R.v0End);
  const sag = (endV, midV) => (8 * midV - endV - endV) / 6;
  const rope =
    `M${X(lIn)},${Y(R.v0End)} C${X(lIn + 0.09)},${Y(sag(R.v0End, R.v0Mid))} ${X(rIn - 0.09)},${Y(sag(R.v0End, R.v0Mid))} ${X(rIn)},${Y(R.v0End)}` +
    ` L${X(rIn)},${Y(R.v1End)}` +
    ` C${X(rIn - 0.09)},${Y(sag(R.v1End, R.v1Mid))} ${X(lIn + 0.09)},${Y(sag(R.v1End, R.v1Mid))} ${X(lIn)},${Y(R.v1End)} Z`;

  // Each streamer: a narrow strip folded twice, stepping left then right.
  const shide = R.shide.map((t) => {
    const u = lIn + (rIn - lIn) * t;
    const hang = R.v1End + (R.v1Mid - R.v1End) * Math.sin(Math.PI * t);   // follows the sag
    const w = R.shideW, h = R.shideH;
    return `M${X(u - w)},${Y(hang)} L${X(u + w)},${Y(hang)} L${X(u + w)},${Y(hang + h * 0.34)}` +
           ` L${X(u)},${Y(hang + h * 0.34)} L${X(u)},${Y(hang + h * 0.67)}` +
           ` L${X(u + w)},${Y(hang + h * 0.67)} L${X(u + w)},${Y(hang + h)} L${X(u - w)},${Y(hang + h)} Z`;
  }).join(' ');

  // Raised the way a gate is raised: plinths, shafts, collars, crossbeam,
  // lintel, board — and the rope hung last.
  return [
    { d: rect(B.left.u0, B.left.u1, B.left.v0, B.left.v1),     delay: 0.22, dur: 0.30 },
    { d: rect(B.right.u0, B.right.u1, B.right.v0, B.right.v1), delay: 0.30, dur: 0.30 },
    { d: shaft(TORII.left, B.left.v0),   delay: 0.45, dur: 0.85 },
    { d: shaft(TORII.right, B.right.v0), delay: 0.54, dur: 0.85 },
    { d: collar(D.left),      delay: 1.05, dur: 0.32 },
    { d: collar(D.right),     delay: 1.11, dur: 0.32 },
    { d: nuki,                delay: 1.25, dur: 0.50 },
    { d: topAssembly,         delay: 1.60, dur: 0.80 },
    { d: shimakiLine,         delay: 2.05, dur: 0.45 },
    { d: plaque,              delay: 2.25, dur: 0.40 },
    { d: rope,                delay: 2.45, dur: 0.45 },
    { d: shide,               delay: 2.72, dur: 0.38 },
  ];
}

// What opens: the space you would walk through — the inner faces of the two
// shafts, the underside of the crossbeam, and the bottom of the screen.
function toriiOpening(f, viewH) {
  const X = (u) => f.x + u * f.w, Y = (v) => f.y + v * f.h;
  const n = (v) => v.toFixed(2);
  const vTop = TORII.nuki.v1;
  const vBot = (viewH + 80 - f.y) / f.h;
  const lT = postEdge(TORII.left.inTop, TORII.left.inBot, vTop);
  const lB = postEdge(TORII.left.inTop, TORII.left.inBot, vBot);
  const rT = postEdge(TORII.right.inTop, TORII.right.inBot, vTop);
  const rB = postEdge(TORII.right.inTop, TORII.right.inBot, vBot);
  return {
    d: `M${n(X(lT))},${n(Y(vTop))} L${n(X(rT))},${n(Y(vTop))}` +
       ` L${n(X(rB))},${n(Y(vBot))} L${n(X(lB))},${n(Y(vBot))} Z`,
    cx: X((lT + rT) / 2),
    cy: Y(vTop + (Math.min(vBot, 1.15) - vTop) * 0.4),
  };
}

// Where the hero paints the photograph. background-size:cover, so the same
// arithmetic reproduces the crop exactly and the tracing lands on the stone.
const HERO_IMG = { w: 1376, h: 752 };
function heroCover() {
  const hero = document.getElementById('hero');
  if (!hero) return null;
  const r = hero.getBoundingClientRect();
  if (!r.width || !r.height) return null;
  const scale = Math.max(r.width / HERO_IMG.w, r.height / HERO_IMG.h);
  const dw = HERO_IMG.w * scale, dh = HERO_IMG.h * scale;
  return { x: r.left + (r.width - dw) / 2, y: r.top + (r.height - dh) / 2, w: dw, h: dh };
}

// On a narrow window the photograph is scaled up hard to fill a tall frame,
// which pushes both posts off the sides. There the gate is composed for the
// screen instead — the same drawing, given a frame invented to suit it.
//
// It is sized from the words rather than from the window: the opening has to
// clear the wordmark, and the posts have to run below it, or the beams cut
// straight through the name. A gate wider than the screen is fine — you are
// simply standing closer to it — but a gate that crosses the logo is not.
function fittedFrame(vw, vh) {
  const S = TORII.span;
  let top = vh * 0.5, bot = vh * 0.5, left = vw * 0.5, right = vw * 0.5;
  document.querySelectorAll('.splash-logo, .splash-tagline').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) return;
    top = Math.min(top, r.top); bot = Math.max(bot, r.bottom);
    left = Math.min(left, r.left); right = Math.max(right, r.right);
  });

  // Only the wordmark has to clear the posts. The tagline sitting across
  // them is fine — it reads as words on the path in front of the gate —
  // and insisting it fit inside the opening made the gate enormous.
  let logoW = 0;
  const lg = document.querySelector('.splash-logo');
  if (lg) logoW = lg.getBoundingClientRect().width;

  const openW = TORII.right.inTop - TORII.left.inTop;   // opening, as a fraction of the photograph
  const spanW = S.u1 - S.u0;
  let w = Math.max((logoW + 44) / openW, (vw * 0.98) / spanW);
  w = Math.min(w, (vw * 1.3) / spanW);
  const h = w * (HERO_IMG.h / HERO_IMG.w);

  let y = top - 38 - TORII.nuki.v1 * h;                 // crossbeam clears the wordmark
  const foot = y + TORII.shaftBotV * h;
  if (foot < bot + 24) y += (bot + 24 - foot);          // posts reach past the words
  if (y + S.vTop * h < 26) y = 26 - S.vTop * h;         // lintel stays on screen
  return { x: vw / 2 - 0.5015 * w, y, w, h };
}

function layoutGate() {
  const gate = document.getElementById('gate');
  const draw = document.getElementById('gate-draw');
  const hole = document.getElementById('gate-hole');
  if (!gate || !draw || !hole) return;
  const vw = window.innerWidth, vh = window.innerHeight;

  gate.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
  [document.getElementById('gate-rect'), document.getElementById('gate-fill')].forEach((r) => {
    if (!r) return;
    r.setAttribute('x', 0); r.setAttribute('y', 0);
    r.setAttribute('width', vw); r.setAttribute('height', vh);
  });

  const setOrigin = (x, y) => {
    gate.style.setProperty('--gx', x + 'px');
    gate.style.setProperty('--gy', y + 'px');
  };

  if (SPLASH_GATE === 'katomado') {
    let top = vh * 0.5, left = vw * 0.5, right = vw * 0.5;
    document.querySelectorAll('.splash-logo, .splash-tagline').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) return;
      top = Math.min(top, r.top); left = Math.min(left, r.left); right = Math.max(right, r.right);
    });
    const w = Math.min(Math.max(right - left + 190, vw * 0.42), vw * 0.86, 660);
    const y = Math.max(Math.min(top - 120, vh * 0.34), vh * 0.06);
    const h = vh - y + 44;
    const x = (left + right) / 2 - w / 2;
    const d = katomadoPath(x, y, w, h);
    hole.setAttribute('d', d);
    draw.innerHTML = `<path d="${d}" pathLength="1" style="--dl:0.45s;--dd:1.75s"></path>`;
    setOrigin(x + w / 2, y + h * 0.43);
    return;
  }

  // Lay the tracing over the photograph when the whole gate is on screen;
  // compose it for the window when the crop has pushed the posts off.
  const cov = heroCover();
  const S = TORII.span;
  let frame = cov;
  if (cov) {
    const l = cov.x + S.u0 * cov.w, r = cov.x + S.u1 * cov.w;
    if (l < -vw * 0.02 || r > vw * 1.02) frame = null;
  }
  if (!frame) frame = fittedFrame(vw, vh);

  draw.innerHTML = toriiParts(frame)
    .map((p) => `<path d="${p.d}" pathLength="1" style="--dl:${p.delay}s;--dd:${p.dur}s"></path>`)
    .join('');
  const op = toriiOpening(frame, vh);
  hole.setAttribute('d', op.d);
  setOrigin(op.cx, op.cy);
}

let tickerStarted = false;
function dismissSplash(instant) {
  if (splashDone) return;
  splashDone = true;
  const s = document.getElementById('splash');
  if (s) {
    if (REDUCED_MOTION || instant === true) {
      s.style.display = 'none';
    } else {
      // The hero has to be under the doorway before it opens.
      layoutGate();
      s.classList.add('opening');
      setTimeout(() => { s.style.display = 'none'; }, 2300);
    }
  }
  revealHero();
  if (!tickerStarted) { tickerStarted = true; setTimeout(runTicker, 1200); }
}

function revealHero() {
  if (!HERO_ENHANCED) return;
  document.querySelectorAll('.hero-in').forEach((el) => {
    const order = parseInt(el.getAttribute('data-hero-order')) || 0;
    setTimeout(() => el.classList.add('show'), 150 + order * 180);
  });
}

(function () {
  if (REDUCED_MOTION) { dismissSplash(); return; }

  // The outline starts tracing at 0.55s, so the gate has to know its size
  // before then. Measure once immediately and again once webfonts have
  // settled, since the tagline's width moves when they land.
  layoutGate();
  requestAnimationFrame(layoutGate);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutGate);
  window.addEventListener('resize', () => { if (!splashDone) layoutGate(); });

  setTimeout(() => {
    if (splashDone) return;
    animateTagline(TAGLINE_JP, () => {
      if (splashDone) return;
      hideTagline(() => {
        if (splashDone) return;
        animateTagline(TAGLINE_EN, () => setTimeout(dismissSplash, 300), 300, 'ltr', 28);
      });
    }, 260, null, 80);
  }, 300);
  // Safety: never trap the visitor on the splash
  setTimeout(dismissSplash, 12000);
})();

// ─── HERO VERTICAL TICKER (enhanced hero only) ──────────────
let tLang = 'jp';
let tTimer = null;
function runTicker() {
  if (!HERO_ENHANCED || REDUCED_MOTION) return;
  const col = document.getElementById('ticker-col');
  if (!col) return;
  const text = tLang === 'jp' ? TAGLINE_JP : TAGLINE_EN;
  tLang = (tLang === 'jp') ? 'en' : 'jp';
  const els = buildTickerChars(col, text);
  const n = els.length;
  const perChar = 150;
  for (let i = 0; i < n; i++) {
    setTimeout(() => els[i].classList.add('show'), (n - 1 - i) * perChar);
  }
  const allShownAt = n * perChar;
  const holdTime = 3500;
  setTimeout(() => {
    for (let i = 0; i < n; i++) {
      setTimeout(() => { els[i].classList.remove('show'); els[i].classList.add('hide'); }, (n - 1 - i) * 55);
    }
  }, allShownAt + holdTime);
  clearTimeout(tTimer);
  tTimer = setTimeout(runTicker, allShownAt + holdTime + n * 55 + 600 + 3000);
}

// ─── STAT COUNTERS ──────────────────────────────────────────
(function () {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length || REDUCED_MOTION) return;
  els.forEach((el) => { el.textContent = '0'; });
  let run = false;
  function animate(el, target, duration) {
    const step = target / (duration / 16);
    let cur = 0;
    const timer = setInterval(() => {
      cur += step;
      if (cur >= target) { el.textContent = target; clearInterval(timer); return; }
      el.textContent = Math.floor(cur);
    }, 16);
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && !run) {
        run = true;
        els.forEach((el) => animate(el, parseInt(el.getAttribute('data-count')), 1800));
        obs.disconnect();
      }
    });
  }, { threshold: 0.3 });
  obs.observe(document.querySelector('.stats-bar'));
})();

// ─── SCROLL REVEAL ──────────────────────────────────────────
function initReveal() {
  const els = document.querySelectorAll('.view.active .reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 100);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  els.forEach((el) => { el.classList.remove('visible'); obs.observe(el); });
}
initReveal();

// ─── VIEWS, WIPE & ROUTING ──────────────────────────────────
let VIEW = 'home';
const SITE_TITLE = 'Shiraume Lodge — A Ryokan Concept, Hikosan, Fukuoka';

function wipe(cb) {
  if (REDUCED_MOTION) { cb(); window.scrollTo(0, 0); return; }
  const w = document.getElementById('wipe');
  w.className = 'in';
  setTimeout(() => {
    cb();
    window.scrollTo(0, 0);
    w.className = 'out';
    setTimeout(() => { w.className = ''; }, 520);
  }, 480);
}

function showView(id) {
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  document.getElementById('view-' + id).classList.add('active');
  header.classList.toggle('scrolled', id === 'room' || window.scrollY > 20);
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 76;
  window.scrollTo({ top: top, behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
}

function goHome(sectionId) {
  if (VIEW === 'home') {
    if (sectionId) scrollToSection(sectionId);
    else window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
    return;
  }
  wipe(() => {
    VIEW = 'home';
    document.title = SITE_TITLE;
    showView('home');
    initReveal();
    if (sectionId) setTimeout(() => scrollToSection(sectionId), 60);
  });
}

function goRoom(slug) {
  if (!ROOMS[slug]) return;
  wipe(() => {
    VIEW = 'room';
    populateRoom(slug);
    showView('room');
    const bf = document.getElementById('bk-form');
    const bs = document.getElementById('bk-success');
    if (bf) bf.style.display = '';
    if (bs) bs.classList.remove('show');
    initReveal();
  });
}

// Route all in-page anchors through the view system so navigation
// works from the room detail view too.
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    if (!id) { goHome(); return; }
    goHome(id);
  });
});
document.querySelectorAll('[data-room]').forEach((el) => {
  el.addEventListener('click', () => goRoom(el.getAttribute('data-room')));
});

// ─── ROOM DATA (copy follows the approved concept site) ─────
const ROOMS = {
  koke: {
    nameEn: 'Koke', nameJp: '苔',
    eyebrow: 'Room 01 · 客室01',
    type: 'First Floor · Japandi Room · 1階・ジャパンディルーム',
    size: '12-mat Tatami', sizeShort: '12畳',
    price: 'From ¥22,000 / night · inc. breakfast',
    priceBadge: 'From ¥22,000 / night',
    cap: 4,
    lead: 'A full 12-mat tatami room opening directly onto the garden, with a private ensuite ofuro bath finished in warm stone.',
    descEn: 'The largest of the three first-floor rooms, and the most traditional in feel. The Japandi interior blends Japanese and Scandinavian sensibilities — natural materials, quiet palettes, and direct access to the garden. Like every room at Shiraume, Koke includes yukata on arrival, premium toiletries, high-quality bedding, Wi-Fi, television, and an in-room coffee and tea setup.',
    descJp: '庭へと直接開かれた、12畳の和室。温かみのある石造りの専用露天風呂付き。1階の3室の中で最も広く、最も和の趣を残した客室です。浴衣、上質なアメニティ、寝具、Wi-Fi、テレビ、コーヒー・お茶セットを完備しています。',
    feats: ['12-Mat Tatami · 12畳', 'Garden Access · 庭へのアクセス', 'Ensuite Ofuro · 専用露天風呂', 'Yukata · 浴衣', 'Wi-Fi & TV · Wi-Fi・テレビ', 'Coffee & Tea Setup · コーヒー・お茶セット'],
    bgImg: 'assets/img/room-koke.jpg',
    thumb: 'assets/img/room-koke.jpg',
    gallery: ['assets/img/room-koke.jpg', 'assets/img/s2-room-koke.jpg']
  },
  shizuka: {
    nameEn: 'Shizuka', nameJp: '静',
    eyebrow: 'Room 02 · 客室02',
    type: 'First Floor · Japandi Room · 1階・ジャパンディルーム',
    size: 'Platform Bed + Tatami', sizeShort: '高床式ベッド',
    price: 'From ¥22,000 / night · inc. breakfast',
    priceBadge: 'From ¥22,000 / night',
    cap: 3,
    lead: 'A raised platform bed sits across hardwood and tatami flooring, with room to add futons for additional guests.',
    descEn: 'Shizuka pairs a raised platform bed with hardwood and tatami flooring — a Japandi sensibility that feels neither purely traditional nor modern, but specifically of this place. Direct garden access and a private ensuite ofuro bath. A futon can be added for a third guest.',
    descJp: 'フローリングと畳を組み合わせた床の上に、高床式のベッドを配置。布団を追加することも可能です。庭への直接アクセスと専用露天風呂付き。',
    feats: ['Platform Bed · 高床式ベッド', 'Garden Access · 庭へのアクセス', 'Ensuite Ofuro · 専用露天風呂', 'Futon Option (3rd guest) · 布団追加可', 'Yukata · 浴衣', 'Wi-Fi & TV · Wi-Fi・テレビ'],
    bgImg: 'assets/img/room-shizuka.jpg',
    thumb: 'assets/img/room-shizuka.jpg',
    gallery: ['assets/img/room-shizuka.jpg', 'assets/img/s2-room-shizuka.jpg']
  },
  yamabiko: {
    nameEn: 'Yamabiko', nameJp: '山彦',
    eyebrow: 'Room 03 · 客室03',
    type: 'First Floor · Japandi Room · 1階・ジャパンディルーム',
    size: 'Platform Bed + Tatami', sizeShort: '高床式ベッド',
    price: 'From ¥22,000 / night · inc. breakfast',
    priceBadge: 'From ¥22,000 / night',
    cap: 3,
    lead: 'The third Japandi room, following the same raised platform bed and hardwood-and-tatami layout as Room 02, with its own garden outlook.',
    descEn: 'Yamabiko follows the platform-bed layout of Shizuka with its own garden outlook and a private ensuite ofuro bath. Soft, filtered light enters through shoji screens throughout the day. A futon can be added for a third guest.',
    descJp: '客室02と同様、高床式ベッドとフローリング・畳を組み合わせた3室目のジャパンディルーム。専用の庭の眺めと露天風呂付き。布団追加で3名まで対応。',
    feats: ['Platform Bed · 高床式ベッド', 'Garden Outlook · 庭の眺め', 'Ensuite Ofuro · 専用露天風呂', 'Futon Option (3rd guest) · 布団追加可', 'Yukata · 浴衣', 'Wi-Fi & TV · Wi-Fi・テレビ'],
    bgImg: 'assets/img/room-yamabiko.jpg',
    thumb: 'assets/img/room-yamabiko.jpg',
    gallery: ['assets/img/room-yamabiko.jpg', 'assets/img/s2-room-yamabiko.jpg']
  },
  hinoki: {
    nameEn: 'Hinoki', nameJp: '檜',
    eyebrow: 'Room 04 · 客室04',
    type: 'Second Floor · Traditional Room · 2階・伝統的な客室',
    size: '10-mat Tatami', sizeShort: '10畳',
    price: 'From ¥30,000 / night · inc. breakfast',
    priceBadge: 'From ¥30,000 / night',
    cap: 6,
    lead: 'A 10-mat tatami room within the inn’s original second-floor structure, comfortably suited to up to six guests.',
    descEn: 'Original ceiling beams remain exposed above the sleeping area, and futons are made up on the floor in traditional style. Second-floor guests additionally share the balcony, engawa, and the mountain-viewing lounge — a natural gathering space for families and small groups. Private ensuite ofuro bath.',
    descJp: '宿の元の2階構造をそのまま残した10畳の和室。最大6名まで快適にご利用いただけます。寝室の上には当時の天井梁が残されています。バルコニー、縁側、山を望むラウンジを共有。専用露天風呂付き。',
    feats: ['10-Mat Tatami · 10畳', 'Up to 6 Guests · 最大6名', 'Original Roof Beams · 元の梁', 'Shared Balcony & Engawa · バルコニー・縁側', 'Mountain-viewing Lounge · 山望ラウンジ', 'Ensuite Ofuro · 専用露天風呂', 'Yukata · 浴衣'],
    bgImg: 'assets/img/room-hinoki.jpg',
    thumb: 'assets/img/room-hinoki.jpg',
    gallery: ['assets/img/room-hinoki.jpg', 'assets/img/s2-room-hinoki.jpg']
  },
  higashiyama: {
    nameEn: 'Higashiyama', nameJp: '東山',
    eyebrow: 'Room 05 · 客室05',
    type: 'Second Floor · Traditional Room · 2階・伝統的な客室',
    size: '18-mat Tatami', sizeShort: '18畳',
    price: 'From ¥35,000 / night · inc. breakfast',
    priceBadge: 'From ¥35,000 / night',
    cap: 10,
    lead: 'The largest room in the inn — 18 tatami mats accommodating up to eight to ten guests, anchored by a circular window original to the building.',
    descEn: 'Large enough for group dining within the room on request, Higashiyama sits within the inn’s preserved original architecture and looks out across the forested ridge of Hikosan. The room shares the second-floor balcony, engawa, and mountain-viewing lounge. Private ensuite ofuro bath.',
    descJp: '宿最大の客室──18畳、最大8〜10名まで対応。建物本来の円窓が特徴です。ご希望に応じて、室内での団体でのお食事にも対応できる広さです。バルコニー、縁側、ラウンジを共有。専用露天風呂付き。',
    feats: ['18-Mat Tatami · 18畳', 'Up to 8–10 Guests · 最大8〜10名', 'Circular Window · 円窓', 'Group Dining Option · 団体お食事対応', 'Shared Balcony & Engawa · バルコニー・縁側', 'Ensuite Ofuro · 専用露天風呂', 'Yukata · 浴衣'],
    bgImg: 'assets/img/room-higashiyama.jpg',
    thumb: 'assets/img/room-higashiyama.jpg',
    gallery: ['assets/img/room-higashiyama.jpg', 'assets/img/s2-room-higashiyama.jpg']
  }
};

// ─── POPULATE ROOM DETAIL ───────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function populateRoom(slug) {
  const r = ROOMS[slug];
  document.title = r.nameEn + ' · ' + SITE_TITLE;
  const bg = document.getElementById('rdh-bg');
  if (bg) bg.style.backgroundImage = "url('" + r.bgImg + "')";
  setText('rd-type', r.type);
  setText('rd-name', r.nameEn);
  setText('rd-jp', r.nameJp);
  setText('rd-size', r.sizeShort);
  setText('rd-price-hero', r.priceBadge);
  setText('rd-eyebrow', r.eyebrow);
  setText('rd-lead', r.lead);
  setText('rd-body-en', r.descEn);
  setText('rd-body-jp', r.descJp);
  setText('bk-name', r.nameEn + ' — ' + r.nameJp);
  setText('bk-price', r.price);

  const featsEl = document.getElementById('rd-feats');
  if (featsEl) featsEl.innerHTML = r.feats.map((f) => {
    const parts = f.split(' · ');
    return '<span class="feat">' + parts[0] + (parts[1] ? '<span class="feat-jp">· ' + parts[1] + '</span>' : '') + '</span>';
  }).join('');

  const galEl = document.getElementById('rd-gallery');
  if (galEl) {
    galEl.innerHTML = r.gallery.map((src, i) =>
      '<img src="' + src + '" alt="' + r.nameEn + ' gallery ' + (i + 1) + '" loading="lazy"/>'
    ).join('');
    // Bound here rather than via an inline onclick so the source stays out of
    // the attribute — it can be a very long inlined image in the single-file build.
    galEl.querySelectorAll('img').forEach((im, i) => {
      im.addEventListener('click', () => openLightbox(r.gallery[i]));
    });
  }

  const guests = document.getElementById('bk-guests');
  if (guests) {
    let opts = '';
    for (let i = 1; i <= r.cap; i++) {
      opts += '<option' + (i === 2 ? ' selected' : '') + '>' + i + (i === 1 ? ' Guest · 1名' : ' Guests · ' + i + '名') + '</option>';
    }
    guests.innerHTML = opts;
  }

  const othersEl = document.getElementById('other-rooms');
  if (othersEl) {
    let out = '<div class="other-lbl">Other Rooms · 他の客室</div>';
    Object.keys(ROOMS).forEach((k) => {
      if (k === slug) return;
      const v = ROOMS[k];
      out += '<div class="other-link" onclick="goRoom(\'' + k + '\')">'
        + '<img src="' + v.thumb + '" alt="' + v.nameEn + '"/>'
        + '<div><div class="other-en">' + v.nameEn + '</div>'
        + '<div class="other-jp">' + v.nameJp + ' · ' + v.size + '</div></div>'
        + '</div>';
    });
    othersEl.innerHTML = out;
  }
}

// ─── LIGHTBOX ───────────────────────────────────────────────
function openLightbox(src) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (lb && img) { img.src = src; lb.classList.add('open'); }
}
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
}
document.getElementById('lightbox').addEventListener('click', function (e) {
  if (e.target === this) closeLightbox();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

// ─── FORMS ──────────────────────────────────────────────────
// WHERE ENQUIRIES GO. Paste the form endpoint below and both forms start
// delivering to that inbox. Any service that accepts a JSON POST works —
// e.g. https://formsubmit.co/ajax/you@example.com (no signup; it emails you
// once to confirm the address), or a Formspree / Web3Forms endpoint.
//
// While this is empty the forms do NOT pretend to have sent anything: they
// say plainly that the form is not live yet and point at CONTACT_EMAIL.
// TO CHANGE THE ADDRESS ENQUIRIES GO TO: edit the address on the next line.
// That is the only place it appears. Then rerun build-standalone.py if you
// are sending the single-file version around.
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/bakeyalrawi@gmail.com';
const FORM_EXTRA_FIELDS = { _template: 'table', _captcha: 'false' };
const CONTACT_EMAIL = 'bakeyalrawi@gmail.com';   // shown if delivery ever fails

const val = (id) => {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
};

function setStatus(id, message, kind) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message || '';
  el.className = 'form-status' + (kind ? ' is-' + kind : '');
}

// Returns the first missing required field, so we can tell the visitor
// exactly what is wrong instead of failing silently.
function firstInvalid(form) {
  const fields = form.querySelectorAll('[required]');
  for (const f of fields) {
    if (!f.value.trim()) return f;
    if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim())) return f;
  }
  return null;
}

// Labels carry both languages in .en/.ja spans; quote only the visible one.
function labelFor(field) {
  const lbl = field.form.querySelector('label[for="' + field.id + '"]');
  if (!lbl) return '';
  const scoped = lbl.querySelector('.' + (html.getAttribute('data-lang') || 'en'));
  return (scoped || lbl).textContent.replace(/\s+/g, ' ').trim();
}

const isJa = () => html.getAttribute('data-lang') === 'ja';

function missingFieldMessage(field) {
  const name = labelFor(field);
  if (isJa()) return name ? '「' + name + '」をご入力ください。' : '必須項目をご入力ください。';
  return name ? 'Please complete “' + name + '”.' : 'Please complete the required fields.';
}

function notLiveMessage() {
  if (isJa()) {
    return CONTACT_EMAIL
      ? 'このフォームは未接続のため、送信されていません。' + CONTACT_EMAIL + ' まで直接ご連絡ください。'
      : 'このフォームは未接続のため、送信されていません。直接ご連絡ください。';
  }
  return CONTACT_EMAIL
    ? 'This form is not connected yet, so nothing was sent. Please email ' + CONTACT_EMAIL + ' instead.'
    : 'This form is not connected yet — nothing was sent. Please contact us directly.';
}

// Opened as a downloaded file rather than from a web address. Form services
// refuse posts from file:// pages, so compose the enquiry as an email instead
// — the details still reach a person, which is the point of the form.
const isLocalFile = () => location.protocol === 'file:';

function buildMailto(payload) {
  const subject = payload._subject || 'Enquiry — Shiraume Lodge';
  const body = Object.keys(payload)
    .filter((k) => k.charAt(0) !== '_' && payload[k])
    .map((k) => k.charAt(0).toUpperCase() + k.slice(1) + ': ' + payload[k])
    .join('\n');
  return 'mailto:' + CONTACT_EMAIL
    + '?subject=' + encodeURIComponent(subject)
    + '&body=' + encodeURIComponent(body);
}

function localFileMessage() {
  return isJa()
    ? 'メールアプリを開きました。内容をご確認のうえ送信してください。開かない場合は ' + CONTACT_EMAIL + ' まで直接お送りください。'
    : 'Your email app should now be open with these details filled in — just press send. '
      + 'If nothing opened, please email ' + CONTACT_EMAIL + ' directly.';
}

function failureMessage(err) {
  if (isJa()) {
    return '送信できませんでした（' + err.message + '）。'
      + (CONTACT_EMAIL ? CONTACT_EMAIL + ' までご連絡ください。' : 'しばらくしてから再度お試しください。');
  }
  return 'Sorry — your enquiry could not be sent (' + err.message + '). '
    + (CONTACT_EMAIL ? 'Please email ' + CONTACT_EMAIL + '.' : 'Please try again shortly.');
}

// Posts the payload and reports honestly whether it arrived.
async function deliver(payload) {
  const res = await fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(Object.assign({}, FORM_EXTRA_FIELDS, payload))
  });
  if (!res.ok) throw new Error('the server replied ' + res.status);
  // Some services answer 200 while refusing the message — an unactivated
  // address, for instance. Treat that as the failure it is, so the visitor
  // is never shown a confirmation for an enquiry that was not accepted.
  let body = null;
  try { body = await res.clone().json(); } catch (e) { /* not JSON: trust the status */ }
  if (body && (body.success === false || body.success === 'false')) {
    throw new Error(body.message || 'the form service refused it');
  }
  return res;
}

async function handleSubmit(opts) {
  const form = document.getElementById(opts.formId);
  const button = document.getElementById(opts.buttonId);
  if (!form) return;

  // Bots fill hidden fields; people never see them. Pretend all is well.
  if (val(opts.honeypotId)) { opts.onSuccess(); return; }

  const bad = firstInvalid(form);
  if (bad) {
    setStatus(opts.statusId, missingFieldMessage(bad), 'error');
    bad.focus();
    return;
  }

  if (!FORM_ENDPOINT) {
    setStatus(opts.statusId, notLiveMessage(), 'error');
    return;
  }

  // A downloaded copy cannot post to a form service, so hand the details to
  // the visitor's email app rather than failing in front of them.
  if (isLocalFile() && CONTACT_EMAIL) {
    window.location.href = buildMailto(opts.payload());
    setStatus(opts.statusId, localFileMessage(), 'note');
    return;
  }

  const label = button ? button.innerHTML : '';
  if (button) { button.disabled = true; button.textContent = 'Sending…'; }
  setStatus(opts.statusId, '');

  try {
    await deliver(opts.payload());
    opts.onSuccess();
  } catch (err) {
    setStatus(opts.statusId, failureMessage(err), 'error');
    if (button) { button.disabled = false; button.innerHTML = label; }
  }
}

function submitBooking(e) {
  if (e && e.preventDefault) e.preventDefault();
  handleSubmit({
    formId: 'bk-form', buttonId: 'bk-submit', statusId: 'bk-status', honeypotId: 'bk-company',
    payload: () => ({
      _subject: 'Booking enquiry — ' + (document.getElementById('bk-name') || {}).textContent,
      form: 'Room booking enquiry',
      room: (document.getElementById('bk-name') || {}).textContent,
      rate: (document.getElementById('bk-price') || {}).textContent,
      arrival: val('bk-in'),
      departure: val('bk-out'),
      guests: (document.getElementById('bk-guests') || {}).value,
      name: val('bk-fullname'),
      email: val('bk-email'),
      requests: val('bk-requests')
    }),
    onSuccess: () => {
      const bf = document.getElementById('bk-form');
      const bs = document.getElementById('bk-success');
      if (bf) bf.style.display = 'none';
      if (bs) bs.classList.add('show');
    }
  });
}

function submitInq(e) {
  if (e && e.preventDefault) e.preventDefault();
  handleSubmit({
    formId: 'inq-form-wrap', buttonId: 'inq-submit', statusId: 'inq-status', honeypotId: 'inq-company',
    payload: () => ({
      _subject: 'Partner introduction — Shiraume Lodge',
      form: 'Partner introduction',
      name: (val('first-name') + ' ' + val('last-name')).trim(),
      email: val('email'),
      role: (document.getElementById('role') || {}).value,
      experience: val('experience-field'),
      interest: val('interest')
    }),
    onSuccess: () => {
      const fw = document.getElementById('inq-form-wrap');
      const fs = document.getElementById('inq-success');
      if (fw) fw.style.display = 'none';
      if (fs) fs.classList.add('show');
    }
  });
}

// ─── SCROLL PROGRESS + FLOATING BUTTONS ─────────────────────
(function () {
  const bar = document.getElementById('progress');
  const fi = document.getElementById('float-inq');
  const snd = document.getElementById('float-snd');
  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.setProperty('--p', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
    const show = splashDone && VIEW === 'home' && window.scrollY > 500;
    if (fi) fi.classList.toggle('on', show);
    if (snd) snd.classList.toggle('on', show);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
})();

// ─── AMBIENT SOUND (appears only when assets/ambient.mp3 exists)
(function () {
  const a = document.getElementById('ambient');
  const b = document.getElementById('float-snd');
  if (!a || !b) return;
  a.volume = 0.35;
  a.addEventListener('loadedmetadata', () => b.classList.add('ready'));
  b.addEventListener('click', () => {
    if (a.paused) {
      a.play().then(() => {
        b.classList.add('playing');
        b.setAttribute('aria-pressed', 'true');
        b.setAttribute('aria-label', 'Pause ambient sound · 環境音を停止');
      }).catch(() => {});
    } else {
      a.pause();
      b.classList.remove('playing');
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', 'Play ambient sound · 環境音');
    }
  });
})();
