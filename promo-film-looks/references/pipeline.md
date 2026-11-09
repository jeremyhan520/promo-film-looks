# Production pipeline

## Contents
1. Project setup
2. Timing from the voiceover
3. Scenes and the shot table
4. Sound effects
5. QA stills checklist
6. Master and verification
7. Replacement segments
8. Splicing fixes into a full master
9. Delivery naming

## 1 · Project setup

Create the project, then install and typecheck it:

```bash
python <skill-dir>/scripts/scaffold.py <dir>
```

`<skill-dir>` is wherever this skill is installed, for example `~/.claude/skills/promo-film-looks` (Claude Code) or `~/.agents/skills/promo-film-looks` (Codex).

```bash
cd <dir> && npm install && npx tsc --noEmit -p .
```

- The scaffold copies the template, the fonts and Palatino from the system fonts when present. It also copies `qa.sh`, `master.sh`, `segment.sh` and `verify.sh` plus their helpers into the project root.
- `--node-modules <path>` junctions an existing install, for a quick trial without `npm install`.
- Assets go in `public/img/` (photos, scans) and `public/video/` (footage).
- Fit brochure scans to the content edge before use: crop margins, straighten and match each card's aspect to the page.
- Remotion renders with local Edge (`remotion.config.ts`) where Chrome Headless Shell cannot be downloaded. A harmless `maybeClose` node trace can appear in render logs. Judge a render by the verify numbers, not the log.

## 2 · Timing from the voiceover

The VO drives everything:
1. Transcribe it with word timestamps (Whisper or similar) and group the words into chunks.
2. Write the chunk start and end times somewhere scenes can read them, such as `src/vo.json`.
3. Set `DURATION_S` in `config.ts` to the VO length. Fade the picture over the last 20 frames; `master.sh` fades the audio over the last 0.8 s to match.

How times are written:
- Scene `from` / `to` and every `t0` / `at` are absolute VO seconds. `useT()` returns absolute seconds inside any scene.
- Neighbouring scenes overlap by about 0.35 s: `next.from = prev.to - 0.35`.
- Land text on the spoken word, a list item on its name and a number on its mention. If word-level timing is not available, estimate from chunk timing and say so in the report.

## 3 · Scenes and the shot table

- One file per chapter in `src/scenes/`, each exporting a fragment of `<Scene name="<key> <label>" …>` elements. Mount them in `Film.tsx`.
- Each scene name starts with a key in `config.SHOTS`. The key's first character is the chapter, which selects the glass motif and ghost word.
- Build with kit components only. Colours come from `C`, fonts from `F` and easing from `EZ`; progress comes from `r(t, start, dur, ease)` and `mix(a, b, k)`.

## 4 · Sound effects

Keep a cue table, `src/Sfx.tsx`:

```tsx
type Cue = {at: number; s: keyof typeof FILE; v: number; dur?: number; note: string};
const FILE = {whoosh: 'sfx/whoosh.mp3', tick: 'sfx/tick.mp3', chime: 'sfx/chime.mp3', slide: 'sfx/slide.mp3', page: 'sfx/page.mp3'};
export const CUES: Cue[] = [
  {at: 1.1, s: 'chime', v: 0.32, dur: 3.5, note: 'title rises'},
  {at: 77.95, s: 'tick', v: 0.3, note: '100% lands'},
  {at: 78.0, s: 'chime', v: 0.22, note: '100% emphasis'},
];
export const Sfx: React.FC = () => <>{CUES.map((c, i) => {
  // glass: paper sounds (page turn, paper slide) become a softer whoosh
  const soft = GL && (c.s === 'page' || c.s === 'slide');
  return (
    <Sequence key={i} from={Math.round(c.at * FPS)} durationInFrames={Math.round((c.dur ?? 2) * FPS)}>
      <Audio src={staticFile(FILE[soft ? 'whoosh' : c.s])} volume={soft ? c.v * 0.8 : c.v} />
    </Sequence>
  );
})}</>;
```

How to place cues:
- Put rail-move whooshes at about `at − 0.45` of each card.
- Card or tile landings get soft ticks, and chapter cards get a chime.
- Keep SFX 12–20 dB under the VO, with no BGM.
- Use only licensed sources (for example, Freesound CC0 / CC-BY). Keep a credits file next to the deliverables.

## 5 · QA stills checklist

Render stills at the busiest moment of every shot, in each look you will ship:

```bash
PROPS=glass.json bash qa.sh <prefix> <frame> <frame> …
```

The script writes `out/qa/<prefix>_sheet.jpg`. Open it and look. Check each item:

- [ ] No head or face cropped. Check every portrait, mosaic tile and card crop.
- [ ] No photo repeated within the film.
- [ ] Documents and certificates straight and fully visible, at their true aspect.
- [ ] No text overlapping text, chips or faces. Titles fully on screen, nothing cut at the frame edge.
- [ ] The bottom band (y > 950) is free of important content, because subtitles go there.
- [ ] No top-of-frame decorative English (unless the client wants it).
- [ ] Neighbouring glass shots have different tones. The title sits on the empty side.
- [ ] Dense figures are readable at full size: zoom into the still.
- [ ] Mid-transition frames look intentional. Check one frame later when something looks odd.
- [ ] Icons read literally.

## 6 · Master and verification

```bash
PROPS=glass.json RENDER=out/render_glass.mp4 OUT="out/<name>.mp4" bash master.sh
```

`master.sh` renders with h264 crf 14 and mp3 audio, then makes a two-pass loudnorm master:

| Setting | Value |
|---|---|
| Video | libx264 crf 17, preset slow, high profile, yuv420p, bt709, faststart |
| Audio | AAC 320k at 48 kHz |
| Loudness | −16 LUFS integrated, −1.5 dBTP |

`verify.sh` then prints streams, duration, frame count, a full decode check, integrated loudness, LRA and peak.

Report those numbers. For example: "6291 frames, all decode, 251.64 s, −16.0 LUFS, peak −5.2 dBFS; stills of every shot checked; not watched through in full." After copying to the delivery folder, confirm the copy with `cmp`.

## 7 · Replacement segments

When the client flags one moment, re-render only that span:

```bash
PROPS=glass.json bash segment.sh out/<master>.mp4 <first_frame> <last_frame> out/<segment>.mp4
```

1. Choose a span that starts and ends where nothing changed. Usually that is the whole affected scene plus a little margin, such as the scene `from` minus about 0.45 s through `to` plus the glass tail. Round to whole seconds when convenient.
2. The script renders those frames and takes the audio for the same span from the master. Loudness and SFX match exactly, with no re-measuring.
3. It verifies the segment and compares its first and last frames with the master. A mean absolute difference under about 3 means the same picture.
4. It prints the start timecode for the file name.

## 8 · Splicing fixes into a full master

When the client wants a full new version, the cheapest route is to re-render with `master.sh`.

To splice instead, overlay the segment on the old master's video with `overlay=enable='between(n,A,B)'`, using the segment shifted by `setpts=PTS+A/25/TB`. Re-encode the video, and copy the audio when it is unchanged. Then run `verify.sh` again.

## 9 · Delivery naming

| Deliverable | Naming |
|---|---|
| Full film | `<机构>宣传片_<版本>_无字幕无BGM_1080p25.mp4`, e.g. `…_苹果风格v3_无字幕无BGM_1080p25.mp4` |
| Segments | Folder `<版本>_替换片段/`, files `<版本>_片段N_<内容>_TC-hh.mm.ss.ff.mp4` (start timecode) |

Keep earlier versions next to the new one unless told otherwise. Record each edition and client round in the project's `DESIGN.md`.
