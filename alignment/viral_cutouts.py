"""Person cutouts + tracking data for the viral cut (run by viral_plates.py).

For every frame of the given plate clips:
  * rembg (u2net_human_seg) mask -> RGBA WebP in video/public/viral/cut/<id>/
  * subject box and head box from the mask (normalised 0..1)
For every plate clip (cut or not): Lucas-Kanade tracked feature points with
stable ids -> drives the "blob tracking" HUD.
All written to video/src/viral/data/track.json.
"""
import json, pathlib, sys
import numpy as np, cv2
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[1]
PUB = ROOT / "video/public/viral"
DATA = ROOT / "video/src/viral/data"
meta = json.loads((DATA / "plates.json").read_text())
track_p = DATA / "track.json"
track = json.loads(track_p.read_text()) if track_p.exists() else {}

ids = sys.argv[1:]
session = None

def boxes_from_mask(m):
    ys, xs = np.nonzero(m > 128)
    if len(xs) < 50:
        return None, None
    H, W = m.shape
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    subj = [x0 / W, y0 / H, (x1 - x0) / W, (y1 - y0) / H]
    band = y0 + max(8, int((y1 - y0) * 0.16))
    sel = ys < band
    hx = xs[sel]
    if len(hx) < 10:
        return subj, None
    lo, hi = np.percentile(hx, 4), np.percentile(hx, 96)
    hw = hi - lo
    head = [lo / W, y0 / H, hw / W, min(hw * 1.25, y1 - y0) / H]
    return subj, head

def lk_points(frames):
    """Track up to 12 corners with stable ids; re-seed when they drop."""
    out, prev, pts, pid, nxt = [], None, None, [], 0
    for f in frames:
        g = cv2.cvtColor(cv2.resize(f, (f.shape[1] // 2, f.shape[0] // 2)), cv2.COLOR_BGR2GRAY)
        if prev is not None and pts is not None and len(pts):
            new, st, _ = cv2.calcOpticalFlowPyrLK(prev, g, pts, None, winSize=(21, 21), maxLevel=3)
            keep = st.reshape(-1) == 1
            pts, pid = new[keep], [p for p, k in zip(pid, keep) if k]
        if pts is None or len(pts) < 7:
            c = cv2.goodFeaturesToTrack(g, maxCorners=12, qualityLevel=0.04, minDistance=g.shape[1] // 7)
            if c is not None:
                pts = c.astype(np.float32)
                pid = list(range(nxt, nxt + len(pts)))
                nxt += len(pts)
        h, w = g.shape
        out.append([[int(i), round(float(p[0][0]) / w, 4), round(float(p[0][1]) / h, 4)] for i, p in zip(pid, pts)] if pts is not None else [])
        prev = g
    return out

for cid in ids or list(meta):
    m = meta[cid]
    files = sorted((PUB / "plates" / cid).glob("*.jpg"))
    frames = [cv2.imread(str(f)) for f in files]
    entry = {"pts": lk_points(frames)}
    if m["cut"]:
        if session is None:
            from rembg import new_session, remove
            session = new_session("u2net_human_seg")
        from rembg import remove
        out = PUB / "cut" / cid
        out.mkdir(parents=True, exist_ok=True)
        subj, head = [], []
        for k, f in enumerate(frames):
            small = cv2.resize(f, (f.shape[1] // 2, f.shape[0] // 2))
            mk = remove(Image.fromarray(cv2.cvtColor(small, cv2.COLOR_BGR2RGB)), session=session, only_mask=True)
            mk = cv2.resize(np.array(mk), (f.shape[1], f.shape[0]), interpolation=cv2.INTER_LINEAR)
            mk = cv2.GaussianBlur(mk, (3, 3), 0)
            rgba = np.dstack([cv2.cvtColor(f, cv2.COLOR_BGR2RGB), mk])
            Image.fromarray(rgba, "RGBA").save(out / f"{k:04d}.webp", quality=82, method=4)
            s, h = boxes_from_mask(mk)
            subj.append([round(v, 4) for v in s] if s else None)
            head.append([round(v, 4) for v in h] if h else None)
        entry["subj"], entry["head"] = subj, head
    track[cid] = entry
    track_p.write_text(json.dumps(track, separators=(",", ":")))
    print("tracked", cid, len(frames), flush=True)
