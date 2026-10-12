# ASHKE — motion-designed lyric videos

**Karan Aujla × Mxrci · Aujla SZN 1**. Two cuts of the same song, made with Remotion (React + TypeScript), following the six-stage process in `inputs/process-guide.pdf`: inspect, timing, creative direction, engine and hero proof, then the full render.

## Cut 2: *Eyes on the Jatt* (viral 9:16)

A vertical full-song edit in the language of viral fan edits: estate CCTV and tracking HUDs, text behind the subject, sticker slaps, velocity cuts, a phulkari burst on every *Ashke*. The lyrics are **romanized Punjabi in English letters** with the original timing. Thirteen accent words appear in Punjabi script (ਅਸ਼ਕੇ, ਜੱਟ, ਪਿੰਡ, ਯਾਰ…).

| Output | Format | File |
|---|---|---|
| Full video | 1080×1920 · 25 fps · 3:38 | `out/ashke-viral-9x16.mp4` |
| Hero proof | song 0:48 → 1:17 | `out/ashke-viral-proof.mp4` |

- `docs/viral/creative-direction.md`: concept, worlds, the lock, type system, meaning-driven moves, screenplay
- `docs/viral/lyrics-romanized.md`: every line, original next to romanized
- `docs/viral/implementation-notes.md`: pipeline, footage note, QA, known weaknesses, rebuild steps
- `video/src/viral/`: the engine and scenes (`AshkeViral` composition)

## Cut 1: *The Order of the Day* (16:9 + reel)

Built on the official music video and designed as an English country-house programme, with the lyrics in Devanagari.

| Output | Format | File |
|---|---|---|
| Full video | 1920×1080 · 25 fps · 3:38 | `out/ashke-full-16x9-web.mp4` (3.3 Mbps web encode; the 204 MB CRF-18 master exceeds GitHub's file limit and is rebuilt with `npm run render:full`) |
| Reel | 1080×1920 · 25 fps · 0:45 (song 0:47 → 1:32) | `out/ashke-reel-9x16.mp4` |
| Hero proof | 1920×1080 · song 0:59 → 1:10 | `out/hero-proof.mp4` |

- `docs/creative-direction.md`, `docs/implementation-notes.md`
- `alignment/`: timing, beat analysis, footage-plate scripts (cut 1) and `viral_*.py` + `romanize.py` (cut 2)
- `data/`: frozen timing (`words.json`, `phrases.json`), `beat-map.json`, `edl.json`, `viral/lyrics.json`

Song and footage © their owners. This is a fan or portfolio piece. Credit the artist and get permission before any commercial use. Fonts: SIL OFL.
