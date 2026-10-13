#!/bin/bash
# Render the transparent 4K60 graphics layers in resumable 20 s blocks.
set -u
ROOT=$(cd "$(dirname "$0")/.." && pwd)
WORK=${WORK:?set WORK}
cd "$ROOT/video"
mkdir -p "$WORK/layers/front" "$WORK/layers/behind"
for ((a = 0; a < 13080; a += 1200)); do
  b=$(( a + 1199 < 13079 ? a + 1199 : 13079 ))
  [ -f "$WORK/layers/front/block_$a.done" ] && continue
  if npx remotion render AshkeFront "$WORK/layers/front" --sequence --image-format=png --frames=$a-$b --concurrency=3 --log=error > "$WORK/layers/last.log" 2>&1; then
    touch "$WORK/layers/front/block_$a.done"; echo "front block $a-$b done $(date +%T)"
  else
    echo "front block $a-$b FAILED"; grep -v -iE "memory|docker" "$WORK/layers/last.log" | tail -5; exit 1
  fi
done
touch "$WORK/layers/front.done"
for r in $(python3 "$ROOT/upscale/behind_ranges.py"); do
  [ -f "$WORK/layers/behind/r_$r.done" ] && continue
  if npx remotion render AshkeBehind "$WORK/layers/behind" --sequence --image-format=png --frames="$r" --concurrency=3 --log=error > "$WORK/layers/last.log" 2>&1; then
    touch "$WORK/layers/behind/r_$r.done"; echo "behind $r done"
  else
    echo "behind $r FAILED"; exit 1
  fi
done
touch "$WORK/layers/behind.done"
echo "LAYERS DONE"
