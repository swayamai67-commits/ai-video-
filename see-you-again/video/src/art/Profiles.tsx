import React from 'react';
import {staticFile} from 'remotion';
import {C, W, H} from '../theme';
import {smooth, P} from '../lib/geom';

/**
 * The kiss: two cut-paper profiles (him in the green cap, her with curls and a sunflower)
 * facing each other. The negative space between them is a Rubin's vase: the window the
 * cover is seen through. Coordinates are the kiss state in the 1920×1080 frame; `dx` slides
 * each profile outward (0 = lips touching).
 */

const CX = W / 2;
// half-gap from the centre line at each y (kiss state)
const BOY: [number, number][] = [
  [-80, 235], [120, 205], [250, 150], [330, 118], [368, 134], [430, 74], [478, 14], [503, 34], [527, 52],
  [548, 20], [566, 2], [586, 22], [614, 60], [660, 36], [722, 112], [790, 168], [900, 186], [1180, 196],
];
const GIRL: [number, number][] = [
  [-80, 240], [120, 196], [250, 160], [332, 128], [370, 142], [432, 82], [482, 22], [505, 40], [528, 54],
  [548, 16], [566, 2], [588, 16], [616, 52], [664, 40], [724, 120], [790, 172], [900, 190], [1180, 200],
];

const edge = (prof: [number, number][], side: -1 | 1): P[] => prof.map(([y, g]) => [CX + side * g, y]);

export const Profiles: React.FC<{dxBoy: number; dxGirl: number; t: number; lips: number; open?: number}> = ({
  dxBoy,
  dxGirl,
  t,
  lips,
}) => {
  const boyEdge = edge(BOY, -1);
  const girlEdge = edge(GIRL, 1);
  const boyPath = `M -600 -80 L ${boyEdge[0][0]} -80 ${smooth(boyEdge, 0.5, false)} L -600 1180 Z`;
  const girlPath = `M ${W + 600} -80 L ${girlEdge[0][0]} -80 ${smooth(girlEdge, 0.5, false)} L ${W + 600} 1180 Z`;
  const blink = 1; // eyes stay closed: it's a kiss
  const breathe = Math.sin(t * 2.4) * 2;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs>
        <pattern id="ht" width={256} height={256} patternUnits="userSpaceOnUse">
          <image href={staticFile('tex/halftone.png')} width={256} height={256} opacity={0.18} />
        </pattern>
        <linearGradient id="boyShade" x1="0" x2="1">
          <stop offset="0" stopColor="#0E271C" />
          <stop offset="1" stopColor={C.boy} />
        </linearGradient>
        <linearGradient id="girlShade" x1="1" x2="0">
          <stop offset="0" stopColor="#2E0C1E" />
          <stop offset="1" stopColor={C.girl} />
        </linearGradient>
      </defs>

      {/* HIM */}
      <g transform={`translate(${-dxBoy} ${breathe})`}>
        <path d={boyPath} fill="url(#boyShade)" />
        <path d={boyPath} fill="url(#ht)" />
        <path d={smooth(boyEdge)} fill="none" stroke={C.cream} strokeWidth={3} opacity={0.55} />
        {/* cap: dome + band + bill, slightly larger than the head */}
        <path
          d={`M ${CX - 146} 252 L ${CX - 40} 238 Q ${CX - 22} 230 ${CX - 34} 220 L ${CX - 128} 208
              C ${CX - 150} 140 ${CX - 260} 62 ${CX - 430} 44 C ${CX - 640} 24 ${CX - 900} 70 ${CX - 1200} 120
              L ${CX - 1200} 330 C ${CX - 900} 300 ${CX - 600} 270 ${CX - 146} 252 Z`}
          fill={C.cap}
        />
        <path d={`M ${CX - 146} 252 C ${CX - 600} 270 ${CX - 900} 300 ${CX - 1200} 330`} stroke="#1B4A33" strokeWidth={14} fill="none" />
        <path d={`M ${CX - 128} 208 C ${CX - 150} 140 ${CX - 260} 62 ${CX - 430} 44`} stroke={C.cream} strokeWidth={3} fill="none" opacity={0.5} />
        <circle cx={CX - 470} cy={52} r={10} fill="#1B4A33" />
        {/* closed eye + brow + ear */}
        <g transform={`translate(${CX - 238} 380)`} opacity={blink}>
          <path d="M -34 -4 Q 0 14 30 -2" stroke={C.cream} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M 18 4 l 8 12 M 4 8 l 4 13 M -10 8 l 0 13 M -24 4 l -5 12" stroke={C.cream} strokeWidth={3} strokeLinecap="round" />
          <path d="M -40 -46 Q 0 -60 40 -40" stroke={C.cream} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8} />
        </g>
        <path d={`M ${CX - 405} 395 C ${CX - 450} 372 ${CX - 486} 420 ${CX - 474} 470 C ${CX - 464} 510 ${CX - 438} 520 ${CX - 422} 500`} stroke={C.cream} strokeWidth={4} fill="none" opacity={0.45} strokeLinecap="round" />
      </g>

      {/* HER */}
      <g transform={`translate(${dxGirl} ${-breathe})`}>
        <path d={girlPath} fill="url(#girlShade)" />
        <path d={girlPath} fill="url(#ht)" />
        <path d={smooth(girlEdge)} fill="none" stroke={C.cream} strokeWidth={3} opacity={0.55} />
        {/* curls */}
        <g fill={C.hair}>
          {[
            [1140, 150, 96], [1250, 70, 120], [1400, 40, 132], [1560, 70, 140], [1720, 120, 146], [1880, 190, 160],
            [1190, 230, 54], [1520, 300, 110], [1640, 400, 122], [1760, 500, 130], [1900, 420, 150], [1880, 640, 140],
          ].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} />
          ))}
        </g>
        <g fill="none" stroke="#5A2440" strokeWidth={4} opacity={0.8} strokeLinecap="round">
          {[
            [1250, 70, 70], [1400, 40, 80], [1560, 70, 90], [1720, 120, 90], [1640, 400, 70], [1760, 500, 80], [1520, 300, 60],
          ].map(([x, y, r], i) => (
            <path key={i} d={`M ${x - r} ${y} A ${r} ${r} 0 0 1 ${x + r * 0.6} ${y - r * 0.8}`} />
          ))}
        </g>
        {/* sunflower tucked behind her ear */}
        <g transform={`translate(1395 330) rotate(${t * 12})`}>
          {Array.from({length: 14}).map((_, i) => (
            <ellipse key={i} cx={0} cy={-62} rx={17} ry={44} fill={i % 2 ? C.sun : '#F7B21F'} transform={`rotate(${(i * 360) / 14})`} />
          ))}
          <circle r={40} fill="#5B3212" />
          <circle r={40} fill="url(#ht)" />
        </g>
        {/* lips: the one lipstick-red touch in this scene */}
        <path d={`M ${CX + 20} 548 Q ${CX + 50} 556 ${CX + 64} 566 Q ${CX + 46} 580 ${CX + 16} 588 Q ${CX + 4} 576 ${CX + 2} 566 Q ${CX + 6} 554 ${CX + 20} 548 Z`} fill={C.lipstick} opacity={lips} />
        <g transform={`translate(${CX + 240} 382)`}>
          <path d="M 34 -4 Q 0 14 -30 -2" stroke={C.cream} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M -18 4 l -8 12 M -4 8 l -4 13 M 10 8 l 0 13 M 24 4 l 5 12" stroke={C.cream} strokeWidth={3} strokeLinecap="round" />
          <path d="M 40 -46 Q 0 -62 -40 -42" stroke={C.cream} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />
        </g>
        <circle cx={CX + 446} cy={520} r={22} fill="none" stroke={C.sun} strokeWidth={6} />
      </g>
    </svg>
  );
};
