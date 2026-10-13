# ASHKE · Karan Aujla × Mxrci · Aujla SZN 1

Two motion-graphics pieces built on the official music video with Remotion (React + TypeScript), following the staged process in `inputs/process-guide.pdf`.

## 1. 4K60 edit: the official video, upscaled, with viral-edit graphics (latest)

The uncut MV in its original 16:9 frame (nothing cropped), AI-upscaled to **3840×2160** and motion-interpolated to **60 fps**. It carries lock-on HUD graphics, words placed behind the people, and lyrics in **English letters** (romanized Punjabi that keeps the sound, अश्के → ASHKE) with a few Devanagari accents.

| Output | Format | File |
|---|---|---|
| **Master** | 3840×2160 · 60 fps · H.264 · 3:38 · 1.9 GB | `out/master/` (95 MB parts; double-click `join.bat` on Windows or run `sh join.sh` on Mac/Linux) |
| Full-film preview | 1920×1080 · 60 fps · HEVC | `out/ashke-1080p60-preview.mp4` |
| Hero proof | 4K60, 0:40–0:50 | `out/hero-proof-4k60-preview.mp4` |

- `docs/creative-direction-4k-edit.md`: the "LOCK-ON / Old money, new owner" concept, palette, type, structure, rules
- `docs/implementation-notes-4k-edit.md`: pipeline, upscaler benchmarks, interpolation, colour, QA, rebuild steps
- `lyrics/romanize.py` → `data/lyrics-roman.json`: the romanized lyrics, word-aligned to the timing
- `upscale/`: Real-ESRGAN (ONNX), person matte and tracking, 60 fps finisher, packaging
- `video/src/edit/`: the Remotion graphics engine (`AshkePreview`, `AshkeFront`, `AshkeBehind`)

## 2. "Order of the Day" lyric film (earlier)

A re-cut lyric film in Devanagari, at 1920×1080 25 fps plus a 9:16 reel: `out/ashke-full-16x9-web.mp4`, `out/ashke-reel-9x16.mp4`, `out/hero-proof.mp4`. See `docs/creative-direction.md` and `docs/implementation-notes.md`.

Song and footage © their owners. This is a fan or portfolio piece. Credit the artist and get permission before any commercial use. Fonts: SIL OFL. Real-ESRGAN: BSD-3. Robust Video Matting: GPL-3.0 (used as a tool; its weights are not redistributed here).
