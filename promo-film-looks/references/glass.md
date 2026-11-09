# 苹果风格 (glass): full spec

Apple-style frosted glass in the brand's blue, white and a little yellow. The film should feel calm, bright, precise and international. Select it with `--props=glass.json`; it is also the default when no props are passed. In code, `GL` is true.

## Contents
1. Palette and per-shot grounds
2. Type
3. Surfaces: how frosting works
4. Ground layers (why it does not look like a slide deck)
5. Shot transitions
6. Photos and documents
7. Signature moves
8. What glass deliberately leaves out
9. Pitfalls

## 1 · Palette and per-shot grounds

Each shot picks a tone in `config.SHOTS`. `glassVars(tone)` in `looks.tsx` sets CSS variables on that shot only, so scene code never changes.

| tone | ground | `--ink` (text) | `--card` | `--fill` (emphasis panel) |
|---|---|---|---|---|
| white | `#F6F8FC` + pale blue / yellow blobs | `#0B1F44` | `rgba(255,255,255,0.58)` frosted | `#1E8BFF → #0A4FD6` |
| sky | `#E4EEFB` + stronger blue blobs | `#0B1F44` | `rgba(255,255,255,0.62)` | same |
| blue | `#0A58E4 → #0B3FB5` + cyan / navy / gold blobs | `#FFFFFF` | `rgba(255,255,255,0.86)` | `#0B3FB5 → #082C86` |

Accent:
- `--gold`: `#E09A00` on light grounds, `#FFD670` on blue.
- `C.fillAccent`: `#FFD670`.
- Signature gradient bar: `#FFC83D → #2E8BFF`.

Text on cards uses `C.cInk*`, a deep navy that stays dark even on a blue shot, because cards are white there.

Rules for the shot table:
- Alternate tones so no two neighbours match. Use roughly 40 % white, 35 % blue and 25 % sky.
- Variety is the point: white grounds with blue cards, blue grounds with white cards, never the same twice in a row. Uniform grounds are what make a film feel like slides.
- Put `head` on the empty side of each layout so title placement varies from shot to shot as well.

## 2 · Type

All type goes through `F`:

| Role | Font | Notes |
|---|---|---|
| titles, numerals (`F.serif`, `F.num`) | 优设标题黑 (`YouShe.ttf`) | Bold, slanted, display-only: every title and headline numeral. Use it at 54 px and above. |
| text, English (`F.sans`, `F.latin`) | Inter Medium with Noto Sans SC fallback | Body text. |
| formula chips | Palatino italic | Chips only. |

Behaviour of the type components:
- `Rise` in glass: each glyph slides up out of its own mask, with no blur. Display text in `C.ink` gets the `var(--foil)` sheen pass, a blue gradient on light grounds and white on blue.
- `Heading`:
  - Title at ×1.22 size, English line at ×1.3, then a 92 × 6 px gradient bar that draws in.
  - No "Chapter" kicker.
  - Placed left, centre or right by the shot's `head`.
  - `t1` makes it leave, for example when a card grows into its space.
- `GLASS_CSS` forces `text-transform: none` and near-zero letter-spacing globally. This is deliberate: Apple-style English is sentence case, not tracked small caps.

## 3 · Surfaces: how frosting works

`GLASS_CSS` in `Film.tsx` matches inline styles that contain the token:

- `background: var(--card)` (`C.card`) gets `backdrop-filter: blur(30px) saturate(170%)`, a 1 px white border, a deep soft shadow and an inner top highlight.
- `background: var(--fill)` (`C.fill`) gets no border and a deep shadow.
- Either one without its own `border-radius` gets 26 px. Give an explicit radius when you need a different one, such as 44 for big cards or `'50%'` for circles. Otherwise circles become rounded squares.
- `color-mix(in srgb, var(--paper…` panels (`C.paperA`) get a heavier frost.

Scenes therefore frost a panel just by using the token, through `<Card>` or `background: C.card`. Frosting only shows if something colourful sits behind the panel, which is why the stage keeps drifting blobs. A frosted card on a flat colour looks like a grey box.

## 4 · Ground layers (why it does not look like a slide deck)

`GlassStage` stacks these layers, back to front:

1. Tone ground plus four large radial-gradient blobs drifting slowly. Their colours rotate with the shot index.
2. `Backstage` (`glassfx.tsx`):
   - A dot grid (46 px), masked to the side opposite the title.
   - The chapter **motif**, a live data graphic drawn in on entry. Choose one per chapter in `CHAPTERS`:

     | Motif | Graphic | Typical chapter |
     |---|---|---|
     | `tide` | wave lines | opening, ending |
     | `bell` | normal curves over sampled sticks | heritage |
     | `scatter` | regression line plus confidence band | people |
     | `network` | signals travelling along graph edges | research |
     | `bars` | histogram under a growth curve | talent |
     | `contour` | likelihood contours | culture |
     | `orbits` | ellipses with bodies | collaboration |
     | `climb` | dotted steps | ambition |
     | `none` | none | none |

     For schools outside data science, these still read as "data / intelligence". Swap or add motifs for other subjects (for example, molecules for chemistry).
   - **Ghost word**: the chapter's two-character word, 620 px, outlined only at 20 % opacity, drifting sideways.
   - **Frosted discs**: two per shot, or one tall rotated "slab" every third shot, each with a white rim and inner highlights.
   - **Formula chips** at `SHOTS[].chips` positions (see §7).
3. **The content plane turns slowly**: rotateY ±1.5°, rotateX ±0.8°, on a perspective of 2600. This is the single most important "not a slide" cue. Shots marked `flat` skip it.
4. `FrontBokeh`: three huge, faint out-of-focus discs passing in front of the content.
5. Grain at 2.5 %.

Every glass shot also gets a 2 % dolly-in over its length (`GlassShot` `push`).

## 5 · Shot transitions

`GlassShot` cycles the incoming transition by shot index: iris, slide, zoom, rise.
- **iris**: a rounded inset opening with a slight scale.
- **slide**: from the right.
- **zoom**: from 1.32 with an 18 px blur.
- **rise**: from below.

The outgoing shot sinks into a rounded card (scale 0.91, radius 48) over its last 0.75 s. To give it time, `Scene` extends glass shots 0.45 s past `to`, so the next scene's entry plays over the sinking card.

The last shot in `SHOTS` never sinks. `fade={0}` on a Scene means it enters with no transition, which is right for the opener.

A white pill visible in a still is usually the next shot's iris opening mid-transition, not a bug. Check one frame later.

## 6 · Photos and documents

`Print` becomes `GlassPrint` in glass:
- Rounded 30 px, frameless, with a deep soft shadow.
- Rises out of depth: translate3d from −220 px Z, tilting from the `dir` side.
- When `mat ≥ 10` and the photo is at least 300 px wide, an offset frosted plate floats behind it.
- One white sheen sweeps across after landing.
- One "comet" light runs once around the rounded edge (`Comet`, yellow).

Other settings:
- `mat={0}` gives a full-bleed photo: no plate, no radius.
- `fit="contain"` keeps figures and diagrams whole.
- `focus` sets the crop centre. Portraits usually need about `[0.5, 0.2–0.3]`.

`DocPage` gives a white sheet, 14 px radius, a white edge and a soft halo. It is always straight. Size the box to the scan's true aspect ratio and crop scans to the paper edge first.

## 7 · Signature moves (all in `kit.tsx`)

- **`MaskTitle` (opening)**:
  - A white layer in screen blend carries huge black type (250 px 优设标题黑), so the footage shows only through the glyphs.
  - At `exitAt` the layer scales as 11^(u^1.8) over 0.95 s: the type rushes past the camera and the footage fills the frame.
  - Keep a short English line out of the blend if wanted.
  - The opener shot must be `flat` and `fade={0}`.
- **`CardRail` + `FeatureCard`**: for teams, programmes, labs or results with dense figures.
  - Each item is a 1760 × 840 card: a blue fill, with the numeral, leader, two-line title, English line and progress dots on the left, and a white figure panel on the right (1156 × 760, contain).
  - The rail moves card to card in [at − 0.7, at + 0.05] with a 30° cover-flow turn and capped speed blur.
  - `introAt`: the first card waits at 0.6× below the shot title, then grows to full while the title leaves (`Heading t1` ≈ introAt + 0.5).
  - `overviewAt`: the last card shrinks into a 3+2 (or single-row) grid and the others drop in staggered. Put a new `Heading` (for example "研究方向一览") at the same time.
  - Time each `at` to the spoken name.
- **`StatHit`**:
  - The headline number lands whole, at 1.55× and settling, with a glow that fades from 34 px to 10 px and two gold rings.
  - Time `at` to the spoken word. Give it a tick plus a soft chime SFX.
  - Use `useCount` for ordinary numbers that may count up (about 1.1 s).
- **`PhotoWall`** (looks.tsx, coda): a tilted 3-D wall of six columns drifting in opposite directions, with tiles rising out of depth. Put a frosted plate with the closing line over it.
- **`ChapterCard`**: a glyph-by-glyph pressed title, used between chapters.

## 8 · What glass deliberately leaves out

- No lens flares: `Flare` returns null in glass.
- No gold dust, light leaks or poster sweeps.
- No serif type or tracked small caps.

Page-turn and paper-slide SFX become soft whooshes at reduced volume.

## 9 · Pitfalls

- **Blend modes inside the turning plane.** The content-plane rotation creates a stacking context, and a `mix-blend-mode: screen` layer inside it rendered as a black box (a word cloud did this). Mark such shots `flat`, and do the same for full-bleed photo or video shots.
- **Circles turning into rounded squares.** `GLASS_CSS` gives every card or fill 26 px unless the element sets `border-radius` inline. Always set `borderRadius: '50%'` on circular badges.
- **Overlapping decoration.** Chips are hand-placed per shot, only in truly empty space. They stay clear of titles, faces, captions and the bottom band. Auto-placement overlapped text. If unsure, leave chips off.
- **Cards over the title.** A large card that grows over the title area must take over only after the title has left. Use `Heading t1`, and keep the overlap under about 0.2 s.
- **Dense figures need size, not zoom tricks.** Give them the frame and hold each card at least 1.5 s. Keep speed blur capped (max 6 px) so the swing does not smear the readable state.
- **`backdrop-filter` is expensive.** Renders slow down with many frosted elements. Concurrency 12 on a desktop is fine. Do not nest frosted panels deeply.
