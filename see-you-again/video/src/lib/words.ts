import words from '../data/words.json';

export type Word = {word: string; start: number; end: number; line: number; i: number; src: string};
export const WORDS = words as Word[];
export const w = (i: number) => WORDS[i];
/** Words i..j inclusive. */
export const span = (i: number, j: number) => WORDS.slice(i, j + 1);
/** Strip trailing punctuation for display where the design adds its own. */
export const bare = (s: string) => s.replace(/[.,]$/, '');
