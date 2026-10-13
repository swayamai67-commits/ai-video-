import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, T, W, H} from '../theme';
import {F} from '../fonts';
import {ease, inv, lerp, prog, rnd} from '../lib/time';
import {BeeFlight} from '../art/Bee';

/** The swarm that wipes the tunnel into the field (rides the wipe edge in World). */
export const Swarm: React.FC<{t: number}> = ({t}) => {
  if (t < T.wipeA - 0.1 || t > T.wipeB + 0.35) return null;
  const bees = [
    {y: 200, s: 3.6, blur: 7, lag: 0.0},
    {y: 560, s: 5.2, blur: 10, lag: 0.04},
    {y: 900, s: 3.0, blur: 5, lag: -0.03},
    {y: 380, s: 1.6, blur: 0, lag: 0.08},
    {y: 760, s: 1.3, blur: 0, lag: 0.1},
    {y: 90, s: 1.1, blur: 0, lag: 0.12},
    {y: 1010, s: 1.5, blur: 1, lag: 0.06},
    {y: 640, s: 0.9, blur: 0, lag: 0.15},
  ];
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {bees.map((b, i) => (
        <BeeFlight
          key={i}
          t={t}
          t0={T.wipeA - 0.1 + b.lag}
          t1={T.wipeB + 0.15 + b.lag}
          seed={60 + i}
          size={b.s}
          blur={b.blur}
          trail={0.25}
          dash="22 16"
          trailWidth={2.5}
          path={(s) => {
            const u = ease.inOutCubic(inv(T.wipeA - 0.1 + b.lag, T.wipeB + 0.15 + b.lag, s));
            return {x: lerp(-500, W + 600, u), y: b.y + Math.sin(u * 6 + i) * 40};
          }}
        />
      ))}
    </svg>
  );
};

/** Dusk falls after "again": the grade slides from gold to violet, stars, and the credit. */
export const Dusk: React.FC<{t: number}> = ({t}) => {
  if (t < T.dusk) return null;
  const d = ease.inOutCubic(inv(T.dusk, 11.45, t));
  const stars = prog(t, 10.85, 11.3);
  const end = prog(t, 11.5, T.end, ease.inCubic);
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.dusk} 0%, #7A3D6E 55%, ${C.rose} 100%)`, mixBlendMode: 'multiply', opacity: d * 0.82}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 40% at 50% 100%, rgba(232,106,142,0.45), rgba(0,0,0,0))`, mixBlendMode: 'screen', opacity: d}} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 36}).map((_, i) => {
          const x = rnd(i + 200) * W;
          const y = rnd(i + 300) * H * 0.45;
          const tw = 0.5 + 0.5 * Math.sin(t * 6 + i * 1.7);
          return <circle key={i} cx={x} cy={y} r={1.5 + rnd(i + 400) * 2.5} fill={C.cream} opacity={stars * (0.4 + 0.6 * tw) * inv(0, 0.1, rnd(i + 500))} />;
        })}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 72,
          bottom: 56,
          fontFamily: F.mono,
          fontWeight: 700,
          fontSize: 22,
          color: C.cream,
          letterSpacing: `${lerp(0.5, 0.18, prog(t, T.credit, T.credit + 0.4))}em`,
          opacity: prog(t, T.credit, T.credit + 0.25),
          lineHeight: 1.6,
          textTransform: 'uppercase',
        }}
      >
        <div>Tyler, The Creator — “See You Again” feat. Kali Uchis</div>
        <div style={{opacity: 0.7, fontWeight: 400}}>Flower Boy · 2017</div>
      </div>
      <AbsoluteFill style={{background: C.black, opacity: end * 0.85}} />
    </>
  );
};
