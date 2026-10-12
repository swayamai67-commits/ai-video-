import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile} from 'remotion';
import {matteFrame} from './data';
import {useT} from './lib';

export const Plate: React.FC<{src: string}> = ({src}) => (
  <OffthreadVideo src={src} muted style={{width: '100%', height: '100%', objectFit: 'fill'}} />
);

/**
 * The footage again, cut out by the person matte, so anything drawn between the two
 * copies sits *behind* the people. The hidden <Img> makes Remotion wait for the mask frame.
 */
export const Foreground: React.FC<{src: string}> = ({src}) => {
  const t = useT();
  const url = staticFile(`matte/${String(matteFrame(t)).padStart(5, '0')}.png`);
  return (
    <AbsoluteFill>
      <Img src={url} style={{position: 'absolute', width: 4, height: 4, opacity: 0}} />
      <AbsoluteFill
        style={{
          WebkitMaskImage: `url(${url})`,
          maskImage: `url(${url})`,
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
        }}
      >
        <Plate src={src} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
