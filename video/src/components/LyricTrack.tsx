import React from 'react';
import phrasesJson from '../data/phrases.json';
import {C, F} from '../theme';
import {clamp, ease, mix, prog, useFormat, useT} from '../lib/time';

type W = {i: number; w: string; s: number; e: number};
type P = {id: number; line: number; half: number; halves: number; start: number; end: number; text: string; words: W[]};
const phrases = phrasesJson as P[];

type Line = {line: number; start: number; end: number; halves: P[]};
const lines: Line[] = [];
for (const p of phrases) {
  let l = lines.find((x) => x.line === p.line);
  if (!l) {
    l = {line: p.line, start: p.start, end: p.end, halves: []};
    lines.push(l);
  }
  l.halves.push(p);
  l.end = p.end;
}
const allWords = phrases.flatMap((p) => p.words);
const nextStart = (w: W) => allWords.find((x) => x.i === w.i + 1)?.s ?? w.e + 0.4;

// lines rendered by bespoke moments instead of the track
const SKIP_LINES: Record<'full' | 'reel', number[]> = {full: [0, 1, 17], reel: [0, 1]};

// semantic word treatments (the meaning drives the type)
type Fx = 'flip' | 'sky' | 'ink' | 'blush' | 'tiny' | 'tiltL' | 'tiltR' | 'ember' | 'heavy' | 'gold';
const FX: Record<string, Fx> = {
  पुठियां: 'flip', // "the wrong way round"
  नीली: 'sky', // "blue roof" = the sky
  छत: 'sky',
  काले: 'ink', // "black deeds"
  लालियां: 'blush', // redness on the cheeks
  'fire': 'ember',
  अश्के: 'gold',
  फट: 'heavy',
  डाका: 'heavy',
  Lambo: 'gold',
};
const fxFor = (w: W, idx: number, words: W[]): Fx | undefined => {
  if (w.w === 'कल्ला') return w.i === 55 ? 'tiny' : undefined; // only "standing alone in the crowd", not "alone, broad chest"
  if (w.w === 'टेढ़ी') return words.slice(0, idx).some((x) => x.w === 'टेढ़ी') ? 'tiltR' : 'tiltL';
  return FX[w.w];
};
const isLatin = (s: string) => /[A-Za-z]/.test(s);

const Word: React.FC<{w: W; fx?: Fx; t: number; size: number; exitP: number; k: number}> = ({w, fx, t, size, exitP, k}) => {
  const ns = nextStart(w);
  const inP = ease.outBack(prog(t, w.s - 0.1, w.s + 0.22), 1.2);
  const active = t >= w.s - 0.02 && t < Math.max(w.e, Math.min(ns, w.e + 0.35));
  const past = t >= Math.max(w.e, Math.min(ns, w.e + 0.35));
  const latin = isLatin(w.w);

  // underline: grows from the left while active, retracts to the right after
  const ulIn = ease.outCubic(prog(t, w.s - 0.02, w.s + 0.12));
  const ulOut = ease.inOutCubic(prog(t, Math.max(w.e, Math.min(ns, w.e + 0.35)), Math.max(w.e, Math.min(ns, w.e + 0.35)) + 0.14));
  const ulScale = ulIn * (1 - ulOut);
  const ulOrigin = ulOut > 0 ? 'right' : 'left';

  let color = past ? C.bone : active ? C.goldHi : C.bone;
  let transform = '';
  let extra: React.CSSProperties = {};
  const fxP = ease.outCubic(prog(t, w.s - 0.02, w.s + 0.25));
  switch (fx) {
    case 'flip':
      transform = `rotate(${180 * (active ? fxP : 1 - ease.inOutCubic(prog(t, w.e + 0.3, w.e + 0.7)))}deg)`;
      break;
    case 'sky':
      color = t >= w.s ? C.sky : color;
      transform = `translateY(${-14 * fxP}px)`;
      break;
    case 'ink':
      color = t >= w.s ? C.ink : color;
      extra = {WebkitTextStroke: `2px ${C.bone}`, textShadow: `0 0 10px rgba(239,230,210,0.55)`};
      break;
    case 'blush':
      color = t >= w.s ? C.blush : color;
      break;
    case 'tiny':
      transform = `scale(${mix(1, 0.62, fxP)})`;
      break;
    case 'tiltL':
      transform = `rotate(${-9 * fxP}deg) translateY(${-4 * fxP}px)`;
      break;
    case 'tiltR':
      transform = `rotate(${9 * fxP}deg) translateY(${4 * fxP}px)`;
      break;
    case 'ember':
      color = t >= w.s ? '#FFB36B' : color;
      extra = {textShadow: `0 0 ${18 * fxP}px rgba(255,120,40,0.85), 0 2px 12px rgba(0,0,0,0.5)`};
      break;
    case 'gold':
    case 'heavy':
      color = t >= w.s ? C.goldHi : color;
      transform = `scale(${1 + 0.12 * fxP})`;
      break;
  }

  const exitY = -36 * ease.inCubic(exitP);
  return (
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
        overflow: 'hidden',
        fontSize: size, // em-based padding/margins below resolve against the lyric size
        padding: '0.5em 0.08em 0.36em',
        margin: '-0.5em 0.12em -0.36em',
        verticalAlign: 'baseline',
        opacity: 1 - exitP,
        filter: exitP > 0 ? `blur(${exitP * 6}px)` : undefined,
        ...(fx === 'tiny' ? {margin: `-0.5em ${0.12 + 0.3 * fxP}em -0.36em`} : {}),
      }}
    >
      <span
        style={{
          display: 'inline-block',
          transform: `translateY(${(1 - inP) * 118 + exitY}%) ${transform}`,
          transformOrigin: '50% 60%',
          color,
          fontFamily: latin ? F.latin : F.lyric,
          fontStyle: latin ? 'italic' : 'normal',
          fontWeight: latin ? 500 : 400,
          fontSize: latin ? size * 1.16 : size,
          textShadow: '0 2px 16px rgba(0,0,0,0.6), 0 0 3px rgba(0,0,0,0.35)',
          ...extra,
        }}
      >
        {w.w}
      </span>
      <span
        style={{
          position: 'absolute',
          left: '0.08em',
          right: '0.08em',
          bottom: '0.18em',
          height: Math.max(2, size * 0.045),
          background: `linear-gradient(90deg, ${C.goldLo}, ${C.goldHi}, ${C.gold})`,
          transform: `scaleX(${ulScale})`,
          transformOrigin: ulOrigin,
          boxShadow: '0 0 8px rgba(212,174,92,0.6)',
        }}
      />
    </span>
  );
};

export const LyricTrack: React.FC = () => {
  const t = useT();
  const fmt = useFormat();
  const skip = SKIP_LINES[fmt.kind];
  const idx = lines.findIndex((l, i) => {
    const nxt = lines[i + 1];
    const a = l.start - 0.2;
    const b = Math.min(nxt ? nxt.start - 0.06 : 1e9, l.end + 1.3);
    return t >= a && t < b;
  });
  if (idx < 0) return null;
  const line = lines[idx];
  if (skip.includes(line.line)) return null;
  const nxt = lines[idx + 1];
  const exitAt = Math.min(nxt ? nxt.start - 0.06 : 1e9, line.end + 1.3) - 0.3;

  const full = fmt.kind === 'full';
  const size = full ? 52 : 64;
  const box: React.CSSProperties = full
    ? {left: 150, top: 726, width: 1500}
    : {left: 72, top: 1236, width: 850};

  let k = 0;
  return (
    <div style={{position: 'absolute', ...box, lineHeight: 1.5}}>
      {line.halves.map((h) => (
        <div key={h.id} style={{display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', marginLeft: h.half ? (full ? 46 : 0) : 0}}>
          {h.words.map((w, wi) => {
            const kk = k++;
            const exitP = clamp(prog(t, exitAt + kk * 0.018, exitAt + kk * 0.018 + 0.26));
            return <Word key={w.i} w={w} fx={fxFor(w, wi, h.words)} t={t} size={size} exitP={exitP} k={kk} />;
          })}
        </div>
      ))}
    </div>
  );
};
