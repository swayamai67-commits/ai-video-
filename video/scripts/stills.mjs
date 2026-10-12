// Render QA stills at given SONG times: node scripts/stills.mjs <Comp> <outDir> t1 t2 ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const [comp, outDir, ...times] = process.argv.slice(2);
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: comp, browserExecutable});
const songStart = comp === 'AshkeReel' ? 47.15 : 0;
for (const ts of times) {
  const t = parseFloat(ts);
  const frame = Math.round((t - songStart) * 25);
  const output = path.join(outDir, `${comp}-${t.toFixed(2).padStart(6, '0')}.jpg`);
  await renderStill({composition, serveUrl, frame, output, imageFormat: 'jpeg', jpegQuality: 85, browserExecutable});
  console.log('wrote', output);
}
