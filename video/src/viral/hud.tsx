import React from 'react';
import {AbsoluteFill} from 'remotion';
import track from './data/track.json';
import {C, F, FPS, SONG_END} from './config';
import {frameAt, Timing} from './Plate';
import {clamp, ease, noise, prog, rnd, useT} from './lib';

type Track = {pts: [number, number, number][][]; subj?: (number[] | null)[]; head?: (number[] | null)[]};
const TR = track as unknown as Record<string, Track>;

export const headBox = (clip: string, f: number) => {
  const h = TR[clip]?.head;
  if (!h) return null;
  for (let k = 0; k < 6; k++) {
    const b = h[f - k] ?? h[f + k];
    if (b) return b;
  }
  return null;
};
export const subjBox = (clip: string, f: number) => TR[clip]?.subj?.[f] ?? null;

/** Corner brackets box. */
export const Brackets: React.FC<{x: number; y: number; w: number; h: number; color?: string; len?: number; stroke?: number; opacity?: number}> = ({
  x,
  y,
  w,
  h,
  color = C.red,
  len = 0.22,
  stroke = 5,
  opacity = 1,
}) => {
  const l = Math.min(w, h) * len;
  const d = `M${x},${y + l} V${y} H${x + l} M${x + w - l},${y} H${x + w} V${y + l} M${x + w},${y + h - l} V${y + h} H${x + w - l} M${x + l},${y + h} H${x} V${y + h - l}`;
  return <path d={d} stroke={color} strokeWidth={stroke} fill="none" opacity={opacity} strokeLinecap="square" />;
};

/**
 * Blob tracking: boxes on tracked feature points, ids, connecting lines.
 * Area (w,h) is the plate's on-screen box.
 */
export const Blobs: React.FC<{clip: string; tm: Timing; w: number; h: number; x?: number; y?: number; color?: string; max?: number; opacity?: number; lines?: boolean; seed?: number}> = ({
  clip,
  tm,
  w,
  h,
  x = 0,
  y = 0,
  color = C.bone,
  max = 9,
  opacity = 1,
  lines = true,
  seed = 1,
}) => {
  const t = useT();
  const f = frameAt(clip, t, tm);
  const pts = (TR[clip]?.pts?.[f] ?? []).slice(0, max);
  const P = pts.map(([id, px, py]) => ({id, X: x + px * w, Y: y + py * h, s: 34 + rnd(id * 7 + seed) * 70}));
  return (
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity, overflow: 'visible'}}>
      {lines &&
        P.map((a, i) => {
          const b = P[(i + 1 + (a.id % 3)) % P.length];
          if (!b || b === a) return null;
          return <line key={`l${a.id}`} x1={a.X} y1={a.Y} x2={b.X} y2={b.Y} stroke={color} strokeWidth={1.5} opacity={0.55} />;
        })}
      {P.map((p) => (
        <g key={p.id}>
          <rect x={p.X - p.s / 2} y={p.Y - p.s / 2} width={p.s} height={p.s} fill="none" stroke={color} strokeWidth={2} />
          {rnd(p.id + seed) > 0.55 && <rect x={p.X - p.s / 2} y={p.Y - p.s / 2} width={p.s} height={p.s} fill={color} opacity={0.18} style={{mixBlendMode: 'difference'}} />}
          <text x={p.X + p.s / 2 + 6} y={p.Y - p.s / 2 + 18} fill={color} fontFamily={F.mono} fontSize={17} letterSpacing={1}>
            {`${(p.id * 2654435761 % 0xffff).toString(16).toUpperCase().padStart(4, '0')}`}
          </text>
          <text x={p.X + p.s / 2 + 6} y={p.Y - p.s / 2 + 38} fill={color} fontFamily={F.mono} fontSize={15} opacity={0.7}>
            {`${(p.X / 1080).toFixed(3)} ${(p.Y / 1920).toFixed(3)}`}
          </text>
        </g>
      ))}
    </svg>
  );
};

/** The lock: brackets that find the subject's head, with a label. */
export const Lock: React.FC<{clip: string; tm: Timing; w: number; h: number; x?: number; y?: number; label: string; sub?: string; from: number; color?: string; pad?: number}> = ({
  clip,
  tm,
  w,
  h,
  x = 0,
  y = 0,
  label,
  sub,
  from,
  color = C.red,
  pad = 0.25,
}) => {
  const t = useT();
  const f = frameAt(clip, t, tm);
  const b = headBox(clip, f);
  if (!b || t < from) return null;
  const p = ease.outExpo(prog(t, from, from + 0.5));
  // search: starts big and jittery, settles on the head
  const bx = x + b[0] * w, by = y + b[1] * h, bw = b[2] * w, bh = b[3] * h;
  const padX = bw * pad, padY = bh * pad;
  let tx = bx - padX, ty = by - padY, tw = bw + 2 * padX, th = bh + 2 * padY;
  // keep the lock (and its label) inside the safe frame on close-ups
  const maxW = w * 0.62;
  if (tw > maxW) { tx += (tw - maxW) / 2; tw = maxW; }
  if (th > tw * 1.3) th = tw * 1.3;
  if (ty < y + 300) ty = y + 300;
  if (tx < x + 60) tx = x + 60;
  if (tx + tw > x + w - 60) tx = x + w - 60 - tw;
  const j = (1 - p) * 120;
  const X = tx + noise(t * 9, 4) * j - (1 - p) * tw * 0.6;
  const Y = ty + noise(t * 9, 5) * j - (1 - p) * th * 0.6;
  const Wd = tw * (1 + (1 - p) * 1.2);
  const Ht = th * (1 + (1 - p) * 1.2);
  const locked = p > 0.98;
  const blink = Math.floor(t * 6) % 2 === 0;
  return (
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <Brackets x={X} y={Y} w={Wd} h={Ht} color={color} stroke={6} />
      {locked && <line x1={X + Wd / 2} y1={Y + Ht / 2 - 18} x2={X + Wd / 2} y2={Y + Ht / 2 + 18} stroke={color} strokeWidth={3} />}
      {locked && <line x1={X + Wd / 2 - 18} y1={Y + Ht / 2} x2={X + Wd / 2 + 18} y2={Y + Ht / 2} stroke={color} strokeWidth={3} />}
      <rect x={X} y={Y - 52} width={Math.max(260, label.length * 19 + 40)} height={40} fill={color} />
      <text x={X + 14} y={Y - 23} fill={C.bone} fontFamily={F.mono} fontWeight={700} fontSize={25} letterSpacing={2}>
        {locked ? label : blink ? 'SEARCHING…' : 'SEARCHING'}
      </text>
      {sub && locked && (
        <text x={X} y={Y + Ht + 34} fill={C.bone} fontFamily={F.mono} fontSize={21} letterSpacing={2}>
          {sub}
        </text>
      )}
    </svg>
  );
};

const tc = (t: number) => {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const fr = Math.floor((t % 1) * FPS);
  return `00:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(fr).padStart(2, '0')}`;
};

/** Feed chrome: REC, timecode, cam id, progress. Sits in the safe margins. */
export const FeedChrome: React.FC<{cam?: string; opacity?: number; dark?: boolean}> = ({cam = 'CAM 01', opacity = 1, dark}) => {
  const t = useT();
  const col = dark ? C.ink : C.hud;
  const rec = Math.floor(t * 2) % 2 === 0;
  return (
    <AbsoluteFill style={{opacity, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 70, top: 120, display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.mono, fontSize: 26, letterSpacing: 3, color: col, fontWeight: 700}}>
        <span style={{width: 20, height: 20, borderRadius: 10, background: C.red, opacity: rec ? 1 : 0.15}} />
        REC
        <span style={{fontWeight: 500, opacity: 0.85}}>{tc(t)}</span>
      </div>
      <div style={{position: 'absolute', right: 70, top: 120, fontFamily: F.mono, fontSize: 26, letterSpacing: 3, color: col}}>{cam}</div>
      <div style={{position: 'absolute', left: 70, right: 70, bottom: 150, height: 3, background: dark ? 'rgba(0,0,0,0.2)' : 'rgba(243,238,230,0.2)'}}>
        <div style={{width: `${clamp(t / SONG_END) * 100}%`, height: '100%', background: C.red}} />
      </div>
      <div style={{position: 'absolute', left: 70, bottom: 166, fontFamily: F.mono, fontSize: 20, letterSpacing: 3, color: col, opacity: 0.8}}>
        ASHKE · KARAN AUJLA × MXRCI
      </div>
    </AbsoluteFill>
  );
};

/** Viewfinder corners framing the whole picture. */
export const Viewfinder: React.FC<{inset?: number; color?: string}> = ({inset = 50, color = C.hud}) => (
  <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
    <Brackets x={inset} y={inset + 40} w={1080 - inset * 2} h={1920 - inset * 2 - 80} color={color} len={0.05} stroke={3} />
  </svg>
);
