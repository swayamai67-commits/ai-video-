import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, FPS} from './config';
import {noise, pulse, rnd, since, useT} from './lib';

/** Camera: zoom punch + shake + rotation wobble around children. */
export const Camera: React.FC<{
  children: React.ReactNode;
  punch?: number; // zoom per downbeat
  shake?: number; // px per kick
  drift?: number; // slow push-in per second
  from?: number;
  extra?: number; // external impulse 0..1
  rot?: number;
}> = ({children, punch = 0, shake = 0, drift = 0, from = 0, extra = 0, rot = 0}) => {
  const t = useT();
  const p = pulse('downbeats', t, 0.16) * punch + extra * 0.12;
  const k = pulse('kicks', t, 0.09) * shake + extra * 40;
  const s = 1 + p + Math.max(0, t - from) * drift;
  const x = noise(t * 31, 1) * k;
  const y = noise(t * 29, 2) * k;
  const r = noise(t * 23, 3) * (k * 0.02 + rot);
  return (
    <AbsoluteFill style={{transform: `translate(${x}px, ${y}px) scale(${s}) rotate(${r}deg)`}}>{children}</AbsoluteFill>
  );
};

/** Film grain from the tiled grain PNGs (changes every frame). */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.16}) => {
  const t = useT();
  const i = (Math.floor(t * FPS) % 8) + 1;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile(`grain/g${i}.png`)})`,
        backgroundSize: '360px 360px',
        opacity,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  );
};

export const Scanlines: React.FC<{opacity?: number}> = ({opacity = 0.12}) => (
  <AbsoluteFill
    style={{
      background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.9) 0 2px, transparent 2px 5px)',
      opacity,
      mixBlendMode: 'multiply',
    }}
  />
);

export const Vignette: React.FC<{amount?: number}> = ({amount = 0.6}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,${amount}) 100%)`}} />
);

/** Full-frame flash at given times (white, red or invert). */
export const Flash: React.FC<{at: number[]; color?: string; dur?: number; invert?: boolean}> = ({at, color = '#fff', dur = 0.12, invert}) => {
  const t = useT();
  let a = 0;
  for (const x of at) if (t >= x && t < x + dur) a = Math.max(a, 1 - (t - x) / dur);
  if (a <= 0) return null;
  if (invert) return <AbsoluteFill style={{backdropFilter: 'invert(1)', opacity: a > 0.5 ? 1 : 0}} />;
  return <AbsoluteFill style={{background: color, opacity: a, mixBlendMode: color === '#fff' ? 'screen' : 'normal'}} />;
};

/** Strobe: alternates frames on/off while active. */
export const strobeOn = (t: number, a: number, b: number, every = 2) =>
  t >= a && t < b && Math.floor((t - a) * FPS) % every === 0;

/** RGB split of an image layer (three tinted copies, screen blended). */
export const RGBSplit: React.FC<{amount: number; children: (filter: string) => React.ReactNode; angle?: number}> = ({amount, children, angle = 0}) => {
  if (amount < 0.5) return <>{children('none')}</>;
  const dx = Math.cos(angle) * amount;
  const dy = Math.sin(angle) * amount;
  const ch = [
    {id: 'vr', m: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0', x: -dx, y: -dy},
    {id: 'vg', m: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0', x: 0, y: 0},
    {id: 'vb', m: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0', x: dx, y: dy},
  ];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg width="0" height="0" style={{position: 'absolute'}}>
        {ch.map((c) => (
          <filter key={c.id} id={c.id} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={c.m} />
          </filter>
        ))}
      </svg>
      {ch.map((c) => (
        <AbsoluteFill key={c.id} style={{transform: `translate(${c.x}px, ${c.y}px)`, mixBlendMode: 'screen'}}>
          {children(`url(#${c.id})`)}
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

/** Horizontal glitch slices: shifts bands of the layer for a few frames. */
export const Slices: React.FC<{amount: number; seed: number; children: React.ReactNode}> = ({amount, seed, children}) => {
  const t = useT();
  if (amount < 0.05) return <>{children}</>;
  const f = Math.floor(t * FPS);
  const bands = 7;
  return (
    <AbsoluteFill>
      {Array.from({length: bands}).map((_, i) => {
        const y0 = (i / bands) * 100;
        const y1 = ((i + 1) / bands) * 100;
        const off = (rnd(seed + f * 13 + i * 7) - 0.5) * 160 * amount * (rnd(seed + i * 3 + f) > 0.4 ? 1 : 0);
        return (
          <AbsoluteFill key={i} style={{clipPath: `polygon(0 ${y0}%, 100% ${y0}%, 100% ${y1}%, 0 ${y1}%)`, transform: `translateX(${off}px)`}}>
            {children}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

/** Ana Tudor style CSS halftone: dot size follows luminance. Output is black dots on white. */
export const Halftone: React.FC<{children: React.ReactNode; cell?: number; contrast?: number; bright?: number}> = ({children, cell = 14, contrast = 18, bright = 0.8}) => (
  <AbsoluteFill style={{filter: `contrast(${contrast})`, background: '#fff', isolation: 'isolate'}}>
    <AbsoluteFill style={{filter: `grayscale(1) blur(1.5px) brightness(${bright}) contrast(1.2)`}}>{children}</AbsoluteFill>
    <AbsoluteFill
      style={{
        background: `radial-gradient(closest-side, #000, #fff) 0 0/${cell}px ${cell}px`,
        mixBlendMode: 'screen',
      }}
    />
  </AbsoluteFill>
);

/** Paper background with fibres and print noise. */
export const Paper: React.FC<{color?: string}> = ({color = C.paper}) => (
  <AbsoluteFill style={{background: color}}>
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.5), transparent 60%), radial-gradient(ellipse at 80% 90%, rgba(120,90,50,0.18), transparent 60%)',
      }}
    />
    <Grain opacity={0.35} />
  </AbsoluteFill>
);

export const kickShake = (t: number, amt: number) => pulse('kicks', t, 0.08) * amt;
export const sinceKick = (t: number) => since('kicks', t);
