import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, goldFoil} from '../theme';
import {ease, mix, prog, rnd, springAt, useFormat, useT, windowed} from '../lib/time';

const useCenter = (full: [number, number], reel: [number, number]) => {
  const {kind} = useFormat();
  return kind === 'full' ? full : reel;
};

// ---------------------------------------------------------------- jhumar ring of gold dots
export const JhumarRing: React.FC<{cx: number; cy: number; r: number; n?: number; t: number; t0: number; alpha: number}> = ({cx, cy, r, n = 24, t, t0, alpha}) => {
  const grow = ease.outExpo(prog(t, t0, t0 + 0.5));
  return (
    <g opacity={alpha}>
      {Array.from({length: n}).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + (t - t0) * 0.9;
        const rr = r * mix(0.55, 1, grow);
        return <circle key={i} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} r={i % 3 === 0 ? 5 : 2.6} fill={i % 3 === 0 ? C.goldHi : C.gold} />;
      })}
      <circle cx={cx} cy={cy} r={r * mix(0.55, 1, grow) * 1.12} fill="none" stroke={C.gold} strokeOpacity={0.35} strokeWidth={1} />
    </g>
  );
};

// ---------------------------------------------------------------- अश्के pop in verse 1 → becomes the reticle
const RET_FULL: [number, number] = [1560, 540];
const RET_REEL: [number, number] = [700, 1000];

export const HookPop: React.FC = () => {
  const t = useT();
  const {W, H, kind} = useFormat();
  const [cx, cy] = useCenter(RET_FULL, RET_REEL);
  if (t < 61.85 || t > 62.95) return null;
  const a = windowed(t, 61.9, 62.9, 0.12, 0.3);
  const s = springAt(t - 61.92, 2.4, 0.38);
  const size = kind === 'full' ? 200 : 210;
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <JhumarRing cx={cx} cy={cy} r={kind === 'full' ? 190 : 180} t={t} t0={61.92} alpha={a} />
      </svg>
      <div style={{position: 'absolute', left: cx - 400, width: 800, top: cy - size * 0.78, textAlign: 'center', opacity: a,
        transform: `scale(${mix(0.6, 1, s)})`}}>
        <span style={{fontFamily: F.display, fontWeight: 800, fontSize: size, lineHeight: 1.3, ...goldFoil(40 + (t - 61.9) * 60),
          filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.5))'}}>अश्के</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- gun reticle → clay burst on "फट"
export const SHOT_TIME = 63.96;

export const Reticle: React.FC = () => {
  const t = useT();
  const {W, H, kind} = useFormat();
  const [cx0, cy0] = useCenter(RET_FULL, RET_REEL);
  if (t < 62.4 || t > 65.3) return null;
  const R = kind === 'full' ? 150 : 140;
  const on = ease.outCubic(prog(t, 62.45, 62.95));
  const tighten = ease.inOutCubic(prog(t, 62.5, SHOT_TIME));
  const drift = (1 - tighten) * 1;
  const cx = cx0 + 22 * Math.sin(t * 3.1) * drift, cy = cy0 + 14 * Math.cos(t * 2.3) * drift;
  const r = R * mix(1.55, 1, tighten);
  const shot = t >= SHOT_TIME;
  const after = t - SHOT_TIME;
  const retA = shot ? 1 - ease.outCubic(prog(after, 0, 0.25)) : on;
  const flash = shot ? Math.exp(-after * 16) : 0;
  const pull = ease.outCubic(prog(t, 63.1, 63.4)) * (shot ? 0 : 1);
  const word = shot || t >= 63.66 ? springAt(t - 63.66, 2.0, 0.3) : 0;
  const wordOut = ease.inCubic(prog(t, 64.8, 65.3));
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <g opacity={retA} stroke={C.goldHi} fill="none" style={{filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.6))'}}>
          <circle cx={cx} cy={cy} r={r} strokeWidth={2} />
          <circle cx={cx} cy={cy} r={r * 0.62} strokeWidth={1} strokeOpacity={0.6} strokeDasharray="4 10" transform={`rotate(${t * 40} ${cx} ${cy})`} />
          {[0, 90, 180, 270].map((d) => (
            <line key={d} x1={cx + Math.cos((d * Math.PI) / 180) * r * 0.25} y1={cy + Math.sin((d * Math.PI) / 180) * r * 0.25}
              x2={cx + Math.cos((d * Math.PI) / 180) * r * 1.35} y2={cy + Math.sin((d * Math.PI) / 180) * r * 1.35} strokeWidth={1.6} />
          ))}
          <circle cx={cx} cy={cy} r={3} fill={C.goldHi} />
        </g>
        {/* clay shards */}
        {shot && after < 1.6 && Array.from({length: 34}).map((_, i) => {
          const a = rnd(i * 3.1) * Math.PI * 2;
          const v = 380 + 700 * rnd(i * 7.7);
          const x = cx + Math.cos(a) * v * after;
          const y = cy + Math.sin(a) * v * after + 900 * after * after;
          const s = 6 + 14 * rnd(i * 1.3);
          const rot = (rnd(i) - 0.5) * 1400 * after;
          return (
            <polygon key={i} points={`0,${-s} ${s * 0.8},${s * 0.6} ${-s * 0.7},${s * 0.4}`} transform={`translate(${x},${y}) rotate(${rot})`}
              fill={i % 3 ? C.clay : '#E7A06E'} opacity={1 - prog(after, 0.6, 1.4)} />
          );
        })}
      </svg>
      <div style={{position: 'absolute', left: cx + r + 26, top: cy - 12, fontFamily: F.mono, fontSize: kind === 'full' ? 20 : 24,
        letterSpacing: '0.3em', color: C.goldHi, opacity: pull, textShadow: '0 2px 8px rgba(0,0,0,.7)',
        ...(kind === 'reel' ? {left: cx - 60, top: cy - r - 60} : {})}}>PULL!</div>
      {word > 0 ? (
        <div style={{position: 'absolute', left: cx - 400, width: 800, top: cy - (kind === 'full' ? 190 : 200), textAlign: 'center',
          opacity: 1 - wordOut, transform: `scale(${mix(1.45, 1, word)}) translateY(${-30 * wordOut}px)`}}>
          <span style={{fontFamily: F.display, fontWeight: 800, fontSize: kind === 'full' ? 250 : 260, lineHeight: 1.3, color: C.bone,
            WebkitTextStroke: `2px ${C.gold}`, textShadow: '0 10px 40px rgba(0,0,0,0.55)'}}>फट</span>
        </div>
      ) : null}
      <AbsoluteFill style={{background: '#FFF6E0', opacity: flash * 0.85}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- "नीली छत" sky wash · "काले" ink · "लालियां" blush
export const ColourBeats: React.FC = () => {
  const t = useT();
  if (t < 74.9 || t > 81.2) return null;
  const sky = windowed(t, 75.05, 77.0, 0.4, 0.5);
  const ink = windowed(t, 77.55, 78.7, 0.12, 0.4);
  const blush = windowed(t, 79.75, 81.1, 0.2, 0.6);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(110,165,230,0.75) 0%, rgba(110,165,230,0.25) 40%, rgba(110,165,230,0) 62%)',
        mixBlendMode: 'soft-light', opacity: sky}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(150,195,240,0.25) 0%, rgba(150,195,240,0) 45%)', opacity: sky}} />
      <AbsoluteFill style={{background: '#808080', mixBlendMode: 'saturation', opacity: ink}} />
      <AbsoluteFill style={{background: 'rgba(0,0,0,0.35)', opacity: ink}} />
      <AbsoluteFill style={{background: 'radial-gradient(70% 70% at 50% 45%, rgba(200,40,50,0.55), rgba(120,10,20,0.25))', mixBlendMode: 'soft-light', opacity: blush}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- "पिंडां आळियां": a Punjab village milestone in an English garden
export const Milestone: React.FC = () => {
  const t = useT();
  const {kind, W, H} = useFormat();
  if (t < 83.9 || t > 88.6) return null;
  const full = kind === 'full';
  const sc = full ? 1 : 0.85;
  const baseX = full ? 1560 : 190, groundY = full ? 930 : 1200;
  const rise = springAt(t - 84.0, 1.3, 0.55); // heavy stone: slow, damped
  const sink = ease.inCubic(prog(t, 87.95, 88.55));
  const nudge = Math.exp(-Math.max(0, t - 86.52) * 6) * Math.sin(Math.max(0, t - 86.52) * 30) * (t > 86.52 ? 1 : 0);
  const w = 240 * sc, h = 340 * sc;
  const y = groundY - h * rise + (h + 60) * sink;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: groundY, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: baseX - w / 2, top: y, width: w, height: h,
          transform: `rotate(${-2.5 + 2 * nudge}deg)`, transformOrigin: '50% 100%', filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.5))'}}>
          <svg width={w} height={h} viewBox="0 0 240 340">
            <defs>
              <linearGradient id="stone" x1="0" x2="1">
                <stop offset="0" stopColor="#d9d3c4" />
                <stop offset="0.45" stopColor="#f4f0e6" />
                <stop offset="1" stopColor="#bdb6a6" />
              </linearGradient>
              <linearGradient id="cap" x1="0" x2="1">
                <stop offset="0" stopColor="#d9a514" />
                <stop offset="0.45" stopColor="#f6c629" />
                <stop offset="1" stopColor="#c08f0d" />
              </linearGradient>
              <clipPath id="stoneShape"><path d="M0,340 L0,120 A120,120 0 0 1 240,120 L240,340 Z" /></clipPath>
            </defs>
            <g clipPath="url(#stoneShape)">
              <rect width={240} height={340} fill="url(#stone)" />
              <rect width={240} height={150} fill="url(#cap)" />
              <rect y={148} width={240} height={4} fill="rgba(0,0,0,0.15)" />
            </g>
            <text x={120} y={120} textAnchor="middle" fontFamily="Eczar" fontWeight={800} fontSize={62} fill={C.ink}>पिंड</text>
            <text x={120} y={262} textAnchor="middle" fontFamily="Eczar" fontWeight={800} fontSize={104} fill={C.ink}>०</text>
            <text x={120} y={306} textAnchor="middle" fontFamily="IBM Plex Mono" fontSize={20} letterSpacing={6} fill="#3a3530">KM</text>
          </svg>
        </div>
      </div>
      <div style={{position: 'absolute', left: Math.max(24, baseX - 220), width: 440, top: groundY - h - 64, textAlign: 'center',
        fontFamily: F.mono, fontSize: full ? 15 : 20, letterSpacing: '0.3em', color: C.bone,
        opacity: ease.outCubic(prog(t, 84.6, 85.2)) * (1 - sink), textShadow: '0 2px 8px rgba(0,0,0,.7)'}}>
        FROM THE VILLAGE
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- "Baby you so fire": embers
export const Embers: React.FC = () => {
  const t = useT();
  const {W, H} = useFormat();
  if (t < 98.3 || t > 102.2) return null;
  const a = windowed(t, 98.4, 102.1, 0.4, 0.8);
  return (
    <AbsoluteFill style={{opacity: a}}>
      <AbsoluteFill style={{background: 'radial-gradient(80% 60% at 50% 110%, rgba(255,110,30,0.35), rgba(255,110,30,0) 70%)', mixBlendMode: 'screen'}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {Array.from({length: 46}).map((_, i) => {
          const speed = 120 + 220 * rnd(i * 5.1);
          const life = (t - 98.3 + rnd(i) * 3) * speed;
          const x = rnd(i * 2.3) * W + 40 * Math.sin(t * (1 + rnd(i)) + i);
          const y = H + 20 - (life % (H + 60));
          const r = 1.5 + 3 * rnd(i * 9.9);
          return <circle key={i} cx={x} cy={y} r={r} fill={i % 4 ? '#FFB060' : '#FFE2A0'} style={{filter: `blur(${r > 3.5 ? 1.2 : 0.4}px)`}}
            opacity={0.5 + 0.5 * Math.sin(t * 6 + i)} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
