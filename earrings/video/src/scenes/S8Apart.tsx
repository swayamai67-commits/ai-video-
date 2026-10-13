import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Hoop, Sparkle} from '../components/Hoop';
import {Ink, RisoFill} from '../components/Ink';
import {Paper} from '../components/Paper';
import {Letters, Rise, Txt} from '../components/Type';
import {boil, clamp, ease, lerp, prog, springAt, useFrame, useT, ws} from '../lib/time';
import {leftClip, rightClip} from '../lib/tear';
import * as S from '../lib/shapes';
import {C, F, H, W} from '../theme';

export const S8_START = 21.45;

const STARS = Array.from({length: 46}, (_, i) => ({x: random(`sx${i}`) * 1080, y: random(`sy${i}`) * 1920, r: 1.5 + random(`sr${i}`) * 3.5, ph: random(`sp${i}`) * 6}));

const O = {x: 330, y: 960, r: 220};

/** Scenes 8–10 · "Now they just drift further apart from you." · instrumental · "Oh. From you." */
export const S8Apart: React.FC = () => {
  const t = useT();
  const frame = useFrame();
  if (t < S8_START) return null;

  const fadeIn = prog(t, 21.55, 21.72, ease.out);
  // separation of the two halves: slow drift, then they leave
  const sepLyric = 140 + 200 * prog(t, ws(51) - 0.2, 25.4, ease.inOut);
  const sep = sepLyric + 1400 * prog(t, 25.6, 28.0, ease.in);
  // lyric text on the left half stays put on screen while the paper drifts (it is clipped by the tear)
  const comp = sepLyric / 2;
  const pYou = prog(t, 21.5, 22.2, ease.out);

  // two hoops, linked, then drifting apart; hoop A becomes the O
  const drift = prog(t, ws(51) - 0.1, 25.6, ease.inOut);
  const toO = prog(t, 25.9, 28.24, ease.inOut);
  const ax0 = lerp(512, 300, drift);
  const ay0 = lerp(1000, 760, drift) + Math.sin(t * 1.6) * 14 * drift;
  const ax = lerp(ax0, O.x, toO);
  const ay = lerp(ay0, O.y, toO);
  const ar = lerp(46, O.r, ease.in(toO));
  const aw = lerp(10, 44, ease.in(toO));
  const settle = t > 28.24 ? Math.exp(-(t - 28.24) * 4) * Math.sin((t - 28.24) * 14) * 0.35 : 0;
  const aspin = t < 28.24 ? lerp(0.9 + t * 0.6, Math.PI * 6, toO) : settle;
  const bx = lerp(568, 820, drift) + 900 * prog(t, 25.6, 27.6, ease.in);
  const by = lerp(1000, 1320, drift) + Math.sin(t * 1.3 + 1) * 14 * drift + 500 * prog(t, 25.6, 27.6, ease.in);

  // finale
  const flood = prog(t, 28.15, 28.7, ease.out);
  const floodR = 2400 * flood;
  const outro = prog(t, 31.3, 32.4, ease.inOut);
  const paperIn = prog(t, 31.25, 31.85, ease.inOut);
  const ohS = lerp(1, 0.5, outro);
  const ohY = lerp(0, -170, outro);
  const ohX = lerp(0, 110, outro);

  const apartP = prog(t, ws(53) - 0.06, ws(53) + 0.35);
  const furtherLs = lerp(4, 30, prog(t, ws(52), ws(52) + 1.4, ease.out));

  const half = (side: 'L' | 'R') => {
    const dx = side === 'L' ? -sep / 2 : sep / 2;
    return (
      <AbsoluteFill style={{clipPath: side === 'L' ? leftClip() : rightClip(), transform: `translateX(${dx}px) rotate(${(side === 'L' ? -1 : 1) * prog(t, 25.6, 28, ease.in) * 6}deg)`, transformOrigin: '540px 960px'}}>
        <Paper />
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          {side === 'L' ? (
            <g transform="translate(330 900) scale(0.48) translate(-560 -1000)">
              <Ink d={S.PROFILE} p={pYou} w={13} seed="p8" />
              <Ink d={S.SHOULDERS} p={pYou} w={13} seed="s8" />
              <Ink d={S.HAIR} p={pYou} w={12} seed="h8" />
              <Ink d={S.BUN} p={pYou} w={12} seed="b8" />
              <Ink d={S.EAR} p={pYou} w={12} seed="e8" />
              <Ink d={S.EYE_OPEN} p={pYou} w={10} seed="y8" />
              {pYou > 0.9 && <circle {...S.EYE_PUPIL} r={10} fill={C.ink} />}
            </g>
          ) : (
            <g transform="translate(750 900) scale(-0.48 0.48) translate(-560 -1000)">
              <path d={S.PROFILE_CLOSED} fill="url(#dotsPinkFine)" opacity={0.3 * pYou} />
              <Ink d={S.PROFILE} p={pYou} color={C.pink} w={13} seed="p8r" />
              <Ink d={S.SHOULDERS} p={pYou} color={C.pink} w={13} seed="s8r" />
              <Ink d={S.HER_HAIR_SIDE} p={pYou} color={C.pink} w={12} seed="h8r" />
              <Ink d={S.EAR} p={pYou} color={C.pink} w={12} seed="e8r" />
              <Ink d={S.EYE_CLOSED} p={pYou} color={C.pink} w={10} seed="y8r" />
            </g>
          )}
        </svg>
        {side === 'L' ? (
          <>
            <Txt x={80 + comp} y={170} size={56} font={F.grot} weight={700} ls={2} lh={1.15}>
              <Rise p={prog(t, ws(48) - 0.05, ws(48) + 0.3)}>NOW</Rise> <Rise p={prog(t, ws(49) - 0.05, ws(49) + 0.3)}>THEY</Rise>
              <br />
              <Rise p={prog(t, ws(50) - 0.05, ws(50) + 0.3)}>JUST</Rise>
            </Txt>
            <Txt x={70 + comp} y={300} size={190} italic>
              <Letters
                text="drift"
                t={t}
                t0={ws(51) - 0.06}
                t1={ws(51) + 0.3}
                seed="dr"
                render={(_, i) => ({transform: `translate(${Math.sin(t * 1.4 + i) * 6}px, ${Math.sin(t * 1.9 + i * 1.3) * 12}px) rotate(${Math.sin(t + i) * 3}deg)`})}
              />
            </Txt>
            <Txt x={520} y={1215} size={260} anchor="right">
              <Rise p={apartP}>ap</Rise>
            </Txt>
            <Txt x={90 + comp} y={1500} size={92} font={F.hand} weight={700} color={C.ink} rot={-4}>
              <Letters text="from you." t={t} t0={ws(54) - 0.05} t1={ws(55) + 0.2} seed="fy" />
            </Txt>
          </>
        ) : (
          <>
            <Txt x={640} y={330} size={54} font={F.grot} weight={700} ls={furtherLs} color={C.pink} rot={90}>
              <Rise p={prog(t, ws(52) - 0.05, ws(52) + 0.3)}>FURTHER</Rise>
            </Txt>
            <Txt x={560} y={1215} size={260} color={C.pink}>
              <Rise p={apartP}>art</Rise>
            </Txt>
          </>
        )}
      </AbsoluteFill>
    );
  };

  return (
    <AbsoluteFill style={{opacity: fadeIn}}>
      <AbsoluteFill style={{background: `radial-gradient(80% 60% at 50% 50%, #252C5B 0%, ${C.night} 75%)`}} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={C.paper} opacity={0.25 + 0.35 * Math.abs(Math.sin(t * 1.5 + s.ph))} />
        ))}
      </svg>
      {t < 28.3 && half('L')}
      {t < 28.3 && half('R')}

      {/* pink flood from the hoop */}
      {floodR > 0 && (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <circle cx={O.x + ohX} cy={O.y + ohY} r={floodR} fill={C.pink} />
          <circle cx={O.x + ohX} cy={O.y + ohY} r={floodR} fill="url(#dotsInk)" opacity={0.06} />
        </svg>
      )}
      {t > 31.25 && <AbsoluteFill style={{opacity: paperIn}}><Paper /></AbsoluteFill>}

      {/* the hoops */}
      <AbsoluteFill style={{transform: `translate(${ohX}px, ${ohY}px) scale(${ohS})`, transformOrigin: `${O.x}px ${O.y}px`}}>
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {t < 28.0 && <Hoop x={bx} y={by} r={46} w={10} spin={-0.3 + t * 0.4} tilt={20} />}
          <Hoop x={ax} y={ay} r={ar} w={aw} spin={aspin} tilt={lerp(-20, 0, toO)} glint={prog(t, 28.24, 28.4) * (1 - prog(t, 28.9, 29.3))} />
        </svg>
        {t > 28.1 && (
          <Txt x={575} y={652} size={600} color={C.ink} ls={-10}>
            <Rise p={prog(t, ws(56) - 0.02, ws(56) + 0.4)} from={90}>
              h<span style={{color: t > 31.3 ? C.pink : C.paper}}>.</span>
            </Rise>
          </Txt>
        )}
      </AbsoluteFill>
      {t > 29.3 && (
        <Txt x={540} y={lerp(1300, 1110, outro)} size={lerp(130, 96, outro)} italic anchor="center" color={C.ink}>
          <Letters text="from" t={t} t0={ws(57) - 0.1} t1={ws(57) + 0.2} seed="f9" /> <Letters text="you." t={t} t0={ws(58) - 0.1} t1={ws(58) + 0.3} seed="y9" />
        </Txt>
      )}
      {t > 31.6 && (
        <>
          <Txt x={540} y={1460} size={28} font={F.mono} anchor="center" ls={6} color={C.ink} opacity={prog(t, 31.8, 32.4)}>
            MALCOLM TODD · EARRINGS
          </Txt>
          <Txt x={540} y={1510} size={22} font={F.mono} anchor="center" ls={4} color={C.pink} opacity={prog(t, 32.0, 32.6)}>
            LYRIC FILM · Nº 01
          </Txt>
        </>
      )}
    </AbsoluteFill>
  );
};
