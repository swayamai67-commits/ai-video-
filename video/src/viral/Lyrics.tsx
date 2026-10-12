import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from './config';
import {clamp, ease, noise, prog, useT} from './lib';
import {Lockup, PHRASES, Slam, Word, fitSize, look, lockupHeight} from './text';

export const wid = (pid: number, k: number) => PHRASES[pid].words[k].i;
export const wtime = (pid: number, k: number) => PHRASES[pid].words[k].s;

type Block = {ids: [number, number]; mode: 'lockup' | 'slam'; y: number; per?: number; maxSize?: number; color?: string; dim?: string; context?: boolean; width?: number; x?: number; active?: string};

// Which phrases appear how. Phrases not listed are drawn by their scene.
const BLOCKS: Block[] = [
  {ids: [2, 9], mode: 'lockup', y: 1170, per: 2, maxSize: 230},
  {ids: [10, 19], mode: 'slam', y: 1330},
  {ids: [20, 21], mode: 'lockup', y: 1210, per: 2, maxSize: 240},
  {ids: [23, 23], mode: 'lockup', y: 1440, per: 3, maxSize: 110, color: C.ink, dim: 'rgba(10,10,10,0.18)'},
  {ids: [24, 25], mode: 'lockup', y: 1200, per: 2, maxSize: 240},
  {ids: [26, 26], mode: 'lockup', y: 1230, per: 3, maxSize: 200},
  {ids: [27, 27], mode: 'lockup', y: 1230, per: 3, maxSize: 200},
  {ids: [28, 29], mode: 'slam', y: 1360},
  {ids: [31, 31], mode: 'lockup', y: 1430, per: 3, maxSize: 110},
  {ids: [34, 42], mode: 'lockup', y: 1040, per: 2, maxSize: 200},
  {ids: [43, 49], mode: 'slam', y: 1360},
  {ids: [51, 56], mode: 'lockup', y: 1180, per: 2, maxSize: 230},
  {ids: [57, 68], mode: 'slam', y: 1360},
  {ids: [69, 69], mode: 'lockup', y: 1260, per: 3, maxSize: 150, color: C.ink, dim: 'rgba(10,10,10,0.15)'},
  {ids: [70, 70], mode: 'lockup', y: 1260, per: 3, maxSize: 150, color: C.ink, dim: 'rgba(10,10,10,0.15)'},
  {ids: [71, 71], mode: 'lockup', y: 1260, per: 3, maxSize: 150, color: C.ink, dim: 'rgba(10,10,10,0.15)'},
  {ids: [72, 72], mode: 'lockup', y: 1200, per: 2, maxSize: 210},
  {ids: [73, 78], mode: 'lockup', y: 1200, per: 2, maxSize: 230},
  {ids: [79, 86], mode: 'lockup', y: 1150, per: 2, maxSize: 240},
];

/** Words drawn by scenes instead (hero moments). */
export const SKIP = new Set<number>([wid(9, 6), wid(82, 6), wid(84, 6), wid(86, 6), wid(70, 5)]);

/** Meaning-driven word treatments for SLAM mode. */
const slamStyle = (w: Word, t: number): React.CSSProperties | undefined => {
  const dt = t - w.s;
  switch (w.i) {
    case wid(13, 2): // kalla: alone
      return {fontSize: 70, letterSpacing: 6, transform: 'none', filter: 'none', top: 1330};
    case wid(14, 3): // putthiyan raahan: upside down roads
    case wid(14, 4):
      return {transform: `rotate(${180 * ease.outBack(clamp(dt / 0.25), 1.4)}deg)`};
    case wid(16, 2): // ghisda: dragging smear
      return {transform: `scaleX(${1 + 0.9 * ease.outCubic(clamp(dt / 0.35))}) skewX(-18deg)`, textShadow: Array.from({length: 8}).map((_, k) => `${-(k + 1) * 26}px 0 0 rgba(243,238,230,${0.35 - k * 0.04})`).join(','), filter: 'blur(0.6px)'};
    case wid(17, 3): // neeli chhatt: rising into blue sky
    case wid(17, 4):
      return {color: C.sky, transform: `translateY(${-ease.outCubic(clamp(dt / 0.6)) * 260}px)`, textShadow: `0 0 60px ${C.sky}`};
    case wid(18, 2): // kaale: black ink
      return {color: C.ink, WebkitTextStroke: `3px ${C.bone}`};
    case wid(19, 4): // laaliyan: blush
      return {color: C.red, textShadow: `0 0 50px ${C.red}`};
    case wid(29, 1): // chauda: broad chest
      return {transform: `scale(0.72) scaleX(${1 + 0.38 * ease.outBack(clamp(dt / 0.3))})`};
    case wid(10, 4): // phatt
      return {color: C.red, transform: `scale(${1.15 + noise(t * 40) * 0.05}) rotate(${noise(t * 30, 2) * 4}deg)`};
    case wid(49, 4): // Lambo: chrome
      return {
        background: 'linear-gradient(180deg, #fff 0%, #9aa3ad 45%, #2a2f36 52%, #c9d1da 70%, #fff 100%)',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        transform: `skewX(-12deg) translateX(${(1 - ease.outExpo(clamp(dt / 0.3))) * 600}px)`,
        filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.5))',
      };
    case wid(48, 0): // hand up
    case wid(48, 1):
      return {color: C.red};
    case wid(66, 4): // phaad: breaking
      return {color: C.bone, transform: `translate(${noise(t * 60) * 14}px, ${noise(t * 55, 3) * 14}px)`};
  }
  return undefined;
};

const lockFor = (b: Block, t: number) => {
  for (let id = b.ids[0]; id <= b.ids[1]; id++) {
    const p = PHRASES[id];
    const next = PHRASES[id + 1];
    const end = Math.min(p.end + 0.7, next ? next.start - 0.05 : p.end + 0.7);
    if (t >= p.start - 0.2 && t < end) return {p, end};
  }
  return null;
};

/** Moments where a scene owns the screen and the lyric layer steps aside. */
const MUTE: [number, number][] = [
  [wtime(9, 6) - 0.06, 62.54],
  [wtime(50, 0) - 0.06, 135.98],
  ...[82, 84, 86].map((pid) => [wtime(pid, 6) - 0.06, wtime(pid, 6) + 0.62] as [number, number]),
];

export const LyricLayer: React.FC = () => {
  const t = useT();
  const out: React.ReactNode[] = [];
  if (MUTE.some(([a, b]) => t >= a && t < b)) return null;
  for (const b of BLOCKS) {
    const hit = lockFor(b, t);
    if (!hit) continue;
    const words = hit.p.words.filter((w) => !SKIP.has(w.i));
    // keep long lockups out of the Reels caption zone (bottom ~400 px)
    const y = b.mode === 'lockup' ? Math.min(b.y, 1500 - lockupHeight(words, b.width, b.per, 14, b.maxSize)) : b.y;
    if (b.mode === 'lockup')
      out.push(
        <Lockup key={`l${hit.p.id}`} words={words} y={y} per={b.per} maxSize={b.maxSize} color={b.color} dim={b.dim} x={b.x} width={b.width} exitAt={hit.end} shadow={b.color !== C.ink} />,
      );
    else out.push(<Slam key={`s${hit.p.id}`} words={words} y={b.y} style={slamStyle} />);
  }
  return <AbsoluteFill style={{pointerEvents: 'none'}}>{out}</AbsoluteFill>;
};

/** Small helper for scenes: show phrase text in mono as a caption. */
export const Caption: React.FC<{pid: number; y: number; color?: string}> = ({pid, y, color = C.bone}) => {
  const t = useT();
  const p = PHRASES[pid];
  const vis = p.words.filter((w) => t >= w.s - 0.04);
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: y, fontFamily: F.mono, fontSize: 34, color, letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center'}}>
      {vis.map((w) => look(w).txt).join(' ')}
    </div>
  );
};
export {prog};
