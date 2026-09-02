# Pinterest reference notes

## Reference 1

The first pin is an Asian-pattern composition with a deep charcoal / black ground, saturated vermilion-red panels, muted cedar-green and blue-green forms, cream cloud shapes, and fine aged-gold contour lines. Its strongest cue is the layered movement of clouds and water-like bands, with ornamental density held inside a dark, premium field. For Shiraume, reinterpret this as restrained cedar-grain bands, gold contour lines, and vermilion accents rather than copying the pattern.

## Reference 2

The second pin is a light architectural sketch: an ink-line pilgrimage scene with a pagoda, a walking figure, an umbrella, and a single strong vermilion sun / umbrella accent. Its strongest cue is the contrast between pale paper, loose charcoal linework, and one ceremonial red focal point. For Shiraume, reinterpret this through etched torii / shrine linework, a pale washi room-gallery mode, and a single vermilion focal accent.

## Working synthesis

The references support a two-mode system: a moonlit cedar / vermilion / aged-gold atmosphere for the main page, and a pale washi / ink / champagne-gold atmosphere for room detail. The interactive cipher should feel like a quiet seal or encoded pilgrimage marker, not a technical UI element.

## Reference 3

The third pin uses large negative space, an off-white paper field, a dark tiled roof / architectural fragment, and a single blossom branch with a restrained accent color. Its strongest cue is quiet asymmetry: one carefully cropped architectural element carries the composition while the rest is calm. For Shiraume, use this as the room-gallery principle: let the photography breathe within pale washi margins, with small ink marks and one champagne or vermilion accent.

## Reference 4

The fourth pin is an ukiyo-e-inspired crane study on warm paper, with navy-black linework, vermilion details, vertical calligraphic panels, and a small seal. Its strongest cue is the combination of a single illustrated subject, vertical writing, and a compact seal that makes the image feel archival. For Shiraume, translate this into the Why Hikosan cipher: an elegant seal / encoded inscription with restrained glow, not a literal copied bird or print.

## Final reference direction

Use the references as inspiration only. Keep the main page in the dark moonlit cedar mode with vermilion and aged-gold contour work; keep room detail in the pale washi mode with ink-black typography and champagne-gold frames; make the cipher feel like a living archival seal that reveals a short hidden message on hover or keyboard focus.

## Implementation checkpoint before interaction QA

The live preview now shows the new 2.5D splash and the Why Hikosan section contains an accessible `Reveal the Shiraume pilgrimage message` button with the Japanese and English hidden inscription in the DOM. The next QA step is to bring that button into view and test pointer hover, keyboard focus, and click-pinned behavior without changing the page’s preserved content.

## Cipher interaction QA

The cipher is now an accessible button in Why Hikosan, and it has been brought into a centered viewport position. Pointer hover testing has been initiated on the cipher’s 215px interaction target; the next check should confirm `is-awake` and `aria-expanded=true`, with the hidden inscription visible and no pointer-event dead zone.

## Interaction QA follow-up

The cipher target is visibly present and accessible, but the browser click capture did not leave the button visibly pinned. I will verify whether this is a browser-coordinate artifact or an event-state issue by inspecting the live button state and then testing keyboard focus / activation directly. The CSS hover and focus rules remain scoped to the new button.

## Cipher activation confirmed

The direct activation test confirms the button enters `is-awake`, sets `aria-expanded=true`, matches the intended reveal selector, and computes the hidden message at `opacity: 1`, `visibility: visible`, and `transform: none`. The earlier browser click did not visibly pin it because that automation path did not target the live button coordinates; the direct keyboard/click path works correctly. Hover and focus styling are therefore in place, with click activation available as the touch fallback.

## Refinement verification

The awake cipher visibly shows its bilingual message above the ring: `歩けば、山は応える。` / `Walk far enough and the mountain answers.` The Koke room-detail interaction still opens through the preserved room-card handler, and the room page retains the pale material treatment at the transition below the hero. A final scroll-to-gallery inspection remains before the checkpoint.

## Final gallery verification

The Koke room-detail `Gallery · ギャラリー` now renders the original room photos inside a pale washi / ink / champagne-gold editorial surface with a framed image field, subtle grid texture, and the `HIKOSAN / 740 / 1917` ceremony line. The original dynamic image URLs resolve to the live Shiraume asset host. The main-page cipher interaction and splash refinement have also been verified in the same clean preview session.
