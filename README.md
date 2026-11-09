# promo-film-looks · 学校宣传片风格模板（苹果风格 / 华章版）

给 AI 编程助手用的一个 Skill，支持 [Claude Code](https://claude.com/claude-code) 和 [OpenAI Codex](https://developers.openai.com/codex/skills)（遵循开放的 [Agent Skills](https://agentskills.io) 格式）：两套做好的宣传片视觉风格，基于 [Remotion](https://www.remotion.dev/)（用 React 写视频）。装好后对它说"用苹果风格给 XX 学院做一支宣传片"，它会从一个能直接渲染的工程模板起步，而不是从空白项目开始。

适合学校、学院、研究所、机构的宣传片 / 形象片 / 招生片 / 典礼 VCR。

![同一时间轴的两种风格：左 苹果风格，右 华章版](docs/images/compare_hero.jpg)

<sub>左：苹果风格　右：华章版。同一份代码、同一条时间轴，只换一个参数。</sub>

## 效果预览

| 苹果风格（glass） | 华章版（aurum） |
|---|---|
| ![苹果风格开场：文字镂空遮罩](docs/images/glass_opener.gif) | ![华章版开场](docs/images/aurum_opener.gif) |
| 开场：画面只从大字的笔画里透出来，随后大字冲向镜头 | 同一个开场，夜色底、香槟金字 |
| ![苹果风格近全屏卡片轮播](docs/images/glass_rail.gif) | ![华章版近全屏卡片轮播](docs/images/aurum_rail.gif) |
| 近全屏卡片轮播：密集的科研图表也看得清，最后收成总览 | 同一段轮播，金箔卡面 |

同一时刻、两种风格对照：

![学院概况](docs/images/compare_about.jpg)
![数字强调](docs/images/compare_numbers.jpg)
![证书与荣誉](docs/images/compare_honours.jpg)

完整的 22 秒演示片（720p，无声）：[苹果风格](docs/media/demo_glass.mp4) · [华章版](docs/media/demo_aurum.mp4)

> 演示里的图片都是程序绘制的示意插画，人名、数字和文字均为虚构，不代表任何真实学校。

## 两种风格

| | 苹果风格 glass | 华章版 aurum（Aurum Nocturne） |
|---|---|---|
| 气质 | 明亮、干净、国际化，苹果风毛玻璃 | 庄重、华丽，夜色漆面加金箔 |
| 色彩 | 蓝、白，少量黄色点缀；每个镜头在白 / 浅蓝 / 深蓝底之间切换 | 午夜蓝黑底，香槟色文字，金箔标题 |
| 标题字体 | 优设标题黑 | 思源宋体 Heavy |
| 画面细节 | 磨砂卡片、背后缓慢移动的数据图形、圆角无框照片、镜头间卡片式转场 | 金边相框、漏光、少量镜头光斑、溶解推镜 |
| 适合 | 招生片、学院介绍、招聘片 | 校庆、典礼、颁奖、高端形象片 |

两种风格共用一套代码，风格是一个输入参数（`--props=glass.json` 或 `--props=aurum.json`），所以同一条时间轴可以同时出两个版本。品牌色不是蓝色时，改 `looks.tsx` 里的 `glassVars` 和 `theme.ts` 里的 `GLASS` 就能换色。

## 包含什么

```
promo-film-looks/              ← 这个文件夹就是 Skill，复制到 skills 目录即可
├── SKILL.md                   ← AI 读的入口：怎么选风格、工作流程、设计原则
├── references/
│   ├── glass.md               ← 苹果风格完整规格
│   ├── aurum.md               ← 华章版完整规格
│   └── pipeline.md            ← 配音对时、音效表、QA 清单、母版、替换片段
├── scripts/
│   ├── scaffold.py            ← 从模板新建一个宣传片工程
│   ├── qa.sh                  ← 渲染指定帧的静帧和拼图，用来检查画面
│   ├── master.sh              ← 整片渲染 + 两遍响度标准化到 −16 LUFS + 校验
│   ├── segment.sh             ← 只重渲改动的那一段，并检查首尾帧能无缝替换
│   └── verify.sh 等
├── template/                  ← 能直接渲染的 Remotion 工程（演示时间轴 + 示意素材）
└── assets/fonts/README.md     ← 字体清单与下载地址（字体本身不随仓库分发）
```

模板里的主要组件：

- `MaskTitle`：文字镂空开场，大字随后冲向镜头
- `CardRail` + `FeatureCard`：近全屏卡片轮播，适合科研团队、专业、实验室、成果
- `StatHit`：重点数字整体落下、带光圈，不做"从 0 数到 100%"的进度条式计数
- `Print` / `DocPage`：照片框和证书页（证书永远端正不倾斜）
- `Heading`、`Caption`、`ChapterCard`、`PhotoWall` 等

## 环境要求

- [Claude Code](https://claude.com/claude-code) 或 [OpenAI Codex](https://developers.openai.com/codex)
- Node.js 18 以上
- FFmpeg（含 ffprobe）
- Python 3.8 以上
- Windows 需要 Git Bash（脚本是 bash）。模板会优先用本机 Edge 渲染，因为有些网络下载不了 Remotion 自带的浏览器

## 安装

```bash
git clone https://github.com/jeremyhan520/promo-film-looks.git
```

把里面的 `promo-film-looks/` 文件夹复制到你所用工具的 skills 目录：

| 工具 | 所有项目可用 | 只在某个项目里用 |
|---|---|---|
| Claude Code | `~/.claude/skills/` | `<项目>/.claude/skills/` |
| Codex | `~/.agents/skills/` | `<项目>/.agents/skills/` |

### Claude Code

```bash
cp -r promo-film-looks/promo-film-looks ~/.claude/skills/
```

Windows PowerShell：

```powershell
Copy-Item -Recurse promo-film-looks\promo-film-looks "$env:USERPROFILE\.claude\skills\"
```

### Codex

```bash
mkdir -p ~/.agents/skills && cp -r promo-film-looks/promo-film-looks ~/.agents/skills/
```

Windows PowerShell：

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.agents\skills" | Out-Null
Copy-Item -Recurse promo-film-looks\promo-film-looks "$env:USERPROFILE\.agents\skills\"
```

Codex 会自动发现新装的 Skill，没出现就重启 Codex。一些旧教程写的是 `~/.codex/skills/`，以 [OpenAI 当前文档](https://developers.openai.com/codex/skills) 为准。

### 字体

字体不随仓库分发。按 [assets/fonts/README.md](promo-film-looks/assets/fonts/README.md) 的清单，把字体文件按指定文件名放进已安装 Skill 的 `assets/fonts/` 文件夹，例如 `~/.claude/skills/promo-film-looks/assets/fonts/` 或 `~/.agents/skills/promo-film-looks/assets/fonts/`：

| 文件名 | 字体 | 用途 |
|---|---|---|
| `YouShe.ttf` | 优设标题黑 | 苹果风格标题和数字（商用前请自行核对官方授权） |
| `NotoSansSC-Bold.otf` / `NotoSansSC-Medium.otf` | Noto Sans SC | 正文（SIL OFL） |
| `SourceHanSerifCN-Heavy.otf` | 思源宋体 Heavy | 华章版标题（SIL OFL） |
| `InterM.woff2` / `InterB.woff2` | Inter | 苹果风格英文（SIL OFL） |

缺字体不会导致渲染失败，只会回退到系统字体，标题效果会打折扣。Windows 上的 Palatino 会被自动复制。

## 快速开始

### 让 AI 来做

装好 Skill 后，在 Claude Code 或 Codex 里直接说，例如：

- "用苹果风格给 XX 大学数学学院做一支 3 分钟的招生宣传片，配音和照片在 D:\素材"
- "这支片子再出一版华章版"
- "第 1 分 20 秒到 1 分 35 秒的科研团队那段改一下，只渲染替换片段"
- "先给我看几张华章版的静帧，再决定要不要整片渲染"

它会按 `SKILL.md` 的流程：按配音逐字对时 → 写镜头表 → 用组件搭场景 → 渲染静帧自查 → 出母版 → 报告校验数据。

Claude Code 和 Codex 都会根据你说的内容自动选用这个 Skill。在 Codex 里也可以输入 `$promo-film-looks` 明确指定。

### 在 Codex 里使用的注意事项

- 作者主要在 Claude Code 里使用和测试这个 Skill，Codex 下还没有完整跑过一支片子，遇到问题欢迎提 Issue
- 第一次 `npm install` 需要联网，渲染时会启动一个无头浏览器。在 Codex 默认的沙箱权限下，这些命令可能需要你批准，或者需要放宽权限
- Windows 上脚本要用 Git Bash 运行。在 PowerShell 里请显式调用 Git Bash，例如 `& "C:\Program Files\Git\bin\bash.exe" -c "PROPS=glass.json bash qa.sh demo 30 150"`，因为直接输入 `bash` 可能启动的是 WSL

### 手动跑演示

```bash
SKILL_DIR=~/.claude/skills/promo-film-looks     # Codex：~/.agents/skills/promo-film-looks
python $SKILL_DIR/scripts/scaffold.py my-film
cd my-film
npm install
npx tsc --noEmit -p .
PROPS=glass.json bash qa.sh demo 30 150 268 320 460 520     # 静帧在 out/qa/
PROPS=aurum.json OUT=out/demo_aurum.mp4 bash master.sh       # 整片
npx remotion studio                                         # 浏览器里预览和调整
```

## 设计原则（摘要）

这些是两套风格能"看起来不像 PPT"的原因，完整说明见 `SKILL.md`：

- 交付配音 + 音效，不烧字幕、不配 BGM，画面底部留出字幕区，方便学校统一加字幕和音乐
- 画面顶部保持干净，不堆英文页眉、章节角标
- 苹果风格每个镜头背后都有缓慢运动的图层，相邻镜头换底色，内容平面有轻微 3D 转动
- 装饰不能被读成内容：公式只是符号，不带具体数字
- 密集图表要给足画面，而不是排成一排小卡片
- 人物照片不裁头，同一张照片不重复用，证书永远端正
- 学校提供的人名、照片、数字原样使用，不编造

## 许可

- 本仓库的代码和文档：[MIT](LICENSE)
- 字体：不随仓库分发，各自遵循其授权
- Remotion 有自己的许可证：个人、小团队和非营利组织通常可免费使用，其他公司可能需要购买公司许可。使用前请阅读 [remotion.dev/license](https://www.remotion.dev/license)
- 演示图片由脚本生成，可随意使用

---

## English

**promo-film-looks** is an [Agent Skills](https://agentskills.io) skill for [Claude Code](https://claude.com/claude-code) and [OpenAI Codex](https://developers.openai.com/codex/skills), with two finished visual styles for institutional promo films (schools, colleges, institutes), built on [Remotion](https://www.remotion.dev/).

- **苹果风格 (glass)**: Apple-style frosted glass in blue, white and a little yellow. Per-shot grounds, live data graphics behind the glass, frameless rounded photos, card-style shot transitions.
- **华章版 (aurum, Aurum Nocturne)**: midnight lacquer with champagne type and gold-leaf titles, gold-rimmed frames, light leaks and a few flares.

One codebase renders both; the look is an input prop, so one timeline can ship as two editions. The skill includes a working template (scene kit, text-as-mask opener, near-full-screen card rail, headline-number emphasis, photo and certificate frames), render / QA / loudness-master / replacement-segment scripts, and the design principles behind the looks.

**Install**: copy the `promo-film-looks/` folder into `~/.claude/skills/` for Claude Code, or `~/.agents/skills/` for Codex (use `.claude/skills/` or `.agents/skills/` inside a project to scope it to that project). Fonts are not redistributed; see [assets/fonts/README.md](promo-film-looks/assets/fonts/README.md). Then ask something like "make a 3-minute admissions film for our school in the frosted-glass look". In Codex you can also name the skill with `$promo-film-looks`.

**Codex notes**: the skill was built and tested in Claude Code and has not yet been run end to end in Codex; issues are welcome. `npm install` needs network access and rendering starts a headless browser, so Codex's default sandbox may ask you to approve these commands. On Windows, run the bash scripts through Git Bash, not a bare `bash` in PowerShell, which may start WSL.

**Requirements**: Node.js 18+, FFmpeg, Python 3.8+, and Git Bash on Windows.

**Licence**: MIT for this repository. Fonts keep their own licences. Remotion has its own licence, and some companies need a paid company licence; see [remotion.dev/license](https://www.remotion.dev/license). All demo art is generated and fictional.
