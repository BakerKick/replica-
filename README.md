# Shiraume Lodge — Concept Site

Merged site: the approved design (standalone 4) as the base, with the
features from the interactive prototype (index 2) layered on top.

## Files
- `index.html` — the page (all sections + hidden room-detail view)
- `style.css` — the approved design system (tokens, sections, light/dark)
- `enhance.css` — merged-in features: splash, ink logo, custom cursor,
  scroll progress, page wipe, interlude, seasons strip, journal,
  room detail + booking, lightbox, floating inquire
- `main.js` — all interactions (language toggle, day/night, splash,
  ticker, counters, scroll reveal, room routing, forms)
- `assets/img/` — photos and the ink-brush logo

## Reverting the hero
The hero keeps the approved day/night photo hero. The ticker and
entrance animation are additions gated behind one switch: remove the
`hero-enhanced` class from `<body>` in `index.html` to get the hero
back exactly as the boss saw it.

## Optional drop-in assets
- `assets/hero.mp4` — not used (photo hero kept)
- `assets/ambient.mp3` — if present, an ambient-sound button appears

## Standalone build
A single-file version (everything inlined, opens from disk) can be
rebuilt by inlining `style.css`, `enhance.css`, `main.js`, the font
set, and `assets/img/*` as data URIs into `index.html`.
