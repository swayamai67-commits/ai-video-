"""Cover plates: crop the art out of the letterboxed frame, AI-upscale it ×16, cut Tyler out.

inputs/cover-frame.png (300×169, art at x 65..234)
  → crop 170×169 → pad to square
  → Real-ESRGAN x4plus ×2 passes (CPU, via spandrel) → 2720 px
  → mild unsharp + grain-preserving resize to 2560 px
  → rembg (u2net_human_seg) → tyler.png (RGBA cut-out) + alpha matte
  (an inpainted clean plate was tried and dropped: a 170 px source leaves a visible smear)

Outputs to video/public/cover/: cover.png, tyler.png (intermediates in pipeline/cache/)
Run with the venv that has torch/spandrel/rembg:  python -I pipeline/build_plates.py
"""
from pathlib import Path
import sys

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "video" / "public" / "cover"
OUT.mkdir(parents=True, exist_ok=True)
MODELS = ROOT / "pipeline" / "models"
CACHE = ROOT / "pipeline" / "cache"


def find_art(im: Image.Image):
    a = np.asarray(im.convert("RGB")).astype(int)
    edge = a[a.shape[0] // 2, 2]
    d = np.abs(a - edge).sum(-1)
    cols = np.where(d.max(0) > 40)[0]
    return int(cols[0]), int(cols[-1]) + 1


def esrgan(img: Image.Image, model_path: Path, tile=256) -> Image.Image:
    import torch
    from spandrel import ModelLoader

    model = ModelLoader().load_from_file(str(model_path)).eval()
    torch.set_num_threads(4)
    x = torch.from_numpy(np.asarray(img.convert("RGB"), np.float32) / 255).permute(2, 0, 1)[None]
    s = model.scale
    _, _, h, w = x.shape
    out = torch.zeros(1, 3, h * s, w * s)
    pad = 16
    with torch.inference_mode():
        for y0 in range(0, h, tile):
            for x0 in range(0, w, tile):
                y1, x1 = min(y0 + tile, h), min(x0 + tile, w)
                ya, xa = max(y0 - pad, 0), max(x0 - pad, 0)
                yb, xb = min(y1 + pad, h), min(x1 + pad, w)
                o = model(x[:, :, ya:yb, xa:xb])
                out[:, :, y0 * s:y1 * s, x0 * s:x1 * s] = o[
                    :, :, (y0 - ya) * s:(y0 - ya + y1 - y0) * s, (x0 - xa) * s:(x0 - xa + x1 - x0) * s
                ]
                print(f"  tile {y0},{x0} / {h}x{w}", flush=True)
    arr = (out[0].permute(1, 2, 0).clamp(0, 1).numpy() * 255).round().astype(np.uint8)
    return Image.fromarray(arr)


def main():
    frame = Image.open(ROOT / "inputs" / "cover-frame.png").convert("RGB")
    x0, x1 = find_art(frame)
    art = frame.crop((x0, 0, x1, frame.height))
    side = max(art.size)
    art = art.resize((side, side), Image.LANCZOS)  # 170×169 → 170×170 (1px stretch)
    CACHE.mkdir(exist_ok=True)
    art.save(CACHE / "cover-src.png")
    print("art crop", x0, x1, art.size)

    up = CACHE / "cover-x4.png"
    if not up.exists():
        esrgan(art, MODELS / "RealESRGAN_x4plus.pth").save(up)
    up16 = CACHE / "cover-x16.png"
    if not up16.exists():
        esrgan(Image.open(up), MODELS / "RealESRGAN_x4plus.pth").save(up16)
    big = Image.open(up16).convert("RGB").resize((2560, 2560), Image.LANCZOS)
    big = big.filter(ImageFilter.UnsharpMask(radius=2.2, percent=40, threshold=2))
    big.save(OUT / "cover.png", optimize=True)
    print("cover.png", big.size)

    from rembg import new_session, remove

    sess = new_session("u2net_human_seg")
    cut = remove(big, session=sess, post_process_mask=True)
    alpha = np.asarray(cut)[..., 3]
    # keep only the main blob (Tyler); bees/flowers sometimes leak in
    import cv2

    n, lab, stats, _ = cv2.connectedComponentsWithStats((alpha > 128).astype(np.uint8))
    if n > 1:
        keep = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        mask = (lab == keep).astype(np.uint8)
        mask = cv2.dilate(mask, np.ones((9, 9), np.uint8))
        alpha = (alpha * mask).astype(np.uint8)
    rgba = np.dstack([np.asarray(big), alpha])
    Image.fromarray(rgba, "RGBA").save(OUT / "tyler.png", optimize=True)
    ys, xs = np.where(alpha > 128)
    print("tyler bbox (frac)", xs.min() / 2560, ys.min() / 2560, xs.max() / 2560, ys.max() / 2560)

    print("done")


if __name__ == "__main__":
    sys.exit(main())
