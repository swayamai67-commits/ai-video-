"""Windowed cross-correlation of the MV soundtrack against song.mp3.
Prints, per 4 s MV window, the song time it matches and the correlation."""
import numpy as np, librosa, sys
sr = 11025
mv, _ = librosa.load(sys.argv[1], sr=sr, mono=True)
song, _ = librosa.load(sys.argv[2], sr=sr, mono=True)
hop = 110  # ~10 ms
def env(y):
    S = np.abs(librosa.stft(y, n_fft=1024, hop_length=hop))
    e = np.log1p(S[:200]).mean(0)
    return (e - e.mean()) / (e.std() + 1e-9)
em, es = env(mv), env(song)
fps = sr / hop
win = int(4 * fps)
for t in np.arange(0, len(em) / fps - 4, 2.0):
    a = int(t * fps); seg = em[a:a + win]
    seg = (seg - seg.mean()) / (seg.std() + 1e-9)
    c = np.correlate(es, seg, mode="valid") / win
    k = int(np.argmax(c))
    print(f"mv {t:6.1f}  song {k / fps:7.2f}  off {k / fps - t:+7.2f}  r {c[k]:.2f}")
