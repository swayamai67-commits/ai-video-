"""Frame ranges (60 fps) where the behind-the-subject words are on screen, so AshkeBehind
is rendered only there. Mirrors BEHIND / cueWindow in video/src/edit/Behind.tsx."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
L = {p["id"]: p for p in json.load(open(f"{ROOT}/video/src/edit/data/lyrics.json"))}
cuts = [0] + json.load(open(f"{ROOT}/video/src/edit/data/cuts.json")) + [218]
CUES = [(9, 6, 0.9), (12, 3, 0.7), (29, 3, 0.6), (49, 4, 0.25), (78, 0, 0.7), (82, 6, 1.0), (84, 6, 1.0), (86, 6, 1.6)]
for pid, k, hold in CUES:
    w = L[pid]["words"][k]
    shot_end = min(c for c in cuts if c > w["s"])
    a, b = w["s"] - 0.08, min(w["e"] + hold, shot_end - 0.36) + 0.35
    print(f"{int(a * 60) - 1}-{int(b * 60) + 2}")
