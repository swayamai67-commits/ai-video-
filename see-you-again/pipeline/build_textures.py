"""Procedural textures for the Remotion engine (deterministic, seeded).

- public/grain/g{1..6}.png : 512px tiling film-grain frames (alpha noise), cycled per frame
- public/tex/paper.jpg      : 3840x2160 warm kraft paper (fibres + blotches + vignette)
- public/tex/halftone.png   : 1024px tiling halftone dot screen (alpha)

Run: python3 pipeline/build_textures.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / "video" / "public"
rng = np.random.default_rng(1707)


def blur(a, r):
    im = Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(r)), dtype=np.float32) / 255


def grain():
    out = PUB / "grain"
    out.mkdir(parents=True, exist_ok=True)
    n = 512
    for i in range(1, 7):
        g = rng.normal(0.5, 0.18, (n, n)).astype(np.float32)
        g = 0.65 * g + 0.35 * blur(g, 0.8)
        lum = np.clip(g, 0, 1)
        # light and dark specks as signed alpha: encode light in RGB, strength in A
        a = np.abs(lum - 0.5) * 2
        rgb = np.where(lum[..., None] > 0.5, 255, 0).astype(np.uint8).repeat(3, 2)
        img = np.dstack([rgb, (np.clip(a, 0, 1) * 255).astype(np.uint8)])
        Image.fromarray(img, "RGBA").save(out / f"g{i}.png", optimize=True)


def paper():
    out = PUB / "tex"
    out.mkdir(parents=True, exist_ok=True)
    w, h = 3840, 2160
    base = np.array([196, 150, 98], np.float32) / 255  # kraft
    # low-frequency blotches
    low = rng.normal(0, 1, (h // 16, w // 16)).astype(np.float32)
    low = np.asarray(Image.fromarray(low).resize((w, h), Image.BICUBIC))
    low = (low - low.mean()) / (low.std() + 1e-6)
    # fibres: anisotropic streaks
    f = rng.normal(0, 1, (h, w // 8)).astype(np.float32)
    f = np.asarray(Image.fromarray(f).resize((w, h), Image.BILINEAR))
    fine = rng.normal(0, 1, (h, w)).astype(np.float32)
    fine = 0.6 * fine + 0.4 * (blur(np.clip(fine * 0.15 + 0.5, 0, 1), 1.2) - 0.5) / 0.15
    shade = 1 + 0.05 * low + 0.035 * f + 0.012 * fine
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    vig = 1 - 0.28 * np.clip(r - 0.35, 0, 1) ** 1.6
    img = base[None, None, :] * (shade * vig)[..., None]
    Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).save(out / "paper.jpg", quality=93)


def halftone():
    out = PUB / "tex"
    n, step = 1024, 16
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float32)
    # 45deg diamond lattice; period divides the tile so it wraps seamlessly
    du = ((xx + yy) % step) - step / 2
    dv = ((xx - yy) % step) - step / 2
    d = np.sqrt(du * du + dv * dv) / np.sqrt(2)
    a = np.clip((step * 0.32 - d) * 1.5, 0, 1)
    img = np.dstack([np.zeros((n, n, 3), np.uint8), (a * 255).astype(np.uint8)])
    Image.fromarray(img, "RGBA").save(out / "halftone.png", optimize=True)


if __name__ == "__main__":
    grain()
    paper()
    halftone()
    print("textures written to", PUB)
