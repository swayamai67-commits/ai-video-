"""Turn the RVM matte into tracking data + mask frames for the edit.

subjects.json: per 25 fps frame
  p: primary subject box [cx, cy, w, h] (0..1), smoothed within each shot, or null
  b: up to 6 person blobs [x0, y0, x1, y1] (0..1), largest first
public/matte/NNNNN.png: white RGBA with the matte as alpha (CSS mask source)
"""
import json, os, subprocess, sys
import numpy as np, cv2

MATTE, CUTS, OUT_JSON, MASK_DIR = sys.argv[1:5]
os.makedirs(MASK_DIR, exist_ok=True)
cuts = sorted({round(float(c) * 25) for c in open(CUTS).read().split()} | {0, 5450})
W, H = 1280, 720
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", MATTE, "-f", "rawvideo", "-pix_fmt", "gray", "-"], stdout=subprocess.PIPE)
blobs, n = [], 0
white = np.full((H, W, 3), 255, np.uint8)
while True:
    buf = dec.stdout.read(W * H)
    if len(buf) < W * H: break
    a = np.frombuffer(buf, np.uint8).reshape(H, W)
    cv2.imwrite(f"{MASK_DIR}/{n:05d}.png", np.dstack([white, a]), [cv2.IMWRITE_PNG_COMPRESSION, 6])
    small = cv2.resize(a, (320, 180), interpolation=cv2.INTER_AREA) > 128
    k, lab, st, _ = cv2.connectedComponentsWithStats(small.astype(np.uint8), 8)
    bs = sorted([st[j] for j in range(1, k) if st[j][4] > 0.004 * 320 * 180], key=lambda s: -s[4])[:6]
    blobs.append([[round(x / 320, 3), round(y / 180, 3), round((x + w) / 320, 3), round((y + h) / 180, 3)] for x, y, w, h, _ in bs])
    n += 1

def iou(p, q):
    ix = max(0, min(p[2], q[2]) - max(p[0], q[0])); iy = max(0, min(p[3], q[3]) - max(p[1], q[1]))
    u = (p[2] - p[0]) * (p[3] - p[1]) + (q[2] - q[0]) * (q[3] - q[1]) - ix * iy
    return ix * iy / u if u > 0 else 0

primary = [None] * n
for a, b in zip(cuts[:-1], cuts[1:]):
    prev = None
    for f in range(a, min(b, n)):
        cand = blobs[f]
        if not cand: prev = None; continue
        pick = max(cand, key=lambda q: iou(prev, q) * 2 + 0.2) if prev else cand[0]
        if prev and iou(prev, pick) < 0.15: pick = cand[0]
        primary[f] = pick; prev = pick
    # centred moving average inside the shot (no smoothing across cuts)
    raw = {f: primary[f] for f in range(a, min(b, n)) if primary[f]}
    for f in raw:
        primary[f] = list(np.mean([raw[g] for g in range(f - 4, f + 5) if g in raw], axis=0))
for f in range(n):
    if primary[f] is not None:
        x0, y0, x1, y1 = primary[f]
        primary[f] = [round((x0 + x1) / 2, 3), round((y0 + y1) / 2, 3), round(x1 - x0, 3), round(y1 - y0, 3)]
json.dump({"fps": 25, "p": primary, "b": blobs}, open(OUT_JSON, "w"), separators=(",", ":"))
print("frames", n)
