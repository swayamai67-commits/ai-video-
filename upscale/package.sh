#!/bin/bash
# Concat finished segments + original MV audio -> master; split for GitHub; 1080p60 preview.
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
WORK=${WORK:?set WORK}
cd "$WORK/seg"
ls seg_*.mp4 | sort -V | sed "s/^/file '/; s/$/'/" > list.txt
cat list.txt
ffmpeg -v error -y -f concat -safe 0 -i list.txt -i "$ROOT/inputs/reference-mv.mp4" \
  -map 0:v -map 1:a -c:v copy -c:a copy -movflags +faststart -shortest "$WORK/ashke-4k60-master.mp4"
M="$WORK/ashke-4k60-master.mp4"
ffprobe -v error -count_packets -show_entries stream=codec_name,width,height,r_frame_rate,nb_read_packets -show_entries format=duration,size -of default=nw=1 "$M"
# GitHub rejects files over 100 MB: ship the master as 95 MB parts + checksum
OUT="$ROOT/out/master"
mkdir -p "$OUT"; rm -f "$OUT"/ashke-4k60-master.mp4.part*
split -b 95m -d -a 2 "$M" "$OUT/ashke-4k60-master.mp4.part"
(cd "$WORK" && sha256sum ashke-4k60-master.mp4) > "$OUT/SHA256SUMS"
parts=$(cd "$OUT" && ls ashke-4k60-master.mp4.part* | sort)
printf '#!/bin/sh\n# macOS / Linux: rebuild the master from its parts\ncd "$(dirname "$0")" && cat %s > ashke-4k60-master.mp4 && echo done\n' "$(echo $parts)" > "$OUT/join.sh"
chmod +x "$OUT/join.sh"
printf '@echo off\r\nrem Windows: double-click to rebuild the master from its parts\r\ncd /d "%%~dp0"\r\ncopy /b %s ashke-4k60-master.mp4\r\n' "$(echo $parts | sed 's/ / + /g')" > "$OUT/join.bat"
# full-film preview that fits in one file
ffmpeg -v error -y -i "$M" -vf "scale=1920:1080:flags=lanczos" -c:v libx265 -preset medium -b:v 3000k -maxrate 4500k -bufsize 6000k \
  -tag:v hvc1 -x265-params log-level=error -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 160k -movflags +faststart \
  "$ROOT/out/ashke-1080p60-preview.mp4"
ls -la "$OUT" "$ROOT/out/ashke-1080p60-preview.mp4"
