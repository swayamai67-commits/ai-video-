import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, T, W, H} from '../theme';
import {F} from '../fonts';
import {ease, inv, lerp, noise1, prog, rnd, spring, wobble} from '../lib/time';
import {w} from '../lib/words';
import {CoverCard} from '../art/Cover';
import {Profiles} from '../art/Profiles';
import {BeeFlight} from '../art/Bee';
import {RiseWord} from '../art/Type';
import {chroma, SunRays, kickEnv} from '../fx/fx';

import {L as TUNNEL_L} from './Tunnel';

/** Card state shared with the tunnel so the hand-off is continuous. */
export const kissCard = (t: number) => {
  const settle = spring(t, 0.02, 10, 6.5);
  const push = prog(t, T.push, T.tunnel, ease.inOutCubic);
  const size = lerp(lerp(760, 640, settle), TUNNEL_L, Math.pow(push, 1.15));
  const rot = lerp(lerp(-11, -3, settle), 0, push);
  const tiltY = noise1(t * 0.9, 3) * 6 * (1 - push);
  const tiltX = noise1(t * 0.8, 7) * 4 * (1 - push);
  return {size, rot, tiltX, tiltY, push};
};

export const KissScene: React.FC<{t: number}> = ({t}) => {
  if (t > T.tunnel + 0.02) return null;
  const card = kissCard(t);

  // profiles: lean in (accelerating, like a held breath), touch on "kiss?", then the camera goes through them
  const approach = 1 - ease.inCubic(inv(T.kissIn, T.kiss, t));
  const bump = -9 * wobble(t, T.kiss, 26, 7);
  const part = ease.inOutCubic(inv(T.push, T.tunnel - 0.25, t));
  const dx = t < T.kissIn ? 1600 : approach * 1500 + bump + part * 1250;
  const profScale = lerp(1, 2.4, part);

  // iris: the sun opens the film
  const iris = ease.outExpo(inv(0, T.irisEnd, t)) * 1350;

  // petals burst from the touch point
  const petals = t > T.kiss && t < T.kiss + 0.9;

  const kiss = w(4);
  const kissIn = ease.outExpo(inv(kiss.start - 0.02, kiss.start + 0.1, t));
  const kissOut = 1 - prog(t, T.push - 0.05, T.push + 0.25, ease.inCubic);

  const lineA = [0, 1, 2, 3].map(w);
  const lineB = [5, 6, 7, 8, 9].map(w);
  const fadeA = 1 - prog(t, T.push - 0.1, T.push + 0.15);
  const fadeB = 1 - prog(t, T.tunnel - 0.1, T.tunnel + 0.01);

  return (
    <AbsoluteFill>
      {/* golden-hour backdrop */}
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 52%, ${C.sun} 0%, ${C.sky} 42%, ${C.ember} 100%)`}} />
      <SunRays t={t} opacity={0.13} />

      {/* the cover */}
      <AbsoluteFill style={{perspective: 1600}}>
        <div
          style={{
            position: 'absolute',
            left: W / 2,
            top: H / 2,
            transform: `rotateX(${card.tiltX}deg) rotateY(${card.tiltY}deg) rotate(${card.rot}deg) scale(${1 + kickEnv(t) * 0.006})`,
          }}
        >
          <CoverCard
            size={card.size}
            border={0.018 * (1 - card.push)}
            shadow={`0 ${30 * (1 - card.push)}px ${80 * (1 - card.push)}px rgba(60,10,0,${0.45 * (1 - card.push)})`}
            tylerShift={[card.tiltY * 0.8, -card.tiltX * 0.6]}
          />
        </div>
      </AbsoluteFill>

      {/* bees crossing while he asks */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <BeeFlight t={t} t0={0.15} t1={1.0} seed={1} size={0.9}
          path={(s) => {
            const u = inv(0.15, 1.0, s);
            return {x: lerp(380, 1560, u), y: 250 - Math.sin(u * Math.PI) * 120 + Math.sin(u * 9) * 18};
          }} />
        <BeeFlight t={t} t0={0.35} t1={1.25} seed={2} size={0.7}
          path={(s) => {
            const u = inv(0.35, 1.25, s);
            return {x: lerp(1600, 300, u), y: 880 + Math.sin(u * 7) * 26 - u * 40};
          }} />
      </svg>

      {/* the two profiles: their negative space is the window onto the cover */}
      {t > T.kissIn - 0.02 && (
        <AbsoluteFill style={{transform: `scale(${profScale})`, transformOrigin: '960px 566px'}}>
          <Profiles dxBoy={dx} dxGirl={dx} t={t} lips={1} />
        </AbsoluteFill>
      )}

      {/* petals + shock ring from the touch */}
      {petals && (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <circle cx={960} cy={566} r={20 + ease.outCubic(inv(T.kiss, T.kiss + 0.5, t)) * 420} fill="none" stroke={C.cream} strokeWidth={6 * (1 - inv(T.kiss, T.kiss + 0.5, t))} opacity={0.9} />
          {Array.from({length: 16}).map((_, i) => {
            const d = t - T.kiss;
            const a = (i / 16) * Math.PI * 2 + rnd(i) * 0.4;
            const v = 700 + rnd(i + 20) * 600;
            const x = 960 + Math.cos(a) * v * d * Math.exp(-d * 1.6);
            const y = 566 + Math.sin(a) * v * d * Math.exp(-d * 1.6) + 900 * d * d;
            const o = 1 - inv(0.5, 0.9, d);
            return (
              <ellipse key={i} cx={x} cy={y} rx={9} ry={24} fill={i % 3 ? C.sun : C.cream} opacity={o}
                transform={`rotate(${(a * 180) / Math.PI + 90 + d * 540 * (rnd(i + 3) - 0.5)} ${x} ${y})`} />
            );
          })}
        </svg>
      )}

      {/* "Can I get a" rides on top of everything, connective and soft */}
      <div
        style={{
          position: 'absolute',
          left: 112,
          top: 150,
          fontFamily: F.serif,
          fontStyle: 'italic',
          fontSize: 112,
          lineHeight: 1,
          color: C.cream,
          opacity: fadeA,
          textShadow: '0 6px 30px rgba(70,15,0,0.45)',
          transform: `translateY(${-fadeA * 0 - (1 - fadeA) * 40}px)`,
          filter: fadeA < 1 ? `blur(${(1 - fadeA) * 10}px)` : undefined,
        }}
      >
        {lineA.map((x) => (
          <RiseWord key={x.i} t={t} start={x.start} end={x.end} text={x.word} underline={C.cream} />
        ))}
      </div>

      {/* KISS? lands with the touch */}
      {t > kiss.start - 0.05 && (
        <div
          style={{
            position: 'absolute',
            left: 1150,
            top: 640,
            fontFamily: F.anton,
            fontSize: 330,
            lineHeight: 0.9,
            color: C.cream,
            letterSpacing: '0.01em',
            opacity: kissOut,
            transform: `scale(${lerp(1.5, 1, kissIn)}) rotate(${lerp(-8, -4, kissIn)}deg) translateY(${(1 - kissOut) * -80}px)`,
            transformOrigin: '30% 60%',
            textShadow: [
              chroma(t),
              ...Array.from({length: 9}).map((_, i) => `${(i + 1) * 1.6}px ${(i + 1) * 1.6}px 0 ${C.lipstick}`),
              '18px 22px 40px rgba(40,0,0,0.5)',
            ]
              .filter(Boolean)
              .join(', '),
          }}
        >
          KISS?
        </div>
      )}

      {/* "And can you make it": the bargain, while the camera goes through the vase */}
      {t > T.push - 0.1 && (
        <div
          style={{
            position: 'absolute',
            left: 112,
            top: 800,
            fontFamily: F.serif,
            fontStyle: 'italic',
            fontSize: 104,
            lineHeight: 1,
            color: C.cream,
            textShadow: '0 4px 24px rgba(40,10,0,0.7), 0 0 2px rgba(40,10,0,0.6)',
            opacity: fadeB,
          }}
        >
          {lineB.map((x) => (
            <RiseWord key={x.i} t={t} start={x.start} end={x.end} text={x.word} underline={C.cream} />
          ))}
        </div>
      )}

      {/* the sun iris opening */}
      {iris < 1340 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0) ${iris}px, ${C.cream} ${iris + 1}px, ${C.cream} ${iris + 10}px, ${C.black} ${iris + 12}px)`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
