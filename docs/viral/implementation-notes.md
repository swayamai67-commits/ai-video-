# Viral cut: implementation notes

## Pipeline

| Stage | Script | Output |
|---|---|---|
| Lyrics → English letters | `alignment/romanize.py` | `data/viral/lyrics.json` (87 phrases, 399 words, timings copied from the frozen `data/phrases.json`), `docs/viral/lyrics-romanized.md` |
| People plates | `alignment/viral_plates.py` | `video/public/viral/plates/<clip>/NNNN.jpg` (25 fps JPEG sequences), `video/src/viral/data/plates.json` |
| Cutouts + tracking | `alignment/viral_cutouts.py` (run by the plates script) | `video/public/viral/cut/<clip>/NNNN.webp` (RGBA, rembg `u2net_human_seg`), `video/src/viral/data/track.json` (LK feature points, subject and head boxes) |
| Stickers | `alignment/viral_stickers.py` | `video/public/viral/stickers/<clip>_<frame>.webp` (cutouts with a baked white outline and hard shadow) |
| Faces | `alignment/viral_faces.py` | `video/src/viral/data/faces.json` (OpenCV YuNet on the family portrait) |
| Type metrics | `alignment/viral_metrics.py` | `video/src/viral/data/metrics.json` (Latin advances from the font files; Gurmukhi and Devanagari widths shaped with HarfBuzz) |
| Render | `npm run render:viral` then `npm run encode:viral` | `out/ashke-viral-9x16-master.mp4` (CRF 18, git-ignored) → `out/ashke-viral-9x16.mp4` (web encode) |

## Romanization rules

- Words are spelled the way Punjabi is commonly typed online: *Jittan de shaunki, sohniye haravan vairi hass ke*. Pronunciation follows the supplied transcription. Only the script changes, never the word.
- One romanized token per timed word, so every timestamp is reused as is (`romanize.py` asserts the counts match).
- English code-switches (trust, fire, miss, simple, Show off, hand up, Lambo, photo, body, prepare, early, Berg) are flagged `en` and set in Instrument Serif Italic.
- Accent words (Gurmukhi): ਬਾਬੇ, ਅਸ਼ਕੇ ×4, ਜੱਟ ×2, ਪਿੰਡਾਂ, ਪਿੰਡ, ਯਾਰ, ਸੀਨਾ, ਡਾਕਾ, ਨਾਗ (13 of 399 words). Devanagari spellings are stored too. Set `ACCENT_SCRIPT = 'dev'` in `video/src/viral/config.ts` to show them in Hindi script instead.
- Transcription glitches already fixed upstream (Odia ळ, katakana noise, "uttering" → *utran*) stay fixed.

## Why the footage is cropped from the first render

The official MV is not in the repository, and the sandbox has no access to stock footage sites. The only picture of people available is the first cut's own 16:9 render, `out/ashke-full-16x9-web.mp4`, which carries the MV in song time with lyrics burned into the lower-left of the picture and a few hero overlays. Each clip in `viral_plates.py` is a crop window chosen (and checked with `--sheet`) to avoid them. Vertical windows are 454×807 source pixels upscaled to 1080×1920, so full-bleed shots are soft. Grain, grading, HUD and fast cutting carry that. To upgrade, place the clean MV, change `SRC` and the crop table, and rerun.

## Engine (`video/src/viral`)

- `Plate.tsx`: frame-sequence player. Song time maps to a frame index through `sync` (lip-sync), `from/src/speed`, or a `ramp(t)` function (velocity edits), with an optional `step` for shooting on twos. Image sequences instead of video allow freezes, reverses and ramps.
- `text.tsx`: SLAM (one word at a time), LOCKUP (rows fitted to the frame width from precomputed glyph metrics, so nothing is measured in the DOM at render time), Hero and Mono.
- `Lyrics.tsx`: the lyric director. It decides which phrases slam and which lock up, applies the meaning-driven word treatments, keeps lockups above the Reels caption zone, and steps aside (`MUTE`) when a scene owns the screen.
- `hud.tsx`: blob tracking (tracked points, ids, connecting lines), the lock (brackets that search and then settle on the head box), feed chrome (REC, timecode, cam id, progress).
- `fx.tsx`: camera (downbeat zoom punch, kick shake, drift), RGB split, glitch slices, flashes, grain, scanlines, vignette, a CSS halftone and paper.
- `graphics.tsx`: phulkari diamonds, burst and band; stickers (cutout + white outline); tape; chat bubble; crosshair; crack; snake; embers; the empty post.
- `scenes/`: Intro (0–48 s), Verse (48–105.6 s), Middle (105.6–146.7 s), End (146.7–217.8 s).

## QA done

- Contact sheets of every crop window: removed the boat-with-gold-line, postcard, gilt-frame and patek-dial plates that still carried first-cut overlays, and trimmed clips whose ends ran into them.
- Stills reviewed at every scene. Fixed: the lock running off-frame on close-ups (it is now clamped to the safe frame); KARAN AUJLA hidden behind his head (switched to a centred full-body shot); lyric lockups overlapping the ASHKE drop (MUTE windows); doubled accent words; lockups dropping into the Reels caption zone (auto-lift to y ≤ 1500); CHAUDA overflowing the frame.
- The first full render crawled at the sticker collage (about 5 s per frame): eight chained CSS `drop-shadow`s per sticker are rasterised in software by headless Chrome. The outlines are now baked in Python (`viral_stickers.py`) and those frames render as fast as the rest.
- Full-film contact sheet (`docs/viral/qa/contact-full.jpg`, one frame every 3 s) reviewed after the render. Fixed an empty WANTED photo window (the clip had only a sliver of him in those frames). That section (frames 4200–4345) was re-rendered and spliced into the master on exact frame boundaries, verified by frame count (5445) and stills either side of both joins.
- The CSS halftone read as flat silhouettes on this soft, dark footage, so the zine pages use photocopied (high-contrast black and white) stickers instead. The halftone stays only as a print texture.

## Known weaknesses

- Footage softness (see above).
- Lyric timings are the supplied word-level transcription timings, not a forced alignment.
- Romanized spellings follow the supplied Devanagari transcription. Where that transcription misheard a word, so does the romanization; fix the word in `alignment/romanize.py` and rerun.
- Blob-tracking points come from LK optical flow and re-seed on cuts, so boxes jump at MV cuts. This matches the look but is not object tracking.

## Rebuild

```bash
python3 -m venv .venv && .venv/bin/pip install opencv-python-headless numpy rembg onnxruntime pillow fonttools brotli uharfbuzz
python3 alignment/romanize.py && cp data/viral/lyrics.json video/src/viral/data/
.venv/bin/python alignment/viral_plates.py          # plates + cutouts + tracking (~45 min on 4 cores)
.venv/bin/python alignment/viral_stickers.py       # baked sticker outlines
.venv/bin/python alignment/viral_faces.py portrait  # downloads the YuNet model on first run
.venv/bin/python alignment/viral_metrics.py
cd video && npm install && npm run render:viral && npm run encode:viral   # master (CRF 18, git-ignored) → web encode out/ashke-viral-9x16.mp4
node scripts/stills.mjs AshkeViral ../previews/qa 63.7 92.4 117.6   # QA stills at song times
```
