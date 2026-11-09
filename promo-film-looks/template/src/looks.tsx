// Grounds, photo frames and light for both looks. Scenes never import this directly: kit.tsx routes to it.
import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, EZ, F, FPS, GL, mix, r} from './theme';
import {BRAND, CHAPTERS, SHOTS, type Head, type Shot, type Tone} from './config';
import {Grain, Vignette} from './lib/Polish';
import {Backstage, Comet, FrontBokeh} from './glassfx';

// effect colours: same layers in both looks, only the light changes
const FX = GL ? {
  key: '205,236,255', keyA: [0.42, 0.14], rim: '255,226,150', rimA: 0.16,
  dust: '255,255,255', speck: '#FFF6D8', speckGlow: 'rgba(255,255,255,0.9)', beam: '255,255,255', beamK: 2.2,
  net: '255,255,255', netK: 2.6, vig: '#0A3F9E', vigS: 0.3, nightVigS: 0.34, grain: 0.05,
  stage: 'linear-gradient(180deg, #1A66D2 0%, #2A83E4 52%, #2279DC 100%)',
  rimGrad: 'var(--rim)', mat: 'var(--mat)', hair: 'var(--hair)', shade: 'var(--shade)', halo: '255,255,255',
  photoTop: 'rgba(255,255,255,0.03)', photoEnd: 'rgba(10,60,150,0.1)', docEdge: 'var(--doc)', sheen: '255,255,255',
  leak1: '255,244,205', leak2: '205,236,255', streak: '255,250,225', streakGlow: 'rgba(255,240,190,0.4)',
  flare: '255,246,214', flareCore: '255,255,250', flareRing: 'rgba(255,240,190,0.8)',
} : {
  key: '214,168,88', keyA: [0.26, 0.08], rim: '58,88,160', rimA: 0.2,
  dust: '255,214,140', speck: '#FFE2A6', speckGlow: 'rgba(255,210,130,0.8)', beam: '255,222,160', beamK: 1,
  net: '217,178,106', netK: 1, vig: '#000000', vigS: 0.62, nightVigS: 0.6, grain: 0.08,
  stage: 'linear-gradient(180deg, #0B1020 0%, #070A12 55%, #04060B 100%)',
  rimGrad: 'linear-gradient(145deg, #F6DFA0 0%, #B98A3E 35%, #7A5A26 55%, #E9C57C 80%, #9C7333 100%)',
  mat: '#080B14', hair: 'rgba(243,213,142,0.45)', shade: 'rgba(0,0,0,0.9)', halo: '217,178,106',
  photoTop: 'rgba(255,214,150,0.05)', photoEnd: 'rgba(5,7,13,0.28)', docEdge: '#E2BF78', sheen: '255,240,205',
  leak1: '255,196,110', leak2: '255,160,80', streak: '255,236,196', streakGlow: 'rgba(255,200,120,0.35)',
  flare: '255,226,170', flareCore: '255,246,220', flareRing: 'rgba(255,214,150,0.8)',
};

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const sceneT = () => useCurrentFrame() / FPS; // scene-local seconds: drift only needs continuity inside a scene

// ───────── per-shot look (config.SHOTS) ─────────
export type Trans = 'iris' | 'slide' | 'zoom' | 'rise';
export type Look = {tone: Tone; head: Head; trans: Trans; last: boolean; key: string; ch: string; idx: number; flat: boolean; ghost: boolean; chips: [number, number][]};
const DEFAULT: Look = {tone: 'blue', head: 'l', trans: 'zoom', last: false, key: '', ch: '0', idx: 0, flat: false, ghost: true, chips: []};
export const lookOf = (name = ''): Look => {
  const i = SHOTS.findIndex((s) => name === s.key || name.startsWith(s.key + ' '));
  if (i < 0) return DEFAULT;
  const s: Shot = SHOTS[i];
  return {tone: s.tone, head: s.head, trans: (['iris', 'slide', 'zoom', 'rise'] as const)[i % 4], last: i === SHOTS.length - 1,
    key: s.key, ch: s.key[0], idx: i, flat: !!s.flat, ghost: s.ghost !== false && !!CHAPTERS[s.key[0]]?.ghost, chips: s.chips ?? []};
};
export const ToneCtx = createContext<Look>(DEFAULT);
export const useLook = () => useContext(ToneCtx);

const GLASS_LIGHT = {
  '--ink': '#0B1F44', '--ink2': '#33486F', '--ink3': '#5B6E92', '--rule': 'rgba(11,31,68,0.12)', '--gold': '#E09A00', '--goldHi': '#F2B21E',
  '--foil': 'linear-gradient(100deg, #0A4FD6 0%, #1E8BFF 55%, #0A4FD6 100%)', '--glow': 'none', '--verm': '#E09A00', '--doc': 'rgba(255,255,255,0.9)', '--shade': 'rgba(10,50,130,0.3)',
  '--fill': 'linear-gradient(150deg, #1E8BFF 0%, #0A4FD6 100%)', '--pbg': '#DCE7F6',
};
export const glassVars = (tone: Tone) => ({
  white: {...GLASS_LIGHT, '--paper': '#F6F8FC', '--card': 'rgba(255,255,255,0.58)'},
  sky: {...GLASS_LIGHT, '--paper': '#E4EEFB', '--card': 'rgba(255,255,255,0.62)'},
  blue: {'--ink': '#FFFFFF', '--ink2': '#E8F1FF', '--ink3': '#CFE0FA', '--rule': 'rgba(255,255,255,0.28)', '--gold': '#FFD670', '--goldHi': '#FFE08A',
    '--foil': 'linear-gradient(100deg, #FFFFFF 0%, #DCEBFF 55%, #FFFFFF 100%)', '--glow': 'none', '--verm': '#FFD670', '--doc': 'rgba(255,255,255,0.9)', '--shade': 'rgba(4,24,90,0.45)',
    '--fill': 'linear-gradient(150deg, #0B3FB5 0%, #082C86 100%)', '--pbg': '#BFD6F5', '--paper': '#0A4FD6', '--card': 'rgba(255,255,255,0.86)'},
}[tone]) as unknown as React.CSSProperties;

// ───────── aurum atmosphere ─────────
/** dust specks + bokeh (foreground, very low opacity) */
export const Dust: React.FC<{t: number; n?: number; bokeh?: number; strength?: number}> = ({t, n = 46, bokeh = 9, strength = 1}) => (
  <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
    {Array.from({length: bokeh}).map((_, i) => {
      const s = 60 + hash(i * 3.1) * 150;
      const x = ((hash(i * 7.7) * 2200 + t * (6 + hash(i) * 10)) % 2200) - 140;
      const y = ((hash(i * 5.3) * 1300 - t * (8 + hash(i * 2) * 10)) % 1300 + 1300) % 1300 - 110;
      const a = (0.05 + hash(i * 9.1) * 0.07) * strength;
      return <div key={`b${i}`} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${FX.dust},${a}) 0%, rgba(${FX.dust},${a * 0.55}) 45%, rgba(${FX.dust},0) 70%)`}} />;
    })}
    {Array.from({length: n}).map((_, i) => {
      const s = 1.4 + hash(i * 1.7) * 2.6;
      const x = (hash(i * 4.9) * 1960 + Math.sin(t * 0.4 + i) * 14) % 1960;
      const y = ((hash(i * 8.3) * 1120 - t * (10 + hash(i * 3) * 22)) % 1120 + 1120) % 1120;
      const tw = 0.45 + 0.55 * Math.abs(Math.sin(t * (0.8 + hash(i) * 1.6) + i));
      return <div key={`d${i}`} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%',
        background: FX.speck, opacity: 0.55 * tw * strength, boxShadow: `0 0 ${(s * 3).toFixed(1)}px ${FX.speckGlow}`}} />;
    })}
  </AbsoluteFill>
);

/** data constellation: faint nodes and edges drifting behind everything */
const NODES = Array.from({length: 34}, (_, i) => [hash(i * 2.3) * 1920, hash(i * 6.1) * 1080] as const);
const EDGES: [number, number][] = [];
NODES.forEach((p, i) => NODES.forEach((q, j) => { if (j > i && Math.hypot(p[0] - q[0], p[1] - q[1]) < 300) EDGES.push([i, j]); }));
const Constellation: React.FC<{t: number}> = ({t}) => {
  const dx = Math.sin(t * 0.05) * 30, dy = Math.cos(t * 0.04) * 18;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, translate: `${dx.toFixed(1)}px ${dy.toFixed(1)}px`}}>
      {EDGES.map(([i, j], k) => <line key={k} x1={NODES[i][0]} y1={NODES[i][1]} x2={NODES[j][0]} y2={NODES[j][1]} stroke={`rgba(${FX.net},${0.07 * FX.netK})`} strokeWidth={1} />)}
      {NODES.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={1.6 + hash(i) * 1.8} fill={`rgba(${FX.net},${(0.16 + 0.12 * Math.abs(Math.sin(t * 0.7 + i))) * Math.min(2, FX.netK)})`} />)}
    </svg>
  );
};

/** slow volumetric beams */
const Beams: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{mixBlendMode: 'screen', overflow: 'hidden'}}>
    {[0, 1, 2].map((i) => {
      const w = 220 + i * 120;
      const x = -300 + i * 760 + Math.sin(t * 0.12 + i * 2) * 120;
      return <div key={i} style={{position: 'absolute', left: x, top: -600, width: w, height: 2400, rotate: '-24deg',
        background: `linear-gradient(90deg, rgba(${FX.beam},0) 0%, rgba(${FX.beam},${(0.045 + i * 0.015) * FX.beamK}) 50%, rgba(${FX.beam},0) 100%)`}} />;
    })}
  </AbsoluteFill>
);

const GoldLine: React.FC<{top?: number; bottom?: number; o?: number}> = ({top, bottom, o = 0.55}) => (
  <div style={{position: 'absolute', left: 96, right: 96, top, bottom, height: 1,
    background: `linear-gradient(90deg, ${C.goldA(0)} 0%, ${C.goldA(o)} 18%, ${C.goldA(o)} 82%, ${C.goldA(0)} 100%)`}}>
    <div style={{position: 'absolute', left: '50%', top: -3.5, width: 7, height: 7, marginLeft: -3.5, rotate: '45deg', background: C.gold, opacity: o * 1.4}} />
  </div>
);

// ───────── glass stage ─────────
// light blobs drifting behind the glass: this is what the frosted panels blur
const BLOBS = [
  {x: 22, y: 18, s: 1150, ax: 90, ay: 60, w: 0.11},
  {x: 84, y: 30, s: 1000, ax: 110, ay: 70, w: 0.09},
  {x: 70, y: 92, s: 1200, ax: 120, ay: 50, w: 0.08},
  {x: 12, y: 86, s: 820, ax: 70, ay: 90, w: 0.13},
];
const GlassStage: React.FC<{t: number; look: Look; children?: React.ReactNode}> = ({t, look, children}) => {
  const blue = look.tone === 'blue';
  const cols = blue ? ['56,170,255,0.75', '255,255,255,0.2', '6,30,130,0.7', '255,200,80,0.3']
    : look.tone === 'sky' ? ['46,139,255,0.5', '255,255,255,0.95', '120,190,255,0.7', '255,205,90,0.42']
    : ['46,139,255,0.34', '255,214,110,0.3', '130,195,255,0.5', '255,255,255,0.95'];
  const turn = look.flat ? undefined
    : {transform: `perspective(2600px) rotateY(${(Math.sin(t * 0.33 + look.idx) * 1.5).toFixed(3)}deg) rotateX(${(Math.cos(t * 0.27 + look.idx) * 0.8).toFixed(3)}deg)`};
  return (
    <AbsoluteFill style={{background: blue ? 'linear-gradient(160deg, #0A58E4 0%, #0B3FB5 100%)' : 'var(--paper)', overflow: 'hidden'}}>
      {BLOBS.map((b, i) => {
        const j = (i + look.idx) % 4;
        const x = (b.x * 19.2 + Math.sin(t * b.w * 3 + i * 2) * b.ax) - b.s / 2 + (look.idx % 5) * 30;
        const y = (b.y * 10.8 + Math.cos(t * b.w * 3 + i) * b.ay) - b.s / 2;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: b.s, height: b.s, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(${cols[j]}) 0%, rgba(${cols[j].replace(/[\d.]+$/, '0')}) 68%)`}} />;
      })}
      <Backstage t={t} look={look} blue={blue} />
      {/* the content plane turns slowly against the fixed background: this is what stops a shot reading as a slide */}
      <AbsoluteFill style={turn}>{children}</AbsoluteFill>
      <FrontBokeh t={t} idx={look.idx} blue={blue} />
      <Grain opacity={0.025} step={2} blend={blue ? 'soft-light' : 'multiply'} />
    </AbsoluteFill>
  );
};

/** Glass shot-to-shot move: the incoming shot arrives by its look's transition, the outgoing one sinks into a rounded card. */
export const GlassShot: React.FC<{frame: number; fade: number; dur: number; look: Look; children: React.ReactNode}> = ({frame, fade, dur, look, children}) => {
  const W = 0.75 * FPS;
  const k = fade <= 0 ? 1 : EZ.cam(Math.min(1, frame / W));
  const e = look.last ? 0 : EZ.soft(Math.min(1, Math.max(0, (frame - (dur * FPS - W)) / W)));
  const p = 1 - k;
  const tr = look.trans;
  const enter: React.CSSProperties = p <= 0 ? {}
    : tr === 'iris' ? {clipPath: `inset(${(p * 48).toFixed(2)}% ${(p * 48).toFixed(2)}% round ${(p * 90).toFixed(1)}px)`, scale: String(1 + p * 0.14)}
    : tr === 'slide' ? {translate: `${(p * 100).toFixed(2)}% 0`}
    : tr === 'rise' ? {translate: `0 ${(p * 100).toFixed(2)}%`}
    : {scale: String(1 + p * 0.32), opacity: Math.min(1, k * 2), filter: `blur(${(p * 18).toFixed(1)}px)`};
  const exit: React.CSSProperties = e <= 0 ? {} : {scale: String(1 - 0.09 * e), borderRadius: 48 * e, overflow: 'hidden'};
  const push = 1 + 0.02 * EZ.cam(Math.min(1, frame / (dur * FPS)));
  return (
    <AbsoluteFill style={{...glassVars(look.tone), ...enter}}>
      <AbsoluteFill style={exit}>
        <AbsoluteFill style={{scale: push.toFixed(5)}}>{children}</AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export type Dir = 'l' | 'r' | 'u' | 'd' | 'fade';

/** Glass photo: rounded, no frame, rises out of depth onto an offset glass plate, one sheen and one light pass round the edge. */
export const GlassPrint: React.FC<{
  t: number; src: string; x: number; y: number; w: number; h: number; t0: number; dur: number; mat: number; zoom: [number, number]; span: number;
  focus: [number, number]; lift: number; dir: Dir; fit?: 'cover' | 'contain'; caption?: React.ReactNode;
}> = ({t, src, x, y, w, h, t0, dur, mat, zoom, span, focus, lift, dir, fit = 'cover', caption}) => {
  const k = r(t, t0, dur * 1.25, EZ.enter);
  if (k <= 0) return null;
  const z = mix(zoom[0], zoom[1], r(t, t0, span, EZ.cam));
  const bleed = mat <= 0;
  const q = 1 - k;
  const dx = dir === 'l' ? -60 : dir === 'r' ? 60 : 0, dy = dir === 'u' ? 70 : dir === 'd' ? -70 : 0;
  const plate = !bleed && mat >= 10 && w >= 300;
  return (
    <div style={{position: 'absolute', left: x, top: y - lift * 0.6, width: w, height: h, opacity: Math.min(1, k * 2.2),
      transform: bleed ? undefined : `perspective(1800px) translate3d(${(dx * q).toFixed(1)}px, ${(dy * q).toFixed(1)}px, ${(-220 * q).toFixed(1)}px) rotateX(${(q * (dy ? 12 : 0) * Math.sign(dy)).toFixed(2)}deg) rotateY(${(q * (dx ? -12 : 0) * Math.sign(dx)).toFixed(2)}deg)`}}>
      {plate && <div style={{position: 'absolute', left: 26 + Math.sin(t * 0.4) * 5, top: 26 + Math.cos(t * 0.35) * 5, width: w, height: h, borderRadius: 34, background: 'rgba(255,255,255,0.3)',
        backdropFilter: 'blur(18px) saturate(160%)', border: '1px solid rgba(255,255,255,0.75)', boxShadow: '0 30px 60px -30px var(--shade)'}} />}
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: bleed ? 0 : 30, background: C.photoBg,
        boxShadow: bleed ? undefined : `0 ${34 + lift}px ${80 + lift * 2}px -30px var(--shade), inset 0 0 0 1px rgba(255,255,255,0.35)`}}>
        <Img src={staticFile(`img/${src}`)} style={{width: '100%', height: '100%', objectFit: fit,
          objectPosition: `${focus[0] * 100}% ${focus[1] * 100}%`, scale: String(z), filter: 'saturate(1.05)'}} />
        <Sheen k={r(t, t0 + dur * 0.6, 1.4, EZ.soft)} a={0.3} />
      </div>
      {!bleed && w >= 200 && <Comet t={t} t0={t0 + dur * 0.5} w={w} h={h} />}
      {caption}
    </div>
  );
};

/** Tilted 3-D photo wall: columns drift in opposite directions while the tiles rise out of depth (glass coda). */
export const PhotoWall: React.FC<{t: number; t0: number; srcs: string[]; children?: React.ReactNode}> = ({t, t0, srcs, children}) => {
  const TW = 470, TH = 320, G = 26, COLS = 6, ROWS = 6;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: 'linear-gradient(160deg, #0A58E4 0%, #0B3FB5 100%)'}}>
      <AbsoluteFill style={{transform: `perspective(1900px) rotateX(24deg) rotateZ(-13deg) scale(${mix(1.5, 1.34, r(t, t0, 5.5, EZ.soft)).toFixed(4)})`, transformOrigin: '50% 50%'}}>
        {Array.from({length: COLS}).map((_, c) => {
          const off = (c % 2 ? 1 : -1) * (t - t0) * 34 - (c % 2 ? 300 : 0);
          return (
            <div key={c} style={{position: 'absolute', left: 960 - (COLS * (TW + G)) / 2 + c * (TW + G), top: -640, translate: `0 ${off.toFixed(1)}px`}}>
              {Array.from({length: ROWS}).map((_, q) => {
                const k = r(t, t0 + ((c * 2 + q) % 7) * 0.07, 1.1, EZ.enter);
                return (
                  <div key={q} style={{width: TW, height: TH, marginBottom: G, borderRadius: 26, overflow: 'hidden', opacity: Math.min(1, k * 2),
                    transform: `translateZ(${((1 - k) * -500).toFixed(1)}px)`, boxShadow: '0 30px 60px -30px rgba(3,20,70,0.6)'}}>
                    <Img src={staticFile(`img/${srcs[(c * 5 + q * 3) % srcs.length]}`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 25%'}} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </AbsoluteFill>
      {children}
    </AbsoluteFill>
  );
};

// ───────── stages ─────────
/** The shot ground. Glass: frosted stage for this shot's tone. Aurum: midnight lacquer with key light, beams, constellation, dust. */
export const Stage: React.FC<{children?: React.ReactNode; light?: {x: number; y: number}}> = ({children, light = {x: 0.3, y: 0.2}}) => {
  const t = sceneT();
  const look = useContext(ToneCtx);
  if (GL) return <GlassStage t={t} look={look}>{children}</GlassStage>;
  const lx = light.x * 100 + Math.sin(t * 0.18) * 5, ly = light.y * 100 + Math.cos(t * 0.15) * 4;
  return (
    <AbsoluteFill style={{background: FX.stage}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 62% 72% at ${lx.toFixed(2)}% ${ly.toFixed(2)}%, rgba(${FX.key},${FX.keyA[0]}) 0%, rgba(${FX.key},${FX.keyA[1]}) 40%, rgba(${FX.key},0) 70%), ` +
        `radial-gradient(ellipse 55% 60% at 88% 96%, rgba(${FX.rim},${FX.rimA}) 0%, rgba(${FX.rim},0) 70%)`}} />
      <Beams t={t} />
      <Constellation t={t} />
      <GoldLine top={62} />
      <GoldLine bottom={62} o={0.35} />
      {BRAND && <div style={{position: 'absolute', left: 96, top: 28, fontFamily: F.latin, fontSize: 20, letterSpacing: '0.32em', color: C.ink3, textTransform: 'uppercase'}}>{BRAND}</div>}
      {children}
      <Dust t={t} />
      <Vignette strength={FX.vigS} color={FX.vig} inner={0.42} />
      <Grain opacity={FX.grain} step={2} blend="soft-light" />
    </AbsoluteFill>
  );
};

/** Night plate: deep ground for full-bleed video / photo moments. */
export const NightStage: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const t = sceneT();
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 70% at 50% 40%, ${C.night2} 0%, ${C.night} 70%)`}}>
      {children}
      {!GL && <Dust t={t} n={40} bokeh={7} strength={1.1} />}
      <Vignette strength={FX.nightVigS} color={FX.vig} inner={0.4} />
      <Grain opacity={0.09} blend="soft-light" />
    </AbsoluteFill>
  );
};

// ───────── aurum frames and light ─────────
const clip = (dir: Dir, k: number) => {
  const p = ((1 - k) * 100).toFixed(2);
  if (dir === 'l') return `inset(0 ${p}% 0 0)`;
  if (dir === 'r') return `inset(0 0 0 ${p}%)`;
  if (dir === 'd') return `inset(0 0 ${p}% 0)`;
  if (dir === 'u') return `inset(${p}% 0 0 0)`;
  return 'none';
};

/** sheen band sweeping once across a surface (screen blend) */
export const Sheen: React.FC<{k: number; a?: number; angle?: number}> = ({k, a = 0.32, angle = 115}) => {
  if (k <= 0 || k >= 1) return null;
  const p = mix(-30, 130, k);
  return <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'screen',
    background: `linear-gradient(${angle}deg, rgba(${FX.sheen},0) ${p - 16}%, rgba(${FX.sheen},${a}) ${p}%, rgba(${FX.sheen},0) ${p + 16}%)`}} />;
};

/** Aurum photo: gold-rimmed lacquer frame, wipe + 3-D tilt-in, slow push, one sheen. mat 0 = frameless. */
export const AurumPrint: React.FC<{
  t: number; src: string; x: number; y: number; w: number; h: number; t0: number;
  dir: Dir; dur: number; mat: number; zoom: [number, number]; span: number;
  focus: [number, number]; lift: number; fit?: 'cover' | 'contain'; caption?: React.ReactNode;
}> = ({t, src, x, y, w, h, t0, dir, dur, mat, zoom, span, focus, lift, fit = 'cover', caption}) => {
  const k = r(t, t0, dur * 1.1, EZ.enter);
  if (k <= 0) return null;
  const z = mix(zoom[0], zoom[1], r(t, t0, span, EZ.cam));
  const op = dir === 'fade' ? k : Math.min(1, k * 2.5);
  const framed = mat > 0;
  const ry = (1 - k) * (dir === 'l' ? 14 : dir === 'r' ? -14 : 0);
  const rx = (1 - k) * (dir === 'u' ? -10 : dir === 'd' ? 10 : 0);
  const inner = framed ? Math.max(6, mat * 0.75) : 0;
  return (
    <div style={{position: 'absolute', left: x, top: y - lift * 0.6, width: w, height: h, opacity: op,
      transform: `perspective(2000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${(1 + lift * 0.0012 + (1 - k) * 0.03).toFixed(4)})`}}>
      <div style={{position: 'absolute', inset: 0, clipPath: clip(dir, k), background: framed ? FX.rimGrad : '#000',
        boxShadow: `0 ${30 + lift}px ${70 + lift * 2}px -26px ${FX.shade}, 0 0 70px -12px rgba(${FX.halo},${framed ? 0.22 : 0.1})`}}>
        <div style={{position: 'absolute', inset: framed ? 2 : 0, background: FX.mat}}>
          <div style={{position: 'absolute', inset: inner, overflow: 'hidden', background: C.photoBg, boxShadow: framed ? `inset 0 0 0 1px ${FX.hair}` : undefined}}>
            <Img src={staticFile(`img/${src}`)} style={{width: '100%', height: '100%', objectFit: fit,
              objectPosition: `${focus[0] * 100}% ${focus[1] * 100}%`, scale: String(z), filter: 'contrast(1.06) saturate(1.06) brightness(0.97)'}} />
            <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${FX.photoTop} 0%, rgba(5,7,13,0) 45%, ${FX.photoEnd} 100%)`}} />
            <Sheen k={r(t, t0 + dur * 0.55, 1.5, EZ.soft)} />
          </div>
        </div>
      </div>
      {caption}
    </div>
  );
};

/** Document page (certificate, journal page, figure): white sheet, hung dead straight, edge + halo, one sheen. */
export const Doc: React.FC<{t: number; src: string; x: number; y: number; w: number; h: number; t0: number; lift: number}> = ({t, src, x, y, w, h, t0, lift}) => {
  const k = r(t, t0, 0.9, EZ.enter);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y + (1 - k) * 40 - lift, width: w, height: h, opacity: k,
      transform: `perspective(1800px) rotateX(${((1 - k) * -12).toFixed(2)}deg)`,
      background: '#fff', border: `1.5px solid ${FX.docEdge}`, borderRadius: GL ? 14 : undefined, overflow: GL ? 'hidden' : undefined,
      boxShadow: `0 ${26 + lift}px ${60 + lift * 2}px -24px ${FX.shade}, 0 0 60px -10px rgba(${FX.halo},${0.2 + lift * 0.02})`}}>
      <Img src={staticFile(`img/${src}`)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      <Sheen k={r(t, t0 + 0.5, 1.4, EZ.soft)} a={0.5} />
    </div>
  );
};

/** Aurum dissolve: warm bloom + anamorphic streak riding each scene entry */
export const LightLeak: React.FC<{k: number; seed: number}> = ({k, seed}) => {
  if (k <= 0.001) return null;
  const x = 12 + hash(seed) * 76, y = 22 + hash(seed * 3.3) * 46;
  const sx = mix(-30, 130, hash(seed * 1.9) > 0.5 ? k : 1 - k);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 48% 60% at ${x}% ${y}%, rgba(${FX.leak1},${0.34 * k}) 0%, rgba(${FX.leak2},${0.12 * k}) 40%, rgba(${FX.leak2},0) 70%)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: `${y}%`, height: 3, marginTop: -1.5, opacity: 0.85 * k,
        background: `linear-gradient(90deg, rgba(${FX.streak},0) ${sx - 40}%, rgba(${FX.streak},0.95) ${sx}%, rgba(${FX.streak},0) ${sx + 40}%)`,
        boxShadow: `0 0 18px 4px ${FX.streakGlow}`}} />
    </AbsoluteFill>
  );
};

/** Aurum hero-title flare (centre glint + long horizontal streak). Renders nothing in glass: no lens flares there. */
export const Flare: React.FC<{t: number; at: number; x?: number; y?: number; dur?: number; a?: number}> = ({t, at, x = 960, y = 540, dur = 1.6, a = 1}) => {
  const u = (t - at) / dur;
  if (GL || u <= 0 || u >= 1) return null;
  const k = Math.sin(Math.PI * u) * a;
  const sx = mix(x - 260, x + 260, EZ.soft(u));
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      <div style={{position: 'absolute', left: sx - 900, top: y - 2, width: 1800, height: 4, opacity: k,
        background: `linear-gradient(90deg, rgba(${FX.flare},0) 0%, rgba(${FX.flare},0.9) 50%, rgba(${FX.flare},0) 100%)`, boxShadow: `0 0 24px 6px ${FX.streakGlow}`}} />
      <div style={{position: 'absolute', left: sx - 110, top: y - 110, width: 220, height: 220, borderRadius: '50%', opacity: k,
        background: `radial-gradient(circle, rgba(${FX.flareCore},0.95) 0%, rgba(${FX.flare},0.45) 18%, rgba(${FX.flare},0) 62%)`}} />
      {[0.35, 0.62, 0.8].map((f, i) => (
        <div key={i} style={{position: 'absolute', left: mix(sx, 1920 - sx, f) - 24 - i * 10, top: mix(y, 1080 - y, f) - 24 - i * 10, width: 48 + i * 20, height: 48 + i * 20,
          borderRadius: '50%', opacity: k * (0.22 - i * 0.05), border: `1.5px solid ${FX.flareRing}`, background: `rgba(${FX.flare},0.08)`}} />
      ))}
    </AbsoluteFill>
  );
};
