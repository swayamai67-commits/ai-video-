import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Hoop} from '../components/Hoop';
import {Ink, RisoFill} from '../components/Ink';
import {Paper} from '../components/Paper';
import {Letters, Rise, Txt} from '../components/Type';
import {clamp, ease, lerp, prog, useT, ws} from '../lib/time';
import {leftClip, rightClip, tearPath} from '../lib/tear';
import * as S from '../lib/shapes';
import {C, F, H, W} from '../theme';

export const S7_START = 18.2;
export const S7_END = 21.8;

const FIG = 'translate(250 1560) rotate(12) scale(0.6) translate(-560 -1000)';
const EAR = {x: 227, y: 1566};
const GOLD = 'M 227 1612 C 140 1680 70 1500 140 1340 C 210 1170 430 1190 540 1330 ' + S.HEART_LEFT.replace(/^M 540 1330 /, '');
const SCRIBBLE = 'M 70 380 L 130 300 L 165 390 L 225 290 L 265 395 L 330 295 L 370 390 L 430 300 L 470 385 L 525 310 L 560 360';

const Content: React.FC<{t: number}> = ({t}) => {
  const pFig = prog(t, 18.3, 19.2, ease.inOut);
  const guide = prog(t, 18.6, 19.2);
  const pGold = prog(t, 18.75, 21.0, ease.inOut);
  const hoopR = 26 * (1 - prog(pGold, 0, 0.12));
  const scrib = prog(t, ws(44) + 0.45, ws(44) + 0.75, ease.inOut);
  return (
    <AbsoluteFill>
      <Paper />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {/* pencil guide for the whole heart: the half you never draw stays a guide */}
        <path d={S.HEART_LEFT + ' ' + S.HEART_RIGHT.replace(/^M 540 880/, '')} fill="none" stroke={C.ink} strokeOpacity={0.4 * guide} strokeWidth={4} strokeDasharray="14 16" strokeLinecap="round" />
        <path d={S.HEART_LEFT + ' L 540 1330 Z'} fill="url(#dotsGold)" opacity={0.45 * prog(t, 20.6, 21.1)} />
        {/* you, head bowed */}
        <g transform={FIG}>
          <path d={S.PROFILE_CLOSED} fill={C.paper} opacity={pFig} />
          <Ink d={S.PROFILE} p={pFig} w={11} seed="p7" />
          <Ink d={S.SHOULDERS} p={pFig} w={11} seed="s7" />
          <Ink d={S.HAIR} p={pFig} w={10} seed="h7" />
          <Ink d={S.BUN} p={pFig} w={10} seed="b7" />
          <RisoFill d={S.BUN} fill={C.pink} opacity={0.45 * pFig} seed="b7f" />
          <Ink d={S.EAR} p={pFig} w={10} seed="e7" />
          <Ink d={S.EYE_CLOSED} p={pFig} w={10} seed="y7" />
        </g>
        {/* the hoop unwinds into the line that tries to draw a heart */}
        {hoopR > 1 && <Hoop x={EAR.x} y={EAR.y + hoopR} r={hoopR} w={8} spin={0.4} />}
        <Ink d={GOLD} p={pGold} color={C.goldDeep} w={16} seed="g7s" b={0.6} transform="translate(5 6)" opacity={0.35} />
        <Ink d={GOLD} p={pGold} color={C.gold} w={14} seed="g7" b={0.6} />
        <Ink d={GOLD} p={pGold} color={C.goldLight} w={4} seed="g7h" b={0.6} transform="translate(-3 -3)" />
        <Ink d={SCRIBBLE} p={scrib} color={C.pink} w={11} seed="sc7" />
      </svg>
      <Txt x={80} y={170} size={60} font={F.grot} weight={700} ls={2}>
        <Rise p={prog(t, ws(41) - 0.05, ws(41) + 0.3)}>’CAUSE</Rise> <Rise p={prog(t, ws(42) - 0.05, ws(42) + 0.3)}>YOU</Rise>{' '}
        <Rise p={prog(t, ws(43) - 0.05, ws(43) + 0.3)}>JUST</Rise>
      </Txt>
      <Txt x={70} y={230} size={220} italic>
        <Letters text="never" t={t} t0={ws(44) - 0.06} t1={ws(44) + 0.35} seed="nv" />
      </Txt>
      <Txt x={620} y={330} size={60} font={F.grot} weight={700} ls={2}>
        <Rise p={prog(t, ws(45) - 0.05, ws(45) + 0.3)}>HAD</Rise> <Rise p={prog(t, ws(46) - 0.05, ws(46) + 0.3)}>THE</Rise>
      </Txt>
      <Txt x={540} y={930} size={180} italic anchor="center" color={C.ink}>
        <Rise p={prog(t, ws(47) - 0.06, ws(47) + 0.4)}>
          heart<span style={{color: C.pink}}>.</span>
        </Rise>
      </Txt>
    </AbsoluteFill>
  );
};

/** Scene 7 · "'Cause you just never had the heart." — then the page tears down the heart's centre line. */
export const S7Heart: React.FC = () => {
  const t = useT();
  if (t < S7_START || t > S7_END) return null;
  const tear = prog(t, 21.3, 21.68, ease.in);
  if (tear <= 0) return <Content t={t} />;
  const d = tear * 70;
  return (
    <AbsoluteFill style={{background: C.night, opacity: 1 - prog(t, 21.55, 21.7)}}>
      <AbsoluteFill style={{clipPath: leftClip(), transform: `translateX(${-d}px) rotate(${-tear * 1.5}deg)`}}>
        <Content t={t} />
      </AbsoluteFill>
      <AbsoluteFill style={{clipPath: rightClip(), transform: `translateX(${d}px) rotate(${tear * 1.5}deg)`}}>
        <Content t={t} />
      </AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <path d={tearPath()} fill="none" stroke={C.paper} strokeWidth={6} opacity={1 - tear} />
      </svg>
    </AbsoluteFill>
  );
};
