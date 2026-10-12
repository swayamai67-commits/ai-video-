import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// All fonts are SIL OFL, bundled locally from @fontsource so renders are deterministic.
const faces: [string, string, string, string?][] = [
  ['Eczar', 'eczar-devanagari-800-normal.woff2', '800'],
  ['Eczar', 'eczar-latin-800-normal.woff2', '800'],
  ['Eczar', 'eczar-devanagari-600-normal.woff2', '600'],
  ['Eczar', 'eczar-latin-600-normal.woff2', '600'],
  ['Tiro Devanagari Hindi', 'tiro-devanagari-hindi-devanagari-400-normal.woff2', '400'],
  ['Tiro Devanagari Hindi', 'tiro-devanagari-hindi-latin-400-normal.woff2', '400'],
  ['Tiro Devanagari Hindi', 'tiro-devanagari-hindi-devanagari-400-italic.woff2', '400', 'italic'],
  ['Kalam', 'kalam-devanagari-400-normal.woff2', '400'],
  ['Kalam', 'kalam-latin-400-normal.woff2', '400'],
  ['Cormorant Garamond', 'cormorant-garamond-latin-400-normal.woff2', '400'],
  ['Cormorant Garamond', 'cormorant-garamond-latin-500-normal.woff2', '500'],
  ['Cormorant Garamond', 'cormorant-garamond-latin-600-normal.woff2', '600'],
  ['Cormorant Garamond', 'cormorant-garamond-latin-400-italic.woff2', '400', 'italic'],
  ['Cormorant Garamond', 'cormorant-garamond-latin-500-italic.woff2', '500', 'italic'],
  ['Cormorant Garamond', 'cormorant-garamond-latin-600-italic.woff2', '600', 'italic'],
  ['IBM Plex Mono', 'ibm-plex-mono-latin-400-normal.woff2', '400'],
  ['IBM Plex Mono', 'ibm-plex-mono-latin-500-normal.woff2', '500'],
];

const devanagariRange = 'U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+25CC, U+A830-A839, U+A8E0-A8FF';

let started = false;
export const ensureFonts = () => {
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
