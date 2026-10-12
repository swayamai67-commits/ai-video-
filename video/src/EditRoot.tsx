import React from 'react';
import {Composition, staticFile} from 'remotion';
import {EditFilm} from './edit/EditFilm';
import {MV_DURATION} from './edit/theme';

/**
 * AshkeFront / AshkeBehind: transparent 4K60 graphics layers for upscale/finish.py.
 * AshkePreview: the whole look in Chrome at 1080p25 on the original 720p MV, for look-dev and QA.
 */
export const EditCompositions: React.FC = () => (
  <>
    <Composition id="AshkeFront" component={EditFilm} width={3840} height={2160} fps={60}
      durationInFrames={MV_DURATION * 60} defaultProps={{plate: '', mode: 'front' as const}} />
    <Composition id="AshkeBehind" component={EditFilm} width={3840} height={2160} fps={60}
      durationInFrames={MV_DURATION * 60} defaultProps={{plate: '', mode: 'behind' as const}} />
    <Composition id="AshkePreview" component={EditFilm} width={1920} height={1080} fps={25}
      durationInFrames={MV_DURATION * 25} defaultProps={{plate: staticFile('mv.mp4'), mode: 'preview' as const}} />
  </>
);
