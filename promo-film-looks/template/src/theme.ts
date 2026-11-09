// Tokens for the two looks, fonts, easing and time helpers.
// Pick the look with input props: --props=glass.json ({"theme":"glass"}) or --props=aurum.json ({"theme":"aurum"}).
import {loadFont} from '@remotion/fonts';
import type React from 'react';
import {getInputProps, staticFile} from 'remotion';
import {bezier} from './lib/Polish';
import {DURATION_S, FPS} from './config';

export {FPS};
export const DURATION_F = Math.round(DURATION_S * FPS);

const THEME = (getInputProps() as {theme?: string}).theme ?? 'glass';
/** 苹果风格: Apple-style frosted glass, blue / white / a little yellow. Otherwise 华章版 (Aurum Nocturne, midnight + gold). */
export const GL = THEME !== 'aurum' && THEME !== 'lux';

// Aurum Nocturne: midnight lacquer, champagne type, gold-leaf fills, smoked-glass cards.
const AURUM = {
  paper: '#070A12', paper2: '#0B1020', paperHi: '#1A2236',
  ink: '#F3E9D2', ink2: '#CDBF9F', ink3: '#9A8F78',
  rule: 'rgba(226,190,120,0.28)',
  gold: '#D9B26A', goldHi: '#F3D58E',
  night: '#05070D', night2: '#111A33',
  verm: '#D23A2E', shadow: '#000000',
  // surfaces: card = resting panel, fill = emphasised panel (text on it uses onFill*)
  card: 'linear-gradient(155deg, rgba(46,56,82,0.78) 0%, rgba(16,21,35,0.9) 100%)',
  fill: 'linear-gradient(150deg, #F7E3A8 0%, #DDB467 42%, #B0823A 100%)',
  onFill: '#16110A', onFill2: '#5A4420', onFill3: '#2E2311',
  photoBg: '#151a26', fillAccent: '#6B4E1E', fillEdge: '#F3D58E',
  inkA: (a: number) => `rgba(243,233,210,${a})`,
  paperA: (a: number) => `rgba(6,9,16,${a})`,
  goldA: (a: number) => `rgba(217,178,106,${a})`,
  shadowA: (a: number) => `rgba(0,0,0,${Math.min(1, a * 1.8)})`,
  // text placed on cards
  cInk: '#F3E9D2', cInk2: '#CDBF9F', cInk3: '#9A8F78', cRule: 'rgba(226,190,120,0.28)', cGold: '#D9B26A',
  cInkA: (a: number) => `rgba(243,233,210,${a})`,
  veil: (a: number) => `rgba(13,19,32,${a})`,
  glow: 'drop-shadow(0 0 16px rgba(230,180,90,0.26))',
};

// Glass: stage-dependent tokens are CSS variables set per shot (looks.tsx glassVars), so one shot can be white and the
// next blue without touching scene code. Cards are frosted (backdrop-filter added by GLASS_CSS in Film.tsx).
const GLASS: typeof AURUM = {
  paper: 'var(--paper, #0B3FB5)', paper2: '#1A66D2', paperHi: '#4FA6EE',
  ink: 'var(--ink)', ink2: 'var(--ink2)', ink3: 'var(--ink3)',
  rule: 'var(--rule)',
  gold: 'var(--gold)', goldHi: 'var(--goldHi)',
  night: '#1459C4', night2: '#2F8CE8',
  verm: '#D9352B', shadow: '#0A2A66',
  card: 'var(--card)', fill: 'var(--fill)',
  onFill: '#FFFFFF', onFill2: '#CFE3FB', onFill3: '#F2F8FF',
  photoBg: 'var(--pbg)', fillAccent: '#FFD670', fillEdge: 'transparent',
  inkA: (a: number) => `color-mix(in srgb, var(--ink) ${Math.min(100, a * 200)}%, transparent)`,
  paperA: (a: number) => `color-mix(in srgb, var(--paper, #0B3FB5) ${a * 62}%, transparent)`,
  goldA: (a: number) => `color-mix(in srgb, var(--gold) ${a * 100}%, transparent)`,
  shadowA: (a: number) => `rgba(8,50,130,${a})`,
  cInk: '#0B1F44', cInk2: '#33486F', cInk3: '#5B6E92', cRule: 'rgba(11,31,68,0.12)', cGold: '#C98A00',
  cInkA: (a: number) => `rgba(11,31,68,${a})`,
  veil: (a: number) => `rgba(8,40,120,${a * 0.6})`,
  glow: 'var(--glow)',
};

export const C = GL ? GLASS : AURUM;

/** gold-leaf text (aurum) / blue-white sheen text (glass): gradient clipped to glyphs */
export const FOIL: React.CSSProperties = {
  backgroundImage: GL ? 'var(--foil)' : 'linear-gradient(176deg, #FFF3CF 0%, #EFCF84 20%, #C99245 42%, #F8DFA0 60%, #B98236 80%, #E8C47C 100%)',
  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
};

// glass: 优设标题黑 for titles and numerals, Inter + Noto Sans SC for text. aurum: Source Han Serif Heavy + Palatino.
export const F = GL ? {
  serif: '"YouShe", "NotoB", sans-serif',
  sans: '"InterM", "NotoSC", sans-serif',
  latin: '"InterM", "NotoSC", sans-serif',
  num: '"YouShe", "NotoB", sans-serif',
} : {
  serif: '"SHSerif", "Source Han Serif SC", serif',
  sans: '"NotoSC", "Noto Sans SC", sans-serif',
  latin: '"Pala", "Palatino Linotype", Georgia, serif',
  num: '"Pala", "Palatino Linotype", Georgia, serif',
};

// a missing font file must not hang the render: each load is allowed to fail and fall back
const font = (family: string, file: string, extra: {weight?: string; style?: string} = {}) =>
  loadFont({family, url: staticFile(`fonts/${file}`), ...extra}).catch(() => console.warn(`font missing: ${file}`));
let fontsLoaded: Promise<unknown> | null = null;
export const loadFonts = () => {
  fontsLoaded ??= Promise.all([
    font('SHSerif', 'SourceHanSerifCN-Heavy.otf', {weight: '900'}),
    font('NotoSC', 'NotoSansSC-Medium.otf', {weight: '500'}),
    font('NotoB', 'NotoSansSC-Bold.otf'),
    font('Pala', 'Palatino.ttf', {weight: '400'}),
    font('Pala', 'Palatino-Italic.ttf', {weight: '400', style: 'italic'}),
    font('Pala', 'Palatino-Bold.ttf', {weight: '700'}),
    font('InterM', 'InterM.woff2'),
    font('InterB', 'InterB.woff2'),
    font('YouShe', 'YouShe.ttf'),
  ]);
  return fontsLoaded;
};

// Motion personality: calm and premium. Entries quint-out, camera symmetric in-out, no overshoot.
export const EZ = {
  enter: bezier(0.22, 1, 0.36, 1),
  cam: bezier(0.65, 0, 0.35, 1),
  soft: bezier(0.4, 0, 0.2, 1),
  exit: bezier(0.7, 0, 0.84, 0),
  land: bezier(0.3, 1.18, 0.5, 1), // ≤2 % settle
};

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
/** progress of absolute time t (s) through [start, start + dur] */
export const r = (t: number, start: number, dur: number, ease: (x: number) => number = EZ.enter) =>
  ease(clamp01((t - start) / Math.max(1e-6, dur)));
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
export const fr = (s: number) => Math.round(s * FPS);
