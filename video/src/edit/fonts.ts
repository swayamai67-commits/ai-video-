import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// SIL OFL faces, bundled locally from @fontsource so renders are deterministic.
const faces: [string, string, string, string?][] = [
  ['Anton', 'anton-latin-400-normal.woff2', '400'],
  ['Instrument Serif', 'instrument-serif-latin-400-normal.woff2', '400'],
  ['Instrument Serif', 'instrument-serif-latin-400-italic.woff2', '400', 'italic'],
  ['JetBrains Mono', 'jetbrains-mono-latin-400-normal.woff2', '400'],
  ['JetBrains Mono', 'jetbrains-mono-latin-700-normal.woff2', '700'],
  ['Permanent Marker', 'permanent-marker-latin-400-normal.woff2', '400'],
  ['Eczar', 'eczar-devanagari-800-normal.woff2', '800'],
  ['Eczar', 'eczar-latin-800-normal.woff2', '800'],
];

const devanagariRange = 'U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+25CC, U+A830-A839, U+A8E0-A8FF';

let started = false;
export const ensureEditFonts = () => {
  if (started) return;
  started = true;
  for (const [family, file, weight, style] of faces) {
    loadFont({
      family,
      url: staticFile(`fonts/${file}`),
      weight,
      style: style ?? 'normal',
      unicodeRange: file.includes('devanagari') ? devanagariRange : undefined,
    });
  }
};

export const F = {
  hero: '"Anton", sans-serif',
  serif: '"Instrument Serif", serif',
  mono: '"JetBrains Mono", monospace',
  marker: '"Permanent Marker", cursive',
  dev: '"Eczar", serif',
};
