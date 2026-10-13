# ASHKE · 4K60 master

`ashke-4k60-master.mp4`: 3840×2160, 60 fps, H.264 High (BT.709), original MV audio (AAC), 3:38.

GitHub refuses single files over 100 MB, so the master is stored here in 95 MB parts. Download this folder and rebuild the single file:

- **Windows:** double-click `join.bat`
- **macOS / Linux:** run `sh join.sh` in this folder (or `cat ashke-4k60-master.mp4.part* > ashke-4k60-master.mp4`)

Check it: `shasum -a 256 -c SHA256SUMS` (Linux: `sha256sum -c SHA256SUMS`).

To watch quickly without joining, use `../ashke-1080p60-preview.mp4` (the whole film, 1080p60 HEVC, under 100 MB).
