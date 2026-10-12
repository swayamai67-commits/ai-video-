"""Romanize the frozen lyric timing for the viral cut.

Reads data/phrases.json (frozen, never modified) and writes
data/viral/lyrics.json with the same words, the same timings and the same
pronunciation, spelled in English letters the way fans write Punjabi online
("अश्के" -> "Ashke"). A few words are flagged as ACCENTS: those render in
Punjabi script (Gurmukhi) for feel; Devanagari spellings are stored too so
the accent script can be switched in video/src/viral/config.ts.
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
phrases = json.loads((ROOT / "data/phrases.json").read_text())

# one string per phrase id; tokens are space-separated and map 1:1 to timed words
ROMAN = {
    0: "Oh-oh-oh-oh-oh-oh",
    1: "Mercy",
    2: "Jittan de shaunki",
    3: "sohniye haravan vairi hass ke",
    4: "Gidda landuan da",
    5: "yaariyan pavaunda main kya dass ke",
    6: "Babe di saanu bakhshe",
    7: "kannkiyan gaani lash ke",
    8: "Ni mode paundi",
    9: "jhumar de naal hi keh ke Ashke",
    10: "Mere zor bada ae phatt 'che",
    11: "keeja tu saala hath 'che",
    12: "Tu jigra dekhi Jatt 'che",
    13: "khad jaanda kalla gadh 'che",
    14: "Main sauda chalda putthiyan raahan",
    15: "bin valni saala matt 'che",
    16: "Latta koi ghisda khich le",
    17: "menu trust ae neeli chhatt 'che",
    18: "Saade kamm kaale",
    19: "teriyan gallan de utran laaliyan",
    20: "Ni sattiyan si sohniye",
    21: "kismat aa main thaaliyan",
    22: "Pindan aaliyan",
    23: "saanu ta thyaun pindan aaliyan aa",
    24: "Asla karda chhaan",
    25: "saanu eeyan mutran ethe taaliyan",
    26: "Main yaar yaaran da jogi",
    27: "mere dabb 'te asli beena",
    28: "Menu daate maa ne jigre ni",
    29: "kalla chauda ni seena",
    30: "Baby you so fire",
    31: "kahi jehdi mile na seena",
    32: "Ve main miss kardi aa tainu",
    33: "hun kade mil ja yaar shakeena",
    34: "Handa guruan nu",
    35: "vich rehal karne mera saath ae",
    36: "Ik poorab je 'te",
    37: "ohde to vida nahi aundi aadat ae",
    38: "Ajj sokhi lagdi",
    39: "aaj di dikhange jaane baad 'te",
    40: "Thode simple mere naanke",
    41: "par yogya mere daad ke",
    42: "daad ke",
    43: "Jitthe pehre rakhan bibaai",
    44: "utthe thaadh daat bhai",
    45: "Pind le le pachchi keele",
    46: "gaali de ke aaya saai",
    47: "Show off deni aandi bas",
    48: "hand up gayi",
    49: "Chakki mili di main Lambo",
    50: "haale photo bhi ni paayi",
    51: "Main sauda turi aa jaavan",
    52: "tu takdi tedhi tedhi",
    53: "Tu body kardi prepare",
    54: "te main karda kamm sheri",
    55: "Saada ta poora phera ae",
    56: "na main ni launda gedi",
    57: "Kaaran jo keete aslan",
    58: "ni ae dine early meri",
    59: "Ki leeda latta",
    60: "topla rakha main jaane chhad ke",
    61: "Kachch o chabka",
    62: "peeneya jahanu yooga kaadh ke",
    63: "Darkulla ghoomda",
    64: "pairi nu rakha main yooga phaad ke",
    65: "Ni tu phull Berg",
    66: "pattharan nu aaya munda phaad ke",
    67: "Kardi milkiyan deedan",
    68: "te saada khull gaya chaaka",
    69: "Tu dil kardi ae chori",
    70: "ni te main maari da daaka",
    71: "Ae beke ji chanu myaanan te",
    72: "mera shastar dena thaaka",
    73: "Dass ki kar lena kaaman ni",
    74: "mera baajan aala raakha",
    75: "Chaurahan vich rode",
    76: "kainan ji yaara na bhena kass ke",
    77: "Jatt mud to zehri",
    78: "naag ni reha koi saanu kass ke",
    79: "Babe di saanu bakhshe",
    80: "kannkiyan gaani lash ke",
    81: "Ni mode paundi",
    82: "jhumar de naal hi keh ke Ashke",
    83: "Ni mode paundi",
    84: "jhumar de naal hi keh ke Ashke",
    85: "Ni mode paundi",
    86: "jhumar de naal hi keh ke Ashke",
}

# (phrase id, token index) -> (gurmukhi, devanagari). Few on purpose: the
# video reads in English letters; these land as Punjabi-script punctuation.
ACCENTS = {
    (6, 0): ("ਬਾਬੇ", "बाबे"),
    (9, 6): ("ਅਸ਼ਕੇ", "अश्के"),
    (12, 3): ("ਜੱਟ", "जट"),
    (22, 0): ("ਪਿੰਡਾਂ", "पिंडां"),
    (26, 1): ("ਯਾਰ", "यार"),
    (29, 3): ("ਸੀਨਾ", "सीना"),
    (45, 0): ("ਪਿੰਡ", "पिंड"),
    (70, 5): ("ਡਾਕਾ", "डाका"),
    (77, 0): ("ਜੱਟ", "जट"),
    (78, 0): ("ਨਾਗ", "नाग"),
    (82, 6): ("ਅਸ਼ਕੇ", "अश्के"),
    (84, 6): ("ਅਸ਼ਕੇ", "अश्के"),
    (86, 6): ("ਅਸ਼ਕੇ", "अश्के"),
}

ENGLISH = {"trust", "Baby", "you", "so", "fire", "miss", "simple", "Show", "off",
           "hand", "up", "Lambo", "photo", "body", "prepare", "early", "Berg", "Mercy"}

out, n_words = [], 0
for p in phrases:
    toks = ROMAN[p["id"]].split(" ")
    assert len(toks) == len(p["words"]), (p["id"], toks, [w["w"] for w in p["words"]])
    words = []
    for k, (tok, w) in enumerate(zip(toks, p["words"])):
        acc = ACCENTS.get((p["id"], k))
        words.append({
            "i": w["i"], "w": tok, "src": w["w"], "s": w["s"], "e": w["e"],
            **({"gu": acc[0], "dev": acc[1]} if acc else {}),
            **({"en": True} if tok in ENGLISH else {}),
        })
        n_words += 1
    out.append({"id": p["id"], "line": p["line"], "half": p["half"], "start": p["start"],
                "end": p["end"], "text": ROMAN[p["id"]], "words": words})

(ROOT / "data/viral").mkdir(parents=True, exist_ok=True)
(ROOT / "data/viral/lyrics.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
# human-readable sheet, also the review document for the transliteration
lines = ["# ASHKE: romanized lyrics (timing unchanged)", "",
         "Bold = shown in Punjabi script (Gurmukhi).", "",
         "| # | time | original | romanized |", "|---|---|---|---|"]
for p in out:
    rom = " ".join(f"**{w['gu']}**" if "gu" in w else w["w"] for w in p["words"])
    lines.append(f"| {p['id']} | {p['start']:.2f} | {' '.join(w['src'] for w in p['words'])} | {rom} |")
(ROOT / "docs/viral").mkdir(parents=True, exist_ok=True)
(ROOT / "docs/viral/lyrics-romanized.md").write_text("\n".join(lines) + "\n")
print(len(out), "phrases,", n_words, "words,", len(ACCENTS), "accent words")
