# -*- coding: utf-8 -*-
"""Bundle the site into one double-clickable HTML file.

file:// pages cannot load ES modules, so three.js is rewritten from an ES
module into a classic script that hands back a THREE namespace object.
"""
import base64, os, re, pathlib

ROOT = pathlib.Path('/home/user/shiraume-lodge')
OUT  = ROOT / 'shiraume-lodge-standalone.html'

html  = (ROOT / 'index.html').read_text(encoding='utf-8')
three = (ROOT / 'vendor/three.module.min.js').read_text(encoding='utf-8')
lodge = (ROOT / 'lodge-3d.js').read_text(encoding='utf-8')


# ── three.js: ES module → classic script ────────────────────────────────
i = three.rindex('export{')
body, exports = three[:i], three[i + len('export{'):]
exports = exports.rstrip().rstrip(';').rstrip().rstrip('}')

pairs = []
for entry in exports.split(','):
    entry = entry.strip()
    if not entry:
        continue
    m = re.fullmatch(r'(\S+)\s+as\s+(\S+)', entry)
    local, name = m.groups() if m else (entry, entry)
    pairs.append((name, local))
assert len(pairs) > 300, len(pairs)
assert dict(pairs)['WebGLRenderer'], 'export map looks wrong'

three_classic = (
    '/* three.js r169 (MIT) — rewritten from an ES module to a classic\n'
    '   script so this page runs straight off the filesystem. */\n'
    'var THREE = (function () {\n"use strict";\n'
    + body
    + '\nreturn {' + ','.join('%s:%s' % (n, l) for n, l in pairs) + '};\n})();\n'
)

# ── the model module: drop its import, it now reads THREE from scope ────
lodge_classic, n = re.subn(r"^import \* as THREE from '[^']+';\n", '', lodge, flags=re.M)
assert n == 1
lodge_classic = '(function () {\n"use strict";\n' + lodge_classic + '\n})();\n'

script = ('<script>\n' + three_classic + '\n' + lodge_classic + '</script>')
old_script = '<script type="module" src="./lodge-3d.js"></script>'
assert html.count(old_script) == 1
html = html.replace(old_script, script)

# ── stylesheets ─────────────────────────────────────────────────────────
for name in ('base.css', 'style.css'):
    tag = '<link rel="stylesheet" href="./%s" />' % name
    assert html.count(tag) == 1, tag
    css = (ROOT / name).read_text(encoding='utf-8')
    html = html.replace(tag, '<style>\n/* %s */\n%s\n</style>' % (name, css))

# ── images ──────────────────────────────────────────────────────────────
uris = {}
for png in sorted((ROOT / 'assets').glob('*.png')):
    uris[png.name] = 'data:image/png;base64,' + base64.b64encode(png.read_bytes()).decode()

# style.css points .hero-bg at an assets/hero.jpg that isn't in the repo; the
# markup's inline background overrides it, so this just keeps the bundle from
# carrying a reference to a file that doesn't exist.
aliases = {'hero.jpg': 'hero.png'}

for ref in sorted(set(re.findall(r'\./assets/[\w.-]+', html))):
    name = ref.rsplit('/', 1)[1]
    uri = uris.get(name) or uris[aliases[name]]
    html = html.replace(ref, uri)

leftovers = re.findall(r'\./(?:assets/[\w.-]+|[\w.-]+\.(?:css|js))', html)
assert not leftovers, leftovers

OUT.write_text(html, encoding='utf-8')
print('wrote %s  (%.2f MB, %d three.js exports)' % (OUT.name, OUT.stat().st_size / 1e6, len(pairs)))
