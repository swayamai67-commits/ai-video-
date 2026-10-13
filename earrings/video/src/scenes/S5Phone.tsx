import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {Hoop} from '../components/Hoop';
import {Ink, RisoFill} from '../components/Ink';
import {Paper} from '../components/Paper';
import {Letters, Rise, Txt} from '../components/Type';
import {beats, boil, clamp, ease, lerp, prog, pulse, springAt, useFrame, useT, ws} from '../lib/time';
import * as S from '../lib/shapes';
import {C, F, H, W} from '../theme';

export const S5_START = 12.72;
export const S6_END = 18.55;

const DRAFT = 'hey… i think i left my earr';

/** typewriter that types, pauses, then deletes */
const draftAt = (t: number) => {
  const a = 13.0;
  const typeRate = 0.06;
  const n = DRAFT.length;
  const typedEnd = a + n * typeRate;
  if (t < a) return '';
  if (t < typedEnd) return DRAFT.slice(0, Math.floor((t - a) / typeRate));
  const delA = 14.55;
  if (t < delA) return DRAFT;
  const del = Math.floor((t - delA) / 0.022);
  return DRAFT.slice(0, Math.max(3, n - del));
};

const CAL_PAGE = 'M 210 640 L 870 640 L 870 1380 C 700 1395 380 1395 210 1380 Z';

/** Scenes 5–6 · "So you think of what to say / and save it for another day." */
export const S5Phone: React.FC = () => {
  const t = useT();
  const frame = useFrame();
  if (t < S5_START || t > S6_END) return null;

  const enter = springAt(t, 12.72, {stiffness: 90, damping: 15});
  const phoneOut = prog(t, 16.15, 16.6, ease.in);
  const phoneY = lerp(900, 0, enter) + phoneOut * 1500;
  const phoneR = -4 + phoneOut * 18 + boil(frame, 'ph', 0.25);
  const pHand = prog(t, 12.9, 13.7, ease.inOut);
  const draft = draftAt(t);
  const caret = Math.floor(t * 2.4) % 2 === 0;
  const typingDots = prog(t, ws(33) - 0.1, ws(33) + 0.15) * (1 - prog(t, 15.5, 15.65));
  const toast = springAt(t, ws(36) - 0.05, {stiffness: 180, damping: 15});
  const topOut = prog(t, 15.32, 15.55, ease.in);

  // calendar
  const calIn = springAt(t, 16.3, {stiffness: 140, damping: 13});
  const calOut = prog(t, 18.25, 18.55, ease.in);
  const flipA = 16.5;
  const flipStep = 0.075;
  const nFlips = 7;
  const flipI = clamp(Math.floor((t - flipA) / flipStep), -1, nFlips);
  const day = 13 + Math.max(0, flipI);
  const flipP = t > flipA && flipI < nFlips ? ((t - flipA) % flipStep) / flipStep : 1;
  const showAnother = t >= flipA + nFlips * flipStep;

  return (
    <AbsoluteFill>
      <Paper color="#EFE6D4" />
      {/* --- top lyric block, line 5 */}
      <AbsoluteFill style={{transform: `translateY(${-topOut * 600}px)`, opacity: 1 - topOut}}>
        <Txt x={80} y={170} size={60} font={F.grot} weight={700} ls={2}>
          <Rise p={prog(t, ws(28) - 0.05, ws(28) + 0.3)}>SO</Rise> <Rise p={prog(t, ws(29) - 0.05, ws(29) + 0.3)}>YOU</Rise>
        </Txt>
        <Txt x={70} y={225} size={220} italic>
          <Letters text="think" t={t} t0={ws(30) - 0.06} t1={ws(30) + 0.3} seed="th" />
        </Txt>
        <Txt x={600} y={248} size={50} font={F.grot} weight={700} ls={2}>
          <Rise p={prog(t, ws(31) - 0.05, ws(31) + 0.3)}>OF</Rise> <Rise p={prog(t, ws(32) - 0.05, ws(32) + 0.3)}>WHAT</Rise>{' '}
          <Rise p={prog(t, ws(33) - 0.05, ws(33) + 0.3)}>TO</Rise>
        </Txt>
        <Txt x={640} y={300} size={210} italic color={C.pink}>
          <Rise p={prog(t, ws(34) - 0.05, ws(34) + 0.35)} tilt={-10}>
            say
          </Rise>
        </Txt>
      </AbsoluteFill>
      {/* --- line 6 */}
      <Txt x={80} y={170} size={60} font={F.grot} weight={700} ls={2}>
        <Rise p={prog(t, ws(35) - 0.05, ws(35) + 0.3)}>AND</Rise>
      </Txt>
      <Txt x={70} y={225} size={220} italic opacity={1 - calOut}>
        <Letters text="save" t={t} t0={ws(36) - 0.06} t1={ws(36) + 0.25} seed="sv" />
      </Txt>
      <Txt x={470} y={300} size={60} font={F.grot} weight={700} ls={2} opacity={1 - calOut}>
        <Rise p={prog(t, ws(37) - 0.05, ws(37) + 0.3)}>IT</Rise> <Rise p={prog(t, ws(38) - 0.05, ws(38) + 0.3)}>FOR</Rise>
      </Txt>

      {/* --- phone in hand */}
      {phoneOut < 1 && (
        <AbsoluteFill style={{transform: `translateY(${phoneY}px) rotate(${phoneR}deg)`, transformOrigin: '540px 1100px'}}>
          <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <rect x={262} y={532} width={580} height={1180} rx={72} fill={C.ink} opacity={0.18} transform="translate(16 18)" />
            <rect x={250} y={520} width={580} height={1180} rx={72} fill={C.ink} />
            <rect x={268} y={538} width={544} height={1144} rx={58} fill="#FBF7F0" />
            <rect x={470} y={556} width={140} height={34} rx={17} fill={C.ink} />
            {/* header */}
            <circle cx={340} cy={650} r={36} fill={C.pink} />
            <circle cx={340} cy={650} r={36} fill="url(#dotsInk)" opacity={0.12} />
            <line x1={268} y1={712} x2={812} y2={712} stroke={C.ink} strokeOpacity={0.12} strokeWidth={3} />
            {/* an old message from her */}
            <rect x={300} y={760} width={300} height={84} rx={36} fill="#F3D9DF" />
            <rect x={470} y={880} width={310} height={84} rx={36} fill={C.ink} />
            {/* typing indicator: three tiny gold hoops */}
            <g opacity={typingDots} transform={`translate(${590} ${1440}) scale(${0.6 + 0.4 * typingDots})`}>
              <rect x={-20} y={-44} width={200} height={88} rx={44} fill="#ECE4D6" />
              {[0, 1, 2].map((k) => (
                <Hoop key={k} x={30 + k * 50} y={0 - 10 * Math.max(0, Math.sin(t * 9 - k * 0.9))} r={14} w={6} spin={t * 4 + k} clasp={false} />
              ))}
            </g>
            {/* input field */}
            <rect x={292} y={1560} width={496} height={84} rx={42} fill="none" stroke={C.ink} strokeWidth={4} />
            <circle cx={750} cy={1602} r={30} fill={draft.length > 3 ? C.pink : '#D9CFC0'} />
            <path d="M 738 1602 L 762 1602 M 752 1590 L 764 1602 L 752 1614" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" />
            {/* the hand holding it */}
            <Ink d={S.HAND_PHONE} p={pHand} w={7} seed="hp" />
          </svg>
          <Txt x={392} y={624} size={40} font={F.grot} weight={700} color={C.ink}>
            her <span style={{color: C.pink}}>♡</span>
          </Txt>
          <Txt x={392} y={668} size={22} font={F.mono} color={C.inkSoft}>
            last seen 2:14 am
          </Txt>
          <Txt x={330} y={784} size={34} font={F.grot} weight={500} color={C.ink}>
            stay over? x
          </Txt>
          <Txt x={500} y={904} size={34} font={F.grot} weight={500} color={C.paper}>
            can't tonight
          </Txt>
          <Txt x={322} y={1584} size={30} font={F.mono} color={C.ink} style={{width: 400, overflow: 'hidden'}}>
            {draft.length > 22 ? '…' + draft.slice(-21) : draft}
            <span style={{opacity: caret ? 1 : 0, color: C.pink}}>|</span>
          </Txt>
          {/* draft saved toast */}
          <div
            style={{
              position: 'absolute',
              left: 300,
              top: 740,
              width: 480,
              height: 96,
              borderRadius: 30,
              background: C.ink,
              color: C.paper,
              fontFamily: F.mono,
              fontSize: 30,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              paddingLeft: 30,
              boxShadow: '0 18px 40px rgba(31,37,71,0.35)',
              transform: `translateY(${lerp(-260, 0, toast)}px) scale(${lerp(0.8, 1, toast)})`,
              opacity: clamp(toast * 2),
            }}
          >
            <span style={{color: C.gold, fontSize: 40}}>✓</span> draft saved · not sent
          </div>
        </AbsoluteFill>
      )}

      {/* --- tear-off calendar: days pass */}
      {t > 16.25 && (
        <AbsoluteFill style={{transform: `translateY(${lerp(-1400, 0, calIn) - calOut * 200}px) scale(${1 + calOut * 0.15})`, opacity: 1 - calOut}}>
          <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <RisoFill d={CAL_PAGE} fill={C.ink} opacity={0.18} dx={18} dy={20} seed="cs" />
            <path d="M 200 520 L 880 520 L 880 640 L 200 640 Z" fill={C.pink} />
            <path d="M 200 520 L 880 520 L 880 640 L 200 640 Z" fill="url(#dotsInk)" opacity={0.08} />
            <path d={CAL_PAGE} fill="#FBF7F0" />
            <Ink d={CAL_PAGE} w={6} seed="cp" />
            <Ink d="M 200 520 L 880 520 L 880 640 L 200 640 Z" w={6} seed="ch" />
            {[330, 750].map((x) => (
              <g key={x}>
                <rect x={x - 16} y={480} width={32} height={90} rx={16} fill={C.paper} stroke={C.ink} strokeWidth={6} />
              </g>
            ))}
            {/* the page being torn off */}
            {t > flipA && flipI < nFlips && (
              <g transform={`translate(${540 + flipP * 380} ${640 + flipP * 700}) rotate(${flipP * 38}) translate(-540 -640)`} opacity={1 - flipP}>
                <path d={CAL_PAGE} fill="#FBF7F0" />
                <Ink d={CAL_PAGE} w={6} seed="cpf" />
                <text x={540} y={1180} fontFamily={F.serif} fontSize={480} textAnchor="middle" fill={C.ink}>
                  {day}
                </text>
              </g>
            )}
          </svg>
          <Txt x={540} y={548} size={44} font={F.mono} anchor="center" color={C.paper} ls={8}>
            OCTOBER
          </Txt>
          {!showAnother && t > 16.3 && (
            <Txt x={540} y={760} size={480} anchor="center" color={C.ink}>
              {t > flipA ? day + 1 : 13}
            </Txt>
          )}
          {showAnother && (
            <>
              <Txt x={540} y={790} size={170} italic anchor="center" color={C.ink}>
                <Letters text="another" t={t} t0={ws(39) - 0.1} t1={ws(39) + 0.45} seed="an" />
              </Txt>
              <Txt x={540} y={990} size={250} anchor="center" color={C.pink}>
                <Rise p={prog(t, ws(40) - 0.05, ws(40) + 0.35)}>day.</Rise>
              </Txt>
              <Txt x={540} y={1300} size={30} font={F.mono} anchor="center" color={C.inkSoft} ls={4} opacity={prog(t, 17.9, 18.2)}>
                (SAME AS YESTERDAY)
              </Txt>
            </>
          )}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
