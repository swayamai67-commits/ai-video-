import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {Defs, Grain} from './components/Paper';
import {ensureFonts} from './fonts';
import {S1Head} from './scenes/S1Head';
import {S2Bed} from './scenes/S2Bed';
import {S3Night} from './scenes/S3Night';
import {S5Phone} from './scenes/S5Phone';
import {S7Heart} from './scenes/S7Heart';
import {S8Apart} from './scenes/S8Apart';

ensureFonts();

export const Film: React.FC = () => (
  <AbsoluteFill style={{background: '#F3EBDD', overflow: 'hidden'}}>
    <Defs />
    <S1Head />
    <S2Bed />
    <S7Heart />
    <S5Phone />
    <S3Night />
    <S8Apart />
    <Grain opacity={0.42} />
    <Audio src={staticFile('song.mp3')} />
  </AbsoluteFill>
);
