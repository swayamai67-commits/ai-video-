import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, W} from '../config';
import {Plate, Timing} from '../Plate';
import {useT} from '../lib';
import {Grain, Vignette} from '../fx';

export const Sc: React.FC<{a: number; b: number; children: React.ReactNode}> = ({a, b, children}) => {
  const t = useT();
  if (t < a || t >= b) return null;
  return <AbsoluteFill style={{overflow: 'hidden'}}>{children}</AbsoluteFill>;
};

export const GRADE = {
  feed: 'contrast(1.15) saturate(0.82) brightness(0.92)',
  warm: 'contrast(1.12) saturate(1.05) sepia(0.18) brightness(0.98)',
  noir: 'grayscale(1) contrast(1.35) brightness(0.9)',
  cold: 'contrast(1.2) saturate(0.6) hue-rotate(-8deg) brightness(0.9)',
  fire: 'contrast(1.2) saturate(1.3) sepia(0.35) hue-rotate(-12deg) brightness(1.02)',
};

/** Full-bleed vertical plate. */
export const Full: React.FC<Timing & {clip: string; grade?: string; dim?: number; cut?: boolean}> = ({clip, grade = GRADE.feed, dim = 0, cut, ...tm}) => (
  <AbsoluteFill>
    <Plate clip={clip} filter={grade} cut={cut} {...tm} />
    {dim > 0 && <AbsoluteFill style={{background: `rgba(0,0,0,${dim})`}} />}
  </AbsoluteFill>
);

/** Bottom gradient for legibility of lyrics over footage. */
export const Scrim: React.FC<{from?: number; amount?: number; top?: boolean}> = ({from = 45, amount = 0.85, top}) => (
  <AbsoluteFill
    style={{
      background: top
        ? `linear-gradient(0deg, transparent ${100 - from}%, rgba(0,0,0,${amount}) 100%)`
        : `linear-gradient(180deg, transparent ${from}%, rgba(0,0,0,${amount}) 100%)`,
    }}
  />
);

/** 16:9 strip plate (1080x608) at y. */
export const Strip: React.FC<Timing & {clip: string; y: number; grade?: string; children?: React.ReactNode; h?: number}> = ({clip, y, grade = GRADE.feed, children, h = 608, ...tm}) => (
  <div style={{position: 'absolute', left: 0, top: y, width: W, height: h, overflow: 'hidden'}}>
    <Plate clip={clip} filter={grade} {...tm} />
    {children}
  </div>
);

/** Text-behind-subject: plate, then the words, then the person cutout on top. */
export const Behind: React.FC<Timing & {clip: string; grade?: string; children: React.ReactNode; dim?: number; front?: React.ReactNode}> = ({clip, grade = GRADE.feed, children, dim = 0.15, front, ...tm}) => (
  <AbsoluteFill>
    <Plate clip={clip} filter={grade} {...tm} />
    <AbsoluteFill style={{background: `rgba(0,0,0,${dim})`}} />
    {children}
    <Plate clip={clip} cut filter={grade} {...tm} />
    {front}
  </AbsoluteFill>
);

export const Outline: React.FC<{txt: string; size: number; y: number; color?: string; stroke?: number; font?: string; style?: React.CSSProperties}> = ({
  txt,
  size,
  y,
  color = C.bone,
  stroke = 3,
  font = F.slam,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      width: '100%',
      top: y,
      textAlign: 'center',
      fontFamily: font,
      fontSize: size,
      lineHeight: 1,
      color: 'transparent',
      WebkitTextStroke: `${stroke}px ${color}`,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {txt}
  </div>
);

export const Finish: React.FC<{grain?: number; vignette?: number}> = ({grain = 0.18, vignette = 0.55}) => (
  <>
    <Vignette amount={vignette} />
    <Grain opacity={grain} />
  </>
);
