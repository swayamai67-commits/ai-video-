import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {C} from './theme';
import {useT} from './lib/time';
import {Flash, Grain, Vignette, shake} from './fx/fx';
import {KissScene} from './scenes/Kiss';
import {TunnelScene} from './scenes/Tunnel';
import {WorldScene} from './scenes/World';
import {Dusk, Swarm} from './scenes/Finale';

export const Film: React.FC = () => {
  const t = useT();
  const s = shake(t);
  return (
    <AbsoluteFill style={{background: C.black, overflow: 'hidden'}}>
      <Audio src={staticFile('song.mp3')} />
      <AbsoluteFill style={{transform: `translate(${s.x}px, ${s.y}px) rotate(${s.r}deg) scale(${1.012 + s.s})`}}>
        <KissScene t={t} />
        <TunnelScene t={t} />
        <WorldScene t={t} />
        <Swarm t={t} />
      </AbsoluteFill>
      <Dusk t={t} />
      <Flash t={t} />
      <Vignette strength={0.38} />
      <Grain opacity={0.1} />
    </AbsoluteFill>
  );
};
