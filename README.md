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
- `assets/fonts-subset.css` — the web fonts, cut down to the characters
  this site uses (the full families are 7.1 MB)
- `build-standalone.py` — builds the single-file version to send out

## Reverting the hero
The hero keeps the approved day/night photo hero. The ticker and
entrance animation are additions gated behind one switch: remove the
`hero-enhanced` class from `<body>` in `index.html` to get the hero
back exactly as the boss saw it.

## Optional drop-in assets
- `assets/hero.mp4` — not used (photo hero kept)
- `assets/ambient.mp3` — if present, an ambient-sound button appears

## Standalone build (the file to send people)

    pip install pillow
    python3 build-standalone.py

Produces one ~3.5 MB `.html` with fonts and images embedded — small
enough to attach to an email, and it opens straight from disk with no
web server. Rerun it after any change to the site; it reads the same
source files, so the two never drift apart.

It stays small because fonts come from `assets/fonts-subset.css`,
images are recompressed to the size they actually display at, and each
asset is embedded once and referenced by name instead of repeated for
every use (the room photos appear four times each). Inlining everything
naively gives a 20 MB file, which is too big for Gmail once a message
is encoded for transport.

One caveat: the four seasons photos in the drifting strip are loaded
from Unsplash, so they need an internet connection. Offline, that strip
hides itself and the rest of the page is unaffected.
