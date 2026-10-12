import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {C} from './config';
import {ensureViralFonts} from './fonts';
import {LyricLayer} from './Lyrics';
import {Intro} from './scenes/Intro';
import {Verse} from './scenes/Verse';
import {Middle} from './scenes/Middle';
import {End} from './scenes/End';

ensureViralFonts();

/** ASHKE viral cut, 1080x1920, the full song. One song clock: frame / FPS. */
export const ViralFilm: React.FC = () => (
  <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
    <Audio src={staticFile('song.mp3')} />
    <Intro />
    <Verse />
    <Middle />
    <End />
    <LyricLayer />
  </AbsoluteFill>
);
