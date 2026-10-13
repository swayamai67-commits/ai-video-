import {Easing, random, spring, useCurrentFrame} from 'remotion';
import wordsJson from '../data/words.json';
import beatJson from '../data/beat-map.json';
import {FPS} from '../theme';

export type Word = {word: string; start: number; end: number; i: number};
export const words = wordsJson as Word[];
export const beats = beatJson as {beats: number[]; downbeats: number[]; kicks: number[]; energy10hz: number[]};

/** Song time in seconds (one clock for the whole film). */
export const useT = () => useCurrentFrame() / FPS;
export const useFrame = () => useCurrentFrame();

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  back: Easing.bezier(0.34, 1.56, 0.64, 1),
  snap: Easing.bezier(0.85, 0, 0.15, 1),
  soft: Easing.bezier(0.33, 0, 0.2, 1),
};

/** 0..1 progress of t across [a,b] with an easing. */
export const prog = (t: number, a: number, b: number, e: (x: number) => number = ease.out) => e(clamp((t - a) / (b - a)));

/** Physical spring evaluated at song time t, started at t0. */
export const springAt = (t: number, t0: number, cfg: {stiffness?: number; damping?: number; mass?: number} = {}) =>
  t < t0 ? 0 : spring({frame: (t - t0) * FPS, fps: FPS, config: {stiffness: 120, damping: 14, mass: 1, ...cfg}});

/** Word start shorthand. */
export const ws = (i: number) => words[i].start;
export const we = (i: number) => words[i].end;

/** Hand-animation "boil": a value that changes 12 times a second, seeded. */
export const boil = (frame: number, seed: string, amp = 1, rate = 5) => {
  const step = Math.floor(frame / rate);
  return (random(`${seed}-${step}`) - 0.5) * 2 * amp;
};

/** Decaying pulse after the most recent beat in list (0..1). */
export const pulse = (t: number, list: number[], decay = 0.25) => {
  let last = -99;
  for (const b of list) {
    if (b <= t) last = b;
    else break;
  }
  const d = t - last;
  return d < 0 ? 0 : Math.exp(-d / decay) * (d < 1.5 ? 1 : 0);
};

export const energyAt = (t: number) => {
  const e = beats.energy10hz;
  const i = clamp(t * 10, 0, e.length - 1);
  const a = Math.floor(i);
  return lerp(e[a], e[Math.min(a + 1, e.length - 1)], i - a);
};

/** Visibility window with soft edges (fade in over fi, out over fo). */
export const win = (t: number, a: number, b: number, fi = 0.2, fo = 0.2) =>
  clamp(Math.min((t - a) / fi, (b - t) / fo));
