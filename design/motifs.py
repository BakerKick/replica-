# -*- coding: utf-8 -*-
"""Original artwork for Shiraume Lodge, authored here rather than borrowed.
Each motif is emitted as a URL-encoded SVG data URI for use as a CSS background."""
import io, urllib.parse, os

OUT = os.path.dirname(os.path.abspath(__file__))

def uri(svg):
    svg = ' '.join(svg.split())                     # collapse whitespace
    return "url(\"data:image/svg+xml,%s\")" % urllib.parse.quote(svg, safe="")

def wrap(w, h, body, extra=''):
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" '
            'viewBox="0 0 %d %d" %s>%s</svg>') % (w, h, w, h, extra, body)

# ── 梅 · the plum blossom, five petals around a heart ──────────────────
def blossom(cx, cy, r, fill, stroke=None, sw=1.0, rot=0):
    """Five near-circular petals set round a small heart. Plum petals are
    round -- drawing them as pointed teardrops produced a daisy."""
    import math
    at = 'fill="%s"' % fill
    if stroke:
        at += ' stroke="%s" stroke-width="%.2f"' % (stroke, sw)
    out = ''
    pr = r * 0.46          # petal radius
    pd = r * 0.56          # how far the petal sits from the heart
    for i in range(5):
        a = math.radians(rot + i * 72 - 90)
        out += '<circle cx="%.1f" cy="%.1f" r="%.1f" %s/>' % (
            cx + pd*math.cos(a), cy + pd*math.sin(a), pr, at)
    # the heart, and a few stamens radiating from it
    sc = stroke or fill
    for i in range(6):
        a = math.radians(rot + i * 60 + 12)
        out += ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" '
                'stroke-width="%.2f" stroke-linecap="round" opacity="0.7"/>'
                % (cx, cy, cx + r*0.42*math.cos(a), cy + r*0.42*math.sin(a), sc, max(sw*0.6, 0.6)))
    out += '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="%s" opacity="0.85"/>' % (cx, cy, r*0.11, sc)
    return out

# 1 ── scattered plum, a quiet repeating field
def plum_field(col, op):
    b = ''
    for (x, y, r, rot) in [(40,46,17,8),(150,30,12,40),(96,132,14,66),(186,150,18,20),(18,168,11,52)]:
        b += '<g opacity="%.3f">%s</g>' % (op, blossom(x, y, r, 'none', col, 1.3, rot))
    return uri(wrap(220, 200, b))

# 2 ── one large blossom, for a corner accent
def plum_large(col, op):
    # A cluster rather than one giant bloom: at 150px radius the five
    # petals separate visibly and stop reading as a flower.
    b = ''
    for (x, y, r, rot) in [(150,150,58,10),(268,236,40,52),(96,272,34,28)]:
        b += blossom(x, y, r, 'none', col, r*0.055, rot)
    return uri(wrap(380, 380, '<g opacity="%.3f">%s</g>' % (op, b)))

# 3 ── 枝 · a plum branch in ink, blossoms at the nodes
def plum_branch(col, op):
    b = ('<path d="M-10,300 C120,282 210,246 300,190 C372,145 448,96 560,66" fill="none" '
         'stroke="%s" stroke-width="7" stroke-linecap="round" opacity="%.3f"/>' % (col, op))
    b += ('<path d="M170,262 C205,228 232,196 246,150" fill="none" stroke="%s" '
          'stroke-width="4" stroke-linecap="round" opacity="%.3f"/>' % (col, op))
    b += ('<path d="M356,158 C388,178 420,190 470,196" fill="none" stroke="%s" '
          'stroke-width="3.4" stroke-linecap="round" opacity="%.3f"/>' % (col, op))
    b += ('<path d="M300,190 C312,232 322,258 318,296" fill="none" stroke="%s" '
          'stroke-width="3" stroke-linecap="round" opacity="%.3f"/>' % (col, op))
    for (x, y, r, rot) in [(246,146,26,10),(470,196,22,55),(318,300,20,30),(560,66,24,80),(120,283,18,20),(392,120,16,44)]:
        b += '<g opacity="%.3f">%s</g>' % (op*1.15, blossom(x, y, r, 'none', col, 2.2, rot))
    return uri(wrap(600, 340, b))

# 4 ── 枯山水 · raked gravel drawn round two stones
def karesansui(col, op):
    b = ''
    for i in range(9):
        rr = 26 + i*17
        b += ('<ellipse cx="118" cy="150" rx="%.0f" ry="%.0f" fill="none" stroke="%s" '
              'stroke-width="1.5" opacity="%.3f"/>' % (rr, rr*0.72, col, op))
    for i in range(7):
        rr = 20 + i*17
        b += ('<ellipse cx="400" cy="250" rx="%.0f" ry="%.0f" fill="none" stroke="%s" '
              'stroke-width="1.5" opacity="%.3f"/>' % (rr, rr*0.7, col, op*0.85))
    # the stones themselves
    b += ('<path d="M96,138 C104,120 132,116 142,132 C150,146 138,162 118,163 C102,164 90,152 96,138 Z" '
          'fill="%s" opacity="%.3f"/>' % (col, op*2.1))
    b += ('<path d="M386,240 C392,228 412,226 418,238 C424,250 412,260 400,259 C390,258 382,250 386,240 Z" '
          'fill="%s" opacity="%.3f"/>' % (col, op*1.8))
    return uri(wrap(560, 380, b))

# 5 ── 彦山 · the ridge, in layers, with mist between
def ridge(c1, c2, c3, op):
    b  = ('<path d="M0,300 L120,196 L190,238 L286,150 L360,206 L452,128 L560,214 L680,150 L800,236 L800,400 L0,400 Z" '
          'fill="%s" opacity="%.3f"/>' % (c3, op*0.55))
    b += ('<path d="M0,340 L96,262 L188,300 L280,224 L372,286 L470,220 L580,290 L700,232 L800,296 L800,400 L0,400 Z" '
          'fill="%s" opacity="%.3f"/>' % (c2, op*0.75))
    b += ('<path d="M0,378 L110,320 L214,356 L320,296 L430,352 L540,300 L660,358 L800,320 L800,400 L0,400 Z" '
          'fill="%s" opacity="%.3f"/>' % (c1, op))
    for (y, o) in [(250, 0.5), (300, 0.38), (346, 0.28)]:
        b += ('<rect x="0" y="%d" width="800" height="14" fill="%s" opacity="%.3f" rx="7"/>'
              % (y, c1, op*o*0.5))
    return uri(wrap(800, 400, b))

# 6 ── 鯉 · a koi, drawn as one swept body rather than a literal fish
def koi(col, op, flip=False):
    """Seen from above: a long tapered body, a forked trailing tail, and
    pectorals swept back. Drawn as silhouette -- detail at this opacity
    only muddies it."""
    body = ('<path d="M92,150 C104,116 150,96 208,100 C266,104 314,124 344,150 '
            'C314,176 266,196 208,200 C150,204 104,184 92,150 Z" '
            'fill="%s" opacity="%.3f"/>' % (col, op))
    # caudal fin, forked and trailing
    tail = ('<path d="M344,150 C372,128 408,104 444,92 C430,116 420,134 418,150 '
            'C420,166 430,184 444,208 C408,196 372,172 344,150 Z" '
            'fill="%s" opacity="%.3f"/>' % (col, op*0.72))
    # pectorals, swept back off the shoulder
    fin  = ('<path d="M186,196 C196,220 216,238 242,246 C226,224 214,208 208,194 Z" '
            'fill="%s" opacity="%.3f"/>' % (col, op*0.6))
    fin2 = ('<path d="M186,104 C196,80 216,62 242,54 C226,76 214,92 208,106 Z" '
            'fill="%s" opacity="%.3f"/>' % (col, op*0.5))
    # dorsal
    dors = ('<path d="M244,102 C268,86 292,80 312,82 C296,92 280,100 268,110 Z" '
            'fill="%s" opacity="%.3f"/>' % (col, op*0.5))
    eye  = '<circle cx="122" cy="140" r="5" fill="%s" opacity="%.3f"/>' % (col, min(op*2.4, 0.9))
    g = body + tail + fin + fin2 + dors + eye
    if flip:
        g = '<g transform="translate(536,0) scale(-1,1)">%s</g>' % g
    return g

def koi_pair(col, op):
    b  = '<g transform="translate(20,40) rotate(-8 230 150)">%s</g>' % koi(col, op)
    b += ('<g transform="translate(300,300) rotate(166 230 150) scale(0.78)">%s</g>'
          % koi(col, op*0.72))
    # ripples they leave
    for (cx, cy, n, o) in [(250,190,5,1.0), (540,450,4,0.7)]:
        for i in range(n):
            rr = 70 + i*46
            b += ('<ellipse cx="%d" cy="%d" rx="%.0f" ry="%.0f" fill="none" stroke="%s" '
                  'stroke-width="1.4" opacity="%.3f"/>' % (cx, cy, rr, rr*0.42, col, op*o*0.5))
    return uri(wrap(900, 640, b))

# 7 ── 金雲 · gold cloud bands, the signature of a painted screen
def kinun(c_gold, c_deep, op):
    """Bands of gold drifting across the ground, each softened at both
    ends so they read as cloud rather than as a ruled border."""
    b = '<defs>'
    for i,(a,bb) in enumerate([(c_gold,c_deep),(c_deep,c_gold),(c_gold,c_deep)]):
        b += ('<linearGradient id="k%d" x1="0" y1="0" x2="1" y2="0">'
              '<stop offset="0" stop-color="%s" stop-opacity="0"/>'
              '<stop offset="0.22" stop-color="%s" stop-opacity="0.9"/>'
              '<stop offset="0.55" stop-color="%s" stop-opacity="1"/>'
              '<stop offset="0.82" stop-color="%s" stop-opacity="0.75"/>'
              '<stop offset="1" stop-color="%s" stop-opacity="0"/></linearGradient>'
              % (i, a, a, bb, bb, bb))
    b += ('<filter id="soft" x="-20%" y="-60%" width="140%" height="220%">'
          '<feGaussianBlur stdDeviation="14"/></filter></defs>')
    # each band: a long rounded lozenge, a couple of lighter puffs above it
    for (y, h, x0, w, gid, o) in [( 70, 46,  -80, 1180, 0, 1.00),
                                  (250, 34,  140, 1160, 1, 0.72),
                                  (430, 54, -140, 1220, 2, 0.85),
                                  (560, 26,  260,  900, 0, 0.55)]:
        b += ('<rect x="%d" y="%d" width="%d" height="%d" rx="%d" fill="url(#k%d)" '
              'opacity="%.3f" filter="url(#soft)"/>' % (x0, y, w, h, h//2, gid, op*o))
        b += ('<rect x="%d" y="%d" width="%d" height="%d" rx="%d" fill="url(#k%d)" '
              'opacity="%.3f" filter="url(#soft)"/>'
              % (x0 + w//5, y - h//2, w//2, h//2, h//4, gid, op*o*0.55))
    return uri(wrap(1200, 640, b))

# 8 ── 梅吹雪 · petals falling, for the closing band
def petal_fall(col, op):
    b = ''
    import math
    pts = [(64,48,21,20),(190,116,15,70),(312,36,24,140),(430,158,17,10),(96,248,18,95),
           (258,306,22,40),(408,276,15,120),(158,388,20,60),(340,428,17,150),(58,478,14,30)]
    for (x,y,r,rot) in pts:
        b += '<g opacity="%.3f">%s</g>' % (op, blossom(x, y, r, 'none', col, r*0.10, rot))
    return uri(wrap(480, 520, b))

# ═══ PALETTE · traditional Japanese colour names ═══════════════════════
P = {
 'shironeri':  '#f7f3ea',   # 白練  raw silk — the ground
 'shiraume':   '#efe7dd',   # 白梅  the plum's own pale
 'sumi':       '#17140f',   # 墨    ink
 'aitetsu':    '#22303a',   # 藍鉄  iron indigo — the night mountain
 'chitose':    '#22392c',   # 千歳緑 thousand-year green — the cedar
 'suou':       '#5c2230',   # 蘇芳  sappanwood — deep plum red
 'kincha':     '#b8892f',   # 金茶  gold-brown
 'kinpaku':    '#d4af5f',   # 金箔  gold leaf
 'nezu':       '#5d5a52',   # 鼠    mouse grey
}
G = '#d4af5f'; GD = '#8a6a24'

art = {
 'plum_field_dark':  plum_field(G, 0.16),
 'plum_field_light': plum_field(P['kincha'], 0.13),
 'plum_large':       plum_large(G, 0.10),
 'branch_light':     plum_branch(P['nezu'], 0.16),
 'branch_dark':      plum_branch(G, 0.15),
 'karesansui':       karesansui('#e8dcc2', 0.085),
 'ridge_light':      ridge('#b9c3c9', '#cdd5da', '#dde3e6', 0.55),
 'ridge_dark':       ridge('#2c3d48', '#243440', '#1d2b35', 0.85),
 'koi':              koi_pair('#e8c98a', 0.13),
 'kinun':            kinun(G, GD, 0.30),
 'petals':           petal_fall('#e8b9c4', 0.16),
}
with io.open(os.path.join(OUT, 'art.py'), 'w', encoding='utf-8') as f:
    f.write('ART = %r\nPALETTE = %r\n' % (art, P))
for k, v in art.items():
    print('%-18s %7d chars' % (k, len(v)))
