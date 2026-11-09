import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {Film} from './Film';
import {COMP_ID, HEIGHT, WIDTH} from './config';
import {DURATION_F, FPS, loadFonts} from './theme';

const handle = delayRender('Loading fonts');
loadFonts().then(() => continueRender(handle));

export const RemotionRoot: React.FC = () => (
  <Composition id={COMP_ID} component={Film} durationInFrames={DURATION_F} fps={FPS} width={WIDTH} height={HEIGHT} />
);
