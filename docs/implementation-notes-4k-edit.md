# ASHKE 4K edit: implementation notes

The official MV, uncut, in its original 16:9 frame, upscaled to **3840×2160 at 60 fps**, with motion graphics and romanized lyrics. Creative direction: `creative-direction-4k-edit.md`.

## Pipeline

| Step | Tool | Script | Output |
|---|---|---|---|
| Sync map | librosa envelope cross-correlation, MV soundtrack vs `song.mp3` | `alignment/sync_map.py` | song = MV + 19.91 s (MV 25.5–85.0), song = MV − 0.41 s (MV 105.3–218). MV 85–105.3 is the butler's dialogue inserted into the song. |
| Lyrics → English letters | hand transliteration, word-for-word aligned to the frozen timing | `lyrics/romanize.py` | `data/lyrics-roman.json` (399 words, 11 Devanagari accents) |
| Edit data | lyrics, beats, cuts and a 60 Hz loudness curve, all in MV time | `alignment/edit_data.py` | `video/src/edit/data/*.json` |
| Person matte | Robust Video Matting (MobileNetV3, ONNX, CPU), recurrent state reset at every cut | `upscale/matte.py` | `matte.mp4` (720p alpha) |
| Tracking | connected components of the matte → per-frame person boxes, primary-subject track smoothed inside each shot | `upscale/track.py` | `subjects.json`, `public/matte/*.png` |
| 4K plate | **Real-ESRGAN `realesr-general-x4v3` + 0.5 `wdn` denoise blend**, converted from `.pth` to ONNX without PyTorch (`upscale/pth2onnx.py`) | `upscale/sr_plate.py` | 22 resumable x264 chunks, 3840×2160 at 25 fps |
| Graphics | Remotion (React/TS), transparent 4K60 PNG layers: `AshkeFront` (lyrics, HUD, moments), `AshkeBehind` (words behind people) | `video/src/edit/` | PNG sequences |
| Finish | DIS optical-flow interpolation 25→60 fps, compositing, camera, leaks, flashes, grain, encode | `upscale/finish.py`, `upscale/run_final.sh` | `ashke-4k60-master.mp4` |

### Why this split

A first architecture rendered everything, footage included, inside Remotion at 4K. That measured ~1.0 s per frame, ~0.7 s of it spent shipping 4K footage through Chrome. The footage was also JPEG-recompressed by the screenshot. Graphics alone render in ~0.25 s per frame. So Remotion draws only the graphics, as transparent layers, and a Python finisher composites them onto the plate. The footage goes plate → finisher → one final encode, with no intermediate lossy step.

### Upscaler choice (measured on this footage)

| Variant | s / frame (4 cores) | Verdict |
|---|---|---|
| general-x4v3 from 720p | 7.2–8.0 | best, but ~11 h for the film |
| **general-x4v3 + 0.5 denoise from 960×540 → native 3840×2160** | **4.0** | Nearly identical to the 720p input (the downscale also removes macro-blocking). **Used.** |
| same, int8 (VNNI) | 2.6 | Visible smearing, rejected |
| general from 800×450 | 2.6 | Softer, rejected |
| animevideo-v3 from 960×540 | 2.1 | Flattens brick and skin, plastic faces on wide shots. Rejected. |

PyTorch could not be installed (download.pytorch.org is outside the network policy). The `.pth` weights are unpickled with numpy and rebuilt as an ONNX graph (Conv/PReLU ×N → DepthToSpace + nearest-upsampled residual), then run with onnxruntime.

### Frame interpolation (25 → 60 fps)

- DIS optical flow (OpenCV, medium preset) at 960×540 in both directions per source pair. Super-SloMo-style intermediate flows are upsampled and applied to the 4K frames.
- Blending is weighted by how well the two warps agree. Where they disagree (occlusion), the temporally nearer frame wins instead of ghosting.
- **Never across a cut.** Pairs that straddle one of the 86 detected cuts hold the last frame of the shot.
- If the mean warp agreement in a frame is poor (whip pan, flash), the nearest real frame is used instead of a smeared one.
- The person matte is warped with the same flow, so cut-out edges stay locked to the interpolated picture.

### Colour

`sr_plate.py` let ffmpeg convert RGB→YUV with its BT.601 default while tagging the stream BT.709 (measured: ~2 code values of green shift). The finisher decodes the plate with `in_color_matrix=bt601` and encodes the master with an explicit `out_color_matrix=bt709`, so the master matches the original MV.

## Engine (`video/src/edit`)

- `data.ts`: lyrics, lines, beats, loudness, shots, the tracked subject and person blobs, all in MV seconds.
- `Lyrics.tsx`: word-timed lyric lines. The free side of frame is chosen once per line from the tracker, so text never covers a face or jumps mid-line. Words rise in with a spring. The active word gets a champagne chip. English code-switches go italic. Devanagari accents float above or below their word. Semantic treatments: *puthiyan* flips upside-down, *tedhi tedhi* tilts left then right, *kaale* goes ink-black, *fire* burns orange, *phatt* and *daaka* turn red, and the woman's line ("Ve main miss kardi aa tainu…") is set in marker handwriting.
- `Behind.tsx`: giant Anton words between the footage and the cut-out people: ASHKE, JATT, SEENA, LAMBO, NAAG, and ASHKE ×3 in the hook, growing each time with a Devanagari ghost. A word never outlives its shot.
- `hud/`: REC frame and timecode (`Rig`), lock-on brackets that track people (`Lock`, `Track`), marker scribbles, crown, arrow and stamps (`Marks`).
- `moments/`: boot scan, MR. AUJLA lock-on, *Mercy*, 23 GUNS, the PHATT gunshot (crosshair → impact burst → clay shatter and hit marker), crown on JATT, "1 vs ALL", HIM ↑ to the sky, rider multi-lock, blush lock, cars CLAIMED (the stamp lands on the house), FIRE loop, a quiet "AUDIO: DIALOGUE" during the butler's speech, BLOODLINE (NAANKE / DAADKE), +25 KILLE, PHOTO · NOT POSTED on the painting, PASSENGER, the Patek APPRAISAL reticle and glints, DAAKA (stolen heart → red stamp, siren sweep), the NAAG serpent stroke, sign-off and END OF TAPE.
- `data/fx.json`: camera punches and shakes, flashes and light leaks. **One file read by both** the Chrome preview and the Python finisher, so the preview is what the master does.

## QA

- Contact sheets of ~45 key frames were reviewed (preview composition on the 720p MV) and fixed before the 4K render. Fixes: a lock label pushed off-frame, duplicated "Mercy", a crown landing in the corner, an arrow spilling into the next shot, the blush lock on the wrong person, car rects and the CLAIMED stamp (moved off Karan onto the house), a faint clay burst, LAMBO overlapping the PHOTO moment, the reticle off the watch's pivot, glints too small, and NAANKE/DAADKE labels too small.
- 4K finisher check at 100% crop: a soft hair halo from the 540p matte was fixed by compositing with the native 720p matte and an edge-tightening curve.
- Interpolation is never applied across cuts. Mean warp agreement is checked on every interpolated frame.

## Known limits

- The source is a ~0.8 Mbps 720p web encode. The 4K plate is a neural reconstruction: edges, hair and fabric are genuinely sharper, but it cannot recover detail the encode threw away.
- The matte is person-only (RVM). Objects held in front of a word (the shotgun) are cut out only where they overlap a person.
- Fixed-position graphics (cars, painting, watch) are placed per shot, not tracked. The shots are steady enough that they hold.

## Rebuild

```bash
pip install onnxruntime onnx opencv-python-headless librosa soundfile numpy
# weights: realesr-general-x4v3.pth + realesr-general-wdn-x4v3.pth (Real-ESRGAN releases), rvm_mobilenetv3_fp32.onnx (RVM releases)
python3 upscale/pth2onnx.py realesr-general-x4v3.pth upscale/general_dn.onnx 0.5 realesr-general-wdn-x4v3.pth
python3 upscale/sr_plate.py inputs/reference-mv.mp4 upscale/general_dn.onnx $WORK/plate/sr 4      # ~6 h on 4 CPU cores
python3 upscale/matte.py inputs/reference-mv.mp4 rvm_mobilenetv3_fp32.onnx $WORK/matte data/cuts.txt
python3 upscale/track.py $WORK/matte/matte.mp4 data/cuts.txt video/src/edit/data/subjects.json video/public/matte
python3 video/scripts/make-grain.py && cp inputs/reference-mv.mp4 video/public/mv.mp4
cd video && npm install && node scripts/edit-stills.mjs /tmp/qa 42.3 43.85 193.4   # preview stills
cd .. && WORK=$WORK upscale/run_final.sh                                                # layers + finish + mux
```
