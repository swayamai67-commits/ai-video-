import {blobsAt} from '../data';
import {DH, DW} from '../theme';
import type {Rect} from './Lock';

export type Pick = 'left' | 'right' | 'largest' | 'center';

const choose = (bs: number[][], pick: Pick) => {
  if (!bs.length) return null;
  if (pick === 'largest') return bs[0];
  const cx = (b: number[]) => (b[0] + b[2]) / 2;
  // ignore slivers when picking by position
  const big = bs.filter((b) => (b[2] - b[0]) * (b[3] - b[1]) > 0.012);
  const pool = big.length ? big : bs;
  if (pick === 'center') return [...pool].sort((a, b) => Math.abs(cx(a) - 0.5) - Math.abs(cx(b) - 0.5))[0];
  return [...pool].sort((a, b) => (pick === 'left' ? cx(a) - cx(b) : cx(b) - cx(a)))[0];
};

/** A person's box picked by position, averaged over ±3 matte frames so it glides instead of jittering. */
export const pickRect = (t: number, pick: Pick, pad = 0.025): Rect | null => {
  const acc = [0, 0, 0, 0];
  let n = 0;
  for (let k = -3; k <= 3; k++) {
    const b = choose(blobsAt(t + k / 25), pick);
    if (!b) continue;
    const w = 1 - Math.abs(k) / 4;
    for (let i = 0; i < 4; i++) acc[i] += b[i] * w;
    n += w;
  }
  if (!n) return null;
  const [x0, y0, x1, y1] = acc.map((v) => v / n);
  return {x: (x0 - pad * 0.6) * DW, y: (y0 - pad) * DH, w: (x1 - x0 + pad * 1.2) * DW, h: (y1 - y0 + pad * 2) * DH};
};

/** All people in frame (largest first), each smoothed like pickRect by nearest-centre matching. */
export const allRects = (t: number, max = 6, minArea = 0.004): Rect[] => {
  const base = blobsAt(t).filter((b) => (b[2] - b[0]) * (b[3] - b[1]) > minArea).slice(0, max);
  return base.map((b0) => {
    const acc = [0, 0, 0, 0];
    let n = 0;
    for (let k = -2; k <= 2; k++) {
      const bs = blobsAt(t + k / 25);
      if (!bs.length) continue;
      const c0 = [(b0[0] + b0[2]) / 2, (b0[1] + b0[3]) / 2];
      const b = bs.reduce((best, q) => {
        const d = Math.hypot((q[0] + q[2]) / 2 - c0[0], (q[1] + q[3]) / 2 - c0[1]);
        const db = Math.hypot((best[0] + best[2]) / 2 - c0[0], (best[1] + best[3]) / 2 - c0[1]);
        return d < db ? q : best;
      });
      const w = 1 - Math.abs(k) / 3;
      for (let i = 0; i < 4; i++) acc[i] += b[i] * w;
      n += w;
    }
    const [x0, y0, x1, y1] = acc.map((v) => v / n);
    return {x: x0 * DW - 8, y: y0 * DH - 8, w: (x1 - x0) * DW + 16, h: (y1 - y0) * DH + 16};
  });
};
