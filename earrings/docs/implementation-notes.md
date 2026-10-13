# EARRINGS: implementation notes

## Pipeline

| Stage | What | Output |
|---|---|---|
| 0 · Inputs | `inputs/song.mp3` (33.4 s, 44.1 kHz stereo) and `inputs/lyrics.json` (word-level transcript, 59 words) | — |
| 1 · Timing | Words extracted from the transcript. The outro was checked against the vocal band (see below). | `data/words.json`, `data/phrases.json` (frozen) |
| 2 · Audio | librosa: beat tracking, a low-band kick picker on the percussive part, RMS energy at 20 Hz | `data/beat-map.json` (`alignment/beat_map.py`) |
| 3 · Direction | Concept, worlds, type, colour, motion rules, intensity curve | `docs/creative-direction.md`, `data/visual-screenplay.json` |
| 4 · Engine | Remotion 4 + React + TypeScript, designed at 1080×1920 @ 60 fps | `video/` |
| 5 · Render | `--scale=2` gives **2160×3840 @ 60 fps**, rendered natively (vector type, SVG and CSS; textures generated at 4K) | `out/` |

Frozen checksums (sha256, first 16 hex characters):
`words.json 40c8976e5732b095` · `phrases.json 72a8cf0e173bf396` · `song.mp3 0096054cb8f4a63a`

## Timing fixes and confidence

- The supplied transcript placed **"From you."** at 33.14–33.36 s, which is digital silence. Vocal-band energy and spectral flux (900–4000 Hz) end at about 29.3 s, with a small bump at 29.2–29.3 s. It was retimed to **"Oh." 28.24–29.05, "From" 29.12–29.24, "you." 29.24–29.9**. The lyric uses a slow, forgiving fade (0.6 s) because this placement has **low confidence**.
- All other word times are from the transcript unchanged. They line up with kicks and onsets (for example, "earrings" at 4.62 s falls on a kick at 4.53 s, inside the attack).
- I tried Demucs vocal separation, but the model download is blocked by this environment's network proxy. If you have Demucs locally, run it and re-check the outro.

## Architecture (`video/src`)

```
theme.ts            palette, fonts, 1080×1920 @ 60 fps
fonts.ts            @remotion/fonts loader (Instrument Serif, Inter Tight, JetBrains Mono, Caveat, Anton)
lib/time.ts         song clock, word lookup, ramps/easings, damped spring, metallic bounce, seeded PRNG
lib/beats.ts        kick envelope + energy lookup from beat-map.json
components/Hoop.tsx gold hoop rendered as a metal tube (3-stroke gradient, specular streak, Y-axis spin) + four-point Glint
components/Overlays film grain (8 seeded 1024² tiles at 30 Hz, overlay blend), vignette, light leak, silk sheet
components/Reveal   soft-focus word reveal (blur → sharp, rise, out)
scenes/HeadSheet    intro glint, l◯ve, one-line profile, tracked fall, silk sheet, bouncing "earrings", fold push
scenes/Thread       iMessage thread: keystroke engine, live keyboard + key pop, SCARED, typing bubble, drafts, toast, day flip, lock
scenes/Drift        wire heart that never closes, split into two hoops, bokeh dust, drift/further/ap|art, the Oh, title card
Film.tsx            scene timeline, handheld camera (seeded noise), kick-driven exposure pulse, grain + vignette
```

- **Keystroke engine:** `Thread.tsx` builds one sorted list of add, del and clear events. Lyric words are typed in the time between each word's start and the next word's start. The panic backspace speeds up as it goes, and the drafts are scripted. Both the field and the large serif copy read from that same list, so they always match.
- **Textures:** `video/scripts/make_textures.py` generates the silk sheet (a fold height field, Lambert shading plus a satin sheen, warm shadows) at 2160×3840, and the grain tiles. Both are seeded, so they come out the same every time.
- **Determinism:** no `Math.random`. Noise comes from `@remotion/noise` and the PRNGs are seeded.

## Reels safe zones

Critical lyrics stay between y 240 and 1500. The keyboard and the oversized type deliberately run into the bottom caption area, because they are decoration.

## Known weaknesses and next steps

- There was **no footage** in the brief, so the film is pure motion graphics. To put the graphics on top of footage, add the clip as a bottom layer in `Film.tsx`. The SHEET and DRIFT worlds already work as overlays with a blend mode.
- The outro "From you." timing has low confidence (see above).
- The head line art and the silk are procedural or drawn by hand in code. A hand-drawn SVG illustration would push the HEAD world further.
- Render cost at 4K is about 2.6 s per frame on 4 cores, so the full film takes about 90 minutes.

## Rebuild

```bash
cd earrings/video
npm install
python3 -I scripts/make_textures.py public/tex     # only if textures are missing
npx remotion studio                                 # preview
npm run render:4k                                   # 2160×3840 @ 60 fps master
```
