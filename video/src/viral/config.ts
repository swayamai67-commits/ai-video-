// ASHKE viral cut: "EYES ON THE JATT". Palette, fonts and switches.
export const FPS = 25;
export const W = 1080;
export const H = 1920;
export const SONG_END = 217.81;

/** Punjabi accent words render in this script ('gu' = Gurmukhi, 'dev' = Devanagari). */
export const ACCENT_SCRIPT: 'gu' | 'dev' = 'gu';

export const C = {
  ink: '#0A0A0A',
  bone: '#F3EEE6',
  paper: '#ECE4D6',
  red: '#FF2D1A',
  gold: '#FFC23D',
  sky: '#7FC8FF',
  magenta: '#E0218A',
  hud: 'rgba(243,238,230,0.86)',
};

export const F = {
  slam: '"Anton", "Archivo Black", sans-serif',
  serif: '"Instrument Serif", serif',
  mono: '"JetBrains Mono", monospace',
  black: '"Archivo Black", sans-serif',
  gu: '"Anek Gurmukhi", "Anton", sans-serif',
  dev: '"Eczar", serif',
};

// Reels / Shorts safe area: keep critical text out of these bands.
export const SAFE = {top: 230, bottom: 400, side: 70, right: 150};
