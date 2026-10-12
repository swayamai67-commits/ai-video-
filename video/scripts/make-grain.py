"""Film-grain tiles for the preview look (public/grain4k/g1..g8.png, 1920x1080, deterministic)."""
import os, numpy as np, cv2
out = os.path.join(os.path.dirname(__file__), "..", "public", "grain4k")
os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(7)
for k in range(8):
    n = cv2.GaussianBlur(rng.normal(0, 1, (1080, 1920)).astype(np.float32), (0, 0), 0.7)
    cv2.imwrite(f"{out}/g{k + 1}.png", (n / n.std() * 38 + 128).clip(0, 255).astype(np.uint8))
