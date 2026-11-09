// Glass detail layers: per-chapter live data graphics, frosted discs and slabs, formula chips, ghost type, front bokeh.
// Added because the bare frosted look read "like a slide deck"; every shot carries several slow layers behind its content.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EZ, F, mix} from './theme';
import {CHAPTERS, FORMULAS, type Motif} from './config';
import type {Look} from './looks';

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const c01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const grow = (t: number, d = 0, dur = 2.4) => EZ.soft(c01((t - d) / dur));
type P = {t: number; col: string; acc: string};
const dash = (p: number) => ({pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - p});
const poly = (f: (x: number) => number, step = 12) => {
  let d = '';
  for (let x = -20; x <= 1940; x += step) d += `${d ? 'L' : 'M'}${x} ${f(x).toFixed(1)}`;
  return d;
};

// bell: normal curves over sampled sticks
const Bell: React.FC<P> = ({t, col, acc}) => {
  const base = 980;
  const G = [{m: 1240, s: 200, h: 560}, {m: 1600, s: 120, h: 340}, {m: 760, s: 270, h: 300}];
  const g = (x: number, q: typeof G[0], dm: number) => q.h * Math.exp(-((x - q.m - dm) ** 2) / (2 * q.s * q.s));
  const p = grow(t, 0.1);
  const dm = Math.sin(t * 0.3) * 40;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 80}).map((_, i) => {
        const x = i * 24 + 8, h = g(x, G[0], dm) * p;
        return h > 2 && <line key={i} x1={x} x2={x} y1={base} y2={base - h} stroke={`rgba(${i % 8 === 3 ? acc : col},0.26)`} strokeWidth={2} />;
      })}
      {G.map((q, i) => <path key={i} d={poly((x) => base - g(x, q, dm * (i ? -0.6 : 1)))} fill="none" stroke={`rgba(${i ? col : acc},${i ? 0.42 : 0.8})`} strokeWidth={i ? 1.6 : 2.6} {...dash(grow(t, 0.1 + i * 0.25))} />)}
      <line x1={0} x2={1920} y1={base} y2={base} stroke={`rgba(${col},0.35)`} strokeWidth={1.5} {...dash(p)} />
      <line x1={G[0].m + dm} x2={G[0].m + dm} y1={base} y2={base - G[0].h * p} stroke={`rgba(${acc},0.7)`} strokeWidth={1.5} strokeDasharray="4 8" />
      <circle cx={G[0].m + dm} cy={base - G[0].h * p} r={7} fill={`rgba(${acc},${p})`} />
    </svg>
  );
};

// scatter: points, regression line, confidence band
const SC = Array.from({length: 130}, (_, i) => {
  const x = hash(i * 2.3) * 1960 - 20;
  const n = (hash(i * 5.1) + hash(i * 7.7) + hash(i * 9.3) - 1.5) * 210;
  return [x, 930 - x * 0.37 + n, 2.5 + hash(i) * 4.5] as const;
});
const Scatter: React.FC<P> = ({t, col, acc}) => {
  const p = grow(t, 0.5, 2.2);
  const y = (x: number) => 930 - x * 0.37;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      <path d={`M0 ${y(0) - 86} L1920 ${y(1920) - 54} L1920 ${y(1920) + 54} L0 ${y(0) + 86} Z`} fill={`rgba(${col},${0.08 * p})`} />
      {SC.map(([x, yy, s], i) => {
        const k = EZ.enter(c01((t - hash(i * 3.1) * 1.6) / 0.5));
        return <circle key={i} cx={x} cy={yy + Math.sin(t * 0.6 + i) * 3} r={s * k} fill={`rgba(${i % 9 === 0 ? acc : col},${i % 9 === 0 ? 0.85 : 0.42})`} />;
      })}
      <line x1={0} x2={1920} y1={y(0)} y2={y(1920)} stroke={`rgba(${acc},0.85)`} strokeWidth={2.6} {...dash(p)} />
    </svg>
  );
};

// network: graph with signals travelling the edges
const ND = Array.from({length: 48}, (_, i) => [hash(i * 2.9) * 1920, hash(i * 6.7) * 1080, hash(i * 1.3)] as const);
const ED: [number, number][] = [];
ND.forEach((a, i) => ND.forEach((b, j) => { if (j > i && Math.hypot(a[0] - b[0], a[1] - b[1]) < 290) ED.push([i, j]); }));
const Network: React.FC<P> = ({t, col, acc}) => {
  const dx = Math.sin(t * 0.12) * 26, dy = Math.cos(t * 0.1) * 16;
  const p = grow(t, 0, 1.8);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, translate: `${dx.toFixed(1)}px ${dy.toFixed(1)}px`}}>
      {ED.map(([i, j], k) => <line key={k} x1={ND[i][0]} y1={ND[i][1]} x2={mix(ND[i][0], ND[j][0], p)} y2={mix(ND[i][1], ND[j][1], p)} stroke={`rgba(${col},0.24)`} strokeWidth={1.2} />)}
      {ND.map((n, i) => <circle key={i} cx={n[0]} cy={n[1]} r={(3 + n[2] * 6) * p} fill={`rgba(${col},0.6)`} />)}
      {ND.filter((n) => n[2] > 0.78).map((n, i) => <circle key={i} cx={n[0]} cy={n[1]} r={(16 + 10 * ((t * 0.5 + i * 0.2) % 1)) * p} fill="none" stroke={`rgba(${acc},${0.7 * (1 - ((t * 0.5 + i * 0.2) % 1))})`} strokeWidth={1.6} />)}
      {ED.filter((_, k) => k % 4 === 0).map(([i, j], k) => {
        const u = (t * 0.32 + hash(k)) % 1;
        return <circle key={k} cx={mix(ND[i][0], ND[j][0], u)} cy={mix(ND[i][1], ND[j][1], u)} r={3.4} fill={`rgba(${acc},${p})`} />;
      })}
    </svg>
  );
};

// bars: histogram rising under a growth curve
const Bars: React.FC<P> = ({t, col, acc}) => {
  const n = 60, w = 1920 / n, base = 1000;
  const f = (i: number) => (0.12 + 0.88 * Math.pow(i / (n - 1), 2.2)) * 640 * (0.84 + 0.16 * hash(i * 3.7));
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: n}).map((_, i) => {
        const k = EZ.enter(c01((t - i * 0.022) / 1.1));
        const h = f(i) * k * (1 + 0.025 * Math.sin(t * 1.1 + i * 0.5));
        const a = i % 7 === 4;
        return <rect key={i} x={i * w + 5} y={base - h} width={w - 10} height={h} rx={5} fill={`rgba(${a ? acc : col},${a ? 0.5 : 0.16})`} />;
      })}
      <path d={poly((x) => base - 40 - (0.12 + 0.88 * Math.pow(c01(x / 1920), 2.2)) * 680)} fill="none" stroke={`rgba(${acc},0.85)`} strokeWidth={2.6} {...dash(grow(t, 0.4, 2))} />
    </svg>
  );
};

// contour: contour map of a likelihood surface
const Contour: React.FC<P> = ({t, col, acc}) => {
  const ring = (cx: number, cy: number, R: number, i: number) => {
    let d = '';
    for (let k = 0; k <= 96; k++) {
      const a = (k / 96) * Math.PI * 2;
      const q = R * (1 + 0.11 * Math.sin(3 * a + i * 0.4 + t * 0.12) + 0.05 * Math.sin(7 * a - i * 0.7));
      d += `${k ? 'L' : 'M'}${(cx + Math.cos(a) * q * 1.3).toFixed(1)} ${(cy + Math.sin(a) * q).toFixed(1)}`;
    }
    return d + 'Z';
  };
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 13}).map((_, i) => <path key={i} d={ring(1450, 660, 60 + i * 66, i)} fill="none" stroke={`rgba(${i % 4 === 1 ? acc : col},${i % 4 === 1 ? 0.7 : 0.3})`} strokeWidth={i % 4 === 1 ? 2 : 1.3} {...dash(grow(t, i * 0.07, 1.5))} />)}
      {Array.from({length: 6}).map((_, i) => <path key={i} d={ring(180, 260, 50 + i * 52, i + 3)} fill="none" stroke={`rgba(${col},0.22)`} strokeWidth={1.2} {...dash(grow(t, 0.3 + i * 0.07, 1.5))} />)}
      <circle cx={1450} cy={660} r={7} fill={`rgba(${acc},${grow(t, 0.8, 0.6)})`} />
    </svg>
  );
};

// orbits: ellipses with bodies (collaboration, exchange)
const Orbits: React.FC<P> = ({t, col, acc}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
    <g transform="rotate(-13 960 580)">
      {[300, 480, 680, 900, 1140].map((rx, i) => {
        const ry = rx * 0.4;
        return (
          <React.Fragment key={rx}>
            <ellipse cx={960} cy={580} rx={rx} ry={ry} fill="none" stroke={`rgba(${col},0.3)`} strokeWidth={1.4} {...dash(grow(t, i * 0.12, 1.6))} />
            {[0, 1, 2].map((q) => {
              const a = t * (0.34 - i * 0.04) * (i % 2 ? -1 : 1) + q * 2.1 + i;
              return <circle key={q} cx={960 + Math.cos(a) * rx} cy={580 + Math.sin(a) * ry} r={q ? 5 : 9} fill={`rgba(${q ? col : acc},${(q ? 0.65 : 0.95) * grow(t, 0.4 + i * 0.1, 0.8)})`} />;
            })}
          </React.Fragment>
        );
      })}
    </g>
  </svg>
);

// climb: dotted steps climbing to the right (growth, ambition)
const Climb: React.FC<P> = ({t, col, acc}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
    {[0, 1, 2].map((L) => {
      let d = `M-20 ${1010 - L * 130}`;
      for (let i = 0; i < 11; i++) d += ` h190 v-${78 + L * 6}`;
      return <path key={L} d={d} fill="none" stroke={`rgba(${L ? col : acc},${L ? 0.26 : 0.75})`} strokeWidth={L ? 1.4 : 2.4} strokeDasharray={L ? '3 9' : undefined} {...(L ? {} : dash(grow(t, 0.1, 2.6)))} />;
    })}
    {Array.from({length: 22}).map((_, i) => {
      const u = (t * 0.1 + hash(i)) % 1;
      return <circle key={i} cx={hash(i * 3) * 1920} cy={1080 - u * 1120} r={2 + hash(i * 5) * 3.5} fill={`rgba(${i % 3 ? col : acc},${0.7 * Math.sin(Math.PI * u)})`} />;
    })}
  </svg>
);

// tide: layered wave lines (openings, endings)
const Tide: React.FC<P> = ({t, col, acc}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
    {Array.from({length: 15}).map((_, i) => {
      const y0 = 560 + i * 36, A = 22 + i * 4;
      return <path key={i} d={poly((x) => y0 + Math.sin(x / (210 + i * 16) + t * 0.55 + i * 0.5) * A + Math.sin(x / 90 - t * 0.4 + i) * 6, 16)} fill="none"
        stroke={`rgba(${i % 5 === 2 ? acc : col},${i % 5 === 2 ? 0.75 : 0.28})`} strokeWidth={i % 5 === 2 ? 2.2 : 1.3} {...dash(grow(t, i * 0.05, 1.8))} />;
    })}
  </svg>
);

const MOTIF: Record<Motif, React.FC<P> | null> = {tide: Tide, bell: Bell, scatter: Scatter, network: Network, bars: Bars, contour: Contour, orbits: Orbits, climb: Climb, none: null};

const Disc: React.FC<{x: number; y: number; s: number; t: number; i: number; slab?: boolean}> = ({x, y, s, t, i, slab}) => (
  <div style={{position: 'absolute', left: x + Math.sin(t * 0.25 + i * 2) * 26, top: y + Math.cos(t * 0.21 + i) * 20, width: slab ? s * 0.62 : s, height: slab ? s * 1.5 : s, borderRadius: slab ? 56 : '50%',
    rotate: slab ? `${(i % 2 ? 22 : -22) + Math.sin(t * 0.2) * 1.5}deg` : undefined,
    backdropFilter: 'blur(16px) saturate(160%)', background: 'linear-gradient(145deg, rgba(255,255,255,0.46) 0%, rgba(255,255,255,0.06) 62%)',
    border: '1px solid rgba(255,255,255,0.75)', boxShadow: '0 40px 70px -34px var(--shade), inset 0 2px 1px rgba(255,255,255,0.75), inset 0 -18px 40px -24px rgba(255,255,255,0.5)'}} />
);

/** Everything behind the content: dot grid, chapter motif, ghost word, frosted discs, formula chips. */
export const Backstage: React.FC<{t: number; look: Look; blue: boolean}> = ({t, look, blue}) => {
  const {ch, idx, head, ghost, chips} = look;
  const col = blue ? '255,255,255' : '28,104,222';
  const acc = blue ? '255,214,112' : '236,160,20';
  const chapter = CHAPTERS[ch];
  const M = MOTIF[chapter?.motif ?? 'tide'];
  const left = head === 'r';
  const a = EZ.enter(c01(t / 1.1));
  const slab = idx % 3 === 1;
  return (
    <>
      <AbsoluteFill style={{backgroundImage: `radial-gradient(rgba(${col},0.3) 1.5px, transparent 1.8px)`, backgroundSize: '46px 46px', backgroundPosition: `${(t * 5) % 46}px ${(t * 3) % 46}px`,
        WebkitMaskImage: `radial-gradient(ellipse 62% 70% at ${left ? 26 : 74}% 44%, #000 0%, transparent 100%)`}} />
      {M && <M t={t} col={col} acc={acc} />}
      {ghost && chapter?.ghost && (
        <div style={{position: 'absolute', [left ? 'left' : 'right']: -30, bottom: -120, fontFamily: F.serif, fontSize: 620, lineHeight: 1, whiteSpace: 'nowrap', color: 'transparent',
          WebkitTextStroke: `2px rgba(${col},0.2)`, opacity: a, translate: `${(left ? 1 : -1) * t * 7}px 0`, scale: String(mix(1.06, 1, a))}}>{chapter.ghost}</div>
      )}
      <Disc x={idx % 2 ? 1250 : -130} y={slab ? 180 : idx % 3 ? 560 : 120} s={slab ? 620 : 520} t={t} i={idx} slab={slab} />
      {idx % 3 !== 1 && <Disc x={idx % 2 ? 90 : 1500} y={idx % 3 ? 90 : 640} s={300} t={t} i={idx + 3} />}
      {/* formula chips: pure notation, faint, decoration only */}
      {chips.map(([x, y], k) => {
        const e = EZ.enter(c01((t - 0.5 - k * 0.3) / 0.9));
        return (
          <div key={k} style={{position: 'absolute', left: x + Math.sin(t * 0.4 + k * 2) * 12, top: y + Math.cos(t * 0.33 + k) * 14, translate: `-50% ${((1 - e) * 26).toFixed(1)}px`, opacity: e * 0.6,
            padding: '10px 22px', borderRadius: 40, whiteSpace: 'nowrap', fontFamily: 'Pala, Georgia, serif', fontStyle: 'italic', fontSize: 27, color: `rgba(${blue ? '255,255,255' : '12,62,170'},0.6)`,
            background: `rgba(255,255,255,${blue ? 0.07 : 0.22})`, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.4)'}}>
            {FORMULAS[(idx * 3 + k) % FORMULAS.length]}
          </div>
        );
      })}
    </>
  );
};

/** Out-of-focus light passing in front of the content. */
export const FrontBokeh: React.FC<{t: number; idx: number; blue: boolean}> = ({t, idx, blue}) => {
  const c = blue ? '255,255,255' : '70,150,255';
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      {[0, 1, 2].map((i) => {
        const s = 300 + hash(idx * 3 + i) * 320;
        const x = ((hash(idx + i * 5) * 2400 + t * (46 + i * 22)) % 2500) - 400;
        const y = i === 1 ? 760 + hash(idx * 7) * 200 : -170 + hash(idx * 9 + i) * 180;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(${c},0.17) 0%, rgba(${c},0.12) 50%, rgba(${c},0.17) 66%, rgba(${c},0) 72%)`}} />;
      })}
    </AbsoluteFill>
  );
};

/** One pass of light round a rounded rectangle after it lands. */
export const Comet: React.FC<{t: number; t0: number; w: number; h: number; rx?: number}> = ({t, t0, w, h, rx = 30}) => {
  const u = (t - t0) / 1.25;
  if (u <= 0 || u >= 1) return null;
  const o = EZ.soft(u) * 100;
  const fade = Math.min(1, u * 6, (1 - u) * 5);
  return (
    <svg width={w + 8} height={h + 8} style={{position: 'absolute', left: -4, top: -4, overflow: 'visible', pointerEvents: 'none'}}>
      <rect x={4} y={4} width={w} height={h} rx={rx} pathLength={100} fill="none" stroke="rgba(255,205,90,0.45)" strokeWidth={9} strokeDasharray="20 80" strokeDashoffset={-o} opacity={fade} style={{filter: 'blur(5px)'}} />
      <rect x={4} y={4} width={w} height={h} rx={rx} pathLength={100} fill="none" stroke="#FFE9B0" strokeWidth={3} strokeLinecap="round" strokeDasharray="20 80" strokeDashoffset={-o} opacity={fade} />
    </svg>
  );
};
