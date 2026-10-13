import React from 'react';
import {Box, subjectAt} from '../data';
import {Pick, pickRect} from './Track';
import {F} from '../fonts';
import {clamp, ease, prog, springAt, useT} from '../lib';
import {C} from '../theme';
import {DW, DH} from '../theme';

export type Rect = {x: number; y: number; w: number; h: number}; // design px

export const boxToRect = (b: Box, pad = 0.04): Rect => ({
  x: (b.cx - b.w / 2 - pad * 0.6) * DW,
  y: (b.cy - b.h / 2 - pad) * DH,
  w: (b.w + pad * 1.2) * DW,
  h: (b.h + pad * 2) * DH,
});

/** Types text on character by character from t0 at `cps` characters per second. */
export const typed = (s: string, t: number, t0: number, cps = 38) =>
  s.slice(0, Math.max(0, Math.floor((t - t0) * cps)));

/**
 * Lock-on brackets. Corners fly in from a wider box and snap with overshoot; a label chip
 * types on. If `track` is set, the box follows the tracked person (matte) instead of `rect`.
 */
export const Lock: React.FC<{
  from: number;
  to: number;
  rect?: Rect;
  track?: {pad?: number; maxH?: number; head?: boolean; pick?: Pick};
  label?: string;
  sub?: string;
  color?: string;
  labelSide?: 'top' | 'bottom';
  corner?: number;
  big?: boolean;
}> = ({from, to, rect, track, label, sub, color = C.ivory, labelSide = 'top', corner = 34, big}) => {
  const t = useT();
  if (t < from - 0.01 || t > to + 0.35) return null;
  let r = rect;
  if (track) {
    const b = track.pick ? null : subjectAt(t) ?? subjectAt(from + 0.2);
    const pr = track.pick ? pickRect(t, track.pick, track.pad ?? 0.025) ?? pickRect(from + 0.2, track.pick) : null;
    if (b || pr) {
      let rr = pr ?? boxToRect(b!, track.pad ?? 0.03);
      if (track.head) rr = {...rr, h: Math.min(rr.h, rr.w * 1.15)};
      if (track.maxH) rr = {...rr, h: Math.min(rr.h, track.maxH)};
      r = rr;
    }
  }
  if (!r) return null;
  // keep the box (and its label) inside the safe area below the REC bar and above the lyric zone
  const top = Math.max(r.y, labelSide === 'top' ? 150 : 110);
  const bottom = Math.min(r.y + r.h, labelSide === 'bottom' ? 900 : 1010);
  r = {...r, y: top, h: Math.max(60, bottom - top)};
  const sp = springAt(t - from, 2.6, 0.38);
  const out = ease.inCubic(prog(t, to, to + 0.3));
  const grow = (1 - sp) * 0.35 + out * 0.15;
  const x = r.x - (r.w * grow) / 2, y = r.y - (r.h * grow) / 2, w = r.w * (1 + grow), h = r.h * (1 + grow);
  const op = clamp(prog(t, from, from + 0.08)) * (1 - out);
  const blink = Math.floor((t - from) * 2.2) % 2 === 0 ? 1 : 0.25;
  const L = Math.min(corner, w * 0.3, h * 0.3);
  const st = {position: 'absolute' as const, borderColor: color, borderStyle: 'solid', width: L, height: L};
  const bw = big ? 5 : 3;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: op}}>
      <div style={{...st, left: 0, top: 0, borderWidth: `${bw}px 0 0 ${bw}px`}} />
      <div style={{...st, right: 0, top: 0, borderWidth: `${bw}px ${bw}px 0 0`}} />
      <div style={{...st, left: 0, bottom: 0, borderWidth: `0 0 ${bw}px ${bw}px`}} />
      <div style={{...st, right: 0, bottom: 0, borderWidth: `0 ${bw}px ${bw}px 0`}} />
      {/* centre tick */}
      <div style={{position: 'absolute', left: w / 2 - 7, top: h / 2 - 1, width: 14, height: 2, background: color, opacity: 0.6}} />
      <div style={{position: 'absolute', left: w / 2 - 1, top: h / 2 - 7, width: 2, height: 14, background: color, opacity: 0.6}} />
      {label && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            ...(labelSide === 'top' ? {bottom: h + 10} : {top: h + 10}),
            fontFamily: F.mono,
            fontWeight: 700,
            fontSize: big ? 34 : 19,
            letterSpacing: 1.5,
            color: C.ink,
            whiteSpace: 'nowrap',
            display: 'flex',
            flexDirection: labelSide === 'top' ? 'column-reverse' : 'column',
            alignItems: 'flex-start',
            gap: 4,
          }}
        >
          <span style={{background: color, padding: '3px 9px', display: 'flex', alignItems: 'center', gap: 8}}>
            <span style={{width: 9, height: 9, borderRadius: 9, background: C.red, opacity: blink}} />
            {typed(label, t, from + 0.12)}
          </span>
          {sub && (
            <span style={{background: 'rgba(10,10,10,0.72)', color, padding: '3px 9px', fontWeight: 400, fontSize: big ? 24 : 16}}>
              {typed(sub, t, from + 0.3, 46)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
