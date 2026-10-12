"""Finisher: upscaled 25 fps plate + Remotion graphics layers -> 3840x2160 60 fps master.

Per 60 fps output frame:
  1. plate      motion-interpolated from the 25 fps Real-ESRGAN plate (DIS optical flow at
                960x540, warps applied at 4K, never across a cut; low-confidence frames fall
                back to the nearest real frame instead of smearing)
  2. behind     giant words (AshkeBehind PNGs), then the people cut back out on top of them
                with the RVM matte, warped with the same flow
  3. vignette, light leaks (screen)
  4. front      lyrics / HUD / moments (AshkeFront PNGs)
  5. camera     punch-ins and impact shake (same maths as video/src/edit/Camera.ts)
  6. flash (screen), film grain
Writes one x264 segment per output-frame range so several workers can run side by side.

usage: finish.py A B OUT.mp4   (output frames [A, B) at 60 fps)
Paths come from env: PLATE_DIR MATTE FRONT_DIR BEHIND_DIR FX CUTS
"""
import glob, json, math, os, re, subprocess, sys
import numpy as np
import cv2

cv2.setNumThreads(int(os.environ.get('CV_THREADS', '2')))
W, H = 3840, 2160
FW, FH = 960, 540  # flow resolution
SRC_FPS, OUT_FPS, NSRC, CHUNK = 25, 60, 5450, 250
A, B, OUT = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
PLATE_DIR = os.environ["PLATE_DIR"]
MATTE = os.environ["MATTE"]
FRONT_DIR = os.environ.get("FRONT_DIR", "")
BEHIND_DIR = os.environ.get("BEHIND_DIR", "")
FX = json.load(open(os.environ["FX"]))
CUT_FRAMES = {round(float(c) * SRC_FPS) for c in open(os.environ["CUTS"]).read().split()}
DESIGN = W / 1920.0


def frame_index(d):
    """Map output frame number -> PNG path for a Remotion --sequence directory."""
    out = {}
    for p in glob.glob(os.path.join(d, "*.png")) if d else []:
        m = re.search(r"(\d+)\.png$", p)
        if m:
            out[int(m.group(1))] = p
    return out


FRONT = frame_index(FRONT_DIR)
BEHIND = frame_index(BEHIND_DIR)


# ---------------------------------------------------------------- sources
class SeqReader:
    """Sequential reader over a frame-indexed source (decodes forward only, caches 2 frames)."""

    def __init__(self, open_at, shape):
        self.open_at, self.shape, self.proc, self.pos, self.cache = open_at, shape, None, -1, {}

    def get(self, i):
        if i in self.cache:
            return self.cache[i]
        if self.proc is None or i < self.pos + 1 or i > self.pos + 60:
            if self.proc:
                self.proc.kill()
            self.proc, self.pos = self.open_at(i), i - 1
        n = int(np.prod(self.shape))
        while self.pos < i:
            buf = self.proc.stdout.read(n)
            if len(buf) < n:
                raise RuntimeError(f"source ended at {self.pos + 1}")
            self.pos += 1
            fr = np.frombuffer(buf, np.uint8).reshape(self.shape)
            self.cache = {k: v for k, v in self.cache.items() if k >= self.pos - 1}
            self.cache[self.pos] = fr
        return self.cache[i]


def open_plate(i):
    """Decode the SR plate from source frame i onwards, crossing chunk files."""
    c = i // CHUNK
    files = [f"{PLATE_DIR}/sr_{k:03d}.mp4" for k in range(c, (NSRC + CHUNK - 1) // CHUNK)]
    lst = f"/tmp/finish_concat_{os.getpid()}.txt"
    open(lst, "w").write("".join(f"file '{f}'\n" for f in files))
    skip = i - c * CHUNK
    # the plate was written with the BT.601 matrix (see notes); undo exactly that
    return subprocess.Popen(["ffmpeg", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst,
        "-vf", f"select='gte(n\\,{skip})',scale=in_color_matrix=bt601:flags=bicubic",
        "-fps_mode", "passthrough", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE, bufsize=10**8)


MW, MH = 1280, 720  # matte stays at its native resolution for clean edges


def open_matte(i):
    return subprocess.Popen(["ffmpeg", "-v", "error", "-i", MATTE, "-vf", f"select='gte(n\\,{i})'",
        "-fps_mode", "passthrough", "-f", "rawvideo", "-pix_fmt", "gray", "-"], stdout=subprocess.PIPE)


plate = SeqReader(open_plate, (H, W, 3))
matte = SeqReader(open_matte, (MH, MW))

# ---------------------------------------------------------------- interpolation
dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
gx, gy = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
sgx, sgy = np.meshgrid(np.arange(FW, dtype=np.float32), np.arange(FH, dtype=np.float32))
mgx, mgy = np.meshgrid(np.arange(MW, dtype=np.float32), np.arange(MH, dtype=np.float32))
_flow_cache = {}


def flows(i):
    if i not in _flow_cache:
        a = cv2.cvtColor(cv2.resize(plate.get(i), (FW, FH), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY)
        b = cv2.cvtColor(cv2.resize(plate.get(i + 1), (FW, FH), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY)
        _flow_cache.clear()
        _flow_cache[i] = (dis.calc(a, b, None), dis.calc(b, a, None), a, b)
    return _flow_cache[i]


def warp_small(img, F):
    return cv2.remap(img, sgx + F[..., 0], sgy + F[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)


def interp(i, f, need_matte):
    """Frame between source i and i+1 at fraction f (Super-SloMo style intermediate flows)."""
    F01, F10, a, b = flows(i)
    Ft0 = -(1 - f) * f * F01 + f * f * F10
    Ft1 = (1 - f) * (1 - f) * F01 - f * (1 - f) * F10
    # confidence from how well the two warps agree (low-res)
    wa, wb = warp_small(a, Ft0), warp_small(b, Ft1)
    diff = cv2.GaussianBlur(cv2.absdiff(wa, wb).astype(np.float32), (0, 0), 2)
    conf = np.exp(-diff / 18.0)
    if conf.mean() < 0.55:  # whip pan / flash / heavy occlusion: hold the nearest real frame
        k = i if f < 0.5 else i + 1
        m = matte.get(k) if need_matte else None
        return plate.get(k), m
    sx = W / FW
    U0 = cv2.resize(Ft0, (W, H), interpolation=cv2.INTER_LINEAR) * sx
    U1 = cv2.resize(Ft1, (W, H), interpolation=cv2.INTER_LINEAR) * sx
    ux0, uy0 = cv2.split(U0); ux1, uy1 = cv2.split(U1)
    I0 = cv2.remap(plate.get(i), cv2.add(gx, ux0), cv2.add(gy, uy0), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    I1 = cv2.remap(plate.get(i + 1), cv2.add(gx, ux1), cv2.add(gy, uy1), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    # where the warps disagree, lean on the temporally nearer frame instead of ghosting
    near = (1.0 if f < 0.5 else 0.0)
    w0s = (conf * (1 - f) + (1 - conf) * near).astype(np.float32)
    w0 = cv2.resize(w0s, (W, H), interpolation=cv2.INTER_LINEAR)
    out = cv2.blendLinear(I0, I1, w0, cv2.subtract(1.0, w0))
    m = None
    if need_matte:
        k = MW / FW
        M0, M1 = cv2.resize(Ft0, (MW, MH)) * k, cv2.resize(Ft1, (MW, MH)) * k
        m0 = cv2.remap(matte.get(i), mgx + M0[..., 0], mgy + M0[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        m1 = cv2.remap(matte.get(i + 1), mgx + M1[..., 0], mgy + M1[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        ww = cv2.resize(w0s, (MW, MH))
        m = (m0.astype(np.float32) * ww + m1.astype(np.float32) * (1 - ww)).astype(np.uint8)
    return out, m


def plate_at(n, need_matte):
    u = n * SRC_FPS / OUT_FPS
    i = int(math.floor(u + 1e-9))
    f = u - i
    if f < 1e-6 or i + 1 >= NSRC or (i + 1) in CUT_FRAMES:
        return plate.get(i), (matte.get(i) if need_matte else None)
    return interp(i, f, need_matte)


# ---------------------------------------------------------------- look
def noise1(x, seed=0):
    def rnd(s):
        v = math.sin(s * 12.9898 + 78.233) * 43758.5453
        return v - math.floor(v)
    i = math.floor(x); f = x - i; u = f * f * (3 - 2 * f)
    a, b = rnd(i + seed * 101.7) * 2 - 1, rnd(i + 1 + seed * 101.7) * 2 - 1
    return a + (b - a) * u


def since(lst, t):
    best = None
    for v in lst:
        if v <= t: best = v
        else: break
    return math.inf if best is None else t - best


DOWNBEATS = json.load(open(os.environ["BEATS"]))["downbeats"] if os.environ.get("BEATS") else []


def camera(t):
    """Port of camera() in video/src/edit/Camera.ts."""
    s = sx = sy = rot = 0.0
    for h in FX["hits"]:
        if t < h["t"] or t > h["t"] + 1.5: continue
        tau = h.get("tau", 0.14)
        k = math.exp(-(t - h["t"]) / tau)
        s += h.get("punch", 0) * k
        sh = h.get("shake", 0) * math.exp(-(t - h["t"]) / (tau * 1.4))
        sx += sh * noise1(t * 38, 1) * 22
        sy += sh * noise1(t * 41, 2) * 16
        rot += sh * noise1(t * 29, 3) * 0.7
    for a, b in FX["hooks"]:
        if a <= t < b:
            d = since(DOWNBEATS, t)
            if d < 0.5: s += 0.035 * math.exp(-d / 0.11)
    cover = 1 + (2 * max(abs(sx), abs(sy) * 1.78) + abs(rot) * 30) / 1920
    return (1 + s) * cover, sx, sy, rot


def vignette_map():
    # CSS: radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgba(0,0,0,.42) 100%)
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    r = np.sqrt(((x - W / 2) / (0.75 * W)) ** 2 + ((y - H / 2) / (0.70 * H)) ** 2)
    a = np.clip((r - 0.55) / 0.45, 0, 1) * 0.42
    return np.repeat(((1 - a) * 255 + 0.5).astype(np.uint8)[..., None], 3, axis=2)


VIG = vignette_map()
MATTE_LUT = np.clip((np.arange(256) - 70) * 255.0 / 120, 0, 255).astype(np.uint8)
rng = np.random.default_rng(7)
GRAIN = []
for k in range(8):
    g = cv2.GaussianBlur(rng.normal(0, 1, (H // 2, W // 2)).astype(np.float32), (0, 0), 0.7)
    g = cv2.resize(g / g.std() * 4.2, (W, H), interpolation=cv2.INTER_NEAREST)  # ~= CSS overlay @ 0.11
    pos = np.clip(g, 0, 255).astype(np.uint8); neg = np.clip(-g, 0, 255).astype(np.uint8)
    GRAIN.append((cv2.merge([pos] * 3), cv2.merge([neg] * 3)))


def leak_layer(t):
    tot = None
    for l in FX["leaks"]:
        if not (l["a"] <= t <= l["b"]): continue
        p = (t - l["a"]) / (l["b"] - l["a"])
        env = math.sin(math.pi * p)
        x = (-10 + 80 * p) if l.get("from", "left") == "left" else (110 - 80 * p)
        c1 = (255, 170, 80) if l.get("hue", "warm") == "warm" else (255, 60, 40)
        c2 = (255, 90, 40) if l.get("hue", "warm") == "warm" else (200, 20, 30)
        wob = noise1(t * 1.3, 4) * 6
        w, h = 480, 270
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        def grad(cx, cy, rx, ry, stops):
            r = np.sqrt(((xx - cx * w) / (rx * w)) ** 2 + ((yy - cy * h) / (ry * h)) ** 2)
            col = np.zeros((h, w, 4), np.float32)
            for (p0, c0), (p1, cc) in zip(stops[:-1], stops[1:]):
                m = (r >= p0) & (r < p1); q = ((r - p0) / (p1 - p0))[m][:, None]
                col[m] = np.array(c0) * (1 - q) + np.array(cc) * q
            return col
        g1 = grad((x + wob) / 100, 0.45, 0.38, 0.70, [(0, (*c1, 0.95)), (0.45, (*c2, 0.35)), (0.75, (0, 0, 0, 0)), (9, (0, 0, 0, 0))])
        g2 = grad((x + 18) / 100, 0.70, 0.22, 0.40, [(0, (255, 230, 190, 0.6)), (0.70, (0, 0, 0, 0)), (9, (0, 0, 0, 0))])
        # g1 is painted over g2 (CSS lists the top layer first); then the whole layer is screen-blended at opacity
        a = g1[..., 3:] + g2[..., 3:] * (1 - g1[..., 3:])
        rgb = (g1[..., :3] * g1[..., 3:] + g2[..., :3] * g2[..., 3:] * (1 - g1[..., 3:]))
        lay = rgb * min(1, env * l.get("peak", 0.55))  # premultiplied: screen with transparent = no-op
        tot = lay if tot is None else 255 - (255 - tot) * (255 - lay) / 255
    if tot is None: return None
    return cv2.resize(np.clip(tot, 0, 255).astype(np.uint8)[..., ::-1], (W, H), interpolation=cv2.INTER_CUBIC)


def screen(img, layer):
    return cv2.bitwise_not(cv2.multiply(cv2.bitwise_not(img), cv2.bitwise_not(layer), scale=1 / 255.0))


def over(base, rgba, tile=120):
    """Straight-alpha RGBA over BGR, only on tiles that contain any alpha."""
    a = rgba[..., 3]
    small = cv2.resize(a, (W // tile, H // tile), interpolation=cv2.INTER_AREA)
    ys, xs = np.nonzero(cv2.dilate((small > 0).astype(np.uint8), np.ones((3, 3), np.uint8)))
    for ty, tx in zip(ys, xs):
        y0, x0 = ty * tile, tx * tile
        al = a[y0:y0 + tile, x0:x0 + tile].astype(np.float32)[..., None] / 255.0
        if not al.any(): continue
        fg = rgba[y0:y0 + tile, x0:x0 + tile, :3].astype(np.float32)
        bg = base[y0:y0 + tile, x0:x0 + tile].astype(np.float32)
        base[y0:y0 + tile, x0:x0 + tile] = (fg * al + bg * (1 - al) + 0.5).astype(np.uint8)
    return base


def flash_at(t):
    a, col = 0.0, (255, 246, 232)
    for c in FX["flashes"]:
        if t < c["t"] - 0.02 or t > c["t"] + 1: continue
        v = c.get("amt", 0.85) * (math.exp(-(t - c["t"]) / c.get("tau", 0.09)) if t >= c["t"] else 0)
        if v > a:
            a = v
            h = c.get("color", "#FFF6E8").lstrip("#")
            col = tuple(int(h[k:k + 2], 16) for k in (0, 2, 4))
    return a, col


# ---------------------------------------------------------------- main
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(OUT_FPS),
    "-i", "-", "-vf", "scale=out_color_matrix=bt709:flags=bicubic,format=yuv420p",
    "-c:v", "libx264", "-preset", os.environ.get("X264_PRESET", "medium"), "-crf", os.environ.get("CRF", "15"),
    *(["-maxrate", os.environ["MAXRATE"], "-bufsize", os.environ.get("BUFSIZE", os.environ["MAXRATE"])] if os.environ.get("MAXRATE") else []),
    "-profile:v", "high", "-level", "5.2", "-x264-params", "keyint=120:min-keyint=60", "-threads", os.environ.get("X264_THREADS", "2"),
    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv", OUT], stdin=subprocess.PIPE)

for n in range(A, B):
    t = n / OUT_FPS
    behind = BEHIND.get(n)
    img, m = plate_at(n, behind is not None)
    img = img.copy()
    if behind is not None:
        clean = img.copy()
        img = over(img, cv2.imread(behind, cv2.IMREAD_UNCHANGED))
        # tighten the soft RVM edge (hair halo) before upscaling it to 4K
        mm = cv2.resize(MATTE_LUT[m], (W, H), interpolation=cv2.INTER_CUBIC).astype(np.float32) / 255.0
        np.clip(mm, 0, 1, out=mm)
        img = cv2.blendLinear(clean, img, mm, cv2.subtract(1.0, mm))
    img = cv2.multiply(img, VIG, scale=1 / 255.0)
    lk = leak_layer(t)
    if lk is not None:
        img = screen(img, lk)
    fr = FRONT.get(n)
    if fr is not None:
        img = over(img, cv2.imread(fr, cv2.IMREAD_UNCHANGED))
    s, x, y, rot = camera(t)
    if abs(s - 1) > 1e-4 or abs(x) > 0.02 or abs(y) > 0.02 or abs(rot) > 1e-3:
        M = cv2.getRotationMatrix2D((W / 2, H / 2), -rot, s)
        M[0, 2] += x * DESIGN; M[1, 2] += y * DESIGN
        img = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    fa, col = flash_at(t)
    if fa > 0.003:
        img = screen(img, np.full((H, W, 3), [int(col[2] * fa), int(col[1] * fa), int(col[0] * fa)], np.uint8))
    gp, gn = GRAIN[int(t * 24) % 8]
    img = cv2.subtract(cv2.add(img, gp), gn)
    enc.stdin.write(img.tobytes())
    if (n - A) % 120 == 0:
        print(f"{OUT}: frame {n} ({n - A}/{B - A})", flush=True)

enc.stdin.close()
enc.wait()
for r in (plate, matte):
    if r.proc:
        r.proc.stdout.close(); r.proc.kill(); r.proc.wait()
print("done", OUT, flush=True)
