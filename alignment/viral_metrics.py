"""Glyph metrics for fitted typography (no DOM measuring at render time).

Writes video/src/viral/data/metrics.json:
  adv[font][char]  advance width in em for Latin fonts
  words[font][txt] exact shaped width in em (HarfBuzz) for Gurmukhi/Devanagari accents
"""
import json, pathlib
import uharfbuzz as hb
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parents[1]
FONTS = ROOT / "video/public/fonts"
lyr = json.loads((ROOT / "data/viral/lyrics.json").read_text())

LATIN = {
    "slam": "anton-latin-400-normal.woff2",
    "black": "archivo-black-latin-400-normal.woff2",
    "serif": "instrument-serif-latin-400-italic.woff2",
    "mono": "jetbrains-mono-latin-500-normal.woff2",
}
adv = {}
for key, fn in LATIN.items():
    f = TTFont(str(FONTS / fn))
    upm = f["head"].unitsPerEm
    cmap = f.getBestCmap()
    hm = f["hmtx"]
    adv[key] = {chr(c): round(hm[g][0] / upm, 4) for c, g in cmap.items() if 32 <= c < 0x250 or c in (0x2014, 0x2192, 0x25CF, 0x2736)}

_ttf = {}
def shaped(fn, text):
    # HarfBuzz cannot read WOFF2 directly: decompress with fontTools first
    if fn not in _ttf:
        import io
        f = TTFont(str(FONTS / fn)); f.flavor = None
        b = io.BytesIO(); f.save(b); _ttf[fn] = b.getvalue()
    blob = hb.Blob(_ttf[fn])
    face = hb.Face(blob)
    font = hb.Font(face)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf)
    return round(sum(p.x_advance for p in buf.glyph_positions) / face.upem, 4)

words = {"gu": {}, "dev": {}}
for p in lyr:
    for w in p["words"]:
        if "gu" in w:
            words["gu"][w["gu"]] = shaped("anek-gurmukhi-gurmukhi-800-normal.woff2", w["gu"])
            words["dev"][w["dev"]] = shaped("eczar-devanagari-800-normal.woff2", w["dev"])
out = ROOT / "video/src/viral/data/metrics.json"
out.write_text(json.dumps({"adv": adv, "words": words}, ensure_ascii=False))
print(words)
