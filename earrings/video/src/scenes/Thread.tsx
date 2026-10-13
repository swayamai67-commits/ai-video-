import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {noise2D} from '@remotion/noise';
import {Hoop} from '../components/Hoop';
import {Reveal} from '../components/Reveal';
import {kickEnv} from '../lib/beats';
import {E, mix, ramp, w, WORDS} from '../lib/time';
import {C, F} from '../theme';

/* ------------------------------------------------------------------ keystrokes */
type Ev = {t: number; op: 'add' | 'del' | 'clear'; ch?: string};
const EVENTS: Ev[] = (() => {
  const ev: Ev[] = [];
  // "You couldn't tell her that you lost them": typed in sync with the vocal
  for (let i = 13; i <= 20; i++) {
    const wd = WORDS[i];
    const next = WORDS[i + 1].start;
    const s = (i < 20 ? wd.word + ' ' : wd.word).split('');
    const span = Math.max(0.12, Math.min(wd.end, next) - wd.start);
    s.forEach((ch, k) => ev.push({t: wd.start + (span * k) / s.length, op: 'add', ch}));
  }
  const typedLen = ev.length;
  // "'cause you're scared": panic backspace, accelerating
  for (let k = 0; k < typedLen; k++) ev.push({t: 9.72 + 0.62 * Math.pow(k / typedLen, 0.75), op: 'del'});
  const draft = (txt: string, a: number, b: number, da?: number, db?: number) => {
    txt.split('').forEach((ch, k) => ev.push({t: a + ((b - a) * k) / txt.length, op: 'add', ch}));
    if (da !== undefined && db !== undefined) for (let k = 0; k < txt.length; k++) ev.push({t: da + ((db - da) * k) / txt.length, op: 'del'});
  };
  // "So you think of what to say": drafts, typed and abandoned
  draft('hey', 12.86, 13.1, 13.3, 13.44);
  draft('random question but', 13.58, 14.18, 14.32, 14.5);
  draft('i think i left my earrings at yours', 14.58, 15.6);
  ev.push({t: w(36).start, op: 'clear'});
  return ev.sort((a, b) => a.t - b.t);
})();

const typed = (t: number) => {
  let s = '';
  let last: Ev | null = null;
  for (const e of EVENTS) {
    if (e.t > t) break;
    if (e.op === 'add') s += e.ch;
    else if (e.op === 'del') s = s.slice(0, -1);
    else s = '';
    last = e;
  }
  return {s, last};
};

/* ------------------------------------------------------------------ keyboard */
const KB_TOP = 1474;
const KW = 94;
const KH = 96;
const PITCH = 112;
type Key = {id: string; label: string; x: number; y: number; w: number; special?: boolean};
const KEYS: Key[] = (() => {
  const k: Key[] = [];
  'qwertyuiop'.split('').forEach((c, i) => k.push({id: c, label: c, x: 16 + i * (KW + 12), y: KB_TOP, w: KW}));
  'asdfghjkl'.split('').forEach((c, i) => k.push({id: c, label: c, x: 69 + i * (KW + 12), y: KB_TOP + PITCH, w: KW}));
  k.push({id: 'shift', label: '⇧', x: 16, y: KB_TOP + PITCH * 2, w: 130, special: true});
  'zxcvbnm'.split('').forEach((c, i) => k.push({id: c, label: c, x: 175 + i * (KW + 12), y: KB_TOP + PITCH * 2, w: KW}));
  k.push({id: 'del', label: '⌫', x: 934, y: KB_TOP + PITCH * 2, w: 130, special: true});
  k.push({id: '123', label: '123', x: 16, y: KB_TOP + PITCH * 3, w: 210, special: true});
  k.push({id: ' ', label: 'space', x: 238, y: KB_TOP + PITCH * 3, w: 592});
  k.push({id: 'ret', label: 'return', x: 846, y: KB_TOP + PITCH * 3, w: 218, special: true});
  return k;
})();

const Keyboard: React.FC<{active: string | null; press: number}> = ({active, press}) => (
  <div style={{position: 'absolute', left: 0, top: KB_TOP - 22, width: 1080, height: 1920 - KB_TOP + 22, background: '#1B1B1E'}}>
    {KEYS.map((k) => {
      const on = active === k.id;
      return (
        <div
          key={k.id}
          style={{
            position: 'absolute',
            left: k.x,
            top: k.y - (KB_TOP - 22),
            width: k.w,
            height: KH,
            borderRadius: 14,
            background: on ? '#8A8A90' : k.special ? '#323236' : '#55555A',
            boxShadow: '0 3px 0 rgba(0,0,0,0.55)',
            color: '#fff',
            fontFamily: F.ui,
            fontSize: k.label.length > 1 && k.id !== 'shift' && k.id !== 'del' ? 30 : 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {k.label}
        </div>
      );
    })}
    {active && active.length === 1 && active !== ' ' && (() => {
      const k = KEYS.find((x) => x.id === active);
      if (!k) return null;
      return (
        <div
          style={{
            position: 'absolute',
            left: k.x - 18,
            top: k.y - (KB_TOP - 22) - 128,
            width: k.w + 36,
            height: 136,
            borderRadius: 20,
            background: '#8A8A90',
            color: '#fff',
            fontFamily: F.ui,
            fontSize: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${0.9 + 0.1 * press})`,
            transformOrigin: '50% 100%',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          }}
        >
          {k.label}
        </div>
      );
    })()}
  </div>
);

/* ------------------------------------------------------------------ bits */
const Bubble: React.FC<{out?: boolean; children: React.ReactNode; style?: React.CSSProperties}> = ({out, children, style}) => (
  <div
    style={{
      position: 'absolute',
      [out ? 'right' : 'left']: 40,
      padding: '20px 30px',
      borderRadius: 40,
      background: out ? `linear-gradient(180deg, #3D8BFF, ${C.blue})` : C.bubbleGray,
      color: '#fff',
      fontFamily: F.ui,
      fontSize: 38,
      lineHeight: 1.2,
      ...style,
    }}
  >
    {children}
  </div>
);

const DAYS = ['Today 2:14 AM', 'Tomorrow 1:02 AM', 'Wednesday 3:40 AM', 'Thursday 2:58 AM', 'Friday 1:15 AM', 'Saturday 4:20 AM', 'Sunday 2:14 AM', 'Monday 3:03 AM', 'Tuesday 1:47 AM'];

const serif = (size: number, italic = true): React.CSSProperties => ({
  fontFamily: F.serif,
  fontStyle: italic ? 'italic' : 'normal',
  fontSize: size,
  lineHeight: 1,
  whiteSpace: 'nowrap',
  color: C.cream,
});

/* ------------------------------------------------------------------ scene */
export const Thread: React.FC<{t: number}> = ({t}) => {
  const wake = ramp(t, 6.3, 6.75, E.out);
  const lock = ramp(t, 18.12, 18.42, E.in);
  const {s, last} = typed(t);
  const since = last ? t - last.t : 9;
  const typing = since < 0.12;
  const activeKey = typing && last ? (last.op === 'del' ? 'del' : last.op === 'add' ? (last.ch === ' ' ? ' ' : (last.ch ?? '').toLowerCase()) : null) : null;
  const press = 1 - ramp(since, 0, 0.1);
  const caretOn = typing || Math.floor(t * 1.8) % 2 === 0;

  // camera: slow push toward the field while typing, punch on SCARED
  const push = mix(1, 1.05, ramp(t, 6.5, 9.6, E.soft)) - 0.05 * ramp(t, 9.7, 10.4, E.out);
  const scared = w(23).start;
  const punch = 0.035 * Math.exp(-Math.max(0, t - scared) * 6) * (t >= scared ? 1 : 0);
  const shake = t >= scared && t < 11.1 ? 1 - ramp(t, scared, 11.1) : 0;
  const sx = noise2D('sx', t * 9, 0) * 9 * shake;
  const sy = noise2D('sy', t * 9, 3) * 9 * shake;

  // her typing bubble
  const herIn = ramp(t, 11.02, 11.25, E.back);
  const herOut = ramp(t, w(27).start + 0.05, w(27).start + 0.2, E.in);
  const herScale = herIn * (1 - herOut);

  // toast
  const toastIn = ramp(t, w(36).start, w(36).start + 0.25, E.back);
  const toastOut = ramp(t, 17.3, 17.55, E.in);

  // days flip on "another day."
  const flipT = Math.max(0, t - w(39).start);
  const dayIdx = Math.min(DAYS.length - 1, Math.floor(flipT / 0.15));
  const dayFrac = (flipT / 0.15) % 1;
  const dayScale = 1 + 0.45 * ramp(t, w(39).start - 0.1, w(39).start + 0.4, E.out);
  const sendOn = s.length > 0;

  const k = kickEnv(t, 0.12);

  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          transformOrigin: '540px 1380px',
          transform: `translate(${sx}px, ${sy}px) scale(${push * (1 + punch) * mix(1.08, 1, wake) * mix(1, 0.97, lock)})`,
        }}
      >
        {/* screen glow */}
        <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 50% at 50% 60%, rgba(47,123,255,${0.07 + 0.03 * k}), rgba(0,0,0,0) 70%)`}} />

        {/* header */}
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 310, background: 'rgba(22,22,26,0.92)', borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
          <div style={{position: 'absolute', left: 34, top: 132, color: C.blue, fontFamily: F.ui, fontSize: 84, lineHeight: 1}}>‹</div>
          <div style={{position: 'absolute', left: 540 - 58, top: 98, width: 116, height: 116, borderRadius: 58, background: 'radial-gradient(circle at 35% 30%, #4a4a52, #1c1c21)'}} />
          <Hoop x={540} y={160} r={30} spin={t * 0.9} glow={0.6} post={false} />
          <div style={{position: 'absolute', left: 0, width: 1080, top: 232, textAlign: 'center', color: '#fff', fontFamily: F.ui, fontSize: 30}}>
            her <span style={{color: '#8E8E93'}}>›</span>
          </div>
        </div>

        {/* history: they used to talk */}
        <div style={{position: 'absolute', left: 0, width: 1080, top: 352, textAlign: 'center', color: '#8E8E93', fontFamily: F.ui, fontSize: 24}}>Sat 11:48 PM</div>
        <Bubble style={{top: 398}}>had fun tonight</Bubble>
        <Bubble out style={{top: 496}}>me too :)</Bubble>
        <div style={{position: 'absolute', right: 52, top: 588, color: '#8E8E93', fontFamily: F.ui, fontSize: 22}}>Read Sat</div>

        {/* date stamp → flips forward on "another day" */}
        <div style={{position: 'absolute', left: 0, width: 1080, top: 640, height: 50, overflow: 'hidden', textAlign: 'center', transform: `scale(${dayScale})`, transformOrigin: '50% 50%'}}>
          {t < w(39).start ? (
            <div style={{color: '#8E8E93', fontFamily: F.ui, fontSize: 24, lineHeight: '50px'}}>{DAYS[0]}</div>
          ) : (
            <>
              <div style={{color: '#C8C8CE', fontFamily: F.mono, fontSize: 24, lineHeight: '50px', transform: `translateY(${-50 * E.out(Math.min(1, dayFrac * 3))}px)`}}>
                {DAYS[dayIdx]}
              </div>
              <div style={{color: '#C8C8CE', fontFamily: F.mono, fontSize: 24, lineHeight: '50px', transform: `translateY(${-50 * E.out(Math.min(1, dayFrac * 3))}px)`}}>
                {DAYS[Math.min(DAYS.length - 1, dayIdx + 1)]}
              </div>
            </>
          )}
        </div>

        {/* ---------------- hero lyric area ---------------- */}
        {/* the message, written large: typed and backspaced in lockstep with the field */}
        {t < 10.5 && t > 6.4 && (
          <div style={{position: 'absolute', left: 90, top: 880, width: 900, ...serif(104, false), whiteSpace: 'normal', lineHeight: 1.08, color: C.cream}}>
            {s.split(' ').map((wd, i, arr) => (
              <span key={i} style={{fontStyle: /couldn|lost/.test(wd) ? 'italic' : 'normal'}}>
                {wd}
                {i < arr.length - 1 ? ' ' : ''}
              </span>
            ))}
            {caretOn && <span style={{display: 'inline-block', width: 6, height: 96, background: C.blue, verticalAlign: 'middle', marginLeft: 6, marginTop: -12, borderRadius: 3}} />}
          </div>
        )}
        {/* 'cause you're / SCARED */}
        <div style={{position: 'absolute', left: 90, top: 750, display: 'flex', gap: 22}}>
          <Reveal t={t} at={w(21).start} out={10.92} style={serif(92)}>’cause</Reveal>
          <Reveal t={t} at={w(22).start} out={10.92} style={serif(92)}>you’re</Reveal>
        </div>
        <Scared t={t} />
        {/* and you're not talking. */}
        <div style={{position: 'absolute', left: 90, top: 750, display: 'flex', gap: 22}}>
          <Reveal t={t} at={w(24).start} out={12.5} style={serif(92)}>and</Reveal>
          <Reveal t={t} at={w(25).start} out={12.5} style={serif(92)}>you’re</Reveal>
        </div>
        <div style={{position: 'absolute', left: 84, top: 870, filter: `grayscale(${ramp(t, 12.2, 12.5)})`}}>
          <Reveal t={t} at={w(26).start} out={12.55} style={{...serif(190, false)}}>not</Reveal>
        </div>
        <div style={{position: 'absolute', left: 84, top: 1040}}>
          <Reveal t={t} at={w(27).start} out={12.6} style={{...serif(190)}}>talking.</Reveal>
        </div>
        {/* So you think of what to say */}
        <div style={{position: 'absolute', left: 90, top: 750, display: 'flex', gap: 22}}>
          <Reveal t={t} at={w(28).start} out={15.25} style={serif(96, false)}>So</Reveal>
          <Reveal t={t} at={w(29).start} out={15.25} style={serif(96, false)}>you</Reveal>
        </div>
        <div style={{position: 'absolute', left: 84, top: 850}}>
          <Reveal t={t} at={w(30).start} out={15.25} style={serif(210)}>think</Reveal>
        </div>
        <div style={{position: 'absolute', left: 90, top: 1060, display: 'flex', gap: 22, alignItems: 'baseline'}}>
          <Reveal t={t} at={w(31).start} out={15.25} style={serif(96, false)}>of</Reveal>
          <Reveal t={t} at={w(32).start} out={15.25} style={serif(96, false)}>what</Reveal>
          <Reveal t={t} at={w(33).start} out={15.25} style={serif(96, false)}>to</Reveal>
          <Reveal t={t} at={w(34).start} out={15.25} style={serif(130)}>say</Reveal>
        </div>
        {/* and save it for another day. */}
        <div style={{position: 'absolute', left: 90, top: 750, display: 'flex', gap: 22, alignItems: 'baseline'}}>
          <Reveal t={t} at={w(35).start} out={18.1} style={serif(96, false)}>and</Reveal>
          <Reveal t={t} at={w(36).start} out={18.1} style={serif(150)}>save</Reveal>
          <Reveal t={t} at={w(37).start} out={18.1} style={serif(96, false)}>it</Reveal>
          <Reveal t={t} at={w(38).start} out={18.1} style={serif(96, false)}>for</Reveal>
        </div>
        <div style={{position: 'absolute', left: 84, top: 900}}>
          <Reveal t={t} at={w(39).start} out={18.1} style={serif(176)}>another</Reveal>
        </div>
        <div style={{position: 'absolute', left: 84, top: 1060}}>
          <Reveal t={t} at={w(40).start} out={18.1} style={serif(176)}>day.</Reveal>
        </div>

        {/* her typing bubble: there, then gone */}
        {herScale > 0.001 && (
          <div
            style={{
              position: 'absolute',
              left: 40,
              top: 1240,
              width: 150,
              height: 82,
              borderRadius: 41,
              background: C.bubbleGray,
              transform: `scale(${herScale})`,
              transformOrigin: '0% 100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            {[0, 1, 2].map((i) => (
              <div key={i} style={{width: 18, height: 18, borderRadius: 9, background: '#9A9AA0', opacity: 0.45 + 0.55 * Math.max(0, Math.sin((t * 2.4 - i * 0.18) * Math.PI * 2))}} />
            ))}
          </div>
        )}

        {/* saved-to-drafts toast */}
        {toastIn > 0 && toastOut < 1 && (
          <div
            style={{
              position: 'absolute',
              left: 540 - 220,
              top: 1250,
              width: 440,
              height: 86,
              borderRadius: 43,
              background: 'rgba(44,44,48,0.96)',
              transform: `scale(${toastIn * (1 - toastOut)})`,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              paddingLeft: 92,
              boxSizing: 'border-box',
              color: '#fff',
              fontFamily: F.ui,
              fontSize: 30,
            }}
          >
            <Spinner t={t} />
            Saved to Drafts
          </div>
        )}

        {/* input bar */}
        <div style={{position: 'absolute', left: 30, top: 1380, width: 74, height: 74, borderRadius: 37, background: '#2C2C30', color: '#B0B0B6', fontFamily: F.ui, fontSize: 52, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>+</div>
        <div
          style={{
            position: 'absolute',
            left: 122,
            bottom: 1920 - 1456,
            width: 928,
            minHeight: 80,
            boxSizing: 'border-box',
            border: '2px solid #3A3A3E',
            borderRadius: 40,
            padding: '14px 100px 14px 30px',
            color: '#fff',
            fontFamily: F.ui,
            fontSize: 42,
            lineHeight: 1.25,
            background: 'rgba(0,0,0,0.6)',
          }}
        >
          {s.length === 0 ? <span style={{color: '#5E5E64'}}>{caretOn ? <Caret /> : null}iMessage</span> : <span>{s}{caretOn ? <Caret /> : null}</span>}
          <div
            style={{
              position: 'absolute',
              right: 10,
              bottom: 8,
              width: 62,
              height: 62,
              borderRadius: 31,
              background: sendOn ? C.blue : '#2C2C30',
              color: '#fff',
              fontFamily: F.ui,
              fontSize: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: sendOn ? 1 : 0.6,
            }}
          >
            ↑
          </div>
        </div>
        <Keyboard active={activeKey} press={press} />
      </AbsoluteFill>
      {/* wake / lock */}
      <AbsoluteFill style={{background: '#000', opacity: Math.max(1 - wake, lock)}} />
    </AbsoluteFill>
  );
};

const Caret: React.FC = () => <span style={{display: 'inline-block', width: 4, height: 50, background: C.blue, verticalAlign: 'middle', marginLeft: 2, marginTop: -6, borderRadius: 2}} />;

const Spinner: React.FC<{t: number}> = ({t}) => (
  <div style={{position: 'absolute', left: 30, top: 21, width: 44, height: 44}}>
    <Hoop x={22} y={22} r={16} spin={t * 7} glow={0.5} post={false} thick={4} />
  </div>
);

/** SCARED: one-off condensed punch with chromatic split and a nervous tremble. */
const Scared: React.FC<{t: number}> = ({t}) => {
  const at = w(23).start;
  const p = ramp(t, at - 0.03, at + 0.14, E.out);
  const out = ramp(t, 10.95, 11.3, E.in);
  if (p <= 0 || out >= 1) return null;
  const jx = noise2D('j', t * 14, 1) * 6;
  const jy = noise2D('j', t * 14, 7) * 6;
  const split = 10 * (1 - ramp(t, at, at + 0.5)) + 3;
  const base: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 1080,
    textAlign: 'center',
    fontFamily: F.punch,
    fontSize: 330,
    lineHeight: 1,
    letterSpacing: 4,
  };
  return (
    <div style={{position: 'absolute', left: 0, top: 870, width: 1080, height: 360, opacity: p * (1 - out), transform: `translate(${jx}px, ${jy}px) scale(${interpolate(p, [0, 1], [1.3, 1]) * mix(1, 0.9, out)})`}}>
      <div style={{...base, color: 'rgba(255,60,80,0.85)', transform: `translateX(${-split}px)`, mixBlendMode: 'screen'}}>SCARED</div>
      <div style={{...base, color: 'rgba(60,200,255,0.85)', transform: `translateX(${split}px)`, mixBlendMode: 'screen'}}>SCARED</div>
      <div style={{...base, color: C.cream}}>SCARED</div>
    </div>
  );
};
