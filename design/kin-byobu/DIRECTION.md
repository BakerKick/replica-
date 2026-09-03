# 金屏風 / Kin Byōbu — a gold folding screen

## Why this reference

Three things were asked for at once: light luxury ryokan/shrine, elegant
Japanese fine-art gallery, and cinematic samurai-era atmosphere. A gold
folding screen is all three in one object and needs no compromise between
them: gold-leaf ivory ground (the light luxury), it *is* a painting hung and
lit as one (the gallery), and it stood in castle and shoin rooms (the
samurai-era). Every decision below comes back to that object.

## The four colours, by role

Three pairs were named. Rather than mixing them into mud, each takes a job:

| role | colour | where |
| --- | --- | --- |
| Ground | ivory washi `#f2ece0` / `#e6dccb` | the screen's gold-leaf paper — every gallery band |
| Ink | charcoal `#17171a` / `#3d3d42` | all type; the brush |
| Chamber | deep indigo `#16233d` / `#0e1729` | full-bleed cinematic sections, cut into the light |
| Ceremony | burgundy `#6e1f2a` | rare: seals, the obi, one rule per page |
| Metal | polished gold `#d4af37`, highlight `#f8ecb4`, shadow `#8a6a1f` | rules, numerals, actions |

Polished, not aged: the gold is a three-stop specular gradient, so it catches
light across a rule instead of sitting flat like brass.

The page alternates ivory gallery bands with deep indigo chambers. That
alternation is what makes it read as cinematic without going dark — you walk
from lit room to dark room and back.

## The twelve motifs, one home each

All twelve were asked for. All twelve are here. Putting all of them on every
screen would read as a theme park, and restraint is the whole point of
luxury — so each has exactly one home, and appears there properly rather
than everywhere thinly.

| motif | home |
| --- | --- |
| washi texture | the ground of every ivory band |
| gold leaf | flecks on the ivory; the drifting motes in the splash |
| marumado 丸窓 | the framing device for all photography |
| plum blossom | the brand mark — seals and rule centres |
| torii | the splash gate, and the hero |
| Japanese clouds | the splash mist bands |
| lanterns | the splash foreground, and the night hero |
| ink-brush landscape | the story section's backdrop |
| pine | the area section |
| bamboo | the experience section |
| shoji | the lattice behind the room plates |
| koi and waves | the seasons section — the water chamber |

## Marumado

Taken as the circular window, and made the primary framing device: every
photograph is seen through a circle that opens as you reach it. It is the
gallery's frame and the ryokan's window at once, and it gives the page one
strong repeated geometry instead of a different treatment per section.

## Motion

Theatrical, and driven by both scroll and mouse.

- **Scroll** opens each marumado, draws the ink rules, and lifts each room
  plate in turn.
- **Mouse** moves the splash's depth planes against each other, drifts the
  gold leaf, and shifts the light across the polished gold.
- The splash is a camera push through the gate: five planes on a perspective
  stage, the torii drawing itself in ink, the emblem resolving in gold, then
  a marumado opening to the site.

Built with CSS 3D transforms, SVG and one small canvas — no three.js, no new
dependency, so the existing zero-dependency build and deploy are unchanged
and the single-file build still works.

`prefers-reduced-motion` composes the same frame with no movement. On a
narrow or low-core device the splash drops its canvas and plane depth and
becomes a still composition that dissolves.

## Scope

Splash and main page. Of the restructured sections, rooms comes first: from a
three-up card grid to a gallery sequence of numbered plates, each seen
through a marumado, alternating side to side.
