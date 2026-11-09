---
name: promo-film-looks
description: Two ready-made visual style templates for Remotion promo films (宣传片 / 形象片 / VCR), aimed at schools, colleges and institutions. 磨砂版 is Apple-style frosted glass in blue, white and a little yellow, with 优设标题黑 titles. 华章版 (Aurum Nocturne) is midnight lacquer with gold leaf. Includes a working engine template (scene kit, per-shot looks, transitions, photo frames, near-full-screen card rail, headline-number emphasis, text-as-mask opener), render, QA, master and replacement-segment scripts, and design principles. Use it whenever someone wants a promo film for a school, college, institute or company made in Remotion. Also use it for requests that mention 磨砂版, 华章版, 磨砂风, 毛玻璃, 黑金, 苹果风, frosted glass or a dark-gold luxury look, for a new edition or restyle of an existing promo, and for replacement segments of one, even if the skill is not named.
---

# Promo film looks: 磨砂版 and 华章版

Two finished style templates for institutional promo films. Start from a working engine instead of a blank Remotion project.

- **磨砂版 (glass)**: Apple-style frosted glass. Per-shot white / sky / blue grounds, yellow accents, 优设标题黑 titles, rounded frameless photos, and live data graphics behind the glass. Read `references/glass.md`.
- **华章版 (aurum, Aurum Nocturne)**: midnight lacquer ground, champagne type and gold-leaf titles. It adds gold-rimmed photo frames, light leaks and a few lens flares. Read `references/aurum.md`.

One codebase renders both. The look is an input prop (`--props=glass.json` or `--props=aurum.json`), so the same timeline and scenes can ship as two editions.

## Choosing the look

The default is 磨砂版: bright, clean and international, and it suits admissions and recruitment films best. 华章版 is darker and more ceremonial. Offer it for anniversaries, galas, awards and premium brand films, or when the user asks for 华丽 / 黑金 / luxury. Show a few stills before rendering a whole film in it.

If the brand palette is not blue, keep the glass engine and recolour the tokens (`glassVars` in `looks.tsx`, `GLASS` in `theme.ts`). Don't build a new look from scratch.

## Start a new film

```bash
python <skill-dir>/scripts/scaffold.py <new-project-dir>
```

Then, in the project:

```bash
npm install
npx tsc --noEmit -p .
PROPS=glass.json bash qa.sh demo 30 150 268 320 460 520
```

The demo timeline (`src/scenes/Demo.tsx`) has one shot per signature component. Render its stills in both looks before changing anything, to confirm fonts and the browser work on this machine.

Two setup notes:
- **Fonts** are not redistributed with the skill. `assets/fonts/README.md` lists each file, its source and its licence. The scaffold copies whatever is in `assets/fonts/`; missing fonts fall back without breaking the render.
- **Browser**: `remotion.config.ts` points at local Edge when it exists, because Chrome Headless Shell may not download on some networks.

What the template contains:

| File | Role | Edit per film? |
|---|---|---|
| `src/config.ts` | duration, `SHOTS` (per-shot tone, title side, chips), `CHAPTERS` (motif, ghost word), `FORMULAS`, `BRAND` | yes |
| `src/scenes/*.tsx` | the film: one file per chapter, built from kit components | yes |
| `src/kit.tsx` | `Scene`, `Ground`, `Night`, `Card`, `Print`, `DocPage`, `Caption`, `Rise`, `En`, `Rule`, `Heading`, `ChapterCard`, `useCount`, `StatHit`, `MaskTitle`, `CardRail`, `FeatureCard` | rarely |
| `src/looks.tsx` | grounds, transitions, photo frames and light for both looks | rarely |
| `src/glassfx.tsx` | glass detail layers: motifs, discs, chips, ghost words, bokeh, edge comet | rarely |
| `src/theme.ts` | tokens `C`, fonts `F`, `FOIL`, easings `EZ`, `r()`, `mix()` | rarely |
| `src/Film.tsx` | master timeline, `GLASS_CSS`, VO / SFX hook-up | yes (wiring) |

Scenes must stay look-agnostic. Colour only through `C.*` tokens, type only through `F.*`, photos through `Print`, panels through `Card` or `C.card` / `C.fill`. Never hard-code a hex colour in a scene: the same scene has to render white-on-blue, ink-on-white and gold-on-midnight.

## Workflow

1. **Timing from the voiceover.**
   - Align the VO (for example, Whisper word timestamps) and write chunk times down.
   - Every `Scene` sits at absolute VO seconds. Neighbouring scenes overlap by about 0.35 s.
   - Element times (`t0`, `at`) are absolute seconds too: the moment the narrator says the thing. Text arriving on the spoken word is what makes the film feel edited rather than animated.
2. **Shot table.** Add one `SHOTS` row per scene in `config.ts`.
   - Alternate tones so neighbouring shots differ.
   - Put the title (`head`) on the side the content leaves empty.
   - Mark full-bleed or blend-mode shots `flat`.
3. **Build scenes** from kit components. Patterns that already work are in the references, for example:
   - a near-full-screen card rail for dense figures
   - a headline number that lands whole
   - the text-as-mask opener
4. **QA stills** (`qa.sh`) at the busiest moment of every shot, in every look you will ship. Look at them yourself. See the checklist in `references/pipeline.md`.
5. **Master** with `master.sh`: −16 LUFS, h264 crf 17, AAC 320k. Then report the `verify.sh` numbers.
6. **Fixes after delivery.** Re-render only the changed span with `segment.sh`. It pulls audio from the master so loudness matches, and it checks that both splice frames equal the master.

## Design principles

These are what make the two looks hold up. Each one is followed by the reason, because the reasons matter more than the rules.

- **Leave room for subtitles and music.** Deliver voiceover plus SFX, with no burned-in subtitles and no BGM unless asked. Institutions usually add unified subtitles and music afterwards, so the bottom band (about y > 950) stays clear of important content.
- **Keep the top of the frame clean.** Decorative English running heads, chapter kickers and HUD lines read as clutter to a Chinese audience. In glass the kicker is already off, and `BRAND` defaults to empty. English companion lines under titles are fine.
- **Avoid the slide-deck look.** A bare frosted layout reads like a PowerPoint. Every glass shot carries slow layers behind the content: the motif, discs, ghost word and front bokeh, plus the slow 3-D turn of the content plane. Neighbouring shots alternate grounds. Do not strip these layers to "clean up".
- **Decoration must not read as content.** Formula chips are pure notation with no numbers, about 60 % opacity and no shadow. A chip like "R² = 0.98" reads as a claim about the institution.
- **Readable beats elegant.** When a card holds a dense figure (research diagrams, results), give it nearly the whole frame (`CardRail`). Small cards in a row are unreadable.
- **Headline figures land whole.** A long count-up from 0 to 100 % reads as a loading bar. Use `StatHit` for headline numbers and `useCount` only for ordinary ones.
- **People and documents:**
  - Never crop a head. Check every portrait crop in a still and set `focus` on `Print` to fix it.
  - Never repeat a photo within a film.
  - Certificates and journal pages hang dead straight (`DocPage` has no tilt), sized to the page's true aspect.
- **Icons must be literal.** Prefer a recognisable object, such as a car seen head-on for transport, over an abstract glyph.
- **The institution's content is data.** People, photos, names and numbers are used exactly as supplied, never invented. When a source photo needs work (background, colour), match it to its neighbours and show a still before rendering.

## Reporting

Report what you checked, with numbers: frame count, decode, duration, LUFS, peak and which stills you looked at. Say plainly what you did not do, such as "not watched through in full" or "audio not listened to". Name deliverables `<机构>宣传片_<版本>_无字幕无BGM_1080p25.mp4`. Put replacement segments in a `<版本>_替换片段/` folder, named with the start timecode (details in `references/pipeline.md`).

## References

- `references/glass.md`: the full 磨砂版 spec. Covers tokens, per-shot looks, frosted surfaces, transitions, detail layers, signature moves and pitfalls.
- `references/aurum.md`: the full 华章版 spec. Covers the stage layers, gold-leaf type, frames, light leaks, flares and contrast traps.
- `references/pipeline.md`: VO timing, the SFX cue table, the QA checklist, mastering, verification, replacement segments, splicing and delivery naming.
