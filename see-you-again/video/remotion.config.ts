import {Config} from '@remotion/cli/config';

// Chromium is pre-installed in this environment; use it instead of downloading one.
Config.setBrowserExecutable(
  process.env.REMOTION_CHROME ?? '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
);
// Author at 1920×1080, render with --scale=2 → native 3840×2160 (vectors and text are re-rasterised, not upscaled).
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(96);
Config.setCodec('h264');
Config.setCrf(14);
Config.setPixelFormat('yuv420p');
Config.setX264Preset('slow');
Config.setAudioBitrate('320k');
Config.setConcurrency(4);
Config.setChromiumOpenGlRenderer('swangle');
