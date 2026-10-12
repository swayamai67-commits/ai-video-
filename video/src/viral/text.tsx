import React from 'react';
import lyrics from './data/lyrics.json';
import metrics from './data/metrics.json';
import {ACCENT_SCRIPT, C, F, W} from './config';
import {clamp, ease, prog, springAt, useT} from './lib';

export type Word = {i: number; w: string; src: string; s: number; e: number; gu?: string; dev?: string; en?: boolean};
export type Phrase = {id: number; line: number; half: number; start: number; end: number; text: string; words: Word[]};
export const PHRASES = lyrics as Phrase[];
export const WORDS: Word[] = PHRASES.flatMap((p) => p.words);
export const phrase = (id: number) => PHRASES[id];
export const wordAt = (i: number) => WORDS[i];

const M = metrics as {adv: Record<string, Record<string, number>>; words: Record<string, Record<string, number>>};

/** What a word looks like on screen: text, font family and case. */
export const look = (w: Word) => {
  if (w.gu && w.dev) {
    const txt = ACCENT_SCRIPT === 'gu' ? w.gu : w.dev;
    return {txt, font: ACCENT_SCRIPT === 'gu' ? F.gu : F.dev, key: ACCENT_SCRIPT, accent: true, en: false};
  }
  if (w.en) return {txt: w.w, font: F.serif, key: 'serif', accent: false, en: true};
  return {txt: w.w.toUpperCase(), font: F.slam, key: 'slam', accent: false, en: false};
};

/** Width in em of a string in one of the measured fonts. */
export const emWidth = (txt: string, key: string) => {
  if (key === 'gu' || key === 'dev') return M.words[key][txt] ?? txt.length * 0.6;
  const a = M.adv[key];
  let s = 0;
  for (const ch of txt) s += a?.[ch] ?? 0.5;
  return s;
};
/** Font size that makes txt exactly `width` px wide. */
export const fitSize = (txt: string, key: string, width: number) => width / Math.max(0.1, emWidth(txt, key));

// cap heights (fraction of em) for vertical rhythm
export const CAP = {slam: 0.73, black: 0.72, serif: 0.66, gu: 0.62, dev: 0.62, mono: 0.73} as Record<string, number>;

/** Snap-in progress for a word starting at s: fast overshoot. */
export const snap = (t: number, s: number, dur = 0.16) => clamp(ease.outBack(prog(t, s - 0.04, s - 0.04 + dur), 2.2), 0, 1.25);

// ---------- LOCKUP: phrase set in rows fitted to the same width ----------
type LockRow = Word[];
/** Split a phrase into rows of max n words (keeps 'che/'te with the word before). */
export const rowsOf = (words: Word[], per = 2): LockRow[] => {
  const rows: LockRow[] = [];
  let cur: Word[] = [];
  for (const w of words) {
    const clitic = w.w.startsWith("'");
    if (cur.length >= per && !clitic) {
      rows.push(cur);
      cur = [];
    }
    cur.push(w);
  }
  if (cur.length) rows.push(cur);
  return rows;
};

export const Lockup: React.FC<{
  words: Word[];
  x?: number;
  y: number; // top
  width?: number;
  per?: number;
  gap?: number;
  color?: string;
  active?: string;
  dim?: string;
  maxSize?: number;
  shadow?: boolean;
  align?: 'left' | 'center';
  exitAt?: number;
}> = ({words, x = 70, y, width = W - 140, per = 2, gap = 14, color = C.bone, active = C.red, dim = 'rgba(243,238,230,0.22)', maxSize = 330, shadow, align = 'left', exitAt}) => {
  const t = useT();
  const rows = rowsOf(words, per);
  let yy = y;
  const exitP = exitAt !== undefined ? ease.inExpo(prog(t, exitAt - 0.12, exitAt)) : 0;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none'}}>
      {rows.map((row, ri) => {
        const parts = row.map(look);
        const spaceKey = 'slam';
        const total = parts.reduce((s, p) => s + emWidth(p.txt, p.key), 0) + (row.length - 1) * emWidth(' ', spaceKey) * 0.9;
        const size = Math.min(maxSize, width / total);
        const capH = size * 0.74;
        const top = yy;
        yy += capH + gap;
        let xx = align === 'center' ? x + (width - total * size) / 2 : x;
        return row.map((w, wi) => {
          const p = parts[wi];
          const ww = emWidth(p.txt, p.key) * size;
          const left = xx;
          xx += ww + emWidth(' ', spaceKey) * 0.9 * size;
          const vis = t >= w.s - 0.04;
          const on = t >= w.s - 0.04 && t < w.e + 0.08;
          const sp = snap(t, w.s);
          const col = p.accent ? C.gold : on ? active : vis ? color : dim;
          const lift = (1 - Math.min(1, sp)) * capH * 0.5;
          return (
            <div
              key={w.i}
              style={{
                position: 'absolute',
                left,
                top: top - size * (p.key === 'serif' ? 0.2 : p.accent ? 0.18 : 0.12) + lift - exitP * 60,
                fontFamily: p.font,
                fontSize: size,
                lineHeight: 1,
                color: col,
                whiteSpace: 'nowrap',
                opacity: (vis ? 1 : 0.0001 + 0) * (1 - exitP),
                transform: `scale(${vis ? 0.9 + 0.1 * sp : 1})`,
                transformOrigin: 'left bottom',
                textShadow: shadow ? '0 6px 30px rgba(0,0,0,0.55)' : undefined,
                filter: vis && sp < 0.95 ? `blur(${(1 - sp) * 6}px)` : undefined,
              }}
            >
              {p.txt}
            </div>
          );
        });
      })}
    </div>
  );
};

/** Lockup height helper (so scenes can stack under it). */
export const lockupHeight = (words: Word[], width = W - 140, per = 2, gap = 14, maxSize = 330) =>
  rowsOf(words, per).reduce((h, row) => {
    const parts = row.map(look);
    const total = parts.reduce((s, p) => s + emWidth(p.txt, p.key), 0) + (row.length - 1) * emWidth(' ', 'slam') * 0.9;
    return h + Math.min(maxSize, width / total) * 0.74 + gap;
  }, 0);

// ---------- SLAM: the active word huge ----------
export const activeWord = (words: Word[], t: number, hold = 0.25) => {
  let cur: Word | null = null;
  for (const w of words) if (t >= w.s - 0.04 && t < w.e + hold) cur = w;
  // when words overlap with hold, the latest started wins
  return cur;
};

export const Slam: React.FC<{
  words: Word[];
  y: number; // baseline-ish center
  maxSize?: number;
  width?: number;
  color?: string;
  context?: boolean; // show phrase so far in mono above
  style?: (w: Word, t: number) => React.CSSProperties | undefined;
  render?: (w: Word, t: number) => React.ReactNode;
}> = ({words, y, maxSize = 420, width = W - 140, color = C.bone, context = true, style, render}) => {
  const t = useT();
  const w = activeWord(words, t);
  if (!w) return null;
  const p = look(w);
  const size = Math.min(maxSize, fitSize(p.txt, p.key, width));
  const dt = t - (w.s - 0.04);
  const sc = 1.28 - 0.28 * clamp(ease.outExpo(dt / 0.14));
  const bl = Math.max(0, 1 - dt / 0.1) * 10;
  const custom = style?.(w, t);
  const sofar = words.filter((x) => x.s - 0.04 <= t && x.i <= w.i);
  return (
    <>
      {context && (
        <div
          style={{
            position: 'absolute',
            left: 70,
            right: 70,
            top: y - size * 0.62 - 64,
            fontFamily: F.mono,
            fontSize: 30,
            letterSpacing: 2,
            color: 'rgba(243,238,230,0.8)',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          {sofar.map((x) => (x.gu ? look(x).txt : x.w)).join(' ')}
          <span style={{opacity: Math.floor(t * 4) % 2 ? 1 : 0}}>▍</span>
        </div>
      )}
      {render ? (
        render(w, t)
      ) : (
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: '100%',
            top: y - size * 0.55,
            textAlign: 'center',
            fontFamily: p.font,
            fontSize: size,
            lineHeight: 1,
            color: p.accent ? C.gold : color,
            transform: `scale(${sc})`,
            filter: bl > 0.3 ? `blur(${bl}px)` : undefined,
            whiteSpace: 'nowrap',
            textShadow: p.accent ? `0 0 40px ${C.gold}88` : undefined,
            ...custom,
          }}
        >
          {p.txt}
        </div>
      )}
    </>
  );
};

/** Big single word that springs in at time s (used for hero words). */
export const Hero: React.FC<{txt: string; fontKey?: string; s: number; e?: number; y: number; width?: number; color?: string; size?: number; style?: React.CSSProperties; x?: number}> = ({
  txt,
  fontKey = 'slam',
  s,
  e = Infinity,
  y,
  width = W - 140,
  color = C.bone,
  size,
  style,
  x,
}) => {
  const t = useT();
  if (t < s - 0.04 || t >= e) return null;
  const fam = (F as Record<string, string>)[fontKey];
  const fs = size ?? fitSize(txt, fontKey, width);
  const sp = springAt(t - s + 0.04, 2.6, 0.38);
  return (
    <div
      style={{
        position: 'absolute',
        left: x ?? 0,
        width: x === undefined ? '100%' : undefined,
        top: y - fs * 0.55,
        textAlign: x === undefined ? 'center' : 'left',
        fontFamily: fam,
        fontSize: fs,
        lineHeight: 1,
        color,
        whiteSpace: 'nowrap',
        transform: `scale(${0.7 + 0.3 * sp})`,
        opacity: clamp(sp * 3),
        ...style,
      }}
    >
      {txt}
    </div>
  );
};

/** Mono HUD label. */
export const Mono: React.FC<{children: React.ReactNode; x: number; y: number; size?: number; color?: string; style?: React.CSSProperties; right?: boolean}> = ({
  children,
  x,
  y,
  size = 26,
  color = C.hud,
  style,
  right,
}) => (
  <div
    style={{
      position: 'absolute',
      [right ? 'right' : 'left']: x,
      top: y,
      fontFamily: F.mono,
      fontSize: size,
      letterSpacing: size * 0.08,
      color,
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      fontWeight: 500,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Type a string out character by character from time s. */
export const typed = (txt: string, t: number, s: number, cps = 28) => txt.slice(0, Math.max(0, Math.floor((t - s) * cps)));
