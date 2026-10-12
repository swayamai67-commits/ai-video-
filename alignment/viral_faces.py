"""Face boxes for the family-portrait plate (OpenCV YuNet, model from opencv_zoo).
Writes video/src/viral/data/faces.json: {clip: [[ [x,y,w,h], ... ] per frame]} normalised."""
import json, pathlib, sys
import cv2

ROOT = pathlib.Path(__file__).resolve().parents[1]
PUB = ROOT / "video/public/viral/plates"
MODEL = pathlib.Path.home() / ".cache/opencv_zoo/face_detection_yunet_2023mar.onnx"
URL = "https://media.githubusercontent.com/media/opencv/opencv_zoo/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"
if not MODEL.exists():
    import urllib.request
    MODEL.parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(URL, MODEL)
out = {}
for cid in sys.argv[1:] or ["portrait"]:
    res = []
    for f in sorted((PUB / cid).glob("*.jpg")):
        im = cv2.imread(str(f)); H, W = im.shape[:2]
        det = cv2.FaceDetectorYN.create(str(MODEL), "", (W, H), 0.7, 0.3, 50)
        _, fs = det.detect(im)
        fs = [] if fs is None else fs
        res.append(sorted([[round(float(r[0]) / W, 4), round(float(r[1]) / H, 4), round(float(r[2]) / W, 4), round(float(r[3]) / H, 4)] for r in fs], key=lambda b: b[0]))
    out[cid] = res
    print(cid, sum(len(r) for r in res) / max(1, len(res)), "faces/frame")
(ROOT / "video/src/viral/data/faces.json").write_text(json.dumps(out, separators=(",", ":")))
