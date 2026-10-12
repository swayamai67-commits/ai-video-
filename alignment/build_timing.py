"""Build frozen timing data from the supplied lyrics JSON.

The supplied JSON (inputs/lyrics.json) is the source of truth for both the
words and their timing. This script only:
  * drops the "[background music]" markers,
  * fixes a handful of transcription glitches (non-Devanagari stray glyphs),
  * groups words into lines (split on "।") and half-lines (split on ","),
and writes data/words.json + data/phrases.json. Timings are never changed.
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
src = json.loads((ROOT / "inputs/lyrics.json").read_text())

FIXES = {  # token -> replacement (documented in docs/implementation-notes.md)
    "आଳियां,": "आळियां,",   # Odia ଳ -> Devanagari ळ
    "आଳियां": "आळियां",
    "uttering": "उतरन",      # STT heard Punjabi "उतरन" as English
    "म्याuna": "म्यानां",
    "Oh-oh-oh-oh-oh-oh.": "Oh-oh-oh-oh-oh-oh",
    "Mercy.": "Mercy",
}

raw = [w for s in src["segments"] for w in s["words"] if w["text"].strip()]
words = []
i = 0
while i < len(raw):
    w = raw[i]
    t = w["text"]
    if t == "[background music]":
        i += 1
        continue
    # "क" + "ッ" + "チ" -> one word (katakana glitch)
    if t == "क" and i + 2 < len(raw) and raw[i + 1]["text"] == "ッ":
        words.append({"word": "कच्च", "start": w["start_time"], "end": raw[i + 2]["end_time"]})
        i += 3
        continue
    words.append({"word": FIXES.get(t, t), "start": round(w["start_time"], 3), "end": round(w["end_time"], 3)})
    i += 1

for k, w in enumerate(words):
    w["i"] = k

def clean(t):
    return t.rstrip("।,.")

lines, cur = [], []
for w in words:
    cur.append(w)
    t = w["word"]
    if t.endswith("।") or t in ("Oh-oh-oh-oh-oh-oh", "Mercy"):
        lines.append(cur)
        cur = []
if cur:
    lines.append(cur)

phrases = []
for li, ln in enumerate(lines):
    halves, h = [], []
    for w in ln:
        h.append(w)
        if w["word"].endswith(","):
            halves.append(h)
            h = []
    if h:
        halves.append(h)
    for hi, h in enumerate(halves):
        phrases.append({
            "id": len(phrases),
            "line": li,
            "half": hi,
            "halves": len(halves),
            "start": h[0]["start"],
            "end": h[-1]["end"],
            "text": " ".join(clean(x["word"]) for x in h),
            "words": [{"i": x["i"], "w": clean(x["word"]), "s": x["start"], "e": x["end"]} for x in h],
        })

(ROOT / "data").mkdir(exist_ok=True)
(ROOT / "data/words.json").write_text(json.dumps(words, ensure_ascii=False, indent=1))
(ROOT / "data/phrases.json").write_text(json.dumps(phrases, ensure_ascii=False, indent=1))
print(len(words), "words", len(lines), "lines", len(phrases), "phrases")
for p in phrases:
    print(f'{p["id"]:3d} L{p["line"]:2d} {p["start"]:7.2f}-{p["end"]:7.2f} {p["text"]}')
