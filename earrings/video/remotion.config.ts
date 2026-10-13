import {Config} from '@remotion/cli/config';

// Chromium is pre-installed in this environment; use it instead of downloading one.
Config.setBrowserExecutable(
  process.env.REMOTION_CHROME ?? '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
);
// Master quality: frames are vector-rendered at the output size (use --scale=2 for native 2160x3840).
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(17);
Config.setPixelFormat('yuv420p');
Config.setConcurrency(4);
