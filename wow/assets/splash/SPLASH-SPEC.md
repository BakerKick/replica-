# Shiraume Lodge — Cinematic Splash
## Complete brief and specification

A drop-in loading sequence for the Shiraume Lodge site. Two files
(`shiraume-splash.css`, `shiraume-splash.js`) plus one mount call.

---

## 1. The brief

Build the loading sequence for a luxury Japanese ryokan (Hakuba, Nagano).
The site is quiet, expensive-looking, editorial — cream paper, ink, gold,
Cormorant Garamond display type. The splash must feel like the front of an
art book, not a web preloader.

**The one-sentence pitch:** a torii gate is painted in wet ink on dark
paper, lacquer floods up it, dawn breaks over the paper, and then the
camera walks through the gateway into the photograph of the real gate.

### Non-negotiables

- **Full cinematic.** ~5.3s of painting, then a 1.35s walk-through. It is
  allowed to be the most dramatic moment on the site.
- **Never childish.** Aged urushi lacquer, not poster red. Paper warms to
  unbleached taupe and **never reaches white**. Saturated mid-red on
  near-white is the single fastest way to make this look cheap.
- **Keep 白梅.** The kanji sit far behind the drawing at very low opacity.
- **No hanko seal, no "Hakuba · Nagano" sub-line.** Both were tried and
  cut. The seal remains available behind `seal: true`.
- **The gate must be *the* gate.** All geometry derives from the same
  `TORII` table the site already uses to trace the gate onto the hero
  photograph, so the drawn gate lands on the photographed gate as the
  camera passes through it.

### The six ideas it is built from

1. **Walk through the gate** — real CSS 3D depth and a forward dolly, not
   a mask that scales up.
2. **Sumi-e brush ink** — turbulence-displaced strokes with variable
   width and a wet bleed, not clean vector line.
3. **Lacquer flood** — ink outline completes, then colour washes up the
   posts; the plaque is gilded.
4. **Dawn behind the gate** — sky, paper, and ink all change together, so
   the reveal reads as time passing.
5. **Wind** — ume petals drifting in parallax, gusting outward on the
   exact frame the gate opens.
6. **Ume branches** — the lodge's own artwork, reaching in from the
   corners, swaying slowly.

---

## 2. The timeline

All timing is driven from CSS custom properties on `#shiraume-splash`
(`--sp2-draw-in`, `--sp2-dawn`), so the whole sequence retunes from one
place.

| Time | Beat |
|---|---|
| 0.00–0.35s | Near-black paper (`#17130d`). 白梅 fades in far behind. |
| 0.35–2.9s | **The gate paints itself** in wet white ink, in the order a gate is actually raised: plinths → shafts → collars → crossbeam → lintel → plaque → rope → shide. Each stroke has a wide low-opacity halo traced on the same clock (the wet bleed). |
| 2.32s | The **plaque traces in gold** (`#d9b878`) rather than ink. |
| 1.9–2.4s | Ink mark, name, and veil rise inside the opening. |
| 2.85–4.35s | **Lacquer floods** up from the plinths on a soft mask edge — aged urushi `#7c332b` → `#3f1a1a`. Plinths take stone; plaque takes gold. |
| 2.7–3.05s | Branches and petals fade in (deliberately *after* the trace — see §5). |
| 3.2–5.5s | **Dawn.** Sky, paper (→ `#b0a389`), ink (→ `#4a3a2c`), and branch tint all cross-fade together. The aperture cutout cross-fades open and the photograph resolves out of an 18px blur, like mist clearing. |
| 4.6s | Tagline rises. |
| 5.35s | **Walk-through.** Gate accelerates forward and sweeps past the viewer; photo does its own shallow opposite-eased push-in; a warm flash covers the frame where the gate crosses the camera. Hands off to the site. |

---

## 3. API

```js
ShiraumeSplash.mount({
  photo:       '…',    // hero photograph (the payoff)
  mark:        '…',    // ink logo mark; omitted → no <img> created at all
  branch:      '…',    // ume branch artwork, alpha-keyed
  branchGhost: '…',    // downscaled copy for the huge faint layer
  name:        'Shiraume',
  sub:         '',     // empty → element removed
  seal:        false,  // true → 白梅 hanko is struck at 4.35s
  petals:      22,
  tagline:     '巡礼の宿る　山のほとり',
  kanji:       '白梅'
});

ShiraumeSplash.play();      // restart
ShiraumeSplash.exit();      // walk through now (the Enter affordance)
ShiraumeSplash.duration;    // 5.35 — the painting; walk-through follows
```

Events on the element: `shiraume:splash-open` when the camera starts
moving (this is where you unlock scroll and reveal the site) and
`shiraume:splash-done` when it is finished.

### Integration

```js
document.documentElement.style.overflow = 'hidden';
document.addEventListener('shiraume:splash-open', function () {
  document.documentElement.style.overflow = '';
  if (typeof dismissSplash === 'function') dismissSplash(true);
});
```

---

## 4. The branch asset

The source artwork was a screenshot: opaque cream ground, a black brush
stroke through the lower-left, soft ghost-petal shapes printed into the
background, and the branch itself as faint grey line-art. Recipe that
worked:

- Luminance key with paper at 236, stroke core at 172, and a hard cut at
  118 so the unrelated black brush stroke is excluded.
- An alpha **floor of 78** — this is what removes the printed background
  wash. Lowering it to recover thin twigs lets the wash straight back in.
- Detail comes from **2× supersampling and a 720px delivery**, not from a
  lower floor.
- Mask the shape and tint it with `background`, rather than placing it as
  an `<img>` — that is what lets its ink cross-fade with the dawn.

Three instances: large branch top-right (36vw), small sprig low-left
(18vw), and one 118vh ghost at 8.5% opacity under the whole gate.

---

## 5. Engineering constraints — learned the hard way

Every one of these was a real defect. They are the load-bearing parts.

**The camera only ever travels forward.** An "anticipation" pull-back
shrinks the paper plane and exposes the photograph around its edges.

**The paper sheet is overscanned 128%** with its `viewBox` extended to
match (so the gate is not distorted), and it opts out of `max-width:100%`
— host stylesheets clamp `svg` and silently undo the overscan.

**The photograph lives OUTSIDE the dollied world.** It is a bitmap: 3D
magnification resamples it. Held inside the dolly at `translateZ(-1500px)`
pre-scaled 2.6× to compensate, it went past 4× and turned to mush.

**Any animation that replaces another must restate every property it
touches** — the exit push-in once omitted `opacity` and the photo fell
back to `opacity: 0`, showing the dawn sky through the gateway.

**The aperture cross-fades, it does not scale.** A growing cutout reads as
the photograph sprouting out of one corner.

**Never animate `background-color` on a large masked element.** It
repaints the whole masked area every frame; on the 118vh ghost it pegged
the renderer on first load. Two pre-tinted layers cross-fading on
`opacity` run on the compositor instead. Sway lives on its own wrapper so
transforms never fight.

**SVG filters are the expensive thing.** One filter, `numOctaves="1"`, and
its region pinned in `userSpaceOnUse` to the gate's bbox — percentages are
measured against the oversized sheet, so every trace frame was
rasterizing a region several times larger than the drawing. The wet bleed
is widened *geometry*, never a blur.

**Presentation attributes beat inheritance.** The bleed cannot be a
`<use>` of the stroke group: those paths carry `stroke-width` attributes,
so an inherited width never reaches the clones and you get a pixel-
identical duplicate for nothing. It is its own `<g>`.

**Clear the frame during the trace.** Petals and branches start at ~2.9s
so 22 independently animating elements never share a frame with the
filtered trace.

**Hiding the splash must not depend on one cancellable timer.** It is
driven by the dolly's `animationend`, with an unguarded fallback timer
behind it, and `finish()` is idempotent.

**The lockup sits over sunlit gravel.** Cream type needs a contained dark
veil plus tight high-alpha shadows — wide soft blur alone is not enough.
The veil is clamped **inside the posts** (`op.width - 10`); wider and the
wash lands on the lacquer and the paper, since it paints after the gate.

**Reduced motion** holds the final frame (`.sp2-static`) rather than
skipping the splash.

---

## 6. Files

- `shiraume-splash.css` — the whole timeline.
- `shiraume-splash.js` — geometry, markup, layout, API.
- `demo.html` — minimal standalone harness.
- `ume-branch.png`, `ume-branch-ghost.png` — keyed artwork.

Drop the CSS in `<head>`, the JS before `</body>`, then call `mount()`.
No dependencies.
