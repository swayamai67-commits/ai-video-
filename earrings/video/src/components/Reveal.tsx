import React from 'react';
import {E, ramp} from '../lib/time';

/** A word that resolves out of soft focus: blur → sharp, small rise, tracking tightens. */
export const Reveal: React.FC<{
  t: number;
  at: number;
  dur?: number;
  out?: number;
  outDur?: number;
  rise?: number;
  blur?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({t, at, dur = 0.38, out, outDur = 0.3, rise = 22, blur = 14, children, style}) => {
  const p = ramp(t, at - 0.05, at - 0.05 + dur, E.out);
  const q = out === undefined ? 0 : ramp(t, out, out + outDur, E.in);
  if (p <= 0 || q >= 1) return <span style={{...style, opacity: 0}}>{children}</span>;
  const b = blur * (1 - p) + blur * 0.8 * q;
  return (
    <span
      style={{
        display: 'inline-block',
        opacity: p * (1 - q),
        transform: `translateY(${rise * (1 - p) - rise * 0.5 * q}px)`,
        filter: b > 0.2 ? `blur(${b}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
};
