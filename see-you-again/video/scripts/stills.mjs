// Render QA stills at given SONG times (s) and a labelled contact sheet:
//   node scripts/stills.mjs <outDir> [--scale=1] t1 t2 ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const args = process.argv.slice(2);
const outDir = args.shift();
let scale = 0.5;
const times = [];
for (const a of args) {
  if (a.startsWith('--scale=')) scale = parseFloat(a.slice(8));
  else times.push(parseFloat(a));
}
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const composition = await selectComposition({serveUrl, id: 'SeeYouAgain', browserExecutable});
for (const t of times) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * composition.fps));
  const output = path.join(outDir, `t${t.toFixed(2).padStart(5, '0')}.jpg`);
  await renderStill({composition, serveUrl, frame, output, imageFormat: 'jpeg', jpegQuality: 88, scale, browserExecutable,
    chromiumOptions: {gl: 'swangle'}});
  console.log('wrote', output);
}
