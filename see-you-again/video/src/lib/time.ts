import {useCurrentFrame, useVideoConfig} from 'remotion';

/** One song clock for the whole film: seconds since the start of the MP3. */
export const useT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return frame / fps;
};

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const inv = (a: number, b: number, x: number) => clamp((x - a) / (b - a));

// Easing families. Each material/move picks one on purpose; nothing defaults to linear.
export const ease = {
  linear: (t: number) => t,
  inCubic: (t: number) => t * t * t,
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  inQuart: (t: number) => t * t * t * t,
  outExpo: (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inExpo: (t: number) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  inOutExpo: (t: number) =>
    t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  outBack: (t: number, s = 1.7) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  inBack: (t: number, s = 1.7) => (s + 1) * t * t * t - s * t * t,
  // "velocity" ramp: slams through the middle, long settle at the end (the speed-ramp edit)
  velocity: (t: number, p = 0.35) =>
    t < p ? 0.5 * Math.pow(t / p, 3) : 0.5 + 0.5 * (1 - Math.pow(1 - (t - p) / (1 - p), 4)),
};

/** Eased progress of x through [a, b]. */
export const prog = (x: number, a: number, b: number, fn: (t: number) => number = ease.outCubic) =>
  fn(inv(a, b, x));

/** Damped spring response to a step at t0 (0 → 1 with overshoot). */
export const spring = (t: number, t0: number, freq = 9, damp = 7) => {
  const d = t - t0;
  if (d <= 0) return 0;
  return 1 - Math.exp(-damp * d) * Math.cos(freq * d);
};

/** Decaying oscillation used for impacts (0 at rest). */
export const wobble = (t: number, t0: number, freq = 38, damp = 9) => {
  const d = t - t0;
  if (d < 0) return 0;
  return Math.exp(-damp * d) * Math.sin(freq * d);
};

/** Exponential flash envelope after a hit. */
export const flash = (t: number, t0: number, len = 0.12) => {
  const d = t - t0;
  if (d < 0 || d > len * 4) return 0;
  return Math.exp(-d / len);
};

/** Deterministic hash noise in [0,1). */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
};

/** Smooth 1D value noise in [-1,1]. */
export const noise1 = (x: number, seed = 0) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  const a = rnd(i + seed * 101.3) * 2 - 1;
  const b = rnd(i + 1 + seed * 101.3) * 2 - 1;
  return lerp(a, b, u);
};
