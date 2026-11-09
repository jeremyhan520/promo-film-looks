// Scene kit: everything scene files use. Each component renders both looks, so scenes stay look-agnostic.
import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, EZ, F, FOIL, FPS, GL, mix, r} from './theme';
import {SpeedBlur, bezier, softShadow} from './lib/Polish';
import {AurumPrint, Doc, Flare, GlassPrint, GlassShot, LightLeak, NightStage, Sheen, Stage, ToneCtx, lookOf, useLook, type Dir} from './looks';

// ───────────── time: scenes read absolute VO seconds ─────────────
const TimeCtx = createContext(0);
/** absolute film time in seconds (VO time), inside any Scene */
export const useT = () => useContext(TimeCtx) + useCurrentFrame() / FPS;

/** glass shots overlap the next one by this much so the outgoing shot can sink while the next arrives */
const TAIL = GL ? 0.45 : 0;
/**
 * A shot on the master timeline at absolute seconds [from, to). Name it "<key> <label>" with a key from config.SHOTS.
 * Overlap neighbours by ~0.35 s (next.from = this.to - 0.35) so the transitions have something to cross.
 */
export const Scene: React.FC<{from: number; to: number; fade?: number; name: string; children: React.ReactNode}> = ({from, to, fade = 0.3, name, children}) => (
  <Sequence name={name} from={Math.round(from * FPS)} durationInFrames={Math.max(1, Math.round((to + TAIL - from) * FPS))}>
    <TimeCtx.Provider value={Math.round(from * FPS) / FPS}>
      <Fader fade={fade} dur={to + TAIL - from} seed={from} name={name}>{children}</Fader>
    </TimeCtx.Provider>
  </Sequence>
);

const Fader: React.FC<{fade: number; dur: number; seed: number; name: string; children: React.ReactNode}> = ({fade, dur, seed, name, children}) => {
  const frame = useCurrentFrame();
  const look = lookOf(name);
  if (GL) return <ToneCtx.Provider value={look}><GlassShot frame={frame} fade={fade} dur={dur} look={look}>{children}</GlassShot></ToneCtx.Provider>;
  // aurum: cross-dissolve, a slow dolly-in over the whole shot, a warm light leak riding the dissolve
  const o = fade <= 0 ? 1 : Math.min(1, frame / (fade * FPS));
  const push = 1 + 0.02 * EZ.cam(Math.min(1, frame / (dur * FPS)));
  const u = frame / (Math.max(fade, 0.3) * FPS * 2.4);
  const leak = fade <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * Math.min(1, u));
  return (
    <ToneCtx.Provider value={look}>
      <AbsoluteFill style={{opacity: EZ.soft(o)}}>
        <AbsoluteFill style={{scale: push.toFixed(5)}}>{children}</AbsoluteFill>
        <LightLeak k={leak} seed={seed} />
      </AbsoluteFill>
    </ToneCtx.Provider>
  );
};

// ───────────── grounds ─────────────
/** The normal shot ground (frosted stage in glass, midnight lacquer in aurum). light = aurum key-light position. */
export const Ground: React.FC<{children?: React.ReactNode; light?: {x: number; y: number}}> = ({children, light}) => <Stage light={light}>{children}</Stage>;
/** Deep ground for full-bleed footage. */
export const Night: React.FC<{children?: React.ReactNode}> = ({children}) => <NightStage>{children}</NightStage>;

// ───────────── surfaces ─────────────
/**
 * Panel. Uses the card / fill tokens, so glass frosts it automatically (GLASS_CSS in Film.tsx matches var(--card) /
 * var(--fill) in the inline style) and aurum gets smoked glass / gold leaf. emphasis = the fill surface (text on it: C.onFill*).
 */
export const Card: React.FC<{style?: React.CSSProperties; emphasis?: boolean; children?: React.ReactNode}> = ({style, emphasis, children}) => (
  <div style={{position: 'absolute', background: emphasis ? C.fill : C.card,
    ...(GL ? {} : {border: `1px solid ${emphasis ? C.goldHi : C.rule}`, boxShadow: softShadow(8, {color: C.shadow, strength: 1.2})}), ...style}}>{children}</div>
);

// ───────────── photos ─────────────
/**
 * Photo. Glass: rounded, frameless, rises out of depth onto a glass plate. Aurum: gold-rimmed lacquer frame, wipe + tilt-in.
 * focus = object-position for the crop (keep heads in frame: check every portrait crop in a still).
 * mat 0 = full-bleed (no frame, no plate). fit 'contain' for figures and diagrams that must stay whole.
 */
export const Print: React.FC<{
  src: string; x: number; y: number; w: number; h: number; t0: number;
  dir?: Dir; dur?: number; mat?: number; zoom?: [number, number]; span?: number;
  focus?: [number, number]; lift?: number; fit?: 'cover' | 'contain'; caption?: string; captionEn?: string;
}> = ({src, x, y, w, h, t0, dir = 'u', dur = 0.9, mat = 14, zoom = [1.0, 1.06], span = 6, focus = [0.5, 0.5], lift = 0, fit, caption, captionEn}) => {
  const t = useT();
  const cap = caption ? <Caption x={0} y={h + 18} t0={t0 + 0.5} zh={caption} en={captionEn} /> : undefined;
  return GL
    ? <GlassPrint t={t} src={src} x={x} y={y} w={w} h={h} t0={t0} dur={dur} mat={mat} zoom={zoom} span={span} focus={focus} lift={lift} dir={dir} fit={fit} caption={cap} />
    : <AurumPrint t={t} src={src} x={x} y={y} w={w} h={h} t0={t0} dur={dur} mat={mat} zoom={zoom} span={span} focus={focus} lift={lift} dir={dir} fit={fit} caption={cap} />;
};

/** Whole document page (certificate, journal page): white sheet, always straight. Size the box to the page's true aspect. */
export const DocPage: React.FC<{src: string; x: number; y: number; w: number; h: number; t0: number; lift?: number}> = ({src, x, y, w, h, t0, lift = 0}) => {
  const t = useT();
  return <Doc t={t} src={src} x={x} y={y} w={w} h={h} t0={t0} lift={lift} />;
};

export const Caption: React.FC<{x: number; y: number; t0: number; zh: string; en?: string; align?: 'left' | 'center'}> = ({x, y, t0, zh, en, align = 'left'}) => {
  const t = useT();
  const k = r(t, t0, 0.7);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: k, translate: `0 ${(1 - k) * 10}px`, textAlign: align, width: align === 'center' ? '100%' : undefined}}>
      <div style={{fontFamily: F.sans, fontSize: 30, letterSpacing: '0.12em', color: C.ink}}>{zh}</div>
      {en && <div style={{fontFamily: F.latin, fontSize: GL ? 24 : 19, letterSpacing: '0.24em', marginTop: 6, color: C.ink3, textTransform: 'uppercase'}}>{en}</div>}
    </div>
  );
};

// ───────────── type ─────────────
/**
 * Title type. Glass: each glyph rises out of its own mask. Aurum: glyphs rise out of focus; display sizes (≥56) in the
 * ink colour become gold leaf with one shimmer pass.
 */
export const Rise: React.FC<{text: string; t0: number; size: number; color?: string; font?: string; each?: number; gap?: number;
  dy?: number; blur?: number; tracking?: string; split?: 'char' | 'word'; style?: React.CSSProperties; accent?: number[]; accentColor?: string}> = ({
  text, t0, size, color = C.ink, font = F.serif, each = 0.9, gap = 0.08, dy, blur = 14, tracking = '0.04em', split = 'char', style, accent = [], accentColor = C.gold}) => {
  const t = useT();
  const units = split === 'char' ? Array.from(text) : text.split(' ');
  const foil = size >= 56 && color === C.ink;
  return (
    <div style={{fontFamily: font, fontSize: size, color, letterSpacing: tracking, lineHeight: 1.12, whiteSpace: 'nowrap', ...style}}>
      {units.map((u, i) => {
        const p = r(t, t0 + i * gap, each);
        const acc = accent.includes(i);
        if (GL) return (
          <span key={i} style={{display: 'inline-block', overflowX: 'visible', overflowY: 'clip', verticalAlign: 'top', paddingBottom: '0.12em', marginRight: split === 'word' ? '0.3em' : undefined}}>
            <span style={{display: 'inline-block', translate: `0 ${((1 - p) * 112).toFixed(2)}%`, color: acc ? accentColor : undefined,
              ...(foil && !acc ? {...FOIL, backgroundSize: '220% 100%', backgroundPosition: `${mix(100, 0, r(t, t0 + i * gap + 0.3, 1.8, EZ.soft)).toFixed(1)}% 0`} : {})}}>{u === ' ' ? ' ' : u}</span>
          </span>
        );
        return (
          <span key={i} style={{display: 'inline-block', opacity: p, translate: `0 ${((1 - p) * (dy ?? size * 0.38)).toFixed(2)}px`,
            ...(foil && !acc ? {...FOIL, backgroundSize: '100% 230%', backgroundPosition: `0 ${mix(100, 38, r(t, t0 + i * gap + each * 0.45, 1.8, EZ.soft)).toFixed(1)}%`} : {}),
            filter: p >= 0.999 ? (size >= 56 ? C.glow : undefined) : `blur(${((1 - p) * blur).toFixed(2)}px)`,
            color: acc ? accentColor : undefined, marginRight: split === 'word' ? '0.3em' : undefined}}>{u === ' ' ? ' ' : u}</span>
        );
      })}
    </div>
  );
};

/** English companion line. Aurum: letter-spaced small caps that settle. Glass: plain sentence case, larger. */
export const En: React.FC<{text: string; t0: number; size?: number; color?: string; style?: React.CSSProperties}> = ({text, t0, size = 24, color = C.ink3, style}) => {
  const t = useT();
  const k = r(t, t0, 0.9);
  return (
    <div style={{fontFamily: F.latin, fontSize: GL ? size * 1.3 : size, letterSpacing: `${mix(0.5, 0.26, k).toFixed(3)}em`, color, textTransform: 'uppercase',
      opacity: k, whiteSpace: 'nowrap', ...style}}>{text}</div>
  );
};

/** Hairline rule drawn from one end. */
export const Rule: React.FC<{x: number; y: number; w: number; t0: number; color?: string; h?: number; from?: 'left' | 'right' | 'center'; dur?: number}> = ({x, y, w, t0, color = C.gold, h = 2, from = 'left', dur = 0.8}) => {
  const t = useT();
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: color, scale: `${r(t, t0, dur, EZ.soft)} 1`,
    transformOrigin: from === 'left' ? '0 50%' : from === 'right' ? '100% 50%' : '50% 50%'}} />;
};

/**
 * Shot heading. Aurum: gold kicker (num) + gold-leaf title + English, top-left. Glass: no kicker, title ×1.22 in
 * 优设标题黑, English line, yellow→blue bar; placed left / centre / right by the shot's head in config.SHOTS.
 * t1 = when it leaves (fades over 0.35 s before t1).
 */
export const Heading: React.FC<{num?: string; zh: string; en: string; t0: number; t1?: number; x?: number; y?: number; size?: number}> = ({num, zh, en, t0, t1 = 9999, x = 120, y = 104, size = 84}) => {
  const t = useT();
  const head = useLook().head;
  if (t > t1) return null;
  const out = 1 - r(t, t1 - 0.35, 0.35, EZ.exit);
  const place: React.CSSProperties = !GL || head === 'l' ? {left: x} : head === 'r' ? {right: 120, textAlign: 'right'} : {left: 0, right: 0, textAlign: 'center'};
  return (
    <div style={{position: 'absolute', top: y, opacity: out, ...place}}>
      {num && !GL && <En text={num} t0={t0} size={22} color={C.gold} />}
      <Rise text={zh} t0={t0 + 0.1} size={GL ? size * 1.22 : size} style={{marginTop: 10}} />
      <En text={en} t0={t0 + 0.45} size={21} color={C.ink3} style={{marginTop: 14}} />
      {GL && <div style={{width: 92 * r(t, t0 + 0.5, 0.8, EZ.soft), height: 6, borderRadius: 3, marginTop: 16, background: 'linear-gradient(90deg, #FFC83D 0%, #2E8BFF 100%)',
        marginLeft: head === 'l' ? 0 : 'auto', marginRight: head === 'c' ? 'auto' : 0}} />}
    </div>
  );
};

const press = bezier(0.2, 0.75, 0.3, 1);
/** Chapter card: numeral, one line pressed in glyph by glyph, rule, English. */
export const ChapterCard: React.FC<{numeral: string; zh: string; en: string; t0: number}> = ({numeral, zh, en, t0}) => {
  const t = useT();
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div style={{textAlign: 'center'}}>
        <div style={{fontFamily: F.num, fontSize: GL ? 64 : 30, letterSpacing: '0.5em', color: C.gold, opacity: r(t, t0, 0.6)}}>{numeral}</div>
        <div style={{fontFamily: F.serif, fontSize: GL ? 136 : 112, color: C.ink, letterSpacing: '0.12em', marginTop: 26, display: 'flex', justifyContent: 'center'}}>
          {Array.from(zh).map((ch, i) => {
            const p = r(t, t0 + 0.16 + i * 0.16, 0.36, press);
            return <span key={i} style={{display: 'inline-block', opacity: p, scale: String(1.28 - 0.28 * p), filter: p >= 0.999 ? undefined : `blur(${((1 - p) * 7).toFixed(2)}px)`,
              ...(GL ? {} : {...FOIL, backgroundSize: '100% 230%', backgroundPosition: '0 38%'})}}>{ch}</span>;
          })}
        </div>
        <div style={{height: GL ? 6 : 2, borderRadius: 3, width: 220, margin: '36px auto 0', scale: `${r(t, t0 + 0.64, 0.72, EZ.soft)} 1`,
          background: GL ? 'linear-gradient(90deg, #FFC83D 0%, #2E8BFF 100%)' : C.gold}} />
        <En text={en} t0={t0 + 0.5} size={24} color={C.ink3} style={{marginTop: 26}} />
      </div>
    </AbsoluteFill>
  );
};

// ───────────── numbers ─────────────
/** a number that counts up over [t0, t0 + dur]: use for ordinary figures */
export const useCount = (to: number, t0: number, dur = 1.1) => Math.round(to * r(useT(), t0, dur, EZ.soft));

/**
 * Headline figure (100 %, No. 1 ...). Never counted up from zero (a long climb from 0 reads as a loading bar):
 * it lands whole on the spoken word, scaling down from 1.55 with a glow that settles and two rings behind it.
 */
export const StatHit: React.FC<{value: string; unit?: string; at: number; size?: number; x: number; y: number}> = ({value, unit, at, size = 230, x, y}) => {
  const t = useT();
  const land = r(t, at, 0.55, EZ.enter);
  const glow = mix(34, 10, r(t, at, 1.2, EZ.soft));
  return (
    <div style={{position: 'absolute', left: x, top: y}}>
      {[0, 1].map((i) => {
        const u = r(t, at + i * 0.16, 1.1, EZ.soft);
        return u > 0 && u < 1 && <div key={i} style={{position: 'absolute', left: size * 0.75 - 200, top: size * 0.5 - 200, width: 400, height: 400, borderRadius: '50%',
          border: `${3 - i}px solid ${C.gold}`, opacity: (1 - u) * 0.8, scale: String(mix(0.3, 1.5 + i * 0.3, u))}} />;
      })}
      <div style={{fontFamily: F.num, fontSize: size, lineHeight: 1, color: C.ink, whiteSpace: 'nowrap', fontVariantNumeric: 'lining-nums tabular-nums',
        opacity: r(t, at, 0.12), scale: String(mix(1.55, 1, land)), transformOrigin: '0% 60%',
        ...FOIL, backgroundSize: '100% 230%', backgroundPosition: `0 ${mix(100, 38, r(t, at + 0.1, 1.2, EZ.soft)).toFixed(1)}%`,
        filter: `drop-shadow(0 0 ${glow.toFixed(1)}px ${C.goldA(0.75)})`}}>
        {value}{unit && <span style={{fontSize: size * 0.35, marginLeft: 12, color: C.gold, WebkitTextFillColor: C.gold}}>{unit}</span>}
      </div>
    </div>
  );
};

// ───────────── openers ─────────────
/**
 * Opening title over footage. Glass: the footage shows only through the giant type, then the type rushes past the
 * camera (exitAt) and the footage fills the frame. Aurum: footage under a midnight veil, gold-leaf lines and a flare.
 * children = the footage layer (an <Img>/<OffthreadVideo> filling the frame).
 */
export const MaskTitle: React.FC<{lines: {text: string; t0: number}[]; exitAt: number; size?: number; children: React.ReactNode}> = ({lines, exitAt, size = 250, children}) => {
  const t = useT();
  if (!GL) return (
    <AbsoluteFill style={{background: '#05070D'}}>
      {children}
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.veil(0.55)} 0%, ${C.veil(0.35)} 45%, ${C.veil(0.7)} 100%)`}} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{textAlign: 'center'}}>{lines.map((l) => <Rise key={l.text} text={l.text} t0={l.t0} size={size * 0.6} tracking="0.12em" gap={0.12} />)}</div>
      </AbsoluteFill>
      <Flare t={t} at={lines[0]?.t0 + 0.6} y={540} />
    </AbsoluteFill>
  );
  const u = Math.min(1, Math.max(0, (t - exitAt) / 0.95));
  const S = Math.pow(11, Math.pow(u, 1.8));
  return (
    <AbsoluteFill style={{background: '#06122E'}}>
      {children}
      {u < 1 && (
        <AbsoluteFill style={{background: '#fff', mixBlendMode: 'screen', scale: S.toFixed(4), transformOrigin: '50% 47%', opacity: 1 - r(t, exitAt + 0.52, 0.42, EZ.soft),
          justifyContent: 'center', alignItems: 'center'}}>
          <div style={{textAlign: 'center', translate: '0 -30px'}}>
            {lines.map((l) => <Rise key={l.text} text={l.text} t0={l.t0} size={size} color="#000" tracking="0" gap={0.1} each={1.0} />)}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ───────────── near-full-screen card rail ─────────────
export type RailItem = {at: number; render: (t: number, i: number) => React.ReactNode};
const CW = 1760, CH = 840, CGAP = 1880;
/**
 * One big card per item (CW×CH, near full screen) so dense figures stay readable. The rail swings card to card in
 * [at − 0.7, at + 0.05] with a cover-flow turn; from overviewAt the last card shrinks into a grid and the rest drop in.
 * introAt: the first card waits at 0.6× below the shot title and grows to full size from this time.
 */
export const CardRail: React.FC<{items: RailItem[]; introAt?: number; overviewAt?: number}> = ({items, introAt, overviewAt = 9999}) => {
  const t = useT();
  const rail = (tt: number) => items.slice(1).reduce((x, it) => x + CGAP * EZ.cam(Math.min(1, Math.max(0, (tt - (it.at - 0.7)) / 0.75))), 0);
  const drive = rail(t);
  const v = (rail(t + 0.02) - rail(t - 0.02)) / 0.04 / FPS;
  const ov = r(t, overviewAt, 1.3, EZ.cam);
  const zin = introAt === undefined ? 1 : r(t, introAt, 0.85, EZ.cam);
  // overview grid: one row up to 3, otherwise two rows
  const n = items.length, rows = n <= 3 ? 1 : 2, per = Math.ceil(n / rows);
  const s0 = Math.min(0.3, 1700 / (per * (CW + 120)));
  const slot = (i: number) => {
    const row = Math.floor(i / per), inRow = row === rows - 1 ? n - per * (rows - 1) : per, col = i - row * per;
    return [960 + (col - (inRow - 1) / 2) * (CW * s0 + 36), 600 + (row - (rows - 1) / 2) * (CH * s0 + 44)];
  };
  return (
    <SpeedBlur vx={-v * 0.5} amount={0.1} max={6}>
      {items.map((it, i) => {
        const off = (i * CGAP - drive) / CGAP;
        if (Math.abs(off) > 1.2 && ov === 0) return null;
        const o = Math.max(-1, Math.min(1, off));
        const rs = mix(0.6, 1, zin) * (1 - 0.08 * Math.abs(o));
        let cx = 960 + off * CGAP, cy = mix(650, 530, zin), s = rs, rot = o * -30, op = 1, lift = 0;
        if (ov > 0) {
          const [gx, gy] = slot(i);
          if (i === n - 1) { cx = mix(cx, gx, ov); cy = mix(cy, gy, ov); s = mix(rs, s0, ov); rot *= 1 - ov; }
          else { const p = r(t, overviewAt + 0.85 + i * 0.1, 0.6, EZ.soft); cx = gx; cy = gy; s = mix(s0 * 1.13, s0, p); rot = 0; op = p; lift = (1 - p) * 40; }
        }
        return (
          <div key={i} style={{position: 'absolute', left: cx - CW / 2, top: cy - CH / 2 + lift, width: CW, height: CH, opacity: op, borderRadius: 44,
            transform: `perspective(2400px) scale(${s.toFixed(4)}) rotateY(${rot.toFixed(2)}deg)`, boxShadow: '0 40px 90px -40px var(--shade, rgba(0,0,0,0.8))'}}>
            {it.render(t, i)}
          </div>
        );
      })}
    </SpeedBlur>
  );
};

/** Default rail card: numeral, label + name, two-line title, English, progress dots on the left; the figure large on the right. */
export const FeatureCard: React.FC<{t: number; i: number; n: number; at: number; numeral: string; label?: string; name?: string; title: [string, string]; en?: string; fig: string}> = (
  {t, i, n, at, numeral, label, name, title, en, fig}) => {
  const land = r(t, at - 0.35, 0.9, EZ.soft);
  return (
    <div style={{position: 'absolute', inset: 0, borderRadius: 44, background: C.fill, overflow: 'hidden'}}>
      <div style={{position: 'absolute', right: -160, top: -220, width: 760, height: 760, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,255,255,0.16), rgba(255,255,255,0))'}} />
      <div style={{position: 'absolute', left: 64, top: 40, fontFamily: F.num, fontSize: 168, lineHeight: 1, color: C.fillAccent}}>{numeral}</div>
      {name && <div style={{position: 'absolute', left: 68, top: 250}}>
        {label && <div style={{fontFamily: F.sans, fontSize: 22, color: C.onFill2}}>{label}</div>}
        <div style={{fontFamily: F.serif, fontSize: 54, color: C.onFill, marginTop: 8}}>{name}</div>
      </div>}
      <div style={{position: 'absolute', left: 68, top: 430, width: 440, fontFamily: F.serif, fontSize: 60, lineHeight: 1.28, color: C.onFill}}>{title[0]}<br />{title[1]}</div>
      <div style={{position: 'absolute', left: 68, top: 612, width: 96 * land, height: 6, borderRadius: 3, background: GL ? 'linear-gradient(90deg, #FFD670 0%, #8CC2FF 100%)' : C.onFill2}} />
      {en && <div style={{position: 'absolute', left: 68, width: 420, bottom: 110, fontFamily: F.latin, fontSize: 19, lineHeight: 1.5, color: C.onFill2}}>{en}</div>}
      <div style={{position: 'absolute', left: 68, bottom: 60, display: 'flex', gap: 10}}>
        {Array.from({length: n}).map((_, j) => <div key={j} style={{width: j === i ? 40 : 10, height: 10, borderRadius: 5, background: j === i ? (GL ? '#FFD670' : C.onFill) : (GL ? 'rgba(255,255,255,0.35)' : 'rgba(22,17,10,0.25)')}} />)}
      </div>
      <div style={{position: 'absolute', left: 560, right: 40, top: 40, bottom: 40, borderRadius: 28, background: '#FFFFFF', padding: 22, boxSizing: 'border-box',
        boxShadow: 'inset 0 0 0 1px rgba(11,31,68,0.08), 0 24px 50px -30px rgba(4,24,90,0.6)', overflow: 'hidden'}}>
        <Img src={staticFile(`img/${fig}`)} style={{width: '100%', height: '100%', objectFit: 'contain', opacity: mix(0.25, 1, land), scale: String(mix(1.035, 1, land))}} />
        <Sheen k={r(t, at + 0.2, 1.3, EZ.soft)} a={0.22} />
      </div>
    </div>
  );
};

export {C, F, EZ, r, mix, GL, Flare};
