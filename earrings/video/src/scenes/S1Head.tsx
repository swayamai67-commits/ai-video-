import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Hoop} from '../components/Hoop';
import {Ink, RisoFill} from '../components/Ink';
import {Paper} from '../components/Paper';
import {Rise, Txt} from '../components/Type';
import {clamp, ease, lerp, prog, springAt, useFrame, useT, ws} from '../lib/time';
import * as S from '../lib/shapes';
import {C, F, H, W} from '../theme';

export const EAR_LOBE = {x: 525, y: 1018};
export const HOOP_R = 40;
export const DIVE = {a: 3.16, b: 3.62};

/** Scene 0–1 · intro drop + "Her love is in your head." */
export const S1Head: React.FC = () => {
  const t = useT();
  const frame = useFrame();
  if (t > DIVE.b + 0.05) return null;

  // ---- hoop: drop, bounce, then travel to the ear lobe and swing
  const drop = springAt(t, 0.05, {stiffness: 170, damping: 11, mass: 1.1});
  const toEar = prog(t, 0.72, 1.2, ease.inOut);
  const freeY = lerp(-300, 900, drop);
  const hx = lerp(540, EAR_LOBE.x, toEar);
  const hr = lerp(118, HOOP_R, toEar);
  const hy = lerp(freeY, EAR_LOBE.y + hr, toEar);
  const spin = t < 1.2 ? t * 7.5 * (1 - toEar) + toEar * Math.PI * 2 * 3 : 0;
  // pendulum swing after it clips on, damped before the dive
  const sw = t > 1.2 ? Math.sin((t - 1.2) * 5.2) * 16 * Math.exp(-(t - 1.2) * 0.9) * (1 - prog(t, 2.9, 3.2)) : 0;
  const swingBeat = t > 1.2 ? 3 * Math.sin((t - 1.2) * 2 * Math.PI * (80.7 / 60) * 0.5) * (1 - prog(t, 2.9, 3.2)) : 0;

  // ---- line drawing
  const pHead = prog(t, 0.72, 1.85, ease.inOut);
  const pDetail = prog(t, 1.4, 2.1, ease.out);
  const pHair = prog(t, 1.15, 2.2, ease.inOut);
  const pHer = prog(t, 1.14, 2.3, ease.inOut);

  // ---- camera: slow push, then dive through the hoop
  const push = lerp(1, 1.05, prog(t, 0.6, 3.1, ease.soft));
  const dive = prog(t, DIVE.a, DIVE.b, ease.in);
  const k = push * lerp(1, 46, dive);
  const ox = EAR_LOBE.x;
  const oy = EAR_LOBE.y + HOOP_R;

  const arcWords = [2, 3, 4].map((i) => prog(t, ws(i) - 0.05, ws(i) + 0.25));
  const slug = prog(t, 0.1, 0.6);

  return (
    <AbsoluteFill>
      <Paper />
      <AbsoluteFill style={{transform: `scale(${k})`, transformOrigin: `${ox}px ${oy}px`}}>
        {/* print slug */}
        <Txt x={64} y={150} size={26} font={F.mono} ls={3} color={C.ink} opacity={slug * (1 - dive)}>
          MALCOLM TODD · EARRINGS
        </Txt>
        <Txt x={1016} y={150} size={26} font={F.mono} ls={3} anchor="right" color={C.pink} opacity={slug * (1 - dive)}>
          Nº 01 / LYRIC FILM
        </Txt>

        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <defs>
            <clipPath id="skull">
              <path d={S.PROFILE_CLOSED} />
            </clipPath>
            <path id="skullArc" d="M 175 1110 C 120 830 280 500 560 482 C 710 474 820 540 900 625" />
          </defs>
          {/* thoughts of her live inside the skull */}
          <g clipPath="url(#skull)">
            <path d={S.PROFILE_CLOSED} fill="url(#dotsPinkFine)" opacity={0.28 * pHer} />
            <g transform="translate(560 905) scale(0.78) translate(-540 -860)" opacity={0.75}>
              <Ink d={S.HER_HAIR} p={pHer} color={C.pink} w={6} seed="hh" />
              <Ink d={S.HER_FACE} p={pHer} color={C.pink} w={6} seed="hf" />
              <Ink d={S.HER_EYES} p={pDetail} color={C.pink} w={6} seed="he" />
              <Ink d={S.HER_NOSE} p={pDetail} color={C.pink} w={5} seed="hn" />
              <Ink d={S.HER_MOUTH} p={pDetail} color={C.pink} w={6} seed="hm" />
            </g>
          </g>
          <RisoFill d={S.BUN} fill={C.pink} opacity={0.5 * pHair} seed="bunf" />
          <Ink d={S.PROFILE} p={pHead} w={7} seed="pr" />
          <Ink d={S.SHOULDERS} p={prog(t, 1.3, 2.0, ease.out)} w={7} seed="sh" />
          <Ink d={S.HAIR} p={pHair} w={6} seed="ha" />
          <Ink d={S.BUN} p={pHair} w={6} seed="bu" />
          <Ink d={S.EAR} p={pDetail} w={6} seed="ea" />
          <Ink d={S.EYE_OPEN} p={pDetail} w={5} seed="ey" />
          {pDetail > 0.8 && <circle {...S.EYE_PUPIL} fill={C.ink} />}
          <Ink d={S.BROW} p={pDetail} w={5} seed="br" />
          {/* "is in your" runs along the outside of the skull */}
          <text fontFamily={F.grot} fontWeight={700} fontSize={54} letterSpacing={8} fill={C.ink}>
            <textPath href="#skullArc" startOffset="14%">
              <tspan opacity={arcWords[0]}>IS </tspan>
              <tspan opacity={arcWords[1]}>IN </tspan>
              <tspan opacity={arcWords[2]} fill={C.pink}>YOUR</tspan>
            </textPath>
          </text>
          <Hoop x={hx} y={hy} r={hr} w={lerp(16, 9, toEar)} spin={spin} tilt={t > 1.2 ? sw + swingBeat : 0} glint={prog(t, 2.9, 3.1) * (1 - dive)} />
        </svg>

        {/* "Her love" inside the head */}
        <Txt x={320} y={640} size={190} italic color={C.pink}>
          <Rise p={prog(t, ws(0) - 0.06, ws(0) + 0.35)}>Her</Rise>
        </Txt>
        <Txt x={380} y={800} size={190} italic color={C.ink}>
          <Rise p={prog(t, ws(1) - 0.06, ws(1) + 0.4)}>love</Rise>
        </Txt>
        {/* "head." lands where the arc ends */}
        <Txt x={560} y={270} size={230} color={C.ink}>
          <Rise p={prog(t, ws(5) - 0.06, ws(5) + 0.4)} tilt={-8}>
            head<span style={{color: C.pink}}>.</span>
          </Rise>
        </Txt>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
