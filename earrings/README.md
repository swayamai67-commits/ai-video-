# EARRINGS: illustrated motion-graphics lyric film

**Malcolm Todd, "Earrings"** (33.4 s reel cut): a 9:16 lyric video with hand-drawn line-art people, risograph print texture and one gold hoop earring that carries the whole story.

| Output | Format | File |
|---|---|---|
| Final film | **2160×3840 (4K UHD, 9:16) · 60 fps** · H.264 + AAC | `out/earrings-4k60.mp4` |
| Key frames | 4K stills of the main moments | `docs/frames/` |

The film is rendered **natively at 4K**, not upscaled. Every illustration, letter and texture is vector or procedural, so Remotion draws each frame at 2160×3840 (`--scale=2` on a 1080×1920 composition).

## How it was made

It follows the staged process from the supplied guide (`../inputs/process-guide.pdf`), adapted to this song:

1. **Inspect inputs**: song.mp3 (33.41 s), word-level lyrics JSON (58 words).
2. **Timing**: the supplied word timestamps are the source of truth (`scripts/build_timing.py` → `data/words.json`, `data/phrases.json`). One documented fix covers the outro (see below).
3. **Beat map**: librosa, ≈80.7 BPM (half-time 161), downbeats every ≈1.49 s, with the energy curve showing the fade from 26 s (`scripts/beat_map.py` → `data/beat-map.json`).
4. **Creative direction**: `docs/creative-direction.md` covers the concept, visual worlds, type system and screenplay.
5. **Engine and scenes**: Remotion + React + TypeScript in `video/`.
6. **QA**: contact sheets of stills at every lyric and transition, with fixes applied before the full render.

```
video/src/
  lib/time.ts       one song clock, easing families, physical springs, 12 fps "boil", beat pulses
  lib/shapes.ts     hand-authored line art: profile ("you"), her face, hands, heart halves
  lib/tear.ts       seeded jagged paper tear (clip paths)
  components/       Ink (draw-on strokes + boil), RisoFill (misregistered fills), Hoop (3D-spinning
                    gold earring), Paper/Grain/halftone defs, Type (Rise, Letters)
  scenes/           S1Head · S2Bed · S3Night · S5Phone · S7Heart · S8Apart
```

## Rebuild

```bash
cd video && npm install
npm run render:4k          # 2160x3840 @ 60 fps → ../out/earrings-4k60-master.mp4 (~15 min on 4 cores)
node scripts/stills.mjs Earrings ../docs/frames 4.9 10.6   # stills at song times
```

## Notes and known limits

- **Outro timing (low confidence).** The aligner put "From you." at 33.14–33.36 s, after the mix has faded to silence. It was moved to the last audible vocal energy (29.55–30.8 s), and the design uses a soft blur-in so a small offset won't read as wrong.
- The lyrics JSON is used as-is for the words. Typographic apostrophes replace straight ones on screen.
- The phone UI text ("stay over? x", the draft) is an in-world prop, not lyric text.
- Fonts are SIL OFL (Instrument Serif, Space Grotesk, Caveat, DM Mono). All illustrations were drawn for this film.
- Song © its owners. This is a portfolio or fan piece: credit the artist and get permission before any commercial use.
