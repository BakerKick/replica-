/*
  Palette switch — a review control, not part of the site.

  Six colourways over the palette C design, plus the two earlier schemes kept
  for reference. The choice is remembered per browser. Delete this file and its
  two lines in index.html before launch; removing it leaves whichever palette
  is set in the boot script.
*/
(function () {
  var PKEY = 'shiraume-palette', TKEY = 'shiraume-tone';

  var TONES = [
    { id: 'c1', name: 'Kin Byōbu',     note: 'gold folding screen — the current design',
      sw: ['#f2ece0', '#17171a', '#16233d', '#6e1f2a', '#d4af37'] },
    { id: 'c2', name: 'Shiro Ume',     note: 'white plum — gallery light, brushed gold',
      sw: ['#f6f3ee', '#1f1c22', '#2a2530', '#7d3348', '#c9a961'] },
    { id: 'c3', name: 'Kurogane Ake',  note: 'iron and vermilion — lacquer, torii at dusk',
      sw: ['#efe6d9', '#14100f', '#1a0f11', '#8c2b23', '#c08a2e'] },
    { id: 'c4', name: 'Ao Sumi',       note: 'blue ink — cool, misty, mountain morning',
      sw: ['#eef0ec', '#131a24', '#0f1c2e', '#5c4a6b', '#b8a06a'] },
    { id: 'c5', name: 'Kohaku',        note: 'amber — candle and cedar, onsen at night',
      sw: ['#f4ead8', '#211a12', '#2b1d14', '#9c5a2c', '#d9b055'] },
    { id: 'c6', name: 'Matsu Gin',     note: 'pine and silver — shrine forest, no gold',
      sw: ['#f1f0e9', '#161a17', '#14241d', '#7a3b34', '#b9b4a4'] }
  ];
  var LEGACY = [
    { id: 'a', name: 'A · Moonlit Cedar', note: 'the site as delivered' },
    { id: 'b', name: 'B · Kin Byōbu dark', note: 'ivory and gold, indigo chambers' }
  ];

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private window */ } }

  var palette = (get(PKEY) === 'a' || get(PKEY) === 'b') ? get(PKEY) : 'c';
  var tone = /^c[2-6]$/.test(get(TKEY) || '') ? get(TKEY) : 'c1';
  var d = document.documentElement;

  function apply() {
    if (palette === 'a') d.removeAttribute('data-palette');
    else d.setAttribute('data-palette', palette);
    if (palette === 'c' && tone !== 'c1') d.setAttribute('data-tone', tone);
    else d.removeAttribute('data-tone');
    set(PKEY, palette); set(TKEY, tone);
    var box = document.getElementById('palette-switch');
    if (!box) return;
    box.querySelectorAll('[data-tone-id]').forEach(function (b) {
      var on = palette === 'c' && b.dataset.toneId === tone;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    box.querySelectorAll('[data-legacy]').forEach(function (b) {
      var on = palette === b.dataset.legacy;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  apply();   // before first paint, so the page never flashes another scheme

  function build() {
    if (document.getElementById('palette-switch')) return;

    var css = document.createElement('style');
    css.textContent = [
      '#palette-switch{position:fixed;left:1rem;bottom:1rem;z-index:600;width:15.5rem;',
      'font:400 .7rem/1.35 system-ui,-apple-system,sans-serif;color:#efe8de;',
      'background:rgba(16,14,12,.94);border:1px solid rgba(185,154,103,.38);border-radius:.7rem;',
      'box-shadow:0 .8rem 2.4rem rgba(0,0,0,.45);overflow:hidden;backdrop-filter:blur(6px)}',
      '#palette-switch header{display:flex;align-items:center;justify-content:space-between;',
      'padding:.55rem .7rem;cursor:pointer;user-select:none;',
      'font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(238,232,222,.55);',
      'border-bottom:1px solid rgba(185,154,103,.18)}',
      '#palette-switch header b{font-weight:400;color:#d9c79c;letter-spacing:.1em;text-transform:none;font-size:.72rem}',
      '#palette-switch .ps-body{max-height:24rem;overflow:auto;transition:max-height .25s ease}',
      '#palette-switch.is-shut .ps-body{max-height:0}',
      '#palette-switch button{display:flex;width:100%;align-items:center;gap:.5rem;',
      'appearance:none;cursor:pointer;text-align:left;background:transparent;color:inherit;font:inherit;',
      'border:0;border-bottom:1px solid rgba(255,255,255,.05);padding:.5rem .7rem;transition:background .15s ease}',
      '#palette-switch button:hover{background:rgba(255,255,255,.06)}',
      '#palette-switch button.is-on{background:rgba(212,175,55,.16);box-shadow:inset .18rem 0 0 #d4af37}',
      '#palette-switch .ps-sw{display:flex;flex:0 0 auto;border-radius:.2rem;overflow:hidden;',
      'box-shadow:0 0 0 1px rgba(255,255,255,.14)}',
      '#palette-switch .ps-sw i{width:.62rem;height:1.4rem;display:block}',
      '#palette-switch .ps-t{min-width:0}',
      '#palette-switch .ps-t b{display:block;font-weight:500;font-size:.75rem;letter-spacing:.01em}',
      '#palette-switch .ps-t span{display:block;font-size:.62rem;color:rgba(238,232,222,.5);',
      'overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '#palette-switch .ps-legacy{padding:.45rem .7rem .55rem;font-size:.58rem;letter-spacing:.14em;',
      'text-transform:uppercase;color:rgba(238,232,222,.38)}',
      '#palette-switch .ps-legacy button{display:inline-flex;width:auto;padding:.22rem .55rem;border:1px solid rgba(238,232,222,.2);',
      'border-radius:1rem;margin:.35rem .35rem 0 0;font-size:.62rem;letter-spacing:.06em;text-transform:none}',
      '#palette-switch .ps-legacy button.is-on{box-shadow:none;border-color:#d4af37;color:#f0e2bd}',
      '@media (max-width:640px){#palette-switch{width:12.5rem;left:.6rem;bottom:.6rem}',
      '#palette-switch .ps-t span{display:none}}',
      '@media print{#palette-switch{display:none}}'
    ].join('');
    document.head.appendChild(css);

    var box = document.createElement('div');
    box.id = 'palette-switch';
    var html = '<header><span>Palette</span><b>' +
      '<span class="ps-label">' + label() + '</span></b><span class="ps-chev">▾</span></header><div class="ps-body">';
    TONES.forEach(function (t) {
      html += '<button type="button" data-tone-id="' + t.id + '" title="' + t.note + '"><span class="ps-sw">' +
        t.sw.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') +
        '</span><span class="ps-t"><b>' + t.id.toUpperCase() + ' · ' + t.name + '</b><span>' + t.note + '</span></span></button>';
    });
    html += '<div class="ps-legacy">Earlier schemes';
    LEGACY.forEach(function (l) {
      html += '<button type="button" data-legacy="' + l.id + '" title="' + l.note + '">' + l.name + '</button>';
    });
    html += '</div></div>';
    box.innerHTML = html;

    box.querySelector('header').addEventListener('click', function () {
      box.classList.toggle('is-shut');
      box.querySelector('.ps-chev').textContent = box.classList.contains('is-shut') ? '▸' : '▾';
    });
    box.addEventListener('click', function (e) {
      var t = e.target.closest('[data-tone-id]');
      if (t) { palette = 'c'; tone = t.dataset.toneId; apply(); relabel(box); return; }
      var l = e.target.closest('[data-legacy]');
      if (l) { palette = l.dataset.legacy; apply(); relabel(box); }
    });
    document.body.appendChild(box);
    apply();
  }

  function label() {
    if (palette !== 'c') return palette.toUpperCase();
    for (var i = 0; i < TONES.length; i++) if (TONES[i].id === tone) return TONES[i].name;
    return 'Kin Byōbu';
  }
  function relabel(box) { box.querySelector('.ps-label').textContent = label(); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build, { once: true });
  else build();
})();
