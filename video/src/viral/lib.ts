import {useCurrentFrame} from 'remotion';
import beatMap from '../data/beat-map.json';
import {FPS} from './config';

/** Song time in seconds (the composition starts at song 0). */
export const useT = () => useCurrentFrame() / FPS;

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;
export const ease = {
  outCubic: (p: number) => 1 - Math.pow(1 - p, 3),
  outQuart: (p: number) => 1 - Math.pow(1 - p, 4),
  outExpo: (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  inCubic: (p: number) => p * p * p,
  inExpo: (p: number) => (p <= 0 ? 0 : Math.pow(2, 10 * p - 10)),
  inOutCubic: (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  inOutSine: (p: number) => -(Math.cos(Math.PI * p) - 1) / 2,
  outBack: (p: number, s = 1.7) => 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2),
};
export const springAt = (dt: number, freq = 2.4, damp = 0.34) => {
  if (dt <= 0) return 0;
  const w = 2 * Math.PI * freq;
  return 1 - Math.exp(-damp * w * dt) * Math.cos(w * Math.sqrt(1 - damp * damp) * dt);
};
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
/** Smooth deterministic noise in [-1, 1]. */
export const noise = (t: number, seed = 0) => {
  const i = Math.floor(t);
  const f = t - i;
  const a = rnd(i + seed * 101) * 2 - 1;
  const b = rnd(i + 1 + seed * 101) * 2 - 1;
  return a + (b - a) * (f * f * (3 - 2 * f));
};

// ---------- beat helpers ----------
const B = beatMap as {beats: number[]; downbeats: number[]; kicks: number[]; energy10hz: number[]};
const lastBefore = (arr: number[], t: number) => {
  let lo = 0, hi = arr.length - 1, ans = -1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (arr[m] <= t) { ans = m; lo = m + 1; } else hi = m - 1;
  }
  return ans;
};
/** Seconds since the last beat of the given kind (Infinity if none). */
export const since = (kind: 'beats' | 'downbeats' | 'kicks', t: number) => {
  const arr = B[kind];
  const i = lastBefore(arr, t);
  return i < 0 ? Infinity : t - arr[i];
};
export const beatIndex = (kind: 'beats' | 'downbeats' | 'kicks', t: number) => lastBefore(B[kind], t);
export const beatTimes = (kind: 'beats' | 'downbeats' | 'kicks', a: number, b: number) =>
  B[kind].filter((x) => x >= a && x < b);
/** Exponential pulse that fires on each beat of the given kind. */
export const pulse = (kind: 'beats' | 'downbeats' | 'kicks', t: number, decay = 0.18) => {
  const s = since(kind, t);
  return s === Infinity ? 0 : Math.exp(-s / decay);
};
export const energy = (t: number) => {
  const i = Math.round(t * 10);
  return B.energy10hz[Math.max(0, Math.min(B.energy10hz.length - 1, i))] ?? 0;
};
