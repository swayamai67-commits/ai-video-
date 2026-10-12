"""People plates for the viral 9:16 cut.

Footage source: out/ashke-full-16x9-web.mp4 (the committed 16:9 render, whose
picture is the official MV in song time). That render has its own lyrics
burned into the lower-left of the picture and a few hero overlays, so every
clip below is a crop window chosen to stay clear of them (checked with
`--sheet`). If the clean MV is supplied later, only this file changes.

Each clip -> video/public/viral/plates/<id>/NNNN.jpg (25 fps, source time t0..t1)
Clips with cut=True also get person cutouts (rembg u2net_human_seg) ->
video/public/viral/cut/<id>/NNNN.webp (RGBA) and a per-frame subject box in
video/src/viral/data/boxes.json, which drives the tracking HUD.

usage: python alignment/viral_plates.py [--sheet] [--only id,id] [--no-cut]
"""
import json, pathlib, subprocess, sys, shutil

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "out/ashke-full-16x9-web.mp4"
PUB = ROOT / "video/public/viral"
DATA = ROOT / "video/src/viral/data"
FPS = 25

# id: (t0, t1, x, y, w, h, out_w, out_h, cut)
#   crop is in 1920x1080 source pixels; picture area is y 136..943
#   V = vertical full-bleed window (454x807 -> 1080x1920)
#   S = 16:9 strip window (-> 1080x608)
def V(x, y=136, h=807):
    w = round(h * 9 / 16)
    return (x, y, w, h, 1080, 1920)
def S(x, y=136, w=1200):
    return (x, y, w, round(w * 9 / 16), 1080, 608)

CLIPS = {
    # intro / arrival (no lyrics burned in before 38 s)
    "estate":     (5.0, 8.3, *S(700, 136, 1220), False),
    "arrive":     (15.2, 21.8, *V(900), True),
    "host":       (22.6, 24.15, *V(760), False),
    "mercy":      (46.0, 48.2, *V(560), True),
    # hook 1 (lip-sync kept)
    "hook":       (48.3, 51.75, *V(740), True),
    "table":      (51.8, 55.3, *S(700), False),
    "gunwood":    (55.4, 58.9, *V(900), False),
    "gunlow":     (59.0, 62.5, *V(860), True),
    # verse 1 (shoot)
    "shoot1":     (65.2, 69.7, *V(1000), True),
    "shoot2":     (69.75, 73.3, *V(760), True),
    "shoot3":     (73.3, 76.9, *V(980), True),
    "polo":       (76.9, 78.2, *S(700), False),
    "tea":        (80.45, 83.9, *V(1060), True),
    "tea2":       (89.0, 90.4, *V(1100), True),
    "walk":       (90.5, 97.0, *V(740), True),
    "fire":       (97.0, 101.0, *V(1000), True),
    "woman":      (138.95, 139.6, *V(860), True),
    "woman2":     (137.0, 137.6, *V(1000), False),
    # family portrait (sync), study (sync)
    "portrait":   (106.65, 118.9, *S(560, 230, 860), False),
    "study":      (120.85, 127.9, *V(700), True),
    "study2":     (127.95, 133.9, *V(760), True),
    # boat (sync)
    "boat2":      (136.0, 147.0, *V(760), True),
    "jewels":     (148.3, 149.5, *S(600), False),
    "lib":        (149.85, 153.9, *V(980), True),
    "watch":      (155.0, 157.0, *S(620), False),
    "lib2":       (157.5, 159.9, *V(1000), True),
    "loupe":      (159.95, 160.95, *V(1100), False),
    "lib3":       (163.0, 164.95, *V(940), True),
    "polo2":      (165.0, 166.9, *V(1050), True),
    "estate2":    (167.0, 170.9, *V(1080), True),
    "point":      (174.0, 178.3, *V(1060), True),
    "dinner":     (178.8, 181.9, *S(680), False),
    "dinner2":    (181.95, 192.5, *V(820), True),
}

def run(cmd):
    subprocess.run(cmd, check=True)

def extract(cid, t0, t1, x, y, w, h, ow, oh, out):
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    vf = f"crop={w}:{h}:{x}:{y},scale={ow}:{oh}:flags=lanczos,unsharp=5:5:0.6"
    run(["ffmpeg", "-v", "error", "-ss", f"{t0:.3f}", "-i", str(SRC), "-t", f"{t1 - t0:.3f}",
         "-vf", vf, "-r", str(FPS), "-q:v", "3", "-start_number", "0", str(out / "%04d.jpg")])

def sheet(ids):
    tmp = ROOT / "previews/sheet"
    tmp.mkdir(parents=True, exist_ok=True)
    paths = []
    for cid in ids:
        t0, t1, x, y, w, h, ow, oh, cut = CLIPS[cid]
        for k, t in enumerate((t0 + 0.05, (t0 + t1) / 2, t1 - 0.1)):
            p = tmp / f"{cid}_{k}.jpg"
            vf = (f"crop={w}:{h}:{x}:{y},scale=-2:300,"
                  f"drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:"
                  f"text='{cid} {t:.1f}':x=4:y=4:fontsize=14:fontcolor=yellow:box=1:boxcolor=black")
            run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", str(SRC), "-frames:v", "1", "-vf", vf, str(p)])
            paths.append(p)
    print("\n".join(map(str, paths)))

def main():
    args = sys.argv[1:]
    ids = list(CLIPS)
    if "--only" in args:
        ids = args[args.index("--only") + 1].split(",")
    if "--sheet" in args:
        return sheet(ids)
    DATA.mkdir(parents=True, exist_ok=True)
    meta_p = DATA / "plates.json"
    meta = json.loads(meta_p.read_text()) if meta_p.exists() else {}
    for cid in ids:
        t0, t1, x, y, w, h, ow, oh, cut = CLIPS[cid]
        out = PUB / "plates" / cid
        extract(cid, t0, t1, x, y, w, h, ow, oh, out)
        n = len(list(out.glob("*.jpg")))
        meta[cid] = {"t0": t0, "t1": t1, "n": n, "w": ow, "h": oh, "cut": cut}
        print(cid, n, "frames", flush=True)
    meta_p.write_text(json.dumps(meta, indent=1))
    if "--no-cut" not in args:
        cut_ids = [c for c in ids if CLIPS[c][-1]]
        subprocess.run([sys.executable, "-I", str(ROOT / "alignment/viral_cutouts.py"), *cut_ids], check=True)

if __name__ == "__main__":
    main()
