#!/usr/bin/env bash
# usage: scripts/stills.sh OUTDIR t1 t2 ...   (song seconds) -> half-res PNG stills + contact sheet
set -e
out=$1; shift
mkdir -p "$out"
for t in "$@"; do
  f=$(python3 -c "print(round($t*60))")
  npx remotion still Earrings "$out/t$t.png" --frame=$f --scale=0.5 --log=error >/dev/null
done
