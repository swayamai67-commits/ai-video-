"""Romanized (Latin-script) lyrics, word-for-word aligned to data/phrases.json.

Each Devanagari word is respelled in English letters the way Punjabi lyric
sites write it, keeping pronunciation and meaning (अश्के -> ASHKE). The word
count of every line must match the timed transcript, so the timing stays frozen.
`accent` marks the few words that are also shown in their original Devanagari.
Output: data/lyrics-roman.json
"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROMAN = {
 0: "Oh-oh-oh-oh-oh-oh", 1: "Mercy",
 2: "Jittan de shaunki", 3: "Sohniye haravan vairi hass ke",
 4: "Gidda landuan da", 5: "Yaariyan pawanda main kya dass ke",
 6: "Babe di saanu bakhshe", 7: "Kannakiyan gaani lash ke",
 8: "Ni mode paundi", 9: "Jhumar de naal hi keh ke ASHKE",
 10: "Mere zor bada ae phatt 'che", 11: "Keeja tu saala hatt 'che",
 12: "Tu jigra dekhi Jatt 'che", 13: "Khad janda kalla gadd 'che",
 14: "Main sauda chalda puthiyan raan", 15: "Bin valni saala matt 'che",
 16: "Latta koi ghisda kich le", 17: "Menu trust ae neeli chhat 'che",
 18: "Saade kaam kaale", 19: "Teriyan gallan de utran laaliyan",
 20: "Ni sattiyan si sohniye", 21: "Kismat aa main thaaliyan",
 22: "Pindan aaliyan", 23: "Saanu ta thyaun pindan aaliyan aa",
 24: "Asla karda chhan", 25: "Saanu eeyan mutran ete taaliyan",
 26: "Main yaar yaaran da jogi", 27: "Mere dabb 'te asli beena",
 28: "Menu daate maan ne jigre ni", 29: "Kalla chauda ni seena",
 30: "Baby you so fire", 31: "Kahi jehdi mile na seena",
 32: "Ve main miss kardi aa tainu", 33: "Hun kade mil ja yaar shakeena",
 34: "Handa guruan nu", 35: "Vich rehal karne mera saath ae",
 36: "Ik poorab je 'te", 37: "Ohde to vida nahi aundi aadat ae",
 38: "Ajj saukhi lagdi", 39: "Aaj di dikhange jaane baad 'te",
 40: "Thode simple mere naanke", 41: "Par yogya mere daad ke",
 42: "Daad ke", 43: "Jitthe pehre rakhan beebai",
 44: "Utthe thaad daat bhai", 45: "Pind le le pachi keele",
 46: "Gaali de ke aaya saai", 47: "Show off deni aandi bass",
 48: "hand up gayi", 49: "Chakki mili di main Lambo",
 50: "Haale photo bhi ni paayi", 51: "Main sauda turi aa jaavan",
 52: "Tu takdi tedhi tedhi", 53: "Tu body kardi prepare",
 54: "Te main karda kaam sheri", 55: "Saada ta poora phera ae",
 56: "Na main ni launda gedi", 57: "Kaaran jo keete aslan",
 58: "Ni ae dine early meri", 59: "Ki leeda latta",
 60: "Topla rakha main jaane chhaad ke", 61: "Kachch o chabka",
 62: "Peeneya jahanu yuga kaadh ke", 63: "Darkulla ghoomda",
 64: "Pairi nu rakha main yuga phaad ke", 65: "Ni tu full Berg",
 66: "Pattharan nu aaya munda phaad ke", 67: "Kardi milkiyan deedan",
 68: "Te saada khul gaya chaaka", 69: "Tu dil kardi ae chori",
 70: "Ni te main maari da daaka", 71: "Ae beke ji channu myaanan te",
 72: "Mera shastar dena thaaka", 73: "Dass ki kar lena kaaman ni",
 74: "Mera baajan aala raakha", 75: "Chauraahan vich rode",
 76: "Kainan ji Yaara na bhena kass ke", 77: "Jatt mudd to zehri",
 78: "Naag ni reha koi saanu kass ke", 79: "Babe di saanu bakhshe",
 80: "Kannakiyan gaani lash ke", 81: "Ni mode paundi",
 82: "Jhumar de naal hi keh ke ASHKE", 83: "Ni mode paundi",
 84: "Jhumar de naal hi keh ke ASHKE", 85: "Ni mode paundi",
 86: "Jhumar de naal hi keh ke ASHKE",
}
# The few words that also appear in Devanagari, "for the feel" (phrase id -> word index).
ACCENT = {9: [6], 12: [2], 22: [0], 26: [4], 29: [3], 70: [5], 74: [2], 78: [0], 82: [6], 84: [6], 86: [6]}
# English code-switches in the original vocal (styled differently)
ENGLISH = {"mercy", "trust", "baby", "you", "so", "fire", "miss", "simple", "show", "off", "hand", "up",
           "lambo", "photo", "body", "prepare", "early", "berg", "yaara"}

phrases = json.load(open(f"{ROOT}/data/phrases.json"))
out = []
for p in phrases:
    rw = ROMAN[p["id"]].split()
    assert len(rw) == len(p["words"]), (p["id"], rw, [w["w"] for w in p["words"]])
    words = []
    for k, (r, w) in enumerate(zip(rw, p["words"])):
        words.append({"i": w["i"], "w": r, "dev": re.sub(r"[।,]", "", w["w"]), "s": w["s"], "e": w["e"],
                      "accent": k in ACCENT.get(p["id"], []),
                      "en": re.sub(r"[^a-z]", "", r.lower()) in ENGLISH})
    out.append({"id": p["id"], "line": p["line"], "half": p["half"], "start": p["start"], "end": p["end"],
                "text": " ".join(rw), "words": words})
json.dump(out, open(f"{ROOT}/data/lyrics-roman.json", "w"), ensure_ascii=False, indent=1)
print(len(out), "phrases,", sum(len(p["words"]) for p in out), "words;",
      sum(w["accent"] for p in out for w in p["words"]), "Devanagari accents")
