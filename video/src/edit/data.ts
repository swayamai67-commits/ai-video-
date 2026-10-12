import lyricsJson from './data/lyrics.json';
import beatsJson from './data/beats.json';
import cutsJson from './data/cuts.json';
import subjectsJson from './data/subjects.json';
import {MV_DURATION} from './theme';

export type Word = {i: number; w: string; dev: string; s: number; e: number; accent: boolean; en: boolean};
export type Phrase = {id: number; line: number; half: number; start: number; end: number; text: string; words: Word[]};

export const PHRASES = lyricsJson as Phrase[];
export const WORDS: Word[] = PHRASES.flatMap((p) => p.words);
/** k-th word of phrase `id` (phrase ids match data/phrases.json). */
export const word = (id: number, k: number) => PHRASES.find((p) => p.id === id)!.words[k];

/** Lyric lines (a line = its one or two half-line phrases). */
export type Line = {line: number; phrases: Phrase[]; start: number; end: number};
export const LINES: Line[] = (() => {
  const m = new Map<number, Phrase[]>();
  for (const p of PHRASES) m.set(p.line, [...(m.get(p.line) ?? []), p]);
  return [...m.entries()].map(([line, ps]) => ({line, phrases: ps, start: ps[0].start, end: ps[ps.length - 1].end}));
})();

const B = beatsJson as {beats: number[]; downbeats: number[]; kicks: number[]; env60: number[]};
export const BEATS = B.beats;
export const DOWNBEATS = B.downbeats;
export const KICKS = B.kicks;
/** Loudness of the MV soundtrack, ~0..1. */
export const env = (t: number) => B.env60[Math.max(0, Math.min(B.env60.length - 1, Math.round(t * 60)))] ?? 0;
/** Seconds since the most recent time in `list` (Infinity if none). */
export const since = (list: number[], t: number) => {
  let lo = 0, hi = list.length - 1, best = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (list[mid] <= t) { best = mid; lo = mid + 1; } else hi = mid - 1;
  }
  return best < 0 ? Infinity : t - list[best];
};

export const CUTS: number[] = [0, ...(cutsJson as number[]), MV_DURATION];
export const shotAt = (t: number) => {
  let k = 0;
  while (k < CUTS.length - 2 && CUTS[k + 1] <= t) k++;
  return {start: CUTS[k], end: CUTS[k + 1], index: k};
};

const S = subjectsJson as {fps: number; p: (number[] | null)[]; b: number[][][]};
export type Box = {cx: number; cy: number; w: number; h: number};
/** Primary person box (0..1 of frame) at MV time t, interpolated between 25 fps samples. */
export const subjectAt = (t: number): Box | null => {
  const f = t * 25;
  const a = S.p[Math.floor(f)];
  const b = S.p[Math.min(S.p.length - 1, Math.floor(f) + 1)];
  if (!a) return null;
  const q = b ? f - Math.floor(f) : 0;
  const v = b ? a.map((x, i) => x + (b[i] - x) * q) : a;
  return {cx: v[0], cy: v[1], w: v[2], h: v[3]};
};
export const blobsAt = (t: number): number[][] => S.b[Math.min(S.b.length - 1, Math.floor(t * 25))] ?? [];
export const matteFrame = (t: number) => Math.min(5449, Math.floor(t * 25 + 1e-6));
