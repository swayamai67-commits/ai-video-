"""Pre-bake sticker cutouts (white outline + hard drop shadow) for the viral cut.

CSS drop-shadow chains are rasterised in software by headless Chrome and made
sticker frames take seconds each, so the outline is baked here instead.
Writes video/public/viral/stickers/<clip>_<frame>.webp
"""
import pathlib
import numpy as np, cv2
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[1]
CUT = ROOT / "video/public/viral/cut"
OUT = ROOT / "video/public/viral/stickers"
OUT.mkdir(parents=True, exist_ok=True)

# (clip, frame) pairs used by the Wardrobe, Pind and Outro scenes
WARDROBE = [('hook', 20), ('walk', 100), ('fire', 70), ('tea', 10), ('study', 15), ('lib2', 30), ('lib', 30), ('polo2', 15),
            ('point', 60), ('estate2', 70), ('dinner2', 120), ('shoot2', 30), ('mercy', 30), ('tea2', 20), ('dinner2', 200), ('lib3', 30)]
NEEDED = set(WARDROBE) | {('tea2', f) for f in range(0, 35)} | {('hook', 30)}
STROKE, SHADOW = 7, (7, 11)  # in half-size pixels


def bake(clip, f):
    im = np.array(Image.open(CUT / clip / f"{f:04d}.webp").convert("RGBA"))
    # stickers are shown at about half the plate size: bake at half resolution
    im = cv2.resize(im, (im.shape[1] // 2, im.shape[0] // 2), interpolation=cv2.INTER_AREA)
    pad = STROKE + max(SHADOW) + 4
    im = cv2.copyMakeBorder(im, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=(0, 0, 0, 0))
    a = im[:, :, 3].astype(np.float32) / 255
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * STROKE + 1, 2 * STROKE + 1))
    dil = cv2.GaussianBlur(cv2.dilate((a > 0.4).astype(np.uint8) * 255, k), (3, 3), 0).astype(np.float32) / 255
    H, W = a.shape
    sh = cv2.warpAffine(dil, np.float32([[1, 0, SHADOW[0]], [0, 1, SHADOW[1]]]), (W, H)) * 0.35
    # composite (premultiplied): shadow, then white outline, then the person
    rgb = np.zeros((H, W, 3), np.float32)
    al = sh.copy()
    rgb = rgb * (1 - dil[..., None]) + 255 * dil[..., None]
    al = dil + al * (1 - dil)
    rgb = rgb * (1 - a[..., None]) + im[:, :, :3].astype(np.float32) * a[..., None]
    al = a + al * (1 - a)
    straight = np.clip(rgb / np.maximum(al[..., None], 1e-6), 0, 255)
    res = np.dstack([straight, np.clip(al * 255, 0, 255)]).astype(np.uint8)
    Image.fromarray(res, "RGBA").save(OUT / f"{clip}_{f:04d}.webp", quality=88)


for clip, f in sorted(NEEDED):
    if (CUT / clip / f"{f:04d}.webp").exists():
        bake(clip, f)
print(len(list(OUT.glob("*.webp"))), "stickers")
