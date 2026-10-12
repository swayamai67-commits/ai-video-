import React, {createContext, useContext} from 'react';
import {useCurrentFrame} from 'remotion';
import {FPS} from '../theme';

export type Format = {kind: 'full' | 'reel'; W: number; H: number; songStart: number; songEnd: number};

export const FormatCtx = createContext<Format>({kind: 'full', W: 1920, H: 1080, songStart: 0, songEnd: 217.81});
export const useFormat = () => useContext(FormatCtx);

/** Current time in SONG seconds (the single clock everything is keyed to). */
export const useT = () => {
  const frame = useCurrentFrame();
  const {songStart} = useFormat();
  return songStart + frame / FPS;
};

// ---------- easing & helpers (no linear motion anywhere) ----------
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

export const ease = {
  outCubic: (p: number) => 1 - Math.pow(1 - p, 3),
  outQuart: (p: number) => 1 - Math.pow(1 - p, 4),
  outExpo: (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  inCubic: (p: number) => p * p * p,
  inOutCubic: (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  inOutSine: (p: number) => -(Math.cos(Math.PI * p) - 1) / 2,
  outBack: (p: number, s = 1.6) => 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2),
};

/** Damped spring response 0→1 (overshoot then settle) for t seconds after start. */
export const springAt = (dt: number, freq = 2.2, damp = 0.32) => {
  if (dt <= 0) return 0;
  const w = 2 * Math.PI * freq;
  return 1 - Math.exp(-damp * w * dt) * Math.cos(w * Math.sqrt(1 - damp * damp) * dt);
};

/** Window visibility: 0 before a, rises over fin, holds, falls over fout before b. */
export const windowed = (t: number, a: number, b: number, fin = 0.3, fout = 0.3) =>
  Math.min(ease.outCubic(prog(t, a, a + fin)), 1 - ease.inCubic(prog(t, b - fout, b)));

// deterministic pseudo random
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export const Show: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => {
  const t = useT();
  if (t < from || t >= to) return null;
  return React.createElement(React.Fragment, null, children);
};
