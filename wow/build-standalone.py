#!/usr/bin/env python3
"""Build the single-file version of the site: one .html you can email or
open straight from disk, with fonts and images embedded.

    python3 build-standalone.py [output.html]

Needs Pillow (`pip install pillow`) to recompress the images. Everything
else comes from the repo, so the build is reproducible without any
external downloads.

Three things keep the file small enough to attach to an email:
  * fonts come from assets/fonts-subset.css, already cut down to the
    characters this site uses;
  * images are recompressed to the size they are actually displayed at;
  * each asset is embedded exactly once and referenced by name, rather
    than repeated for every place it appears (the room photos alone are
    used four times each).
"""
import base64, io, json, os, re, sys

try:
    from PIL import Image
except ImportError:
    sys.exit('Pillow is required: pip install pillow')

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'Shiraume-Lodge-MoonlitCedar.html')

read = lambda *p: open(os.path.join(HERE, *p), encoding='utf-8').read()
html, style, enhance, js = read('index.html'), read('style.css'), read('enhance.css'), read('main.js')
fonts_css = read('assets', 'fonts-subset.css')
splash_css, splash_js = read('assets', 'splash', 'shiraume-splash.css'), read('assets', 'splash', 'shiraume-splash.js')
luxe_css, luxe_js = read('assets', 'splash', 'splash-luxe.css'), read('assets', 'splash', 'splash-luxe.js')
wow_css, wow_js = read('shiraume-wow.css'), read('shiraume-wow.js')
palb_css, switch_js = read('shiraume-palette-b.css'), read('palette-switch.js')

# Max render width and JPEG quality per image, from how large each one ever
# appears: hero and room headers go full-bleed, gallery seconds never do.
IMG = {
    'hero-day.jpg': (1376, 70), 'hero-night.jpg': (1376, 70),
    'story.jpg': (1100, 74), 'area.jpg': (1100, 74),
    'room-koke.jpg': (1000, 72), 'room-shizuka.jpg': (1000, 72),
    'room-yamabiko.jpg': (1000, 72), 'room-hinoki.jpg': (1000, 72),
    'room-higashiyama.jpg': (1000, 72),
    's2-room-koke.jpg': (760, 70), 's2-room-shizuka.jpg': (760, 70),
    's2-room-yamabiko.jpg': (760, 70), 's2-room-hinoki.jpg': (760, 70),
    's2-room-higashiyama.jpg': (760, 70),
}


def encode(name):
    im = Image.open(os.path.join(HERE, 'assets/img', name))
    buf = io.BytesIO()
    if name.startswith('ume-branch'):
        # The branch artwork is used as a mask and tinted underneath, so the
        # only channel that carries anything is alpha. Flattening luminance
        # to black keeps the shape exactly and compresses to almost nothing;
        # the size is left alone, because the detail is the point.
        flat = Image.merge('LA', (Image.new('L', im.size, 0), im.convert('RGBA').getchannel('A')))
        flat.save(buf, 'PNG', optimize=True)
        mime = 'image/png'
    elif name.endswith('.png'):
        # The ink logo is recoloured with CSS filters, so luminance plus alpha
        # is all the page ever uses — half the channels, same appearance.
        im.convert('LA').resize((320, 320), Image.LANCZOS).save(buf, 'PNG', optimize=True)
        mime = 'image/png'
    else:
        w, q = IMG[name]
        if im.width > w:
            im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        im.convert('RGB').save(buf, 'JPEG', quality=q, optimize=True, progressive=True)
        mime = 'image/jpeg'
    return 'data:%s;base64,%s' % (mime, base64.b64encode(buf.getvalue()).decode())


key = lambda n: re.sub(r'[^a-z0-9]+', '-', n.rsplit('.', 1)[0].lower())
used = sorted(set(re.findall(r'assets/img/([\w.-]+\.(?:jpg|png))',
                            html + style + enhance + js + splash_css + splash_js + wow_css + wow_js + palb_css)))
assets = {key(n): encode(n) for n in used}

# Point every reference at the single embedded copy.
for n in used:
    pat = r"url\(['\"]?assets/img/" + re.escape(n) + r"['\"]?\)"
    style = re.sub(pat, f'var(--a-{key(n)})', style)
    enhance = re.sub(pat, f'var(--a-{key(n)})', enhance)
    wow_css = re.sub(pat, f'var(--a-{key(n)})', wow_css)
    palb_css = re.sub(pat, f'var(--a-{key(n)})', palb_css)
    # main.js quotes these with ', the Moonlit Cedar module with " — take both
    for q in ("'", '"'):
        js = js.replace(f"{q}assets/img/{n}{q}", f"A[{q}{key(n)}{q}]")
        wow_js = wow_js.replace(f"{q}assets/img/{n}{q}", f"A[{q}{key(n)}{q}]")
html = re.sub(r'(<img[^>]*?)src="assets/img/([\w.-]+\.(?:jpg|png))"',
              lambda m: f'{m.group(1)}data-a="{key(m.group(2))}"', html)

# og:image names a file path for link-preview scrapers. A single file sent
# by email has no URL for anything to fetch, and inlining the photograph as
# a data URI inside a <meta> tag would just add a megabyte nobody reads —
# so the tag comes out of the standalone copy.
html = re.sub(r'\n\s*<!-- Relative path:.*?-->', '', html, flags=re.S)
html = re.sub(r'\n\s*<meta property="og:image[^>]*>', '', html)

leftover = re.findall(r'assets/img/[\w.-]+', html + style + enhance + js + wow_css + wow_js + palb_css)
assert not leftover, f'unresolved asset references: {leftover}'

asset_js = (
    'var A = ' + json.dumps(assets, ensure_ascii=False) + ';\n'
    '(function () {\n'
    '  var root = document.documentElement;\n'
    '  for (var k in A) root.style.setProperty("--a-" + k, "url(" + A[k] + ")");\n'
    '  function paint() {\n'
    '    document.querySelectorAll("img[data-a]").forEach(function (im) {\n'
    '      im.src = A[im.getAttribute("data-a")];\n'
    '    });\n'
    '  }\n'
    '  paint();\n'
    '  document.addEventListener("DOMContentLoaded", paint);\n'
    '})();\n'
)

html = re.sub(r'\s*<link rel="preconnect"[^>]*>\s*<link rel="preconnect"[^>]*>\s*'
              r'<link href="https://fonts\.googleapis\.com[^"]*"[^>]*>', '', html)
html = html.replace('<link rel="stylesheet" href="./style.css">',
                    '<style>\n' + fonts_css + '\n</style>\n  <style>\n' + style + '\n</style>')
html = html.replace('<link rel="stylesheet" href="./enhance.css">',
                    '<style>\n' + enhance + '\n</style>')
html = html.replace('<link rel="stylesheet" href="./assets/splash/shiraume-splash.css">',
                    '<style>\n' + splash_css + '\n</style>')
html = html.replace('<link rel="stylesheet" href="./assets/splash/splash-luxe.css">',
                    '<style>\n' + luxe_css + '\n</style>')
html = html.replace('<script src="./assets/splash/shiraume-splash.js"></script>',
                    '<script>\n' + splash_js + '\n</script>')
html = html.replace('<script src="./assets/splash/splash-luxe.js"></script>',
                    '<script>\n' + luxe_js + '\n</script>')
# The asset map has to be in place before anything paints or reads it.
html = html.replace('<body class="hero-enhanced">',
                    '<body class="hero-enhanced">\n<script>\n' + asset_js + '</script>')
html = html.replace('<link rel="stylesheet" href="./shiraume-wow.css">',
                    '<style>\n' + wow_css + '\n</style>')
html = html.replace('<script src="./main.js"></script>', '<script>\n' + js + '\n</script>')
# The enhancement runs last, exactly as the linked build loads it.
html = html.replace('<link rel="stylesheet" href="./shiraume-palette-b.css">',
                    '<style>\n' + palb_css + '\n</style>')
html = html.replace('<script src="./shiraume-wow.js"></script>', '<script>\n' + wow_js + '\n</script>')
html = html.replace('<script src="./palette-switch.js"></script>', '<script>\n' + switch_js + '\n</script>')

for tag in ('href="./style.css"', 'src="./main.js"',
            'href="./assets/splash/shiraume-splash.css"',
            'src="./assets/splash/shiraume-splash.js"',
            'href="./assets/splash/splash-luxe.css"',
            'src="./assets/splash/splash-luxe.js"',
            'href="./shiraume-wow.css"', 'src="./shiraume-wow.js"',
            'href="./shiraume-palette-b.css"', 'src="./palette-switch.js"'):
    assert tag not in html, f'not inlined: {tag}'
open(OUT, 'w', encoding='utf-8').write(html)
print(f'{OUT}  {os.path.getsize(OUT) / 1024 / 1024:.2f} MB')
