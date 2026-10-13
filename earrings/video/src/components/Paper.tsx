import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {C} from '../theme';

/** Risograph paper: base tone, slow fibre gradient, and animated grain (changes 20x/s). */
export const Paper: React.FC<{color?: string; night?: number}> = ({color = C.paper, night = 0}) => (
  <AbsoluteFill style={{background: color}}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 80% at 30% 20%, rgba(255,255,255,${0.35 * (1 - night)}) 0%, rgba(255,255,255,0) 60%), radial-gradient(140% 90% at 50% 110%, rgba(31,37,71,${0.16 + 0.3 * night}) 0%, rgba(31,37,71,0) 70%)`,
      }}
    />
  </AbsoluteFill>
);

export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.2}) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / 4);
  const i = (step % 6) + 1;
  // plain alpha compositing (blend modes on full-frame layers band in headless Chrome)
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        opacity,
        backgroundImage: `url(${staticFile(`grain/n${i}.png`)})`,
        backgroundSize: '512px 512px',
        backgroundPosition: `${(step * 137) % 512}px ${(step * 311) % 512}px`,
      }}
    />
  );
};

/** Shared SVG defs: gold gradient and riso halftone patterns. */
export const Defs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFE7A8" />
        <stop offset="0.35" stopColor={C.gold} />
        <stop offset="0.7" stopColor="#C98A2B" />
        <stop offset="1" stopColor="#F6CF7A" />
      </linearGradient>
      {(
        [
          ['dotsPink', C.pink, 12, 3.4],
          ['dotsPinkFine', C.pink, 9, 2.2],
          ['dotsInk', C.ink, 12, 2.6],
          ['dotsPaper', C.paper, 12, 2.4],
          ['dotsGold', C.gold, 10, 2.6],
        ] as const
      ).map(([id, col, s, r]) => (
        <pattern key={id} id={id} width={s} height={s} patternUnits="userSpaceOnUse" patternTransform="rotate(22)">
          <circle cx={s / 2} cy={s / 2} r={r} fill={col} />
        </pattern>
      ))}
    </defs>
  </svg>
);
