export const C = {
  bone: '#EFE6D2',
  boneDim: 'rgba(239,230,210,0.55)',
  ink: '#16130F',
  night: '#0B0A09',
  gold: '#D4AE5C',
  goldHi: '#F3DC9A',
  goldLo: '#8C6A2A',
  oxblood: '#6E1F24',
  oxbloodHi: '#9A2C33',
  sky: '#A9C8E8',
  blush: '#C8463E',
  clay: '#C8643C',
};

export const F = {
  lyric: '"Tiro Devanagari Hindi", serif',
  display: '"Eczar", serif', // weight 800; Rozha One drew श्क ambiguously (see docs/qa/font-test.jpg)
  latin: '"Cormorant Garamond", serif',
  mono: '"IBM Plex Mono", monospace',
  hand: '"Kalam", cursive',
};

// gold foil, used with background-clip:text
export const goldFoil = (shift: number) => ({
  backgroundImage: `linear-gradient(100deg, ${C.goldLo} 0%, ${C.gold} 22%, ${C.goldHi} 38%, ${C.gold} 52%, ${C.goldLo} 70%, ${C.gold} 86%, ${C.goldHi} 100%)`,
  backgroundSize: '260% 100%',
  backgroundPosition: `${shift}% 0%`,
  WebkitBackgroundClip: 'text' as const,
  backgroundClip: 'text' as const,
  color: 'transparent',
});

export const FPS = 25;
export const SONG_DURATION = 217.81;
export const REEL_START = 47.15;
export const REEL_END = 92.31;
