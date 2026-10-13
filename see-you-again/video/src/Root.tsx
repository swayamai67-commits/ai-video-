import {Composition} from 'remotion';
import './fonts';
import {Film} from './Film';
import {FPS, FRAMES, H, W} from './theme';

export const Root = () => (
  <>
    {/* 1920×1080 design space; `--scale=2` renders it natively at 3840×2160 */}
    <Composition id="SeeYouAgain" component={Film} durationInFrames={FRAMES} fps={FPS} width={W} height={H} />
  </>
);
