import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {getLength, getPointAtLength} from '@remotion/paths';
import {Glint, Hoop} from '../components/Hoop';
import {LightLeak} from '../components/Overlays';
import {Reveal} from '../components/Reveal';
import {E, mix, ramp, rng, w} from '../lib/time';
import {C, F} from '../theme';

const LEFT = 'M 540 1240 C 380 1120 236 1000 236 840 C 236 726 320 646 420 646 C 482 646 526 688 540 742';
const RIGHT = 'M 540 742 C 554 688 598 646 660 646 C 760 646 844 726 844 840 C 844 1000 700 1120 540 1240';
const LL = getLength(LEFT);
const RL = getLength(RIGHT);
const LOBE_A = {x: 420, y: 832};
const LOBE_B = {x: 660, y: 832};
const END_A = {x: 196, y: 690};
const END_B = {x: 872, y: 1092};
const HR = 70;
const CAM_END = 0.84;
const OH_T = w(56).start;

const serif = (size: number, italic = true): React.CSSProperties => ({
  fontFamily: F.serif,
  fontStyle: italic ? 'italic' : 'normal',
  fontSize: size,
  lineHeight: 1,
  whiteSpace: 'nowrap',
  color: C.cream,
});

const gold = 'drop-shadow(0 0 10px rgba(246,205,120,0.55)) drop-shadow(0 0 2px rgba(255,240,200,0.9))';

/** Positions of the two hoops in drift-layer coordinates. */
const drift = (t: number) => {
  const s = ramp(t, 21.55, 28.2, E.soft);
  return {
    a: {x: mix(LOBE_A.x, END_A.x, s), y: mix(LOBE_A.y, END_A.y, s)},
    b: {x: mix(LOBE_B.x, END_B.x, s), y: mix(LOBE_B.y, END_B.y, s)},
  };
};
const camScale = (t: number) => mix(1, CAM_END, ramp(t, 21.5, 28, E.soft));
const toScreen = (p: {x: number; y: number}, k: number) => ({x: 540 + (p.x - 540) * k, y: 960 + (p.y - 960) * k});

/* bokeh dust, seeded */
const DUST = (() => {
  const r = rng(42);
  return Array.from({length: 70}, () => ({x: r() * 1180 - 50, y: r() * 2100 - 90, z: 0.25 + r() * 0.75, s: 2 + r() * 14, ph: r() * 6.28, warm: r() > 0.6}));
})();

const Dust: React.FC<{t: number; a: number}> = ({t, a}) => (
  <>
    {DUST.map((d, i) => {
      const y = ((d.y - t * 18 * d.z) % 2100 + 2100) % 2100 - 90;
      const x = d.x + Math.sin(t * 0.4 + d.ph) * 12 * d.z;
      const size = d.s * (0.6 + d.z);
      const op = a * (0.12 + 0.35 * d.z) * (0.7 + 0.3 * Math.sin(t * 1.7 + d.ph));
      const col = d.warm ? '255, 214, 150' : '200, 196, 255';
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x - size,
            top: y - size,
            width: size * 2,
            height: size * 2,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(${col}, ${op}) 0%, rgba(${col}, ${op * 0.4}) 40%, rgba(${col}, 0) 70%)`,
          }}
        />
      );
    })}
  </>
);

/* ================================================================== WIRE + DRIFT */
export const WireDrift: React.FC<{t: number}> = ({t}) => {
  const fadeIn = ramp(t, 18.3, 18.7);
  const draw = ramp(t, 18.55, 21.2, E.soft);
  const lp = Math.min(1, draw * 2);
  const rp = Math.max(0, draw * 2 - 1) * 0.86; // never closes
  const split = ramp(t, w(48).start, w(48).start + 0.6, E.out);
  const wireA = 1 - ramp(t, w(48).start + 0.1, w(48).start + 0.55);
  const k = camScale(t);
  const {a, b} = drift(t);
  const born = ramp(t, 21.5, 22.05, E.out);
  const wireTextOut = w(48).start - 0.05;
  const late = (1 - 0.8 * ramp(t, 26.0, 27.2, E.inOut)) * (1 - ramp(t, OH_T - 0.3, OH_T + 0.1));
  const ohGone = t > OH_T - 0.25;
  // tip of the stroke carries a spark while drawing
  const tipGlint = t < 18.6 ? 0 : draw > 0 && draw < 1 && t < 21.3 ? 0.7 : interpolate(t, [21.2, 21.5], [0.7, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const heartKick = 0.03 * Math.exp(-Math.max(0, t - w(47).start) * 5) * (t >= w(47).start ? 1 : 0);

  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #06060B 0%, #0B0C16 55%, #07070C 100%)', opacity: fadeIn}}>
      {/* black glass reflection */}
      <AbsoluteFill style={{background: 'linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.035) 42%, rgba(255,255,255,0) 52%)', opacity: 1 - split}} />
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 46%, rgba(233,196,119,${0.1 * draw * (1 - split) + 0.06}) 0%, rgba(0,0,0,0) 55%)`}} />
      <AbsoluteFill style={{transform: `scale(${k * (1 + heartKick)})`, transformOrigin: '540px 960px'}}>
        <Dust t={t} a={ramp(t, 21.3, 22.5) * late + 0.25} />
        {/* the gold wire heart */}
        {wireA > 0 && (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, filter: gold, opacity: wireA, overflow: 'visible'}}>
            <defs>
              <linearGradient id="wire" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={C.gold1} />
                <stop offset="0.5" stopColor={C.gold2} />
                <stop offset="1" stopColor={C.gold3} />
              </linearGradient>
            </defs>
            <g transform={`translate(${-140 * split} ${40 * split}) rotate(${-14 * split} 400 900)`}>
              <path d={LEFT} fill="none" stroke="url(#wire)" strokeWidth={7} strokeLinecap="round" strokeDasharray={`${LL} ${LL}`} strokeDashoffset={LL * (1 - lp)} />
            </g>
            <g transform={`translate(${140 * split} ${40 * split}) rotate(${14 * split} 680 900)`}>
              <path d={RIGHT} fill="none" stroke="url(#wire)" strokeWidth={7} strokeLinecap="round" strokeDasharray={`${RL} ${RL}`} strokeDashoffset={RL * (1 - rp)} />
            </g>
          </svg>
        )}
        {/* wire tip spark */}
        {t < 21.6 && <WireTip draw={draw} s={tipGlint} />}
        {/* the two hoops born from the two lobes */}
        {born > 0 && (
          <>
            <Hoop x={a.x} y={a.y} r={HR * born} spin={t * 1.1 + 0.6} roll={-10} glow={0.9} opacity={born * (1 - ramp(t, OH_T - 0.35, OH_T + 0.05))} />
            {!ohGone && <Hoop x={b.x} y={b.y} r={HR * born} spin={t * 0.8 + 2.2} roll={8} glow={0.9} opacity={born} />}
          </>
        )}
      </AbsoluteFill>

      {/* ---- WIRE lyrics ---- */}
      <div style={{position: 'absolute', left: 110, top: 330, display: 'flex', gap: 20}}>
        <Reveal t={t} at={w(41).start} out={wireTextOut} style={serif(74, false)}>’Cause</Reveal>
        <Reveal t={t} at={w(42).start} out={wireTextOut} style={serif(74, false)}>you</Reveal>
        <Reveal t={t} at={w(43).start} out={wireTextOut} style={serif(74, false)}>just</Reveal>
      </div>
      <div style={{position: 'absolute', left: 100, top: 410}}>
        <Reveal t={t} at={w(44).start} out={wireTextOut} style={serif(200)}>never</Reveal>
      </div>
      <div style={{position: 'absolute', left: 0, width: 1080, top: 1300, display: 'flex', gap: 20, justifyContent: 'center'}}>
        <Reveal t={t} at={w(45).start} out={wireTextOut} style={serif(74, false)}>had</Reveal>
        <Reveal t={t} at={w(46).start} out={wireTextOut} style={serif(74, false)}>the</Reveal>
      </div>
      <div style={{position: 'absolute', left: 0, width: 1080, top: 790, textAlign: 'center', transform: `scale(${1 + heartKick * 2})`}}>
        <Reveal t={t} at={w(47).start} out={wireTextOut + 0.15} style={{...serif(196), color: C.gold1, textShadow: '0 0 30px rgba(246,205,120,0.45)'}}>heart.</Reveal>
      </div>

      {/* ---- DRIFT lyrics ---- */}
      <div style={{opacity: late}}>
        <div style={{position: 'absolute', left: 110, top: 330, display: 'flex', gap: 20}}>
          <Reveal t={t} at={w(48).start} style={serif(74, false)}>Now</Reveal>
          <Reveal t={t} at={w(49).start} style={serif(74, false)}>they</Reveal>
          <Reveal t={t} at={w(50).start} style={serif(74, false)}>just</Reveal>
        </div>
        <DriftWord t={t} />
        <div style={{position: 'absolute', left: 0, width: 1080, top: 1150, textAlign: 'center'}}>
          <Reveal t={t} at={w(52).start} style={{...serif(118, false), letterSpacing: 46 * ramp(t, w(52).start, 27, E.soft)}}>further</Reveal>
        </div>
        <Apart t={t} />
      </div>
      <div style={{position: 'absolute', left: 0, width: 1080, top: 1478, display: 'flex', gap: 16, justifyContent: 'center', opacity: 1 - ramp(t, OH_T - 0.2, OH_T + 0.2)}}>
        <Reveal t={t} at={w(54).start} style={serif(62, false)}>from</Reveal>
        <Reveal t={t} at={w(55).start} style={serif(62)}>you.</Reveal>
      </div>
    </AbsoluteFill>
  );
};

const WireTip: React.FC<{draw: number; s: number}> = ({draw, s}) => {
  const lp = Math.min(1, draw * 2);
  const rp = Math.max(0, draw * 2 - 1) * 0.86;
  const pt = draw < 0.5 ? getPointAtLength(LEFT, LL * lp) : getPointAtLength(RIGHT, RL * rp);
  if (!pt) return null;
  return <Glint x={pt.x} y={pt.y} size={70} s={s} rot={draw * 90} />;
};

const DriftWord: React.FC<{t: number}> = ({t}) => {
  const at = w(51).start;
  const slide = 70 * ramp(t, at, 27.5, E.soft);
  const trail = ramp(t, at, at + 0.6, E.out);
  return (
    <div style={{position: 'absolute', left: 100 + slide, top: 410}}>
      {[4, 3, 2, 1].map((i) => (
        <div key={i} style={{position: 'absolute', left: -i * 26 * trail, top: 0, opacity: (0.22 / i) * ramp(t, at, at + 0.2)}}>
          <span style={serif(230)}>drift</span>
        </div>
      ))}
      <Reveal t={t} at={at} style={serif(230)}>drift</Reveal>
    </div>
  );
};

const Apart: React.FC<{t: number}> = ({t}) => {
  const at = w(53).start;
  const sep = 230 * ramp(t, at + 0.15, 27.5, E.soft);
  const tilt = 6 * ramp(t, at + 0.15, 27.5, E.soft);
  return (
    <div style={{position: 'absolute', left: 0, width: 1080, top: 1250, display: 'flex', justifyContent: 'center'}}>
      <div style={{transform: `translateX(${-sep}px) rotate(${-tilt}deg)`}}>
        <Reveal t={t} at={at} style={serif(210)}>ap</Reveal>
      </div>
      <div style={{transform: `translateX(${sep}px) rotate(${tilt}deg)`}}>
        <Reveal t={t} at={at + 0.06} style={serif(210)}>art</Reveal>
      </div>
    </div>
  );
};

/* ================================================================== OH */
export const Oh: React.FC<{t: number}> = ({t}) => {
  const start = toScreen(drift(OH_T - 0.25).b, camScale(OH_T - 0.25));
  const rush = ramp(t, OH_T - 0.25, OH_T + 0.3, E.out);
  const x = mix(start.x, 392, rush);
  const y = mix(start.y, 900, rush);
  const r = mix(HR * CAM_END, 236, rush);
  const settle = 1 - ramp(t, 30.4, 31.6, E.inOut) * 0.12;
  const dim = 1 - 0.55 * ramp(t, 30.6, 31.8, E.inOut);
  const end = ramp(t, 32.55, 33.35, E.inOut);
  const halo = interpolate(t, [OH_T - 0.1, OH_T + 0.25, 30.5, 32], [0, 1, 0.6, 0.35], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hP = ramp(t, OH_T - 0.02, OH_T + 0.5, E.out);
  const finalGlint = interpolate(t, [32.0, 32.25, 32.9], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const title = ramp(t, 30.7, 31.5, E.out);
  return (
    <AbsoluteFill style={{opacity: t < OH_T - 0.25 ? 0 : 1}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${x}px ${y}px, rgba(246,205,120,${0.32 * halo}) 0%, rgba(217,161,160,${0.14 * halo}) 30%, rgba(0,0,0,0) 62%)`}} />
      <LightLeak p={ramp(t, OH_T - 0.1, OH_T + 1.6, E.soft)} a={0.55 * interpolate(t, [OH_T - 0.1, OH_T + 0.3, OH_T + 1.6], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
      <AbsoluteFill style={{transform: `scale(${settle})`, transformOrigin: '540px 920px', opacity: dim * (1 - end)}}>
        <Hoop x={x} y={y} r={r} spin={mix(t * 0.8 + 2.2, Math.PI * 4, rush)} roll={mix(8, 0, rush)} thick={mix(12, 34, rush)} glow={0.8 + halo} post={false} />
        <div style={{position: 'absolute', left: 646, top: 560, opacity: hP, transform: `translateX(${40 * (1 - hP)}px)`, filter: hP < 1 ? `blur(${12 * (1 - hP)}px)` : undefined}}>
          <span style={{...serif(560), color: C.gold1, textShadow: '0 0 40px rgba(246,205,120,0.35)'}}>h.</span>
        </div>
        <Glint x={x - r * 0.55} y={y - r * 0.7} size={160} s={finalGlint} rot={15} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 0, width: 1080, top: 1240, display: 'flex', gap: 22, justifyContent: 'center', opacity: 1 - ramp(t, 30.3, 30.8)}}>
        <Reveal t={t} at={w(57).start} dur={0.6} style={serif(100, false)}>from</Reveal>
        <Reveal t={t} at={w(58).start} dur={0.6} style={serif(100)}>you.</Reveal>
      </div>
      <div style={{position: 'absolute', left: 0, width: 1080, top: 1250, textAlign: 'center', opacity: title * (1 - end), transform: `translateY(${20 * (1 - title)}px)`}}>
        <div style={{...serif(124), color: C.cream}}>earrings</div>
        <div style={{fontFamily: F.mono, fontSize: 26, letterSpacing: 12, color: C.rose, marginTop: 26}}>MALCOLM TODD</div>
      </div>
    </AbsoluteFill>
  );
};
