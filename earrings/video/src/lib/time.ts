import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {FPS} from '../theme';
import wordsJson from '../data/words.json';

export type Word = {word: string; start: number; end: number; i: number};
export const WORDS = wordsJson as Word[];
export const w = (i: number) => WORDS[i];

/** Song time in seconds. */
export const useT = () => useCurrentFrame() / FPS;

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** 0→1 progress between a and b (seconds) with an easing. */
export const ramp = (t: number, a: number, b: number, ease: (x: number) => number = Easing.linear) =>
  ease(clamp01((t - a) / (b - a)));

export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

export const E = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  soft: Easing.bezier(0.33, 0, 0.2, 1),
  back: Easing.bezier(0.34, 1.56, 0.64, 1),
  linear: Easing.linear,
};

/** Window opacity: fade in over [a, a+fi], fade out over [b-fo, b]. */
export const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) =>
  interpolate(t, [a, a + fi, b - fo, b], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** Damped spring response 0→1 (overshoots) starting at t0. */
export const springAt = (t: number, t0: number, freq = 2.2, damp = 5.5) => {
  const x = t - t0;
  if (x <= 0) return 0;
  return 1 - Math.exp(-damp * x) * Math.cos(2 * Math.PI * freq * x);
};

/** Metallic bounce after landing at t0: returns height offset (px, >=0 means up). */
export const bounce = (t: number, t0: number, h0 = 60, decay = 0.38, period = 0.22) => {
  let x = t - t0;
  if (x < 0) return 0;
  let h = h0;
  let p = period;
  for (let k = 0; k < 6; k++) {
    if (x < p) {
      const u = x / p;
      return h * 4 * u * (1 - u);
    }
    x -= p;
    h *= decay;
    p *= Math.sqrt(decay);
  }
  return 0;
};

/** Seeded PRNG (mulberry32). */
export const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
  return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
};
