import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';
import {FPS, H, SONG_DURATION, W} from './theme';

export const Root: React.FC = () => (
  <Composition id="Earrings" component={Film} width={W} height={H} fps={FPS} durationInFrames={Math.round(SONG_DURATION * FPS)} />
);
