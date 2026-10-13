# Implementation notes: SEE YOU AGAIN

## Pipeline

| Stage | What | Output |
|---|---|---|
| 0 · Inspect | ffprobe of the MP3 (11.62 s, 44.1 kHz stereo). The supplied frame is 300×169 with the cover art at x 65–234, so the art is a 170 px square | — |
| 1 · Timing | `pipeline/build_timing.py`. The supplied JSON gives word timings. `[upbeat music]` is dropped. `[indistinct]` is filled and one mis-hearing is fixed (below) | `data/words.json` (28 words), `data/phrases.json` |
| 2 · Beats | same script, librosa: beats (~156 BPM), onsets, 30–150 Hz kicks, a 60 Hz energy curve | `data/beat-map.json` |
| 3 · Plates | `pipeline/build_plates.py`: Real-ESRGAN x4plus run twice on CPU via spandrel (170 → 2720 px, Lanczos to 2560, light unsharp), then a rembg `u2net_human_seg` cut-out of Tyler | `video/public/cover/{cover,tyler}.png` |
| 4 · Textures | `pipeline/build_textures.py`: seeded film grain tiles, kraft paper (3840×2160), halftone screen | `video/public/{grain,tex}/` |
| 5 · Engine | Remotion 4 + React/TypeScript in `video/src`, authored at 1920×1080 and rendered with `--scale=2`. Vectors and type are re-rasterised natively at 3840×2160, not upscaled | `out/see-you-again-4k60.mp4` |

## Lyric check (the words are what's sung)

The vocal was isolated with UVR MDX-Net (`Voc_FT`) and transcribed with Whisper small.en (sherpa-onnx):

| Span | Supplied JSON | Rendered | Evidence |
|---|---|---|---|
| 1.40–2.58 s | `[indistinct]` | *And can you make it* | Whisper on the isolated vocal: "Can I get a kiss? And can you make it last forever?" Word starts sit on the strongest vocal onsets in the span |
| 6.62–7.40 s | *pull away.* | *go to war.* | The released lyric. Whisper hears "…box a pho-to", which fits *'bout to go to war* (b-t-g-t-w) and not *pull away*. Timings split inside the original span |

To revert, empty `FIXES` in `pipeline/build_timing.py`, re-run it, and copy `data/*.json` to `video/src/data/`.

## Engine (`video/src`)

- `lib/time.ts`: one song clock (`useT`), easing families (including a `velocity` speed-ramp curve), a damped spring, wobble/flash envelopes, and seeded noise. There is no `Math.random`.
- `fx/fx.tsx`: camera impulse on the five hero hits (kiss, FOREVER, WAR, postmark, again), a one-frame cream flash, an RGB-split text-shadow on hero words, rotating halftone sun rays that pulse on low-band kicks, tiled grain and a vignette.
- `art/`: every illustration is drawn in code as SVG:
  - `Profiles`: the kissing profiles (cap and closed eyes for him; curls, a sunflower, lipstick and a hoop for her) whose negative space is a Rubin's vase
  - `Figures`: the full-body boy (green cap, white tee) and girl (sunflower dress) with a walk cycle, a holding pose and a wave
  - `Bee`: the bee glyph plus a flight path with the dashed bee-line trail
  - `Cover`: the print, with layers plate → behind → Tyler → front
  - `Type`: rise-from-baseline words with overshoot and an underline drawn while sung, and pen-reveal handwriting
- `scenes/`:
  - `Kiss` 0–2.62 s: sun iris, card settle, profiles meet on *kiss?*, petal burst, camera through the vase
  - `Tunnel` 2.62–5.0 s: a Droste fall. Each level is the cover as a Polaroid held to Tyler's chest, captioned *last FOREVER*. The camera zooms about the transform's fixed point (closed form, not recursive), with a velocity kick on *forever*, depth-of-field on oversized levels and an ∞ bee-line
  - `World` 4.5–11.67 s: swarm wipe → the field (couple, red thread, squadron, WAR.) → velocity pull-back into a postcard on a desk → postage stamp, rubber-stamp postmark, handwriting, SEE / YOU, *again.* with echoes, bees lift the card
  - `Finale`: the swarm, the dusk grade, stars, the credit and the end fade

## QA

Contact sheets of key frames were reviewed after each pass (`docs/qa/`). Fixed after review:
- FOREVER as text behind Tyler read as "FOR ER": the caption moved onto the nested Polaroids, and the camera anchors the fixed point high so captions stay in frame.
- The first Droste placement floated the nested print beside him rather than in his hands. It was re-placed at his chest with thumbs on the corners.
- The field framing showed a headless torso; it was reframed. The figures overlapped a painted bee; they were scaled and moved.
- Caveat's *f* reads as *t*, so the handwriting face is now Kalam Bold.
- Handwriting and *again.* overlapped the postcard; both were moved.
- The inpainted "Tyler removed" plate smeared, so it's not used. Tyler stays in every shot.

## Known weaknesses

- The source art is 170 px. ESRGAN ×16 gives a clean painterly 2560 px plate, but detail is invented, and the deepest tunnel zooms (up to ~5.9× on the outgoing level) are soft. Depth-of-field blur is applied there on purpose.
- The rembg matte has a slight fringe at Tyler's left hand. It's only visible in the largest tunnel frames.
- Word timings for *And can you make it* come from onset placement, not forced alignment (no aligner model was reachable from this environment). They look right in the proof, but they can be ±0.05 s.

## Rebuild

```bash
python3 -m venv .venv && .venv/bin/pip install torch spandrel "rembg[cpu]" librosa opencv-python-headless "audio-separator[cpu]" sherpa-onnx
# weights: RealESRGAN_x4plus.pth → pipeline/models/ (GitHub release v0.1.0)
.venv/bin/python -I pipeline/build_plates.py
.venv/bin/audio-separator inputs/song.mp3 --model_filename UVR-MDX-NET-Voc_FT.onnx   # optional: vocal stem
.venv/bin/python -I pipeline/build_timing.py "<vocals.wav>"
python3 pipeline/build_textures.py
cp data/*.json video/src/data/
cd video && npm install
npm run render:4k      # → out/see-you-again-4k60.mp4 (3840×2160, 60 fps)
node scripts/stills.mjs /tmp/qa 0.96 3.9 6.9 10.6   # QA stills at song times
```
