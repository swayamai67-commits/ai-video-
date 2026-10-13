import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, staticFile} from 'remotion';
import {noise2D} from '@remotion/noise';
import {Grain, Vignette} from './components/Overlays';
import {fontsReady} from './fonts';
import {kickEnv} from './lib/beats';
import {useT} from './lib/time';
import {HeadSheet} from './scenes/HeadSheet';
import {Thread} from './scenes/Thread';
import {Oh, WireDrift} from './scenes/Drift';
import {C} from './theme';

const fontHandle = {current: null as number | null};

const useFonts = () => {
  const [h] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    fontsReady.then(() => continueRender(h));
  }, [h]);
  return fontHandle;
};

/** Subtle handheld camera: slow seeded drift, never more than a few px. */
const Camera: React.FC<{t: number; children: React.ReactNode}> = ({t, children}) => {
  const x = noise2D('cx', t * 0.35, 0) * 5;
  const y = noise2D('cy', t * 0.3, 0) * 6;
  const r = noise2D('cr', t * 0.25, 0) * 0.25;
  return (
    <AbsoluteFill style={{transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(1.012)`}}>{children}</AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  useFonts();
  const t = useT();
  const pulse = kickEnv(t, 0.1);
  return (
    <AbsoluteFill style={{background: C.midnight}}>
      <Audio src={staticFile('song.mp3')} />
      <Camera t={t}>
        {t > 18.2 && <WireDrift t={t} />}
        {t > 27.6 && <Oh t={t} />}
        {t > 6.28 && t < 18.5 && <Thread t={t} />}
        {t < 6.6 && <HeadSheet t={t} />}
      </Camera>
      <Vignette strength={0.5} />
      <AbsoluteFill style={{background: '#fff', opacity: 0.018 * pulse, mixBlendMode: 'screen'}} />
      <Grain opacity={0.16} />
    </AbsoluteFill>
  );
};
