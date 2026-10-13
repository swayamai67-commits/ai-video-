import {loadFont} from '@remotion/fonts';
import {continueRender, delayRender, staticFile} from 'remotion';

export const F = {
  anton: 'Anton',
  serif: 'Instrument Serif',
  hand: 'Kalam',
  mono: 'Space Mono',
};

const faces: [string, string, {weight?: string; style?: string}][] = [
  [F.anton, 'anton-latin-400-normal.woff2', {}],
  [F.serif, 'instrument-serif-latin-400-italic.woff2', {style: 'italic'}],
  [F.serif, 'instrument-serif-latin-400-normal.woff2', {}],
  [F.hand, 'kalam-latin-700-normal.woff2', {weight: '700'}],
  [F.mono, 'space-mono-latin-400-normal.woff2', {}],
  [F.mono, 'space-mono-latin-700-normal.woff2', {weight: '700'}],
];

const handle = delayRender('fonts');
Promise.all(
  faces.map(([family, file, o]) =>
    loadFont({family, url: staticFile(`fonts/${file}`), weight: o.weight ?? '400', style: o.style ?? 'normal'}),
  ),
)
  .then(() => continueRender(handle))
  .catch((e) => {
    console.error(e);
    continueRender(handle);
  });
