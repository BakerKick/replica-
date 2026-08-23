/* ═══════════════════════════════════════════════════════════════════
   SHIRAUME LODGE · SPLASH — the luxe layer

   Pairs with splash-luxe.css. Everything here is additive: it injects
   what the base sequence has no elements for, and measures the gate that
   the base file has already drawn rather than recomputing any geometry.

     ShiraumeLuxe.apply('night' | 'day')

   Nothing is forked. The gate, the timeline and the walk-through are the
   base file's; this only changes what things are made of, where the name
   sits, and whether the gate is standing on anything.
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var el, treatment = 'night', bound = false;

  function q(sel) { return el ? el.querySelector(sel) : null; }

  /* The base file positions its lacquer gradient from the gate's own
     frame every layout. Reading those two numbers back is exact, and it
     means none of the tracing arithmetic has to be repeated here. */
  function gateSpan() {
    var lac = q('#sp2-lac');
    if (!lac) return null;
    var y1 = parseFloat(lac.getAttribute('y1'));
    var y2 = parseFloat(lac.getAttribute('y2'));
    if (!isFinite(y1) || !isFinite(y2)) return null;
    return { top: y1, bot: y2 };
  }

  /* ── 1 · materials ──────────────────────────────────────────────────
     Three gradients, all in the gate's own vertical space so the light
     falls the same way on every member.

     Urushi: four stops rather than two. Two stops read as a gradient;
     four read as a surface — light held near the top of a member, a
     deeper middle, and almost brown where it turns away at the foot.

     Metal: gold is not a colour, it is a change of value across a face.
     A flat fill can only ever look like tan paint.

     Stone: cool and matte, and never as bright as the metal, or the
     plinths start competing with the name board. */
  function defs(span) {
    var d = q('.sp2-gate defs');
    if (!d || !span) return;
    var old = d.querySelector('#lux-defs');
    if (old) old.parentNode.removeChild(old);

    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('id', 'lux-defs');
    g.innerHTML =
      '<linearGradient id="lux-urushi" gradientUnits="userSpaceOnUse" x1="0" y1="' + span.top + '" x2="0" y2="' + span.bot + '">' +
        '<stop offset="0"    stop-color="#8d3b31"></stop>' +
        '<stop offset="0.22" stop-color="#712c26"></stop>' +
        '<stop offset="0.62" stop-color="#54211f"></stop>' +
        '<stop offset="1"    stop-color="#331413"></stop>' +
      '</linearGradient>' +
      '<linearGradient id="lux-metal" gradientUnits="userSpaceOnUse" x1="0" y1="' + span.top + '" x2="0" y2="' + (span.top + (span.bot - span.top) * 0.28) + '">' +
        '<stop offset="0"    stop-color="#8f6f3f"></stop>' +
        '<stop offset="0.34" stop-color="#e6c98d"></stop>' +
        '<stop offset="0.52" stop-color="#c9a462"></stop>' +
        '<stop offset="0.78" stop-color="#f0d9a4"></stop>' +
        '<stop offset="1"    stop-color="#93733f"></stop>' +
      '</linearGradient>' +
      '<linearGradient id="lux-stone" gradientUnits="userSpaceOnUse" x1="0" y1="' + (span.bot - (span.bot - span.top) * 0.12) + '" x2="0" y2="' + span.bot + '">' +
        /* Kept a clear step below the paper it stands on. Stone at the
           paper's own value reads as pale cut card, not as stone. */
        '<stop offset="0" stop-color="#7e786c"></stop>' +
        '<stop offset="1" stop-color="#4f4a42"></stop>' +
      '</linearGradient>' +
      /* Same stone, seen at night: it can never be lighter than the paper
         behind it or the plinths read as holes cut in the sheet. */
      '<linearGradient id="lux-stone-night" gradientUnits="userSpaceOnUse" x1="0" y1="' + (span.bot - (span.bot - span.top) * 0.12) + '" x2="0" y2="' + span.bot + '">' +
        '<stop offset="0" stop-color="#4a463e"></stop>' +
        '<stop offset="1" stop-color="#2b2822"></stop>' +
      '</linearGradient>';
    d.appendChild(g);
  }

  /* ── 2 · the gate stands on something ───────────────────────────────
     Measured off the plinths the base file has already drawn, so the
     shadows land where the gate actually is at this window size. A tight
     one under each foot for contact, and one long soft one thrown back
     across the paper. Both painted, never animated per frame. */
  function shadows() {
    var host = document.getElementById('lux-shadow');
    if (!host) return;
    var feet = el.querySelectorAll('#sp2-stone path');
    if (!feet.length) { host.innerHTML = ''; return; }

    var rootBox = el.getBoundingClientRect();
    var html = '';
    Array.prototype.forEach.call(feet, function (f) {
      var r = f.getBoundingClientRect();
      if (!r.width) return;
      var x = r.left - rootBox.left, y = r.bottom - rootBox.top;
      html += '<div class="lux-contact" style="left:' + (x - r.width * 0.18).toFixed(0) +
              'px;top:' + (y - 4).toFixed(0) + 'px;width:' + (r.width * 1.36).toFixed(0) +
              'px;height:' + Math.max(12, r.width * 0.34).toFixed(0) + 'px"></div>';
      /* Kept short and narrow on purpose. Two long soft shadows this
         close together stop being two shadows and become one grey cloud
         under the gate, which is worse than no shadow at all. */
      html += '<div class="lux-cast" style="left:' + (x - r.width * 0.04).toFixed(0) +
              'px;top:' + y.toFixed(0) + 'px;width:' + (r.width * 1.08).toFixed(0) +
              'px;height:' + Math.max(24, r.width * 0.55).toFixed(0) + 'px"></div>';
    });
    host.innerHTML = html;
  }

  /* ── 3 · the name, on the paper ─────────────────────────────────────
     It used to sit inside the gateway in white over whatever the
     photograph was doing, which by the last beat is sunlit gravel. Set
     below the gate on the paper it is dark on light and legible at every
     frame — and it reads as the title block of a printed plate rather
     than a caption floating on a picture.

     Placed from the plinths, so it follows the gate rather than a
     guessed percentage of the window. */
  function lockup() {
    var plane = q('.sp2-paper-plane');
    if (!plane) return;
    var planeTop = plane.getBoundingClientRect().top;
    var vh = window.innerHeight, vw = window.innerWidth;

    /* The sheet is drawn 128% of the viewport and offset to match, so
       anything positioned from its bottom edge lands well below the
       screen. Everything here is set from the plane's own top, with the
       measurement taken in viewport space and converted once. */
    /* The ground line: the lowest point of the plinths, which is where
       the gate meets whatever it is standing on.

       The opening is closed exactly there. Anywhere lower and the
       photograph continues past the feet and then stops dead in mid-air
       on a horizontal cut — which is what the first build did, and it
       reads as a mistake rather than as a window. Closed on the feet, the
       plinths sit on the edge of the mount and the gate is standing on
       the sheet. */
    var footY = vh * 0.80, low = 0;
    Array.prototype.forEach.call(el.querySelectorAll('#sp2-stone path'), function (f) {
      var r = f.getBoundingClientRect();
      if (r.height && r.bottom > low) low = r.bottom;
    });
    if (low) footY = Math.min(low, vh * 0.86);

    var bandTop = footY;
    mount(bandTop);

    /* The title block is centred in the band rather than hung off the
       feet, so it never crowds the ground line at one size and the plate
       mark at another. The band runs from the ground line to a little
       inside the plate mark, and the block is name, air, colophon. */
    var nameSize = Math.max(16, Math.min(32, vw / 48));
    var plateInset = vw <= 700 ? 14 : 26;
    var bandBot = vh - plateInset - Math.max(18, vh * 0.026);
    var lead = nameSize * 1.9;                       /* name to rule      */
    var tagBlock = Math.max(30, nameSize * 1.15);    /* rule, air, line   */
    var blockH = nameSize + lead + tagBlock;
    var clear = Math.max(18, vh * 0.024);
    var wordY = footY + Math.max(clear, (bandBot - footY - blockH) / 2);
    if (wordY + blockH > bandBot) wordY = Math.max(footY + 8, bandBot - blockH);
    var tagY = wordY + nameSize + lead;

    el.style.setProperty('--lux-word-top', (wordY - planeTop).toFixed(0) + 'px');
    el.style.setProperty('--lux-tag-top', (tagY - planeTop).toFixed(0) + 'px');
    el.style.setProperty('--lux-name-size', nameSize.toFixed(1) + 'px');
    el.style.setProperty('--lux-tag-size', Math.max(9.5, Math.min(12.5, vw / 130)).toFixed(1) + 'px');
  }

  /* ── the mount ──────────────────────────────────────────────────────
     The opening is cut all the way off the bottom of the screen so the
     path can be seen leading away, which means there is no paper beneath
     it and nowhere for a name to sit that is not on the photograph.

     A white rectangle appended to the mask paints the paper back in below
     a chosen line — white shows, black hides, and it is added after the
     hole so it wins. The opening becomes a window that stops short of the
     edge, with a band of paper under it: the mount a print sits in, and
     the place the title block belongs.

     Deliberately not transformed with the plate. The band is a property
     of the sheet, not of the drawing. */
  function mount(bandTop) {
    var mask = q('#sp2-mask');
    if (!mask) return;
    var band = mask.querySelector('#lux-band');
    if (!band) {
      band = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      band.setAttribute('id', 'lux-band');
      band.setAttribute('fill', '#fff');
      mask.appendChild(band);
    }
    var vw = window.innerWidth, vh = window.innerHeight;
    band.setAttribute('x', (-vw * 0.2).toFixed(0));
    band.setAttribute('y', bandTop.toFixed(0));
    band.setAttribute('width', (vw * 1.4).toFixed(0));
    band.setAttribute('height', (vh * 0.6).toFixed(0));
  }

  function scaffold() {
    /* The plate mark hangs off the root, not the paper plane. The plane
       is overscanned and offset, so an inset measured against it lands
       nowhere near the trimmed edge — on a phone it came out flush with
       the screen and the crossbeam appeared to cross it. It has no need
       to travel with the paper: it fades out the moment the walk-through
       starts. */
    if (!document.getElementById('lux-plate')) {
      var p = document.createElement('div');
      p.id = 'lux-plate';
      el.appendChild(p);
    }
    if (!document.getElementById('lux-shadow')) {
      var s = document.createElement('div');
      s.id = 'lux-shadow';
      var plane2 = q('.sp2-paper-plane');
      if (plane2) plane2.insertBefore(s, plane2.firstChild);
    }
  }

  /* The plate transform, in the SVG's own user space.

     The view-box is overscanned and starts at (-ox, -oy), so a point at
     viewport (x, y) sits at (x + ox, y + oy) inside it — the same
     conversion the base file does for its own transform origin.

     The brush filter's region is pinned in user space to the gate's
     bounding box, so it has to travel with the drawing or it clips it.
     The same affine goes on the region rather than simply widening it,
     because a region larger than the drawing is exactly the cost the base
     file went to some trouble to avoid. */
  function plate() {
    var vw = window.innerWidth, vh = window.innerHeight;

    /* The plate shrink exists to buy a margin under the gate on a wide
       screen, where the drawing runs almost to the bottom edge. On a
       phone it buys nothing: the gate is already sized by the viewport
       width, so a torii's proportions cap it at about a third of a tall
       screen and there is a third of a screen of paper under it before
       anything is scaled. Shrinking there only made a small gate smaller.
       Left at 1, the transform is the identity and the phone keeps the
       base file's own layout, crossbeam running the full width. */
    var scale = vw <= 700 ? 1 : 0.72;
    var pivotY = vw <= 700 ? 0.30 : 0.20;
    var ox = vw * 0.14, oy = vh * 0.14;
    var originX = vw / 2 + ox, originY = vh * pivotY + oy;

    el.style.setProperty('--lux-plate-scale', scale);
    el.style.setProperty('--lux-ox', originX.toFixed(1) + 'px');
    el.style.setProperty('--lux-oy', originY.toFixed(1) + 'px');

    var fb = q('#sp2-brush');
    if (!fb) return;
    if (!fb.getAttribute('data-lux-base')) {
      fb.setAttribute('data-lux-base', [fb.getAttribute('x'), fb.getAttribute('y'),
                                        fb.getAttribute('width'), fb.getAttribute('height')].join(','));
    }
    var b = fb.getAttribute('data-lux-base').split(',').map(parseFloat);
    if (!b.every(isFinite)) return;
    var px = originX - ox, py = originY - oy;   // pivot, in the same space the region uses
    fb.setAttribute('x', (px + (b[0] - px) * scale).toFixed(0));
    fb.setAttribute('y', (py + (b[1] - py) * scale).toFixed(0));
    fb.setAttribute('width', (b[2] * scale).toFixed(0));
    fb.setAttribute('height', (b[3] * scale).toFixed(0));
  }

  function paint() {
    if (!el) return;
    scaffold();
    plate();
    defs(gateSpan());
    shadows();
    lockup();
  }

  var API = {
    apply: function (which) {
      el = document.getElementById('shiraume-splash');
      if (!el) return API;
      if (which) treatment = which;
      el.classList.add('lux');
      el.classList.remove('lux-night', 'lux-day');
      el.classList.add('lux-' + treatment);

      /* The base file rebuilds the gate on a real resize, which replaces
         the plinths these measurements come from — so this runs again
         after it, on the same event, one frame later. */
      paint();
      requestAnimationFrame(paint);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(paint);
      if (!bound) {
        bound = true;
        window.addEventListener('resize', function () { requestAnimationFrame(paint); });
      }
      return API;
    },
    repaint: paint,
    get treatment() { return treatment; },
  };

  root.ShiraumeLuxe = API;
}(window));
