import beat from '../data/beat-map.json';

const kicks: number[] = beat.kicks;
const energy: number[] = beat.energy;

/** Envelope of the most recent kick: 1 at the hit, decaying with tau seconds. */
export const kickEnv = (t: number, tau = 0.12) => {
  let last = -1;
  for (const k of kicks) {
    if (k <= t) last = k;
    else break;
  }
  if (last < 0) return 0;
  return Math.exp(-(t - last) / tau);
};

export const energyAt = (t: number) => {
  const i = t * beat.energy_hz;
  const a = Math.floor(i);
  const f = i - a;
  const e0 = energy[Math.max(0, Math.min(energy.length - 1, a))];
  const e1 = energy[Math.max(0, Math.min(energy.length - 1, a + 1))];
  return e0 + (e1 - e0) * f;
};
