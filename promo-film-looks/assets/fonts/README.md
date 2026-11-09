# Fonts

The skill does not redistribute fonts. Put these files in this folder (`assets/fonts/`) with exactly these names. `scaffold.py` copies them into every new project's `public/fonts/`.

A missing file does not break the render: `loadFonts()` skips it and the browser falls back. Titles will not look right without the display fonts, though.

| File name | Font | Used for | Licence | Source |
|---|---|---|---|---|
| `YouShe.ttf` | 优设标题黑 (YouSheBiaoTiHei) | 苹果风格 titles and numerals | Free for commercial use per its publishers (优设网 uisdc.com with 字由); check the official terms before commercial use | 优设网 / 字由 official channels |
| `NotoSansSC-Bold.otf` | Noto Sans SC Bold | 苹果风格 fallback for titles | SIL OFL 1.1 | https://github.com/notofonts/noto-cjk (Sans, OTF/SubsetOTF/SC) |
| `NotoSansSC-Medium.otf` | Noto Sans SC Medium | body text in both looks | SIL OFL 1.1 | same as above |
| `SourceHanSerifCN-Heavy.otf` | 思源宋体 Heavy | 华章版 titles | SIL OFL 1.1 | https://github.com/adobe-fonts/source-han-serif (SubsetOTF/CN) |
| `InterM.woff2` | Inter Medium | 苹果风格 Latin text | SIL OFL 1.1 | https://github.com/rsms/inter (rename `Inter-Medium.woff2`) |
| `InterB.woff2` | Inter Bold | 苹果风格 Latin bold | SIL OFL 1.1 | https://github.com/rsms/inter (rename `Inter-Bold.woff2`) |
| `Palatino*.ttf` | Palatino Linotype | 华章版 Latin and numerals, formula chips | commercial system font | Copied automatically from `C:\Windows\Fonts` (`pala.ttf`, `palai.ttf`, `palab.ttf`) when present; otherwise Georgia is used |

Any substitute works if it keeps the file name. For example, any heavy CJK sans can stand in for 优设标题黑, and any serif for Palatino. The overall look survives.
