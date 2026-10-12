# ASHKE — motion-designed lyric video

**Karan Aujla × Mxrci · Aujla SZN 1**: a lyric video built on the official music video, designed as an English country-house *Order of the Day*.

| Output | Format | File |
|---|---|---|
| Full video | 1920×1080 · 25 fps · 3:38 | `out/ashke-full-16x9.mp4` |
| Reel | 1080×1920 · 25 fps · 0:45 (song 0:47 → 1:32) | `out/ashke-reel-9x16.mp4` |
| Hero proof | 1920×1080 · song 0:59 → 1:10 | `out/hero-proof.mp4` |

Made with Remotion (React + TypeScript), following the six-stage process in `inputs/process-guide.pdf`: inspect, timing, creative direction, engine and hero proof, full render.

- `docs/creative-direction.md`: concept, the three worlds, the gold hairline, type system and the twelve key moments
- `docs/implementation-notes.md`: pipeline, sync map, lyric fixes, QA, known weaknesses and rebuild steps
- `alignment/`: timing, beat analysis and footage-plate scripts
- `data/`: frozen timing (`words.json`, `phrases.json`), `beat-map.json`, `edl.json`
- `video/`: the Remotion project

Song and footage © their owners. This is a fan or portfolio piece. Credit the artist and get permission before any commercial use. Fonts: SIL OFL.
