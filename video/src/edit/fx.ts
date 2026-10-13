import fxJson from './data/fx.json';
import type {Hit} from './Camera';
import type {FlashCue} from './fx/Film';

/** Camera, flash and light-leak cues. Shared with the Python finisher (upscale/finish.py), which renders the final. */
export type LeakCue = {a: number; b: number; hue?: 'warm' | 'red'; peak?: number; from?: 'left' | 'right'};
export const FX = fxJson as unknown as {hits: Hit[]; hooks: [number, number][]; flashes: FlashCue[]; leaks: LeakCue[]};
