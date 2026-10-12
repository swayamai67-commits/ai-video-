import React from 'react';
import {AbsoluteFill} from 'remotion';
import {LINES, Line, subjectAt} from './data';
import {F} from './fonts';
import {clamp, ease, prog, springAt, useT} from './lib';
import {C, shadow} from './theme';

type Side = 'left' | 'right' | 'center';

/** Which side of frame is free of people when the line starts (decided once per line, so it never jumps). */
const sideFor = (ln: Line, override?: Side): Side => {
  if (override) return override;
  const b = subjectAt(ln.start + 0.1) ?? subjectAt(ln.start + 0.6);
  if (!b) return 'center';
  if (b.cx > 0.56) return 'left';
  if (b.cx < 0.44) return 'right';
  return b.w > 0.55 ? 'center' : b.cx >= 0.5 ? 'left' : 'right';
};

/** Lines where the free side is decided by the design rather than the tracker. */
const SIDE_OVERRIDE: Record<number, Side> = {};

/** Semantic word treatments, keyed "phraseId:wordIndex" (the meaning drives the move). */
type WordFx = 'flip' | 'tiltL' | 'tiltR' | 'ink' | 'fire' | 'red';
const WORD_FX: Record<string, WordFx> = {
  '14:3': 'flip', // puthiyan: "upside-down" deals
  '52:2': 'tiltL', '52:3': 'tiltR', // tedhi tedhi: a crooked look
  '18:2': 'ink', // kaale: our deeds are black
  '30:3': 'fire', // Baby you so fire
  '10:4': 'red', // phatt
  '70:5': 'red', // daaka
};
/** Lines set in marker handwriting: the woman's voice note. */
const NOTE_LINES = new Set<number>([17]);
/** Lines hidden because a full-frame moment carries the words itself. */
export const HIDDEN_LINES = new Set<number>([1]); // 'Mercy' is its own title moment

const lineWindow = (k: number) => {
  const ln = LINES[k];
  const next = LINES[k + 1];
  const endHold = Math.min(next ? next.start - 0.04 : ln.end + 1.2, ln.end + 1.4);
  return {a: ln.phrases[0].words[0].s - 0.12, b: endHold};
};

const WordSpan: React.FC<{
  w: {w: string; dev: string; s: number; e: number; accent: boolean; en: boolean};
  t: number;
  size: number;
  below: boolean;
  fx?: WordFx;
}> = ({w, t, size, below, fx}) => {
  const p = springAt(t - (w.s - 0.06), 3.2, 0.42);
  const appear = clamp(ease.outCubic(prog(t, w.s - 0.06, w.s + 0.08)));
  const active = t >= w.s - 0.04 && t < w.e + 0.06;
  const chipIn = active ? ease.outBack(prog(t, w.s - 0.04, w.s + 0.1), 2) : 0;
  const blur = (1 - appear) * 7;
  const done = t >= w.e + 0.06;
  const fxP = springAt(t - w.s, 2.6, 0.32);
  const rot = fx === 'flip' ? 180 * fxP : fx === 'tiltL' ? -9 * fxP : fx === 'tiltR' ? 9 * fxP : 0;
  const chipCol = fx === 'ink' ? C.ink : fx === 'fire' ? 'linear-gradient(90deg,#FF7A1A,#FF3B2F)' : fx === 'red' ? C.red : C.champagne;
  const textCol = active ? (fx === 'ink' || fx === 'fire' || fx === 'red' ? C.ivory : C.ink)
    : done && fx === 'ink' ? '#1a1a1a' : done && fx === 'fire' ? '#FF9A3C' : done && fx === 'red' ? C.red : C.ivory;
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        marginRight: size * 0.24,
        transform: `translateY(${(1 - p) * size * 0.45}px) rotate(${rot}deg)`,
        opacity: appear,
        filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
      }}
    >
      {chipIn > 0 && (
        <span
          style={{
            position: 'absolute',
            left: -size * 0.12,
            right: -size * 0.12,
            top: size * 0.12,
            bottom: size * 0.02,
            background: chipCol,
            transform: `scaleX(${chipIn})`,
            transformOrigin: 'left center',
            boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
          }}
        />
      )}
      <span
        style={{
          position: 'relative',
          fontStyle: w.en ? 'italic' : 'normal',
          color: textCol,
          textShadow: active ? 'none' : done && fx === 'ink' ? '0 0 2px rgba(245,239,228,0.9), 0 0 18px rgba(245,239,228,0.5)'
            : done && fx === 'fire' ? '0 0 14px rgba(255,120,30,0.9), 0 0 40px rgba(255,60,20,0.6)' : shadow,
        }}
      >
        {w.w}
      </span>
      {w.accent && (
        <span
          style={{
            position: 'absolute',
            left: '50%',
            ...(below ? {top: '96%'} : {bottom: '88%'}),
            transform: `translateX(-50%) translateY(${(1 - appear) * (below ? -12 : 12)}px)`,
            fontFamily: F.dev,
            fontWeight: 800,
            fontSize: size * 0.62,
            color: C.champagne,
            whiteSpace: 'nowrap',
            textShadow: shadow,
            opacity: appear,
          }}
        >
          {w.dev}
        </span>
      )}
    </span>
  );
};

export const Lyrics: React.FC<{size?: number}> = ({size = 66}) => {
  const t = useT();
  const out: React.ReactNode[] = [];
  LINES.forEach((ln, k) => {
    if (HIDDEN_LINES.has(ln.line)) return;
    const {a, b} = lineWindow(k);
    if (t < a || t > b + 0.3) return;
    const side = sideFor(ln, SIDE_OVERRIDE[ln.line]);
    const exit = ease.inCubic(prog(t, b, b + 0.3));
    const align = side === 'center' ? 'center' : side;
    const scrim = 1 - exit;
    out.push(
      <AbsoluteFill key={ln.line}>
        <AbsoluteFill
          style={{
            opacity: scrim * 0.75,
            background:
              side === 'left'
                ? 'radial-gradient(ellipse 55% 42% at 18% 88%, rgba(0,0,0,0.55), rgba(0,0,0,0) 70%)'
                : side === 'right'
                  ? 'radial-gradient(ellipse 55% 42% at 82% 88%, rgba(0,0,0,0.55), rgba(0,0,0,0) 70%)'
                  : 'radial-gradient(ellipse 60% 38% at 50% 92%, rgba(0,0,0,0.5), rgba(0,0,0,0) 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: side === 'right' ? undefined : side === 'left' ? 118 : 160,
            right: side === 'left' ? undefined : side === 'right' ? 118 : 160,
            bottom: 104,
            textAlign: align,
            fontFamily: NOTE_LINES.has(ln.line) ? F.marker : F.serif,
            fontSize: NOTE_LINES.has(ln.line) ? size * 0.82 : size,
            lineHeight: 1.12,
            transform: `translateY(${-exit * 26}px)`,
            opacity: 1 - exit,
            filter: exit > 0.05 ? `blur(${exit * 8}px)` : undefined,
          }}
        >
          {ln.phrases.map((ph) => (
            <div key={ph.id} style={{whiteSpace: 'nowrap', minHeight: size * 1.12}}>
              {ph.words.map((w) =>
                t >= w.s - 0.1 ? <WordSpan key={w.i} w={w} t={t} size={size} below={ph.half > 0 || ln.phrases.length === 1} fx={WORD_FX[`${ph.id}:${ph.words.indexOf(w)}`]} /> : null,
              )}
            </div>
          ))}
        </div>
      </AbsoluteFill>,
    );
  });
  return <>{out}</>;
};
