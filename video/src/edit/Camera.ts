import {DOWNBEATS, since} from './data';
import {impulse, noise1} from './lib';

/** Hits that move the picture. kind: punch = quick push-in, shake = impact shake. */
export type Hit = {t: number; punch?: number; shake?: number; tau?: number};

/** Same maths as camera() in upscale/finish.py — keep them in step. */
export const camera = (t: number, hits: Hit[], hooks: [number, number][]) => {
  let s = 0, sx = 0, sy = 0, rot = 0;
  for (const h of hits) {
    if (t < h.t || t > h.t + 1.5) continue;
    const k = impulse(t, h.t, h.tau ?? 0.14);
    s += (h.punch ?? 0) * k;
    const sh = (h.shake ?? 0) * impulse(t, h.t, (h.tau ?? 0.14) * 1.4);
    sx += sh * noise1(t * 38, 1) * 22;
    sy += sh * noise1(t * 41, 2) * 16;
    rot += sh * noise1(t * 29, 3) * 0.7;
  }
  for (const [a, b] of hooks) {
    if (t >= a && t < b) {
      const d = since(DOWNBEATS, t);
      if (d < 0.5) s += 0.035 * Math.exp(-d / 0.11);
    }
  }
  // over-scale just enough that a shaken frame never reveals its edge (the MV frame is never cropped at rest)
  const cover = 1 + (2 * Math.max(Math.abs(sx), Math.abs(sy) * 1.78) + Math.abs(rot) * 30) / 1920;
  return {scale: (1 + s) * cover, x: sx, y: sy, rot};
};

/** Slow drift for HUD layers so they feel attached to a physical rig, not pasted on. */
export const drift = (t: number, amp = 1) => ({
  x: noise1(t * 0.35, 7) * 3 * amp,
  y: noise1(t * 0.3, 8) * 2 * amp,
});
