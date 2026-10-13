# ASHKE: 4K motion-graphics edit, creative direction

**Brief:** the official music video, uncut and unframed (16:9, nothing cropped), upscaled to **3840×2160 at 60 fps**, with viral-edit motion graphics laid over it. Lyrics are in **English letters** (romanized Punjabi that keeps the sound: अश्के → ASHKE), with a handful of words also shown in Devanagari for flavour.

This is a separate deliverable from the earlier "Order of the Day" lyric film (`creative-direction.md`). That film re-cut the MV and set Devanagari type. This one keeps every frame of the MV in its original order and timing. The graphics are designed *for the shot that is on screen*.

## 1. Concept: "LOCK-ON / OLD MONEY, NEW OWNER"

The MV shows a Punjabi Jatt taking over an English country estate: butler, clay guns, polo, Aston Martins, a vault of watches, a river launch, a candlelit dinner, and the whole Punjabi family on the lawn. The edit treats the camera as a **surveillance / scouting rig scanning the estate**. Every new thing it sees gets *locked on*, labelled, valued and claimed. The lyric is the voice-over of the takeover.

That gives the viral-edit vocabulary a reason to exist instead of being stickers:

| Viral technique (2025–26 edits) | Why it's here |
|---|---|
| **Tracking brackets + mono data labels** that follow people | The rig locks on. Driven by a real per-frame person matte (Robust Video Matting), so the brackets follow people instead of floating. |
| **Text behind the subject** (giant word, Karan in front) | Karan stands in front of his own words. Hero words only. |
| **Kinetic word-by-word lyric** with a hard active word | The voice-over. Rap pace, so it's readable: one line, active word lit, past words dim. |
| **Beat punch-ins, impact shake, flash frames** | Gunshot, "PHATT", "DAAKA", the hook drops. Used on chosen hits only, never on every beat. |
| **Handmade marker scribbles** (2026 "imperfect" trend) | Circles, crowns, arrows and underlines drawn on with a marker, as if someone annotated the CCTV. |
| **Grain, gate weave, light leaks, letterbox** | Holds the 720p source and the graphics in one filmic surface. |

## 2. Palette

| Token | Hex | Use |
|---|---|---|
| Ivory | `#F5EFE4` | lyric type, brackets |
| Champagne | `#E6C27A` | the active word, the gold scan line, value labels |
| Signal red | `#FF3B2F` | impacts only: PHATT, DAAKA, the lock "REC" dot, scribbles on hits |
| Racing green | `#0F3D2E` | label chips (Aston Martin / British racing green) |
| Ink | `#0A0A0A` | shadows, chips |

## 3. Type

| Role | Face | Notes |
|---|---|---|
| Hero words / text behind subject | **Anton** | Condensed, heavy, all-caps; can fill the frame height |
| Lyric line | **Instrument Serif** (italic for English code-switches) | Editorial, old-money, very readable at size |
| HUD, labels, data | **JetBrains Mono** | Tracking labels, timecode, coordinates |
| Marker annotations | **Permanent Marker** | The handmade layer |
| Devanagari accents | **Eczar 800** | Tested earlier for अश्के's श्क conjunct; never split into code points |

## 4. Structure and intensity (MV time)

| MV time | Footage | Graphic world | Intensity |
|---|---|---|---|
| 0:00–0:25 | Title card, arrival, dialogue (burned-in subtitles) | **BOOT**: the rig powers on; timecode, coordinates, first lock-on "MR. AUJLA" | 2–3 |
| 0:25–0:44 | Lawn, guns table, Karan aims | **SCAN**: lyric enters; ASHKE behind Karan as he aims | 4–6 |
| 0:43.7 | The shot | **PHATT**: flash, shake, red hit marker, the clay bursts | 9 |
| 0:44–1:25 | Shooting, polo, tea, the Astons | **CLAIM**: lock-ons on guests, horses and cars; values; scribbles | 6–7 |
| 1:25–1:45 | Butler in the study (subtitled dialogue) | **QUIET**: graphics recede; only the timecode and a slow "RECORDING" bracket. The subtitles stay clean. | 1 |
| 1:45–2:01 | The family portrait | **BLOODLINE**: NAANKE / DAADKE lock-ons, the family counted | 7 |
| 2:01–2:15 | Study, the portrait on the wall | **HEIST PREP**: "photo bhi ni paayi" frames the painting | 6 |
| 2:15–2:28 | River launch | **CRUISE**: wide type, wake lines | 5 |
| 2:28–2:44 | Vault: jewels, Patek, loupe | **APPRAISAL**: macro reticle and valuation; "full Berg"; stones sparkle | 7 |
| 2:44–3:06 | Golden-hour polo, dinner | **DAAKA**: "the robbery". Red stamp, siren sweep | 8 |
| 3:06–3:21 | The study at night; Karan front-on | **HOOK ×3**: ASHKE behind Karan grows on each repeat; Devanagari अश्के ghost | 10 |
| 3:21–3:38 | Boat, the Astons, fade | **SIGN-OFF**: the rig powers down; credits | 3 → 0 |

## 5. Rules

- **Footage is the hero.** Never cover faces with lyric type. The lyric sits in the lower third or beside the subject, on the side the subject is *not* on. The matte bbox tells the engine which side is free.
- **Text behind subject only for hero words** (ASHKE, JATT, PHATT, LAMBO, DAAKA, NAAG…). It's the one move people remember, so it stays rare.
- **Motion has weight.** Brackets snap with overshoot, labels type on, impacts decay exponentially, and nothing moves linearly.
- **Beat use is selective.** Punch-ins happen on downbeats only in the hook and the DAAKA section. Flashes are reserved for about a dozen moments in the whole film.
- **No crop.** Punch-ins are brief (≤6 %, under 0.4 s) and return to full frame. The delivered frame is the MV's full 16:9 frame at 4K.
