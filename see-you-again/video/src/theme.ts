export const W = 1920;
export const H = 1080;
export const FPS = 60;
export const DURATION = 11.667; // song is 11.62 s; hold one beat of silence
export const FRAMES = Math.round(DURATION * FPS);

export const C = {
  sky: '#F49A2C',
  ember: '#E5482A',
  sun: '#FFC531',
  cream: '#FFF1D8',
  hill: '#4F7B3A',
  cap: '#2E6B4C',
  boy: '#163B2B',
  girl: '#4A1630',
  hair: '#2A0C1C',
  skin: '#7A4A2E',
  skin2: '#5E3620',
  lipstick: '#D9262A',
  kraft: '#C4965F',
  ink: '#2B1A12',
  dusk: '#3A1F4D',
  rose: '#E86A8E',
  black: '#120B08',
};

/** Song-time beats of the film (seconds). Word times come from data/words.json. */
export const T = {
  irisEnd: 0.32,
  kissIn: 0.7,
  kiss: 0.96,
  push: 1.4,
  tunnel: 2.62,
  last: 3.2,
  forever: 3.8,
  wipeA: 4.5,
  wipeB: 5.0,
  bout: 6.22,
  go: 6.62,
  war: 6.88,
  pullA: 7.0,
  pullB: 7.85,
  stampIn: 7.75,
  postmark: 8.197,
  see: 10.04,
  again: 10.5,
  dusk: 10.55,
  credit: 10.95,
  end: DURATION,
};

/** Hero hits: camera impulse + flash + chromatic split. */
export const HITS = [
  {t: T.kiss, amp: 1},
  {t: T.forever, amp: 0.8},
  {t: T.war, amp: 1.2},
  {t: T.postmark, amp: 0.9},
  {t: T.again, amp: 0.6},
];
