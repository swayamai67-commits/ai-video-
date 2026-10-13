import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

const faces: Array<[string, string, string, string]> = [
  ['Instrument Serif', 'instrument-serif-latin-400-normal.woff2', '400', 'normal'],
  ['Instrument Serif', 'instrument-serif-latin-400-italic.woff2', '400', 'italic'],
  ['Inter Tight', 'inter-tight-latin-500-normal.woff2', '500', 'normal'],
  ['Inter Tight', 'inter-tight-latin-800-normal.woff2', '800', 'normal'],
  ['JetBrains Mono', 'jetbrains-mono-latin-400-normal.woff2', '400', 'normal'],
  ['JetBrains Mono', 'jetbrains-mono-latin-700-normal.woff2', '700', 'normal'],
  ['Caveat', 'caveat-latin-500-normal.woff2', '500', 'normal'],
  ['Anton', 'anton-latin-400-normal.woff2', '400', 'normal'],
];

export const fontsReady = Promise.all(
  faces.map(([family, file, weight, style]) =>
    loadFont({family, url: staticFile(`fonts/${file}`), weight, style}),
  ),
);
