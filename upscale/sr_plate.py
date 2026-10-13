"""Neural 4K plate: Real-ESRGAN (general-x4v3, 0.5 denoise) on the official MV.

720p frames are area-downscaled to 960x540 (also removes macro-blocking) and
upscaled x4 to native 3840x2160 — same 16:9 frame, nothing cropped.
Work is split into 250-frame chunks; each chunk is its own x264 file with a
.done marker, so the job can be killed and resumed at any time.

usage: sr_plate.py MV.mp4 MODEL.onnx OUTDIR [workers]
"""
import os, subprocess, sys
from multiprocessing import Pool
import numpy as np

MV, MODEL, OUT = sys.argv[1:4]
WORKERS = int(sys.argv[4]) if len(sys.argv) > 4 else 4
CHUNK, FPS, TOTAL = 250, 25, 5450
W, H = 960, 540

def run_chunk(c):
    import cv2, onnxruntime as ort
    a, b = c * CHUNK, min(TOTAL, (c + 1) * CHUNK)
    dst = f"{OUT}/sr_{c:03d}.mp4"
    if os.path.exists(dst + ".done"):
        return c
    so = ort.SessionOptions(); so.intra_op_num_threads = 1; so.inter_op_num_threads = 1
    sess = ort.InferenceSession(MODEL, so, providers=["CPUExecutionProvider"])
    dec = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", f"{max(0, a / FPS - 2):.3f}", "-i", MV,
        "-vf", f"select='between(n\\,{a - max(0, a - 2 * FPS)}\\,{b - 1 - max(0, a - 2 * FPS)})',setpts=N/{FPS}/TB",
        "-fps_mode", "passthrough", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-s", "3840x2160", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "fast", "-crf", "12",
        "-pix_fmt", "yuv420p", "-threads", "1", "-x264-params", "keyint=25", "-colorspace", "bt709",
        "-color_primaries", "bt709", "-color_trc", "bt709", dst], stdin=subprocess.PIPE)
    n = 0
    while True:
        buf = dec.stdout.read(1280 * 720 * 3)
        if len(buf) < 1280 * 720 * 3:
            break
        f = np.frombuffer(buf, np.uint8).reshape(720, 1280, 3)
        f = cv2.resize(f, (W, H), interpolation=cv2.INTER_AREA)
        x = (f.astype(np.float32) / 255).transpose(2, 0, 1)[None]
        y = sess.run(None, {"input": np.ascontiguousarray(x)})[0][0]
        enc.stdin.write((np.clip(y, 0, 1).transpose(1, 2, 0) * 255 + 0.5).astype(np.uint8).tobytes())
        n += 1
    enc.stdin.close(); enc.wait(); dec.wait()
    if n != b - a:
        raise RuntimeError(f"chunk {c}: got {n} frames, expected {b - a}")
    open(dst + ".done", "w").write(str(n))
    print(f"chunk {c} done ({n} frames)", flush=True)
    return c

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    chunks = list(range((TOTAL + CHUNK - 1) // CHUNK))
    with Pool(WORKERS) as p:
        for _ in p.imap_unordered(run_chunk, chunks):
            pass
    print("ALL DONE", flush=True)
