#!/usr/bin/env python3
"""
Generate palette-tones.css — five alternative colourways for the palette C
design, as overrides rather than as edits.

The design is already token-driven for most of its surface, but around ninety
literal colours remain: the per-section papers, the engraved-scene strokes
inside the SVG data URIs, the burgundy obi, the light type that sits on dark
grounds. A tone that only redefined the tokens would leave all of those behind.

So instead of hand-mapping ninety colours five times, every literal colour is
classified into one of five families by its own hue, saturation and lightness,
and then moved by the same amount its family anchor moves. Lightness shifts
only by the anchor's own delta, which is what keeps the measured text contrast
of palette C intact under every tone.

Writes palette-tones.css. Nothing else is touched; C1 is the untouched design.
"""
import colorsys, re, sys

# ── the five roles, as the C1 design uses them ──────────────────────────────
ANCHOR = {
    'paper':    '#f2ece0',
    'ink':      '#17171a',
    'chamber':  '#16233d',
    'ceremony': '#6e1f2a',
    'metal':    '#d4af37',
}

TONES = {
    'c2': ('Shiro Ume',     dict(paper='#f6f3ee', ink='#1f1c22', chamber='#2a2530', ceremony='#7d3348', metal='#c9a961')),
    'c3': ('Kurogane Ake',  dict(paper='#efe6d9', ink='#14100f', chamber='#1a0f11', ceremony='#8c2b23', metal='#c08a2e')),
    'c4': ('Ao Sumi',       dict(paper='#eef0ec', ink='#131a24', chamber='#0f1c2e', ceremony='#5c4a6b', metal='#b8a06a')),
    'c5': ('Kohaku',        dict(paper='#f4ead8', ink='#211a12', chamber='#2b1d14', ceremony='#9c5a2c', metal='#d9b055')),
    'c6': ('Matsu Gin',     dict(paper='#f1f0e9', ink='#161a17', chamber='#14241d', ceremony='#7a3b34', metal='#b9b4a4')),
}

# ── colour space ────────────────────────────────────────────────────────────
def to_rgb(h):
    h = h.lstrip('#')
    if len(h) == 3: h = ''.join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def to_hex(rgb):
    return '#%02x%02x%02x' % tuple(max(0, min(255, int(round(c)))) for c in rgb)

def hsl(rgb):
    r, g, b = (c / 255 for c in rgb)
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return h * 360, s, l

def rgb(h, s, l):
    r, g, b = colorsys.hls_to_rgb((h % 360) / 360, max(0, min(1, l)), max(0, min(1, s)))
    return r * 255, g * 255, b * 255

AH = {k: hsl(to_rgb(v)) for k, v in ANCHOR.items()}

def family(h, s, l):
    """Which of the five roles does this colour belong to."""
    if s <= .12:
        return 'paper' if l >= .55 else 'ink'
    if l >= .88:
        return 'paper'
    if 15 <= h <= 70 and s <= .35 and l >= .55:
        return 'paper'          # warm light neutrals are paper, not metal
    def dist(a):
        d = abs(h - a) % 360
        return min(d, 360 - d)
    return min((('metal', dist(46)), ('ceremony', dist(352)), ('chamber', dist(220))),
               key=lambda p: p[1])[0]

def luminance(rgb_in):
    """WCAG relative luminance — the quantity contrast is actually measured on."""
    def ch(c):
        c /= 255
        return c / 12.92 if c <= .03928 else ((c + .055) / 1.055) ** 2.4
    r, g, b = (ch(c) for c in rgb_in)
    return .2126 * r + .7152 * g + .0722 * b

def at_luminance(h, s, y):
    """The colour of this hue and saturation whose relative luminance is y."""
    lo, hi = 0.0, 1.0
    for _ in range(24):
        mid = (lo + hi) / 2
        if luminance(rgb(h, s, mid)) < y: lo = mid
        else: hi = mid
    return rgb(h, s, (lo + hi) / 2)

# Ink carries every word on the page, so the ink family moves in hue
# and saturation only: each colour is rebuilt at its own original luminance, so
# type never lightens toward the paper it sits on. Paper and the three pigment
# families may shift in value; the papers stay within a few percent of C1's.
KEEP_LUMINANCE = ('ink',)

def move(rgb_in, target):
    h, s, l = hsl(rgb_in)
    fam = family(h, s, l)
    ah, as_, al = AH[fam]
    th, ts, tl = hsl(to_rgb(target[fam]))
    nh = h + (th - ah)
    ns = s * (ts / as_) if as_ > .05 else s
    if fam == 'ink':
        ns = min(ns, .55)       # ink family is near-neutral; never let it colour up
    ns = min(1, max(0, ns))
    if fam in KEEP_LUMINANCE:
        return at_luminance(nh, ns, luminance(rgb_in))
    out = rgb(nh, ns, l + (tl - al))
    if fam == 'metal' and luminance(out) > luminance(rgb_in):
        # Gold is type as well as ornament — eyebrows, the room links, the
        # cipher. A tone may take it darker, never lighter than palette C's.
        out = at_luminance(nh, ns, luminance(rgb_in))
    return out

# ── colour literals inside CSS, including the ones hidden in data URIs ──────
HEX     = re.compile(r'(?<![\w])#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b')
URI_HEX = re.compile(r'%23([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b')
FUNC    = re.compile(r'\brgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*([,)])')

NEUTRAL = {(0, 0, 0), (255, 255, 255)}   # masks, shadows and veils stay put

def recolour(css, target):
    def hx(m, pre='#'):
        c = to_rgb(m.group(1))
        return pre + m.group(1) if c in NEUTRAL else pre + to_hex(move(c, target)).lstrip('#')
    css = HEX.sub(lambda m: hx(m, '#'), css)
    css = URI_HEX.sub(lambda m: hx(m, '%23'), css)
    def fn(m):
        c = (int(m.group(1)), int(m.group(2)), int(m.group(3)))
        if c in NEUTRAL: return m.group(0)
        r, g, b = (int(round(v)) for v in move(c, target))
        return m.group(0)[:m.group(0).index('(') + 1] + f'{r}, {g}, {b}' + m.group(4)
    return FUNC.sub(fn, css)

# Any property that can put colour on the page. A rule that sets one of these
# has to be copied even when its value is a token rather than a literal —
# otherwise the tone copy of an earlier, weaker rule would outrank a later,
# stronger base rule that the copy left behind, and the cascade would invert.
COLOUR_PROP = re.compile(
    r'(^|[;{\s])(-webkit-)?('
    r'color|background|background-color|background-image|border|border-color|'
    r'border-[a-z]+-color|border-[a-z]+|outline|outline-color|fill|stroke|'
    r'box-shadow|text-shadow|text-fill-color|text-decoration-color|caret-color|'
    r'text-emphasis-color|column-rule-color|accent-color'
    r')\s*:')

def has_colour(body):
    for m in HEX.finditer(body):
        if to_rgb(m.group(1)) not in NEUTRAL: return True
    for m in URI_HEX.finditer(body):
        if to_rgb(m.group(1)) not in NEUTRAL: return True
    for m in FUNC.finditer(body):
        if (int(m.group(1)), int(m.group(2)), int(m.group(3))) not in NEUTRAL: return True
    return '--kb-' in body or bool(COLOUR_PROP.search(body))

# ── a small CSS walker: enough for these two files ──────────────────────────
def rules(css):
    """Yield (selector, body) pairs, descending into @media, skipping @keyframes."""
    i, n = 0, len(css)
    while i < n:
        # skip comments and whitespace
        if css.startswith('/*', i):
            i = css.index('*/', i) + 2; continue
        if css[i].isspace():
            i += 1; continue
        j, depth = i, 0
        while j < n:
            if css.startswith('/*', j): j = css.index('*/', j) + 2; continue
            if css[j] == '{': break
            j += 1
        prelude = css[i:j].strip()
        depth, k = 1, j + 1
        while k < n and depth:
            if css.startswith('/*', k): k = css.index('*/', k) + 2; continue
            if css[k] == '{': depth += 1
            elif css[k] == '}': depth -= 1
            k += 1
        body = css[j + 1:k - 1]
        if prelude.startswith('@media') or prelude.startswith('@supports'):
            for sel, b in rules(body):
                yield prelude + ' { ' + sel, b + ' }'
        elif prelude.startswith('@'):
            pass                                   # keyframes and friends: left alone
        else:
            yield prelude, body
        i = k

def split_selectors(sel):
    """Split a selector list on commas that are not inside :is(), :not() etc."""
    out, depth, buf = [], 0, ''
    for ch in sel:
        if ch == '(': depth += 1
        elif ch == ')': depth -= 1
        if ch == ',' and depth == 0:
            out.append(buf); buf = ''
        else:
            buf += ch
    out.append(buf)
    return out

def scope(selector, tone):
    """Add the tone attribute to the leading html of every selector in the list."""
    out = []
    for sel in split_selectors(selector):
        sel = sel.strip()
        if not sel: continue
        if sel.startswith('@'):                    # the '@media { sel' form from above
            head, rest = sel.split('{', 1)
            out.append(head + '{ ' + scope(rest, tone))
        elif sel.startswith('html'):
            out.append('html[data-tone="%s"]' % tone + sel[4:])
        else:
            out.append('html[data-tone="%s"] ' % tone + sel)
    return ', '.join(out)

def main():
    src = ''.join(open(f).read() for f in ('design-kinbyobu.css', 'kb-scenes.css'))
    parts = ['/* palette-tones.css — generated by make-tones.py, do not hand-edit.\n'
             '   Five colourways over the palette C design. C1 is the file it came from;\n'
             '   C2-C6 are these overrides, keyed on data-tone on <html>. */\n']
    for tone, (name, target) in TONES.items():
        parts.append('\n/* ══ %s / %s ══════════════════════════════════════ */\n' % (tone.upper(), name))
        kept = 0
        for sel, body in rules(src):
            if not has_colour(body): continue
            parts.append('%s {%s}\n' % (scope(sel, tone), recolour(body, target)))
            kept += 1
        print('%s %-14s %3d rules' % (tone, name, kept), file=sys.stderr)
    out = ''.join(parts)
    assert out.count('{') == out.count('}'), 'unbalanced braces'
    open('palette-tones.css', 'w').write(out)
    print('palette-tones.css  %.1f KB' % (len(out) / 1024), file=sys.stderr)

main()
