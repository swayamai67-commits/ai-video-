import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, T, W, H} from '../theme';
import {F} from '../fonts';
import {ease, inv, lerp, noise1, prog, rnd, spring, wobble} from '../lib/time';
import {w, span} from '../lib/words';
import {CoverCard} from '../art/Cover';
import {Boy, Girl, boyHands, girlHand} from '../art/Figures';
import {BeeFlight, BeeGlyph} from '../art/Bee';
import {InkWord, RiseWord} from '../art/Type';
import {chroma} from '../fx/fx';

/**
 * THE FIELD → THE POST. One world: the cover is the ground the two figures stand on.
 * On "war" the thread between them snaps and the camera pulls back so hard the whole
 * world becomes a postcard on a desk, about to be sent.
 */

const FIELD = 1920;
const POST = 680;

export const worldCard = (t: number) => {
  const drift = prog(t, T.wipeA, T.pullA, ease.linear);
  const fSize = FIELD * (1 + 0.035 * drift);
  const fx = 960 - 24 * drift;
  const fy = 482 + 10 * drift;
  const e = ease.velocity(inv(T.pullA, T.pullB, t), 0.3);
  const postGrow = prog(t, T.pullB, 10.9, ease.inOutCubic);
  const pSize = POST * (1 + 0.06 * postGrow);
  const lift = ease.inOutCubic(inv(10.95, 11.667, t));
  return {
    size: Math.exp(lerp(Math.log(fSize), Math.log(pSize), e)),
    cx: lerp(fx, 900, e),
    cy: lerp(fy, 548, e) - 120 * lift,
    rot: lerp(0, -5, e) + 3 * lift + noise1(t * 0.7, 5) * 0.6 * e,
    e,
  };
};

const FIG = 0.86; // figure scale at FIELD size
const GIRL_AT = [-0.37, 0.272];
const BOY_AT = [-0.225, 0.272];

const boyState = (t: number) => {
  const flipP = ease.inOutCubic(inv(6.28, 6.46, t));
  const sx = -Math.cos(Math.PI * flipP); // -1 facing her (left) → +1 facing away (right)
  const walkP = inv(T.go, 7.95, t);
  const x = BOY_AT[0] + 0.88 * Math.pow(walkP, 1.9);
  const walk = t > T.go ? (t - T.go) * Math.PI * 2 * 2.3 : 0;
  const holdFront = flipP < 0.5 ? 1 : 0;
  const holdBack = flipP >= 0.5 && t < T.war ? 1 : t >= T.war ? Math.max(0, 1 - (t - T.war) * 6) : 0;
  return {sx, x, walk, holdFront, holdBack};
};

const Thread: React.FC<{t: number; size: number}> = ({t, size}) => {
  const k = size / FIELD;
  const fs = FIG * k;
  const gFeet = {x: (GIRL_AT[0] + 0.5) * size, y: (GIRL_AT[1] + 0.5) * size};
  const gh = girlHand(t < T.war ? 1 : 1 - ease.outCubic(inv(T.war + 0.05, T.war + 0.6, t)));
  const A = {x: gFeet.x - gh.x * fs, y: gFeet.y + gh.y * fs}; // girl is mirrored
  const b = boyState(t);
  const bFeet = {x: (b.x + 0.5) * size, y: (BOY_AT[1] + 0.5) * size};
  const hands = boyHands(b.walk, b.holdFront, b.holdBack);
  const hb = b.sx < 0 ? hands.front : hands.back;
  const B = {x: bFeet.x + b.sx * hb.x * fs, y: bFeet.y + hb.y * fs};
  const col = C.lipstick;
  const sw = 6 * k;
  if (t < T.war) {
    const dist = Math.hypot(B.x - A.x, B.y - A.y);
    const rest = 120 * k;
    const sag = Math.max(2 * k, (rest - dist) * 0.6);
    const tremble = dist > rest * 0.8 ? Math.sin(t * 90) * 3 * k * inv(rest * 0.8, rest * 1.2, dist) : 0;
    const mx = (A.x + B.x) / 2;
    const my = (A.y + B.y) / 2 + sag + tremble;
    return (
      <svg width={size} height={size} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d={`M ${A.x} ${A.y} Q ${mx} ${my} ${B.x} ${B.y}`} fill="none" stroke={col} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    );
  }
  // snapped: each half recoils to its hand, curling as it goes
  const d = t - T.war;
  if (d > 0.9) return null;
  const snapB = (() => {
    const s = boyState(T.war);
    const h = boyHands(s.walk, s.holdFront, 1).back;
    return {x: (s.x + 0.5) * size + s.sx * h.x * fs, y: bFeet.y + h.y * fs};
  })();
  const M = {x: (A.x + snapB.x) / 2, y: (A.y + snapB.y) / 2};
  const r = 1 - 0.8 * spring(t, T.war, 16, 5);
  const fade = 1 - inv(0.5, 0.9, d);
  const half = (H0: {x: number; y: number}, side: number) => {
    const fx = H0.x + (M.x - H0.x) * r;
    const fy = H0.y + (M.y - H0.y) * r + 260 * k * d * d;
    const cx = (H0.x + fx) / 2 + side * 30 * k * Math.sin(d * 30);
    const cy = (H0.y + fy) / 2 + 40 * k * Math.cos(d * 22) * (1 - d);
    return `M ${H0.x} ${H0.y} Q ${cx} ${cy} ${fx} ${fy}`;
  };
  return (
    <svg width={size} height={size} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: fade}}>
      <path d={half(A, 1)} fill="none" stroke={col} strokeWidth={sw} strokeLinecap="round" />
      <path d={half(B, -1)} fill="none" stroke={col} strokeWidth={sw} strokeLinecap="round" />
      {d < 0.25 &&
        Array.from({length: 8}).map((_, i) => {
          const a = (i / 8) * Math.PI * 2 + 0.3;
          const r0 = (10 + 160 * ease.outCubic(d / 0.25)) * k;
          const r1 = r0 + 40 * k * (1 - d / 0.25);
          return (
            <line key={i} x1={M.x + Math.cos(a) * r0} y1={M.y + Math.sin(a) * r0} x2={M.x + Math.cos(a) * r1} y2={M.y + Math.sin(a) * r1} stroke={i % 2 ? C.cream : col} strokeWidth={5 * k} strokeLinecap="round" />
          );
        })}
    </svg>
  );
};

const Figures: React.FC<{t: number; size: number}> = ({t, size}) => {
  const k = size / FIELD;
  const fs = FIG * k;
  const b = boyState(t);
  const girlHold = t < T.war ? 1 : 1 - ease.outCubic(inv(T.war + 0.05, T.war + 0.6, t));
  const wave = prog(t, 9.85, 10.2, ease.outBack);
  const shadow = (x: number, y: number) => <ellipse cx={x} cy={y} rx={70 * fs} ry={14 * fs} fill="rgba(20,30,5,0.35)" />;
  const gx = (GIRL_AT[0] + 0.5) * size;
  const gy = (GIRL_AT[1] + 0.5) * size;
  const bx = (b.x + 0.5) * size;
  const by = (BOY_AT[1] + 0.5) * size;
  return (
    <svg width={size} height={size} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {shadow(gx, gy + 4 * fs)}
      {shadow(bx, by + 4 * fs)}
      <g transform={`translate(${gx} ${gy}) scale(${-fs} ${fs})`}>
        <Girl t={t} holdArm={girlHold} wave={wave} />
      </g>
      <g transform={`translate(${bx} ${by}) scale(${b.sx * fs} ${fs})`}>
        <Boy t={t} walk={b.walk} holdFront={b.holdFront} holdBack={b.holdBack} />
      </g>
    </svg>
  );
};

/** Postage stamp + the postmark that slams onto the card ("it's being sent"). */
const PostOverlays: React.FC<{t: number; size: number}> = ({t, size}) => {
  const k = size / POST;
  const sIn = ease.outBack(inv(T.stampIn, T.stampIn + 0.2, t), 1.4);
  const stamp = sIn > 0 && (
    <div
      style={{
        position: 'absolute',
        left: size * 0.73,
        top: size * 0.04,
        width: size * 0.2,
        height: size * 0.24,
        transform: `translateY(${(1 - sIn) * -60 * k}px) rotate(${lerp(-14, 5, sIn)}deg) scale(${lerp(1.3, 1, sIn)})`,
        opacity: Math.min(1, sIn * 2),
        filter: 'drop-shadow(0 3px 4px rgba(40,15,0,0.45))',
      }}
    >
      <svg viewBox="0 0 100 120" width="100%" height="100%">
        <rect x={2} y={2} width={96} height={116} fill={C.cream} stroke="#E8D9BC" strokeWidth={4} strokeDasharray="0.1 7.4" strokeLinecap="round" />
        <rect x={10} y={10} width={80} height={86} fill={C.sky} />
        <rect x={10} y={66} width={80} height={30} fill={C.hill} />
        <circle cx={70} cy={30} r={12} fill={C.sun} />
        <g transform="translate(46 52) scale(0.62)">
          <BeeGlyph t={t} seed={8} />
        </g>
        <text x={50} y={110} textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize={9} fill={C.ink}>FLOWER BOY 17¢</text>
      </svg>
    </div>
  );

  // rubber stamp: accelerate down → impact → lift; ink stays
  const down = inv(T.postmark - 0.13, T.postmark, t);
  const up = inv(T.postmark, T.postmark + 0.12, t);
  const ink = t >= T.postmark;
  const inkSpread = ease.outCubic(inv(T.postmark, T.postmark + 0.06, t));
  const R = size * 0.15;
  const pcx = size * 0.7;
  const pcy = size * 0.2;
  const ringText = '✿ FLOWER BOY ✿ AUG 29 2017 ✿ SEE YOU AGAIN ';
  return (
    <>
      {stamp}
      {down > 0 && up < 1 && (
        <div
          style={{
            position: 'absolute',
            left: pcx - R * 1.15,
            top: pcy - R * 1.15,
            width: R * 2.3,
            height: R * 2.3,
            borderRadius: R * 0.3,
            background: 'rgba(35,15,8,0.9)',
            filter: `blur(${18 * k}px)`,
            opacity: t < T.postmark ? 0.45 * ease.inQuart(down) : 0.45 * (1 - up),
            transform: `scale(${t < T.postmark ? lerp(1.9, 1, ease.inQuart(down)) : lerp(1, 1.35, ease.outCubic(up))})`,
          }}
        />
      )}
      {ink && (
        <svg
          width={size * 1.6}
          height={size}
          style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', mixBlendMode: 'multiply', opacity: 0.88 * inkSpread}}
        >
          <defs>
            <path id="pmring" d={`M ${pcx - R * 0.8} ${pcy} a ${R * 0.8} ${R * 0.8} 0 1 1 ${R * 1.6} 0 a ${R * 0.8} ${R * 0.8} 0 1 1 ${-R * 1.6} 0`} />
            <mask id="inkmask">
              <rect x={-size} y={-size} width={size * 4} height={size * 3} fill="white" />
              <image href={staticFile('tex/halftone.png')} x={-size} y={-size} width={size * 3} height={size * 3} opacity={0.5} />
            </mask>
          </defs>
          <g mask="url(#inkmask)" transform={`rotate(-8 ${pcx} ${pcy}) translate(${pcx} ${pcy}) scale(${lerp(1.06, 1, inkSpread)}) translate(${-pcx} ${-pcy})`}>
            <circle cx={pcx} cy={pcy} r={R} fill="none" stroke={C.lipstick} strokeWidth={5 * k} />
            <circle cx={pcx} cy={pcy} r={R * 0.62} fill="none" stroke={C.lipstick} strokeWidth={2.5 * k} />
            <text fontFamily={F.mono} fontWeight={700} fontSize={R * 0.2} fill={C.lipstick} letterSpacing={R * 0.02}>
              <textPath href="#pmring">{ringText}</textPath>
            </text>
            <text x={pcx} y={pcy - R * 0.08} textAnchor="middle" fontFamily={F.anton} fontSize={R * 0.34} fill={C.lipstick}>SEE YOU</text>
            <text x={pcx} y={pcy + R * 0.3} textAnchor="middle" fontFamily={F.anton} fontSize={R * 0.34} fill={C.lipstick}>AGAIN</text>
            {Array.from({length: 5}).map((_, i) => {
              const y0 = pcy - R * 0.7 + i * R * 0.35;
              const x0 = pcx + R * 1.15;
              const pts = Array.from({length: 40}).map((__, j) => {
                const x = x0 + j * size * 0.018;
                return `${x.toFixed(1)},${(y0 + Math.sin(j * 0.55 + i * 0.4) * R * 0.09).toFixed(1)}`;
              });
              return <polyline key={i} points={pts.join(' ')} fill="none" stroke={C.lipstick} strokeWidth={4 * k} strokeLinecap="round" />;
            })}
          </g>
        </svg>
      )}
    </>
  );
};

const Desk: React.FC<{t: number}> = ({t}) => {
  if (t < T.pullA - 0.05) return null;
  return (
    <AbsoluteFill>
      <Img src={staticFile('tex/paper.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 80% at 85% 0%, rgba(255,214,140,0.55) 0%, rgba(255,214,140,0) 60%)', mixBlendMode: 'screen'}} />
      {/* petals from the kiss, landed on the desk */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 11}).map((_, i) => {
          const x = 120 + rnd(i + 40) * 1700;
          const y = 760 + rnd(i + 60) * 300;
          if (x > 520 && x < 1240 && y < 900) return null;
          return <ellipse key={i} cx={x} cy={y} rx={9} ry={24} fill={i % 3 ? '#E9A520' : '#F2C04A'} opacity={0.85} transform={`rotate(${rnd(i + 80) * 360} ${x} ${y})`} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const WorldScene: React.FC<{t: number}> = ({t}) => {
  if (t < T.wipeA - 0.02) return null;
  const c = worldCard(t);
  const k = c.size / FIELD;
  const fade = 1 - prog(t, T.pullA, T.pullA + 0.22, ease.inCubic);

  // wavy wipe edge led by the swarm
  const edge = lerp(-260, W + 300, ease.inOutCubic(inv(T.wipeA, T.wipeB, t)));
  const clip =
    t < T.wipeB
      ? `path('M -20 -20 ${Array.from({length: 13})
          .map((_, i) => {
            const y = -20 + (i * (H + 40)) / 12;
            return `L ${(edge + Math.sin(i * 1.3 + t * 9) * 46).toFixed(1)} ${y.toFixed(1)}`;
          })
          .join(' ')} L -20 ${H + 20} Z')`
      : undefined;

  const lineA = span(12, 18);
  const war = w(19);
  const warP = inv(war.start - 0.06, war.start + 0.02, t);
  const warScale = t < war.start + 0.02 ? lerp(2.4, 1, ease.inQuart(warP)) : 1 - 0.06 * wobble(t, war.start + 0.02, 30, 9);

  const ii = span(20, 24);
  const see = w(25);
  const you = w(26);
  const again = w(27);
  const drop = (x: {start: number}) => ease.outBack(inv(x.start - 0.04, x.start + 0.16, t), 2.2);
  const aP = ease.inOutCubic(inv(again.start, again.end + 0.05, t));

  return (
    <AbsoluteFill style={{clipPath: clip}}>
      <AbsoluteFill style={{background: C.ember}} />
      <Desk t={t} />

      {/* the card world */}
      <div style={{position: 'absolute', left: c.cx, top: c.cy, transform: `rotate(${c.rot}deg)`}}>
        <div style={{position: 'absolute', left: -c.size / 2, top: -c.size / 2, width: c.size, height: c.size}}>
          <div style={{position: 'absolute', left: c.size / 2, top: c.size / 2}}>
            <CoverCard size={c.size} border={0.03 * c.e} shadow={c.e > 0.05 ? `0 ${22 * c.e}px ${46 * c.e}px rgba(45,18,4,${0.5 * c.e}), 0 2px 4px rgba(45,18,4,0.3)` : undefined} />
          </div>
          {/* figures + thread live inside the print (clipped to it: he walks out of the picture) */}
          <div style={{position: 'absolute', inset: c.size * 0.03 * c.e, overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: -c.size * 0.03 * c.e, top: -c.size * 0.03 * c.e, width: c.size, height: c.size}}>
              <Thread t={t} size={c.size} />
              <Figures t={t} size={c.size} />
            </div>
          </div>
          {t > T.stampIn - 0.05 && <PostOverlays t={t} size={c.size} />}
        </div>
      </div>

      {/* field bees + the war squadron */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: fade}}>
        <BeeFlight t={t} t0={4.75} t1={6.5} seed={11} size={0.85}
          path={(s) => {
            const a = (s - 4.75) * 2.6;
            return {x: 330 + Math.cos(a) * 260 + (s - 4.75) * 60, y: 470 + Math.sin(a * 1.3) * 120};
          }} />
        {[0, 1, -1, 2, -2].map((j, n) => {
          const dx = -Math.abs(j) * 130;
          const dy = j * 70;
          const sz = n === 0 ? 1.5 : 1.25;
          return (
            <BeeFlight key={n} t={t} t0={6.68 + Math.abs(j) * 0.02} t1={7.22} seed={20 + n} size={sz} trail={0.32} dash="34 12" trailWidth={4}
              path={(s) => {
                const u = ease.inOutCubic(inv(6.68, 7.22, s));
                return {x: lerp(-320, W + 420, u) + dx, y: 420 + dy - u * 90 + Math.sin(u * 4) * 10};
              }} />
          );
        })}
      </svg>

      {/* I said I'm 'bout to go to */}
      <div style={{position: 'absolute', left: 96, top: 92, fontFamily: F.serif, fontStyle: 'italic', fontSize: 100, color: C.cream, lineHeight: 1,
        textShadow: '0 5px 26px rgba(70,15,0,0.55)', opacity: fade, transform: `scale(${lerp(1, 0.7, 1 - fade)})`, transformOrigin: '0 0'}}>
        {lineA.map((x) => (
          <RiseWord key={x.i} t={t} start={x.start} end={x.end} text={x.word} underline={C.cream} />
        ))}
      </div>

      {/* WAR. */}
      {warP > 0 && fade > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 1150,
            top: 170,
            fontFamily: F.anton,
            fontSize: 470,
            lineHeight: 0.86,
            color: C.cream,
            opacity: fade * Math.min(1, warP * 3),
            transform: `scale(${warScale * lerp(1, 0.4, 1 - fade)}) rotate(3deg) translate(${(1 - fade) * -500}px, ${(1 - fade) * 300}px)`,
            transformOrigin: '50% 60%',
            textShadow: [chroma(t), ...Array.from({length: 12}).map((_, i) => `${(i + 1) * 1.8}px ${(i + 1) * 1.8}px 0 ${C.lipstick}`), '24px 30px 50px rgba(40,0,0,0.5)']
              .filter(Boolean)
              .join(', '),
          }}
        >
          WAR.
        </div>
      )}

      {/* I don't know if I'ma — handwritten on the desk */}
      {t > ii[0].start - 0.1 && (
        <div style={{position: 'absolute', left: 54, top: 300, width: 520, fontFamily: F.hand, fontWeight: 700, fontSize: 80, lineHeight: 1.2, color: C.ink, transform: 'rotate(-5deg)'}}>
          <div>
            {ii.slice(0, 3).map((x) => (
              <InkWord key={x.i} t={t} start={x.start} end={x.end} text={x.word} />
            ))}
          </div>
          <div style={{marginLeft: 40}}>
            {ii.slice(3).map((x) => (
              <InkWord key={x.i} t={t} start={x.start} end={x.end} text={x.word} />
            ))}
          </div>
        </div>
      )}

      {/* SEE / YOU */}
      {[see, you].map((x, n) => {
        const d = drop(x);
        if (d <= 0) return null;
        return (
          <div key={x.i} style={{position: 'absolute', left: 1265 + n * 70, top: 150 + n * 230, fontFamily: F.anton, fontSize: 270, lineHeight: 1, color: C.ink,
            transform: `translateY(${(1 - d) * -70}px) rotate(${lerp(-10, n ? 3 : -3, d)}deg)`, opacity: Math.min(1, d * 2),
            textShadow: [chroma(t), `7px 7px 0 ${C.lipstick}`].filter(Boolean).join(', ')}}>
            {x.word.toUpperCase()}
          </div>
        );
      })}

      {/* again. — written by the bee, then it echoes */}
      {aP > 0 && (
        <>
          {[3, 2, 1].map((e) => {
            const ep = ease.outCubic(inv(again.start + 0.1 + e * 0.1, again.start + 0.4 + e * 0.1, t));
            if (ep <= 0) return null;
            return (
              <div key={e} style={{position: 'absolute', left: 1310 + e * 22 * ep, top: 735 + e * 40 * ep, fontFamily: F.hand, fontWeight: 700, fontSize: 168, color: C.lipstick, opacity: 0.32 / e, lineHeight: 1}}>
                again.
              </div>
            );
          })}
          <div style={{position: 'absolute', left: 1310, top: 735, fontFamily: F.hand, fontWeight: 700, fontSize: 168, color: C.lipstick, lineHeight: 1,
            clipPath: `inset(-30% ${(1 - aP) * 100}% -30% -5%)`, textShadow: chroma(t)}}>
            again.
          </div>
          {aP < 1 && (
            <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
              <g transform={`translate(${1325 + aP * 500} ${835 + Math.sin(aP * 18) * 36}) scale(1.2)`}>
                <BeeGlyph t={t} seed={30} />
              </g>
            </svg>
          )}
        </>
      )}

      {/* bees come to carry the card into the dusk */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {[0, 1, 2].map((n) => (
          <BeeFlight key={n} t={t} t0={10.7 + n * 0.06} t1={11.667} seed={40 + n} size={1.0} trail={0.4}
            path={(s) => {
              const cc = worldCard(s);
              const u = ease.outCubic(inv(10.7 + n * 0.06, 11.05 + n * 0.06, s));
              const tx = cc.cx + (n - 1) * 230;
              const ty = cc.cy - (cc.size / 2) - 40;
              return {x: lerp(n === 1 ? W + 100 : n === 0 ? -150 : W + 200, tx, u), y: lerp(n === 1 ? -100 : 200 + n * 100, ty, u) + Math.sin(s * 9 + n) * 6};
            }} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

