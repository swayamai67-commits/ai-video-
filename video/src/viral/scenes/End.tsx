import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {C, F, H, SONG_END, W} from '../config';
import {Camera, Flash, Grain, Halftone, Paper, RGBSplit, Scanlines} from '../fx';
import {Blobs, FeedChrome, Lock} from '../hud';
import {beatTimes, clamp, ease, noise, prog, pulse, springAt, useT} from '../lib';
import {wtime} from '../Lyrics';
import {cutSrc, frameAt} from '../Plate';
import {Mono, fitSize, typed} from '../text';
import {Crack, PhulkariBand, PhulkariBurst, Snake, Sticker, Tape, outline} from '../graphics';
import {Finish, Full, GRADE, Sc, Scrim, Strip} from './common';
import {AccentHero, Shots} from './Verse';

// ---------- 146.74 – 168.26 VAULT (velocity) ----------
const Vault: React.FC = () => {
  const t = useT();
  const phaad = wtime(66, 4);
  const crackOn = t >= phaad - 0.04;
  return (
    <Sc a={146.74} b={168.26}>
      <Camera punch={0.06} shake={14} extra={t >= phaad && t < phaad + 0.35 ? 1 - (t - phaad) / 0.35 : 0}>
        <Shots
          grade={GRADE.feed}
          shots={[
            {a: 146.74, b: 148.6, clip: 'jewels', tm: {from: 146.74, speed: 0.62}},
            {a: 148.6, b: 153.92, clip: 'lib', tm: {from: 148.6, src: 0, speed: 0.77}},
            {a: 153.92, b: 155.9, clip: 'watch', tm: {from: 153.92, src: 0, speed: 1}},
            {a: 155.9, b: 157.48, clip: 'lib2', tm: {from: 155.9, src: 1.4, speed: 0.6}},
            {a: 157.48, b: 159.9, clip: 'lib2', tm: {sync: true}},
            {a: 159.9, b: 161.06, clip: 'loupe', tm: {from: 159.9, speed: 0.9}},
            {a: 161.06, b: 163.0, clip: 'lib', tm: {from: 161.06, src: 1.6, speed: 0.8}},
            {a: 163.0, b: 164.9, clip: 'lib3', tm: {sync: true}},
            {a: 164.9, b: 167.0, clip: 'polo2', tm: {from: 164.9, speed: 0.9}},
            {a: 167.0, b: 168.26, clip: 'estate2', tm: {sync: true}},
          ]}
        />
      </Camera>
      <Scrim from={50} amount={0.88} />
      {t < 148.6 && <Mono x={70} y={300} size={26} color={C.gold}>{typed('VAULT · ASSETS ON FILE', t, 146.8, 30)}</Mono>}
      {t >= 153.92 && t < 155.9 && <Mono x={70} y={300} size={26} color={C.gold}>{typed('ITEM 02 · RM / GOLD / ICED', t, 153.95, 30)}</Mono>}
      {crackOn && <Crack cx={W / 2} cy={820} s={phaad} e={164.9} seed={21} scale={1.2} />}
      <FeedChrome cam="CAM 17 · VAULT" />
      <Finish />
      <Flash at={[phaad]} dur={0.1} />
    </Sc>
  );
};

// ---------- 168.26 – 173.58 HEIST: WANTED poster ----------
const Heist: React.FC = () => {
  const t = useT();
  const daaka = wtime(70, 5);
  const tm = {from: 168.26, src: 0.0, speed: 0.35};
  const f = frameAt('estate2', t, tm);
  const sp = springAt(t - 168.3, 2.2, 0.42);
  const st = springAt(t - daaka + 0.04, 3.4, 0.4);
  return (
    <Sc a={168.26} b={173.58}>
      <Paper />
      <Grain opacity={0.3} />
      <div style={{position: 'absolute', left: 0, width: '100%', top: 230, textAlign: 'center', fontFamily: F.slam, fontSize: 250, color: C.ink, lineHeight: 1, letterSpacing: 6}}>WANTED</div>
      <Mono x={0} y={500} size={30} color={C.ink} style={{width: '100%', textAlign: 'center'}}>FOR THE ROBBERY OF 1 (ONE) HEART</Mono>
      <div style={{position: 'absolute', left: 190, top: 560, width: 700, height: 640, border: `6px solid ${C.ink}`, background: '#fff', overflow: 'hidden', transform: `scale(${0.9 + 0.1 * sp})`}}>
        <Img src={cutSrc('estate2', f)} style={{position: 'absolute', width: '100%', height: '170%', objectFit: 'cover', objectPosition: '50% 0%', top: 0, filter: 'grayscale(1) contrast(1.7) brightness(1.1)'}} />
        <AbsoluteFill style={{background: `radial-gradient(closest-side, rgba(0,0,0,0.22), transparent) 0 0/9px 9px`, mixBlendMode: 'multiply'}} />
      </div>
      <Mono x={0} y={1600} size={30} color={C.ink} style={{width: '100%', textAlign: 'center'}}>REWARD: ∞ · LAST SEEN: THE ESTATE</Mono>
      {t >= daaka - 0.04 && (
        <div style={{position: 'absolute', left: 0, width: '100%', top: 760, textAlign: 'center', transform: `rotate(-12deg) scale(${2.2 - 1.2 * Math.min(1, st)})`, opacity: clamp(st * 3)}}>
          <span style={{display: 'inline-block', border: `12px solid ${C.red}`, padding: '0 50px', fontFamily: F.gu, fontWeight: 800, fontSize: 300, color: C.red, lineHeight: 1.2, mixBlendMode: 'multiply'}}>ਡਾਕਾ</span>
        </div>
      )}
      <Flash at={[daaka]} color={C.red} dur={0.08} />
    </Sc>
  );
};

// ---------- 173.58 – 186.16 NIGHT ----------
const Night: React.FC = () => {
  const t = useT();
  const raakha = wtime(74, 3);
  const naag = wtime(78, 0);
  const cut = wtime(78, 5);
  const halo = clamp((t - wtime(74, 0)) / 0.8) * (t < 178.8 ? 1 : 0);
  return (
    <Sc a={173.58} b={186.16}>
      <Camera punch={0.04} shake={6}>
        <Shots
          grade={GRADE.warm}
          shots={[
            {a: 173.58, b: 178.3, clip: 'point', tm: {from: 173.58, src: 0, speed: 0.91}},
            {a: 178.3, b: 181.95, clip: 'dinner', tm: {from: 178.3, src: 0, speed: 0.85}},
            {a: 181.95, b: 186.16, clip: 'dinner2', tm: {sync: true}},
          ]}
        />
      </Camera>
      {halo > 0 && (
        <AbsoluteFill style={{background: `radial-gradient(circle at 50% 30%, ${C.gold}55 0%, transparent 45%)`, opacity: halo, mixBlendMode: 'screen'}} />
      )}
      <Scrim from={45} amount={0.88} />
      <Snake y={820} s={naag + 0.1} cutAt={cut} e={186.16} />
      {t >= raakha - 0.2 && t < 178.8 && <Mono x={70} y={300} size={26} color={C.gold}>{typed('PROTECTED BY: BAAJAN AALA', t, raakha - 0.2, 30)}</Mono>}
      <FeedChrome cam="CAM 18 · DINNER" />
      <Finish />
      <Flash at={[cut]} dur={0.08} />
    </Sc>
  );
};

// ---------- 186.16 – 200.66 JHUMAR FINALE ----------
const MONTAGE: [string, number][] = [
  ['hook', 0.4], ['walk', 4.6], ['point', 1.4], ['lib', 1.2], ['boat2', 6.0], ['estate2', 2.4], ['polo2', 0.3], ['study', 0.2],
  ['fire', 1.0], ['shoot2', 1.8], ['tea', 0.2], ['mercy', 1.0], ['lib3', 0.4], ['dinner2', 9.6], ['walk', 5.4], ['hook', 2.6],
];
const Finale: React.FC = () => {
  const t = useT();
  const ash = [wtime(82, 6), wtime(84, 6), wtime(86, 6)];
  const beats = beatTimes('beats', 189.7, 200.66);
  const bi = beats.filter((b) => b <= t).length;
  const montage = t >= 189.7;
  const [clip, src] = MONTAGE[bi % MONTAGE.length];
  const lastB = beats[bi - 1] ?? 189.7;
  const k = ash.findIndex((a) => t >= a - 0.04 && t < a + 0.62);
  const strobe = t >= ash[2] && Math.floor((t - ash[2]) * 25) % 4 < 2 && t < ash[2] + 0.6;
  return (
    <Sc a={186.16} b={200.66}>
      <Camera punch={montage ? 0.09 : 0.04} shake={montage ? 20 : 6}>
        {montage ? (
          <RGBSplit amount={pulse('beats', t, 0.06) * 18}>
            {(flt) => <Full clip={clip} from={lastB} src={src} speed={1.4} grade={`${GRADE.warm} ${flt === 'none' ? '' : flt}`} />}
          </RGBSplit>
        ) : (
          <Full clip="dinner2" sync grade={GRADE.warm} />
        )}
      </Camera>
      <Scrim from={40} amount={0.9} />
      <PhulkariBand y={H - 300} h={70} speed={120} />
      {k >= 0 && (
        <AbsoluteFill style={{background: k === 2 && strobe ? C.gold : 'rgba(10,10,10,0.82)'}}>
          <PhulkariBurst s={ash[k]} scale={0.9 + k * 0.35} seed={k * 7 + 1} />
          <AccentHero txt="ਅਸ਼ਕੇ" s={ash[k]} e={ash[k] + 0.62} y={820} size={300 + k * 90} color={k === 2 && strobe ? C.ink : C.gold} />
          <div style={{position: 'absolute', left: 0, width: '100%', top: 1080, textAlign: 'center', fontFamily: F.slam, fontSize: fitSize('ASHKE', 'slam', 700 + k * 160), color: k === 2 && strobe ? C.ink : C.bone, lineHeight: 1, transform: `scale(${1.2 - 0.2 * ease.outExpo(clamp((t - ash[k]) / 0.15))})`}}>
            ASHKE
          </div>
        </AbsoluteFill>
      )}
      <Mono x={70} y={300} size={26} color={C.gold}>{t >= 189.7 ? `JHUMAR · ${String(bi).padStart(2, '0')} BEATS` : ''}</Mono>
      <FeedChrome cam="CAM ∞ · JHUMAR" />
      <Finish />
      <Flash at={ash} dur={0.12} />
    </Sc>
  );
};

// ---------- 200.66 – 217.81 END OF FEED ----------
const Outro: React.FC = () => {
  const t = useT();
  const sp = springAt(t - 200.75, 2.0, 0.4);
  const stop = prog(t, 214.0, 215.6);
  const squash = ease.inExpo(stop);
  const fade = prog(t, 215.6, 217.4);
  return (
    <Sc a={200.66} b={SONG_END + 1}>
      <AbsoluteFill style={{transform: `scaleY(${1 - squash * 0.995}) scaleX(${1 + squash * 0.1})`, filter: `brightness(${1 + squash * 2})`}}>
        <Paper />
        <PhulkariBand y={0} h={110} speed={20} />
        <PhulkariBand y={H - 110} h={110} speed={-20} />
        <div style={{position: 'absolute', left: 0, width: '100%', top: 250, textAlign: 'center', fontFamily: F.gu, fontWeight: 800, fontSize: 200, color: C.red, lineHeight: 1.1}}>ਅਸ਼ਕੇ</div>
        <div style={{position: 'absolute', left: 0, width: '100%', top: 470, textAlign: 'center', fontFamily: F.slam, fontSize: fitSize('ASHKE', 'slam', 960), color: C.ink, lineHeight: 1}}>ASHKE</div>
        <Sticker clip="hook" tm={{from: 0, src: 1.2, speed: 0}} s={201.2} x={170} y={760} w={740} h={900} rot={-4} stroke={12} />
        <Tape y={1500} rot={-6} text="KARAN AUJLA × MXRCI" size={50} />
        <Tape y={1610} rot={4} text="AUJLA SZN 1" bg={C.ink} color={C.gold} size={44} speed={-120} />
        <Mono x={70} y={160} size={24} color={C.ink}>{typed('■ END OF FEED · THANKS FOR WATCHING', t, 203.0, 26)}</Mono>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#000', opacity: Math.max(fade, squash > 0.99 ? 1 : 0)}} />
      {t > 214 && t < 215.7 && <Scanlines opacity={0.4} />}
    </Sc>
  );
};

export const End: React.FC = () => (
  <>
    <Vault />
    <Heist />
    <Night />
    <Finale />
    <Outro />
  </>
);
