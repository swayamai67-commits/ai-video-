import {useCurrentFrame, useVideoConfig} from 'remotion';

/** Current time in MV seconds. */
export const useT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return frame / fps;
};

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

export const ease = {
  outCubic: (p: number) => 1 - Math.pow(1 - p, 3),
  outQuart: (p: number) => 1 - Math.pow(1 - p, 4),
  outExpo: (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  inCubic: (p: number) => p * p * p,
  inQuad: (p: number) => p * p,
  inOutCubic: (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  inOutSine: (p: number) => -(Math.cos(Math.PI * p) - 1) / 2,
  outBack: (p: number, s = 1.7) => 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2),
};

/** Damped spring 0→1 with overshoot, dt seconds after start. */
export const springAt = (dt: number, freq = 2.4, damp = 0.36) => {
  if (dt <= 0) return 0;
  const w = 2 * Math.PI * freq;
  return 1 - Math.exp(-damp * w * dt) * Math.cos(w * Math.sqrt(1 - damp * damp) * dt);
};

/** 0 before a, eases to 1 over fin, holds, eases out over fout before b. */
export const windowed = (t: number, a: number, b: number, fin = 0.25, fout = 0.25) =>
  Math.min(ease.outCubic(prog(t, a, a + fin)), 1 - ease.inCubic(prog(t, b - fout, b)));

/** Exponential decay impulse: 1 at t0, falling with time constant tau. */
export const impulse = (t: number, t0: number, tau = 0.12) => (t < t0 ? 0 : Math.exp(-(t - t0) / tau));

export const rnd = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Smooth deterministic 1D noise in [-1, 1]. */
export const noise1 = (x: number, seed = 0) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return mix(rnd(i + seed * 101.7) * 2 - 1, rnd(i + 1 + seed * 101.7) * 2 - 1, u);
};

export const tc = (t: number, fps = 25) => {
  const f = Math.floor(t * fps) % fps;
  const s = Math.floor(t);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}:${p(f)}`;
};
