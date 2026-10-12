import React from 'react';
import {Composition} from 'remotion';
import {FullFilm, ReelFilm} from './Film';
import {EditCompositions} from './EditRoot';
import {FPS, REEL_END, REEL_START, SONG_DURATION} from './theme';

export const Root: React.FC = () => (
  <>
    <Composition id="AshkeFull" component={FullFilm} width={1920} height={1080} fps={FPS} durationInFrames={Math.round(SONG_DURATION * FPS)} />
    <Composition
      id="AshkeReel"
      component={ReelFilm}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={Math.round((REEL_END - REEL_START) * FPS)}
      defaultProps={{songStart: REEL_START, songEnd: REEL_END}}
    />
    <EditCompositions />
  </>
);
