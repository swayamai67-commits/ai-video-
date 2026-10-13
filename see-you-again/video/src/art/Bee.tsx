import React from 'react';
import {C} from '../theme';
import {noise1} from '../lib/time';

/**
 * A painted-style bee (faces +x). Wings flap on the song clock; a soft fuzz stroke
 * keeps it close to the cover's painted bees instead of an emoji/icon read.
 */
export const BeeGlyph: React.FC<{t: number; seed?: number}> = ({t, seed = 0}) => {
  const flap = Math.sin((t + seed * 0.37) * Math.PI * 2 * 11);
  const wy = 0.55 + 0.45 * Math.abs(flap);
  return (
    <g>
      {/* back wing */}
      <ellipse cx={-4} cy={-24} rx={20} ry={30 * wy} transform={`rotate(-28 -4 -10)`} fill="#EAF4FF" opacity={0.55} stroke="#ffffff" strokeWidth={1.5} />
      {/* body */}
      <g>
        <ellipse cx={0} cy={0} rx={34} ry={22} fill={C.sun} stroke="#3B220C" strokeWidth={3} />
        <path d="M -14 -20 Q -9 0 -14 20" stroke="#1B110A" strokeWidth={9} fill="none" strokeLinecap="round" />
        <path d="M 2 -22 Q 8 0 2 22" stroke="#1B110A" strokeWidth={9} fill="none" strokeLinecap="round" />
        <path d="M -27 -10 Q -24 0 -27 10" stroke="#1B110A" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M -34 0 L -44 2 L -34 5 Z" fill="#1B110A" />
        <ellipse cx={-6} cy={-10} rx={16} ry={5} fill="#FFF3B0" opacity={0.6} />
      </g>
      {/* head */}
      <circle cx={34} cy={-2} r={14} fill="#1B110A" />
      <circle cx={39} cy={-6} r={3.2} fill="#ffffff" opacity={0.85} />
      <path d="M 40 -14 Q 48 -30 58 -30" stroke="#1B110A" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <path d="M 34 -15 Q 38 -32 46 -36" stroke="#1B110A" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      {/* front wing */}
      <ellipse cx={6} cy={-26} rx={22} ry={34 * wy} transform={`rotate(18 6 -8)`} fill="#F4FAFF" opacity={0.72} stroke="#ffffff" strokeWidth={2} />
    </g>
  );
};

export type Pt = {x: number; y: number};

/**
 * A bee flying along `path(t)` with a dashed bee-line trail behind it (the film's signature line).
 * Rendered in a full-frame SVG layer in the caller's coordinate space.
 */
export const BeeFlight: React.FC<{
  t: number;
  path: (t: number) => Pt;
  t0: number;
  t1: number;
  size?: number;
  trail?: number; // seconds of trail
  seed?: number;
  color?: string;
  blur?: number;
  dash?: string;
  trailWidth?: number;
}> = ({t, path, t0, t1, size = 1, trail = 0.45, seed = 0, color = C.cream, blur = 0, dash = '10 12', trailWidth = 3}) => {
  if (t < t0 || t > t1 + trail) return null;
  const tt = Math.min(t, t1);
  const p = path(tt);
  // jitter: bees never fly clean lines
  const jx = noise1(tt * 6, seed) * 6 * size;
  const jy = noise1(tt * 7, seed + 9) * 8 * size;
  const q = path(Math.max(t0, tt - 0.02));
  const ang = (Math.atan2(p.y - q.y, p.x - q.x) * 180) / Math.PI;
  const pts: string[] = [];
  const a = Math.max(t0, t - trail);
  const n = 28;
  for (let i = 0; i <= n; i++) {
    const s = a + ((Math.min(t, t1) - a) * i) / n;
    const r = path(s);
    pts.push(`${r.x.toFixed(1)},${r.y.toFixed(1)}`);
  }
  const fade = t > t1 ? 1 - (t - t1) / trail : 1;
  const flip = Math.abs(ang) > 90;
  return (
    <g style={blur ? {filter: `blur(${blur}px)`} : undefined}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={trailWidth * size} strokeDasharray={dash} strokeLinecap="round" opacity={0.85 * fade} />
      {t <= t1 && (
        <g transform={`translate(${p.x + jx} ${p.y + jy}) rotate(${flip ? ang - 180 : ang}) scale(${(flip ? -1 : 1) * size} ${size})`}>
          <BeeGlyph t={t} seed={seed} />
        </g>
      )}
    </g>
  );
};
