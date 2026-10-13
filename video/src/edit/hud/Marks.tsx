import React from 'react';
import {F} from '../fonts';
import {clamp, ease, noise1, prog, springAt, useT} from '../lib';
import {C} from '../theme';

/** A hand-drawn marker stroke that draws itself on (stroke-dashoffset), holds, then fades. */
export const Scribble: React.FC<{
  d: string;
  from: number;
  to: number;
  dur?: number;
  color?: string;
  width?: number;
  len?: number;
}> = ({d, from, to, dur = 0.35, color = C.red, width = 7, len = 2400}) => {
  const t = useT();
  if (t < from || t > to + 0.3) return null;
  const p = ease.outCubic(prog(t, from, from + dur));
  const out = prog(t, to, to + 0.3);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: 1 - out}}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - p)}
        style={{filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.35))'}}
      />
    </svg>
  );
};

/** Wobbly hand-drawn ellipse path (overshoots its start like a real marker loop). */
export const loopPath = (cx: number, cy: number, rx: number, ry: number, seed = 1) => {
  const pts: string[] = [];
  for (let k = 0; k <= 56; k++) {
    const a = -2.2 + (k / 50) * Math.PI * 2;
    const j = 1 + noise1(k * 0.35, seed) * 0.05;
    pts.push(`${(cx + Math.cos(a) * rx * j).toFixed(1)},${(cy + Math.sin(a) * ry * j).toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
};

/** Marker crown sitting on a head at (cx, top), width w. */
export const crownPath = (cx: number, top: number, w: number) => {
  const h = w * 0.55, x0 = cx - w / 2, y1 = top - 10;
  return `M${x0},${y1} L${x0 + w * 0.06},${y1 - h} L${x0 + w * 0.3},${y1 - h * 0.45} L${cx},${y1 - h * 1.15} L${x0 + w * 0.7},${y1 - h * 0.45} L${x0 + w * 0.94},${y1 - h} L${x0 + w},${y1} Z`;
};

export const arrowPath = (x0: number, y0: number, x1: number, y1: number) => {
  const a = Math.atan2(y1 - y0, x1 - x0), L = 34;
  const mx = (x0 + x1) / 2 + (y1 - y0) * 0.15, my = (y0 + y1) / 2 - (x1 - x0) * 0.15;
  return `M${x0},${y0} Q${mx},${my} ${x1},${y1} M${x1 - L * Math.cos(a - 0.5)},${y1 - L * Math.sin(a - 0.5)} L${x1},${y1} L${x1 - L * Math.cos(a + 0.5)},${y1 - L * Math.sin(a + 0.5)}`;
};

/** Marker handwriting label. */
export const MarkerText: React.FC<{from: number; to: number; x: number; y: number; size?: number; rot?: number; color?: string; children: string}> = ({
  from, to, x, y, size = 46, rot = -6, color = C.red, children,
}) => {
  const t = useT();
  if (t < from || t > to + 0.3) return null;
  const n = Math.floor(clamp((t - from) / 0.4) * children.length + 0.999);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)`, fontFamily: F.marker, fontSize: size, color, whiteSpace: 'nowrap',
      opacity: 1 - prog(t, to, to + 0.3), textShadow: '0 3px 8px rgba(0,0,0,0.4)'}}>
      {children.slice(0, n)}
    </div>
  );
};

/** Rubber stamp: falls fast, compresses on impact, rebounds, leaves a slightly rotated imprint. */
export const Stamp: React.FC<{from: number; to: number; x: number; y: number; text: string; size?: number; rot?: number; color?: string; sub?: string}> = ({
  from, to, x, y, text, size = 150, rot = -9, color = C.red, sub,
}) => {
  const t = useT();
  if (t < from - 0.12 || t > to + 0.35) return null;
  const fall = ease.inQuad(prog(t, from - 0.12, from));
  const settle = springAt(t - from, 3.4, 0.3);
  const scale = t < from ? 2.6 - 1.6 * fall : 1 + (1 - settle) * -0.12;
  const op = clamp(prog(t, from - 0.12, from - 0.05)) * (1 - prog(t, to, to + 0.35));
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${scale})`, opacity: op}}>
      <div style={{border: `${size * 0.06}px solid ${color}`, padding: `${size * 0.02}px ${size * 0.16}px`, color, fontFamily: F.hero, fontSize: size,
        lineHeight: 1.05, letterSpacing: size * 0.02, textAlign: 'center', background: 'rgba(255,59,47,0.06)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)', maskImage: 'none'}}>
        {text}
        {sub && <div style={{fontFamily: F.mono, fontWeight: 700, fontSize: size * 0.15, letterSpacing: size * 0.03}}>{sub}</div>}
      </div>
    </div>
  );
};
