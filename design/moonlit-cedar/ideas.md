# Shiraume Lodge — Visual Direction

## Three initial approaches

### Approach 1 — Moonlit Cedar

**Very Brief Intro:** A nocturnal pilgrimage atmosphere built from indigo-black cedar, moonlit stone, and restrained brass. The experience feels private, sacred, and cinematic without becoming theatrical.

**Probability:** 0.06

### Approach 2 — White Plum Atelier

**Very Brief Intro:** A daylight editorial language inspired by white plum blossom, handmade washi, pale ash wood, and the quiet precision of a Japanese design atelier. The mood is luminous, tactile, and quietly contemporary.

**Probability:** 0.03

### Approach 3 — Lacquered Passage

**Very Brief Intro:** A more dramatic hospitality direction using deep urushi red, smoked timber, charcoal ink, and art-gallery pacing. It frames the lodge as a rare object encountered along an ancient route.

**Probability:** 0.08

## Chosen approach — Moonlit Cedar

### Design Movement

Contemporary Japanese editorial hospitality: the restraint of **shibui**, the spatial pause of **ma**, and the material richness of a small Kyoto-quality art book. The page should feel like entering a cedar grove at blue hour, not like browsing a conventional hotel website.

### Core Principles

1. **Atmosphere before information:** create a strong first emotional impression, then reveal practical detail in measured layers.
2. **Material honesty:** use cedar grain, washi fibers, stone, ink, and muted metal cues rather than generic gradients or glossy UI effects.
3. **Asymmetric calm:** place content on a deliberate vertical axis with off-center editorial compositions and large, quiet fields of space.
4. **Motion as ritual:** every animated movement should resemble a physical action—sliding shoji, tying an obi, a lantern brightening, or a paper screen unfolding.

### Color Philosophy

The base is a near-black cedar ink that allows photography and warm typography to breathe. Moon-washed blue-grey creates depth in the hero and splash state; pale washi is reserved for moments of orientation; and a single **white-plum mineral** accent marks actions and sacred details. The palette should feel found in the site itself: wet stone, cedar shadow, moon haze, plum skin, and aged gold. Avoid saturated red, purple gradients, and excessive glow.

Working palette:

- Cedar ink: `#111417`
- Wet stone: `#20282b`
- Moon haze: `#a6b0ad`
- Washi: `#f1ede4`
- Plum mineral: `#c6a4a0`
- Aged brass: `#b99a67`
- Moss shadow: `#39473e`

### Layout Paradigm

A vertical pilgrimage path rather than a card grid. The page alternates between full-bleed photographic chambers and narrow editorial bands. A slim left-side route marker quietly tracks the visitor’s progress while the main content shifts between left and right anchors. Gallery images should enter as framed “views” along the route, with generous negative space and occasional overlapping plates.

### Signature Elements

1. **The moon gate:** a thin circular seal used in the splash screen, route marker, and image captions. It should be drawn with SVG strokes so it can reveal itself smoothly.
2. **The obi passage:** a horizontal fabric-like band that tightens and releases between selected sections, evoking an obi being tied without simulating a literal garment.
3. **The cedar veil:** a translucent grain/washi texture and slowly moving shadow layer that adds depth to backgrounds while remaining quiet behind content.

### Interaction Philosophy

Interactions should feel slow to invite attention but quick to confirm intent. Hover states reveal a small change in light, not a loud color swap. Navigation uses a shoji-like veil transition; the inquiry action opens through a measured panel movement. The gallery opens images as a quiet lightbox with captions, keyboard escape, focus management, and no unnecessary carousel autoplay.

### Animation

Use only compositor-friendly `transform` and `opacity` for motion. Use CSS transitions for reversible states and one-shot keyframes only for the splash ritual. The splash begins with a black cedar field, a dim moon gate, and two slim vertical shoji bars. The gate draws itself, the bars slide apart, the lodge mark resolves, and the veil lifts into the hero. Keep the complete sequence under 2.8 seconds and provide a skip control after the first 350ms. The obi passage is a scroll-linked `scaleX` reveal with a soft spring-like easing, never a width animation. Gallery plates translate 16–24px and fade in with 60ms stagger. Respect `prefers-reduced-motion` by removing parallax, drawing, and staged reveals while keeping content visible.

### Typography System

Display: **Cormorant Garamond**, with italic used only for the emotional word or phrase in a headline. Body and interface: **DM Sans**, with slightly increased tracking for navigation and labels. Japanese copy: **Noto Serif JP** paired with the display face for a calm, literary texture. Headlines use generous leading, a controlled contrast between roman and italic text, and no all-caps for primary statements.

### Brand Essence

A private mountain ryokan at the foot of Hikosan’s ancient pilgrimage route, for travellers who want Japan’s quietest experiences in a setting that cannot be manufactured. **Quiet, discerning, rooted.**

### Brand Voice

Headlines are brief and sensory. CTAs are invitations, never sales commands. Microcopy sounds observant and specific, with the confidence of a host who does not need to over-explain.

Example lines:

- “Let the mountain set the pace.”
- “A room shaped by cedar, shadow, and the sound of water.”

### Wordmark & Logo

Use a compact moon-gate symbol: an incomplete circle intersected by a single vertical cedar stroke, with a small plum seed mark at the lower opening. It should work as a standalone ink mark at large size, never as a tiny decorative favicon only. Pair it with a custom-tracked wordmark treatment for “Shiraume” and a smaller `LODGE · 白梅` line.

### Signature Brand Color

**White-plum mineral — `#c6a4a0`.** It is a muted, mineralized blush rather than a floral pink: a distinctive cue for Shiraume that can appear in the moon gate, selected rules, and focused interactive states without overpowering the cedar palette.

## Implementation notes

The prototype will use the live site’s existing content themes but present a focused art-direction study: an improved cinematic splash, a dark cedar/washi atmospheric background, a scroll-linked obi passage, a route marker, and a gallery treatment that feels like a sequence of framed views. Pinterest references are used only for mood and material cues; all generated visual assets will be original and the production implementation should use properly licensed photography.

## Style Decisions

The moon-gate seal is a recurring hospitality signature, not a one-off logo: it appears in the header, stats band, route rails, inquiry area, and footer. Dark cedar-ink chambers carry a quiet material layer through grain, mineral gradients, and ink-like tonal shifts rather than reading as flat black. The scroll is structured as a single route with numbered chamber rails—Origin, Ritual, Rooms, Views, Return—so the sections feel like one pilgrimage rather than disconnected page blocks. Pale sections keep the obi band, asymmetry, and Japanese pause to avoid becoming a generic premium editorial template.


## Style Decisions — Review Amendments

The action and detail system is unified around white-plum mineral `#c6a4a0` and aged brass; green or mint actions are not part of the Shiraume signature. Pale gallery pages retain a strong Moonlit Cedar anchor through cedar-ink thresholds, dark framed edges, and moon-gate marks. Gallery views are treated as numbered pilgrimage chambers with asymmetry and editorial pause rather than equal-weight hotel cards. The Shiraume mark is used confidently in the Gallery header, footer, and route controls so the identity is remembered as a specific lodge, not only a mood.


## Style Decisions — Latest Review

The lower page must continue as a pilgrimage route rather than a premium hotel card grid: each practical section gets one dominant thought, asymmetric framing, and more negative space. Interactive and sacred details use only white-plum mineral and aged brass; saturated red, rust, mint, and green remain atmospheric rather than functional. The moon-gate and custom-tracked Shiraume wordmark should be confident at every major threshold. Dark chambers must vary through cedar grain, wet-stone tone, washi fiber, brass rules, and moon-gate marks so they do not flatten into repeated near-black panels.
