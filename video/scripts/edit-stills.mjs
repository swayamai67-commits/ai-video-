// QA stills for the 4K edit at given MV times, tiled into a contact sheet.
// node scripts/edit-stills.mjs <outDir> t1 t2 ...   (renders AshkePreview: full look on the 720p MV)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const [outDir, ...times] = process.argv.slice(2);
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
fs.mkdirSync(outDir, {recursive: true});
for (const f of fs.readdirSync(outDir)) if (f.startsWith('s-')) fs.unlinkSync(path.join(outDir, f));
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const composition = await selectComposition({serveUrl, id: 'AshkePreview', browserExecutable});
let k = 0;
for (const ts of times) {
  const t = parseFloat(ts);
  const output = path.join(outDir, `s-${String(k++).padStart(3, '0')}.jpg`);
  await renderStill({composition, serveUrl, frame: Math.round(t * composition.fps), output, imageFormat: 'jpeg', jpegQuality: 88, browserExecutable});
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', output, '-vf', `scale=640:-1,drawtext=text='${ts}':x=8:y=8:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.6`, output]);
}
const cols = Math.min(4, times.length);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-pattern_type', 'glob', '-i', path.join(outDir, 's-*.jpg'), '-vf', `tile=${cols}x${Math.ceil(times.length / cols)}`, '-frames:v', '1', path.join(outDir, 'sheet.jpg')]);
console.log('sheet', path.join(outDir, 'sheet.jpg'));
