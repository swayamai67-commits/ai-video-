import React from 'react';
import {useCurrentFrame} from 'remotion';
import {boil} from '../lib/time';
import {C} from '../theme';

type InkProps = {
  d: string;
  /** draw-on progress 0..1 (the line writes itself, it never fades in) */
  p?: number;
  color?: string;
  w?: number;
  seed?: string;
  /** boil amplitude in px (hand-drawn jitter at 12 fps) */
  b?: number;
  fill?: string;
  opacity?: number;
  dash?: string;
  cap?: 'round' | 'butt';
  transform?: string;
};

/** A hand-inked stroke: draw-on via pathLength, 12 fps boil, slight width breathing. */
export const Ink: React.FC<InkProps> = ({d, p = 1, color = C.ink, w = 6, seed = 'ink', b = 1.3, fill = 'none', opacity = 1, dash, cap = 'round', transform}) => {
  const frame = useCurrentFrame();
  if (p <= 0.001 && fill === 'none') return null;
  const bx = boil(frame, seed + 'x', b);
  const by = boil(frame, seed + 'y', b);
  const bw = 1 + boil(frame, seed + 'w', 0.08);
  const drawing = p < 0.999 && !dash;
  return (
    <g transform={transform}>
      <path
        d={d}
        transform={`translate(${bx.toFixed(2)} ${by.toFixed(2)})`}
        fill={fill}
        stroke={color}
        strokeWidth={w * bw}
        strokeLinecap={cap}
        strokeLinejoin="round"
        opacity={opacity}
        pathLength={drawing ? 1 : undefined}
        strokeDasharray={drawing ? '1 2' : dash}
        strokeDashoffset={drawing ? 1 - p : undefined}
      />
    </g>
  );
};

/** Riso misregistration: a fill printed in a second ink, offset from the line. */
export const RisoFill: React.FC<{d: string; fill: string; dx?: number; dy?: number; opacity?: number; seed?: string; transform?: string}> = ({d, fill, dx = 7, dy = 5, opacity = 1, seed = 'rf', transform}) => {
  const frame = useCurrentFrame();
  const bx = boil(frame, seed + 'x', 1.2);
  const by = boil(frame, seed + 'y', 1.2);
  return (
    <g transform={transform}>
      <path d={d} fill={fill} opacity={opacity} transform={`translate(${(dx + bx).toFixed(2)} ${(dy + by).toFixed(2)})`} style={{mixBlendMode: 'multiply'}} />
    </g>
  );
};
