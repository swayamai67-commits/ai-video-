import React, {useId} from 'react';
import {C} from '../theme';

/**
 * A gold hoop earring drawn as a metal tube. `spin` is rotation about the vertical axis (radians):
 * 0 = facing camera (full circle), PI/2 = edge-on (a thin line). `roll` rotates in the picture plane (deg).
 */
export const Hoop: React.FC<{
  x: number;
  y: number;
  r: number;
  spin?: number;
  roll?: number;
  thick?: number;
  opacity?: number;
  glow?: number;
  post?: boolean;
  style?: React.CSSProperties;
}> = ({x, y, r, spin = 0, roll = 0, thick, opacity = 1, glow = 0.5, post = true, style}) => {
  const id = useId().replace(/:/g, '');
  const k = Math.max(0.04, Math.abs(Math.cos(spin)));
  const th = thick ?? Math.max(2.5, r * 0.17);
  const pad = th * 3 + 30;
  const size = r * 2 + pad * 2;
  // light direction sweeps as the ring turns, so the metal shimmers
  const sweep = Math.sin(spin) * 40;
  const rx = r * k;
  const circ = Math.PI * (3 * (rx + r) - Math.sqrt((3 * rx + r) * (rx + 3 * r)));
  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        opacity,
        overflow: 'visible',
        transform: `rotate(${roll}deg)`,
        filter: glow > 0 ? `drop-shadow(0 0 ${6 + 18 * glow}px rgba(246, 205, 120, ${0.35 * glow}))` : undefined,
        ...style,
      }}
    >
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1" gradientTransform={`rotate(${sweep} 0.5 0.5)`}>
          <stop offset="0" stopColor={C.gold1} />
          <stop offset="0.28" stopColor={C.gold2} />
          <stop offset="0.55" stopColor={C.gold4} />
          <stop offset="0.78" stopColor={C.gold2} />
          <stop offset="1" stopColor={C.gold3} />
        </linearGradient>
      </defs>
      {/* tube body */}
      <ellipse cx={0} cy={0} rx={rx} ry={r} fill="none" stroke={C.gold4} strokeWidth={th} />
      <ellipse cx={0} cy={0} rx={rx} ry={r} fill="none" stroke={`url(#g${id})`} strokeWidth={th * 0.78} />
      {/* specular streak along the upper-left arc */}
      <ellipse
        cx={-th * 0.12}
        cy={-th * 0.12}
        rx={rx}
        ry={r}
        fill="none"
        stroke={C.gold1}
        strokeOpacity={0.9}
        strokeWidth={th * 0.2}
        strokeLinecap="round"
        strokeDasharray={`${circ * 0.18} ${circ}`}
        strokeDashoffset={-circ * (0.55 + 0.06 * Math.sin(spin))}
      />
      {post && <line x1={0} y1={-r - th * 0.2} x2={0} y2={-r - th * 1.6} stroke={C.gold2} strokeWidth={th * 0.35} strokeLinecap="round" />}
    </svg>
  );
};

/** Four-point star glint. s = 0..1 intensity. */
export const Glint: React.FC<{x: number; y: number; size: number; s: number; rot?: number}> = ({x, y, size, s, rot = 0}) => {
  if (s <= 0.001) return null;
  const L = size * s;
  return (
    <svg
      width={size * 2}
      height={size * 2}
      viewBox={`${-size} ${-size} ${size * 2} ${size * 2}`}
      style={{position: 'absolute', left: x - size, top: y - size, overflow: 'visible', transform: `rotate(${rot}deg)`, mixBlendMode: 'screen'}}
    >
      <defs>
        <radialGradient id="glintcore">
          <stop offset="0" stopColor="#fff" stopOpacity={1} />
          <stop offset="0.3" stopColor="#FFE9B0" stopOpacity={0.6} />
          <stop offset="1" stopColor="#FFE9B0" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={L * 0.45} fill="url(#glintcore)" opacity={s} />
      <path d={`M 0 ${-L} L ${L * 0.05} 0 L 0 ${L} L ${-L * 0.05} 0 Z`} fill="#fff" opacity={s} />
      <path d={`M ${-L * 0.7} 0 L 0 ${L * 0.04} L ${L * 0.7} 0 L 0 ${-L * 0.04} Z`} fill="#fff" opacity={s} />
    </svg>
  );
};
