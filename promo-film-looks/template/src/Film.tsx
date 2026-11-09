// Master timeline: scenes + VO + SFX. No BGM and no burned-in subtitles unless the client asks (they usually add their own).
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, DURATION_F, GL} from './theme';
import {Demo} from './scenes/Demo';

// glass: frosted surfaces are matched by the token in their inline style, so scene code stays look-agnostic.
// A panel gets frosted by using background C.card (var(--card)) or C.fill (var(--fill)); radius 26 unless it sets its own.
const GLASS_CSS = `
*{letter-spacing:0.004em !important;text-transform:none !important;}
[style*="var(--card)"]{backdrop-filter:blur(30px) saturate(170%);border:1px solid rgba(255,255,255,0.7) !important;
  box-shadow:0 28px 64px -28px var(--shade),inset 0 1px 0 rgba(255,255,255,0.8) !important;}
[style*="var(--fill)"]{border:none !important;box-shadow:0 28px 64px -24px var(--shade) !important;}
[style*="var(--card)"]:not([style*="border-radius"]),[style*="var(--fill)"]:not([style*="border-radius"]){border-radius:26px;}
[style*="var(--card)"] > div[style*="overflow: hidden"]:not([style*="border-radius"]),[style*="var(--pbg)"]:not([style*="border-radius"]){border-radius:18px !important;}
[style*="color-mix(in srgb, var(--paper"]{backdrop-filter:blur(34px) saturate(170%);}
`;

const EndFade: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [DURATION_F - 20, DURATION_F - 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: '#000', opacity: o, pointerEvents: 'none'}} />;
};

export const Film: React.FC = () => (
  <AbsoluteFill style={{background: C.paper}}>
    {GL && <style>{GLASS_CSS}</style>}
    <Demo />
    {/* VO drives all timing:  <Audio name="VO" src={staticFile('audio/vo.mp3')} />  (import Audio from '@remotion/media') */}
    {/* SFX: see references/pipeline.md (cue table, one <Audio> per cue) */}
    <EndFade />
  </AbsoluteFill>
);
