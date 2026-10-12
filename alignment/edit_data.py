"""Build the data the Remotion edit reads, all keyed to MV time (the uncut film is the master).

song -> MV:  song < 104.91 : mv = song - 19.91   (block 1, MV 25.5 .. 85.0)
             song >= 104.91: mv = song + 0.41    (block 2, MV 105.3 .. 218)
MV 0..25.5 is the dialogue intro and MV 85.0..105.3 the butler scene; no song there.
"""
import json, os, subprocess, sys
import numpy as np, librosa
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = f"{ROOT}/video/src/edit/data"; os.makedirs(OUT, exist_ok=True)
SPLIT = 104.91

def to_mv(s):
    return s - 19.91 if s < SPLIT else s + 0.41

def in_film(s):
    return 45.4 <= s < 104.95 or s >= 104.9

lyr = json.load(open(f"{ROOT}/data/lyrics-roman.json"))
out = []
for p in lyr:
    if not in_film(p["start"]):
        continue  # "Oh-oh" ad-lib sits under the intro dialogue
    ws = []
    for w in p["words"]:
        s, e = to_mv(w["s"]), to_mv(w["e"])
        if w["s"] < SPLIT <= w["e"]:
            e = 85.0  # the word straddles the cut into the butler scene
        ws.append({**w, "s": round(s, 3), "e": round(max(e, s + 0.08), 3)})
    out.append({**p, "start": ws[0]["s"], "end": ws[-1]["e"], "words": ws})
json.dump(out, open(f"{OUT}/lyrics.json", "w"), ensure_ascii=False)

bm = json.load(open(f"{ROOT}/data/beat-map.json"))
def mvlist(xs):
    return [round(to_mv(x), 3) for x in xs if in_film(x) and not (SPLIT - 0.05 < x < SPLIT + 0.05)]
beats = {"tempo": bm["tempo"], "beats": mvlist(bm["beats"]), "downbeats": mvlist(bm["downbeats"]), "kicks": mvlist(bm["kicks"])}

# loudness envelope of the MV's own soundtrack at 60 Hz (drives subtle reactivity)
y, sr = librosa.load(sys.argv[1], sr=22050, mono=True)
hop = sr // 60
rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=hop)[0]
rms = rms / np.percentile(rms, 98)
beats["env60"] = [round(float(min(v, 1.2)), 3) for v in rms]
json.dump(beats, open(f"{OUT}/beats.json", "w"))

cuts = [float(c) for c in open(sys.argv[2]).read().split()]
json.dump(cuts, open(f"{OUT}/cuts.json", "w"))
print(len(out), "phrases in film;", len(beats["beats"]), "beats;", len(cuts), "cuts;", len(beats["env60"]), "env samples")
