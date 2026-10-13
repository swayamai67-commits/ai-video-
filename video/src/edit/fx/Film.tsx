import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, impulse, mix, noise1, prog, useT} from '../lib';

/** Animated film grain: 8 pre-baked tiles, swapped at 24 Hz regardless of render fps. */
export const Grain: React.FC<{amount?: number}> = ({amount = 0.11}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = Math.floor((frame / fps) * 24) % 8;
  return (
    <AbsoluteFill style={{mixBlendMode: 'overlay', opacity: amount}}>
      <Img src={staticFile(`grain4k/g${k + 1}.png`)} style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{amount?: number}> = ({amount = 0.42}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${amount}) 100%)`}} />
);

export type FlashCue = {t: number; color?: string; amt?: number; tau?: number};

export const Flashes: React.FC<{cues: FlashCue[]}> = ({cues}) => {
  const t = useT();
  let a = 0, col = '#fff';
  for (const c of cues) {
    if (t < c.t - 0.02 || t > c.t + 1) continue;
    const v = (c.amt ?? 0.85) * impulse(t, c.t, c.tau ?? 0.09);
    if (v > a) { a = v; col = c.color ?? '#FFF6E8'; }
  }
  if (a < 0.003) return null;
  return <AbsoluteFill style={{background: col, opacity: a, mixBlendMode: 'screen'}} />;
};

/** Warm light leak that drifts across frame between a and b (screen-blended gradients). */
export const Leak: React.FC<{a: number; b: number; hue?: 'warm' | 'red'; peak?: number; from?: 'left' | 'right'}> = ({
  a, b, hue = 'warm', peak = 0.55, from = 'left',
}) => {
  const t = useT();
  if (t < a || t > b) return null;
  const p = prog(t, a, b);
  const env = Math.sin(Math.PI * p);
  const x = from === 'left' ? mix(-10, 70, p) : mix(110, 30, p);
  const c1 = hue === 'warm' ? '255,170,80' : '255,60,40';
  const c2 = hue === 'warm' ? '255,90,40' : '200,20,30';
  const wob = noise1(t * 1.3, 4) * 6;
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: 'screen',
        opacity: clamp(env * peak),
        background: `radial-gradient(ellipse 38% 70% at ${x + wob}% 45%, rgba(${c1},0.95), rgba(${c2},0.35) 45%, rgba(0,0,0,0) 75%), radial-gradient(ellipse 22% 40% at ${x + 18}% 70%, rgba(255,230,190,0.6), rgba(0,0,0,0) 70%)`,
      }}
    />
  );
};
