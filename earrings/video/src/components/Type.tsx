import React from 'react';
import {useCurrentFrame} from 'remotion';
import {boil, clamp, ease} from '../lib/time';
import {C, F} from '../theme';

type Box = {x: number; y: number; anchor?: 'left' | 'center' | 'right'; rot?: number};

/** Absolutely positioned type block (x,y = baseline-ish top-left in 1080x1920 space). */
export const Txt: React.FC<
  Box & {children: React.ReactNode; size: number; font?: string; color?: string; italic?: boolean; weight?: number; ls?: number; style?: React.CSSProperties; opacity?: number; lh?: number}
> = ({x, y, anchor = 'left', rot = 0, children, size, font = F.serif, color = C.ink, italic, weight = 400, ls = 0, style, opacity = 1, lh = 1}) => {
  const tx = anchor === 'left' ? '0%' : anchor === 'center' ? '-50%' : '-100%';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${tx}, 0) rotate(${rot}deg)`,
        transformOrigin: anchor === 'center' ? '50% 50%' : anchor === 'left' ? '0% 50%' : '100% 50%',
        fontFamily: font,
        fontSize: size,
        fontStyle: italic ? 'italic' : 'normal',
        fontWeight: weight,
        letterSpacing: ls,
        lineHeight: lh,
        color,
        whiteSpace: 'nowrap',
        opacity,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Masked rise: the word comes up from behind its own baseline with a little overshoot and settle. */
export const Rise: React.FC<{p: number; children: React.ReactNode; tilt?: number; from?: number}> = ({p, children, tilt = 6, from = 110}) => {
  const q = ease.back(clamp(p));
  return (
    <span style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '0.12em', marginBottom: '-0.12em', paddingRight: '0.08em'}}>
      <span style={{display: 'inline-block', transform: `translateY(${(1 - q) * from}%) rotate(${(1 - q) * tilt}deg)`, transformOrigin: '0% 100%', opacity: p > 0 ? 1 : 0}}>
        {children}
      </span>
    </span>
  );
};

/** Letters that write themselves in with a short ink-bleed (blur→sharp) and stagger. */
export const Letters: React.FC<{
  text: string;
  t: number;
  t0: number;
  t1: number;
  seed?: string;
  shake?: number;
  dy?: number;
  render?: (ch: string, i: number, p: number) => React.CSSProperties;
}> = ({text, t, t0, t1, seed = 'L', shake = 0, dy = 0.35, render}) => {
  const frame = useCurrentFrame();
  const chars = [...text];
  const n = chars.length;
  return (
    <>
      {chars.map((ch, i) => {
        const a = t0 + ((t1 - t0) * i) / Math.max(1, n);
        const p = ease.out(clamp((t - a) / 0.32));
        const sx = shake ? boil(frame, `${seed}${i}x`, shake, 3) : 0;
        const sy = shake ? boil(frame, `${seed}${i}y`, shake, 3) : 0;
        const extra = render ? render(ch, i, p) : {};
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: p,
              filter: p < 0.98 ? `blur(${(1 - p) * 10}px)` : undefined,
              transform: `translate(${sx}px, ${(1 - p) * dy * 100 + sy}px)`,
              whiteSpace: 'pre',
              ...extra,
            }}
          >
            {ch}
          </span>
        );
      })}
    </>
  );
};
