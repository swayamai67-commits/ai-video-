import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import beatMap from '../data/beat-map.json';
import {C, HITS, W, H} from '../theme';
import {flash, wobble} from '../lib/time';

const KICKS = (beatMap.kicks as {t: number; v: number}[]).filter((k) => k.v > 0.35);

/** Kick envelope (0..~1) for secondary rhythm: background pulses, not typography. */
export const kickEnv = (t: number, len = 0.14) =>
  KICKS.reduce((a, k) => (t >= k.t && t - k.t < len * 5 ? a + k.v * Math.exp(-(t - k.t) / len) : a), 0);

/** Camera impulse summed over the hero hits. */
export const shake = (t: number) => {
  let x = 0;
  let y = 0;
  let r = 0;
  let s = 0;
  for (const h of HITS) {
    x += h.amp * wobble(t, h.t, 47, 11) * 16;
    y += h.amp * wobble(t + 0.013, h.t, 39, 11) * 12;
    r += h.amp * wobble(t + 0.02, h.t, 31, 10) * 0.7;
    s += h.amp * flash(t, h.t, 0.09) * 0.035;
  }
  return {x, y, r, s};
};

/** RGB split as text-shadow, peaking on hero hits. */
export const chroma = (t: number, extra = 0) => {
  const a = HITS.reduce((acc, h) => acc + h.amp * flash(t, h.t, 0.07), 0) * 9 + extra;
  if (a < 0.3) return undefined;
  return `${-a}px 0 rgba(255,40,70,0.75), ${a}px 0 rgba(40,220,255,0.7)`;
};

export const Flash: React.FC<{t: number}> = ({t}) => {
  const a = HITS.reduce((acc, h) => acc + h.amp * flash(t, h.t, 0.045), 0) * 0.55;
  if (a < 0.01) return null;
  return <AbsoluteFill style={{background: C.cream, opacity: Math.min(0.8, a), mixBlendMode: 'screen'}} />;
};

export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.16}) => {
  const frame = useCurrentFrame();
  const i = (Math.floor(frame / 2) % 6) + 1;
  const ox = (frame * 137) % 512;
  const oy = (frame * 71) % 512;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile(`grain/g${i}.png`)})`,
        backgroundSize: '256px 256px',
        backgroundPosition: `${ox}px ${oy}px`,
        opacity,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  );
};

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.45}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(20,8,4,${strength}) 100%)`,
      pointerEvents: 'none',
    }}
  />
);

/** Halftone sun rays: the golden-hour backdrop's moving geometry. */
export const SunRays: React.FC<{t: number; cx?: number; cy?: number; opacity?: number}> = ({t, cx = W / 2, cy = H / 2, opacity = 0.16}) => {
  const n = 20;
  const R = 1900;
  const pulse = 1 + kickEnv(t) * 0.04;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <g transform={`translate(${cx} ${cy}) rotate(${t * 7}) scale(${pulse})`}>
        {Array.from({length: n}).map((_, i) => {
          const a0 = (i / n) * Math.PI * 2;
          const a1 = a0 + (Math.PI * 2) / n / 2;
          return (
            <path
              key={i}
              d={`M 0 0 L ${R * Math.cos(a0)} ${R * Math.sin(a0)} L ${R * Math.cos(a1)} ${R * Math.sin(a1)} Z`}
              fill={C.cream}
              opacity={opacity}
            />
          );
        })}
      </g>
    </svg>
  );
};
