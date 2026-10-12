import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {BehindWords, behindActive} from './Behind';
import {camera} from './Camera';
import {Foreground, Plate} from './Footage';
import {ensureEditFonts} from './fonts';
import {FX} from './fx';
import {Flashes, Grain, Leak, Vignette} from './fx/Film';
import {Rig} from './hud/Rig';
import {useT} from './lib';
import {Lyrics} from './Lyrics';
import {Moments} from './moments';
import {DH, DW} from './theme';

/**
 * mode
 *  preview: the whole look composited in Chrome on the 720p MV (look development, QA stills)
 *  front:   transparent graphics layer over the picture (lyrics, HUD, moments)
 *  behind:  transparent layer of the giant words that sit behind the people
 * The 4K60 master is front + behind composited onto the upscaled plate by upscale/finish.py.
 */
export type EditProps = {plate: string; mode: 'preview' | 'front' | 'behind'};

export const EditFilm: React.FC<EditProps> = ({plate, mode}) => {
  ensureEditFonts();
  const {width} = useVideoConfig();
  const t = useT();
  const cam = mode === 'preview' ? camera(t, FX.hits, FX.hooks) : {x: 0, y: 0, rot: 0, scale: 1};
  const design: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: DW, height: DH, transform: `scale(${width / DW})`, transformOrigin: '0 0'};
  if (mode === 'behind') {
    return <AbsoluteFill><div style={design}><BehindWords /></div></AbsoluteFill>;
  }
  if (mode === 'front') {
    return (
      <AbsoluteFill>
        <div style={design}>
          <Moments />
          <Lyrics />
          <Rig />
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={design}>
        <AbsoluteFill style={{transform: `translate(${cam.x}px, ${cam.y}px) rotate(${cam.rot}deg) scale(${cam.scale})`}}>
          <Plate src={plate} />
          <BehindWords />
          {behindActive(t) && <Foreground src={plate} />}
          <Vignette />
          {FX.leaks.map((l, k) => <Leak key={k} {...l} />)}
          <Moments />
          <Lyrics />
          <Rig />
        </AbsoluteFill>
        <Flashes cues={FX.flashes} />
        <Grain />
      </div>
    </AbsoluteFill>
  );
};
