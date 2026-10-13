import React from 'react';
import {useCurrentFrame} from 'remotion';
import {boil} from '../lib/time';
import {C} from '../theme';

/**
 * The hero object: one gold hoop earring. `spin` is a rotation about the vertical axis (radians),
 * drawn as an ellipse whose width follows cos(spin) so the hoop turns in 3D.
 */
export const Hoop: React.FC<{x: number; y: number; r: number; w?: number; spin?: number; tilt?: number; opacity?: number; clasp?: boolean; glint?: number}> = ({
  x, y, r, w = 10, spin = 0, tilt = 0, opacity = 1, clasp = true, glint = 0,
}) => {
  const frame = useCurrentFrame();
  const c = Math.cos(spin);
  const rx = Math.max(Math.abs(c) * r, w * 0.35);
  const shine = 0.55 + 0.45 * Math.abs(Math.sin(spin * 1.0 + 0.6));
  const g = glint > 0 ? glint : 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`} opacity={opacity}>
      {/* soft shadow */}
      <ellipse cx={w * 0.5} cy={w * 0.6} rx={rx} ry={r} fill="none" stroke={C.ink} strokeOpacity={0.18} strokeWidth={w} />
      <ellipse cx={0} cy={0} rx={rx} ry={r} fill="none" stroke="url(#goldGrad)" strokeWidth={w} />
      {/* deep edge for metal volume */}
      <ellipse cx={0} cy={0} rx={rx} ry={r} fill="none" stroke={C.goldDeep} strokeWidth={w * 0.22} strokeOpacity={0.55} transform={`translate(${w * 0.18} ${w * 0.22})`} />
      {/* travelling highlight */}
      <path
        d={`M ${-rx * 0.86} ${-r * 0.5} A ${rx} ${r} 0 0 1 ${-rx * 0.1} ${-r * 0.99}`}
        fill="none"
        stroke={C.goldLight}
        strokeWidth={w * 0.32}
        strokeLinecap="round"
        opacity={shine}
      />
      {clasp && <rect x={-w * 0.32} y={-r - w * 1.1} width={w * 0.64} height={w * 1.4} rx={w * 0.3} fill={C.goldDeep} />}
      {g > 0 && <Sparkle x={rx * 0.6} y={-r * 0.75} s={w * 3.2 * g} rot={boil(frame, 'hg', 10)} />}
    </g>
  );
};

/** Four-point twinkle. */
export const Sparkle: React.FC<{x: number; y: number; s: number; rot?: number; color?: string}> = ({x, y, s, rot = 0, color = C.goldLight}) => {
  if (s <= 0.2) return null;
  const k = s * 0.18;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M0 ${-s} Q ${k} ${-k} ${s} 0 Q ${k} ${k} 0 ${s} Q ${-k} ${k} ${-s} 0 Q ${-k} ${-k} 0 ${-s} Z`} fill={color} />
      <circle r={s * 0.16} fill="#fff" />
    </g>
  );
};
