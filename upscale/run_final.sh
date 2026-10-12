#!/bin/bash
# Final 4K60 master: graphics layers (Remotion) -> finisher (Python) -> concat + original audio.
# Requires the SR plate in $WORK/plate/sr (upscale/sr_plate.py) and the matte (upscale/matte.py).
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
WORK=${WORK:?set WORK to a scratch dir}
JOBS=${JOBS:-3}
cd "$ROOT/video"
if [ ! -f "$WORK/layers/front.done" ]; then
  npx remotion render AshkeFront "$WORK/layers/front" --sequence --image-format=png --concurrency=4 --log=error
  touch "$WORK/layers/front.done"
fi
if [ ! -f "$WORK/layers/behind.done" ]; then
  for r in $(python3 "$ROOT/upscale/behind_ranges.py"); do
    npx remotion render AshkeBehind "$WORK/layers/behind" --sequence --image-format=png --frames="$r" --concurrency=4 --log=error
  done
  touch "$WORK/layers/behind.done"
fi
cd "$ROOT"
mkdir -p "$WORK/seg"
TOTAL=13080; SEG=$(( (TOTAL + JOBS - 1) / JOBS ))
export PLATE_DIR="$WORK/plate/sr" MATTE="$WORK/matte/matte.mp4" FRONT_DIR="$WORK/layers/front" BEHIND_DIR="$WORK/layers/behind"
export FX="$ROOT/video/src/edit/data/fx.json" CUTS="$ROOT/data/cuts.txt" BEATS="$ROOT/video/src/edit/data/beats.json"
export X264_THREADS=2 CV_THREADS=2
pids=()
for ((j = 0; j < JOBS; j++)); do
  a=$(( j * SEG )); b=$(( (j + 1) * SEG < TOTAL ? (j + 1) * SEG : TOTAL ))
  out="$WORK/seg/seg_$j.mp4"
  [ -f "$out.done" ] && continue
  ( python3 upscale/finish.py $a $b "$out" > "$WORK/seg/seg_$j.log" 2>&1 && touch "$out.done" ) &
  pids+=($!)
done
for p in "${pids[@]}"; do wait $p; done
ls "$WORK"/seg/seg_*.mp4 | sort -V | sed "s/^/file '/; s/$/'/" > "$WORK/seg/list.txt"
ffmpeg -v error -y -f concat -safe 0 -i "$WORK/seg/list.txt" -i "$ROOT/inputs/reference-mv.mp4" \
  -map 0:v -map 1:a -c:v copy -c:a copy -movflags +faststart -shortest "$WORK/ashke-4k60-master.mp4"
echo "MASTER $WORK/ashke-4k60-master.mp4"
