/* ═══════════════════════════════════════════════════════════════════
   SHIRAUME LODGE · CINEMATIC SPLASH  ·  shiraume-splash.js
   Pairs with shiraume-splash.css.

   Everything geometric is derived from the same TORII table the site
   already uses to trace the gate onto the hero photograph, so the
   splash gate and the hero gate are the same gate.

   Usage:
     ShiraumeSplash.mount({ photo, mark, name, sub, tagline, kanji })
     ShiraumeSplash.play()      restart the sequence
     ShiraumeSplash.exit()      walk through now (the Enter affordance)
   The element dispatches 'shiraume:splash-open' when the camera starts
   moving, and 'shiraume:splash-done' when it is finished.
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var TORII = {
    span: { u0: 0.245, u1: 0.755, vTop: 0.024, vFoot: 0.783 },
    top: { uL: 0.245, uR: 0.755, uLb: 0.258, uRb: 0.742, cIn: 0.17,
           topEnd: 0.024, topMid: 0.060, midEnd: 0.056, midMid: 0.096,
           botEnd: 0.086, botMid: 0.127 },
    rope: { v0End: 0.248, v0Mid: 0.256, v1End: 0.262, v1Mid: 0.270,
            shide: [0.12, 0.30, 0.50, 0.70, 0.88], shideW: 0.0038, shideH: 0.046 },
    nuki: { u0: 0.272, u1: 0.700, u0b: 0.276, u1b: 0.697, v0: 0.184, v1: 0.237 },
    plaque: { u0: 0.478, u1: 0.520, v0: 0.085, v1: 0.215, inset: 0.005 },
    daiwa: { v0: 0.125, v1: 0.185, r: 0.009, left: [0.344, 0.402], right: [0.598, 0.657] },
    shaftTopV: 0.237, shaftBotV: 0.775,
    left:  { outTop: 0.3521, outBot: 0.3431, inTop: 0.3942, inBot: 0.3961 },
    right: { inTop: 0.6074, inBot: 0.6123, outTop: 0.6510, outBot: 0.6608 },
    base: { left:  { u0: 0.334, u1: 0.408, v0: 0.735, v1: 0.783 },
            right: { u0: 0.601, u1: 0.672, v0: 0.723, v1: 0.772 } }
  };
  var IMG = { w: 1376, h: 752 };

  function postEdge(top, bot, v) {
    return top + (bot - top) * (v - TORII.shaftTopV) / (TORII.shaftBotV - TORII.shaftTopV);
  }

  /* Every member of the gate, as a closed path where it can be — closed
     shapes are what the lacquer needs to flood into. `w` is the brush
     weight, `delay`/`dur` the order a gate is actually raised in, and
     `z` the depth plane: the top assembly stands a little in front of
     the posts, which is what makes the dolly read as walking through
     something built rather than through a drawing. */
  function parts(f) {
    var X = function (u) { return (f.x + u * f.w).toFixed(2); };
    var Y = function (v) { return (f.y + v * f.h).toFixed(2); };
    var T = TORII.top, N = TORII.nuki, P = TORII.plaque, D = TORII.daiwa, B = TORII.base, R = TORII.rope;

    var sweep = function (uA, uB, endV, midV) {
      var c = (8 * midV - endV - endV) / 6;
      return 'M' + X(uA) + ',' + Y(endV) + ' C' + X(uA + T.cIn) + ',' + Y(c) +
             ' ' + X(uB - T.cIn) + ',' + Y(c) + ' ' + X(uB) + ',' + Y(endV);
    };
    var sweepBack = function (uA, uB, endV, midV) {
      var c = (8 * midV - endV - endV) / 6;
      return 'C' + X(uB - T.cIn) + ',' + Y(c) + ' ' + X(uA + T.cIn) + ',' + Y(c) +
             ' ' + X(uA) + ',' + Y(endV);
    };
    var rect = function (u0, u1, v0, v1) {
      return 'M' + X(u0) + ',' + Y(v0) + ' L' + X(u1) + ',' + Y(v0) +
             ' L' + X(u1) + ',' + Y(v1) + ' L' + X(u0) + ',' + Y(v1) + ' Z';
    };

    var topAssembly = sweep(T.uL, T.uR, T.topEnd, T.topMid) +
      ' L' + X(T.uRb) + ',' + Y(T.botEnd) + ' ' +
      sweepBack(T.uLb, T.uRb, T.botEnd, T.botMid) + ' Z';
    var shimaki = sweep(T.uL + 0.006, T.uR - 0.006, T.midEnd, T.midMid);
    var nuki = 'M' + X(N.u0) + ',' + Y(N.v0) + ' L' + X(N.u1) + ',' + Y(N.v0) +
               ' L' + X(N.u1b) + ',' + Y(N.v1) + ' L' + X(N.u0b) + ',' + Y(N.v1) + ' Z';
    var plaque = rect(P.u0, P.u1, P.v0, P.v1);
    var plaqueIn = rect(P.u0 + P.inset, P.u1 - P.inset, P.v0 + P.inset * 2, P.v1 - P.inset * 2);

    var collar = function (u) {
      var r = D.r;
      return 'M' + X(u[0]) + ',' + Y(D.v1) + ' L' + X(u[0]) + ',' + Y(D.v0 + r) +
             ' Q' + X(u[0]) + ',' + Y(D.v0) + ' ' + X(u[0] + r) + ',' + Y(D.v0) +
             ' L' + X(u[1] - r) + ',' + Y(D.v0) +
             ' Q' + X(u[1]) + ',' + Y(D.v0) + ' ' + X(u[1]) + ',' + Y(D.v0 + r) +
             ' L' + X(u[1]) + ',' + Y(D.v1) + ' Z';
    };
    var shaft = function (s, footV) {
      var eT = TORII.shaftTopV, eB = footV;
      return 'M' + X(postEdge(s.outTop, s.outBot, eT)) + ',' + Y(eT) +
             ' L' + X(postEdge(s.inTop, s.inBot, eT)) + ',' + Y(eT) +
             ' L' + X(postEdge(s.inTop, s.inBot, eB)) + ',' + Y(eB) +
             ' L' + X(postEdge(s.outTop, s.outBot, eB)) + ',' + Y(eB) + ' Z';
    };

    var sag = function (endV, midV) { return (8 * midV - endV - endV) / 6; };
    var lIn = postEdge(TORII.left.inTop, TORII.left.inBot, R.v0End);
    var rIn = postEdge(TORII.right.inTop, TORII.right.inBot, R.v0End);
    var rope = 'M' + X(lIn) + ',' + Y(R.v0End) +
      ' C' + X(lIn + 0.09) + ',' + Y(sag(R.v0End, R.v0Mid)) +
      ' ' + X(rIn - 0.09) + ',' + Y(sag(R.v0End, R.v0Mid)) + ' ' + X(rIn) + ',' + Y(R.v0End) +
      ' L' + X(rIn) + ',' + Y(R.v1End) +
      ' C' + X(rIn - 0.09) + ',' + Y(sag(R.v1End, R.v1Mid)) +
      ' ' + X(lIn + 0.09) + ',' + Y(sag(R.v1End, R.v1Mid)) + ' ' + X(lIn) + ',' + Y(R.v1End) + ' Z';

    var shide = R.shide.map(function (t) {
      var u = lIn + (rIn - lIn) * t;
      var hang = R.v1End + (R.v1Mid - R.v1End) * Math.sin(Math.PI * t);
      var w = R.shideW, h = R.shideH;
      return 'M' + X(u - w) + ',' + Y(hang) + ' L' + X(u + w) + ',' + Y(hang) +
             ' L' + X(u + w) + ',' + Y(hang + h * 0.34) + ' L' + X(u) + ',' + Y(hang + h * 0.34) +
             ' L' + X(u) + ',' + Y(hang + h * 0.67) + ' L' + X(u + w) + ',' + Y(hang + h * 0.67) +
             ' L' + X(u + w) + ',' + Y(hang + h) + ' L' + X(u - w) + ',' + Y(hang + h) + ' Z';
    }).join(' ');

    return [
      { d: rect(B.left.u0, B.left.u1, B.left.v0, B.left.v1),     delay: 0.00, dur: 0.34, w: 2.2, z: 0,   lacquer: false, stone: true },
      { d: rect(B.right.u0, B.right.u1, B.right.v0, B.right.v1), delay: 0.09, dur: 0.34, w: 2.2, z: 0,   lacquer: false, stone: true },
      { d: shaft(TORII.left, B.left.v0),   delay: 0.26, dur: 0.95, w: 2.7, z: 0,   lacquer: true },
      { d: shaft(TORII.right, B.right.v0), delay: 0.36, dur: 0.95, w: 2.7, z: 0,   lacquer: true },
      { d: collar(D.left),   delay: 0.98, dur: 0.34, w: 2.1, z: -26, lacquer: true },
      { d: collar(D.right),  delay: 1.05, dur: 0.34, w: 2.1, z: -26, lacquer: true },
      { d: nuki,             delay: 1.22, dur: 0.55, w: 2.4, z: -26, lacquer: true },
      { d: topAssembly,      delay: 1.62, dur: 0.88, w: 2.6, z: -52, lacquer: true },
      { d: shimaki,          delay: 2.10, dur: 0.48, w: 1.5, z: -52, lacquer: false },
      { d: plaque,           delay: 2.32, dur: 0.42, w: 1.7, z: -6,  lacquer: false, gilt: true, gold: true },
      { d: plaqueIn,         delay: 2.44, dur: 0.34, w: 1.1, z: -6,  lacquer: false, gold: true },
      { d: rope,             delay: 2.52, dur: 0.48, w: 1.5, z: -14, lacquer: false },
      { d: shide,            delay: 2.76, dur: 0.40, w: 1.2, z: -14, lacquer: false }
    ];
  }

  /* What opens: the space you would walk through. */
  function opening(f, vh) {
    var X = function (u) { return f.x + u * f.w; }, Y = function (v) { return f.y + v * f.h; };
    var vTop = TORII.nuki.v1, vBot = (vh + 420 - f.y) / f.h;
    var lT = postEdge(TORII.left.inTop, TORII.left.inBot, vTop);
    var lB = postEdge(TORII.left.inTop, TORII.left.inBot, vBot);
    var rT = postEdge(TORII.right.inTop, TORII.right.inBot, vTop);
    var rB = postEdge(TORII.right.inTop, TORII.right.inBot, vBot);
    return {
      d: 'M' + X(lT).toFixed(2) + ',' + Y(vTop).toFixed(2) +
         ' L' + X(rT).toFixed(2) + ',' + Y(vTop).toFixed(2) +
         ' L' + X(rB).toFixed(2) + ',' + Y(vBot).toFixed(2) +
         ' L' + X(lB).toFixed(2) + ',' + Y(vBot).toFixed(2) + ' Z',
      cx: X((lT + rT) / 2),
      cy: Y(vTop + (Math.min(vBot, 1.1) - vTop) * 0.38),
      top: Y(vTop),
      bot: Y(TORII.shaftBotV),
      width: X(rT) - X(lT)
    };
  }

  /* The gate is composed for the window, not for a photograph: sized
     from the height so the plinths stay on screen, then held wide
     enough that the opening can carry the name. */
  function frameFor(vw, vh) {
    var band = TORII.span.vFoot - TORII.span.vTop;         /* 0.759 */
    var h = Math.min(vh * 0.90 / band, vw * 0.98 / (TORII.span.u1 - TORII.span.u0) * (IMG.h / IMG.w));
    var w = h * (IMG.w / IMG.h);
    var yTop = (vh - band * h) * 0.42;
    return { x: vw / 2 - 0.5015 * w, y: yTop - TORII.span.vTop * h, w: w, h: h };
  }

  var GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23g)' opacity='0.22'/%3E%3C/svg%3E\")";

  var el = null, opts = null, hideTimer = null, exited = false, finished = false, gen = 0;

  /* The lodge's five-petal plum mark, used as a mask for the blossom
     petals so they hold their silhouette at 9–16px. */
  var UME = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cg fill='%23fff'%3E%3Ccircle cx='6' cy='2.8' r='2.1'/%3E%3Ccircle cx='2.96' cy='5.01' r='2.1'/%3E%3Ccircle cx='4.12' cy='8.58' r='2.1'/%3E%3Ccircle cx='7.88' cy='8.58' r='2.1'/%3E%3Ccircle cx='9.04' cy='5.01' r='2.1'/%3E%3Ccircle cx='6' cy='6' r='1.15'/%3E%3C/g%3E%3C/svg%3E\")";

  function q(sel) { return el ? el.querySelector(sel) : null; }

  function layout() {
    if (!el) return;
    var vw = window.innerWidth, vh = window.innerHeight;
    var svg = q('.sp2-gate');
    /* The sheet is drawn 28% larger than the viewport; extending the
       viewBox by the same amount keeps user space at 1 unit = 1 CSS px,
       so the gate's geometry below can stay in plain viewport coords. */
    var ox = vw * 0.14, oy = vh * 0.14;
    svg.setAttribute('viewBox', (-ox) + ' ' + (-oy) + ' ' + (vw + ox * 2) + ' ' + (vh + oy * 2));
    svg.setAttribute('preserveAspectRatio', 'none');
    ['#sp2-rect', '#sp2-fill'].forEach(function (s) {
      var r = q(s);
      r.setAttribute('x', -ox); r.setAttribute('y', -oy);
      r.setAttribute('width', vw + ox * 2); r.setAttribute('height', vh + oy * 2);
    });

    var f = frameFor(vw, vh);
    var ps = parts(f);
    var op = opening(f, vh);

    q('#sp2-strokes').innerHTML = ps.map(function (p) {
      return '<path d="' + p.d + '" pathLength="1"' + (p.gold ? ' class="sp2-gold-stroke"' : '') +
             ' stroke-width="' + p.w +
             '" style="--dl:' + p.delay + 's;--dd:' + p.dur + 's"></path>';
    }).join('');
    /* Same geometry and same clock, three times the width — the halo
       spreads as each stroke is laid down rather than arriving after. */
    q('#sp2-bleed').innerHTML = ps.map(function (p) {
      return '<path d="' + p.d + '" pathLength="1" stroke-width="' + (p.w * 3.2).toFixed(1) +
             '" style="--dl:' + p.delay + 's;--dd:' + p.dur + 's"></path>';
    }).join('');
    q('#sp2-lacquer').innerHTML = ps.filter(function (p) { return p.lacquer; })
      .map(function (p) { return '<path d="' + p.d + '"></path>'; }).join('');
    q('#sp2-gilt').innerHTML = ps.filter(function (p) { return p.gilt; })
      .map(function (p) { return '<path d="' + p.d + '"></path>'; }).join('');
    q('#sp2-stone').innerHTML = ps.filter(function (p) { return p.stone; })
      .map(function (p) { return '<path d="' + p.d + '"></path>'; }).join('');

    var hole = q('#sp2-hole');
    hole.setAttribute('d', op.d);

    /* Pin the brush filter to the gate's own bounds. Left as a percentage
       it is measured against the oversized sheet, so every trace frame
       rasterizes a region several times larger than the drawing. */
    var fb = q('#sp2-brush');
    fb.setAttribute('x', (f.x - f.w * 0.12).toFixed(0));
    fb.setAttribute('y', (f.y - f.h * 0.06).toFixed(0));
    fb.setAttribute('width', (f.w * 1.24).toFixed(0));
    fb.setAttribute('height', (f.h * 1.12).toFixed(0));
    /* transform-box: view-box measures from the view-box origin, which the
       overscan moved to (-ox, -oy) — so shift the origin to match. */
    el.style.setProperty('--sp2-ox', (op.cx + ox).toFixed(1) + 'px');
    el.style.setProperty('--sp2-oy', (op.cy + oy).toFixed(1) + 'px');

    /* The name lives inside the opening, so it is sized by the opening
       and never allowed to cross a post. */
    var inner = op.width - 44;
    var markSize = Math.max(38, Math.min(96, inner * 0.30));
    var nameSize = Math.max(17, Math.min(42, inner / 8.4));
    var hkSize = Math.max(32, inner * 0.145);
    el.style.setProperty('--sp2-mark-size', markSize.toFixed(0) + 'px');
    el.style.setProperty('--sp2-name-size', nameSize.toFixed(1) + 'px');
    el.style.setProperty('--sp2-sub-size', Math.max(9.5, nameSize * 0.3).toFixed(1) + 'px');
    el.style.setProperty('--sp2-hanko-size', hkSize.toFixed(0) + 'px');
    var tagEl = q('.sp2-tag');
    var tagLen = Math.max(6, (tagEl.textContent || '').length);
    var tagFit = (inner - 10) / (tagLen * 1.24);
    el.style.setProperty('--sp2-tag-size', Math.max(10.5, Math.min(19, vw / 62, tagFit)).toFixed(1) + 'px');

    var word = q('.sp2-word');
    var wordTop = op.top + (op.bot - op.top) * 0.24;
    word.style.top = wordTop.toFixed(0) + 'px';

    /* The veil is sized from the lockup it protects and clamped INSIDE the
       posts: any wider and the wash lands on the lacquer and the paper,
       since it paints after the gate. The gradient's horizontal radius is
       widened to compensate, so the type keeps the same ground. */
    var lockH = markSize + nameSize * 2.2 + 40;
    var veil = q('.sp2-veil');
    veil.style.top = wordTop.toFixed(0) + 'px';
    veil.style.width = Math.max(60, op.width - 10).toFixed(0) + 'px';
    veil.style.height = (lockH * 2.1).toFixed(0) + 'px';

    /* Seal and tagline both live inside the opening, over the photograph,
       so they stay legible whatever the paper is doing. */
    var hkSize2 = hkSize;
    var hk = q('.sp2-hanko');
    if (hk) hk.style.top = (wordTop + markSize + nameSize * 2.0 + 26).toFixed(0) + 'px';
    q('.sp2-tag').style.top = Math.min(op.bot - 72, vh - 96).toFixed(0) + 'px';
    void hkSize2;

    /* The lacquer runs light at the lintel and deep at the plinths. */

    var lac = q('#sp2-lac');
    lac.setAttribute('y1', (f.y + TORII.span.vTop * f.h).toFixed(0));
    lac.setAttribute('y2', (f.y + TORII.span.vFoot * f.h).toFixed(0));
  }

  /* Mostly soft flecks, with roughly one in five a five-petal blossom.
     The blossoms are the brand's own plum mark, masked rather than drawn,
     so they hold their shape at any size. */
  function petals(n) {
    var vw = window.innerWidth, vh = window.innerHeight, out = [];
    for (var i = 0; i < n; i++) {
      var px = (Math.random() * 1.1 - 0.05) * vw;
      var py = Math.random() * vh * 0.75;
      var pz = -520 + Math.random() * 640;
      var bloom = (i % 5 === 2);
      var size = bloom ? (9 + Math.random() * 7) : (4 + Math.random() * 6);
      out.push('<div class="sp2-petal" style="--px:' + px.toFixed(0) + 'px;--py:' + py.toFixed(0) +
        'px;--pz:' + pz.toFixed(0) + 'px;--ps:' + size.toFixed(1) +
        'px;--pd:' + (7 + Math.random() * 7).toFixed(1) + 's;--pdl:' + (Math.random() * 6).toFixed(1) +
        's;--pdx:' + (Math.random() * 90 - 20).toFixed(0) + 'px;--pdy:' +
        (90 + Math.random() * 190).toFixed(0) + 'px"><i' +
        (bloom ? ' class="sp2-bloom-petal"' : '') + '></i></div>');
    }
    q('.sp2-petals').innerHTML = out.join('');
  }

  /* The gust: each petal is given its own vector, and the transition on
     .sp2-petal carries it there on the same frame the camera moves. */
  function gust() {
    Array.prototype.forEach.call(el.querySelectorAll('.sp2-petal'), function (p) {
      var a = Math.random() * Math.PI * 2;
      p.style.setProperty('--gx', (Math.cos(a) * (220 + Math.random() * 320)).toFixed(0) + 'px');
      p.style.setProperty('--gy', (Math.sin(a) * (160 + Math.random() * 240) - 90).toFixed(0) + 'px');
    });
  }

  var MARKUP =
    '<div class="sp2-sky sp2-sky-night"></div>' +
    '<div class="sp2-sky sp2-sky-dawn"></div>' +
    '<div class="sp2-stage">' +
      '<div class="sp2-far">' +
        '<div class="sp2-photo"></div>' +
        '<div class="sp2-bloom"></div>' +
      '</div>' +
      '<div class="sp2-world">' +
        '<div class="sp2-paper-plane">' +
          '<svg class="sp2-gate" aria-hidden="true">' +
            '<defs>' +
              /* Aged urushi: near-oxblood at the lintel, almost brown in
                 the shadow at the plinths. Never a saturated mid-red. */
              '<linearGradient id="sp2-lac" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="0">' +
                '<stop offset="0" stop-color="#7c332b"></stop>' +
                '<stop offset="0.55" stop-color="#5e2521"></stop>' +
                '<stop offset="1" stop-color="#3f1a1a"></stop>' +
              '</linearGradient>' +
              '<mask id="sp2-mask" maskUnits="userSpaceOnUse">' +
                '<rect id="sp2-rect" fill="#fff"></rect>' +
                '<path id="sp2-hole" fill="#000"></path>' +
              '</mask>' +
              /* ONE filter, and a deliberately cheap one. It re-rasterizes
                 on every frame of the trace (the paths' dashoffset is its
                 input), so numOctaves stays at 1 and the region is pinned
                 to the gate's own bbox in layout() — a percentage region
                 would be measured against the oversized sheet. */
              '<filter id="sp2-brush" filterUnits="userSpaceOnUse" x="0" y="0" width="10" height="10">' +
                '<feTurbulence type="fractalNoise" baseFrequency="0.026" numOctaves="1" seed="9" result="n"></feTurbulence>' +
                '<feDisplacementMap in="SourceGraphic" in2="n" scale="3.4" xChannelSelector="R" yChannelSelector="G"></feDisplacementMap>' +
              '</filter>' +
            '</defs>' +
            '<g mask="url(#sp2-mask)">' +
              '<rect id="sp2-fill"></rect>' +
              '<g id="sp2-lacquer"></g>' +
              '<g id="sp2-stone"></g>' +
              '<g id="sp2-gilt"></g>' +
              /* The wet bleed used to be a second filtered <use> of the
                 whole stroke group — turbulence, displacement AND a blur,
                 recomputed every frame. It is now its own group of much
                 wider strokes at low opacity, traced on the same clock:
                 the same damp halo, none of the per-frame filter cost.
                 It cannot be a <use> of #sp2-strokes — those paths carry
                 stroke-width presentation attributes, which beat anything
                 inherited, so the widening would never reach the clones. */
              '<g id="sp2-bleed" class="sp2-bleed"></g>' +
              '<g id="sp2-strokes" filter="url(#sp2-brush)"></g>' +
            '</g>' +
          '</svg>' +
          '<div class="sp2-grain"></div>' +
          '<div class="sp2-branch sp2-branch-ghost"><span><i></i><b></b></span></div>' +
          '<div class="sp2-kanji"><span></span><span></span></div>' +
          '<div class="sp2-veil"></div>' +
          '<div class="sp2-word">' +
            '<span class="sp2-mark-slot"></span>' +
            '<div class="sp2-name"></div>' +
            '<div class="sp2-sub"></div>' +
          '</div>' +
          '<div class="sp2-hanko"></div>' +
          '<div class="sp2-tag"></div>' +
          '<div class="sp2-branch sp2-branch-tr"><span><i></i><b></b></span></div>' +
          '<div class="sp2-branch sp2-branch-bl"><span><i></i><b></b></span></div>' +
        '</div>' +
        '<div class="sp2-petals"></div>' +
      '</div>' +
      '<div class="sp2-flash"></div>' +
    '</div>' +
    '<button class="sp2-skip" type="button">Enter \u2193</button>';

  var API = {
    duration: 5.35,          /* the painting; the walk-through follows */

    mount: function (o) {
      opts = o || {};
      el = document.getElementById('shiraume-splash');
      if (!el) {
        el = document.createElement('div');
        el.id = 'shiraume-splash';
        document.body.insertBefore(el, document.body.firstChild);
      }
      el.innerHTML = MARKUP;
      el.style.setProperty('--sp2-photo', 'url("' + (opts.photo || '') + '")');
      el.style.setProperty('--sp2-grain', GRAIN);
      el.style.setProperty('--sp2-ume', UME);
      if (opts.branch) {
        el.style.setProperty('--sp2-branch', 'url("' + opts.branch + '")');
        el.style.setProperty('--sp2-branch-ghost',
          'url("' + (opts.branchGhost || opts.branch) + '")');
      } else {
        Array.prototype.forEach.call(el.querySelectorAll('.sp2-branch'), function (b) {
          b.parentNode.removeChild(b);
        });
      }
      if (opts.mark) {
        var im = document.createElement('img');
        im.className = 'sp2-mark';
        im.alt = '';
        im.src = opts.mark;
        q('.sp2-mark-slot').appendChild(im);
      }
      q('.sp2-name').textContent = opts.name || 'Shiraume Lodge';
      if (opts.sub) { q('.sp2-sub').textContent = opts.sub; }
      else { var sb = q('.sp2-sub'); sb.parentNode.removeChild(sb); }
      q('.sp2-tag').textContent = opts.tagline || '\u5DE1\u793C\u306E\u5BBF\u308B\u3000\u5C71\u306E\u307B\u3068\u308A';
      /* The seal is optional — off unless asked for. */
      if (opts.seal) { q('.sp2-hanko').innerHTML = '<span>\u767D</span><span>\u6885</span>'; }
      else { var hkEl = q('.sp2-hanko'); hkEl.parentNode.removeChild(hkEl); }
      var k = (opts.kanji || '\u767D\u6885').split('');
      var ks = el.querySelectorAll('.sp2-kanji span');
      ks[0].textContent = k[0] || ''; ks[1].textContent = k[1] || '';
      q('.sp2-skip').addEventListener('click', function () { API.exit(); });

      layout();
      petals(opts.petals == null ? 22 : opts.petals);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
      window.addEventListener('resize', function () { if (!exited) { layout(); petals(opts.petals == null ? 22 : opts.petals); } });

      var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced || opts.autoplay === false) {
        el.classList.add('sp2-static');
        if (reduced) setTimeout(function () { API.finish(); }, 400);
        return API;
      }
      API.play();
      return API;
    },

    play: function () {
      el = document.getElementById('shiraume-splash') || el;
      if (!el) return;
      exited = false;
      finished = false;
      gen++;
      clearTimeout(hideTimer);
      el.classList.remove('sp2-exit', 'sp2-gone', 'sp2-static');
      el.style.display = '';
      /* Restart every animation on the subtree in one reflow. */
      var clone = el.cloneNode(true);
      el.parentNode.replaceChild(clone, el);
      el = clone;
      q('.sp2-skip').addEventListener('click', function () { API.exit(); });
      Array.prototype.forEach.call(el.querySelectorAll('.sp2-petal'), function (p) {
        p.style.removeProperty('--gx'); p.style.removeProperty('--gy');
      });
      var mine = gen;
      hideTimer = setTimeout(function () { if (mine === gen) API.exit(); }, API.duration * 1000);
    },

    /* The walk-through. Ending it is driven by the dolly's own
       animationend, with an unguarded timer as the backstop — hiding the
       splash must never depend on a single cancellable timer. */
    exit: function () {
      if (!el || exited) return;
      exited = true;
      clearTimeout(hideTimer);
      el.classList.add('sp2-exit');
      gust();
      el.dispatchEvent(new CustomEvent('shiraume:splash-open', { bubbles: true }));

      var world = q('.sp2-world');
      if (world) {
        world.addEventListener('animationend', function onEnd(e) {
          if (e.animationName !== 'sp2-dolly') return;
          world.removeEventListener('animationend', onEnd);
          API.finish();
        });
      }
      hideTimer = setTimeout(function () { API.finish(); }, 1750);
    },

    finish: function () {
      if (!el || finished) return;
      finished = true;
      clearTimeout(hideTimer);
      el.classList.add('sp2-gone');
      el.dispatchEvent(new CustomEvent('shiraume:splash-done', { bubbles: true }));
      var mine = gen;
      setTimeout(function () { if (el && mine === gen) el.style.display = 'none'; }, 620);
    }
  };

  root.ShiraumeSplash = API;
}(window));
