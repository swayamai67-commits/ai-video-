import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, H, W} from '../config';
import {Camera, Flash, Grain, Paper, RGBSplit, Scanlines, Slices} from '../fx';
import {Blobs, Brackets, FeedChrome, Lock, headBox} from '../hud';
import {beatTimes, clamp, ease, noise, prog, pulse, rnd, springAt, useT} from '../lib';
import {frameAt, Plate} from '../Plate';
import {Hero, Mono, fitSize, typed} from '../text';
import {PhulkariBand, Sticker, Tape} from '../graphics';
import {Behind, Finish, Full, GRADE, Outline, Sc, Scrim, Strip} from './common';

// ---------- 0.0 – 4.6 BOOT ----------
const Boot: React.FC = () => {
  const t = useT();
  const kicks = [1.741, 2.09, 3.715];
  const flashAccent = kicks.some((k) => t >= k && t < k + 0.08);
  return (
    <Sc a={0} b={4.6}>
      <AbsoluteFill style={{background: '#050505'}} />
      <Grain opacity={0.55} />
      <Scanlines opacity={0.25} />
      <Mono x={70} y={760} size={30} color={C.red}>{typed('● FEED 01 / ESTATE / ENGLAND', t, 0.3, 30)}</Mono>
      <div style={{position: 'absolute', left: 70, top: 820, fontFamily: F.slam, fontSize: fitSize('EYES ON', 'slam', 940), lineHeight: 0.95, color: C.bone}}>
        {t > 1.0 ? 'EYES ON' : ''}
      </div>
      <div style={{position: 'absolute', left: 70, top: 820 + fitSize('EYES ON', 'slam', 940) * 0.95, fontFamily: F.slam, fontSize: fitSize('THE JATT', 'slam', 940), lineHeight: 0.95, color: C.red}}>
        {t > 1.74 ? 'THE JATT' : ''}
      </div>
      <Mono x={70} y={1500} size={24}>{typed('KARAN AUJLA × MXRCI — ASHKE', t, 2.4, 26)}</Mono>
      {flashAccent && (
        <AbsoluteFill style={{background: C.bone, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: F.gu, fontWeight: 800, fontSize: 420, color: C.ink, lineHeight: 1}}>ਅਸ਼ਕੇ</div>
        </AbsoluteFill>
      )}
      <FeedChrome cam="CAM 00 · BOOT" />
    </Sc>
  );
};

// ---------- 4.6 – 9.0 ESTATE ----------
const Estate: React.FC = () => {
  const t = useT();
  const tm = {from: 4.6, speed: 0.75};
  const lat = (52.0406 + noise(t * 2) * 0.0004).toFixed(4);
  return (
    <Sc a={4.6} b={9.0}>
      <AbsoluteFill style={{background: C.ink}} />
      <Camera drift={0.006} from={4.6}>
        <Strip clip="estate" y={560} {...tm}>
          <Blobs clip="estate" tm={tm} w={W} h={608} max={10} />
        </Strip>
      </Camera>
      <Mono x={70} y={470} size={26} color={C.red}>{typed('LOCATING SUBJECT…', t, 4.7, 24)}</Mono>
      <Mono x={70} y={1200} size={24}>{`LAT ${lat}N   LON 0.6914W`}</Mono>
      <Mono x={70} y={1240} size={24}>{typed('THE ESTATE · 23 GUNS · 12 CARS · 1 JATT', t, 5.4, 30)}</Mono>
      <Outline txt="ENGLAND" size={fitSize('ENGLAND', 'slam', 940)} y={1320} stroke={3} style={{opacity: clamp((t - 5.2) * 2)}} />
      <FeedChrome cam="CAM 02 · GATE" />
      <Finish />
    </Sc>
  );
};

// ---------- 9.0 – 17.6 TARGET ----------
const Target: React.FC = () => {
  const t = useT();
  const tm = {from: 9.0, speed: 0.6};
  return (
    <Sc a={9.0} b={17.6}>
      <Camera drift={0.008} from={9} shake={6}>
        <Full clip="arrive" {...tm} grade={GRADE.cold} />
        <Blobs clip="arrive" tm={tm} w={W} h={H} max={7} opacity={0.65} />
        <Lock clip="arrive" tm={tm} w={W} h={H} label="TARGET ACQUIRED" sub="KARAN AUJLA · MATCH 99.7%" from={10.2} />
      </Camera>
      <Scrim from={55} amount={0.7} />
      <Mono x={70} y={1560} size={26} color={C.red}>{t > 10.8 ? '▲ SUBJECT ENTERED THE ESTATE' : ''}</Mono>
      <FeedChrome cam="CAM 03 · DRIVE" />
      <Finish />
    </Sc>
  );
};

// ---------- 17.6 – 25.2 NAME (text behind subject) ----------
const Name: React.FC = () => {
  const t = useT();
  const tm = {from: 17.6, src: 0.0, speed: 0.15};
  const s1 = springAt(t - 17.75, 2.2, 0.4);
  const s2 = springAt(t - 18.6, 2.2, 0.4);
  const size = fitSize('KARAN', 'slam', 1000);
  const hostTm = {from: 22.75, speed: 0.95};
  return (
    <Sc a={17.6} b={25.2}>
      {t < 22.75 ? (
        <Camera punch={0} drift={0.01} from={17.6}>
          <Behind clip="estate2" {...tm} grade={GRADE.cold} dim={0.25}>
            <div style={{position: 'absolute', left: 0, width: '100%', top: 300, textAlign: 'center', fontFamily: F.slam, fontSize: size, lineHeight: 0.86, color: C.bone}}>
              <div style={{transform: `translateY(${(1 - s1) * 200}px)`, opacity: clamp(s1 * 2)}}>KARAN</div>
              <div style={{transform: `translateY(${(1 - s2) * 200}px)`, opacity: clamp(s2 * 2), color: C.red}}>AUJLA</div>
            </div>
          </Behind>
          <Mono x={70} y={1500} size={26}>{typed('ALIAS: AUJLA · ORIGIN: GHURALA, PUNJAB', t, 19.0, 30)}</Mono>
        </Camera>
      ) : t < 24.3 ? (
        <>
          <Full clip="host" {...hostTm} grade={GRADE.cold} />
          <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
            <Brackets x={300} y={430} w={470} h={560} color={C.bone} stroke={5} />
            <rect x={300} y={378} width={170} height={40} fill={C.bone} />
            <text x={314} y={407} fill={C.ink} fontFamily={F.mono} fontWeight={700} fontSize={25} letterSpacing={2}>HOST</text>
          </svg>
          <Mono x={70} y={1500} size={30}>{'HOST · “SPLENDID IDEA, SIR.”'}</Mono>
        </>
      ) : (
        <AbsoluteFill style={{background: C.ink}}>
          {Math.floor((t - 24.3) * 25) % 3 !== 2 && (
            <Hero txt="3·2·1" s={24.3} y={960} width={700} color={C.red} />
          )}
        </AbsoluteFill>
      )}
      <FeedChrome cam="CAM 04 · FORECOURT" />
      <Finish />
    </Sc>
  );
};

// ---------- 25.2 – 31.9 WARDROBE (sticker slaps on beats) ----------
const STICKERS: [string, number][] = [
  ['hook', 20], ['walk', 100], ['fire', 70], ['tea', 10], ['study', 15], ['boat2', 140], ['lib', 30], ['polo2', 15],
  ['point', 60], ['estate2', 70], ['dinner2', 120], ['shoot2', 30], ['mercy', 30], ['tea2', 20], ['study2', 60], ['lib3', 30],
];
const Wardrobe: React.FC = () => {
  const t = useT();
  const beats = beatTimes('beats', 25.15, 31.9);
  const shown = beats.filter((b) => b <= t + 0.04);
  const last = shown.slice(-6);
  const word = t < 28.33 ? 'FROM THE' : t < 30.12 ? 'PIND' : 'TO THE PALACE';
  const wsz = fitSize(word, 'slam', 960);
  return (
    <Sc a={25.19} b={31.93}>
      <Paper />
      <PhulkariBand y={0} h={110} />
      <PhulkariBand y={H - 110} h={110} speed={-40} />
      <div style={{position: 'absolute', left: 0, width: '100%', top: 700 - wsz * 0.4, textAlign: 'center', fontFamily: F.slam, fontSize: Math.min(wsz, 520), color: word === 'PIND' ? C.red : C.ink, lineHeight: 1, transform: `scale(${1 + pulse('downbeats', t, 0.15) * 0.08})`}}>
        {word}
      </div>
      {last.map((b) => {
        const k = beats.indexOf(b);
        const [clip, f] = STICKERS[k % STICKERS.length];
        const x = 60 + rnd(k * 3.1) * 420;
        const y = 560 + rnd(k * 7.7) * 520;
        return <Sticker key={k} clip={clip} tm={{from: 0, src: f / 25, speed: 0}} s={b} x={x} y={y} w={560} h={820} rot={(rnd(k * 1.3) - 0.5) * 22} />;
      })}
      <Tape y={1560} rot={-5} text="PIND ✶ TO ✶ PALACE" />
      <Mono x={70} y={150} size={24} color={C.ink}>{`WARDROBE ${String(shown.length).padStart(2, '0')}/${beats.length}`}</Mono>
    </Sc>
  );
};

// ---------- 31.9 – 38.2 TITLE: ASHKE behind the walking Karan ----------
const Title: React.FC = () => {
  const t = useT();
  const tm = {from: 31.93, src: 0, speed: 1.0};
  const sz = fitSize('ASHKE', 'slam', 1040);
  const sp = springAt(t - 31.95, 2.4, 0.35);
  const punch = pulse('downbeats', t, 0.18);
  return (
    <Sc a={31.93} b={38.2}>
      <Camera punch={0.07} shake={10}>
        <Behind clip="walk" {...tm} grade={GRADE.feed} dim={0.25}>
          <div style={{position: 'absolute', left: 0, width: '100%', top: 470, textAlign: 'center', fontFamily: F.slam, fontSize: sz, lineHeight: 1, color: C.bone, transform: `scale(${0.85 + 0.15 * sp})`, letterSpacing: -4}}>
            ASHKE
          </div>
          <div style={{position: 'absolute', left: 0, width: '100%', top: 270, textAlign: 'center', fontFamily: F.gu, fontWeight: 800, fontSize: 190, color: C.gold, lineHeight: 1, opacity: clamp((t - 32.5) * 3), textShadow: `0 0 ${30 + punch * 60}px ${C.gold}`}}>
            ਅਸ਼ਕੇ
          </div>
        </Behind>
      </Camera>
      <Scrim from={60} amount={0.75} />
      <Mono x={70} y={1420} size={30}>{typed('KARAN AUJLA × MXRCI', t, 33.7, 24)}</Mono>
      <Mono x={70} y={1466} size={24} color={C.red}>{typed('AUJLA SZN 1 · ROMANIZED', t, 35.5, 24)}</Mono>
      <FeedChrome cam="CAM 05 · LAWN" />
      <Finish />
    </Sc>
  );
};

// ---------- 38.2 – 45.65 OH-OH: rings from his mouth ----------
const OhOh: React.FC = () => {
  const t = useT();
  const shots = [
    {a: 38.2, b: 41.0, clip: 'lib', tm: {from: 38.2, src: 0.4, speed: 0.6}},
    {a: 41.0, b: 43.9, clip: 'mercy', tm: {from: 41.0, src: 0, speed: 0.7}},
    {a: 43.9, b: 45.65, clip: 'study', tm: {from: 43.9, src: 0.0, speed: 0.6}},
  ];
  const sh = shots.find((s) => t >= s.a && t < s.b) ?? shots[0];
  const f = frameAt(sh.clip, t, sh.tm);
  const hb = headBox(sh.clip, f);
  const cx = hb ? (hb[0] + hb[2] / 2) * W : W / 2;
  const cy = hb ? (hb[1] + hb[3] * 0.82) * H : 700;
  const rings = beatTimes('beats', 38.0, 45.65).filter((b) => b <= t);
  const ohs = rings.length;
  return (
    <Sc a={38.2} b={45.65}>
      <Camera drift={0.01} from={sh.a}>
        <Full clip={sh.clip} {...sh.tm} grade={GRADE.noir} />
      </Camera>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {rings.slice(-8).map((b) => {
          const dt = t - b;
          const r = 40 + ease.outCubic(clamp(dt / 1.6)) * 900;
          return <circle key={b} cx={cx} cy={cy} r={r} stroke={rings.indexOf(b) % 4 === 0 ? C.red : C.bone} strokeWidth={4} fill="none" opacity={clamp(1 - dt / 1.6)} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: 50, right: 50, top: 1230, display: 'flex', flexWrap: 'wrap', gap: '0 26px', fontFamily: F.slam, fontSize: 150, lineHeight: 1}}>
        {Array.from({length: Math.min(ohs, 12)}).map((_, i) => (
          <span key={i} style={i % 3 === 2 ? {color: C.red} : i % 2 ? {color: 'transparent', WebkitTextStroke: `3px ${C.bone}`} : {color: C.bone}}>
            OH
          </span>
        ))}
      </div>
      <FeedChrome cam="CAM 06 · STUDY" />
      <Finish />
    </Sc>
  );
};

// ---------- 45.65 – 48.22 MERCY ----------
const Mercy: React.FC = () => {
  const t = useT();
  const glitch = clamp(1 - (t - 45.7) / 0.5);
  return (
    <Sc a={45.65} b={48.22}>
      {t < 46.5 ? (
        <AbsoluteFill style={{background: C.ink}}>
          <Slices amount={glitch} seed={9}>
            <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 330, color: C.red, transform: `scale(${1.25 - 0.25 * ease.outExpo(clamp((t - 45.7) / 0.2))})`}}>Mercy</div>
            </AbsoluteFill>
          </Slices>
        </AbsoluteFill>
      ) : (
        <>
          <RGBSplit amount={Math.max(0, 1 - (t - 46.5) / 0.4) * 24}>
            {(flt) => <Full clip="mercy" from={46.5} src={0.6} speed={0.8} grade={`${GRADE.feed} ${flt === 'none' ? '' : flt}`} />}
          </RGBSplit>
          <Lock clip="mercy" tm={{from: 46.5, src: 0.6, speed: 0.8}} w={W} h={H} label="PROD. MXRCI" from={46.6} color={C.red} pad={0.18} />
          <Mono x={70} y={1500} size={28} color={C.bone}>{typed('HOOK INCOMING ▸▸▸', t, 47.0, 30)}</Mono>
        </>
      )}
      <FeedChrome cam="CAM 07 · TAG" />
      <Finish />
      <Flash at={[45.7]} color={C.red} dur={0.1} />
    </Sc>
  );
};

export const Intro: React.FC = () => (
  <>
    <Boot />
    <Estate />
    <Target />
    <Name />
    <Wardrobe />
    <Title />
    <OhOh />
    <Mercy />
  </>
);
