"""Audio analysis -> data/beat-map.json (tempo, beats, downbeats, onsets, energy curve)."""
import json, pathlib
import numpy as np, librosa

ROOT = pathlib.Path(__file__).resolve().parents[1]
y, sr = librosa.load(ROOT / "inputs/song.mp3", sr=22050, mono=True)
hop = 512
oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
tempo, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, hop_length=hop)
bt = librosa.frames_to_time(beats, sr=sr, hop_length=hop)
# downbeat phase: choose the 4-phase with the strongest low-end onsets
S = np.abs(librosa.stft(y, hop_length=hop))
low = librosa.onset.onset_strength(S=librosa.amplitude_to_db(S[:40]), sr=sr, hop_length=hop)
scores = [low[beats[p::4]].sum() for p in range(4)]
phase = int(np.argmax(scores))
down = bt[phase::4]
# kicks: low-band onset peaks
kick_frames = librosa.util.peak_pick(low, pre_max=3, post_max=3, pre_avg=10, post_avg=10, delta=np.percentile(low, 90) * 0.5, wait=6)
kicks = librosa.frames_to_time(kick_frames, sr=sr, hop_length=hop)
# energy at 10 Hz, normalised 0..1
rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=hop)[0]
t = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop)
grid = np.arange(0, t[-1], 0.1)
e = np.interp(grid, t, rms)
e = np.convolve(e, np.ones(5) / 5, mode="same")
e = (e - e.min()) / (e.max() - e.min())
out = {
    "tempo": float(np.atleast_1d(tempo)[0]),
    "duration": float(len(y) / sr),
    "beats": [round(float(x), 3) for x in bt],
    "downbeats": [round(float(x), 3) for x in down],
    "kicks": [round(float(x), 3) for x in kicks],
    "energy10hz": [round(float(x), 3) for x in e],
}
(ROOT / "data/beat-map.json").write_text(json.dumps(out))
print("tempo", out["tempo"], "beats", len(bt), "downbeats", len(down), "kicks", len(kicks))
# coarse energy profile for planning
for s in range(0, int(out["duration"]), 6):
    seg = e[s * 10:(s + 6) * 10]
    print(f"{s:4d}s {'#' * int(seg.mean() * 40)}")
