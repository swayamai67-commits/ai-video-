import React from 'react';
import {AbsoluteFill} from 'remotion';
import phrasesJson from '../data/phrases.json';
import {C, F} from '../theme';
import {clamp, ease, mix, prog, springAt, useT, windowed} from '../lib/time';

type W = {i: number; w: string; s: number; e: number};
const phrases = phrasesJson as {line: number; words: W[]}[];

// ---------------------------------------------------------------- V. A Letter (postcard; its photo window becomes the portrait)
export const Postcard: React.FC = () => {
  const t = useT();
  if (t < 101.6 || t > 106.75) return null;
  const enter = springAt(t - 101.7, 1.2, 0.5);
  const toFull = ease.inOutCubic(prog(t, 106.0, 106.62));
  const dark = windowed(t, 101.65, 106.6, 0.5, 0.45);
  // card geometry: window = left part; whole card scales so the window fills the frame at the end
  const CW = 1380, CH = 700, WX = 30, WY = 30, WW = 700, WH = 640;
  const baseScale = mix(1.18, 1, enter);
  const fullScale = 1920 / WW * 1.02;
  const sc = mix(baseScale, fullScale, toFull);
  const rot = mix(-1.6, 0, toFull) + (1 - enter) * -3;
  // translate so that window centre moves to screen centre while scaling
  const winCx = -CW / 2 + WX + WW / 2, winCy = -CH / 2 + WY + WH / 2;
  const tx = 960 - winCx * sc * toFull, ty = 540 - winCy * sc * toFull + (1 - enter) * 60;
  const tf = `translate(${tx}, ${ty}) rotate(${rot}) scale(${sc})`;
  const line = phrases.filter((p) => p.line === 17).flatMap((p) => p.words);
  const handP = (w: W) => ease.outCubic(prog(t, w.s - 0.05, Math.max(w.e, w.s + 0.25)));
  const paperA = 1 - ease.inCubic(prog(t, 105.95, 106.4));
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>
          <mask id="pcmask">
            <rect width={1920} height={1080} fill="white" />
            <g transform={tf}><rect x={-CW / 2 + WX} y={-CH / 2 + WY} width={WW} height={WH} fill="black" /></g>
          </mask>
        </defs>
        <rect width={1920} height={1080} fill="rgba(8,7,6,0.82)" mask="url(#pcmask)" opacity={dark} />
        <g transform={tf} opacity={paperA}>
          <path fillRule="evenodd" fill={C.bone}
            d={`M${-CW / 2},${-CH / 2} h${CW} v${CH} h${-CW} Z M${-CW / 2 + WX},${-CH / 2 + WY} h${WW} v${WH} h${-WW} Z`}
            style={{filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.5))'}} />
          <rect x={-CW / 2 + WX} y={-CH / 2 + WY} width={WW} height={WH} fill="none" stroke={C.goldLo} strokeWidth={2} />
          {/* divider + address lines */}
          <line x1={-CW / 2 + 1010} y1={-CH / 2 + 70} x2={-CW / 2 + 1010} y2={CH / 2 - 70} stroke="rgba(22,19,15,0.25)" strokeWidth={1.2} />
          {[0, 1, 2].map((k) => (
            <line key={k} x1={-CW / 2 + 1040} x2={CW / 2 - 50} y1={60 + k * 70} y2={60 + k * 70} stroke="rgba(22,19,15,0.3)" strokeWidth={1} />
          ))}
          {/* stamp */}
          <g transform={`translate(${CW / 2 - 140}, ${-CH / 2 + 50})`}>
            <rect width={100} height={124} fill={C.oxblood} stroke={C.bone} strokeWidth={6} strokeDasharray="5 4" />
            <rect x={10} y={10} width={80} height={104} fill="none" stroke={C.gold} strokeWidth={1} />
            <text x={50} y={78} textAnchor="middle" fontFamily="Eczar" fontWeight={800} fontSize={52} fill={C.goldHi}>अ</text>
            <text x={50} y={106} textAnchor="middle" fontFamily="IBM Plex Mono" fontSize={11} fill={C.bone} letterSpacing={2}>SZN 1</text>
          </g>
          {/* postmark */}
          <g transform={`translate(${CW / 2 - 230}, ${-CH / 2 + 130}) rotate(-12)`} opacity={0.75}>
            <circle r={62} fill="none" stroke={C.ink} strokeWidth={2} />
            <circle r={46} fill="none" stroke={C.ink} strokeWidth={1} />
            <text textAnchor="middle" y={-14} fontFamily="IBM Plex Mono" fontSize={12} letterSpacing={2} fill={C.ink}>LONDON</text>
            <text textAnchor="middle" y={4} fontFamily="IBM Plex Mono" fontSize={13} fill={C.ink}>⇄</text>
            <text textAnchor="middle" y={22} fontFamily="IBM Plex Mono" fontSize={12} letterSpacing={2} fill={C.ink}>PUNJAB</text>
            {[0, 1, 2, 3].map((k) => <path key={k} d={`M70,${-24 + k * 16} q20,-8 40,0 t40,0 t40,0`} fill="none" stroke={C.ink} strokeWidth={1.4} />)}
          </g>
        </g>
      </svg>
      {/* handwriting on the left of the address side */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: paperA}}>
        <div style={{position: 'absolute', left: 960 - CW / 2 + 752, top: 540 - CH / 2 + 120, width: 250,
          transform: `rotate(${rot}deg) scale(${baseScale})`, transformOrigin: `${CW / 2 - 752}px ${CH / 2 - 120}px`,
          fontFamily: F.hand, fontSize: 34, lineHeight: 1.6, color: '#2b2a5c'}}>
          {line.map((w) => (
            <span key={w.i} style={{display: 'inline-block', marginRight: 10, clipPath: `inset(-30% ${100 - 100 * handP(w)}% -30% 0)`,
              fontStyle: /[A-Za-z]/.test(w.w) ? 'italic' : 'normal'}}>{w.w}</span>
          ))}
        </div>
        <div style={{position: 'absolute', left: 960 - CW / 2 + 1050, top: 540 - 22, width: 300,
          transform: `rotate(${rot}deg) scale(${baseScale})`, transformOrigin: `${CW / 2 - 1050}px 22px`,
          fontFamily: F.hand, fontSize: 30, lineHeight: 2.3, color: '#2b2a5c', opacity: ease.outCubic(prog(t, 102.4, 103.2))}}>
          <div>The Jatt,</div><div>The Estate,</div><div>England</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- VI. The Portrait: gilt frame + museum placards
const GiltFrame: React.FC<{x: number; y: number; w: number; h: number; p: number; alpha?: number}> = ({x, y, w, h, p, alpha = 1}) => {
  const per = 2 * (w + h);
  return (
    <g opacity={alpha} style={{filter: 'drop-shadow(0 0 6px rgba(212,174,92,0.5))'}}>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={C.gold} strokeWidth={2.4} strokeDasharray={per} strokeDashoffset={per * (1 - p)} />
      <rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} fill="none" stroke={C.goldHi} strokeOpacity={0.55} strokeWidth={1}
        strokeDasharray={per} strokeDashoffset={-per * (1 - p)} />
      {[[x, y], [x + w, y], [x, y + h], [x + w, y + h]].map(([cx, cy], i) => (
        <rect key={i} x={cx - 7} y={cy - 7} width={14} height={14} transform={`rotate(45 ${cx} ${cy})`} fill={C.gold}
          opacity={ease.outCubic(clamp(p * 2 - 1))} />
      ))}
    </g>
  );
};

export const Portrait: React.FC = () => {
  const t = useT();
  if (t < 106.5 || t > 121.1) return null;
  const draw = ease.inOutCubic(prog(t, 106.65, 108.0));
  const out = ease.inCubic(prog(t, 120.4, 121.0));
  const plac = ease.outCubic(prog(t, 107.6, 108.4));
  const lab1 = ease.outCubic(prog(t, 117.3, 117.9));
  const lab2 = ease.outCubic(prog(t, 118.9, 119.5));
  const lead = (p: number) => ease.inOutCubic(clamp(p * 1.4 - 0.2));
  const Label: React.FC<{x: number; y: number; word: string; note: string; p: number; tx: number; ty: number; right?: boolean}> = ({x, y, word, note, p, tx, ty, right}) => (
    <>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <line x1={x} y1={y + 92} x2={mix(x, tx, lead(p))} y2={mix(y + 92, ty, lead(p))} stroke={C.goldHi} strokeWidth={1.4} />
        <circle cx={tx} cy={ty} r={5 * ease.outBack(clamp(p * 2 - 1))} fill={C.goldHi} />
      </svg>
      <div style={{position: 'absolute', left: right ? x - 300 : x, width: 300, top: y, textAlign: right ? 'right' : 'left',
        opacity: p, transform: `translateY(${(1 - p) * 16}px)`}}>
        <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 60, color: C.bone, lineHeight: 1.3, textShadow: '0 3px 16px rgba(0,0,0,0.6)'}}>{word}</div>
        <div style={{fontFamily: F.latin, fontStyle: 'italic', fontSize: 30, color: C.goldHi, textShadow: '0 2px 10px rgba(0,0,0,0.6)'}}>{note}</div>
      </div>
    </>
  );
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <GiltFrame x={110} y={168} w={1700} h={744} p={draw} />
      </svg>
      <div style={{position: 'absolute', right: 150, top: 196, width: 340, padding: '14px 18px', background: 'rgba(239,230,210,0.92)',
        color: C.ink, opacity: plac, transform: `translateY(${(1 - plac) * 12}px)`, boxShadow: '0 8px 24px rgba(0,0,0,0.35)'}}>
        <div style={{fontFamily: F.latin, fontWeight: 600, fontSize: 17, letterSpacing: '0.3em'}}>PORTRAIT OF A FAMILY</div>
        <div style={{fontFamily: F.latin, fontStyle: 'italic', fontSize: 19, marginTop: 2}}>Punjab, by way of England</div>
        <div style={{fontFamily: F.mono, fontSize: 12, letterSpacing: '0.2em', marginTop: 6, color: '#5a4d3e'}}>NANKE · DADKE · ON THE LAWN</div>
      </div>
      {lab1 > 0 ? <Label x={190} y={200} word="नानके" note="— simple" p={lab1} tx={470} ty={520} /> : null}
      {lab2 > 0 ? <Label x={1440} y={330} word="दादके" note="— योग्य" p={lab2} tx={1240} ty={540} right /> : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- "हाले photo भी नी पाई" — frame the oil portrait, not posted
export const PhotoNotPosted: React.FC = () => {
  const t = useT();
  if (t < 133.5 || t > 135.5) return null;
  const k = clamp((t - 132.6) / (134.2 - 132.6), 0, 1.7);
  const x0 = mix(1380, 1390, k), y0 = mix(120, 210, k), x1 = mix(1680, 1660, k), y1 = mix(560, 590, k);
  const pad = 18;
  const draw = ease.inOutCubic(prog(t, 133.72, 134.25));
  const flash = Math.exp(-Math.max(0, t - 133.72) * 14) * (t >= 133.72 ? 1 : 0);
  const out = ease.inCubic(prog(t, 135.0, 135.4));
  const tag = ease.outCubic(prog(t, 134.1, 134.5));
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <GiltFrame x={x0 - pad} y={y0 - pad} w={x1 - x0 + 2 * pad} h={y1 - y0 + 2 * pad} p={draw} />
      </svg>
      <div style={{position: 'absolute', left: x0 - pad, top: y1 + pad + 18, fontFamily: F.mono, fontSize: 16, letterSpacing: '0.24em',
        color: C.bone, opacity: tag, textShadow: '0 2px 8px rgba(0,0,0,.8)'}}>
        <span style={{color: C.goldHi}}>PHOTO</span> · NOT POSTED · 0 POSTS
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.75}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- IX. The Vault: watch bezel
export const WatchBezel: React.FC = () => {
  const t = useT();
  if (t < 160.7 || t > 163.7) return null;
  const a = windowed(t, 160.8, 163.6, 0.3, 0.5);
  const cx = 1130, cy = 470, R = 300;
  const ticks = ease.outCubic(prog(t, 160.8, 161.6));
  const beat = 60 / 136;
  const handA = Math.floor((t - 160.8) / beat) * 6 + 6 * ease.outBack(((t - 160.8) % beat) / beat > 0.85 ? (((t - 160.8) % beat) / beat - 0.85) / 0.15 : 0);
  return (
    <AbsoluteFill style={{opacity: a}}>
      <svg width={1920} height={1080} style={{position: 'absolute', filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.6))'}}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.gold} strokeWidth={1.6} />
        <circle cx={cx} cy={cy} r={R + 16} fill="none" stroke={C.gold} strokeOpacity={0.4} strokeWidth={1} />
        {Array.from({length: 60}).map((_, i) => {
          if (i / 60 > ticks) return null;
          const an = (i / 60) * Math.PI * 2 - Math.PI / 2;
          const l = i % 5 === 0 ? 26 : 10;
          return <line key={i} x1={cx + Math.cos(an) * R} y1={cy + Math.sin(an) * R} x2={cx + Math.cos(an) * (R - l)} y2={cy + Math.sin(an) * (R - l)}
            stroke={C.goldHi} strokeWidth={i % 5 === 0 ? 2.4 : 1} />;
        })}
        <line x1={cx} y1={cy} x2={cx + Math.cos(((handA - 90) * Math.PI) / 180) * (R - 40)} y2={cy + Math.sin(((handA - 90) * Math.PI) / 180) * (R - 40)}
          stroke={C.goldHi} strokeWidth={2} />
        <defs><path id="bezelText" d={`M ${cx - R - 40} ${cy} A ${R + 40} ${R + 40} 0 1 1 ${cx + R + 40} ${cy}`} /></defs>
        <text fontFamily="IBM Plex Mono" fontSize={16} letterSpacing={9} fill={C.bone}>
          <textPath href="#bezelText" startOffset="10%">TIME IS MONEY · THE VAULT · AUJLA SZN 1</textPath>
        </text>
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- "मैं मारी दा डाका" rubber stamp
export const DAKA_T = 171.18;
export const DakaStamp: React.FC = () => {
  const t = useT();
  if (t < 170.95 || t > 173.7) return null;
  const fall = ease.inCubic(prog(t, DAKA_T - 0.16, DAKA_T));
  const after = Math.max(0, t - DAKA_T);
  const squash = t >= DAKA_T ? Math.exp(-after * 9) * Math.cos(after * 34) : 0;
  const sc = t < DAKA_T ? mix(1.5, 1, fall) : 1 - 0.05 * squash;
  const out = ease.inCubic(prog(t, 173.2, 173.65));
  return (
    <AbsoluteFill style={{opacity: (t < DAKA_T ? fall : 1) * (1 - out)}}>
      <svg width={0} height={0}>
        <filter id="inkTex">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.3 1.55" />
          <feComposite in="SourceGraphic" operator="in" />
        </filter>
      </svg>
      <div style={{position: 'absolute', left: 1130, top: 250, transform: `rotate(-9deg) scale(${sc})`, filter: 'url(#inkTex)',
        border: '7px solid #B8282F', outline: '2px solid #B8282F', outlineOffset: 8, padding: '0 46px',
        color: '#B8282F', fontFamily: F.display, fontWeight: 800, fontSize: 150, lineHeight: 1.35, mixBlendMode: 'normal'}}>
        डाका
        <div style={{position: 'absolute', left: 0, right: 0, bottom: -44, textAlign: 'center', fontFamily: F.mono, fontSize: 18,
          letterSpacing: '0.5em', color: '#B8282F'}}>NO RETURNS</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- "मेरा बाजां आळा राखा" — the falcon crosses the frame
export const Falcon: React.FC = () => {
  const t = useT();
  if (t < 177.1 || t > 179.6) return null;
  const p = ease.inOutSine(prog(t, 177.15, 179.5));
  const x = mix(-200, 2120, p), y = 330 - 130 * Math.sin(p * Math.PI);
  const flap = Math.sin(t * 13);
  const tilt = -8 * Math.cos(p * Math.PI);
  // stylised falcon (baaz): pointed swept wings, wedge tail, hooked beak. Wings flap by moving the tips.
  const wing = (dir: 1 | -1) => {
    const tipY = -70 * flap - 10, midY = -36 * flap;
    return `M0,-4 C${dir * 30},${midY - 6} ${dir * 80},${tipY + 10} ${dir * 150},${tipY}
      C${dir * 112},${tipY + 26} ${dir * 96},${midY + 22} ${dir * 70},${midY + 30} L${dir * 58},${midY + 22} L${dir * 44},${midY + 36}
      C${dir * 26},${12} ${dir * 10},${10} 0,10 Z`;
  };
  const bird = (k: number, alpha: number) => (
    <g key={k} transform={`translate(${x - k * 90}, ${y + k * 10 * Math.cos(p * Math.PI)}) rotate(${tilt}) scale(1.6)`} opacity={alpha}>
      <path d={wing(-1)} fill="url(#falconGold)" />
      <path d={wing(1)} fill="url(#falconGold)" />
      <path d="M-6,-8 C10,-14 30,-12 44,-4 C52,-2 56,2 60,6 L50,6 C40,10 20,14 -6,12 Z" fill="url(#falconGold)" />
      <path d="M-6,-6 L-48,-14 L-40,2 L-48,18 L-6,10 Z" fill="url(#falconGold)" />
      <path d="M58,2 l10,5 l-9,5 Z" fill={C.goldLo} />
      <circle cx={46} cy={-1} r={2.2} fill={C.ink} />
    </g>
  );
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.45))'}}>
        <defs>
          <linearGradient id="falconGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={C.goldHi} />
            <stop offset="0.5" stopColor={C.gold} />
            <stop offset="1" stopColor={C.goldLo} />
          </linearGradient>
        </defs>
        {[3, 2, 1].map((k) => bird(k, 0.1 * (4 - k)))}
        {bird(0, 1)}
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- "नाग" — the gold line becomes a snake
export const Snake: React.FC = () => {
  const t = useT();
  if (t < 183.7 || t > 186.8) return null;
  const a = windowed(t, 183.8, 186.7, 0.3, 0.5);
  const head = mix(-100, 2100, ease.inOutSine(prog(t, 183.85, 186.6)));
  const len = 640;
  const pts: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const x = head - len + (i / 80) * len;
    const y = 660 + 26 * Math.sin(x / 70 - t * 7) * (0.4 + 0.6 * (i / 80));
    pts.push(`${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const hy = 660 + 26 * Math.sin(head / 70 - t * 7);
  return (
    <AbsoluteFill style={{opacity: a}}>
      <svg width={1920} height={1080} style={{position: 'absolute', filter: 'drop-shadow(0 0 6px rgba(212,174,92,0.6))'}}>
        <path d={pts.join(' ')} fill="none" stroke={C.gold} strokeWidth={5} strokeLinecap="round" />
        <path d={pts.join(' ')} fill="none" stroke={C.goldHi} strokeWidth={1.6} strokeDasharray="2 9" />
        <path d={`M${head - 6},${hy - 11} L${head + 22},${hy} L${head - 6},${hy + 11} Z`} fill={C.goldHi} />
      </svg>
    </AbsoluteFill>
  );
};

