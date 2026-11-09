// Project config. A new film edits this file and its scene files; the engine (theme / looks / glassfx / kit) stays as is.
export const FPS = 25;
export const WIDTH = 1920;
export const HEIGHT = 1080;
/** set to the voiceover length; the whole film is timed in absolute VO seconds */
export const DURATION_S = 22;
export const COMP_ID = 'PromoFilm';
/** aurum running head (small caps line at the top). Leave '' if the client does not want top text. */
export const BRAND = '';

export type Tone = 'white' | 'sky' | 'blue';
export type Head = 'l' | 'c' | 'r';
export type Motif = 'tide' | 'bell' | 'scatter' | 'network' | 'bars' | 'contour' | 'orbits' | 'climb' | 'none';

/**
 * One row per shot, in timeline order. A Scene whose name starts with the key ("1.2 faculty wall") gets this look.
 * tone   glass ground: alternate white / sky / blue so neighbouring shots never match (reads less like slides).
 * head   where <Heading> sits: left / centre / right. Pick the side the shot's content leaves empty.
 * flat   true = no slow 3-D turn of the content plane. Needed for full-bleed shots and anything using mix-blend-mode
 *        (the turn creates a stacking context and a screen-blended layer turns into a black box).
 * ghost  false = no huge outlined chapter word behind (turn off on busy or full-bleed shots).
 * chips  [x, y] centres of faint formula chips. Only in genuinely empty space, never near text or faces, never in the
 *        bottom band (client subtitles go there). Omit for none.
 * Aurum ignores tone / head / chips; it uses the same rows only for transitions.
 */
export type Shot = {key: string; tone: Tone; head: Head; flat?: boolean; ghost?: boolean; chips?: [number, number][]};
export const SHOTS: Shot[] = [
  {key: '0.1', tone: 'blue', head: 'c', flat: true, ghost: false},
  {key: '1.1', tone: 'white', head: 'l', chips: [[1650, 200]]},
  {key: '1.2', tone: 'blue', head: 'r', chips: [[300, 200]]},
  {key: '1.3', tone: 'sky', head: 'l'},
  {key: '2.1', tone: 'white', head: 'l', chips: [[1650, 190]]},
];

/** chapter = first character of the shot key. motif = live data graphic behind the glass; ghost = outlined word. */
export const CHAPTERS: Record<string, {motif: Motif; ghost?: string}> = {
  '0': {motif: 'tide', ghost: '序章'},
  '1': {motif: 'network', ghost: '探索'},
  '2': {motif: 'bars', ghost: '未来'},
};

/**
 * Formula chips: pure notation, no numbers or results (a value like "R² = 0.98" reads as a claim about the school).
 * The default is general science notation; swap in the discipline's own (statistics, chemistry, finance, law ...).
 */
export const FORMULAS = ['∫ f(x) dx', '∇ · E = ρ / ε₀', 'P(A | B)', 'F = ma', 'Σ aₙ', 'e^{iπ} + 1 = 0', 'iħ ∂ψ/∂t = Ĥψ', 'lim x→∞',
  'E = mc²', 'a² + b² = c²', 'f(x | θ)', '∂u/∂t = α∇²u', 'det(A − λI)', 'x ∈ ℝⁿ'];
