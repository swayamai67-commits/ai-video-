import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, T, W, H} from '../theme';
import {F} from '../fonts';
import {ease, inv, lerp, prog} from '../lib/time';
import {w} from '../lib/words';
import {CoverCard} from '../art/Cover';
import {BeeGlyph} from '../art/Bee';
import {chroma} from '../fx/fx';

/**
 * "last forever": a Droste loop. Tyler holds a print of the cover, which shows him holding
 * a print of the cover… and the camera never stops falling into it. FOREVER sits behind him
 * (the text-behind-subject cut) on every level, so the word itself never ends.
 */
export const L = 2400; // level-0 image size (px); the kiss scene hands off at this size, centred
const K = 0.17; // nested print scale (image to image)
const TH = (7 * Math.PI) / 180; // nested print rotation
const CN = [-0.03, 0.03]; // nested image centre (image-normalised): held to his chest
// Polaroid margins as fractions of the image size
const PS = 0.055;
const PB = 0.25;
/** Where the fixed point sits on screen once the camera has found it: high, so the captions below stay in view. */
const ANCHOR = [W / 2, 330];

// fixed point of x → CN + K·R(TH)·x
const kc = K * Math.cos(TH);
const ks = K * Math.sin(TH);
const det = (1 - kc) * (1 - kc) + ks * ks;
const P = [((1 - kc) * CN[0] - ks * CN[1]) / det, (ks * CN[0] + (1 - kc) * CN[1]) / det];

/** Zoom progress in "levels": a slow fall, then the FOREVER hit kicks the velocity. */
export const tunnelU = (t: number) => {
  if (t < T.forever) return 0.42 * Math.pow(inv(T.tunnel, T.forever, t), 2);
  if (t < 4.5) return 0.42 + 1.75 * ease.outCubic(inv(T.forever, 4.5, t));
  return 2.17 + 0.6 * ease.outCubic(inv(4.5, 5.1, t));
};

const Letters: React.FC<{t: number; start: number; text: string; stagger?: number}> = ({t, start, text, stagger = 0.028}) => (
  <>
    {text.split('').map((ch, i) => {
      const p = inv(start - 0.05 + i * stagger, start + 0.2 + i * stagger, t);
      const e = p <= 0 ? 0 : ease.outBack(p, 2.4);
      return (
        <span key={i} style={{display: 'inline-block', transform: `translateY(${(1 - e) * 110}%) scaleY(${lerp(1.5, 1, e)})`, opacity: p > 0 ? 1 : 0, transformOrigin: '50% 100%'}}>
          {ch}
        </span>
      );
    })}
  </>
);

/** A Polaroid of the cover. Its caption is the lyric: a moment printed so it lasts forever. */
const Polaroid: React.FC<{t: number}> = ({t}) => {
  const m = L * PS;
  const last = w(10);
  const fe = w(11);
  const capTop = L * (1 + PS);
  const capH = L * (PB - PS);
  return (
    <div
      style={{
        position: 'absolute',
        left: -L / 2 - m,
        top: -L / 2 - m,
        width: L + 2 * m,
        height: L + m + L * PB,
        background: C.cream,
        boxShadow: `0 ${L * 0.03}px ${L * 0.07}px rgba(30,5,0,0.55)`,
      }}
    >
      <div style={{position: 'absolute', left: m, top: m}}>
        <div style={{position: 'absolute', left: L / 2, top: L / 2}}>
          <CoverCard size={L} border={0} />
        </div>
      </div>
      {/* the caption, written on the print */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: '100%',
          top: capTop,
          height: capH,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: L * 0.05,
          overflow: 'hidden',
        }}
      >
        <div style={{fontFamily: F.hand, fontWeight: 700, fontSize: L * 0.1, color: C.lipstick, lineHeight: 1, transform: 'rotate(-6deg) translateY(-4%)'}}>
          <Letters t={t} start={last.start} text="last" stagger={0.06} />
        </div>
        <div style={{fontFamily: F.anton, fontSize: L * 0.165, color: C.ink, lineHeight: 1, letterSpacing: '0.01em', textShadow: chroma(t)}}>
          <Letters t={t} start={fe.start} text="FOREVER" />
        </div>
      </div>
      {/* his thumbs on the bottom corners: it's being held */}
      <svg width={L + 2 * m} height={L + m + L * PB} viewBox={`0 0 ${L + 2 * m} ${L + m + L * PB}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {[-1, 1].map((sd) => {
          const x = sd < 0 ? 0 : L + 2 * m;
          const y = L * 1.0;
          const r = L * 0.056;
          return (
            <g key={sd} transform={`translate(${x} ${y}) scale(${sd} 1) rotate(-24)`}>
              {/* a thumb pressing on the print's edge, nail up */}
              <rect x={-r * 1.5} y={-r * 0.46} width={r * 2.3} height={r * 0.92} rx={r * 0.46} fill="#5A3420" stroke="#24120A" strokeWidth={L * 0.003} />
              <ellipse cx={r * 0.42} cy={-r * 0.02} rx={r * 0.3} ry={r * 0.26} fill="#8A5E42" stroke="#24120A" strokeWidth={L * 0.002} />
              <path d={`M ${-r * 0.25} ${-r * 0.3} q ${-r * 0.1} ${r * 0.3} 0 ${r * 0.6}`} stroke="#2E180C" strokeWidth={L * 0.003} fill="none" strokeLinecap="round" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const Level: React.FC<{t: number; s: number; i: number; focus: number[]; anchor: number[]}> = ({t, s, i, focus, anchor}) => {
  const sc = Math.pow(K, s);
  const a = s * TH;
  // image centre in level-0 normalised coords: P − sc·R(a)·P
  const cx = P[0] - sc * (Math.cos(a) * P[0] - Math.sin(a) * P[1]);
  const cy = P[1] - sc * (Math.sin(a) * P[0] + Math.cos(a) * P[1]);
  const x = anchor[0] + L * (cx - focus[0]);
  const y = anchor[1] + L * (cy - focus[1]);
  // nested prints are dropped into his hands as the tunnel opens
  const drop = i === 0 ? 1 : ease.outBack(inv(T.tunnel + 0.02 + (i - 1) * 0.06, T.tunnel + 0.34 + (i - 1) * 0.06, t), 1.6);
  if (drop <= 0) return null;
  // depth of field: prints that have grown past the frame soften and darken, so the eye stays on the next one
  const dof = Math.max(0, -s - 0.25);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `rotate(${(a * 180) / Math.PI}deg) scale(${sc * lerp(1.6, 1, drop)})`,
        opacity: Math.min(1, drop * 1.5),
        filter: dof > 0.02 ? `blur(${(dof * 2.2).toFixed(2)}px) brightness(${(1 - dof * 0.22).toFixed(3)})` : undefined,
      }}
    >
      {i === 0 ? <CoverCard size={L} border={0} /> : <Polaroid t={t} />}
    </div>
  );
};

/** The ∞ the bee draws around the fall, from FOREVER until the swarm. */
const Infinity8: React.FC<{t: number}> = ({t}) => {
  const p = ease.inOutCubic(inv(T.forever - 0.05, 4.48, t));
  const fade = 1 - inv(4.42, 4.6, t);
  if (p <= 0 || fade <= 0) return null;
  const a = 560;
  const pt = (u: number) => {
    const s = u * Math.PI * 2 + Math.PI / 2;
    const d = 1 + Math.sin(s) ** 2;
    return {x: W / 2 + (a * Math.cos(s)) / d, y: ANCHOR[1] + 60 + (a * Math.sin(s) * Math.cos(s)) / d};
  };
  const n = Math.max(2, Math.round(160 * p));
  const pts = Array.from({length: n + 1}).map((_, i) => pt((i / 160) * 1));
  const head = pt(p);
  const prev = pt(Math.max(0, p - 0.01));
  const ang = (Math.atan2(head.y - prev.y, head.x - prev.x) * 180) / Math.PI;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: fade}}>
      <polyline points={pts.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ')} fill="none" stroke={C.cream} strokeWidth={7} strokeDasharray="16 14" strokeLinecap="round" style={{filter: 'drop-shadow(0 3px 6px rgba(60,10,0,0.5))'}} />
      <g transform={`translate(${head.x} ${head.y}) rotate(${Math.abs(ang) > 90 ? ang - 180 : ang}) scale(${Math.abs(ang) > 90 ? -1.3 : 1.3} 1.3)`}>
        <BeeGlyph t={t} seed={4} />
      </g>
    </svg>
  );
};

export const TunnelScene: React.FC<{t: number}> = ({t}) => {
  if (t < T.tunnel || t > 5.05) return null;
  const u = tunnelU(t);
  const pan = ease.inOutCubic(inv(T.tunnel, T.last + 0.2, t));
  const focus = [lerp(0, P[0], pan), lerp(0, P[1], pan)];
  const anchor = [lerp(W / 2, ANCHOR[0], pan), lerp(H / 2, ANCHOR[1], pan)];
  const base = Math.floor(u);
  const levels = [];
  for (let i = base; i <= base + 5; i++) levels.push(<Level key={i} t={t} s={i - u} i={i} focus={focus} anchor={anchor} />);
  // speed blur on the velocity hit
  const v = t > T.forever && t < 4.5 ? (1 - inv(T.forever, 4.4, t)) * 3.2 : 0;
  return (
    <AbsoluteFill style={{background: C.ember, overflow: 'hidden'}}>
      <AbsoluteFill style={{filter: v > 0.3 ? `blur(${v}px)` : undefined}}>{levels}</AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, rgba(255,230,160,${0.25 * prog(t, T.forever, 4.4)}) 0%, rgba(0,0,0,0) 45%)`, mixBlendMode: 'screen'}} />
      <Infinity8 t={t} />
    </AbsoluteFill>
  );
};
