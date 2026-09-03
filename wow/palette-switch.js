/*
  Palette switch — a review control, not part of the site.

  Puts a small A|B pair at the bottom-left so the two colour schemes can be
  compared in place rather than from screenshots. The choice is remembered per
  browser. Delete this file and its two lines in index.html before launch;
  removing it leaves palette A exactly as it was.
*/
(function () {
  var KEY = 'shiraume-palette';
  var stored;
  try { stored = localStorage.getItem(KEY); } catch (e) { stored = null; }
  var current = stored === 'b' ? 'b' : 'a';

  function apply(which) {
    current = which;
    if (which === 'b') document.documentElement.setAttribute('data-palette', 'b');
    else document.documentElement.removeAttribute('data-palette');
    try { localStorage.setItem(KEY, which); } catch (e) { /* private window: this session only */ }
    var box = document.getElementById('palette-switch');
    if (box) box.querySelectorAll('button').forEach(function (btn) {
      var on = btn.dataset.palette === which;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  // Set before first paint so the page never flashes the other scheme.
  apply(current);

  function build() {
    if (document.getElementById('palette-switch')) return;
    var css = document.createElement('style');
    css.textContent = '#palette-switch{position:fixed;left:1.2rem;bottom:1.2rem;z-index:500;' +
      'display:flex;align-items:center;gap:.4rem;padding:.4rem .5rem;border-radius:2rem;' +
      'background:rgba(18,16,14,.9);border:1px solid rgba(185,154,103,.4);' +
      'font:400 .62rem/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;' +
      'box-shadow:0 .4rem 1.6rem rgba(0,0,0,.35)}' +
      '#palette-switch span{color:rgba(238,232,222,.5);padding-left:.25rem}' +
      '#palette-switch button{appearance:none;cursor:pointer;width:1.7rem;height:1.7rem;' +
      'border-radius:50%;border:1px solid rgba(238,232,222,.22);background:transparent;' +
      'color:rgba(238,232,222,.62);font:inherit;letter-spacing:0;transition:all .2s ease}' +
      '#palette-switch button:hover{border-color:rgba(238,232,222,.5);color:#efe8de}' +
      '#palette-switch button.is-on[data-palette="a"]{background:#c6a4a0;border-color:#c6a4a0;color:#1a1514}' +
      '#palette-switch button.is-on[data-palette="b"]{background:#b99a67;border-color:#b99a67;color:#1a1514}' +
      '@media print{#palette-switch{display:none}}';
    document.head.appendChild(css);

    var box = document.createElement('div');
    box.id = 'palette-switch';
    box.innerHTML = '<span>Palette</span>' +
      '<button type="button" data-palette="a" title="A — Moonlit Cedar, as delivered">A</button>' +
      '<button type="button" data-palette="b" title="B — Kin Byobu: ivory and gold, indigo chambers">B</button>';
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-palette]');
      if (b) apply(b.dataset.palette);
    });
    document.body.appendChild(box);
    apply(current);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build, { once: true });
  else build();
})();
