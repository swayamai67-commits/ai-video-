# Implementation notes

## Pipeline

| Stage | What | Output |
|---|---|---|
| 0 · Inspect | ffprobe of all inputs; audio cross-correlation of the MV and the reference reel against the MP3 | sync map (below) |
| 1 · Timing | `alignment/build_timing.py`: the supplied lyrics JSON is the source of truth for words **and** timing; only glitches are fixed, timings are untouched | `data/words.json` (399 words), `data/phrases.json` (87 half-lines in 45 lines) |
| 2 · Audio | `alignment/beat_map.py` (librosa): 136 BPM, beats, downbeats, low-band kicks, 10 Hz energy curve | `data/beat-map.json` |
| 3 · Direction | concept, worlds, type system, moments | `docs/creative-direction.md` |
| 4 · Plates | `alignment/build_plates.py`: edit decision list → graded 25 fps footage plates | `video/public/plates/{full,reel}.mp4`, `data/edl.json` |
| 5 · Engine | Remotion + React/TypeScript in `video/src` | `out/hero-proof.mp4` → full + reel renders |

## Sync map (found by envelope cross-correlation)

- Reference reel: `song = reel + 47.15 s`, so the reel covers song 47.15 → 92.31 s. The vertical cut uses this window too.
- Official MV: `song = mv + 19.92` for MV 28–82 s, and `song = mv − 0.40` for MV 107–218 s. MV 0–28 s and 82–107 s are dialogue scenes with no song under them. They are used as b-roll in the 48 s intro, and the river shots are used for "A Letter" (song 102–106.6 s).
- Where the MV is in sync, the picture is kept in sync so Karan's lip-sync survives.

## Lyric fixes (transcription glitches only)

| Supplied | Rendered | Why |
|---|---|---|
| `आଳियां` | `आळियां` | Odia ଳ inside Devanagari |
| `क` `ッ` `チ` | `कच्च` | Katakana noise in the transcript |
| `uttering` | `उतरन` | STT heard a Punjabi word as English |
| `म्याuna` | `म्यानां` | Mixed script |

Everything else is shown exactly as supplied, including English code-switches (trust, Baby you so fire, miss, simple, Show off, hand up, Lambo, photo, body prepare, early, Berg, Yara).

## Engine (`video/src`)

- `lib/time.ts`: one song clock (`useT()`) shared by both formats; easing set, damped spring, deterministic `rnd`.
- `components/LyricTrack.tsx`: word-timed lyric system. Words rise out of a baseline mask with overshoot. The active word turns gold and gets a gold hairline underline that grows in and retracts toward the next word. The past line lifts off with a stagger and blur. Words are never split into code points, so Devanagari shaping stays intact. English words switch to Cormorant Italic. Semantic word treatments: पुठियां flips upside-down, नीली छत rises and turns sky-blue, काले goes ink-black, लालियां blushes red, the first कल्ला shrinks (alone in the crowd), टेढ़ी टेढ़ी tilts left then right, "fire" glows, अश्के/फट/डाका/Lambo turn gold and heavy.
- `components/Chrome.tsx`: the letterbox (it tightens in the study during the song's energy dip, opens for the finale, breathes on loud downbeats, and closes at the end), programme chapter labels, a song-progress hairline, a line counter, tiled film grain, and a legibility scrim.
- `moments/`: bespoke scenes keyed to song time (see the creative direction, §7).
- Camera impulses: the seal, the gunshot, the stamp and the three finale hits shake the whole stage with an exponential decay.
- The same engine renders both formats. Moments read `useFormat()` and re-lay themselves out for 9:16 (Reel safe zones: nothing critical in the top ~190 px, the right ~150 px or the bottom ~320 px).

## QA done

- Contact sheets of 26 key frames (16:9) and 10 key frames (9:16) were reviewed and fixed before the final render.
- **Font test** (`docs/qa/font-test.jpg`): Rozha One draws the श्क conjunct in अश्के so it reads like "अरके" at display size. That is the song's title, so the display face was switched to **Eczar 800**, which renders अश्के, डाका, फट, पिंड, नानके, दादके, कच्च and मुड़ cleanly. Amita was rejected because it turns कच्च into कज्ज.
- Fixed after review: em-based word spacing was resolving against 16 px (words ran together and matras could clip), "Mercy" covered Karan's face, the डाका stamp was too faint, the falcon read as a streak, the milestone covered Karan's face in the reel, and the "tiny" treatment wrongly hit "कल्ला चौड़ा" (broad chest).

## Known weaknesses / next steps

- The lyric timestamps come from the supplied transcription (word-level STT), not a forced alignment against isolated vocals (Demucs + MMS) as the guide recommends. They look right on the hook and verse checks, but melodic or doubled parts may drift by ~0.1 s.
- The lyric text itself is a machine transcription of Punjabi into Devanagari. Some words may differ from the official lyrics; swap in corrected text in `inputs/lyrics.json` and rerun `alignment/build_timing.py`.
- The footage is 720p upscaled to 1080p (16:9) and 720×1280 → 1080×1920 (Reel). It's softer than native 4K plates would be.
- The watch bezel is a graphic and doesn't track the moving watch.

## Rebuild

```bash
pip install numpy scipy librosa soundfile
python3 alignment/build_timing.py
python3 alignment/beat_map.py
# put the official MV + reel at inputs/reference-mv.mp4 and inputs/reference-reel.mp4
python3 alignment/build_plates.py
cp data/*.json video/src/data/
cd video && npm install
npm run render:full   # → out/ashke-full-16x9.mp4
npm run render:reel   # → out/ashke-reel-9x16.mp4
node scripts/stills.mjs AshkeFull /tmp/qa 34 63.4 104.2   # QA stills at song times
```
