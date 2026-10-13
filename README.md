# ASHKE — motion-designed lyric video

**Karan Aujla × Mxrci · Aujla SZN 1**: a lyric video built on the official music video, designed as an English country-house *Order of the Day*.

| Output | Format | File |
|---|---|---|
| Full video | 1920×1080 · 25 fps · 3:38 | `out/ashke-full-16x9-web.mp4` (3.3 Mbps web encode; the 204 MB CRF-18 master `out/ashke-full-16x9.mp4` exceeds GitHub's file limit and is rebuilt with `npm run render:full`) |
| Reel | 1080×1920 · 25 fps · 0:45 (song 0:47 → 1:32) | `out/ashke-reel-9x16.mp4` |
| Hero proof | 1920×1080 · song 0:59 → 1:10 | `out/hero-proof.mp4` |

Made with Remotion (React + TypeScript), following the six-stage process in `inputs/process-guide.pdf`: inspect, timing, creative direction, engine and hero proof, full render.

- `docs/creative-direction.md`: concept, the three worlds, the gold hairline, type system and the twelve key moments
- `docs/implementation-notes.md`: pipeline, sync map, lyric fixes, QA, known weaknesses and rebuild steps
- `alignment/`: timing, beat analysis and footage-plate scripts
- `data/`: frozen timing (`words.json`, `phrases.json`), `beat-map.json`, `edl.json`
- `video/`: the Remotion project

Song and footage © their owners. This is a fan or portfolio piece. Credit the artist and get permission before any commercial use. Fonts: SIL OFL.

---

# SEE YOU AGAIN: motion-designed lyric video (`see-you-again/`)

**Tyler, The Creator ft. Kali Uchis · *Flower Boy*** (11.6 s clip): motion graphics built around the album cover, at **3840×2160 · 60 fps**.

| Output | File |
|---|---|
| Final 4K/60 (3840×2160, 60 fps, H.264 55 Mbps) | `see-you-again/out/see-you-again-4k60.mp4` |
| Proof | `see-you-again/out/proof-1080p60.mp4` |
| Key frames | `see-you-again/docs/qa/` |

The film moves from the kiss, through Rubin's-vase profiles, into an endless Polaroid Droste fall (*last FOREVER*). Then comes the field, where a red thread snaps on *war*, and a velocity pull-back turns the world into a postcard that is postmarked and carried into the dusk by bees. Every person and bee is drawn in code. The cover is AI-upscaled ×16 (Real-ESRGAN), and Tyler is cut out for depth.

- `see-you-again/docs/creative-direction.md`: concept, the bee-line motif, worlds, type, intensity curve
- `see-you-again/docs/implementation-notes.md`: pipeline, lyric check, engine, QA, rebuild
- `see-you-again/pipeline/`: timing/beat, upscale/cut-out, texture scripts
- `see-you-again/video/`: the Remotion project
