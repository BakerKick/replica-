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

  var el, treatment = 'night', draw = 'brush', bound = false;

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
      '</linearGradient>' +
      /* The gold used by the drawn line, over the whole height of the
         gate rather than the plaque's few percent — so a single hairline
         running from the crossbeam to the plinths catches the light near
         the top and falls away at the foot, the way leaf does. Brighter
         overall than the plaque gold, because a 1px line has almost no
         area to carry a colour with. */
      '<linearGradient id="lux-line-gold" gradientUnits="userSpaceOnUse" x1="0" y1="' + span.top + '" x2="0" y2="' + span.bot + '">' +
        '<stop offset="0"    stop-color="#f3ddab"></stop>' +
        '<stop offset="0.34" stop-color="#d8b678"></stop>' +
        '<stop offset="0.72" stop-color="#bd9755"></stop>' +
        '<stop offset="1"    stop-color="#9a7742"></stop>' +
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

  /* ── 3 · the name ──────────────────────────────────────────────────
     Nothing here. The name sits in the gateway where the base file puts
     it, which is where it started and where it belongs at full size —
     there is no paper under a full-size gate to put a title block on.

     This is what the earlier build used a plate shrink and a paper band
     to buy, and both are gone with it. */

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

  /* The gate is drawn at the size the base file draws it. An earlier
     build eased it back to buy a margin under the feet for a title block;
     that is gone, so the transform is gone with it and nothing here
     touches the geometry. The brush filter region is left exactly as the
     base file pinned it. */

  function paint() {
    if (!el) return;
    scaffold();
    defs(gateSpan());
    shadows();
  }

  var API = {
    /* apply('night' | 'day', { draw: 'brush' | 'gold' })

       The treatment is the light; the draw is how the gate arrives. They
       are independent — either light works with either draw. */
    apply: function (which, opts) {
      el = document.getElementById('shiraume-splash');
      if (!el) return API;
      if (which) treatment = which;
      if (opts && opts.draw) draw = opts.draw;
      el.classList.add('lux');
      el.classList.remove('lux-night', 'lux-day');
      el.classList.add('lux-' + treatment);
      el.classList.toggle('lux-goldline', draw === 'gold');

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
    get draw() { return draw; },
  };

  root.ShiraumeLuxe = API;
}(window));
