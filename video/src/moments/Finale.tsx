import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, goldFoil} from '../theme';
import {ease, mix, prog, springAt, useFormat, useT, windowed} from '../lib/time';
import {JhumarRing} from './Verse';

// three "अश्के" hits, each bigger, inside a turning jhumar ring
export const ASHKE_HITS = [192.72, 196.3, 199.88];

export const Finale: React.FC = () => {
  const t = useT();
  if (t < 192.6 || t > 202.6) return null;
  const k = t >= ASHKE_HITS[2] ? 2 : t >= ASHKE_HITS[1] ? 1 : 0;
  const t0 = ASHKE_HITS[k];
  if (t < ASHKE_HITS[0]) return null;
  const sizes = [210, 320, 520];
  const centers: [number, number][] = [[1420, 470], [960, 480], [960, 500]];
  const [cx, cy] = centers[k];
  const s = springAt(t - t0, 2.1, 0.34);
  const hold = k === 2 ? 1 - ease.inCubic(prog(t, 201.6, 202.5)) : 1 - ease.inCubic(prog(t, ASHKE_HITS[k + 1] - 0.25, ASHKE_HITS[k + 1]));
  const dim = k === 2 ? windowed(t, ASHKE_HITS[2], 202.5, 0.15, 0.8) * 0.55 : 0.3;
  const size = sizes[k];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(55% 55% at ${(cx / 1920) * 100}% ${(cy / 1080) * 100}%, rgba(110,31,36,0.6), rgba(8,7,6,0.2) 70%)`,
        opacity: dim * hold}} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <JhumarRing cx={cx} cy={cy} r={size * 0.95} n={k === 2 ? 36 : 24} t={t} t0={t0} alpha={hold} />
      </svg>
      <div style={{position: 'absolute', left: cx - 900, width: 1800, top: cy - size * 0.8, textAlign: 'center', opacity: hold,
        transform: `scale(${mix(k === 2 ? 1.6 : 0.7, 1, s)})`}}>
        <span style={{fontFamily: F.display, fontWeight: 800, fontSize: size, lineHeight: 1.3, ...goldFoil(30 + (t - t0) * 40),
          filter: 'drop-shadow(0 12px 40px rgba(0,0,0,0.55))'}}>अश्के</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- coda + credits, the programme closes
export const Coda: React.FC = () => {
  const t = useT();
  if (t < 202.0) return null;
  const item = (a: number) => ease.outCubic(prog(t, a, a + 0.9));
  const out = ease.inCubic(prog(t, 215.6, 216.6));
  const frame = ease.inOutCubic(prog(t, 211.0, 213.0));
  const per = 2 * (900 + 520);
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <AbsoluteFill style={{background: 'radial-gradient(60% 60% at 50% 50%, rgba(8,7,6,0.55), rgba(8,7,6,0.15))', opacity: item(202.2)}} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={510} y={280} width={900} height={520} fill="none" stroke={C.gold} strokeWidth={2} strokeDasharray={per} strokeDashoffset={per * (1 - frame)} />
        <rect x={524} y={294} width={872} height={492} fill="none" stroke={C.gold} strokeOpacity={0.5} strokeWidth={1} strokeDasharray={per} strokeDashoffset={-per * (1 - frame)} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 340, textAlign: 'center', color: C.bone}}>
        <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 120, lineHeight: 1.3, opacity: item(202.4), ...goldFoil(50 + (t - 202) * 6)}}>अश्के</div>
        <div style={{fontFamily: F.latin, fontWeight: 600, fontSize: 30, letterSpacing: `${mix(1.2, 0.8, item(203.2))}em`, opacity: item(203.2)}}>ASHKE</div>
        <div style={{width: 160 * item(204), height: 1.5, background: C.gold, margin: '24px auto'}} />
        <div style={{fontFamily: F.latin, fontWeight: 500, fontSize: 30, letterSpacing: '0.32em', opacity: item(204.6)}}>KARAN AUJLA × MXRCI</div>
        <div style={{fontFamily: F.latin, fontStyle: 'italic', fontSize: 26, marginTop: 8, opacity: item(205.6), color: C.goldHi}}>from the album Aujla SZN 1</div>
        <div style={{fontFamily: F.mono, fontSize: 13, letterSpacing: '0.3em', marginTop: 36, opacity: item(207.4), color: C.boneDim}}>
          LYRIC VIDEO · FAN EDIT · FOOTAGE FROM THE OFFICIAL MUSIC VIDEO
        </div>
        <div style={{fontFamily: F.latin, fontStyle: 'italic', fontSize: 44, marginTop: 30, opacity: item(213.0), color: C.bone}}>fin.</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- reel: lock-up at the end, fade out
export const ReelOutro: React.FC = () => {
  const t = useT();
  const {kind} = useFormat();
  if (kind !== 'reel' || t < 89.0) return null;
  const a = ease.outCubic(prog(t, 89.1, 89.9));
  const black = ease.inCubic(prog(t, 91.6, 92.3));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,7,6,0.7) 0%, rgba(8,7,6,0.35) 30%, rgba(8,7,6,0) 45%)', opacity: a}} />
      <div style={{position: 'absolute', left: 72, top: 300, opacity: a, transform: `translateY(${(1 - a) * 20}px)`}}>
        <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 150, lineHeight: 1.3, ...goldFoil(30 + (t - 89) * 30), filter: 'drop-shadow(0 8px 30px rgba(0,0,0,.5))'}}>अश्के</div>
        <div style={{width: 300 * a, height: 2, background: C.gold, margin: '6px 0 18px'}} />
        <div style={{fontFamily: F.latin, fontWeight: 600, fontSize: 34, letterSpacing: '0.34em', color: C.bone}}>KARAN AUJLA × MXRCI</div>
        <div style={{fontFamily: F.latin, fontStyle: 'italic', fontSize: 32, color: C.goldHi, marginTop: 6}}>Aujla SZN 1</div>
      </div>
      <AbsoluteFill style={{background: C.night, opacity: black}} />
    </AbsoluteFill>
  );
};

// reel: opening hook, the seal is already pressed when the reel starts
export const ReelOpen: React.FC = () => {
  const t = useT();
  const {kind} = useFormat();
  if (kind !== 'reel' || t > 48.6) return null;
  const a = 1 - ease.inCubic(prog(t, 48.0, 48.5));
  return (
    <AbsoluteFill style={{opacity: a}}>
      <div style={{position: 'absolute', left: 72, top: 300}}>
        <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.4em', color: C.gold}}>KARAN AUJLA × MXRCI</div>
        <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 130, lineHeight: 1.3, ...goldFoil(40 + (t - 47) * 30)}}>अश्के</div>
      </div>
    </AbsoluteFill>
  );
};
