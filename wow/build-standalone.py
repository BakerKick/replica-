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
kb_css, kb_js = read('design-kinbyobu.css'), read('design-kinbyobu.js')
scenes_css = read('kb-scenes.css')
switch_js = read('palette-switch.js')

# Max render width and JPEG quality per image, from how large each one ever
# appears: hero and room headers go full-bleed, gallery seconds never do.
IMG = {
    # Retuned to bring the single-file build down. Every figure is still well
    # above the size each image is actually displayed at — the room photos sit
    # in a ~310px window, the gallery seconds smaller again — so this trades
    # headroom nobody sees for about a third of the file.
    'hero-day.jpg': (1200, 64), 'hero-night.jpg': (1200, 64),
    'story.jpg': (940, 68), 'area.jpg': (940, 68),
    'room-koke.jpg': (860, 66), 'room-shizuka.jpg': (860, 66),
    'room-yamabiko.jpg': (860, 66), 'room-hinoki.jpg': (860, 66),
    'room-higashiyama.jpg': (860, 66),
    's2-room-koke.jpg': (640, 64), 's2-room-shizuka.jpg': (640, 64),
    's2-room-yamabiko.jpg': (640, 64), 's2-room-hinoki.jpg': (640, 64),
    's2-room-higashiyama.jpg': (640, 64),
    # the two supplied drawings: fine linework, so they keep more width than
    # quality — detail survives compression better than it survives scaling
    'hikosan-engraving.jpg': (780, 64),
    'lanterns.jpg': (660, 68),
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
        # Encode both ways and keep whichever is smaller. WebP is 25-35% ahead
        # on the photographs; on the two supplied pen drawings, whose dense
        # stipple defeats both codecs, JPEG sometimes still wins. Measuring is
        # cheaper than guessing per file.
        w, q = IMG[name]
        if im.width > w:
            im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        rgb = im.convert('RGB')
        jpg = io.BytesIO(); rgb.save(jpg, 'JPEG', quality=q, optimize=True, progressive=True)
        web = io.BytesIO(); rgb.save(web, 'WEBP', quality=min(q + 4, 82), method=6)
        if len(web.getvalue()) < len(jpg.getvalue()):
            buf, mime = web, 'image/webp'
        else:
            buf, mime = jpg, 'image/jpeg'
    return 'data:%s;base64,%s' % (mime, base64.b64encode(buf.getvalue()).decode())


def prune_fonts(css, *sources):
    """Drop @font-face blocks whose unicode-range covers nothing on the page.

    Noto Serif JP ships as ~124 subsets split by codepoint range, and the
    standalone was embedding every one of them — 733 KB, most of it glyphs this
    site never sets. A face is kept only if the page actually uses a character
    inside its range, which is exactly the rule the browser itself applies, so
    nothing renders differently; the untouched subsets would simply never have
    been downloaded on the multi-file site.
    """
    used = set()
    for s in sources:
        used.update(ord(ch) for ch in s)

    def covered(rng):
        for part in rng.split(','):
            part = part.strip()
            if not part.upper().startswith('U+'):
                continue
            body = part[2:]
            if '-' in body:
                lo, hi = body.split('-', 1)
                lo, hi = int(lo, 16), int(hi, 16)
            elif '?' in body:
                lo = int(body.replace('?', '0'), 16)
                hi = int(body.replace('?', 'F'), 16)
            else:
                lo = hi = int(body, 16)
            if any(lo <= cp <= hi for cp in used):
                return True
        return False

    kept, dropped, saved = [], 0, 0
    pos = 0
    out = []
    for m in re.finditer(r'@font-face\s*\{[^}]*\}', css, re.S):
        out.append(css[pos:m.start()])
        pos = m.end()
        block = m.group(0)
        rng = re.search(r'unicode-range:\s*([^;}]+)', block)
        if rng and not covered(rng.group(1)):
            dropped += 1
            saved += sum(len(d) for d in re.findall(r'base64,([A-Za-z0-9+/=]+)', block))
            continue
        out.append(block)
    out.append(css[pos:])
    print(f'  fonts: dropped {dropped} unused subsets, {saved / 1024:.0f} KB of base64')
    return ''.join(out)

key = lambda n: re.sub(r'[^a-z0-9]+', '-', n.rsplit('.', 1)[0].lower())
used = sorted(set(re.findall(r'assets/img/([\w.-]+\.(?:jpg|png))',
                            html + style + enhance + js + splash_css + splash_js + wow_css + wow_js + kb_css + kb_js + scenes_css)))
assets = {key(n): encode(n) for n in used}

# Point every reference at the single embedded copy.
for n in used:
    pat = r"url\(['\"]?assets/img/" + re.escape(n) + r"['\"]?\)"
    style = re.sub(pat, f'var(--a-{key(n)})', style)
    enhance = re.sub(pat, f'var(--a-{key(n)})', enhance)
    wow_css = re.sub(pat, f'var(--a-{key(n)})', wow_css)
    kb_css = re.sub(pat, f'var(--a-{key(n)})', kb_css)
    scenes_css = re.sub(pat, f'var(--a-{key(n)})', scenes_css)
    for q in ("'", '"'):
        kb_js = kb_js.replace(f"{q}assets/img/{n}{q}", f"A[{q}{key(n)}{q}]")
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

leftover = re.findall(r'assets/img/[\w.-]+', html + style + enhance + js + wow_css + wow_js + kb_css + kb_js + scenes_css)
assert not leftover, f'unresolved asset references: {leftover}'

fonts_css = prune_fonts(fonts_css, html, js, wow_js, kb_js, switch_js, style, enhance, splash_js, luxe_js)

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
html = html.replace('<link rel="stylesheet" href="./design-kinbyobu.css">',
                    '<style>\n' + kb_css + '\n</style>')
html = html.replace('<link rel="stylesheet" href="./kb-scenes.css">',
                    '<style>\n' + scenes_css + '\n</style>')
html = html.replace('<script src="./shiraume-wow.js"></script>', '<script>\n' + wow_js + '\n</script>')
html = html.replace('<script src="./design-kinbyobu.js"></script>', '<script>\n' + kb_js + '\n</script>')
html = html.replace('<script src="./palette-switch.js"></script>', '<script>\n' + switch_js + '\n</script>')

for tag in ('href="./style.css"', 'src="./main.js"',
            'href="./assets/splash/shiraume-splash.css"',
            'src="./assets/splash/shiraume-splash.js"',
            'href="./assets/splash/splash-luxe.css"',
            'src="./assets/splash/splash-luxe.js"',
            'href="./shiraume-wow.css"', 'src="./shiraume-wow.js"',
            'href="./design-kinbyobu.css"', 'src="./design-kinbyobu.js"',
            'href="./kb-scenes.css"',
            'src="./palette-switch.js"'):
    assert tag not in html, f'not inlined: {tag}'
open(OUT, 'w', encoding='utf-8').write(html)
print(f'{OUT}  {os.path.getsize(OUT) / 1024 / 1024:.2f} MB')
