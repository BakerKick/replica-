# The seven Moonlit Cedar artworks

The Moonlit Cedar layer was designed around seven original artworks. They were
generated in the Manus workspace and stored there, behind a private storage key
— they were not included in the exported source bundle, and the paths in it
(`/manus-storage/…`) only resolve inside that workspace's dev server.

The stylesheet and script here expect them in this folder, under these exact
names. Drop them in and the whole layer comes to life; nothing else needs
changing.

| File | Where it appears |
| --- | --- |
| `shiraume-shrine-etching_e4225976.png` | The etched shrine / torii line-art over the Why Hikosan section |
| `shiraume-washi-cedar-veil_aab3e61e.png` | The washi-and-cedar grain veil — the most-used of the seven, on the splash, the Why Hikosan panel, the room pages, the gallery route and the chamber backgrounds |
| `shiraume-gallery-shoji_7fb6b0c5.jpg` | The shoji ground behind the seasons band and the room gallery grid |
| `shiraume-moon-gate_00c23139.png` | The moon-gate seal |
| `shiraume-hero-cedar-moon_7d624f82.jpg` | The hero cedar-and-moon plate |
| `shiraume-gallery-obi_ff1a04eb.jpg` | Gallery — obi plate |
| `shiraume-gallery-water_47119846.jpg` | Gallery — water plate |

Until they are here, the layer still runs: the gradients, seals, obi gesture,
route rails and typography all work, and the missing plates are hidden rather
than shown as broken images. What is lost is the paper and cedar texture —
the backgrounds read as flat tone instead of material.

Three ways to fill this folder:

1. **Export them from Manus.** They are your artworks; that workspace still has
   them. This is the only way to get the design back exactly as it was reviewed.
2. **Generate replacements**, matching the palette in `ideas.md`: cedar ink
   `#111417`, wet stone `#20282b`, moon haze `#a6b0ad`, washi `#f1ede4`,
   plum mineral `#c6a4a0`, aged brass `#b99a67`, moss shadow `#39473e`.
3. **Leave it.** The layer degrades on purpose and stays presentable.

Do not paste the Manus storage key anywhere to fetch these. It is a secret, and
it would not help: `/manus-storage/` is served by that workspace's development
server only, so it would never resolve on a published site.
