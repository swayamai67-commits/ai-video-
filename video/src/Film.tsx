import React from 'react';
import {AbsoluteFill, Audio, interpolate, OffthreadVideo, staticFile} from 'remotion';
import {ensureFonts} from './fonts';
import {C, FPS} from './theme';
import {Format, FormatCtx, useT} from './lib/time';
import {Grain, Letterbox, ProgrammeLabels, Scrim} from './components/Chrome';
import {LyricTrack} from './components/LyricTrack';
import {ArrivalLabels, AshkeTitle, Invitation, MercySeal, OhOhLine, TitleCard, sealImpactTime} from './moments/Intro';
import {ColourBeats, Embers, HookPop, Milestone, Reticle, SHOT_TIME} from './moments/Verse';
import {DAKA_T, DakaStamp, Falcon, PhotoNotPosted, Portrait, Postcard, Snake, WatchBezel} from './moments/Middle';
import {ASHKE_HITS, Coda, Finale, ReelOpen, ReelOutro} from './moments/Finale';

ensureFonts();

// camera impulses (song time, strength): physical hits shake the whole frame
const IMPACTS: [number, number][] = [
  [sealImpactTime, 1],
  [48.22, 0.35],
  [SHOT_TIME, 1],
  [DAKA_T, 0.7],
  [ASHKE_HITS[0], 0.45],
  [ASHKE_HITS[1], 0.7],
  [ASHKE_HITS[2], 1],
];
const shakeAt = (t: number) => {
  let x = 0, y = 0, s = 1;
  for (const [ti, k] of IMPACTS) {
    const dt = t - ti;
    if (dt < 0 || dt > 0.6) continue;
    const env = Math.exp(-dt * 9) * k;
    x += env * 16 * Math.sin(dt * 70 + ti);
    y += env * 12 * Math.cos(dt * 61 + ti * 2);
    s += env * 0.025;
  }
  return {x, y, s};
};

const Stage: React.FC<{plate: string}> = ({plate}) => {
  const t = useT();
  const sh = shakeAt(t);
  const camera = `translate(${sh.x}px, ${sh.y}px) scale(${sh.s})`;
  return (
    <AbsoluteFill style={{background: C.night, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: camera}}>
        <OffthreadVideo src={staticFile(plate)} muted />
        <Scrim />
        {/* under the letterbox: graphics that live inside the picture */}
        <ArrivalLabels />
        <OhOhLine />
        <ColourBeats />
        <Embers />
        <Milestone />
        <Portrait />
        <PhotoNotPosted />
        <WatchBezel />
        <Falcon />
        <Snake />
        <AshkeTitle />
        <HookPop />
        <Reticle />
        <DakaStamp />
        <Finale />
        <LyricTrack />
        <Postcard />
        <MercySeal />
        <Coda />
      </AbsoluteFill>
      <Letterbox />
      <ProgrammeLabels />
      {/* over everything: full-frame design moments */}
      <Invitation />
      <TitleCard />
      <ReelOpen />
      <ReelOutro />
      <Grain />
    </AbsoluteFill>
  );
};

export const FullFilm: React.FC = () => {
  const fmt: Format = {kind: 'full', W: 1920, H: 1080, songStart: 0, songEnd: 217.81};
  return (
    <FormatCtx.Provider value={fmt}>
      <Audio src={staticFile('song.mp3')} />
      <Stage plate="plates/full.mp4" />
    </FormatCtx.Provider>
  );
};

export const ReelFilm: React.FC<{songStart: number; songEnd: number}> = ({songStart, songEnd}) => {
  const fmt: Format = {kind: 'reel', W: 1080, H: 1920, songStart, songEnd};
  const total = Math.round((songEnd - songStart) * FPS);
  return (
    <FormatCtx.Provider value={fmt}>
      <Audio
        src={staticFile('song.mp3')}
        trimBefore={Math.round(songStart * FPS)}
        volume={(f) => interpolate(f, [0, 6, total - 20, total], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      />
      <Stage plate="plates/reel.mp4" />
    </FormatCtx.Provider>
  );
};

