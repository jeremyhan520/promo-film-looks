import fs from 'fs';
import os from 'os';
import {Config} from '@remotion/cli/config';

// Where Chrome Headless Shell cannot be downloaded, render with a local Chromium (Edge on Windows).
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
if (fs.existsSync(EDGE)) {
  Config.setBrowserExecutable(EDGE);
  Config.setChromeMode('chrome-for-testing');
}
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
// frosted glass (backdrop-filter) is CPU-heavy: use up to 12 render threads, never more than this machine has
Config.setConcurrency(Math.max(1, Math.min(12, os.cpus().length)));
