import React from 'react';
import {Img, staticFile} from 'remotion';
import plates from './data/plates.json';
import {FPS} from './config';
import {clamp, useT} from './lib';

type PlateMeta = {t0: number; t1: number; n: number; w: number; h: number; cut: boolean};
export const PLATES = plates as Record<string, PlateMeta>;

/**
 * Maps song time -> frame index of a plate clip.
 *  from: song time the clip starts playing
 *  src:  source offset in seconds inside the clip (default 0)
 *  speed: playback speed (velocity ramps pass a function instead)
 *  sync: play the clip at its own song time (lip-sync), ignoring from/src
 */
export type Timing = {from?: number; src?: number; speed?: number; sync?: boolean; ramp?: (t: number) => number; hold?: boolean; step?: number};

export const frameAt = (clip: string, t: number, tm: Timing) => {
  const m = PLATES[clip];
  if (!m) return 0;
  let s: number;
  if (tm.ramp) s = tm.ramp(t);
  else if (tm.sync) s = t - m.t0;
  else s = (tm.src ?? 0) + (t - (tm.from ?? 0)) * (tm.speed ?? 1);
  let f = Math.floor(s * FPS + 1e-6);
  if (tm.step) f = Math.floor(f / tm.step) * tm.step; // shoot "on twos"
  return clamp(f, 0, m.n - 1);
};

export const plateSrc = (clip: string, f: number) => staticFile(`viral/plates/${clip}/${String(f).padStart(4, '0')}.jpg`);
export const cutSrc = (clip: string, f: number) => staticFile(`viral/cut/${clip}/${String(f).padStart(4, '0')}.webp`);

type Props = Timing & {
  clip: string;
  cut?: boolean; // render the person cutout instead of the plate
  style?: React.CSSProperties;
  filter?: string;
  /** object-fit box; default fills the parent */
  fit?: 'cover' | 'contain';
  pos?: string;
};

export const Plate: React.FC<Props> = ({clip, cut, style, filter, fit = 'cover', pos = '50% 50%', ...tm}) => {
  const t = useT();
  const f = frameAt(clip, t, tm);
  const src = cut ? cutSrc(clip, f) : plateSrc(clip, f);
  return (
    <Img
      src={src}
      style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: fit, objectPosition: pos, filter, ...style}}
    />
  );
};
