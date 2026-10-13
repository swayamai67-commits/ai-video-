# EARRINGS: motion-designed lyric reel

**Malcolm Todd, "Earrings"** (0:00 → 0:33). A 9:16 lyric reel built around a single gold hoop earring: the thing he left in her bed and never texted about.

| Output | Format | File |
|---|---|---|
| Reel (delivery) | 2160×3840 · 60 fps · 33.4 s · H.264 + AAC | `out/earrings-4k60.mp4` |
| Master | 2160×3840 · 60 fps · CRF 14 (not committed: too large for GitHub; rebuild with `npm run render:4k`) | `out/earrings-4k60-master.mp4` |

- `docs/creative-direction.md`: concept ("Left on Read"), six worlds, type and colour system, intensity curve, key moments
- `docs/implementation-notes.md`: pipeline, timing fixes, architecture, known weaknesses, rebuild steps
- `data/`: frozen timing (`words.json`, `phrases.json`), `beat-map.json`, `visual-screenplay.json`
- `video/`: the Remotion project (React + TypeScript)

The song belongs to its owners. This is a fan or portfolio piece. Credit the artist and get permission before any commercial use. All graphics are drawn procedurally in code. Fonts: SIL OFL.
