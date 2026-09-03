/*
  金屏風 / Kin Byōbu — behaviour.

  Three things: the splash (a camera push through the gate), the mouse depth
  that moves the planes and the light on the gold, and the scroll that opens
  each marumado. No dependency; the whole thing is CSS transforms, one inline
  SVG and one small canvas.

  Everything is gated on data-palette="b". Under palette A this file does
  nothing at all, and removing it leaves palette A untouched.
*/
(function () {
  var HTML = document.documentElement;
  var active = function () { return HTML.getAttribute('data-palette') === 'b'; };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // A still splash on a device that should not be asked to run five moving
  // planes and a particle field: few cores, or a narrow screen.
  var modest = reduced ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    window.matchMedia('(max-width: 700px)').matches;

  /* ── the gate ─────────────────────────────────────────────────────────── */
  /* The gate, in the proportions a real myojin torii has: a swept kasagi whose
     ends lift, a thinner shimaki beneath it, the nuki crossing lower, a short
     gakuzuka between them, and two posts that taper outward as they fall. The
     first attempt was drawn as thick even slabs, which read as black bars
     rather than as timber. Each path draws itself, then takes its ink. */
  // Held in a variable so the single-file build can swap it for the embedded
  // copy; inline in the markup string below, the builder cannot see it.
  var ENSO = "assets/img/logo-ink.png";

  var TORII = '<svg viewBox="0 0 1200 800" aria-hidden="true" preserveAspectRatio="xMidYMid meet">' +
    // kasagi — the crowning beam, ends lifted
    '<path class="kb-fillpath" pathLength="1" style="animation-delay:1.15s,1.5s" d="M236 150C440 192 760 192 964 150L958 186C756 228 444 228 242 186Z"/>' +
    // shimaki — the thin board tucked under it
    '<path class="kb-fillpath" pathLength="1" style="animation-delay:1.28s,1.62s" d="M286 196C462 226 738 226 914 196L910 216C736 246 464 246 290 216Z"/>' +
    // nuki — the crossbeam
    '<path class="kb-fillpath" pathLength="1" style="animation-delay:1.4s,1.72s" d="M322 268H878V300H322Z"/>' +
    // gakuzuka — the short strut between them
    '<path class="kb-fillpath" pathLength="1" style="animation-delay:1.55s,1.84s" d="M584 232H616V268H584Z"/>' +
    // hashira — the posts, tapering outward
    '<path class="kb-fillpath" pathLength="1" style="animation-delay:0s,1.0s" d="M338 212H368L378 762H330Z"/>' +
    '<path class="kb-fillpath" pathLength="1" style="animation-delay:.12s,1.05s" d="M862 212H832L822 762H870Z"/>' +
    // the two stone footings
    '<path pathLength="1" style="animation-delay:.3s" stroke-width="3" d="M312 762H396M804 762H888"/>' +
    '</svg>';

  function buildSplash() {
    if (document.getElementById('kb-splash')) return;
    var s = document.createElement('div');
    s.id = 'kb-splash';
    s.setAttribute('role', 'presentation');
    s.innerHTML =
      '<div class="kb-stage">' +
        '<div class="kb-plane kb-ridge"></div>' +
        '<div class="kb-plane kb-cloud-far"></div>' +
        '<div class="kb-plane kb-torii">' + TORII + '</div>' +
        '<div class="kb-plane kb-cloud-near"></div>' +
        '<div class="kb-plane kb-pine"></div>' +
      '</div>' +
      '<span class="kb-lantern kb-lantern--l"></span>' +
      '<span class="kb-lantern kb-lantern--r"></span>' +
      '<canvas class="kb-leafcanvas"></canvas>' +
      '<div class="kb-emblem">' +
        '<span class="kb-enso"><img src="' + ENSO + '" alt=""></span>' +
        '<span class="kb-word">Shiraume</span>' +
        '<span class="kb-sub">白梅 · 英彦山</span>' +
      '</div>' +
      '<div class="kb-aperture"></div>' +
      '<button class="kb-skip" type="button">Enter</button>';
    if (modest) s.classList.add('is-still');
    document.body.appendChild(s);
    document.body.style.overflow = 'hidden';

    var done = false;
    function leave() {
      if (done) return; done = true;
      s.classList.add('is-open');
      document.body.style.overflow = '';
      setTimeout(function () { s.classList.add('is-out'); }, 900);
      setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 2200);
    }
    s.querySelector('.kb-skip').addEventListener('click', leave);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.key === 'Enter') leave(); });
    setTimeout(leave, modest ? 2600 : 4600);

    if (!modest) { depth(s); leaf(s.querySelector('.kb-leafcanvas')); }
    return s;
  }

  /* ── mouse depth: planes drift, and the light crosses the gold ────────── */
  function depth(scope) {
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    function onMove(e) {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function tick() {
      raf = null;
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      var t = scope || HTML;
      t.style.setProperty('--kb-px', cx.toFixed(4));
      t.style.setProperty('--kb-py', cy.toFixed(4));
      HTML.style.setProperty('--kb-mx', cx.toFixed(4));
      HTML.style.setProperty('--kb-my', cy.toFixed(4));
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) raf = requestAnimationFrame(tick);
    }
    window.addEventListener('pointermove', onMove, { passive: true });
  }

  /* ── gold leaf: flakes that drift down and lean away from the pointer ─── */
  function leaf(canvas) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d'), flakes = [], w = 0, h = 0, dpr = Math.min(devicePixelRatio || 1, 2);
    var mx = 0.5, my = 0.5, alive = true;
    function size() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size(); window.addEventListener('resize', size);
    for (var i = 0; i < 34; i++) flakes.push({
      x: Math.random() * w, y: Math.random() * h,
      r: 1.4 + Math.random() * 3.4, a: Math.random() * Math.PI,
      vy: 0.09 + Math.random() * 0.26, vx: (Math.random() - 0.5) * 0.14,
      spin: (Math.random() - 0.5) * 0.012, o: 0.28 + Math.random() * 0.5
    });
    window.addEventListener('pointermove', function (e) {
      mx = e.clientX / window.innerWidth; my = e.clientY / window.innerHeight;
    }, { passive: true });
    (function frame() {
      if (!alive) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        // lean away from the pointer, so the field parts as you move through it
        var dx = f.x / w - mx, dy = f.y / h - my;
        var d = Math.max(0.08, Math.sqrt(dx * dx + dy * dy));
        f.x += f.vx + (dx / d) * 0.22 / (d * 14 + 1);
        f.y += f.vy + (dy / d) * 0.1 / (d * 16 + 1);
        f.a += f.spin;
        if (f.y - f.r > h) { f.y = -f.r * 2; f.x = Math.random() * w; }
        if (f.x < -20) f.x = w + 10; else if (f.x > w + 20) f.x = -10;
        // a flake of leaf is a thin quadrilateral catching light on one edge
        var flat = 0.34 + 0.66 * Math.abs(Math.cos(f.a));
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.a);
        var g = ctx.createLinearGradient(-f.r, 0, f.r, 0);
        g.addColorStop(0, 'rgba(138,106,31,' + f.o * 0.7 + ')');
        g.addColorStop(0.45, 'rgba(248,236,180,' + f.o + ')');
        g.addColorStop(1, 'rgba(201,162,39,' + f.o * 0.8 + ')');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(-f.r, -f.r * flat * 0.6);
        ctx.lineTo(f.r * 0.75, -f.r * flat);
        ctx.lineTo(f.r, f.r * flat * 0.7);
        ctx.lineTo(-f.r * 0.8, f.r * flat);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      requestAnimationFrame(frame);
    })();
    // stop when the splash goes, so nothing keeps painting behind the page
    var obs = new MutationObserver(function () { if (!canvas.isConnected) { alive = false; obs.disconnect(); } });
    obs.observe(document.body, { childList: true });
  }

  /* ── scroll: each marumado opens as it arrives ────────────────────────── */
  function windows() {
    var frames = [].slice.call(document.querySelectorAll('#view-home .rooms-grid .room-img, #view-home .kb-mado'));
    if (!frames.length) return;
    if (reduced) { frames.forEach(function (f) { f.style.setProperty('--kb-open', '1'); }); return; }
    frames.forEach(function (f) { f.style.setProperty('--kb-open', '0'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        // a beat per plate, so they open in sequence rather than all at once
        var i = frames.indexOf(el);
        setTimeout(function () { el.style.setProperty('--kb-open', '1'); }, Math.min(i, 4) * 110);
        io.unobserve(el);
      });
    }, { threshold: 0.28, rootMargin: '0px 0px -8% 0px' });
    frames.forEach(function (f) { io.observe(f); });
  }

  function start() {
    if (!active()) return;
    windows();
    if (!depth.armed) { depth(null); depth.armed = true; }
    // The splash runs once per visit, and never on a deep link into a section.
    if (!location.hash) buildSplash();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();

  // Switching to B from the review control brings the design up without a reload.
  new MutationObserver(function () {
    if (active()) { windows(); }
    else {
      var s = document.getElementById('kb-splash');
      if (s && s.parentNode) { s.parentNode.removeChild(s); document.body.style.overflow = ''; }
    }
  }).observe(HTML, { attributes: true, attributeFilter: ['data-palette'] });
})();
