import React from 'react';
import {Img, staticFile} from 'remotion';
import {C} from '../theme';

/**
 * The Flower Boy cover as a physical print. Layer order inside the card:
 *   painted plate → `behind` (type that sits behind Tyler) → Tyler cut-out → `front` → cream border.
 * All children are positioned in the card's own pixel space (0..size).
 */
export const CoverCard: React.FC<{
  size: number;
  border?: number; // fraction of size
  behind?: React.ReactNode;
  front?: React.ReactNode;
  tyler?: boolean;
  tylerShift?: [number, number];
  shadow?: string;
  style?: React.CSSProperties;
}> = ({size, border = 0.018, behind, front, tyler = true, tylerShift = [0, 0], shadow, style}) => {
  const b = size * border;
  return (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        left: -size / 2,
        top: -size / 2,
        boxShadow: shadow,
        background: C.cream,
        ...style,
      }}
    >
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <Img src={staticFile('cover/cover.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
        {behind}
        {tyler && (
          <Img
            src={staticFile('cover/tyler.png')}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              transform: `translate(${tylerShift[0]}px, ${tylerShift[1]}px)`,
            }}
          />
        )}
        {front}
      </div>
      {b > 0 && <div style={{position: 'absolute', inset: 0, border: `${b}px solid ${C.cream}`, pointerEvents: 'none'}} />}
    </div>
  );
};
