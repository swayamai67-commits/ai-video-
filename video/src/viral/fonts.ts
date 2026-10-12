import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// SIL OFL fonts bundled from @fontsource so renders are deterministic.
const faces: [string, string, string, string?][] = [
  ['Anton', 'anton-latin-400-normal.woff2', '400'],
  ['Instrument Serif', 'instrument-serif-latin-400-italic.woff2', '400', 'italic'],
  ['Instrument Serif', 'instrument-serif-latin-400-normal.woff2', '400'],
  ['Anek Gurmukhi', 'anek-gurmukhi-gurmukhi-800-normal.woff2', '800'],
  ['Anek Gurmukhi', 'anek-gurmukhi-gurmukhi-600-normal.woff2', '600'],
  ['JetBrains Mono', 'jetbrains-mono-latin-500-normal.woff2', '500'],
  ['JetBrains Mono', 'jetbrains-mono-latin-700-normal.woff2', '700'],
  ['Archivo Black', 'archivo-black-latin-400-normal.woff2', '400'],
  ['Eczar', 'eczar-devanagari-800-normal.woff2', '800'],
];
let started = false;
export const ensureViralFonts = () => {
  if (started) return;
  started = true;
  for (const [family, file, weight, style] of faces) {
    loadFont({family, url: staticFile(`fonts/${file}`), weight, style: style ?? 'normal'});
  }
};
