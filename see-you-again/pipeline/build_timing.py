"""Timing + beat map.

1. Words: inputs/lyrics.json is the timing source (word-level, from the vocal).
   - "[upbeat music]" is dropped (not a lyric).
   - "[indistinct]" (1.40–2.58 s) is replaced by the words Whisper hears there, timed on the strongest
     onsets in the isolated vocal stem (UVR MDX-Net Voc_FT), clamped inside that window.
   - Any word Whisper hears differently is reported (not silently changed); overrides live in FIXES.
2. Beat map (librosa): tempo, beats, onsets, low-band kicks, 60 Hz RMS energy curve.

Outputs: data/words.json, data/phrases.json, data/beat-map.json
Run: python -I pipeline/build_timing.py [path/to/isolated-vocals.wav]
"""
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
DATA.mkdir(exist_ok=True)
SONG = ROOT / "inputs" / "song.mp3"

# Corrections applied on top of the supplied JSON after the Whisper cross-check.
# key = (segment index, original word) → replacement word list (timings split evenly inside the span)
FIXES: dict = {
    # STT heard "pull away"; the released lyric is "go to war". The isolated vocal (MDX-Net) through
    # Whisper small.en reads "…box a pho-to", which fits b-t-g-t-w, not "pull away".
    "1:pull": ["go", "to"],
    "1:away.": ["war."],
}

# Whisper small.en on the isolated vocal, 0–4.7 s: "Can I get a kiss? And can you make it last forever?"
INDISTINCT = ["And", "can", "you", "make", "it"]


def place_by_onsets(words, a, b, vocals):
    """Time words inside [a, b] on the strongest vocal onsets (isolated stem), in order."""
    import librosa

    y, sr = librosa.load(vocals, sr=22050, mono=True, offset=a, duration=b - a)
    env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=256)
    on = librosa.onset.onset_detect(onset_envelope=env, sr=sr, hop_length=256, units="frames")
    times = librosa.frames_to_time(on, sr=sr, hop_length=256)
    strength = env[on] if len(on) else []
    if len(times) >= len(words):
        top = sorted(np.argsort(strength)[::-1][: len(words)])
        starts = [a + float(times[i]) for i in top]
        starts[0] = min(starts[0], a + 0.02)
    else:
        starts = [a + i * (b - a) / len(words) for i in range(len(words))]
    ends = starts[1:] + [b]
    return [{"word": w, "start": round(s, 3), "end": round(e - 0.02, 3), "src": "asr+onset"}
            for w, s, e in zip(words, starts, ends)]


def main():
    import sys

    src = json.loads((ROOT / "inputs" / "lyrics.json").read_text())
    vocals = sys.argv[1] if len(sys.argv) > 1 else None  # isolated vocal stem (optional)

    words, phrases = [], []
    for si, seg in enumerate(src["segments"]):
        line = []
        for w in seg["words"]:
            txt = w["text"].strip()
            if not txt or txt == "[upbeat music]":
                continue
            if txt == "[indistinct]":
                a, b = w["start_time"], w["end_time"]
                if vocals:
                    line += place_by_onsets(INDISTINCT, a, b, vocals)
                else:
                    step = (b - a) / len(INDISTINCT)
                    line += [{"word": x, "start": round(a + i * step, 3), "end": round(a + (i + 1) * step, 3),
                              "src": "asr"} for i, x in enumerate(INDISTINCT)]
                continue
            key = f"{si}:{txt}"
            if key in FIXES:
                rep = FIXES[key]
                a, b = w["start_time"], w["end_time"]
                step = (b - a) / len(rep)
                for i, r in enumerate(rep):
                    line.append({"word": r, "start": round(a + i * step, 3), "end": round(a + (i + 1) * step, 3),
                                 "src": "fix"})
                continue
            line.append({"word": txt, "start": w["start_time"], "end": w["end_time"], "src": "json"})
        for i, w in enumerate(line):
            w["line"] = len(phrases)
            w["i"] = len(words) + i
        words += line
        phrases.append({"line": len(phrases), "text": " ".join(w["word"] for w in line),
                        "start": line[0]["start"], "end": line[-1]["end"], "words": [w["i"] for w in line]})

    (DATA / "words.json").write_text(json.dumps(words, indent=1))
    (DATA / "phrases.json").write_text(json.dumps(phrases, indent=1))
    for p in phrases:
        print(f"{p['start']:6.2f}–{p['end']:6.2f}  {p['text']}")

    import librosa

    y, sr = librosa.load(str(SONG), sr=44100, mono=True)
    dur = len(y) / sr
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units="time", tightness=120)
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    onsets = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr, units="time", backtrack=False)
    # low band kicks: 30–150 Hz energy peaks
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=512))
    freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
    low = S[(freqs > 30) & (freqs < 150)].sum(0)
    low = low / (low.max() + 1e-9)
    lt = librosa.frames_to_time(np.arange(len(low)), sr=sr, hop_length=512)
    pk = librosa.util.peak_pick(low, pre_max=6, post_max=6, pre_avg=10, post_avg=10, delta=0.08, wait=8)
    kicks = [{"t": round(float(lt[i]), 3), "v": round(float(low[i]), 3)} for i in pk]
    # 60 Hz energy curve to match the render rate
    hop = sr // 60
    rms = librosa.feature.rms(y=y, frame_length=hop * 2, hop_length=hop)[0]
    rms = rms / (rms.max() + 1e-9)
    beat_map = {
        "duration": round(dur, 3),
        "tempo": round(float(np.atleast_1d(tempo)[0]), 2),
        "beats": [round(float(b), 3) for b in beats],
        "onsets": [round(float(o), 3) for o in onsets],
        "kicks": kicks,
        "energy60": [round(float(v), 3) for v in rms],
    }
    (DATA / "beat-map.json").write_text(json.dumps(beat_map))
    print("tempo", beat_map["tempo"], "beats", beat_map["beats"])
    print("kicks", [k["t"] for k in kicks if k["v"] > 0.35])


if __name__ == "__main__":
    main()
