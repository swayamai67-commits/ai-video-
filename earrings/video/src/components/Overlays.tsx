import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {rng} from '../lib/time';

/** Animated film grain, refreshed at 30 Hz, tiled at 512 CSS px (1:1 pixels at 2x render scale). */
export const Grain: React.FC<{opacity: number}> = ({opacity}) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / 2);
  const r = rng(step * 7919 + 13);
  const k = step % 8;
  const ox = Math.floor(r() * 512);
  const oy = Math.floor(r() * 512);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile(`tex/grain${k}.png`)})`,
        backgroundSize: '512px 512px',
        backgroundPosition: `${ox}px ${oy}px`,
        mixBlendMode: 'overlay',
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.55}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: 'none',
    }}
  />
);

/** Warm light leak that sweeps across the frame. p = 0..1 progress, a = alpha. */
export const LightLeak: React.FC<{p: number; a: number; hue?: 'warm' | 'rose'}> = ({p, a, hue = 'warm'}) => {
  if (a <= 0.001) return null;
  const x = -40 + p * 180;
  const c1 = hue === 'warm' ? '255, 176, 92' : '255, 130, 150';
  const c2 = hue === 'warm' ? '255, 226, 160' : '255, 200, 190';
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 60% 45% at ${x}% 35%, rgba(${c2}, ${0.75 * a}) 0%, rgba(${c1}, ${0.45 * a}) 35%, rgba(${c1}, 0) 70%)`,
        mixBlendMode: 'screen',
        pointerEvents: 'none',
      }}
    />
  );
};

export const SheetImg: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <Img src={staticFile('tex/sheet.jpg')} style={{position: 'absolute', width: 1080, height: 1920, objectFit: 'cover', ...style}} />
);
