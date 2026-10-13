# SEE YOU AGAIN: creative direction

**Tyler, The Creator ft. Kali Uchis · *Flower Boy* (2017) · 11.6 s clip**
Output: 3840×2160 · 60 fps · built around the album cover (the painted sunflower field and bees).

## 1 · What the lines mean

The clip is the song's whole argument in four lines. He asks for a kiss and asks for it to *last forever*, then admits he is about to leave and may never come back. It's a goodbye said at golden hour. The Flower Boy painting is already a frozen sunset, so the video asks: **what if that moment refused to stay still?**

| Line | Meaning | How it exists on screen |
|---|---|---|
| *Can I get a kiss?* | the ask, shy then direct | two cut-paper **profiles** (him in the green cap, her with curls and a sunflower) slide in from the frame edges and meet on *kiss?*. The space between their faces becomes a **Rubin's-vase window**, and the cover shows through it |
| *And can you make it* | the bargain | the camera pushes **through** the vase window into the painting |
| *last forever.* | wanting time to stop | **infinite Droste zoom**: the cover nested inside itself, spiralling. FOREVER is printed on every nested frame, so the word itself never ends |
| *I said I'm 'bout to …* | the confession | two small full-body figures stand holding a **thread** in the field |
| *… go to war / pull away* | the leaving | he walks out, the thread stretches and **snaps**, and the camera does a velocity **pull-back**: the whole world shrinks into a postcard on a desk |
| *I don't know if I'ma see you again.* | the doubt | a rubber **postmark** stamps the postcard (it's being sent away). The words are handwritten on the paper around it. *again* is drawn by the bee-line and **echoes**. Dusk falls, and bees carry the card into the sky |

## 2 · Signature device: the bee-line

The cover's bees become the narrators. Each bee flies on a **dashed flight-path** (the way children's-book illustrations draw a bee's trail). The same line is a character that keeps changing role:

underline under the sung word → the gap between the two faces → the **∞** looping around FOREVER → the **thread** between two hands that snaps → the **postmark** circle → the loop that writes ***again*** → the trail of the bees carrying the card away.

Where possible, the line **continues** instead of being destroyed and respawned.

## 3 · Worlds and colour

| World | When | Palette | Texture |
|---|---|---|---|
| **GOLDEN HOUR** | 0 – 4.7 s | sky orange `#F49A2C`, ember `#E5482A`, sunflower `#FFC531`, cream `#FFF1D8` | paper grain, halftone sun rays |
| **THE FIELD** | 4.7 – 7.4 s | hill green `#4F7B3A`, cap green `#1F5A40`, tee white | the cover itself (2.5D parallax: Tyler cut out from the plate) |
| **DUSK / POST** | 7.4 – 11.67 s | kraft `#C4965F`, ink `#2B1A12`, dusk violet `#3A1F4D`, rose `#E86A8E` | kraft paper, ink stamp, a grade sliding from gold to dusk |

Lipstick red `#D9262A` is reserved for **kiss?** and the postmark ink: one colour for the two "touch" moments.

## 4 · Typography

- **Anton** (condensed, heavy): the punch words *KISS? · FOREVER · AWAY/WAR · SEE YOU · AGAIN*. It's huge, often bleeds off the frame, and sits in front of or behind the cover (depth).
- **Instrument Serif Italic**: the connective, whispered words (*can I get a*, *and can you make it*, *I said I'm 'bout to*, *I don't know if I'ma*). Editorial and soft.
- **Kalam Bold**: handwriting on the kraft desk and the Polaroid captions. Caveat was tried first and dropped: its *f* reads as *t* ("if" → "it").
- **Space Mono**: tiny metadata (timecode, track credit, postmark text).

Nothing is centred by default. Connective words sit on edges. Only the hero words dominate.

## 5 · Motion principles

- Words rise out of a baseline mask with overshoot on their exact timestamp. Hero words land with an **impact** (camera impulse, a one-frame flash, a short chromatic split). This is the viral "hit" grammar, used on hero words only.
- **Velocity ramps** (fast in, long ease out) for camera moves: the push through the vase, the pull-back into the postcard. These are the speed-ramp edits that dominate short-form.
- **Materials differ**: paper profiles slide with weight; the thread is elastic and recoils when it snaps; the rubber stamp accelerates, squashes, rebounds and leaves ink; bees are jittery and light.
- **2.5D**: Tyler is cut out of the cover plate (rembg). His head breaks *out of* the card frame (the out-of-bounds pop), and he parallaxes against the field.
- Deterministic: seeded noise only.

## 6 · Intensity curve

`0.0` iris open (5) → `0.96` **kiss** (9) → `1.4–2.6` push-through, breathing (5) → `3.2–4.5` **forever tunnel** (10) → `4.7–5.7` bee swarm wipe, quiet field (4) → `6.9` **snap + pull-back** (9) → `7.4–9.0` postcard, stamp (6) → `10.5` **again** echo (8) → `11.0–11.67` dusk, credit (3)

## 7 · Process (following the guide)

0. Inspect inputs: an 11.62 s MP3, the 4-segment word-timed JSON, and a 300×169 frame with the cover art at 170×169.
1. Timing: the JSON is the timing source. The `[indistinct]` span and any mis-heard word are checked against a Whisper transcription of the clip (see `implementation-notes.md`).
2. Beat map: librosa (onsets, beats, low-band kicks). It drives the secondary motion only.
3. Plates: Real-ESRGAN ×4 → ×4 upscale of the cover (170 px → 2720 px), then a rembg cut-out of Tyler and an inpainted clean plate for parallax.
4. Engine + proof frames: contact sheets are reviewed before the final 4K/60 render.
