# Wow-factor diagnosis

The previous revision preserved the original page successfully, but the requested enhancements were not visually strong enough. The desktop hero still reads primarily as the original torii photograph; the shrine-art layer is too faint to register as a deliberate Japanese art element. The new route progress is visible, but it is the only obvious added feature.

The interlude markup is an existing full-width quote section, making it the correct insertion point for a visible obi gesture. The gesture should be large enough to read behind and around the quote, with two lacquer-red bands entering from opposite sides and meeting at a gold-edged knot as the visitor scrolls through the section. The motion must be transform-only and disabled under reduced motion.

The current seasons section and the room detail `#rd-gallery` are the two real gallery surfaces. Their existing imagery, labels, and room-detail data should stay intact. The improvement should be a clearly visible washi/cedar art-directed backdrop, framed image plates, and a seal motif behind the current cards rather than a replacement gallery.

The existing splash is already a custom torii/gate ritual driven by the live site’s splash scripts. The next pass should preserve that choreography and intensify only the background: an unmistakable moonlit shrine-etching layer, a warm urushi/red-gold material frame, and a slower, smoother logo/tagline arrival. Avoid adding a second splash or replacing the current markup.

## Verification after the stronger layer

The strengthened hero now visibly shows a gold shrine/torii line-art overlay and a seal over the original torii photograph. The interlude now visibly shows the lacquer-red obi bands crossing the quote with a central gold-edged knot and `結` seal. The seasonal gallery now shows an art-directed dark surface, the current four season cards, a washi-backed image strip, and a `景 / THE VIEWS` label. The composition is intentionally layered, but the obi should be checked once more at an intermediate scroll position to ensure the knot transition does not cover critical text on smaller screens.

## Room-detail verification

The room-detail Gallery is now visibly styled as the requested pale washi / ink / champagne-gold surface: the `Gallery · ギャラリー` ceremony heading, HIKOSAN / 740 / 1917 code, framed image panel, shoji grid, and gold rules are visible behind the original gallery container. The dynamic legacy gallery images currently use relative `assets/img/...` URLs and show broken-image placeholders in the editable preview. Add a safe runtime asset bridge that rewrites only those relative legacy URLs to the existing live asset origin while preserving all image data and page behavior.

## Dynamic gallery re-check

After the asset bridge was added, the preserved Koke room-card handler was triggered successfully through the existing interaction path. The next inspection should confirm that both dynamic gallery images resolve to the original live asset host while the new Gallery ceremony and pale framing remain intact.

## Final gallery result

The runtime bridge now resolves the original Koke gallery images to `https://concept.shiraumehikosan.com/assets/img/room-koke.jpg` and `s2-room-koke.jpg`. The live inspection shows both images loaded in the framed pale-washi panel, with the new Gallery heading and HIKOSAN / 740 / 1917 line intact. The remaining hardening item is to prevent the style mutation observer from reprocessing already-absolute background URLs.

## Root cause of missing / misplaced styling

The live DOM audit found that `document.body` has `shiraume-wow-layer` but not `shiraume-enhanced`. Most of the new CSS is intentionally scoped to `body.shiraume-enhanced`, so the pale room mode and Why Hikosan section containment were not active. The unscoped `why-hikosan-art` therefore escaped its section and appeared at the top of the page, visually resembling a hero overlay. Fix by adding the missing `shiraume-enhanced` class alongside the existing enhancement marker; do not move or replace the preserved content.

## Final visual verification

After activating the missing scope class, the clean reload shows the new splash as a full-screen vermilion-and-aged-gold torii drawing with a rising moon, luminous path, and Shiraume wordmark. The hero no longer contains the moved shrine composition. The `#why-hikosan` anchor now shows the etched shrine / torii treatment and `発見` seal inside the Why Hikosan section, with the `巡` cipher moment contained at the lower edge. The Koke dynamic room view resolves its original gallery images and shows the pale washi / ink / champagne-gold Gallery surface. The mobile full-page pass completed without layout overflow or detached overlays; reduced-motion fallbacks remain defined.

## Corrective route QA

The dedicated `/gallery` URL now bypasses the splash and renders the six-image `景 / THE VIEWS` page with pale washi, ink, and champagne-gold framing. The automated element-index click on `BACK TO SHIRAUME` did not change the URL or view, indicating a browser-targeting artifact or handler path that needs direct DOM verification before final delivery.

## Corrective pass verification

The dedicated `/gallery` route now loads directly without the splash and renders a separate six-image page. Its return handler restores the homepage view and `/` path through direct DOM activation. A fresh homepage navigation still presents the torii splash, with the moon halo and soft mist field visible in the lower gate area; the remaining verification is to confirm the hero background transform changes after scroll and that the real in-room Gallery launch control opens `/gallery`.

## Gallery launch QA failure

The main-page hero parallax is confirmed: the live `.hero-bg-night` transform changes from `translateY(0)` to `translateY(-1.6px)` under controlled scroll, with `--shiraume-hero-shift` updating. However, after triggering the preserved Koke room-card handler, the expected `.gallery-ceremony__launch` control is not found after the current wait interval and the pathname remains `/`. The next implementation pass must bind the Gallery launch after room-detail population or use event delegation on the real dynamic room gallery label.

## Interactive motif verification

The fresh homepage contains eight newly added encoded seals across the major sections, each exposed as an accessible button with a hidden Japanese message. The Local Area seal entered its awake state on a synthetic pointerenter, expanded to `true`, and its scroll-linked `--engraving-shift` changed from `4.43px` to `3.98px` as the section moved through the viewport. The immediate computed opacity check occurred before the CSS transition completed; visual verification should allow the 260ms reveal transition to settle.

## Final interactive motif and Local Area result

The Local Area now renders as a deep cedar / blue-black mountain chamber with the original Mt. Hiko image held in its pointed katomado frame. The `谷` seal remains contained within that section. After the reveal transition settles, the interactive seal reports `aria-expanded="true"`, the hidden message `参道の先に、谷の静けさ。` has opacity `1`, and the page exposes eight interactive encoded motifs. The scroll loop updates each seal’s `--engraving-shift` using transform-only motion.

## Hikosan history panel QA

The rebuilt homepage loads at the Why Hikosan anchor with the existing splash entry control and eight interactive encoded motif buttons. The central pilgrimage cipher is exposed as the third seal button in the cleaned page viewport after the splash is dismissed. The new `hikosan-history-panel` is inserted by the enhancement module and is initially hidden; the next verification step will activate the central cipher and inspect dialog semantics, visible timeline content, focus transfer, and close behavior.

## Why Hikosan panel opening verification

After connecting the main `.shiraume-cipher` click handler, activation now reports `cipherExpanded: true`, `panelHidden: false`, `panelOpen: true`, `role: dialog`, `aria-modal: true`, four history timeline items, and focus on the panel close control. The panel title and historical content are present in the rendered dialog. Escape and focus-return behavior remain to be verified after the settled close transition.

## Hikosan history dialog final visual check

The main Why Hikosan cipher now opens the full history panel. The dialog renders above the dimmed page with a cedar-ink gradient, aged-brass border, circular 英 / 彦山 seal, editorial heading, lead paragraph, four historical timeline entries (740, 12—16C, 1616, 1729), closing pilgrimage line, source link, and close control. The panel locks background scroll and transfers focus to its close button. The settled Escape test hid the panel and returned focus to the original cipher trigger.
