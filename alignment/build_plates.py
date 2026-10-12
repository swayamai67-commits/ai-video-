"""Edit decision list -> graded footage plates for Remotion.

All times are SONG times (seconds in inputs/song.mp3). Each EDL entry maps a
song range to a source range in the official music video. Where the MV is
already in sync with the song (song 48.3-102 and 106.6-217.7) we keep its
picture in sync so lip-sync survives; elsewhere shots are chosen by meaning.

Outputs (25 fps, H.264):
  video/public/plates/full.mp4  1920x1080, covers song 0 -> end
  video/public/plates/reel.mp4  1080x1920, covers song 47.15 -> 92.31
  data/edl.json                 the decision list (read by Remotion for cut times)
"""
import json, pathlib, subprocess

ROOT = pathlib.Path(__file__).resolve().parents[1]
MV = ROOT / "inputs/reference-mv.mp4"
REEL = ROOT / "inputs/reference-reel.mp4"
OUT = ROOT / "video/public/plates"
OUT.mkdir(parents=True, exist_ok=True)
SONG_END = 217.81

# (song_start, song_end, src_start, speed, tag, flags)
# src "black" = no footage (design-only moment). zoom = crop away burnt-in MV subtitles.
EDL = [
    (0.00, 4.60, "black", 1, "title", ""),
    (4.60, 8.40, 7.40, 1, "estate-wide", ""),
    (8.40, 14.10, 11.20, 1, "butler-door", ""),
    (14.10, 17.80, 16.90, 1, "arrival", "zoom"),
    (17.80, 20.20, 20.60, 1, "arrival-2", "zoom"),
    (20.20, 22.50, 23.00, 1, "arrival-3", "zoom"),
    (22.50, 24.20, 25.30, 1, "host-smile", "zoom"),
    (24.20, 31.00, "black", 1, "invitation", ""),
    (31.00, 38.20, 210.60, 0.611, "title-estate", ""),
    (38.20, 41.00, 85.40, 1, "butler-study", "zoom"),
    (41.00, 43.90, 89.70, 1, "reading", "zoom"),
    (43.90, 45.70, 208.80, 1, "boat-wide", ""),
    (45.70, 46.60, 95.30, 1, "mercy-close", "zoom"),
    (46.60, 48.28, 97.60, 1, "mercy-close-2", "zoom"),
    (48.28, 102.00, 28.36, 1, "sync-A", ""),          # MV in sync: mv = song - 19.92
    (102.00, 103.40, 139.30, 0.5, "letter-1", ""),
    (103.40, 105.00, 143.20, 0.5, "letter-2", ""),
    (105.00, 106.60, 148.20, 0.4375, "letter-3", ""),
    (106.60, 217.66, 107.00, 1, "sync-B", ""),        # MV in sync: mv = song + 0.40
    (217.66, SONG_END, "black", 1, "end", ""),
]

GRADE = (
    "eq=contrast=1.07:saturation=0.9:gamma=0.97,"
    "colorbalance=rs=0.035:bs=-0.035:rm=0.015:bm=-0.02:rh=0.02:bh=-0.01,"
    "vignette=angle=PI/4.6"
)  # film grain is added in Remotion (tiled overlay) to keep plates small


ENC = ["-c:v", "libx264", "-preset", "fast", "-crf", "18", "-g", "25", "-pix_fmt", "yuv420p", "-r", "25"]


def encode_segment(i, s0, s1, src, speed, flags, W, H, out):
    dur = s1 - s0
    if src == "black":
        cmd = ["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"color=c=0x0b0a09:s={W}x{H}:r=25:d={dur:.3f}"]
        vf = "format=yuv420p,setsar=1"
    else:
        cmd = ["ffmpeg", "-v", "error", "-y", "-ss", f"{src:.3f}", "-t", f"{dur * speed + 0.1:.3f}", "-i", str(MV)]
        vf = "setpts=PTS-STARTPTS"
        if speed != 1:
            vf += f",setpts=PTS/{speed},minterpolate=fps=25:mi_mode=blend"
        if "zoom" in flags:
            vf += ",crop=iw/1.16:ih/1.16:(iw-iw/1.16)/2:0"
        vf += f",scale={W}:{H}:flags=lanczos,fps=25,{GRADE},format=yuv420p,setsar=1"
    nframes = round(s1 * 25) - round(s0 * 25)  # frame-exact on the song grid
    subprocess.run(cmd + ["-an", "-vf", vf, "-frames:v", str(nframes)] + ENC + [str(out)], check=True)


def build_full():
    W, H = 1920, 1080
    tmp = OUT / "_seg"
    tmp.mkdir(exist_ok=True)
    files = []
    for i, (s0, s1, src, speed, tag, flags) in enumerate(EDL):
        f = tmp / f"{i:02d}-{tag}.mp4"
        encode_segment(i, s0, s1, src, speed, flags, W, H, f)
        files.append(f)
        print("segment", i, tag, flush=True)
    lst = tmp / "list.txt"
    lst.write_text("".join(f"file '{f.name}'\n" for f in files))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy",
                    str(OUT / "full.mp4")], check=True)
    for f in files + [lst]:
        f.unlink()
    tmp.rmdir()


def build_reel():
    # reference reel is already in sync: reel t = song t - 47.15
    vf = f"scale=1080:1920:flags=lanczos,fps=25,{GRADE},format=yuv420p,setsar=1"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(REEL), "-an", "-vf", vf,
                    *ENC, str(OUT / "reel.mp4")], check=True)


if __name__ == "__main__":
    (ROOT / "data/edl.json").write_text(json.dumps(
        [{"start": a, "end": b, "src": c, "speed": d, "tag": t, "flags": f} for a, b, c, d, t, f in EDL], indent=1))
    build_reel()
    build_full()
    print("plates done")
