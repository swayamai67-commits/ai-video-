import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {Glint, Hoop} from '../components/Hoop';
import {LightLeak, SheetImg} from '../components/Overlays';
import {Reveal} from '../components/Reveal';
import {bounce, E, mix, ramp, w} from '../lib/time';
import {C, F} from '../theme';

// One-line profile drawing (facing right). The earlobe sits at (540, 905) so the hoop hangs at the centre of frame.
const HEAD =
  'M 300 1600 C 300 1480 280 1380 240 1290 C 160 1130 140 930 180 760 C 230 540 410 370 610 360 ' +
  'C 800 352 900 480 880 640 C 874 712 846 768 862 828 C 872 868 912 914 938 962 C 952 992 926 1008 890 1012 ' +
  'C 896 1034 908 1052 898 1072 C 888 1088 882 1098 898 1112 C 908 1132 888 1152 872 1162 C 860 1178 870 1204 858 1228 ' +
  'C 842 1262 796 1272 738 1276 C 700 1282 690 1336 698 1404 C 706 1480 718 1540 728 1600';
const EAR = 'M 520 820 C 560 790 610 815 606 862 C 603 895 575 900 566 925 C 558 948 545 958 530 950 C 515 942 524 925 532 915';
const HAIR = 'M 250 700 C 300 560 430 450 600 430 M 205 860 C 230 720 300 610 420 540';

export const HOOP = {x: 540, y: 960, r: 54};
export const LAND_A = {x: 455, y: 1170, t: w(9).start};
export const LAND_B = {x: 700, y: 1260, t: w(9).start + 0.24};
const DROP = 3.8;
const TILT_A = 3.78;
const TILT_B = 4.55;

const Stroke: React.FC<{d: string; p: number; len: number; width?: number; color?: string; opacity?: number}> = ({d, p, len, width = 3.2, color = C.cream, opacity = 0.9}) => (
  <path
    d={d}
    fill="none"
    stroke={color}
    strokeOpacity={opacity}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeDasharray={`${len} ${len}`}
    strokeDashoffset={len * (1 - p)}
  />
);

const serif = (size: number, italic = true): React.CSSProperties => ({
  fontFamily: F.serif,
  fontStyle: italic ? 'italic' : 'normal',
  fontSize: size,
  lineHeight: 1,
  whiteSpace: 'nowrap',
});

/** Spin of the hoop around its vertical axis during the intro + hang. */
const introSpin = (t: number) => {
  const p = ramp(t, 0.2, 1.45, E.out);
  return (1 - p) * Math.PI * 7 + Math.PI / 2 * (1 - ramp(t, 0.2, 0.5, E.out)) * 0;
};

/** Pendulum swing about the lobe while it hangs; a nudge on "lost" before it drops. */
const swing = (t: number) => {
  const a = 9 * Math.exp(-(t - 1.5) * 1.4) * Math.sin((t - 1.5) * 5.2) * (t > 1.5 ? 1 : 0);
  const nudge = t > w(6).start ? 14 * Math.exp(-(t - w(6).start) * 4) * Math.sin((t - w(6).start) * 22) : 0;
  return a + nudge;
};

export const HeadSheet: React.FC<{t: number}> = ({t}) => {
  const tilt = ramp(t, TILT_A, TILT_B, E.inOut);
  const camY = -1920 * tilt;
  // push into the fold shadow, through to the phone
  const push = ramp(t, 6.02, 6.5, E.in);
  const pushScale = 1 + push * 2.6;
  const black = ramp(t, 6.25, 6.5);

  const headDraw = ramp(t, 1.15, 3.35, E.soft);
  const earDraw = ramp(t, 1.0, 1.7, E.soft);
  const hairDraw = ramp(t, 2.2, 3.4, E.soft);

  // backgrounds
  const roseGlow = ramp(t, 0.1, 1.6, E.out);

  // words
  const loveP = ramp(t, w(1).start - 0.06, w(1).start + 0.45, E.out);

  // hoop in head world until drop
  const hangSpin = introSpin(t);
  const hoopIntroA = ramp(t, 0.18, 0.6, E.out);
  const hoopScale = mix(0.55, 1, ramp(t, 0.18, 1.3, E.out));
  const glintIntro = interpolate(t, [0.12, 0.3, 0.75], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const glintLove = interpolate(t, [w(1).start, w(1).start + 0.12, w(1).start + 0.6], [0, 0.8, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // "You lost your" sits in screen space, crossing from the night into daylight
  const inkMix = tilt;
  const lostColor = `rgb(${mix(244, 58, inkMix)}, ${mix(236, 36, inkMix)}, ${mix(223, 32, inkMix)})`;

  // falling hoops (screen space)
  const fallA = (tt: number) => {
    const s = ramp(tt, DROP, LAND_A.t);
    const y = interpolate(s, [0, 0.35, 0.7, 1], [HOOP.y, HOOP.y + 260, HOOP.y + 330, LAND_A.y], {easing: E.soft});
    const x = mix(HOOP.x, LAND_A.x, E.inOut(s));
    return {x, y, spin: E.out(s) * Math.PI * 6, roll: mix(0, -18, s)};
  };
  const fallB = (tt: number) => {
    const s = ramp(tt, 4.12, LAND_B.t, E.in);
    return {x: mix(820, LAND_B.x, s), y: mix(-120, LAND_B.y, s), spin: E.out(s) * Math.PI * 5, roll: mix(30, 12, s)};
  };

  const landed = (land: {t: number}, h0: number) => bounce(t, land.t, h0, 0.34, 0.2);
  const bA = landed(LAND_A, 46);
  const bB = landed(LAND_B, 38);
  const glintA = interpolate(t, [LAND_A.t, LAND_A.t + 0.08, LAND_A.t + 0.55], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const glintB = interpolate(t, [LAND_B.t + 0.1, LAND_B.t + 0.2, LAND_B.t + 0.6], [0, 0.85, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // the sheet: slow breathing, then the fold shadow sweeps over the pair
  const fold = ramp(t, 5.7, 6.35, E.inOut);
  const sheetBreath = 1.04 + 0.012 * Math.sin(t * 1.3);

  return (
    <AbsoluteFill style={{overflow: 'hidden', background: C.midnight}}>
      <AbsoluteFill style={{transformOrigin: `${LAND_A.x + 90}px ${LAND_A.y + 40}px`, transform: `scale(${pushScale})`}}>
        {/* ---------------- WORLD COLUMN (head above, sheet below) ---------------- */}
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 3840, transform: `translateY(${camY}px)`}}>
          {/* HEAD world */}
          <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, overflow: 'hidden'}}>
            <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 60% at 50% 45%, ${C.indigo} 0%, ${C.midnight} 70%, ${C.midnight} 100%)`}} />
            <AbsoluteFill
              style={{
                background: `radial-gradient(circle at 54% 50%, rgba(217,161,160,${0.38 * roseGlow}) 0%, rgba(142,90,94,${0.18 * roseGlow}) 28%, rgba(0,0,0,0) 58%)`,
              }}
            />
            <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0 0 6px rgba(244,236,223,0.35))'}}>
              <Stroke d={HEAD} p={headDraw} len={4200} />
              <Stroke d={EAR} p={earDraw} len={520} width={3} />
              <Stroke d={HAIR} p={hairDraw} len={900} width={2.2} opacity={0.45} />
            </svg>
            {/* "Her" */}
            <div style={{position: 'absolute', left: 300, top: 520, color: C.cream}}>
              <Reveal t={t} at={w(0).start} style={serif(150)}>
                Her
              </Reveal>
            </div>
            {/* "l◯ve": the hoop is the o */}
            <div
              style={{
                position: 'absolute',
                right: 1080 - 478,
                top: 838,
                color: C.cream,
                ...serif(250),
                opacity: loveP,
                transform: `translateX(${-50 * (1 - loveP)}px)`,
                filter: loveP < 1 ? `blur(${10 * (1 - loveP)}px)` : undefined,
              }}
            >
              l
            </div>
            <div
              style={{
                position: 'absolute',
                left: 604,
                top: 838,
                color: C.cream,
                ...serif(250),
                opacity: loveP,
                transform: `translateX(${50 * (1 - loveP)}px)`,
                filter: loveP < 1 ? `blur(${10 * (1 - loveP)}px)` : undefined,
              }}
            >
              ve
            </div>
            <div style={{position: 'absolute', left: 300, top: 1150, color: C.cream, ...serif(62, false), letterSpacing: 2, display: 'flex', gap: 18}}>
              <Reveal t={t} at={w(2).start}>is</Reveal>
              <Reveal t={t} at={w(3).start}>in</Reveal>
              <Reveal t={t} at={w(4).start}>your</Reveal>
            </div>
            <div style={{position: 'absolute', left: 296, top: 1222, color: C.cream}}>
              <Reveal t={t} at={w(5).start} style={serif(210)}>
                head.
              </Reveal>
            </div>
            {/* hanging hoop (before the drop) */}
            {t < DROP && (
              <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: `${HOOP.x}px ${HOOP.y - HOOP.r}px`, transform: `rotate(${swing(t)}deg)`}}>
                <Hoop x={HOOP.x} y={HOOP.y} r={HOOP.r * hoopScale} spin={hangSpin} opacity={hoopIntroA} glow={0.8} />
              </div>
            )}
            <Glint x={HOOP.x + 30} y={HOOP.y - 40} size={150} s={glintIntro} rot={12} />
            <Glint x={HOOP.x - 36} y={HOOP.y - 30} size={90} s={glintLove} />
          </div>

          {/* SHEET world */}
          <div style={{position: 'absolute', left: 0, top: 1720, width: 1080, height: 2120, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 0, top: 200, width: 1080, height: 1920}}>
            <SheetImg style={{transform: `scale(${sheetBreath})`, filter: 'contrast(1.08) saturate(1.05)'}} />
            {/* warm window light */}
            <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 50% at 20% 15%, rgba(255,226,180,0.35), rgba(255,226,180,0) 70%)', mixBlendMode: 'soft-light'}} />
            {/* night bleeding into the morning light at the seam between worlds (starts above the layer edge) */}
            <div style={{position: 'absolute', left: 0, top: -210, width: 1080, height: 1210, background: `linear-gradient(180deg, ${C.midnight} 0%, ${C.midnight} 17%, rgba(10,11,22,0.85) 36%, rgba(10,11,22,0.4) 55%, rgba(10,11,22,0) 100%)`, opacity: 1 - ramp(t, 4.3, 4.9, E.soft)}} />
            <EarringsWord t={t} />
            <div style={{position: 'absolute', right: 80, top: 1360, color: C.ink, display: 'flex', alignItems: 'baseline', gap: 22, ...serif(92, false)}}>
              <Reveal t={t} at={w(10).start} blur={8}>in</Reveal>
              <Reveal t={t} at={w(11).start} blur={8}>her</Reveal>
              <Reveal t={t} at={w(12).start} blur={8} style={serif(150)}>bed.</Reveal>
            </div>
            {/* landed pair */}
            {t >= LAND_A.t && <LandedHoop x={LAND_A.x} y={LAND_A.y} b={bA} roll={-18} />}
            {t >= LAND_B.t && <LandedHoop x={LAND_B.x} y={LAND_B.y} b={bB} roll={12} />}
            <Glint x={LAND_A.x - 30} y={LAND_A.y - 40} size={120} s={glintA} rot={-8} />
            <Glint x={LAND_B.x + 34} y={LAND_B.y - 36} size={100} s={glintB} rot={20} />
            {/* fold shadow sliding over the pair */}
            <div
              style={{
                position: 'absolute',
                left: -600,
                top: -400,
                width: 2400,
                height: 2800,
                transform: `rotate(-24deg) translateX(${mix(1700, 360, fold)}px)`,
                background: 'linear-gradient(90deg, rgba(30,14,14,0) 0%, rgba(30,14,14,0.55) 8%, rgba(12,6,8,0.92) 22%, rgba(5,3,4,1) 40%)',
                opacity: fold > 0 ? 1 : 0,
              }}
            />
          </div>
          </div>
        </div>

        {/* falling hoops: screen space so the camera can track them */}
        {t >= DROP && t < LAND_A.t && (() => {
          const f = fallA(t);
          return <Hoop x={f.x} y={f.y} r={HOOP.r} spin={f.spin} roll={f.roll} glow={0.7} />;
        })()}
        {t >= 4.12 && t < LAND_B.t && (() => {
          const f = fallB(t);
          return <Hoop x={f.x} y={f.y} r={HOOP.r} spin={f.spin} roll={f.roll} glow={0.7} />;
        })()}
      </AbsoluteFill>

      {/* "You lost your": screen-space, rides through the tilt */}
      <div style={{position: 'absolute', left: 92, top: 300, display: 'flex', gap: 20, alignItems: 'baseline', color: lostColor, opacity: 1 - ramp(t, 5.9, 6.2)}}>
        <Reveal t={t} at={w(6).start} style={serif(84, false)}>You</Reveal>
        <Reveal t={t} at={w(7).start} style={serif(124)}>lost</Reveal>
        <Reveal t={t} at={w(8).start} style={serif(84, false)}>your</Reveal>
      </div>
      <LightLeak p={ramp(t, 4.25, 5.9, E.soft)} a={0.5 * interpolate(t, [4.25, 4.7, 5.9], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
      <AbsoluteFill style={{background: '#000', opacity: black}} />
    </AbsoluteFill>
  );
};

const LandedHoop: React.FC<{x: number; y: number; b: number; roll: number}> = ({x, y, b, roll}) => (
  <>
    {/* contact shadow: tighter and darker when resting */}
    <div
      style={{
        position: 'absolute',
        left: x - 70 + 10 + b * 0.25,
        top: y - 66 + 16 + b * 0.35,
        width: 140,
        height: 132,
        borderRadius: '50%',
        border: `${10 + b * 0.05}px solid rgba(70,40,30,${0.4 - b * 0.004})`,
        filter: `blur(${5 + b * 0.18}px)`,
        transform: `rotate(${roll}deg)`,
      }}
    />
    <Hoop x={x} y={y - b * 0.15} r={HOOP.r * (1 + b * 0.0035)} spin={0} roll={roll} glow={0.35} />
  </>
);

/** "earrings": each letter drops in with a hard metallic bounce, like the hoops. */
const EarringsWord: React.FC<{t: number}> = ({t}) => {
  const letters = 'earrings'.split('');
  const t0 = w(9).start - 0.04;
  return (
    <div style={{position: 'absolute', left: 70, top: 560, display: 'flex', transform: 'rotate(-5deg)', color: C.ink}}>
      {letters.map((ch, i) => {
        const at = t0 + i * 0.045;
        const fall = ramp(t, at - 0.18, at, E.in);
        const b = bounce(t, at, 34, 0.3, 0.16);
        const y = -260 * (1 - fall) - b;
        const op = ramp(t, at - 0.18, at - 0.1);
        return (
          <span key={i} style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 236, lineHeight: 1, display: 'inline-block', transform: `translateY(${y}px)`, opacity: op, textShadow: '0 10px 24px rgba(80,40,30,0.18)'}}>
            {ch}
          </span>
        );
      })}
    </div>
  );
};
