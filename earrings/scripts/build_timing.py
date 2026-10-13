"""inputs/lyrics.json (word-level, ElevenLabs-style) -> data/words.json + data/phrases.json.

The supplied timestamps are used as-is (frozen), with one documented exception: the aligner
placed the outro "From you." at 33.14-33.36 s, after the mix has faded to silence (RMS < 0.002).
The last audible vocal energy sits at ~29.5-30.8 s, so "Oh." is shortened to its audible part and
"From you." is moved there. Low confidence; the design uses a soft fade for it.
"""
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[1]
src = json.loads((ROOT / "inputs/lyrics.json").read_text())
words = []
for seg in src["segments"]:
    for w in seg["words"]:
        if w["text"].strip():
            words.append({"word": w["text"].strip(), "start": round(w["start_time"], 3), "end": round(w["end_time"], 3)})
# outro fix (see docstring)
fix = {"Oh.": (28.24, 29.5), "From": (29.55, 29.95), "you.": (29.95, 30.8)}
for w in words[-3:]:
    w["start"], w["end"] = fix[w["word"]]
    w["adjusted"] = True
# lines: (first word index, last word index inclusive)
cuts = [("Her", 0), ("You", 6), ("You", 13), ("'cause", 21), ("So", 28), ("and", 35), ("'Cause", 41), ("Now", 48), ("Oh.", 56), ("From", 57)]
phrases = []
for i, (first, a) in enumerate(cuts):
    b = cuts[i + 1][1] - 1 if i + 1 < len(cuts) else len(words) - 1
    assert words[a]["word"] == first, (words[a], first)
    ws = list(range(a, b + 1))
    phrases.append({"line": i + 1, "text": " ".join(words[k]["word"] for k in ws), "start": words[a]["start"], "end": words[b]["end"], "words": ws})
for i, w in enumerate(words):
    w["i"] = i
(ROOT / "data/words.json").write_text(json.dumps(words, indent=1))
(ROOT / "data/phrases.json").write_text(json.dumps(phrases, indent=1))
for p in phrases:
    print(f'{p["line"]:2d} {p["start"]:6.2f}-{p["end"]:6.2f}  {p["text"]}')
