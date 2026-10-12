import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, H, W} from '../config';
import {Camera, Flash, Grain, Halftone, Paper, RGBSplit, Slices} from '../fx';
import {Blobs, FeedChrome, Lock, headBox} from '../hud';
import {clamp, ease, noise, prog, pulse, springAt, useT} from '../lib';
import {wid, wtime} from '../Lyrics';
import {cutSrc, frameAt, plateSrc} from '../Plate';
import {Hero, Mono, fitSize, typed} from '../text';
import {Bubble, Crack, Crosshair, Embers, PhulkariBand, PhulkariBurst, Sticker, Tape} from '../graphics';
import {Behind, Finish, Full, GRADE, Sc, Scrim, Strip} from './common';
import {Img} from 'remotion';

type Shot = {a: number; b: number; clip: string; tm: {from?: number; src?: number; speed?: number; sync?: boolean; step?: number}; grade?: string};
export const Shots: React.FC<{shots: Shot[]; grade?: string}> = ({shots, grade}) => {
  const t = useT();
  const s = shots.find((x) => t >= x.a && t < x.b);
  if (!s) return null;
  return <Full clip={s.clip} {...s.tm} grade={s.grade ?? grade} />;
};

/** Hero accent word with a halo of light (used for ਬਾਬੇ, ਅਸ਼ਕੇ…). */
export const AccentHero: React.FC<{txt: string; s: number; e: number; y: number; size: number; color?: string; halo?: boolean}> = ({txt, s, e, y, size, color = C.gold, halo}) => {
  const t = useT();
  if (t < s - 0.04 || t >= e) return null;
  const sp = springAt(t - s + 0.04, 2.6, 0.36);
  const out = ease.inExpo(prog(t, e - 0.12, e));
  return (
    <>
      {halo && (
        <div style={{position: 'absolute', left: W / 2 - 520, top: y - 520, width: 1040, height: 1040, borderRadius: 520, background: `radial-gradient(circle, ${C.gold}66 0%, ${C.gold}22 35%, transparent 65%)`, transform: `scale(${0.6 + 0.4 * sp})`, opacity: 1 - out}} />
      )}
      <div style={{position: 'absolute', left: 0, width: '100%', top: y - size * 0.62, textAlign: 'center', fontFamily: F.gu, fontWeight: 800, fontSize: size, lineHeight: 1.1, color, textShadow: `0 0 40px ${color}aa, 0 12px 0 rgba(0,0,0,0.35)`, transform: `scale(${(0.6 + 0.4 * sp) * (1 + out * 0.6)})`, opacity: 1 - out}}>
        {txt}
      </div>
    </>
  );
};

// ---------- 48.2 – 62.54 HOOK 1 ----------
const Hook1: React.FC = () => {
  const t = useT();
  const ashke = wtime(9, 6);
  return (
    <Sc a={48.22} b={62.54}>
      <Camera punch={0.03} drift={0.004} from={48.22}>
        <Shots
          grade={GRADE.warm}
          shots={[
            {a: 48.22, b: 51.78, clip: 'hook', tm: {sync: true}},
            {a: 51.78, b: 55.38, clip: 'table', tm: {sync: true}},
            {a: 55.38, b: 59.0, clip: 'gunwood', tm: {sync: true}},
            {a: 59.0, b: 62.54, clip: 'gunlow', tm: {sync: true}},
          ]}
        />
      </Camera>
      <Scrim from={40} amount={0.9} />
      {/* Baba's blessing: a halo of light behind the lockup */}
      {t >= wtime(6, 0) - 0.04 && t < wtime(7, 0) && (
        <AbsoluteFill style={{background: `radial-gradient(circle at 50% 38%, ${C.gold}66 0%, transparent 42%)`, mixBlendMode: 'screen', opacity: clamp((t - wtime(6, 0)) * 3) * clamp((wtime(7, 0) - t) * 3)}} />
      )}
      <PhulkariBand y={H - 300} h={70} />
      <FeedChrome cam="CAM 08 · LAWN" />
      <Finish />
      {/* the drop: ASHKE slam */}
      {t >= ashke - 0.04 && (
        <AbsoluteFill style={{background: C.ink}}>
          <PhulkariBurst s={ashke} scale={1.1} />
          <AccentHero txt="ਅਸ਼ਕੇ" s={ashke} e={62.54} y={900} size={360} />
          <Hero txt="ASHKE" s={ashke + 0.06} y={1250} width={900} color={C.bone} />
        </AbsoluteFill>
      )}
      <Flash at={[48.22, ashke]} dur={0.1} />
    </Sc>
  );
};

// ---------- 62.54 – 76.92 THE SHOOT (velocity) ----------
const Shoot: React.FC = () => {
  const t = useT();
  const phatt = wtime(10, 4);
  const kalla = wtime(13, 2);
  const split = Math.max(0, 1 - (t - phatt) / 0.35) * (t >= phatt ? 30 : 0);
  // velocity ramp into the drop: stutter the gun shot
  const ramp = (tt: number) => {
    const d = tt - 62.54;
    if (d < 1.1) return 1.6 + d * 0.25; // slow-mo
    return 1.6 + 1.1 * 0.25 + (d - 1.1) * 1.05; // whip
  };
  const kallaDark = t >= kalla - 0.04 && t < wtime(13, 3) - 0.02;
  return (
    <Sc a={62.54} b={76.92}>
      <Camera punch={0.06} shake={16} extra={t >= phatt && t < phatt + 0.3 ? 1 - (t - phatt) / 0.3 : 0}>
        <RGBSplit amount={split} angle={0.3}>
          {(flt) =>
            t < 65.2 ? (
              <Full clip="gunlow" ramp={ramp} grade={`${GRADE.feed} ${flt === 'none' ? '' : flt}`} />
            ) : (
              <Shots
                grade={`${GRADE.feed} ${flt === 'none' ? '' : flt}`}
                shots={[
                  {a: 65.2, b: 69.75, clip: 'shoot1', tm: {sync: true}},
                  {a: 69.75, b: 73.3, clip: 'shoot2', tm: {sync: true}},
                  {a: 73.3, b: 76.92, clip: 'shoot3', tm: {sync: true}},
                ]}
              />
            )
          }
        </RGBSplit>
        <Blobs clip={t < 65.2 ? 'gunlow' : t < 69.75 ? 'shoot1' : t < 73.3 ? 'shoot2' : 'shoot3'} tm={t < 65.2 ? {ramp} : {sync: true}} w={W} h={H} max={6} opacity={0.5} />
      </Camera>
      {kallaDark && <AbsoluteFill style={{background: 'rgba(0,0,0,0.88)'}} />}
      <Scrim from={50} amount={0.85} />
      <Crosshair cx={W / 2} cy={760} r={210} s={phatt - 0.3} e={phatt + 0.5} />
      <Crack cx={W / 2} cy={760} s={phatt} e={64.38} seed={4} />
      <FeedChrome cam="CAM 09 · CLAY SHOOT" />
      <Finish />
      <Flash at={[62.54, phatt]} dur={0.1} />
    </Sc>
  );
};

// ---------- 76.92 – 84.08 POLO & TEA ----------
const PoloTea: React.FC = () => {
  const t = useT();
  const kaaleOn = t >= wtime(18, 2) - 0.04 && t < 78.2;
  return (
    <Sc a={76.92} b={84.08}>
      <Camera punch={0.04} shake={6}>
        {t < 80.45 ? (
          <AbsoluteFill style={{background: C.ink}}>
            <Strip clip="polo" y={560} from={76.92} speed={0.37} grade={kaaleOn ? `${GRADE.noir} invert(1)` : GRADE.feed}>
              <Blobs clip="polo" tm={{from: 76.92, speed: 0.37}} w={W} h={608} max={8} />
            </Strip>
            <Mono x={70} y={490} size={24} color={C.red}>SPORT OF KINGS · 4 CHUKKAS</Mono>
          </AbsoluteFill>
        ) : (
          <Full clip="tea" sync grade={GRADE.warm} />
        )}
      </Camera>
      {kaaleOn && <AbsoluteFill style={{backdropFilter: 'invert(1)'}} />}
      <Scrim from={50} amount={0.85} />
      <FeedChrome cam={t < 80.45 ? 'CAM 10 · FIELD' : 'CAM 11 · TEA'} />
      <Finish />
    </Sc>
  );
};

// ---------- 84.08 – 87.88 PIND (zine page) ----------
const Pind: React.FC = () => {
  const t = useT();
  const s = wtime(22, 0);
  const sp = springAt(t - s, 2.4, 0.4);
  return (
    <Sc a={84.08} b={87.88}>
      <Paper />
      <PhulkariBand y={0} h={120} />
      <PhulkariBand y={H - 120} h={120} speed={-40} />
      <div style={{position: 'absolute', left: 0, width: '100%', top: 260, textAlign: 'center', fontFamily: F.gu, fontWeight: 800, fontSize: 380, lineHeight: 1.1, color: C.red, transform: `scale(${0.8 + 0.2 * sp})`}}>ਪਿੰਡਾਂ</div>
      {/* halftone person */}
      {/* photocopied sticker of him, slapped onto the page */}
      <Sticker clip="tea2" tm={{from: 84.08, src: 0.1, speed: 0.25}} s={84.12} x={120} y={500} w={840} h={900} rot={-3} stroke={12} filter="grayscale(1) contrast(1.7) brightness(1.08)" />
      <div style={{position: 'absolute', left: 0, width: '100%', top: 1180, textAlign: 'center', fontFamily: F.slam, fontSize: 210, color: C.red, lineHeight: 1, opacity: t >= wtime(22, 1) - 0.04 ? 1 : 0}}>AALIYAN</div>
      <Tape y={1660} rot={3} text="PIND ✶ VILLAGE ✶ ROOTS" bg={C.ink} color={C.gold} size={44} />
      <Mono x={70} y={150} size={24} color={C.ink}>ISSUE 01 · THE PIND</Mono>
    </Sc>
  );
};

// ---------- 87.88 – 98.4 YAAR ----------
const Yaar: React.FC = () => {
  const t = useT();
  const yaar = wtime(26, 1);
  const show = (pid: number, k: number) => t >= wtime(pid, k) - 0.04;
  const sz = fitSize('YAARAN DA', 'slam', 980);
  return (
    <Sc a={87.88} b={98.4}>
      {t < 90.5 ? (
        <Camera punch={0.05} shake={8}>
          <Full clip="tea2" from={87.88} speed={0.53} grade={GRADE.warm} />
        </Camera>
      ) : t < 97.0 ? (
        <Camera punch={0.04} shake={6}>
          <Behind clip="walk" sync grade={GRADE.feed} dim={0.3}>
            <div style={{position: 'absolute', left: 0, width: '100%', top: 250, textAlign: 'center', fontFamily: F.gu, fontWeight: 800, fontSize: 520, color: C.gold, lineHeight: 1.15, opacity: show(26, 1) ? 1 : 0, transform: `scale(${0.85 + 0.15 * springAt(t - yaar, 2.4, 0.4)})`, textShadow: `0 0 60px ${C.gold}88`}}>
              ਯਾਰ
            </div>
          </Behind>
        </Camera>
      ) : (
        <Camera punch={0.05} shake={8}>
          <Full clip="fire" sync grade={GRADE.feed} />
        </Camera>
      )}
      <Scrim from={55} amount={0.85} />
      <FeedChrome cam="CAM 12 · FORECOURT" />
      <Finish />
    </Sc>
  );
};

// ---------- 98.4 – 101.78 FIRE ----------
const Fire: React.FC = () => {
  const t = useT();
  const words = ['Baby', 'you', 'so', 'fire'];
  return (
    <Sc a={98.4} b={101.78}>
      <Camera drift={0.01} from={98.4}>
        <Full clip="fire" sync grade={GRADE.fire} />
      </Camera>
      <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(255,90,0,0.35), transparent 60%)', mixBlendMode: 'screen'}} />
      <Scrim from={50} amount={0.75} />
      <Embers s={98.4} e={101.78} n={46} />
      <div style={{position: 'absolute', left: 70, right: 70, top: 760, fontFamily: F.serif, fontStyle: 'italic', fontSize: 210, lineHeight: 0.92, color: C.bone}}>
        {words.map((w, k) => {
          const s = wtime(30, k);
          const on = t >= s - 0.04;
          const isFire = w === 'fire';
          const fl = isFire ? 0.85 + 0.15 * Math.abs(noise(t * 18, 5)) : 1;
          return (
            <span key={k} style={{opacity: on ? 1 : 0, display: isFire ? 'block' : 'inline', fontSize: isFire ? 420 : undefined, color: isFire ? '#FFB347' : undefined, textShadow: isFire ? `0 0 ${50 * fl}px #FF6A00, 0 0 ${120 * fl}px #FF3D00` : '0 8px 30px rgba(0,0,0,0.5)', marginRight: 28}}>
              {w}
            </span>
          );
        })}
      </div>
      <FeedChrome cam="CAM 13 · HEAT" />
      <Finish />
    </Sc>
  );
};

// ---------- 101.78 – 105.58 THE LETTER (chat) ----------
const Letter: React.FC = () => {
  const t = useT();
  const avatarTm = {from: 101.6, speed: 0.1};
  const f = frameAt('woman', t, avatarTm);
  return (
    <Sc a={101.78} b={105.58}>
      <Full clip="woman" {...avatarTm} grade="blur(18px) brightness(0.45) saturate(0.7)" />
      <AbsoluteFill style={{background: 'rgba(10,10,10,0.35)'}} />
      {/* chat header */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 210, height: 200, display: 'flex', alignItems: 'center', gap: 30, padding: '0 70px', borderBottom: '2px solid rgba(243,238,230,0.25)'}}>
        <div style={{width: 150, height: 150, borderRadius: 75, overflow: 'hidden', border: `5px solid ${C.bone}`, position: 'relative', flexShrink: 0}}>
          <Img src={plateSrc('woman', f)} style={{position: 'absolute', width: '100%', height: '178%', objectFit: 'cover', top: '-20%'}} />
        </div>
        <div>
          <div style={{fontFamily: F.black, fontSize: 60, color: C.bone}}>shakeena</div>
          <div style={{fontFamily: F.mono, fontSize: 26, color: '#7CFF8A', letterSpacing: 2}}>{t < 104.9 ? '● ONLINE · typing…' : '● ONLINE'}</div>
        </div>
      </div>
      <Bubble s={wtime(32, 0)} typingFrom={101.78} text="ve main miss kardi aa tainu" y={620} side="left" />
      <Bubble s={wtime(33, 0)} typingFrom={wtime(32, 5) + 0.15} text="hun kade mil ja yaar shakeena" y={960} side="left" color={C.red} textColor={C.bone} />
      {t > 105.0 && <Mono x={70} y={1300} size={26} right>SEEN 1:41 AM ✓✓</Mono>}
      <Finish grain={0.14} vignette={0.4} />
    </Sc>
  );
};

export const Verse: React.FC = () => (
  <>
    <Hook1 />
    <Shoot />
    <PoloTea />
    <Pind />
    <Yaar />
    <Fire />
    <Letter />
  </>
);
