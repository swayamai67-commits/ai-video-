import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Sparkle} from '../components/Hoop';
import {Ink, RisoFill} from '../components/Ink';
import {Letters, Rise, Txt} from '../components/Type';
import {beats, boil, clamp, ease, lerp, prog, pulse, springAt, useFrame, useT, ws} from '../lib/time';
import * as S from '../lib/shapes';
import {C, F, H, W} from '../theme';

export const S3_START = 6.36;
export const S4_END = 12.86;

// side view of the bed at night
const PILLOW_SIDE = 'M 40 1300 C 30 1220 60 1180 140 1185 C 250 1175 360 1180 420 1205 C 460 1225 460 1290 430 1300 Z';
const MATTRESS_SIDE = 'M 20 1300 L 1060 1300 M 20 1300 L 20 1430 L 1060 1430 M 60 1430 L 60 1520 M 1020 1430 L 1020 1520';
const BLANKET = 'M 330 1300 C 380 1190 470 1160 560 1180 C 650 1120 760 1110 840 1160 C 920 1140 1000 1150 1080 1190 L 1080 1300 Z';
const BLANKET_EDGE = 'M 330 1300 C 380 1190 470 1160 560 1180 C 650 1120 760 1110 840 1160 C 920 1140 1000 1150 1080 1190';
const BLANKET_FOLDS = 'M 600 1260 C 680 1220 760 1240 820 1215 M 880 1270 C 930 1235 990 1240 1040 1225';
// her, turned away: back of the head, bun, shoulder
const HER_HEAD = 'M 440 935 C 370 930 330 980 335 1040 C 340 1100 390 1135 450 1130 C 515 1125 550 1080 545 1020 C 540 965 500 938 440 935';
const HER_HAIR_LINES = 'M 470 950 C 520 990 530 1050 500 1100 M 545 1060 C 590 1100 640 1110 690 1100';
const HER_BUN = 'M 470 932 C 450 870 515 845 540 880 C 560 910 530 945 505 930';
const HER_SHOULDER = 'M 545 1090 C 610 1030 720 1030 790 1110';
// the speech bubble that never gets said
const BUBBLE = 'M 300 640 C 300 560 360 520 460 520 L 820 520 C 920 520 970 560 970 640 L 970 760 C 970 840 920 880 820 880 L 470 880 L 380 990 L 400 880 C 340 875 300 840 300 760 Z';

// close-up face (taller than the frame; camera pans eye -> mouth)
const EYE = 'M 120 760 Q 540 430 960 760 Q 540 1010 120 760 Z';
const LID = 'M 150 720 Q 540 380 930 720';
const BROW_SCARED = 'M 170 430 C 350 300 650 280 930 380';
const LASHES = 'M 250 640 L 215 590 M 360 575 L 340 515 M 480 548 L 475 485 M 600 548 L 610 485 M 720 575 L 745 515 M 830 640 L 870 590';
const NOSE = 'M 640 1150 C 660 1320 700 1460 660 1530 C 630 1575 570 1575 540 1545';
const LIPS = 'M 300 1900 C 400 1840 490 1860 540 1880 C 590 1860 680 1840 780 1900 C 680 1985 400 1985 300 1900 Z';
const LIP_LINE = 'M 310 1902 C 440 1918 640 1918 770 1902';
const TAPE = 'M -330 -80 L 330 -80 L 345 -60 L 325 -40 L 350 -18 L 328 4 L 348 28 L 326 50 L 340 80 L -330 80 L -345 58 L -322 36 L -348 12 L -324 -12 L -346 -36 L -322 -58 Z';

/** Scenes 3–4 · lights out · "You couldn't tell her that you lost them / 'cause you're scared and you're not talking." */
export const S3Night: React.FC = () => {
  const t = useT();
  const frame = useFrame();
  if (t < S3_START || t > S4_END) return null;

  // lights-out flicker
  const flick = t < 6.4 ? 0.92 : t < 6.44 ? 0.25 : t < 6.47 ? 0.85 : t < 6.5 ? 0.5 : 1;

  // ---- scene 3 (wide) -> zoom into the eye -> scene 4 (close-up)
  const zoom = prog(t, 9.48, 9.78, ease.in);
  const s3 = t < 9.75;
  const eyeX = 260 + (889 - 900) * 0.42;
  const eyeY = 1150 - (795 - 560) * 0.42;

  const pBed = prog(t, 6.45, 7.3, ease.inOut);
  const pYou = prog(t, 6.5, 7.4, ease.inOut);
  const pHer = prog(t, 6.9, 7.8, ease.inOut);
  const bubbleIn = springAt(t, ws(15) - 0.12, {stiffness: 200, damping: 12});
  const deflate = prog(t, 8.55, 9.0, ease.in);
  const bubbleS = bubbleIn * (1 - deflate);
  const glint = prog(t, ws(19) - 0.05, ws(19) + 0.15) * (1 - prog(t, 9.4, 9.6));

  // ---- scene 4
  const s4 = t >= 9.66;
  const in4 = prog(t, 9.66, 9.95, ease.out);
  const pan = prog(t, 10.95, 11.5, ease.inOut);
  const panY = -950 * pan;
  const slap = t >= 11.62 ? springAt(t, 11.62, {stiffness: 420, damping: 18, mass: 0.6}) : 0;
  const tapeScale = t < 11.62 ? 0 : lerp(1.9, 1, ease.in(clamp((t - 11.62) / 0.09)));
  const shake = t > 11.66 && t < 12.0 ? Math.exp(-(t - 11.66) * 12) * 14 : 0;
  const scaredShake = 4 + 6 * prog(t, 10.44, 10.9);
  const fillOut = prog(t, 12.5, 12.86, ease.in);
  const pupilR = lerp(70, 34, prog(t, 10.4, 10.7, ease.out));

  return (
    <AbsoluteFill style={{opacity: flick}}>
      <AbsoluteFill style={{background: `radial-gradient(90% 60% at 40% 45%, #232A55 0%, ${C.night} 70%)`}} />
      {s3 && (
        <AbsoluteFill style={{transform: `scale(${lerp(1, 9, zoom)})`, transformOrigin: `${eyeX}px ${eyeY}px`, opacity: 1 - prog(t, 9.64, 9.74)}}>
          {/* faint window light on the wall */}
          <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
            <path d="M 640 260 L 1000 260 L 1000 700 L 640 700 Z M 820 260 L 820 700 M 640 480 L 1000 480" fill="none" stroke={C.paper} strokeOpacity={0.12} strokeWidth={4} />
            <path d="M 640 700 L 1000 700 L 1080 1300 L 420 1300 Z" fill={C.paper} opacity={0.035} />
            <Ink d={MATTRESS_SIDE} p={pBed} color={C.paper} w={5} seed="ms" />
            <path d={PILLOW_SIDE} fill="#2B3263" opacity={pBed} />
            <Ink d={PILLOW_SIDE} p={pBed} color={C.paper} w={5} seed="ps" />
            {/* her, turned away */}
            <path d={HER_HEAD} fill="url(#dotsPink)" opacity={0.45 * pHer} />
            <Ink d={HER_HEAD} p={pHer} color={C.pink} w={6} seed="h3h" />
            <Ink d={HER_HAIR_LINES} p={pHer} color={C.pink} w={4} seed="h3l" />
            <Ink d={HER_BUN} p={pHer} color={C.pink} w={6} seed="h3b" />
            {/* you, awake, staring at the ceiling (the same profile from scene 1, lying down) */}
            <g transform={`translate(260 1150) rotate(-90) scale(0.42) translate(-560 -900)`}>
              <path d={S.PROFILE_CLOSED} fill="#1A2047" opacity={pYou} />
              <Ink d={S.PROFILE} p={pYou} color={C.paper} w={14} seed="y3" />
              <Ink d={S.HAIR} p={pYou} color={C.paper} w={12} seed="y3h" />
              <Ink d={S.EAR} p={pYou} color={C.paper} w={12} seed="y3e" />
              <Ink d={S.EYE_OPEN} p={pYou} color={C.paper} w={10} seed="y3y" />
              {pYou > 0.9 && <circle {...S.EYE_PUPIL} r={9} fill={C.paper} />}
              <Ink d={S.BROW} p={pYou} color={C.paper} w={10} seed="y3b" />
            </g>
            <path d={BLANKET} fill="#262D5C" />
            <path d={BLANKET} fill="url(#dotsPaper)" opacity={0.1} />
            <Ink d={HER_SHOULDER} p={pHer} color={C.pink} w={6} seed="h3s" />
            <Ink d={BLANKET_EDGE} p={pBed} color={C.paper} w={6} seed="be" />
            <Ink d={BLANKET_FOLDS} p={pBed} color={C.paper} w={4} seed="bf" opacity={0.6} />
            <Sparkle x={455} y={1238} s={40 * glint} rot={boil(frame, 'g3', 25)} color={C.gold} />
            {/* the bubble that never gets said */}
            <g transform={`translate(380 990) scale(${bubbleS} ${bubbleS * (1 + 0.15 * deflate)}) translate(-380 -990)`} opacity={bubbleS > 0.02 ? 1 : 0}>
              <path d={BUBBLE} fill={C.paper} />
              <Ink d={BUBBLE} color={C.ink} w={6} seed="bb" />
            </g>
          </svg>
          {bubbleS > 0.05 && (
            <Txt x={635} y={600} size={150} italic color={C.ink} anchor="center" style={{transform: `translate(-50%,0) scale(${bubbleS})`, transformOrigin: '50% 100%'}}>
              <Rise p={prog(t, ws(15) - 0.05, ws(15) + 0.3)}>tell</Rise> <Rise p={prog(t, ws(16) - 0.05, ws(16) + 0.3)}>her</Rise>
            </Txt>
          )}
          <Txt x={80} y={190} size={64} font={F.grot} weight={700} ls={2} color={C.paper}>
            <Rise p={prog(t, ws(13) - 0.05, ws(13) + 0.3)}>YOU</Rise>
          </Txt>
          <Txt x={70} y={250} size={230} italic color={C.paper}>
            <Letters text="couldn’t" t={t} t0={ws(14) - 0.06} t1={ws(14) + 0.5} seed="cd" />
          </Txt>
          <Txt x={600} y={980} size={88} font={F.hand} weight={700} color={C.pinkSoft} rot={-5}>
            <Letters text="that you lost them" t={t} t0={ws(17) - 0.05} t1={ws(20) + 0.1} seed="lt" />
          </Txt>
        </AbsoluteFill>
      )}

      {s4 && (
        <AbsoluteFill style={{opacity: in4, transform: `translate(${boil(frame, 'sk', shake, 1)}px, ${boil(frame, 'sky', shake, 1)}px) scale(${lerp(1.25, 1, in4) * lerp(1, 7, fillOut)})`, transformOrigin: '540px 960px'}}>
          <AbsoluteFill style={{transform: `translateY(${panY}px)`}}>
            <svg width={W} height={2400} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
              {/* trembling rings of fear */}
              {[0, 1, 2].map((k) => (
                <ellipse key={k} cx={540} cy={760} rx={520 + k * 70 + boil(frame, `r${k}`, 8, 2)} ry={330 + k * 60 + boil(frame, `ry${k}`, 8, 2)} fill="none" stroke={C.pink} strokeOpacity={0.25 - k * 0.07} strokeWidth={4} strokeDasharray="18 22" opacity={prog(t, 10.44, 10.7)} />
              ))}
              <path d={EYE} fill={C.paper} opacity={0.95} />
              <circle cx={540 + boil(frame, 'ix', 7, 2)} cy={735 + boil(frame, 'iy', 5, 2)} r={165} fill="#2B3263" />
              <circle cx={540 + boil(frame, 'ix', 7, 2)} cy={735 + boil(frame, 'iy', 5, 2)} r={165} fill="url(#dotsPink)" opacity={0.35} />
              <circle cx={540 + boil(frame, 'ix', 7, 2)} cy={735 + boil(frame, 'iy', 5, 2)} r={pupilR} fill={C.night} />
              <circle cx={590 + boil(frame, 'ix', 7, 2)} cy={680 + boil(frame, 'iy', 5, 2)} r={24} fill={C.paper} />
              <Ink d={EYE} color={C.paper} w={9} seed="e4" b={2} />
              <Ink d={LID} color={C.paper} w={6} seed="l4" b={2} />
              <Ink d={LASHES} color={C.paper} w={7} seed="la4" b={2} transform="translate(0 40)" />
              <Ink d={BROW_SCARED} color={C.paper} w={10} seed="b4" b={3} />
              <RisoFill d={LIPS} fill={C.pink} opacity={0.85} seed="lp" dx={6} dy={4} />
              <Ink d={LIPS} color={C.paper} w={8} seed="li4" p={prog(t, 11.0, 11.5)} />
              <Ink d={LIP_LINE} color={C.paper} w={6} seed="ll4" p={prog(t, 11.1, 11.5)} />
              {/* tape slaps the mouth shut */}
              <g transform={`translate(540 1905) rotate(${-7 + (1 - slap) * 4}) scale(${tapeScale * (1 + 0.06 * Math.sin(slap * Math.PI) * (1 - slap))} ${tapeScale})`}>
                <path d={TAPE} fill="#000" opacity={0.35} transform="translate(10 14)" />
                <path d={TAPE} fill="#EFE6D4" />
                <path d={TAPE} fill="url(#dotsInk)" opacity={0.06} />
              </g>
            </svg>
            {tapeScale > 0 && (
              <Txt x={540} y={1840} size={150} font={F.hand} weight={700} anchor="center" rot={-7} color={C.ink} style={{transform: `translate(-50%,0) rotate(-7deg) scale(${tapeScale})`}}>
                NOT
              </Txt>
            )}
            <Txt x={80} y={1090} size={300} color={C.pink} ls={-4}>
              <Letters text="SCARED" t={t} t0={ws(23) - 0.08} t1={ws(23) + 0.25} seed="sc" shake={scaredShake} />
            </Txt>
            <Txt x={80} y={1640} size={64} font={F.grot} weight={700} ls={2} color={C.paper}>
              <Rise p={prog(t, ws(24) - 0.05, ws(24) + 0.3)}>AND</Rise> <Rise p={prog(t, ws(25) - 0.05, ws(25) + 0.3)}>YOU’RE</Rise>
            </Txt>
            <Txt x={1000} y={2050} size={190} italic anchor="right" color={C.paper}>
              <Letters text="talking." t={t} t0={ws(27) - 0.05} t1={ws(27) + 0.4} seed="tk" />
            </Txt>
          </AbsoluteFill>
          <Txt x={80} y={170} size={64} font={F.grot} weight={700} ls={2} color={C.paper} opacity={1 - pan}>
            <Rise p={prog(t, ws(21) - 0.05, ws(21) + 0.3)}>’CAUSE</Rise> <Rise p={prog(t, ws(22) - 0.05, ws(22) + 0.3)}>YOU’RE</Rise>
          </Txt>
        </AbsoluteFill>
      )}
      {/* the tape fills the frame and becomes the next page */}
      <AbsoluteFill style={{background: '#EFE6D4', opacity: prog(t, 12.72, 12.84)}} />
    </AbsoluteFill>
  );
};
