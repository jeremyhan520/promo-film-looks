# 华章版 (aurum, Aurum Nocturne): full spec

Midnight lacquer, champagne type and gold leaf: a top-tier ceremonial look. Select it with `--props=aurum.json`. In code, `GL` is false.

When to use it: aurum is dark and ceremonial, and many institutions find it too dark for an admissions or recruitment promo. Use aurum when the occasion is ceremonial (anniversary, gala, awards, a premium brand film) or when the user asks for 华丽 / 黑金 / luxury. Confirm the palette with a few stills before rendering the whole film.

## 1 · Palette (`AURUM` in theme.ts)

| Token | Value | Use |
|---|---|---|
| `paper` / stage | `#070A12`, gradient `#0B1020 → #070A12 → #04060B` | ground |
| `ink` / `ink2` / `ink3` | `#F3E9D2` / `#CDBF9F` / `#9A8F78` | champagne type |
| `gold` / `goldHi` | `#D9B26A` / `#F3D58E` | rules, kicker, units, rings |
| `card` | smoked glass `rgba(46,56,82,0.78) → rgba(16,21,35,0.9)` | resting panels |
| `fill` | gold leaf `#F7E3A8 → #DDB467 → #B0823A` | emphasis panels (rail cards) |
| `onFill*` | `#16110A` / `#5A4420` | text on gold leaf; never champagne on gold |
| `verm` | `#D23A2E` | seals only |

## 2 · Type

| Role | Font | Notes |
|---|---|---|
| titles (`F.serif`) | Source Han Serif Heavy (思源宋体 Heavy) | |
| text (`F.sans`) | Noto Sans SC Medium | |
| Latin, numerals (`F.latin`, `F.num`) | Palatino | Elegant old-style figures for big numbers. |

Behaviour of the type components:
- `Rise`: glyphs rise out of focus (blur 14 → 0).
- Gold leaf: display sizes of 56 px and above in `C.ink` become `FOIL`, a vertical gold gradient clipped to the glyphs. Each gets one shimmer pass after it lands, then a soft gold drop-shadow glow. Keep foil for display type only, because it is unreadable small.
- `En`: tracked small caps that settle from 0.5 em to 0.26 em letter-spacing.
- `Heading`: a gold "Chapter N" kicker, then the foil title, then the English line. It is always top-left.

## 3 · Stage layers (`Stage` in looks.tsx, back to front)

1. Midnight gradient.
2. Drifting warm key light, an ellipse at the `light` position, plus a cool rim light bottom-right.
3. Three slow volumetric beams at −24°, screen blend.
4. Data constellation: 34 nodes with faint gold edges, drifting.
5. Gilded running rules: a hairline at 62 px from the top and from the bottom, each with a diamond at the centre.
6. `BRAND` running head in tracked Palatino small caps, top-left. Off by default: top-of-frame English tends to read as clutter.
7. The scene content.
8. Gold dust: about 46 twinkling specks plus 9 soft bokeh, screen blend.
9. Vignette (0.62) and grain (8 %, soft-light).

`Night` / `NightStage` is the ground for full-bleed video: an ink radial gradient, with dust only in aurum.

## 4 · Transitions

`Fader` in aurum works like this:
- A cross-dissolve (`fade`, default 0.3 s) and a 2 % dolly-in over the whole shot.
- A `LightLeak` rides each entry: a warm bloom at a seeded position and an anamorphic streak sweeping across.
- There is no shot overlap tail. Scenes still overlap by about 0.35 s on the timeline.

## 5 · Photos and documents

`Print` becomes `AurumPrint`:
- A gold-rim gradient frame (2 px rim, then a lacquer mat `mat × 0.75`) with a hairline inside.
- Wipe-revealed from `dir`, tilting in by 10–14°.
- Photo grading: contrast 1.06, saturate 1.06, brightness 0.97, plus a warm top and dark bottom gradient.
- One sheen sweep, then a deep shadow and a gold halo.
- `mat={0}` gives a frameless black-backed photo.

`DocPage` gives a white sheet with a 1.5 px gold edge and a warm halo, hung straight.

## 6 · Light accents

- **`Flare`** (`t`, `at`, `x`, `y`): a centre glint, a long horizontal streak and three ghost rings. Use about five per film, on hero titles only. More cheapens it.
- **`Sheen`**: one band across a surface, used by the frames and the rail cards.
- **`StatHit`**: in aurum the number is gold leaf with a gold glow and rings.

## 7 · Signature moves in aurum

Every kit component renders in both looks:

| Component | Aurum rendering |
|---|---|
| `MaskTitle` | Footage under a midnight veil, centred gold-leaf lines, a flare on the first line. |
| `CardRail` / `FeatureCard` | Gold-leaf cards with dark-brown type (`onFill`, `fillAccent`). The figure panel stays white. |
| `ChapterCard` | Palatino numeral, foil glyphs pressed in, gold rule. |
| `Card` | Smoked glass with a gold hairline border; `emphasis` = gold leaf. |

## 8 · Pitfalls

- **Contrast.**
  - Champagne text on a gold fill disappears. On `C.fill` use `C.onFill*`, and on `C.card` use `C.cInk*`.
  - Check every number and caption on a dark photo at 50 % size in a still.
- **Too much glitter.** Dust, beams, constellation and leaks are already present on every shot. Do not add sparkles per element. Flares only on hero titles.
- **Dark photos sink.** Night-time and indoor photos lose detail on the midnight ground. Prefer daylight photos in frames and give dark ones `lift`.
- **Party / government content.** Keep red accents (`verm`) where the subject requires them. Do not draw emblems or flags.
