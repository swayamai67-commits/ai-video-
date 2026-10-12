import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, goldFoil} from '../theme';
import {clamp, ease, mix, prog, rnd, springAt, useFormat, useT, windowed} from '../lib/time';
import {CHAPTERS} from '../components/Chrome';

// ---------------------------------------------------------------- title card
export const TitleCard: React.FC = () => {
  const t = useT();
  if (t >= 5.6) return null;
  const draw = ease.inOutCubic(prog(t, 0.3, 1.9));
  const draw2 = ease.inOutCubic(prog(t, 0.8, 2.3));
  const expand = ease.inOutCubic(prog(t, 4.0, 5.0));
  const txt = (a: number) => ease.outCubic(prog(t, a, a + 0.7));
  const textOut = 1 - ease.inCubic(prog(t, 3.7, 4.3));
  const fadeFromBlack = 1 - ease.inOutCubic(prog(t, 4.6, 5.6));
  const w = mix(820, 2400, expand), h = mix(480, 1500, expand);
  const x = 960 - w / 2, y = 540 - h / 2;
  const per = 2 * (w + h);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: C.night, opacity: t < 4.6 ? 1 : fadeFromBlack}} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={x} y={y} width={w} height={h} fill="none" stroke={C.gold} strokeWidth={2} strokeDasharray={per} strokeDashoffset={per * (1 - draw)} />
        <rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} fill="none" stroke={C.gold} strokeOpacity={0.5} strokeWidth={1}
          strokeDasharray={per} strokeDashoffset={-per * (1 - draw2)} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', opacity: textOut, transform: `scale(${1 + 0.04 * expand})`}}>
        <div style={{fontFamily: F.mono, fontSize: 15, letterSpacing: '0.5em', color: C.gold, opacity: txt(1.0)}}>AUJLA SZN 1 · PRESENTS</div>
        <div style={{fontFamily: F.latin, fontWeight: 600, fontSize: 64, letterSpacing: `${mix(0.7, 0.42, txt(1.4))}em`, color: C.bone, marginTop: 34, opacity: txt(1.4)}}>
          KARAN AUJLA
        </div>
        <div style={{fontFamily: F.latin, fontStyle: 'italic', fontSize: 40, color: C.gold, opacity: txt(2.0), margin: '6px 0'}}>×</div>
        <div style={{fontFamily: F.latin, fontWeight: 500, fontSize: 40, letterSpacing: `${mix(0.8, 0.5, txt(2.3))}em`, color: C.bone, opacity: txt(2.3)}}>MXRCI</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- arrival labels (typewriter)
const Typed: React.FC<{text: string; t: number; a: number; cps?: number; style?: React.CSSProperties}> = ({text, t, a, cps = 30, style}) => {
  const n = Math.floor(clamp((t - a) * cps, 0, text.length));
  const cursor = t > a && (n < text.length || Math.floor(t * 2.5) % 2 === 0);
  return (
    <div style={{fontFamily: F.mono, fontSize: 18, letterSpacing: '0.22em', color: C.bone, whiteSpace: 'pre', ...style}}>
      {text.slice(0, n)}
      <span style={{opacity: cursor && t > a ? 1 : 0, color: C.gold}}>▍</span>
    </div>
  );
};

export const ArrivalLabels: React.FC = () => {
  const t = useT();
  if (t < 4.8 || t > 24.4) return null;
  const blocks: {a: number; b: number; render: (t: number, a: number) => React.ReactNode}[] = [
    {a: 5.2, b: 8.3, render: (t, a) => (<>
      <Typed text="THE ESTATE" t={t} a={a} style={{color: C.gold}} />
      <Typed text="SOMEWHERE IN ENGLAND · GUESTS ARRIVING" t={t} a={a + 0.5} />
    </>)},
    {a: 8.8, b: 13.9, render: (t, a) => (<>
      <Typed text="ARRIVAL — 16:12" t={t} a={a} style={{color: C.gold}} />
      <Typed text="THE MOTOR: A SILVER ASTON · THE BUTLER: WHITE GLOVES" t={t} a={a + 0.6} />
    </>)},
    {a: 14.4, b: 22.3, render: (t, a) => (<>
      <Typed text="GUEST OF HONOUR" t={t} a={a} style={{color: C.gold}} />
      <div style={{fontFamily: F.latin, fontStyle: 'italic', fontWeight: 500, fontSize: 64, color: C.bone, margin: '4px 0 6px',
        clipPath: `inset(0 ${100 - 100 * ease.outCubic(prog(t, a + 0.5, a + 1.6))}% 0 0)`}}>Mr. Karan Aujla</div>
      <Typed text="12 CARS · 22 GENTLEMEN · 23 GUNS" t={t} a={a + 2.2} />
    </>)},
    {a: 22.5, b: 24.2, render: (t, a) => (
      <div style={{fontFamily: F.latin, fontStyle: 'italic', fontSize: 46, color: C.bone, opacity: ease.outCubic(prog(t, a, a + 0.5))}}>
        “Splendid idea, sir.”
      </div>
    )},
  ];
  return (
    <AbsoluteFill>
      {blocks.map((b, i) => t >= b.a - 0.05 && t < b.b ? (
        <div key={i} style={{position: 'absolute', left: 150, top: 700, display: 'flex', flexDirection: 'column', gap: 10,
          opacity: 1 - ease.inCubic(prog(t, b.b - 0.35, b.b)), transform: `translateY(${-14 * ease.inCubic(prog(t, b.b - 0.35, b.b))}px)`}}>
          {b.render(t, b.a)}
        </div>
      ) : null)}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the invitation card
const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export const Invitation: React.FC = () => {
  const t = useT();
  if (t < 24.1 || t > 31.3) return null;
  const enter = springAt(t - 24.25, 1.1, 0.42);
  const exit = ease.inCubic(prog(t, 30.35, 31.05));
  const rot = mix(-9, -1.4, enter) - 14 * exit;
  const ty = mix(900, 0, enter) - 1100 * exit;
  const tx = -260 * exit;
  const push = 1 + 0.035 * ease.inOutSine(prog(t, 24.3, 30.4));
  const border = ease.inOutCubic(prog(t, 24.9, 26.2));
  const item = (k: number) => ease.outCubic(prog(t, 25.6 + k * 0.17, 26.1 + k * 0.17));
  const head = (k: number) => ease.outCubic(prog(t, 24.9 + k * 0.22, 25.5 + k * 0.22));
  const CW = 1120, CH = 860;
  const per = 2 * (CW - 60 + CH - 60);
  const rows = CHAPTERS.filter((c) => c.n);
  return (
    <AbsoluteFill style={{transform: `scale(${push})`}}>
      <AbsoluteFill style={{background: `radial-gradient(70% 70% at 50% 45%, #2a2118 0%, ${C.night} 75%)`, opacity: 1 - exit}} />
      <div style={{position: 'absolute', left: 960 - CW / 2, top: 540 - CH / 2, width: CW, height: CH,
        transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg)`,
        background: `radial-gradient(120% 90% at 30% 20%, #F6EFDE 0%, ${C.bone} 55%, #E2D5B8 100%)`,
        boxShadow: '0 40px 90px rgba(0,0,0,0.55), 0 4px 12px rgba(0,0,0,0.35)', color: C.ink}}>
        <svg width={CW} height={CH} style={{position: 'absolute', left: 0, top: 0}}>
          <rect x={30} y={30} width={CW - 60} height={CH - 60} fill="none" stroke={C.goldLo} strokeWidth={2}
            strokeDasharray={per} strokeDashoffset={per * (1 - border)} />
          <rect x={42} y={42} width={CW - 84} height={CH - 84} fill="none" stroke={C.goldLo} strokeOpacity={0.6} strokeWidth={0.8}
            strokeDasharray={per} strokeDashoffset={-per * (1 - border)} />
          <g opacity={head(0)} transform={`translate(${CW / 2}, 112)`}>
            <circle r={40} fill="none" stroke={C.goldLo} strokeWidth={1.5} />
            <circle r={34} fill="none" stroke={C.goldLo} strokeWidth={0.7} />
            <text textAnchor="middle" y={13} fontFamily="Cormorant Garamond" fontStyle="italic" fontWeight={600} fontSize={38} fill={C.ink}>KA</text>
          </g>
        </svg>
        <div style={{position: 'absolute', top: 172, left: 0, right: 0, textAlign: 'center'}}>
          <div style={{fontFamily: F.latin, fontWeight: 600, fontSize: 34, letterSpacing: '0.42em', opacity: head(1)}}>THE ESTATE</div>
          <div style={{fontFamily: F.latin, fontStyle: 'italic', fontSize: 27, marginTop: 6, opacity: head(2), color: '#3a3128'}}>
            requests the pleasure of your company
          </div>
          <div style={{width: 120 * head(3), height: 1.2, background: C.goldLo, margin: '20px auto 18px'}} />
          <div style={{fontFamily: F.mono, fontSize: 14, letterSpacing: '0.45em', opacity: head(3)}}>ORDER OF THE DAY</div>
        </div>
        <div style={{position: 'absolute', top: 344, left: 110, right: 110, display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 80, rowGap: 14}}>
          {rows.map((c, k) => {
            const col = k < 6 ? 0 : 1;
            const r = k % 6;
            const p = item(k);
            return (
              <div key={c.n} style={{gridColumn: col + 1, gridRow: r + 1, display: 'flex', alignItems: 'baseline', gap: 14,
                opacity: p, transform: `translateY(${(1 - p) * 14}px)`}}>
                <span style={{fontFamily: F.latin, fontWeight: 600, fontSize: 22, color: C.goldLo, width: 44}}>{c.n}</span>
                <span style={{fontFamily: F.latin, fontWeight: 500, fontSize: 28}}>{c.title}</span>
                <span style={{flex: 1, borderBottom: '1.5px dotted rgba(22,19,15,0.35)', transform: 'translateY(-6px)'}} />
                <span style={{fontFamily: F.mono, fontSize: 15, color: '#5a4d3e'}}>{fmtTime(c.t)}</span>
              </div>
            );
          })}
        </div>
        <div style={{position: 'absolute', bottom: 74, left: 0, right: 0, textAlign: 'center', opacity: item(13)}}>
          <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 44, color: C.oxblood, lineHeight: 1.3}}>अश्के</div>
          <div style={{fontFamily: F.latin, fontStyle: 'italic', fontSize: 21, color: '#3a3128'}}>Dress: as you please · Carriages at midnight</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- अश्के title
export const AshkeTitle: React.FC = () => {
  const t = useT();
  if (t < 30.9 || t > 38.6) return null;
  const reveal = ease.outQuart(prog(t, 31.15, 32.2));
  const out = ease.inCubic(prog(t, 37.5, 38.3));
  const line = ease.inOutCubic(prog(t, 31.7, 32.9));
  const sub = ease.outCubic(prog(t, 32.3, 33.1));
  const cred = ease.outCubic(prog(t, 32.8, 33.6));
  const shimmer = mix(0, 100, ease.inOutSine(prog(t, 31.2, 37.8)));
  const dim = windowed(t, 30.95, 38.4, 0.6, 0.6);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(60% 55% at 50% 48%, rgba(8,7,6,0.62) 0%, rgba(8,7,6,0.25) 70%, rgba(8,7,6,0.1) 100%)', opacity: dim}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: 1 - out, transform: `translateY(${-30 * out}px)`}}>
        <div style={{display: 'inline-block', clipPath: `inset(${100 - 100 * reveal}% -10% -20% -10%)`, transform: `translateY(${(1 - reveal) * 60}px)`}}>
          <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 330, lineHeight: 1.25, padding: '0 30px', ...goldFoil(shimmer),
            filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.45))'}}>अश्के</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 960 - 650 * line, width: 1300 * line, top: 668, height: 2, background: C.gold,
        boxShadow: '0 0 12px rgba(212,174,92,0.7)', opacity: 1 - out * 0.4}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 694, textAlign: 'center', opacity: sub * (1 - out)}}>
        <span style={{fontFamily: F.latin, fontWeight: 600, fontSize: 32, letterSpacing: `${mix(1.4, 0.9, sub)}em`, color: C.bone}}>ASHKE</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 758, textAlign: 'center', opacity: cred * (1 - out),
        fontFamily: F.mono, fontSize: 16, letterSpacing: '0.42em', color: C.boneDim}}>
        KARAN AUJLA · MXRCI · AUJLA SZN 1
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- "Oh-oh" melodic gold line
export const OhOhLine: React.FC = () => {
  const t = useT();
  if (t < 37.9 || t > 46.0) return null;
  const a = 38.22, b = 45.64;
  const p = ease.inOutSine(prog(t, a - 0.3, b));
  const fade = windowed(t, 37.95, 45.95, 0.4, 0.4);
  const base = 650;
  const pts: string[] = [];
  const N = 160;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const x = 150 + u * 1620;
    const env = Math.sin(Math.PI * u) * (0.6 + 0.4 * Math.sin(u * 7 + 1));
    const y = base - 70 * env * Math.sin(u * Math.PI * 6 - t * 1.4) - 18 * Math.sin(u * 23 + t * 0.9) * env;
    pts.push(`${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const d = pts.join(' ');
  return (
    <AbsoluteFill style={{opacity: fade}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>
          <path id="ohpath" d={d} />
          <clipPath id="ohclip"><rect x={0} y={0} width={150 + 1620 * p + 20} height={1080} /></clipPath>
          <filter id="ohglow"><feGaussianBlur stdDeviation="4" /></filter>
        </defs>
        <path d={d} pathLength={1} fill="none" stroke={C.gold} strokeWidth={6} strokeOpacity={0.35} filter="url(#ohglow)"
          strokeDasharray={1} strokeDashoffset={1 - p} />
        <path d={d} pathLength={1} fill="none" stroke={C.goldHi} strokeWidth={2.2} strokeDasharray={1} strokeDashoffset={1 - p} />
        <g clipPath="url(#ohclip)">
          <text fontFamily="Cormorant Garamond" fontStyle="italic" fontWeight={500} fontSize={38} fill={C.bone} dy={-16}
            style={{textShadow: '0 2px 10px rgba(0,0,0,0.6)'}}>
            <textPath href="#ohpath" startOffset="2%">oh — oh — oh — oh — oh — oh — oh — oh — oh — oh — oh</textPath>
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- "Mercy" wax seal
const sealPath = (R: number) => {
  const pts: string[] = [];
  const N = 64;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = R * (1 + 0.045 * Math.sin(a * 5 + 1) + 0.03 * Math.sin(a * 11 + 2) + 0.05 * (rnd(i + 3) - 0.5));
    pts.push(`${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(' ') + 'Z';
};
const SEAL = sealPath(150);
const CRACK = [[0, -170], [-14, -110], [12, -60], [-10, -10], [16, 40], [-8, 95], [10, 170]];
const crackD = CRACK.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');
const leftClip = `M-400,-400 L0,-400 ${CRACK.map(([x, y]) => `L${x},${y}`).join(' ')} L0,400 L-400,400 Z`;
const rightClip = `M400,-400 L0,-400 ${CRACK.map(([x, y]) => `L${x},${y}`).join(' ')} L0,400 L400,400 Z`;

export const sealImpactTime = 45.72;

export const MercySeal: React.FC = () => {
  const t = useT();
  const {kind} = useFormat();
  if (t < 45.45 || t > 49.4) return null;
  const ti = sealImpactTime;
  const fall = ease.inCubic(prog(t, ti - 0.22, ti));
  const scale = t < ti ? mix(2.6, 1, fall) : 1;
  const squash = t >= ti ? Math.exp(-(t - ti) * 7) * Math.cos((t - ti) * 30) : 0;
  const sx = scale * (1 + 0.09 * squash), sy = scale * (1 - 0.09 * squash);
  const op = t < ti ? fall : 1;
  const crackP = ease.outExpo(prog(t, 48.22, 48.36));
  const split = ease.inCubic(prog(t, 48.32, 49.2));
  const cx = kind === 'full' ? 1450 : 790, cy = kind === 'full' ? 520 : 1000;
  const k = kind === 'full' ? 1 : 0.95;
  const word = ease.outCubic(prog(t, ti + 0.02, ti + 0.45)) * (1 - ease.inCubic(prog(t, 48.25, 48.7)));
  const dust = prog(t, ti, ti + 0.7);

  const sealBody = (
    <g>
      <path d={SEAL} fill={C.oxblood} />
      <path d={SEAL} fill="url(#sealshade)" />
      <circle r={112} fill="none" stroke="#4a1418" strokeWidth={5} />
      <circle r={112} fill="none" stroke="#a8434a" strokeWidth={1.2} transform="translate(-1,-1.5)" />
      <defs><path id="ring" d="M -92 0 A 92 92 0 1 1 92 0 A 92 92 0 1 1 -92 0" /></defs>
      <text fontFamily="Cormorant Garamond" fontWeight={600} fontSize={19} letterSpacing={5} fill="#3e1013">
        <textPath href="#ring">MERCY · AUJLA SZN 1 · MERCY · ASHKE ·</textPath>
      </text>
      <text fontFamily="Cormorant Garamond" fontWeight={600} fontSize={19} letterSpacing={5} fill="#b9575d" transform="translate(-0.8,-1.2)">
        <textPath href="#ring">MERCY · AUJLA SZN 1 · MERCY · ASHKE ·</textPath>
      </text>
      <text textAnchor="middle" y={24} fontFamily="Cormorant Garamond" fontStyle="italic" fontWeight={600} fontSize={92} fill="#3e1013">KA</text>
      <text textAnchor="middle" y={22} x={-1.5} fontFamily="Cormorant Garamond" fontStyle="italic" fontWeight={600} fontSize={92} fill="#b3525a">KA</text>
    </g>
  );

  return (
    <AbsoluteFill>
      <svg width={kind === 'full' ? 1920 : 1080} height={kind === 'full' ? 1080 : 1920} style={{position: 'absolute'}}>
        <defs>
          <radialGradient id="sealshade" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#c0505a" stopOpacity={0.55} />
            <stop offset="55%" stopColor="#6E1F24" stopOpacity={0} />
            <stop offset="100%" stopColor="#1a0506" stopOpacity={0.6} />
          </radialGradient>
          <clipPath id="sealL"><path d={leftClip} /></clipPath>
          <clipPath id="sealR"><path d={rightClip} /></clipPath>
        </defs>
        <g transform={`translate(${cx},${cy}) scale(${k})`} opacity={op}>
          {/* shadow */}
          <ellipse cx={8} cy={18} rx={160 * sx} ry={150 * sy} fill="rgba(0,0,0,0.45)" style={{filter: 'blur(14px)'}} opacity={fall} />
          {/* dust ring */}
          {t >= ti && Array.from({length: 18}).map((_, i) => {
            const a = (i / 18) * Math.PI * 2 + rnd(i) * 0.3;
            const r = 160 + 120 * ease.outCubic(dust) * (0.6 + 0.6 * rnd(i + 9));
            return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={2 + 3 * rnd(i + 4)} fill={C.bone} opacity={(1 - dust) * 0.7} />;
          })}
          <g transform={`scale(${sx},${sy})`}>
            {split <= 0 ? sealBody : (
              <>
                <g clipPath="url(#sealL)" transform={`translate(${-90 * split}, ${260 * split * split}) rotate(${-16 * split})`}>{sealBody}</g>
                <g clipPath="url(#sealR)" transform={`translate(${90 * split}, ${300 * split * split}) rotate(${14 * split})`}>{sealBody}</g>
              </>
            )}
            {crackP > 0 && split < 0.5 ? (
              <path d={crackD} pathLength={1} fill="none" stroke={C.goldHi} strokeWidth={3} strokeDasharray={1} strokeDashoffset={1 - crackP}
                style={{filter: 'drop-shadow(0 0 6px rgba(243,220,154,0.9))'}} opacity={1 - split * 2} />
            ) : null}
          </g>
        </g>
      </svg>
      <div style={{position: 'absolute', left: cx - 300, width: 600, top: cy + (kind === 'full' ? 150 : 150), textAlign: 'center',
        fontFamily: F.latin, fontStyle: 'italic', fontWeight: 500, fontSize: kind === 'full' ? 76 : 88, color: C.bone,
        opacity: word, transform: `translateY(${18 * (1 - word)}px)`,
        textShadow: '0 4px 20px rgba(0,0,0,0.6)'}}>
        Mercy
      </div>
    </AbsoluteFill>
  );
};
