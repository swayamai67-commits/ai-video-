import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {C, F, W, H} from './config';
import {cutSrc, frameAt, Timing} from './Plate';
import {clamp, ease, noise, prog, rnd, springAt, useT} from './lib';

// ---------- PHULKARI: satin-stitch diamond motifs ----------
/** One phulkari diamond: concentric diamonds, each filled with stitch hatching. */
export const Diamond: React.FC<{cx: number; cy: number; r: number; colors?: string[]; rot?: number; id: string; stroke?: number}> = ({
  cx,
  cy,
  r,
  colors = [C.gold, C.red, C.magenta, C.gold],
  rot = 0,
  id,
  stroke = 2.4,
}) => {
  const rings = colors.length;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      <defs>
        {colors.map((c, i) => (
          <pattern key={i} id={`${id}-p${i}`} width={7} height={7} patternUnits="userSpaceOnUse" patternTransform={`rotate(${i % 2 ? 45 : -45})`}>
            <line x1={0} y1={0} x2={0} y2={7} stroke={c} strokeWidth={stroke * 1.6} />
          </pattern>
        ))}
      </defs>
      {colors.map((c, i) => {
        const rr = r * (1 - i / rings);
        const rin = r * (1 - (i + 0.62) / rings);
        const d = `M0,${-rr} L${rr},0 L0,${rr} L${-rr},0 Z M0,${-rin} L${-rin},0 L0,${rin} L${rin},0 Z`;
        return <path key={i} d={d} fill={`url(#${id}-p${i})`} fillRule="evenodd" />;
      })}
      <path d={`M0,${-r * 0.12} L${r * 0.12},0 L0,${r * 0.12} L${-r * 0.12},0 Z`} fill={colors[0]} />
    </g>
  );
};

/** Burst of diamonds exploding outward from (cx,cy) at time s. */
export const PhulkariBurst: React.FC<{s: number; cx?: number; cy?: number; scale?: number; n?: number; dur?: number; seed?: number}> = ({
  s,
  cx = W / 2,
  cy = H / 2,
  scale = 1,
  n = 14,
  dur = 1.6,
  seed = 3,
}) => {
  const t = useT();
  const dt = t - s;
  if (dt < 0 || dt > dur) return null;
  const p = ease.outExpo(dt / dur);
  const fade = 1 - ease.inCubic(clamp((dt - dur * 0.5) / (dur * 0.5)));
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: fade, overflow: 'visible'}}>
      <Diamond id={`bc${seed}`} cx={cx} cy={cy} r={(180 + 520 * p) * scale} rot={p * 45} colors={[C.red, C.gold, C.magenta, C.gold, C.red]} />
      {Array.from({length: n}).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + rnd(seed + i) * 0.3;
        const d = (120 + (700 + rnd(seed * 3 + i) * 500) * p) * scale;
        const r = (40 + rnd(seed + i * 5) * 70) * scale * (1 - p * 0.3);
        return <Diamond key={i} id={`b${seed}-${i}`} cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d} r={r} rot={p * 90 * (i % 2 ? 1 : -1)} colors={i % 2 ? [C.gold, C.red, C.gold] : [C.magenta, C.gold, C.red]} />;
      })}
    </svg>
  );
};

/** A band of repeating diamonds (border for zine pages), scrolling. */
export const PhulkariBand: React.FC<{y: number; h?: number; speed?: number; colors?: string[]; bg?: string}> = ({y, h = 90, speed = 40, colors = [C.red, C.gold, C.magenta], bg = C.ink}) => {
  const t = useT();
  const n = 16;
  const step = h * 1.1;
  const off = (t * speed) % step;
  return (
    <svg width={W} height={h} style={{position: 'absolute', left: 0, top: y, background: bg}}>
      {Array.from({length: n}).map((_, i) => (
        <Diamond key={i} id={`band${y}-${i}`} cx={i * step - off} cy={h / 2} r={h * 0.44} colors={i % 2 ? colors : [...colors].reverse()} stroke={1.8} />
      ))}
    </svg>
  );
};

// ---------- STICKER: person cutout with white outline ----------
export const outline = (px: number, color = '#fff') =>
  [0, 45, 90, 135, 180, 225, 270, 315]
    .map((a) => `drop-shadow(${(Math.cos((a * Math.PI) / 180) * px).toFixed(1)}px ${(Math.sin((a * Math.PI) / 180) * px).toFixed(1)}px 0 ${color})`)
    .join(' ');

export const Sticker: React.FC<{
  clip: string;
  tm: Timing;
  s: number; // slap time
  x: number;
  y: number;
  w: number;
  h: number;
  rot?: number;
  stroke?: number;
  filter?: string;
  shadow?: boolean;
}> = ({clip, tm, s, x, y, w, h, rot = 0, stroke = 9, filter = '', shadow = true}) => {
  const t = useT();
  if (t < s - 0.04) return null;
  const sp = springAt(t - s + 0.04, 3.2, 0.42);
  const sc = 1.5 - 0.5 * sp;
  const f = frameAt(clip, t, tm);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg) scale(${sc})`, transformOrigin: '50% 60%'}}>
      <Img
        src={cutSrc(clip, f)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: `${filter} ${outline(stroke)} ${shadow ? 'drop-shadow(10px 18px 0 rgba(0,0,0,0.35))' : ''}`,
        }}
      />
    </div>
  );
};

// ---------- TAPE strip with scrolling text ----------
export const Tape: React.FC<{y: number; rot?: number; text: string; bg?: string; color?: string; size?: number; speed?: number; font?: string}> = ({
  y,
  rot = -4,
  text,
  bg = C.red,
  color = C.bone,
  size = 54,
  speed = 160,
  font = F.black,
}) => {
  const t = useT();
  const rep = Array.from({length: 12}).map(() => text).join('  ✶  ');
  return (
    <div style={{position: 'absolute', left: -200, width: W + 400, top: y, transform: `rotate(${rot}deg)`, background: bg, padding: '14px 0', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.35)'}}>
      <div style={{whiteSpace: 'nowrap', fontFamily: font, fontSize: size, color, letterSpacing: 2, transform: `translateX(${-((t * speed) % 1400)}px)`, lineHeight: 1}}>{rep}</div>
    </div>
  );
};

// ---------- CHAT bubble ----------
export const Bubble: React.FC<{s: number; typingFrom?: number; text: string; y: number; side?: 'left' | 'right'; color?: string; textColor?: string}> = ({
  s,
  typingFrom,
  text,
  y,
  side = 'left',
  color = C.bone,
  textColor = C.ink,
}) => {
  const t = useT();
  const tf = typingFrom ?? s - 0.6;
  if (t < tf) return null;
  const typing = t < s;
  const sp = springAt(t - (typing ? tf : s), 3, 0.45);
  const base: React.CSSProperties = {
    position: 'absolute',
    top: y,
    [side]: 70,
    maxWidth: 780,
    background: color,
    color: textColor,
    borderRadius: 46,
    [side === 'left' ? 'borderBottomLeftRadius' : 'borderBottomRightRadius']: 10,
    padding: typing ? '30px 40px' : '30px 44px',
    fontFamily: F.serif,
    fontStyle: 'italic',
    fontSize: 64,
    lineHeight: 1.05,
    transform: `scale(${0.6 + 0.4 * sp})`,
    transformOrigin: side === 'left' ? '0% 100%' : '100% 100%',
    boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
  };
  if (typing)
    return (
      <div style={base}>
        <div style={{display: 'flex', gap: 14}}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{width: 22, height: 22, borderRadius: 11, background: textColor, opacity: 0.3 + 0.7 * Math.max(0, Math.sin(t * 9 - i * 0.9))}} />
          ))}
        </div>
      </div>
    );
  return <div style={base}>{text}</div>;
};

// ---------- crosshair ----------
export const Crosshair: React.FC<{cx: number; cy: number; r: number; color?: string; s: number; e: number}> = ({cx, cy, r, color = C.red, s, e}) => {
  const t = useT();
  if (t < s || t >= e) return null;
  const p = ease.outExpo(prog(t, s, s + 0.25));
  const rr = r * (2 - p);
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <circle cx={cx} cy={cy} r={rr} stroke={color} strokeWidth={5} fill="none" />
      <circle cx={cx} cy={cy} r={rr * 0.35} stroke={color} strokeWidth={3} fill="none" />
      {[0, 90, 180, 270].map((a) => {
        const c = Math.cos((a * Math.PI) / 180), sn = Math.sin((a * Math.PI) / 180);
        return <line key={a} x1={cx + c * rr * 0.55} y1={cy + sn * rr * 0.55} x2={cx + c * rr * 1.25} y2={cy + sn * rr * 1.25} stroke={color} strokeWidth={5} />;
      })}
      <circle cx={cx} cy={cy} r={6} fill={color} />
    </svg>
  );
};

// ---------- crack: radial fracture lines from a point ----------
export const Crack: React.FC<{cx: number; cy: number; s: number; e?: number; seed?: number; color?: string; scale?: number}> = ({cx, cy, s, e = Infinity, seed = 7, color = C.bone, scale = 1}) => {
  const t = useT();
  if (t < s || t >= e) return null;
  const p = ease.outExpo(prog(t, s, s + 0.18));
  const n = 13;
  const paths: string[] = [];
  for (let i = 0; i < n; i++) {
    let a = (i / n) * Math.PI * 2 + rnd(seed + i) * 0.4;
    let x = cx, y = cy;
    let d = `M${x},${y}`;
    const L = (500 + rnd(seed + i * 3) * 900) * scale * p;
    const seg = 7;
    for (let k = 0; k < seg; k++) {
      a += (rnd(seed + i * 11 + k) - 0.5) * 0.6;
      x += Math.cos(a) * (L / seg);
      y += Math.sin(a) * (L / seg);
      d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
    }
    paths.push(d);
  }
  const ring = Array.from({length: 2}).map((_, k) => {
    const rr = (90 + k * 160) * scale * p;
    let d = '';
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const jr = rr * (0.8 + rnd(seed + k * 50 + i) * 0.4);
      d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * jr).toFixed(1)},${(cy + Math.sin(a) * jr).toFixed(1)} `;
    }
    return d;
  });
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      {[...paths, ...ring].map((d, i) => (
        <path key={i} d={d} stroke={color} strokeWidth={i < n ? 3.5 : 2.5} fill="none" opacity={0.95} />
      ))}
      <circle cx={cx} cy={cy} r={20 * scale} fill={C.ink} stroke={color} strokeWidth={3} />
    </svg>
  );
};

// ---------- snake line: slithers across, then gets cut ----------
export const Snake: React.FC<{y: number; s: number; cutAt: number; e: number; color?: string}> = ({y, s, cutAt, e, color = C.gold}) => {
  const t = useT();
  if (t < s || t >= e) return null;
  const p = ease.outCubic(prog(t, s, cutAt));
  const len = W * 1.3 * p;
  const pts: string[] = [];
  for (let x = -100; x <= -100 + len; x += 12) {
    const yy = y + Math.sin(x / 70 - t * 7) * 48 * (0.6 + 0.4 * Math.sin(x / 300));
    pts.push(`${x.toFixed(0)},${yy.toFixed(1)}`);
  }
  const cut = t >= cutAt;
  const cp = ease.outExpo(prog(t, cutAt, cutAt + 0.5));
  const head = pts[pts.length - 1]?.split(',').map(Number) ?? [0, y];
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <g transform={cut ? `translate(${-cp * 40} ${cp * 160}) rotate(${-cp * 8})` : undefined} opacity={cut ? 1 - cp * 0.6 : 1}>
        <polyline points={pts.filter((_, i) => i < pts.length / 2 || !cut).join(' ')} stroke={color} strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g transform={cut ? `translate(${cp * 60} ${cp * 260}) rotate(${cp * 14} ${head[0]} ${head[1]})` : undefined} opacity={cut ? 1 - cp : 1}>
        <polyline points={cut ? pts.filter((_, i) => i >= pts.length / 2).join(' ') : ''} stroke={color} strokeWidth={16} fill="none" strokeLinecap="round" />
        <circle cx={head[0]} cy={head[1]} r={18} fill={color} />
      </g>
      {cut && cp < 0.6 && <line x1={W / 2 - 300} y1={y - 220} x2={W / 2 + 300} y2={y + 220} stroke={C.bone} strokeWidth={8 * (1 - cp)} />}
    </svg>
  );
};

// ---------- embers ----------
export const Embers: React.FC<{s: number; e: number; n?: number; seed?: number}> = ({s, e, n = 40, seed = 11}) => {
  const t = useT();
  if (t < s || t >= e) return null;
  const fade = Math.min(1, (t - s) / 0.4, (e - t) / 0.4);
  return (
    <AbsoluteFill style={{opacity: fade}}>
      {Array.from({length: n}).map((_, i) => {
        const life = 1.6 + rnd(seed + i) * 1.8;
        const ph = ((t - s) / life + rnd(seed * 2 + i)) % 1;
        const x = rnd(seed + i * 7) * W + noise(t * 0.8 + i, i) * 60;
        const y = H * (1.05 - ph * 0.9);
        const r = 3 + rnd(seed + i * 13) * 7;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: r, background: i % 3 ? '#FF8A1F' : C.gold, boxShadow: `0 0 ${r * 3}px #FF6A00`, opacity: Math.sin(ph * Math.PI)}} />;
      })}
    </AbsoluteFill>
  );
};

/** Post frame UI for "haale photo bhi ni paayi". */
export const EmptyPost: React.FC<{s: number; e: number; y?: number}> = ({s, e, y = 560}) => {
  const t = useT();
  if (t < s || t >= e) return null;
  const sp = springAt(t - s, 2.8, 0.45);
  const shutter = t - s < 0.12;
  return (
    <div style={{position: 'absolute', left: 140, width: 800, top: y, background: '#fff', borderRadius: 34, padding: 34, transform: `scale(${0.7 + 0.3 * sp}) rotate(${-2 + sp * 2}deg)`, boxShadow: '0 30px 80px rgba(0,0,0,0.5)'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: 26}}>
        <div style={{width: 70, height: 70, borderRadius: 35, background: `conic-gradient(${C.gold}, ${C.red}, ${C.magenta}, ${C.gold})`}} />
        <div style={{fontFamily: F.black, fontSize: 34, color: C.ink}}>karanaujla</div>
      </div>
      <div style={{height: 560, background: '#E9E6E1', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16}}>
        <svg width={150} height={150} viewBox="0 0 24 24" fill="none" stroke="#9A958D" strokeWidth={1.3}>
          <rect x={3} y={6} width={18} height={14} rx={2} />
          <circle cx={12} cy={13} r={4} />
          <path d="M8 6l1.5-2h5L16 6" />
        </svg>
        <div style={{fontFamily: F.mono, fontSize: 30, color: '#9A958D', letterSpacing: 3}}>NO POSTS YET</div>
      </div>
      <div style={{display: 'flex', justifyContent: 'space-around', marginTop: 26, fontFamily: F.black, fontSize: 34, color: C.ink}}>
        <span>0 posts</span>
        <span style={{color: C.red}}>∞ followers</span>
      </div>
      {shutter && <div style={{position: 'absolute', inset: 0, background: '#fff', borderRadius: 34}} />}
    </div>
  );
};
