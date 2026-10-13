"""Beat / onset / energy analysis for Earrings. Writes data/beat-map.json. Does not touch word timing."""
import json, sys
import numpy as np, librosa

src, dst = sys.argv[1], sys.argv[2]
y, sr = librosa.load(src, sr=22050, mono=True)
dur = len(y) / sr
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
onset_env = librosa.onset.onset_strength(y=y, sr=sr)
onsets = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr, units='time')
# percussive part for kicks / low hits
yh, yp = librosa.effects.hpss(y)
S = np.abs(librosa.stft(yp))
freqs = librosa.fft_frequencies(sr=sr)
low = S[freqs < 150].sum(axis=0)
low = low / (low.max() + 1e-9)
lt = librosa.frames_to_time(np.arange(len(low)), sr=sr)
kick_frames = librosa.util.peak_pick(low, pre_max=6, post_max=6, pre_avg=12, post_avg=12, delta=0.12, wait=8)
kicks = [round(float(lt[i]), 3) for i in kick_frames if low[i] > 0.25]
hop = 512
rms = librosa.feature.rms(y=y, hop_length=hop)[0]
rt = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop)
# energy sampled at 20 Hz, normalised 0..1
grid = np.arange(0, dur, 0.05)
energy = np.interp(grid, rt, rms)
energy = (energy - energy.min()) / (energy.max() - energy.min() + 1e-9)
cent = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=hop)[0]
bright = np.interp(grid, rt, cent); bright = (bright - bright.min()) / (bright.max() - bright.min() + 1e-9)
chroma = librosa.feature.chroma_cqt(y=yh, sr=sr)
key = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][int(chroma.mean(axis=1).argmax())]
out = {
  'duration': round(dur, 3), 'tempo': round(float(np.atleast_1d(tempo)[0]), 2), 'tonic_guess': key,
  'beats': [round(float(b), 3) for b in beats], 'onsets': [round(float(o), 3) for o in onsets], 'kicks': kicks,
  'energy_hz': 20, 'energy': [round(float(e), 3) for e in energy], 'brightness': [round(float(b), 3) for b in bright],
}
json.dump(out, open(dst, 'w'))
print('dur', out['duration'], 'tempo', out['tempo'], 'key?', key, 'beats', len(beats), 'kicks', len(kicks))
print('beats', out['beats'])
print('kicks', kicks)
# energy per second
for s in range(int(dur)+1):
    seg = energy[(grid >= s) & (grid < s+1)]
    print(f'{s:2d}s ' + '#' * int(seg.mean()*40) if len(seg) else '')
