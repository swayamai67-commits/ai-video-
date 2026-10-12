import React from 'react';
import {AbsoluteFill} from 'remotion';
import {drift} from '../Camera';
import {F} from '../fonts';
import {clamp, ease, prog, tc, useT} from '../lib';
import {C, MV_DURATION} from '../theme';

/** Rig visibility over the film: boots up, dims for the butler's dialogue, powers down at the end. */
export const rigLevel = (t: number) => {
  const boot = ease.outCubic(prog(t, 0.6, 2.2));
  const quiet = 1 - 0.55 * Math.min(ease.inOutSine(prog(t, 85.2, 86.2)), 1 - ease.inOutSine(prog(t, 104.6, 105.6)));
  const off = 1 - ease.inCubic(prog(t, 214.2, 215.6));
  return boot * quiet * off;
};

const Corner: React.FC<{x: number; y: number; sx: number; sy: number}> = ({x, y, sx, sy}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 46, height: 46, transform: `scale(${sx},${sy})`, transformOrigin: '0 0'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 46, height: 2, background: C.ivory}} />
    <div style={{position: 'absolute', left: 0, top: 0, width: 2, height: 46, background: C.ivory}} />
  </div>
);

/** Always-on recording frame: corner marks, REC, title, timecode, coordinates. */
export const Rig: React.FC = () => {
  const t = useT();
  const lv = rigLevel(t);
  if (lv <= 0.001) return null;
  const d = drift(t);
  const blink = Math.floor(t * 1.6) % 2 === 0;
  const mono: React.CSSProperties = {fontFamily: F.mono, fontSize: 18, letterSpacing: 2.2, color: C.ivory, textShadow: '0 1px 6px rgba(0,0,0,0.6)'};
  const bootIn = (k: number) => clamp(prog(t, 0.8 + k * 0.18, 1.2 + k * 0.18));
  const prog01 = clamp(t / MV_DURATION);
  return (
    <AbsoluteFill style={{opacity: lv * 0.92, transform: `translate(${d.x}px, ${d.y}px)`}}>
      <Corner x={40} y={40} sx={1} sy={1} />
      <Corner x={1880} y={40} sx={-1} sy={1} />
      <Corner x={40} y={1040} sx={1} sy={-1} />
      <Corner x={1880} y={1040} sx={-1} sy={-1} />
      <div style={{...mono, position: 'absolute', left: 64, top: 58, display: 'flex', gap: 14, alignItems: 'center', opacity: bootIn(0)}}>
        <span style={{width: 13, height: 13, borderRadius: 13, background: C.red, opacity: blink ? 1 : 0.2}} />
        <span style={{fontWeight: 700}}>REC</span>
        <span style={{opacity: 0.75}}>AUJLA SZN 1 / ASHKE</span>
      </div>
      <div style={{...mono, position: 'absolute', right: 64, top: 58, opacity: bootIn(1)}}>TC {tc(t)}</div>
      <div style={{...mono, position: 'absolute', left: 64, bottom: 56, fontSize: 15, opacity: 0.7 * bootIn(2)}}>
        51.7621° N · 0.4512° W · ENGLAND
      </div>
      {/* film progress hairline, top edge */}
      <div style={{position: 'absolute', left: 64, right: 64, top: 96, height: 1, background: 'rgba(245,239,228,0.18)', opacity: bootIn(3)}}>
        <div style={{width: `${prog01 * 100}%`, height: 1, background: C.champagne}} />
      </div>
    </AbsoluteFill>
  );
};
