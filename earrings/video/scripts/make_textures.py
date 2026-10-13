"""Procedural textures for the Earrings film: satin bedsheet (4K) and film-grain tiles. Deterministic (seeded)."""
import sys, numpy as np
from PIL import Image
out = sys.argv[1]
rng = np.random.default_rng(7)
W, H = 2160, 3840
ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
u, v = xs / W, ys / H

def smooth_noise(scale, seed):
    r = np.random.default_rng(seed)
    g = r.standard_normal((int(H / scale) + 3, int(W / scale) + 3)).astype(np.float32)
    im = Image.fromarray(g, mode='F').resize((W, H), Image.BICUBIC)
    return np.asarray(im)

h = np.zeros((H, W), np.float32)
X, Y = xs / W, ys / W  # same units on both axes (Y spans 0..1.78)
# (x0, y0, angle deg, width, amplitude, wobble freq) -- broad soft folds + a few tighter creases
folds = [
    (0.10, 0.20, 62, 0.090, 1.0, 2.1), (0.55, 0.30, 70, 0.140, 1.3, 1.7), (0.95, 0.65, 58, 0.110, 0.9, 2.4),
    (0.20, 1.05, 66, 0.160, 1.2, 1.5), (0.80, 1.35, 74, 0.100, 0.8, 2.0), (0.35, 1.60, 60, 0.130, 1.0, 1.8),
    (0.62, 0.90, 64, 0.030, 0.35, 3.0), (0.30, 0.55, 68, 0.025, 0.30, 3.3), (0.75, 1.55, 61, 0.028, 0.30, 2.7),
]
for i, (x0, y0, ang, wid, amp, wf) in enumerate(folds):
    a = np.deg2rad(ang)
    along = (X - x0) * np.cos(a) + (Y - y0) * np.sin(a)
    d = -(X - x0) * np.sin(a) + (Y - y0) * np.cos(a)
    d = d + 0.035 * np.sin(along * wf * 3.0 + i * 1.3)
    ridge = np.where(d > 0, np.exp(-(d / wid) ** 2), np.exp(-(d / (wid * 2.2)) ** 2))
    fade = np.exp(-(along / 0.75) ** 2)
    h += amp * ridge * fade
h += 0.35 * smooth_noise(700, 3)
gy, gx = np.gradient(h * 140.0)
nx, ny, nz = -gx, -gy, np.ones_like(h) * 1.0
n = np.sqrt(nx * nx + ny * ny + nz * nz); nx, ny, nz = nx / n, ny / n, nz / n
L = np.array([-0.45, -0.55, 0.70]); L /= np.linalg.norm(L)
lam = np.clip(nx * L[0] + ny * L[1] + nz * L[2], 0, 1)
# satin sheen: specular-ish band
Hh = L + np.array([0, 0, 1.0]); Hh /= np.linalg.norm(Hh)
spec = np.clip(nx * Hh[0] + ny * Hh[1] + nz * Hh[2], 0, 1) ** 18
# soft window light falloff from top-left
fall = np.clip(1.15 - 0.75 * np.sqrt((u - 0.15) ** 2 + (v * 0.6 - 0.05) ** 2), 0.25, 1.0)
base = np.array([238, 228, 214], np.float32) / 255  # ivory
shadow = np.array([150, 120, 118], np.float32) / 255  # warm rose shadow
shade = (0.35 + 0.75 * lam) * fall
col = shadow[None, None, :] * (1 - shade[..., None]) + base[None, None, :] * shade[..., None]
col += 0.10 * spec[..., None]
col += 0.012 * rng.standard_normal((H, W, 1)).astype(np.float32)  # weave noise
img = (np.clip(col, 0, 1) * 255).astype(np.uint8)
Image.fromarray(img).save(f'{out}/sheet.jpg', quality=90)
print('sheet ok')

# film grain tiles (gray, centered on 128 for overlay blending)
for k in range(8):
    g = rng.standard_normal((1024, 1024)).astype(np.float32)
    g = np.asarray(Image.fromarray(g, mode='F').resize((1024, 1024), Image.BILINEAR))
    a = np.clip(128 + g * 38, 0, 255).astype(np.uint8)
    Image.fromarray(a, mode='L').save(f'{out}/grain{k}.png', optimize=True)
print('grain ok')
