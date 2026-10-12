import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import beat from '../data/beat-map.json';
import phrasesJson from '../data/phrases.json';
import {C, F} from '../theme';
import {ease, mix, prog, useFormat, useT} from '../lib/time';

// The programme: chapters of the day (song time). Matches the invitation card.
export const CHAPTERS: {t: number; n: string; title: string}[] = [
  {t: 4.6, n: 'I', title: 'The Arrival'},
  {t: 48.28, n: 'II', title: 'The Shoot'},
  {t: 76.0, n: 'III', title: 'Polo & Tea'},
  {t: 90.4, n: 'IV', title: 'The Motors'},
  {t: 102.0, n: 'V', title: 'A Letter'},
  {t: 106.6, n: 'VI', title: 'The Portrait'},
  {t: 120.8, n: 'VII', title: 'The Study'},
  {t: 135.3, n: 'VIII', title: 'On the Water'},
  {t: 148.5, n: 'IX', title: 'The Vault'},
  {t: 166.3, n: 'X', title: 'Sunset Polo'},
  {t: 178.7, n: 'XI', title: 'Dinner'},
  {t: 189.76, n: 'XII', title: 'Jhumar'},
  {t: 200.9, n: '', title: 'Fin'},
];
// stretches where the programme labels step aside for full-frame design
const LABEL_OFF: [number, number][] = [
  [0, 4.6],
  [24.2, 38.2],
  [200.9, 999],
];

const downbeats: number[] = beat.downbeats;
const lastDownbeat = (t: number) => {
  let lo = 0, hi = downbeats.length - 1, r = -1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (downbeats[m] <= t) { r = m; lo = m + 1; } else hi = m - 1;
  }
  return r >= 0 ? downbeats[r] : -10;
};
const energyAt = (t: number) => beat.energy10hz[Math.max(0, Math.min(beat.energy10hz.length - 1, Math.round(t * 10)))] ?? 0;

export const barHeight = (t: number, kind: 'full' | 'reel') => {
  const base = kind === 'full' ? 136 : 128;
  // intimacy in the study (energy dip) → tighter frame
  const tight = Math.min(ease.inOutCubic(prog(t, 120.4, 121.6)), 1 - ease.inOutCubic(prog(t, 134.6, 135.4)));
  // finale opens up
  const open = Math.min(ease.inOutCubic(prog(t, 189.2, 189.9)), 1 - ease.inOutCubic(prog(t, 200.6, 201.4)));
  // downbeat breathing, only where the song is loud
  const db = lastDownbeat(t);
  const pulse = Math.exp(-(t - db) * 9) * (energyAt(t) > 0.55 ? 1 : 0);
  return base + 40 * tight - 46 * open - 7 * pulse;
};

export const Letterbox: React.FC = () => {
  const t = useT();
  const {kind, W, H} = useFormat();
  const h = barHeight(t, kind);
  const fin = ease.inOutCubic(prog(t, 216.4, 217.6));
  const bar: React.CSSProperties = {position: 'absolute', left: 0, width: W, background: C.night};
  return (
    <>
      <div style={{...bar, top: 0, height: h + (H / 2 - h) * fin}} />
      <div style={{...bar, bottom: 0, height: h + (H / 2 - h) * fin}} />
    </>
  );
};

export const ProgrammeLabels: React.FC = () => {
  const t = useT();
  const {kind, W, H} = useFormat();
  const full = kind === 'full';
  const ch = [...CHAPTERS].reverse().find((c) => t >= c.t);
  // fade out 0.4 s before each off-window, fade back in 0.6 s after it
  const offFade = Math.min(
    ...LABEL_OFF.map(([a, b]) => (t < a ? 1 - ease.inCubic(prog(t, a - 0.4, a)) : t < b ? 0 : ease.outCubic(prog(t, b, b + 0.6)))),
  );
  const a = offFade;
  if (!ch || a <= 0.001) return null;
  const since = t - ch.t;
  const line = ease.outExpo(prog(since, 0, 0.7));
  const txt = ease.outCubic(prog(since, 0.15, 0.75));
  const bh = barHeight(t, kind);
  const top = full ? bh / 2 - 13 : 196;
  const left = full ? 150 : 72;

  // song-progress hairline in the bottom bar (the gold line as a timeline)
  const p = t / 217.81;
  const lineNo = (phrasesJson as {line: number; start: number}[]).filter((x) => x.start <= t).reduce((m, x) => Math.max(m, x.line), 0);

  return (
    <AbsoluteFill style={{opacity: a}}>
      <div style={{position: 'absolute', left, top, display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{width: 64 * line, height: 1.5, background: C.gold, boxShadow: '0 0 6px rgba(212,174,92,.6)'}} />
        <div
          style={{
            fontFamily: F.latin,
            fontWeight: 600,
            fontSize: full ? 22 : 30,
            letterSpacing: `${mix(0.5, 0.32, txt)}em`,
            textTransform: 'uppercase',
            color: C.bone,
            opacity: txt,
            clipPath: `inset(0 ${100 - 100 * txt}% 0 0)`,
            whiteSpace: 'nowrap',
          }}
        >
          {ch.n ? <span style={{color: C.gold, marginRight: '0.6em'}}>{ch.n}</span> : null}
          {ch.title}
        </div>
      </div>
      {full ? (
        <>
          <div style={{position: 'absolute', right: 150, top: bh / 2 - 9, fontFamily: F.mono, fontSize: 14, letterSpacing: '0.28em', color: C.boneDim}}>
            ASHKE — KARAN AUJLA × MXRCI
          </div>
          <div style={{position: 'absolute', left: 150, right: 150, bottom: bh / 2 - 1, height: 1, background: 'rgba(239,230,210,0.14)'}}>
            <div style={{width: `${p * 100}%`, height: 1, background: C.gold}} />
          </div>
          <div style={{position: 'absolute', right: 150, bottom: bh / 2 + 10, fontFamily: F.mono, fontSize: 13, letterSpacing: '0.24em', color: C.boneDim}}>
            Nº {String(Math.max(1, lineNo - 1)).padStart(2, '0')} / 43
          </div>
        </>
      ) : (
        <div style={{position: 'absolute', left: 72, top: 238, fontFamily: F.mono, fontSize: 20, letterSpacing: '0.26em', color: C.boneDim}}>
          ASHKE — KARAN AUJLA × MXRCI
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Tiled film grain (8 pre-rendered tiles, cycled per frame). */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
  const frame = useCurrentFrame();
  const {W, H} = useFormat();
  const n = (frame % 8) + 1;
  return (
    <Img
      src={staticFile(`grain/g${n}.png`)}
      style={{position: 'absolute', left: 0, top: 0, width: W, height: H, objectFit: 'cover', opacity, mixBlendMode: 'overlay'}}
    />
  );
};

/** Soft dark scrim behind the lyric block, for legibility over bright lawns. */
export const Scrim: React.FC = () => {
  const {kind} = useFormat();
  const t = useT();
  const a = t < 48 ? 0.5 : 0.85;
  return kind === 'full' ? (
    <AbsoluteFill style={{background: `radial-gradient(120% 70% at 10% 100%, rgba(8,7,6,${0.62 * a}) 0%, rgba(8,7,6,${0.25 * a}) 45%, rgba(8,7,6,0) 70%)`}} />
  ) : (
    <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(8,7,6,0) 52%, rgba(8,7,6,${0.55 * a}) 70%, rgba(8,7,6,${0.35 * a}) 90%)`}} />
  );
};
