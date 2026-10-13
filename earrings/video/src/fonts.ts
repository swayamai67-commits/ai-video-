import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// All fonts are SIL OFL, bundled locally from @fontsource so renders are deterministic.
const faces: [string, string, string, string?][] = [
  ['Instrument Serif', 'instrument-serif-latin-400-normal.woff2', '400'],
  ['Instrument Serif', 'instrument-serif-latin-400-italic.woff2', '400', 'italic'],
  ['Caveat', 'caveat-latin-500-normal.woff2', '500'],
  ['Caveat', 'caveat-latin-700-normal.woff2', '700'],
  ['Space Grotesk', 'space-grotesk-latin-500-normal.woff2', '500'],
  ['Space Grotesk', 'space-grotesk-latin-700-normal.woff2', '700'],
  ['DM Mono', 'dm-mono-latin-400-normal.woff2', '400'],
  ['DM Mono', 'dm-mono-latin-500-normal.woff2', '500'],
];

let started = false;
export const ensureFonts = () => {
  if (started) return;
  started = true;
  for (const [family, file, weight, style] of faces) {
    loadFont({family, url: staticFile(`fonts/${file}`), weight, style: style ?? 'normal'});
  }
};
