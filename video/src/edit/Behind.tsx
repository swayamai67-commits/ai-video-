import React from 'react';
import {AbsoluteFill} from 'remotion';
import {shotAt, subjectAt, word, Word} from './data';
import {F} from './fonts';
import {clamp, ease, mix, prog, springAt, useT} from './lib';
import {C, DW} from './theme';

/** A giant word placed between the footage and the cut-out people. */
export type BehindCue = {
  w: Word;
  text?: string;
  hold?: number; // seconds after the word ends
  size?: number; // design px (cap height ~ 0.72 of this)
  y?: number; // centre, 0..1 of frame height
  x?: number; // centre override, 0..1
  color?: string;
  gold?: boolean;
  dev?: boolean; // add a Devanagari ghost behind it
};

const W = (id: number, k: number) => word(id, k);
export const BEHIND: BehindCue[] = [
  {w: W(9, 6), text: 'ASHKE', size: 420, y: 0.44, hold: 0.9, gold: true},
  {w: W(12, 3), text: 'JATT', size: 520, y: 0.42, hold: 0.7},
  {w: W(29, 3), text: 'SEENA', size: 400, y: 0.4, hold: 0.6},
  {w: W(49, 4), text: 'LAMBO', size: 430, y: 0.42, hold: 0.25, gold: true},
  {w: W(78, 0), text: 'NAAG', size: 520, y: 0.42, hold: 0.7},
  {w: W(82, 6), text: 'ASHKE', size: 470, y: 0.43, hold: 1.0, gold: true, dev: true},
  {w: W(84, 6), text: 'ASHKE', size: 520, y: 0.43, hold: 1.0, gold: true, dev: true},
  {w: W(86, 6), text: 'ASHKE', size: 600, y: 0.43, hold: 1.6, gold: true, dev: true},
];

// never let a word outlive its shot: it belongs to the picture it was set into
const cueWindow = (c: BehindCue) => ({a: c.w.s - 0.08, b: Math.min(c.w.e + (c.hold ?? 0.7), shotAt(c.w.s).end - 0.36)});
export const behindActive = (t: number) => BEHIND.some((c) => {
  const {a, b} = cueWindow(c);
  return t >= a && t <= b + 0.35;
});

export const BehindWords: React.FC = () => {
  const t = useT();
  return (
    <>
      {BEHIND.map((c, k) => {
        const {a, b} = cueWindow(c);
        if (t < a || t > b + 0.35) return null;
        const sp = springAt(t - a, 2.2, 0.34);
        const out = ease.inCubic(prog(t, b, b + 0.35));
        const sub = subjectAt(a + 0.05);
        const size = c.size ?? 460;
        const text = c.text ?? c.w.w.toUpperCase();
        const halfW = (text.length * 0.47 * size) / 2 / DW + 0.03; // Anton caps ~0.47em wide
        const cx = c.x ?? clamp(sub ? sub.cx : 0.5, Math.min(0.5, halfW), Math.max(0.5, 1 - halfW));
        const track = mix(0.45, 0.02, ease.outExpo(prog(t, a, a + 0.5))) + out * 0.25;
        const fill = c.gold
          ? `linear-gradient(180deg, #FFF3D6 0%, ${C.champagne} 48%, #9C7432 100%)`
          : `linear-gradient(180deg, #FFFFFF 0%, ${C.ivory} 60%, #CFC6B6 100%)`;
        return (
          <AbsoluteFill key={k} style={{opacity: clamp(prog(t, a, a + 0.08)) * (1 - out)}}>
            {c.dev && (
              <div
                style={{
                  position: 'absolute', left: cx * DW, top: `${(c.y ?? 0.42) * 100 - 6}%`,
                  transform: `translate(-50%, -50%) scale(${1.15 + 0.08 * sp})`,
                  fontFamily: F.dev, fontWeight: 800, fontSize: size * 0.95, color: 'rgba(230,194,122,0.16)', whiteSpace: 'nowrap',
                }}
              >
                {c.w.dev}
              </div>
            )}
            <div
              style={{
                position: 'absolute',
                left: cx * DW,
                top: `${(c.y ?? 0.42) * 100}%`,
                transform: `translate(-50%, -50%) scale(${mix(1.35, 1, sp) + out * 0.08})`,
                fontFamily: F.hero,
                fontSize: size,
                lineHeight: 1,
                letterSpacing: `${track}em`,
                whiteSpace: 'nowrap',
                backgroundImage: fill,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                filter: 'drop-shadow(0 18px 40px rgba(0,0,0,0.45))',
              }}
            >
              {text}
            </div>
          </AbsoluteFill>
        );
      })}
    </>
  );
};
