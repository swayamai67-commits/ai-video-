"""Person matte for the whole MV with Robust Video Matting (ONNX, CPU).

Outputs:
  matte.mp4  1280x720 grayscale alpha (25 fps), upscaled in Remotion
  subjects.json  per frame: bbox of the matte [x0,y0,x1,y1] in 0..1 + coverage
The recurrent state is reset at every detected cut so mattes don't smear across shots.
"""
import json, subprocess, sys
import numpy as np, onnxruntime as ort

MV, MODEL, OUT, CUTS = sys.argv[1:5]
cuts = {round(float(c) * 25) for c in open(CUTS).read().split()}
so = ort.SessionOptions(); so.intra_op_num_threads = 2
s = ort.InferenceSession(MODEL, so, providers=["CPUExecutionProvider"])
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", MV, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "gray", "-s", "1280x720", "-r", "25",
    "-i", "-", "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", f"{OUT}/matte.mp4"], stdin=subprocess.PIPE)
rec = [np.zeros((1, 1, 1, 1), np.float32)] * 4
ds = np.array([0.375], np.float32)
info, n = [], 0
while True:
    buf = dec.stdout.read(1280 * 720 * 3)
    if len(buf) < 1280 * 720 * 3: break
    if n in cuts: rec = [np.zeros((1, 1, 1, 1), np.float32)] * 4
    x = (np.frombuffer(buf, np.uint8).reshape(720, 1280, 3).astype(np.float32) / 255).transpose(2, 0, 1)[None]
    fgr, pha, *rec = s.run(None, {"src": x, "r1i": rec[0], "r2i": rec[1], "r3i": rec[2], "r4i": rec[3], "downsample_ratio": ds})
    a = pha[0, 0]
    enc.stdin.write((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8).tobytes())
    m = a > 0.5
    cov = float(m.mean())
    if cov > 0.002:
        ys, xs = np.where(m)
        info.append([round(xs.min() / 1280, 4), round(ys.min() / 720, 4), round(xs.max() / 1280, 4), round(ys.max() / 720, 4), round(cov, 4)])
    else:
        info.append(None)
    n += 1
    if n % 500 == 0: print(n, flush=True)
enc.stdin.close(); enc.wait()
json.dump(info, open(f"{OUT}/subjects.json", "w"))
print("done", n)
