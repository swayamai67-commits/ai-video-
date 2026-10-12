import React from 'react';
import {AbsoluteFill} from 'remotion';
import {word} from '../data';
import {F} from '../fonts';
import {Lock, typed} from '../hud/Lock';
import {Scribble, MarkerText, Stamp, arrowPath, crownPath, loopPath} from '../hud/Marks';
import {allRects} from '../hud/Track';
import {clamp, ease, impulse, mix, prog, rnd, springAt, useT, windowed} from '../lib';
import {C, DH, DW} from '../theme';

const mono: React.CSSProperties = {fontFamily: F.mono, color: C.ivory, letterSpacing: 2, textShadow: '0 1px 6px rgba(0,0,0,0.6)'};
const ws = (id: number, k: number) => word(id, k).s;

/* ---------- BOOT: a scan line sweeps the frame as the rig powers on ---------- */
const Boot: React.FC = () => {
  const t = useT();
  if (t > 3.2) return null;
  const p = ease.inOutCubic(prog(t, 1.0, 2.1));
  const op = windowed(t, 1.0, 2.4, 0.1, 0.3);
  return (
    <AbsoluteFill style={{opacity: op}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: p * DH - 1, height: 2, background: C.champagne, boxShadow: `0 0 18px 4px rgba(230,194,122,0.6)`}} />
      <div style={{...mono, position: 'absolute', right: 64, top: p * DH + 10, fontSize: 15, opacity: 0.8}}>SCANNING ESTATE {Math.round(p * 100)}%</div>
    </AbsoluteFill>
  );
};

/* ---------- MULTI-LOCK: brackets on everyone in frame ---------- */
const MultiLock: React.FC<{from: number; to: number; label: string; max?: number}> = ({from, to, label, max = 6}) => {
  const t = useT();
  if (t < from || t > to + 0.35) return null;
  const rs = allRects(t, max, 0.003);
  const out = ease.inCubic(prog(t, to, to + 0.3));
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      {rs.map((r, k) => {
        const t0 = from + k * 0.09;
        if (t < t0) return null;
        const sp = springAt(t - t0, 3, 0.4);
        const g = (1 - sp) * 0.4;
        const L = Math.min(22, r.w * 0.3, r.h * 0.3);
        const b = (s: React.CSSProperties) => <div style={{position: 'absolute', width: L, height: L, borderColor: C.ivory, borderStyle: 'solid', ...s}} />;
        return (
          <div key={k} style={{position: 'absolute', left: r.x - (r.w * g) / 2, top: r.y - (r.h * g) / 2, width: r.w * (1 + g), height: r.h * (1 + g), opacity: clamp(prog(t, t0, t0 + 0.06))}}>
            {b({left: 0, top: 0, borderWidth: '2px 0 0 2px'})}
            {b({right: 0, top: 0, borderWidth: '2px 2px 0 0'})}
            {b({left: 0, bottom: 0, borderWidth: '0 0 2px 2px'})}
            {b({right: 0, bottom: 0, borderWidth: '0 2px 2px 0'})}
            <div style={{...mono, position: 'absolute', left: 0, bottom: '100%', marginBottom: 6, fontSize: 13, background: 'rgba(10,10,10,0.6)', padding: '1px 6px', whiteSpace: 'nowrap'}}>
              {typed(`${label}-${String(k + 1).padStart(2, '0')}`, t, t0 + 0.05, 50)}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- PHATT: the shot ---------- */
const Phatt: React.FC = () => {
  const t = useT();
  const t0 = ws(10, 4);
  if (t < 42.55 || t > 46.2) return null;
  // crosshair settles onto the barrel tip while he says "mere zor bada ae"
  const aim = windowed(t, 42.6, t0 + 0.05, 0.25, 0.05);
  const settle = springAt(t - 42.6, 1.6, 0.5);
  const cx = mix(1500, 1712, settle), cy = mix(330, 446, settle);
  const slam = springAt(t - t0, 3.2, 0.3);
  const word = windowed(t, t0 - 0.02, 44.02, 0.04, 0.06);
  const burst = ease.outExpo(prog(t, t0, t0 + 0.3));
  // the clay bursts in the sky shot
  const clay = t >= 44.04 ? t - 44.04 : -1;
  return (
    <AbsoluteFill>
      {aim > 0 && t < t0 + 0.05 && (
        <div style={{position: 'absolute', left: cx - 90, top: cy - 90, width: 180, height: 180, opacity: aim}}>
          <svg width={180} height={180} style={{overflow: 'visible'}}>
            <circle cx={90} cy={90} r={70} fill="none" stroke={C.ivory} strokeWidth={2} strokeDasharray="10 8" transform={`rotate(${t * 90} 90 90)`} />
            <circle cx={90} cy={90} r={6} fill={C.red} />
            {[0, 90, 180, 270].map((a) => (
              <line key={a} x1={90} y1={8} x2={90} y2={40} stroke={C.ivory} strokeWidth={3} transform={`rotate(${a} 90 90)`} />
            ))}
          </svg>
          <div style={{...mono, position: 'absolute', left: 190, top: 60, fontSize: 15, whiteSpace: 'nowrap'}}>{typed('ARMED · 12 GAUGE', t, 42.75, 40)}</div>
        </div>
      )}
      {t >= t0 - 0.02 && t < 44.04 && (
        <>
          <svg width={DW} height={DH} style={{position: 'absolute', opacity: 1 - burst * 0.6}}>
            {Array.from({length: 18}).map((_, k) => {
              const a = (k / 18) * Math.PI * 2 + rnd(k) * 0.2;
              const r0 = 60 + burst * 120, r1 = r0 + 120 + rnd(k + 5) * 220 * burst;
              return <line key={k} x1={1712 + Math.cos(a) * r0} y1={446 + Math.sin(a) * r0} x2={1712 + Math.cos(a) * r1} y2={446 + Math.sin(a) * r1} stroke={k % 3 ? C.ivory : C.red} strokeWidth={k % 3 ? 4 : 7} strokeLinecap="round" />;
            })}
          </svg>
          <div style={{position: 'absolute', left: 1180, top: 120, transform: `rotate(-7deg) scale(${mix(2.2, 1, slam)})`, transformOrigin: 'center', opacity: word,
            fontFamily: F.hero, fontSize: 250, color: C.red, letterSpacing: 6, WebkitTextStroke: `4px ${C.ivory}`, textShadow: '0 12px 40px rgba(0,0,0,0.5)'}}>
            PHATT!
          </div>
        </>
      )}
      {clay >= 0 && clay < 2.2 && (
        <AbsoluteFill style={{opacity: 1 - prog(clay, 1.7, 2.2)}}>
          <svg width={DW} height={DH} style={{position: 'absolute'}}>
            {Array.from({length: 46}).map((_, k) => {
              const a = rnd(k * 3.1) * Math.PI * 2, v = 200 + rnd(k * 7.7) * 700;
              const d = v * (1 - Math.exp(-clay * 3)), g = 140 * clay * clay;
              const x = 960 + Math.cos(a) * d, y = 470 + Math.sin(a) * d + g, s = 12 + rnd(k) * 26;
              return <rect key={k} x={x} y={y} width={s} height={s * 0.6} fill={k % 4 ? '#E4602A' : C.ivory} transform={`rotate(${clay * 400 * (rnd(k + 2) - 0.5)} ${x} ${y})`} opacity={1 - clay / 2.2} />;
            })}
            {/* hit marker */}
            {[45, 135, 225, 315].map((a) => (
              <line key={a} x1={960} y1={470 - 30 - clay * 20} x2={960} y2={470 - 80 - clay * 20} stroke={C.red} strokeWidth={14} strokeLinecap="round" transform={`rotate(${a} 960 470)`} opacity={impulse(clay, 0, 0.9)} />
            ))}
          </svg>
          <div style={{...mono, position: 'absolute', left: 1010, top: 520, fontSize: 30, fontWeight: 700, color: C.red, background: 'rgba(10,10,10,0.55)', padding: '2px 10px', opacity: impulse(clay, 0, 1.2)}}>{typed('CLAY · DOWN', clay, 0.05, 30)}</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ---------- CLAIMED: the three cars ---------- */
const CARS = [
  {x: 10, y: 660, w: 390, h: 190, k: 0},
  {x: 520, y: 620, w: 680, h: 300, k: 1},
  {x: 1580, y: 640, w: 290, h: 160, k: 2},
];
const Claimed: React.FC<{from: number; to: number}> = ({from, to}) => {
  const t = useT();
  if (t < from || t > to + 0.4) return null;
  return (
    <AbsoluteFill>
      {CARS.map((c) => (
        <Lock key={c.k} from={from + c.k * 0.18} to={to} rect={c} label={`ASSET 0${c.k + 1}`} sub={['VINTAGE · OPEN TOP', 'DB · SILVER BIRCH', 'ROADSTER · WHITE'][c.k]} labelSide="bottom" corner={22} />
      ))}
      <Stamp from={from + 0.75} to={to} x={1470} y={330} text="CLAIMED" size={130} rot={-8} sub="THE ESTATE · ALL OF IT" />
    </AbsoluteFill>
  );
};

/* ---------- BLOODLINE: the family portrait ---------- */
const Bloodline: React.FC = () => {
  const t = useT();
  if (t < 109.5 || t > 121.3) return null;
  const n = Math.round(mix(0, 46, ease.outCubic(prog(t, 110.0, 112.2))));
  return (
    <AbsoluteFill>
      <div style={{...mono, position: 'absolute', left: 64, top: 118, fontSize: 18, opacity: windowed(t, 109.8, 121.1, 0.3, 0.2)}}>
        <span style={{background: C.green, padding: '4px 10px', fontWeight: 700}}>BLOODLINE</span>
        <span style={{marginLeft: 12}}>FACES COUNTED: {String(n).padStart(2, '0')}+</span>
      </div>
      <Lock from={ws(40, 3) - 0.15} to={121.0} rect={{x: 120, y: 330, w: 760, h: 560}} label="NAANKE" sub="MOTHER'S SIDE · SIMPLE" corner={56} big />
      <Lock from={ws(41, 3) - 0.1} to={121.0} rect={{x: 1040, y: 330, w: 760, h: 560}} label="DAADKE" sub="FATHER'S SIDE · YOGYA" corner={56} color={C.champagne} big />
    </AbsoluteFill>
  );
};

/* ---------- PHOTO: the painting on the study wall ---------- */
const Photo: React.FC = () => {
  const t = useT();
  const t0 = ws(50, 1) - 0.25;
  if (t < t0 || t > 135.65) return null;
  const r = {x: 1395, y: 160, w: 270, h: 370};
  return (
    <AbsoluteFill>
      <Lock from={t0} to={135.4} rect={r} label="PHOTO" sub="STATUS: NOT POSTED" color={C.ivory} labelSide="bottom" corner={30} />
      <div style={{...mono, position: 'absolute', left: r.x + r.w + 18, top: r.y + 6, fontSize: 15, lineHeight: 1.6, opacity: windowed(t, t0 + 0.3, 135.4, 0.2, 0.2)}}>
        ISO 800<br />1/50<br />f/2.0<br /><span style={{color: C.red}}>● NO UPLOAD</span>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- APPRAISAL: the Patek macro ---------- */
const Appraisal: React.FC = () => {
  const t = useT();
  if (t < 160.2 || t > 164.95) return null;
  const a = windowed(t, 160.25, 162.85, 0.3, 0.2);
  const sp = springAt(t - 160.25, 1.8, 0.45);
  const cx = 940, cy = 700, R = mix(520, 360, sp);
  const val = Math.round(mix(0, 141, ease.outCubic(prog(t, 160.6, 162.5))));
  return (
    <AbsoluteFill>
      {a > 0 && (
        <>
          <svg width={DW} height={DH} style={{position: 'absolute', opacity: a}}>
            <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.champagne} strokeWidth={2} />
            <circle cx={cx} cy={cy} r={R + 18} fill="none" stroke={C.ivory} strokeWidth={1} strokeDasharray="2 14" transform={`rotate(${t * 12} ${cx} ${cy})`} />
            {Array.from({length: 60}).map((_, k) => (
              <line key={k} x1={cx} y1={cy - R - 4} x2={cx} y2={cy - R - (k % 5 ? 14 : 30)} stroke={C.champagne} strokeWidth={k % 5 ? 1.5 : 3} transform={`rotate(${k * 6} ${cx} ${cy})`} />
            ))}
          </svg>
          <div style={{...mono, position: 'absolute', left: 1380, top: 250, fontSize: 24, lineHeight: 1.7, opacity: a}}>
            <div style={{background: C.champagne, color: C.ink, display: 'inline-block', padding: '3px 10px', fontWeight: 700}}>APPRAISAL</div>
            <div>{typed('REF. NAUTILUS · ROSE GOLD', t, 160.5, 40)}</div>
            <div>{typed('MOVEMENT · VERIFIED', t, 160.9, 40)}</div>
            <div style={{fontSize: 56, color: C.champagne, marginTop: 6}}>£{val}K+</div>
          </div>
        </>
      )}
      {/* stones: glints on the wrist shot (pattharan) */}
      {t > 162.75 &&
        [[1000, 300, 0], [1110, 380, 0.25], [960, 420, 0.5], [1090, 250, 0.8], [1040, 470, 1.1]].map(([x, y, d], k) => {
          const g = Math.sin(clamp((t - 162.8 - d) / 0.7) * Math.PI);
          return (
            <svg key={k} width={160} height={160} viewBox="0 0 90 90" style={{position: 'absolute', left: x - 80, top: y - 80, opacity: g * windowed(t, 162.8, 164.8, 0.1, 0.25),
              filter: 'drop-shadow(0 0 10px rgba(255,236,190,0.95))'}}>
              <path d="M45 0 L50 40 L90 45 L50 50 L45 90 L40 50 L0 45 L40 40 Z" fill="#FFF8E6" transform={`rotate(${t * 40 + k * 20} 45 45)`} />
            </svg>
          );
        })}
    </AbsoluteFill>
  );
};

/* ---------- DAAKA: the robbery ---------- */
const Daaka: React.FC = () => {
  const t = useT();
  const t0 = ws(70, 5);
  if (t < ws(69, 1) - 0.1 || t > 173.3) return null;
  const sweep = prog(t, t0, t0 + 1.4);
  return (
    <AbsoluteFill>
      <Lock from={ws(69, 1) - 0.05} to={t0 - 0.05} track={{pick: 'largest', pad: 0.02}} label="TARGET: 1 HEART" sub="STATUS: STOLEN" color={C.red} />
      {t >= t0 && (
        <AbsoluteFill style={{opacity: 1 - prog(t, 172.9, 173.3)}}>
          <AbsoluteFill style={{background: `linear-gradient(100deg, rgba(255,59,47,0) ${sweep * 140 - 40}%, rgba(255,59,47,0.28) ${sweep * 140 - 20}%, rgba(255,59,47,0) ${sweep * 140}%)`}} />
          <Stamp from={t0} to={172.9} x={1340} y={520} text="DAAKA" size={210} rot={-10} sub="ROBBERY IN PROGRESS" />
          <div style={{position: 'absolute', left: 1340, top: 330, transform: 'translate(-50%,-50%) rotate(-10deg)', fontFamily: F.dev, fontWeight: 800, fontSize: 110, color: C.red,
            opacity: clamp(prog(t, t0 + 0.15, t0 + 0.35)) * 0.9, textShadow: '0 6px 20px rgba(0,0,0,0.4)'}}>डाका</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ---------- MERCY: the opening word lands on the host ---------- */
const Mercy: React.FC = () => {
  const t = useT();
  const t0 = ws(1, 0);
  if (t < t0 - 0.1 || t > 27.6) return null;
  const sp = springAt(t - t0, 2.2, 0.4);
  return (
    <div style={{position: 'absolute', left: 140, top: 250, opacity: windowed(t, t0 - 0.05, 27.5, 0.15, 0.4), transform: `translateY(${(1 - sp) * 40}px)`}}>
      <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 190, color: C.ivory, textShadow: '0 8px 40px rgba(0,0,0,0.55)', letterSpacing: mix(30, 0, ease.outCubic(prog(t, t0, t0 + 0.8)))}}>Mercy.</div>
      <div style={{...mono, fontSize: 16, marginTop: -10, opacity: 0.85}}>{typed('KARAN AUJLA × MXRCI  ·  ASHKE', t, t0 + 0.3, 40)}</div>
    </div>
  );
};

/* ---------- SIGN-OFF ---------- */
const SignOff: React.FC = () => {
  const t = useT();
  if (t < 203.0) return null;
  const a = windowed(t, 203.2, 213.4, 0.6, 0.6);
  const b = windowed(t, 214.3, 217.4, 0.15, 0.5);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 120, bottom: 150, opacity: a}}>
        <div style={{...mono, fontSize: 18, opacity: 0.85}}>{typed('AUJLA SZN 1  ·  TRACK 01', t, 203.4, 30)}</div>
        <div style={{fontFamily: F.hero, fontSize: 210, lineHeight: 1, color: C.ivory, letterSpacing: mix(40, 4, ease.outCubic(prog(t, 203.2, 205)))}}>ASHKE</div>
        <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 52, color: C.champagne}}>Karan Aujla × Mxrci</div>
      </div>
      <div style={{...mono, position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', fontSize: 24, opacity: b}}>
        <span style={{color: C.red}}>■</span>&nbsp; END OF TAPE
      </div>
    </AbsoluteFill>
  );
};

export const Moments: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Boot />
      {/* arrival: the rig finds him */}
      <Lock from={17.3} to={20.45} rect={{x: 760, y: 220, w: 300, h: 360}} label="SUBJECT: MR. AUJLA" sub="STATUS: HOME" big />
      <Mercy />
      <Lock from={31.2} to={35.4} rect={{x: 520, y: 540, w: 900, h: 260}} label="23 GUNS" sub="22 GENTLEMEN · 1 OWNER" labelSide="bottom" corner={24} />
      <Phatt />
      {/* jigra dekhi Jatt 'che: a marker crown lands on his head */}
      <Scribble from={ws(12, 1)} to={48.9} d={crownPath(1462, 200, 150)} color={C.champagne} width={8} />
      {/* khad janda kalla: alone in the crowd */}
      <Lock from={ws(13, 2) - 0.05} to={49.7} track={{pick: 'right', pad: 0.02}} label="1 vs ALL" />
      {/* trust ae neeli chhat 'che: faith is in the sky */}
      <Scribble from={ws(17, 1)} to={55.75} d={arrowPath(1380, 420, 1500, 170)} color={C.ivory} width={7} dur={0.25} />
      <MarkerText from={ws(17, 1) + 0.12} to={55.75} x={1520} y={130} color={C.ivory}>HIM ↑</MarkerText>
      <MultiLock from={56.15} to={58.2} label="RIDER" />
      {/* utran laaliyan: her cheeks go red */}
      <Lock from={59.76} to={60.5} rect={{x: 30, y: 330, w: 270, h: 380}} label="BLUSH DETECTED" sub="LAALIYAN · 100%" color={C.red} corner={26} />
      <Claimed from={71.55} to={76.4} />
      {/* fire */}
      <Scribble from={ws(30, 3)} to={80.6} d={loopPath(1010, 470, 250, 300, 3)} color="#FF7A1A" width={8} len={2400} />
      {/* the butler's monologue: the rig just listens */}
      <Lock from={86.4} to={103.8} rect={{x: 1500, y: 140, w: 330, h: 60}} label="AUDIO: DIALOGUE" corner={14} />
      <Bloodline />
      <Lock from={ws(45, 3) - 0.1} to={126.4} track={{pick: 'largest', pad: 0.02}} label="+25 KILLE" sub="PIND · LAND ACQUIRED" color={C.champagne} />
      <Photo />
      <Lock from={ws(53, 1) - 0.05} to={141.6} track={{pick: 'right', pad: 0.02}} label="PASSENGER" sub="PREPARING" />
      <Appraisal />
      <Daaka />
      {/* naag: a serpent line coils at "zehri" */}
      <Scribble from={ws(77, 3) - 0.05} to={184.2} d="M520 860 C 620 760, 720 900, 820 800 S 1020 700, 1120 800 S 1320 900, 1400 780" color={C.red} width={8} />
      <SignOff />
    </AbsoluteFill>
  );
};
