Shiraume Lodge — asset drop folder
===================================

The site (../index.html) is self-contained except for three optional
files it looks for in this folder. Drop them in and they activate
automatically — nothing breaks while they are missing.

hero.mp4      Hero background video. Plays muted/looped over the current
              hero photo and fades in once it can play; if absent or it
              fails to load, the photo simply remains. Recommended:
              10–25s, 1920x1080, H.264, no audio track, under ~12 MB,
              slow movement (mist, rain, forest light — nothing fast).

ambient.mp3   Ambient soundscape for the floating sound toggle
              (bottom-right, 音). The button only appears when this file
              exists. Recommended: 1–3 min seamless loop (forest, rain,
              distant bells), quiet mastering — playback volume is 0.35.

og.jpg        Social/link preview card (1200x630). A generated one is
              included; replace with a real photograph when available.
              IMPORTANT: once the site is hosted, change the og:image /
              twitter:image tags in index.html to the ABSOLUTE url
              (https://yourdomain.com/assets/og.jpg) — social scrapers
              do not resolve relative paths.
