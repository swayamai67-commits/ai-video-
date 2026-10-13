import React from 'react';
import {C} from '../theme';

/**
 * Full-body cut-paper figures. Local space: feet on y = 0, ~430 tall, facing +x.
 * `walk` is the gait phase in radians (0 = standing), `wave` lifts her far arm (0..1).
 */

const SKIN = C.skin;
const SKIN_D = C.skin2;
const OUT = '#1A0F0A';

const Limb: React.FC<{x: number; y: number; len: number; w: number; ang: number; fill: string; children?: React.ReactNode}> = ({
  x,
  y,
  len,
  w,
  ang,
  fill,
  children,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${ang})`}>
    <rect x={-w / 2} y={0} width={w} height={len} rx={w / 2} fill={fill} stroke={OUT} strokeWidth={3} />
    <g transform={`translate(0 ${len})`}>{children}</g>
  </g>
);

const boyArms = (walk: number, holdFront: number, holdBack: number) => {
  const s = Math.sin(walk);
  // holding the thread: the arm reaches out toward her; otherwise it swings with the gait
  return {front: holdFront * -58 + (1 - holdFront) * (-20 * s), back: holdBack * 42 + (1 - holdBack) * (18 * s)};
};

export const Boy: React.FC<{walk: number; holdFront?: number; holdBack?: number; t: number}> = ({walk, holdFront = 0, holdBack = 0, t}) => {
  const s = Math.sin(walk);
  const legA = 24 * s;
  const bob = -Math.abs(Math.sin(walk)) * 6;
  const breathe = Math.sin(t * 2.2) * 1.5;
  const {front: armFront, back: armBack} = boyArms(walk, holdFront, holdBack);
  return (
    <g transform={`translate(0 ${bob})`}>
      {/* back leg + arm */}
      <Limb x={-14} y={-196} len={150} w={40} ang={-legA} fill="#202838">
        <path d="M -24 0 L 34 0 Q 40 22 30 30 L -26 30 Q -32 14 -24 0 Z" fill="#F2EEE6" stroke={OUT} strokeWidth={3} transform="translate(0 26)" />
      </Limb>
      <Limb x={-30} y={-318} len={120} w={26} ang={armBack} fill={SKIN_D} />
      {/* torso: white tee */}
      <path
        d={`M -52 -330 Q -60 -260 -46 -186 L 46 -186 Q 58 -260 50 -330 Q 0 -350 -52 -330 Z`}
        fill="#F6F1E8"
        stroke={OUT}
        strokeWidth={3}
        transform={`translate(0 ${breathe})`}
      />
      <path d="M -46 -200 L 46 -200 L 48 -176 L -48 -176 Z" fill="#202838" stroke={OUT} strokeWidth={3} />
      {/* front leg */}
      <Limb x={14} y={-196} len={150} w={42} ang={legA} fill="#2A3346">
        <path d="M -24 0 L 34 0 Q 40 22 30 30 L -26 30 Q -32 14 -24 0 Z" fill="#FFFFFF" stroke={OUT} strokeWidth={3} transform="translate(0 26)" />
      </Limb>
      {/* neck + head */}
      <rect x={-12} y={-358} width={24} height={34} fill={SKIN_D} />
      <g transform={`translate(4 ${-392 + breathe})`}>
        <ellipse cx={0} cy={0} rx={38} ry={44} fill={SKIN} stroke={OUT} strokeWidth={3} />
        <path d="M 30 -2 Q 44 6 34 14" fill={SKIN} stroke={OUT} strokeWidth={3} />
        <path d="M 14 -6 q 6 -4 12 0" stroke={OUT} strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d="M 18 22 q 8 4 14 -2" stroke={OUT} strokeWidth={3} fill="none" strokeLinecap="round" />
        {/* green cap, bill forward */}
        <path d="M -42 -10 Q -44 -58 0 -60 Q 40 -58 40 -16 Z" fill={C.cap} stroke={OUT} strokeWidth={3} />
        <path d="M 28 -16 L 74 -12 Q 78 -4 70 -2 L 30 -4 Z" fill="#245A3F" stroke={OUT} strokeWidth={3} />
        <circle cx={-4} cy={-60} r={5} fill="#245A3F" />
      </g>
      {/* front arm */}
      <Limb x={34} y={-320} len={124} w={28} ang={armFront} fill={SKIN} />
    </g>
  );
};

/** The boy's hands relative to his feet, in local (unflipped, facing +x) space. */
export const boyHands = (walk: number, holdFront: number, holdBack: number) => {
  const {front, back} = boyArms(walk, holdFront, holdBack);
  const bob = -Math.abs(Math.sin(walk)) * 6;
  const f = (front * Math.PI) / 180;
  const b = (back * Math.PI) / 180;
  return {
    front: {x: 34 - Math.sin(f) * 124, y: -320 + Math.cos(f) * 124 + bob},
    back: {x: -30 - Math.sin(b) * 120, y: -318 + Math.cos(b) * 120 + bob},
  };
};

export const Girl: React.FC<{t: number; wave?: number; holdArm?: number}> = ({t, wave = 0, holdArm = 1}) => {
  const breathe = Math.sin(t * 2.2 + 1) * 1.5;
  const waveAng = -160 * wave + Math.sin(t * 14) * 22 * wave;
  const front = holdArm * 56 + (1 - holdArm) * 8;
  return (
    <g>
      {/* legs */}
      <Limb x={-14} y={-150} len={128} w={30} ang={2} fill={SKIN_D}>
        <path d="M -20 0 L 26 0 Q 30 16 24 22 L -20 22 Z" fill={C.lipstick} stroke={OUT} strokeWidth={3} transform="translate(0 4)" />
      </Limb>
      <Limb x={14} y={-150} len={128} w={30} ang={-2} fill={SKIN}>
        <path d="M -20 0 L 26 0 Q 30 16 24 22 L -20 22 Z" fill={C.lipstick} stroke={OUT} strokeWidth={3} transform="translate(0 4)" />
      </Limb>
      {/* back arm: waves at the end */}
      <Limb x={30} y={-306} len={112} w={24} ang={waveAng} fill={SKIN_D} />
      {/* sunflower-yellow dress */}
      <path
        d={`M -40 -318 Q 0 -334 40 -318 L 50 -250 Q 96 -170 92 -128 Q 0 -112 -92 -128 Q -96 -170 -50 -250 Z`}
        fill={C.sun}
        stroke={OUT}
        strokeWidth={3}
        transform={`translate(0 ${breathe})`}
      />
      <path d="M -70 -150 Q 0 -138 70 -150" stroke="#E39A12" strokeWidth={4} fill="none" />
      {/* neck + head + curls */}
      <rect x={-11} y={-346} width={22} height={34} fill={SKIN_D} />
      <g transform={`translate(-2 ${-378 + breathe})`}>
        {[[-34, -30, 30], [0, -46, 32], [32, -30, 28], [-46, 6, 26], [42, 4, 22], [-40, 40, 24], [20, -54, 22]].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={C.hair} />
        ))}
        <ellipse cx={0} cy={0} rx={34} ry={40} fill={SKIN} stroke={OUT} strokeWidth={3} />
        {[[-28, -32, 22], [8, -42, 22], [-40, -6, 18]].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={C.hair} />
        ))}
        <path d="M -24 -4 q 6 -4 12 0" stroke={OUT} strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d="M -24 20 q 8 6 16 0" stroke={C.lipstick} strokeWidth={5} fill="none" strokeLinecap="round" />
        <g transform="translate(30 -36) scale(0.9)">
          {Array.from({length: 10}).map((_, i) => (
            <ellipse key={i} cx={0} cy={-13} rx={5} ry={11} fill={C.sun} stroke={OUT} strokeWidth={1.5} transform={`rotate(${i * 36})`} />
          ))}
          <circle r={8} fill="#5B3212" />
        </g>
      </g>
      {/* front arm reaches toward him (−x) holding the thread */}
      <Limb x={-30} y={-308} len={116} w={26} ang={front} fill={SKIN} />
    </g>
  );
};

export const girlHand = (holdArm: number) => {
  const ang = ((holdArm * 56 + (1 - holdArm) * 8) * Math.PI) / 180;
  return {x: -30 - Math.sin(ang) * 116, y: -308 + Math.cos(ang) * 116};
};
