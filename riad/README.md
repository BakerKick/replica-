# Riad Sa'eed — homepage replica

A static replica of the theriadsaeed.com homepage, rebuilt from its rendered
HTML for a website-integration exercise. Not affiliated with Riad Sa'eed.

## Files

- `index.html` — full page structure (hero, about, discover, suites,
  restaurant, experiences, testimonials, footer)
- `tailwind.css` — pre-compiled Tailwind utilities (generated with the
  Tailwind v3 CLI from `index.html`; no CDN or build step needed to view)
- `style.css` — custom classes the original defines outside Tailwind:
  buttons (`btn-luxury*`), arch frames, gold shimmer text, discover-card
  hover states, zellige background, preloader, reveal-on-scroll states
- `script.js` — preloader, scroll progress bar, header solid-on-scroll,
  mobile menu, star ratings, IntersectionObserver reveal animations,
  floating WhatsApp/music buttons

## Viewing

Open `index.html` directly in a browser, or serve the folder
(`python3 -m http.server`). Images, the hero video, and the Google Fonts
are hot-linked from the live site, so an internet connection is needed for
media; layout and styling work offline.

## Notes for later integration

- Original fonts are custom ("The Seasons"); this replica substitutes
  Playfair Display + DM Sans, which the original also loads as variables.
- Theme colors are defined in both `style.css` (`:root` vars) and the
  Tailwind build (desert-tan, midnight, palm-olive, gold). If you change
  markup classes, regenerate `tailwind.css` with the Tailwind CLI.
- All internal links point to on-page anchors (`#suites`, `#restaurant`, …)
  instead of the original's sub-pages, which were not part of the source.
