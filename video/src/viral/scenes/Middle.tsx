import React from 'react';
import {AbsoluteFill} from 'remotion';
import faces from '../data/faces.json';
import {C, F, H, W} from '../config';
import {Camera, Flash} from '../fx';
import {Blobs, Brackets, FeedChrome} from '../hud';
import {clamp, ease, prog, springAt, useT} from '../lib';
import {wtime} from '../Lyrics';
import {frameAt} from '../Plate';
import {Mono, typed} from '../text';
import {EmptyPost} from '../graphics';
import {Finish, Full, GRADE, Sc, Scrim, Strip} from './common';
import {AccentHero, Shots} from './Verse';

const FACES = faces as Record<string, number[][][]>;

// ---------- 105.58 – 120.8 FAMILY ----------
const Family: React.FC = () => {
  const t = useT();
  const tm = {ramp: (tt: number) => (tt < 106.65 ? 0 : Math.min(tt - 106.65, 12.2))};
  const f = frameAt('portrait', t, tm);
  const fs = FACES.portrait?.[f] ?? [];
  const SY = 330, SH = 608;
  const naanke = wtime(40, 3), daadke = wtime(41, 3);
  const zoom = 1 + ease.inOutCubic(prog(t, 105.58, 120.8)) * 0.08;
  return (
    <Sc a={105.58} b={120.8}>
      <AbsoluteFill style={{background: C.ink}} />
      <div style={{position: 'absolute', left: 0, top: SY, width: W, height: SH, overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`}}>
          <Strip clip="portrait" y={0} {...tm} grade={GRADE.warm}>
            <svg width={W} height={SH} style={{position: 'absolute', inset: 0}}>
              {fs.map((b, i) => {
                const x = b[0] * W, y = b[1] * SH, w = b[2] * W, h = b[3] * SH;
                const side = x + w / 2 < W / 2 ? 'L' : 'R';
                const tag = t >= daadke - 0.04 && side === 'R' ? 'DAADKE' : t >= naanke - 0.04 && side === 'L' ? 'NAANKE' : `ID ${String(i + 1).padStart(2, '0')}`;
                const hot = tag !== `ID ${String(i + 1).padStart(2, '0')}`;
                const col = hot ? (tag === 'NAANKE' ? C.gold : C.red) : C.bone;
                return (
                  <g key={i}>
                    <Brackets x={x - 6} y={y - 6} w={w + 12} h={h + 12} color={col} stroke={hot ? 4 : 2.5} len={0.3} />
                    <text x={x - 6} y={y - 14} fill={col} fontFamily={F.mono} fontSize={hot ? 22 : 16} fontWeight={700} letterSpacing={1.5}>
                      {tag}
                    </text>
                  </g>
                );
              })}
              {/* family tree lines between faces */}
              {fs.slice(1).map((b, i) => {
                const a = fs[i];
                return <line key={`l${i}`} x1={(a[0] + a[2] / 2) * W} y1={(a[1] + a[3]) * SH} x2={(b[0] + b[2] / 2) * W} y2={(b[1] + b[3]) * SH} stroke={C.bone} strokeWidth={1.2} opacity={0.5} />;
              })}
            </svg>
          </Strip>
        </div>
      </div>
      <Mono x={70} y={250} size={26} color={C.red}>{typed(`FAMILY SCAN · ${fs.length} FACES · 3 GENERATIONS`, t, 105.7, 30)}</Mono>
      <Mono x={70} y={SY + SH + 22} size={22}>{`NAANKE = MOTHER'S SIDE   ·   DAADKE = FATHER'S SIDE`}</Mono>
      <FeedChrome cam="CAM 14 · PORTRAIT" />
      <Finish vignette={0.3} />
    </Sc>
  );
};

// ---------- 120.8 – 135.98 STUDY (noir) ----------
const Study: React.FC = () => {
  const t = useT();
  const hand = wtime(48, 0);
  const handOn = t >= hand - 0.04 && t < wtime(48, 2) + 0.4;
  const postS = wtime(50, 0);
  return (
    <Sc a={120.8} b={135.98}>
      <Camera punch={0.03} shake={4} drift={0.002} from={120.8}>
        <Shots
          grade={GRADE.noir}
          shots={[
            {a: 120.8, b: 127.95, clip: 'study', tm: {sync: true}},
            {a: 127.95, b: 133.9, clip: 'study2', tm: {sync: true}},
            {a: 133.9, b: 135.98, clip: 'study2', tm: {from: 133.9, src: 5.9, speed: 0}},
          ]}
        />
      </Camera>
      {/* the only colour in the study: a red wash on the beat */}
      <AbsoluteFill style={{background: C.red, mixBlendMode: 'multiply', opacity: 0.18}} />
      <Scrim from={50} amount={0.85} />
      {handOn && (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <Brackets x={180} y={360} w={720} h={720} color={C.red} stroke={7} len={0.18} />
          <rect x={180} y={300} width={330} height={46} fill={C.red} />
          <text x={196} y={334} fill={C.bone} fontFamily={F.mono} fontWeight={700} fontSize={30} letterSpacing={3}>HANDS UP ✋</text>
        </svg>
      )}
      {t >= postS - 0.04 && (
        <>
          <AbsoluteFill style={{background: 'rgba(5,5,5,0.7)'}} />
          <EmptyPost s={postS} e={135.98} y={330} />
        </>
      )}
      <FeedChrome cam="CAM 15 · STUDY" />
      <Finish />
      <Flash at={[postS]} dur={0.12} />
    </Sc>
  );
};

// ---------- 135.98 – 146.74 BOAT ----------
const Boat: React.FC = () => {
  const t = useT();
  const look = wtime(52, 0);
  const lookEnd = wtime(53, 0);
  const tilt = t >= wtime(52, 3) - 0.04 ? 9 : t >= wtime(52, 2) - 0.04 ? -9 : 0;
  return (
    <Sc a={135.98} b={146.74}>
      <Camera punch={0.04} shake={5} rot={0}>
        <AbsoluteFill style={{transform: `rotate(${tilt}deg) scale(${tilt ? 1.2 : 1})`}}>
          {t >= look && t < lookEnd ? (
            <Full clip="woman" from={look} speed={0.36} grade={GRADE.warm} />
          ) : (
            <Full clip="boat2" sync grade={GRADE.warm} />
          )}
        </AbsoluteFill>
      </Camera>
      {t >= look && t < lookEnd && (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <Brackets x={170} y={520} w={600} h={520} color={C.red} stroke={6} />
          <rect x={170} y={466} width={360} height={42} fill={C.red} />
          <text x={184} y={496} fill={C.bone} fontFamily={F.mono} fontWeight={700} fontSize={26} letterSpacing={2}>SIDE-EYE DETECTED</text>
        </svg>
      )}
      <Scrim from={45} amount={0.88} />
      <FeedChrome cam="CAM 16 · RIVER" />
      <Finish />
    </Sc>
  );
};

export const Middle: React.FC = () => (
  <>
    <Family />
    <Study />
    <Boat />
  </>
);
