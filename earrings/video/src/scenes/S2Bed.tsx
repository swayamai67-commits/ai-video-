import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Hoop, Sparkle} from '../components/Hoop';
import {Ink, RisoFill} from '../components/Ink';
import {Paper} from '../components/Paper';
import {Letters, Rise, Txt} from '../components/Type';
import {beats, boil, clamp, ease, lerp, prog, pulse, springAt, useFrame, useT, ws} from '../lib/time';
import * as S from '../lib/shapes';
import {C, F, H, W} from '../theme';
import {DIVE, EAR_LOBE, HOOP_R} from './S1Head';

export const S2_END = 6.5;

const MATTRESS = 'M 120 300 C 110 270 130 250 170 250 L 930 250 C 970 250 990 270 985 300 L 1010 2050 L 90 2050 Z';
const PILLOW = 'M 190 380 C 170 330 210 310 300 318 C 450 300 640 300 800 316 C 880 312 915 340 900 400 C 920 520 915 620 900 690 C 905 735 870 750 800 742 C 640 760 440 760 290 745 C 210 752 175 730 185 690 C 170 600 172 480 190 380 Z';
const PILLOW_CREASE = 'M 260 420 C 300 470 290 560 250 640 M 830 420 C 790 480 800 580 840 650 M 420 360 C 480 380 560 380 640 362';
const SHEET = 'M 40 840 C 250 770 420 880 600 812 C 780 745 900 835 1060 790 L 1060 2050 L 40 2050 Z';
const SHEET_EDGE = 'M 40 840 C 250 770 420 880 600 812 C 780 745 900 835 1060 790';
const FOLDS =
  'M 120 1000 C 260 960 380 1080 520 1040 C 640 1005 700 1080 820 1060 ' +
  'M 640 900 C 700 960 760 1000 900 980 M 160 1560 C 320 1500 470 1620 640 1560 C 760 1520 860 1580 980 1540 ' +
  'M 300 1760 C 420 1700 560 1800 720 1740';
// the flap of sheet that rolls over the earring
const FLAP = 'M 230 1320 C 300 1180 420 1110 560 1150 C 680 1185 760 1150 860 1100 C 960 1060 1100 1080 1300 1100 L 1300 2400 L -400 2400 L -400 1500 C -100 1450 150 1420 230 1320 Z';
const FLAP_EDGE = 'M -400 1500 C -100 1450 150 1420 230 1320 C 300 1180 420 1110 560 1150 C 680 1185 760 1150 860 1100 C 960 1060 1100 1080 1300 1100';

/** Scene 2 · "You lost your earrings in her bed." (top-down bed, earring sinks into the sheets) */
export const S2Bed: React.FC = () => {
  const t = useT();
  const frame = useFrame();
  if (t < DIVE.a || t > S2_END) return null;

  // revealed through the hoop during the dive
  const dive = prog(t, DIVE.a, DIVE.b, ease.in);
  const clipR = HOOP_R * lerp(1, 46, dive) * 0.9;
  const clip = t < DIVE.b ? `circle(${clipR}px at ${EAR_LOBE.x}px ${EAR_LOBE.y + HOOP_R}px)` : undefined;

  // earring falls away from camera onto the sheet
  const fall = prog(t, 3.5, 4.55, ease.in);
  const land = springAt(t, 4.55, {stiffness: 260, damping: 9});
  const hr = t < 4.55 ? lerp(620, 52, fall) : 52 - (1 - land) * 6;
  const hx = lerp(EAR_LOBE.x, 540, fall);
  const hy = lerp(EAR_LOBE.y, 1230, fall) - (t > 4.55 ? Math.sin(land * Math.PI) * 18 * (1 - land) : 0);
  const spin = t < 4.55 ? t * 9 : 0.9 + (1 - land) * 2.2;
  const flap = prog(t, 5.35, 6.0, ease.inOut);
  const twinkle = prog(t, 6.0, 6.1, ease.out) * (1 - prog(t, 6.32, 6.45));

  // camera: settles from a slight rotation; nudges on downbeats
  const cam = 1.04 - 0.04 * prog(t, 3.4, 5.0) + pulse(t, beats.downbeats, 0.18) * 0.012;
  const rot = lerp(-10, -5, prog(t, 3.3, 5.5, ease.out));
  const sheetY = lerp(80, 0, prog(t, 3.5, 4.6, ease.out));

  return (
    <AbsoluteFill style={{clipPath: clip}}>
      <Paper color={C.paperDeep} />
      <AbsoluteFill style={{transform: `scale(${cam}) rotate(${rot}deg)`, transformOrigin: '50% 45%'}}>
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <RisoFill d={MATTRESS} fill={C.ink} opacity={0.12} dx={14} dy={14} seed="mt" />
          <path d={MATTRESS} fill={C.paper} />
          <Ink d={MATTRESS} w={6} seed="mto" />
          <RisoFill d={PILLOW} fill={C.pink} opacity={0.35} seed="pl" />
          <path d={PILLOW} fill={C.paper} />
          <Ink d={PILLOW} w={6} seed="plo" />
          <Ink d={PILLOW_CREASE} w={4} seed="plc" opacity={0.7} />
          {/* her hand on the pillow */}
          <Ink transform="translate(20 70)" d={S.HER_HAND} p={prog(t, 3.7, 4.6, ease.inOut)} color={C.pink} w={6} seed="hh2" />
          <g transform={`translate(0 ${sheetY})`}>
            <path d={SHEET} fill="#F8C7D2" />
            <path d={SHEET} fill="url(#dotsPink)" opacity={0.55} />
            <Ink d={SHEET_EDGE} w={7} seed="se" />
            <Ink d={FOLDS} w={5} seed="fo" opacity={0.8} />
          </g>
          {/* the earring, then the sheet rolls over it */}
          <Hoop x={hx} y={hy} r={hr} w={t < 4.55 ? lerp(60, 12, fall) : 12} spin={spin} tilt={-12} />
          <g transform={`translate(${lerp(-260, 0, flap)} ${lerp(420, 0, flap)})`} opacity={flap > 0 ? 1 : 0}>
            <path d={FLAP} fill="#F8C7D2" />
            <path d={FLAP} fill="url(#dotsPink)" opacity={0.7} />
            <Ink d={FLAP_EDGE} w={7} seed="fe" />
          </g>
          <Sparkle x={600} y={1150} s={46 * twinkle} rot={boil(frame, 'tw', 20)} />
        </svg>

        <Txt x={110} y={150} size={70} font={F.grot} weight={700} ls={2}>
          <Rise p={prog(t, ws(6) - 0.05, ws(6) + 0.3)}>YOU</Rise> <Rise p={prog(t, ws(7) - 0.05, ws(7) + 0.3)}>LOST</Rise>{' '}
          <Rise p={prog(t, ws(8) - 0.05, ws(8) + 0.3)}>
            <span style={{color: C.pink}}>YOUR</span>
          </Rise>
        </Txt>
        <Txt x={110} y={400} size={235} italic>
          <Letters text="earrings" t={t} t0={ws(9) - 0.06} t1={ws(9) + 0.45} seed="er" />
        </Txt>
        <Txt x={120} y={1260} size={64} font={F.grot} weight={700} ls={2}>
          <Rise p={prog(t, ws(10) - 0.05, ws(10) + 0.3)}>IN</Rise>{' '}
          <Rise p={prog(t, ws(11) - 0.05, ws(11) + 0.3)}>
            <span style={{color: C.paper, background: C.pink, padding: '0 10px'}}>HER</span>
          </Rise>
        </Txt>
        <Txt x={100} y={1320} size={300}>
          <Rise p={prog(t, ws(12) - 0.05, ws(12) + 0.4)} tilt={-10}>
            bed<span style={{color: C.pink}}>.</span>
          </Rise>
        </Txt>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
