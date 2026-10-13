import React from 'react';
import {C} from '../theme';
import {ease, inv} from '../lib/time';

/**
 * A word that rises out of its own baseline mask on its timestamp, with overshoot and a
 * small counter-rotation (follow-through). Optional bee-line underline draws while it's sung.
 */
export const RiseWord: React.FC<{
  t: number;
  start: number;
  end?: number;
  text: string;
  dur?: number;
  style?: React.CSSProperties;
  underline?: string | false;
  gap?: string;
}> = ({t, start, end, text, dur = 0.3, style, underline = false, gap = '0.22em'}) => {
  const lead = 0.06; // type starts moving a hair before the syllable lands
  const p = inv(start - lead, start - lead + dur, t);
  const e = p <= 0 ? 0 : ease.outBack(p, 2.1);
  const y = (1 - e) * 115;
  const r = (1 - e) * 7;
  const u = underline && end !== undefined ? ease.outCubic(inv(start, Math.max(end, start + 0.18), t)) : 0;
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        overflow: 'hidden',
        verticalAlign: 'bottom',
        padding: '0.06em 0.12em 0.16em 0.04em',
        margin: `0 calc(${gap} - 0.16em) 0 0`,
      }}
    >
      <span style={{display: 'inline-block', transform: `translateY(${y}%) rotate(${r}deg)`, transformOrigin: '0% 100%', ...style}}>{text}</span>
      {underline && u > 0 && (
        <svg style={{position: 'absolute', left: '0.04em', bottom: '0.02em', width: '100%', height: '0.14em', overflow: 'visible'}} viewBox="0 0 100 10" preserveAspectRatio="none">
          <line x1={0} y1={5} x2={92 * u} y2={5} stroke={underline || C.cream} strokeWidth={3.2} strokeDasharray="7 6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
    </span>
  );
};

/** Handwritten word: revealed left→right like a pen stroke, over the word's sung duration. */
export const InkWord: React.FC<{t: number; start: number; end: number; text: string; style?: React.CSSProperties; minDur?: number}> = ({
  t,
  start,
  end,
  text,
  style,
  minDur = 0.16,
}) => {
  const p = ease.outQuart(inv(start - 0.02, start - 0.02 + Math.max(minDur, (end - start) * 0.9), t));
  return (
    <span style={{display: 'inline-block', marginRight: '0.28em', clipPath: `inset(-70% ${(1 - p) * 104}% -40% -8%)`, ...style}}>{text}</span>
  );
};
