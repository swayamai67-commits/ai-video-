import {random} from 'remotion';

/** A jagged vertical paper tear around x=cx, as clip-path polygons for the left and right halves. */
const pts: [number, number][] = [];
for (let y = -80, i = 0; y <= 2000; y += 46, i++) {
  pts.push([540 + (random(`tear-${i}`) - 0.5) * 30 + Math.sin(i * 0.7) * 10, y]);
}
export const TEAR_POINTS = pts;
export const leftClip = () => `polygon(-3000px -80px, ${pts.map(([x, y]) => `${x.toFixed(1)}px ${y}px`).join(', ')}, -3000px 2000px)`;
export const rightClip = () => `polygon(4000px -80px, ${pts.map(([x, y]) => `${x.toFixed(1)}px ${y}px`).join(', ')}, 4000px 2000px)`;
export const tearPath = () => 'M ' + pts.map(([x, y]) => `${x.toFixed(1)} ${y}`).join(' L ');
