# Design System — Processminer

The design system carried into the JSON-native (v3) UI essentially unchanged.
The tokens below are the single source of truth and are mirrored in
[`src/app/globals.css`](src/app/globals.css) `:root` — **defer to `globals.css`
for exact current values, and get explicit user approval before any visual
change.** The original German consultation doc is preserved at
[`legacy-docs/LEGACY-DESIGN.md`](legacy-docs/LEGACY-DESIGN.md).

## Product context

A tool where AI agents extract an SME's process knowledge through interactive
brainstorming, document it, and develop it into a target state. Users: process
SMEs (non-technical, time-poor) and the transformation team as consumers.
Domain: process & compliance documentation in regulated industries (initial
focus: banking). Type: data-dense desktop web app. **Memorable thing: "it takes
my work seriously."** Every design decision serves that single impression.

## Aesthetic direction

- **Direction:** Refined Utilitarian — function-first and dense like a tool,
  with a precision that signals care.
- **Decoration:** minimal — typography and whitespace carry the work.
- **Mood:** calm, precise, serious. Density without noise. A professional system
  of record, not a startup app.
- **Signature — provenance-first:** machine-drafted vs. human-confirmed is a
  quiet, first-class visual distinction (track-changes sensibility for
  AI-extracted knowledge), never a "✨ AI" effect.

## Typography

- **One family, app-wide:** **Geist** (humanist, calm, authoritative) for
  display, body, UI and labels.
- **Data / tables / IDs / sources:** **Geist Mono** (`tabular-nums`).
- **Stacks:** `--font: "Geist", -apple-system, system-ui, sans-serif` ·
  `--mono: "Geist Mono", ui-monospace, "SF Mono", monospace`.
- **Scale (`--text-*`):** 12 · 13 · 14 (body default) · 16 · 19 · 24 · 30 px.
  Hierarchy via weight (Regular 400 / Medium 500 / Semibold 600) and size — one
  family, disciplined. 12px is the floor (no sub-12 tier).

## Color

Restrained — neutral palette plus one brand accent. Colour is rare and
meaning-bearing. Light values (`:root`):

| Token | Light | Role |
|---|---|---|
| `--ink` | `#16181d` | text |
| `--muted` | `#6b7280` | secondary text |
| `--line` | `#e2e4e8` | borders |
| `--bg` | `#f7f8f8` | background |
| `--surface` | `#ffffff` | surfaces / cards |
| `--accent` | `#1e40af` | Deep Blue — primary actions, active state, brand |
| `--accent-soft` | `#e9eaf6` | agent-draft field bg, active nav |
| `--bright` | `#2563eb` | Bright Blue — links, info |

**Semantic = confidence tiers** (desaturated, calm — never alarming): high /
success `--hi #3f7d5c`, medium / warning `--mid #9a7b32`, low / error
`--lo #a8534a`, each with a soft background (`--hi-bg`, `--mid-bg`, `--lo-bg`).

**Dark mode** (`[data-theme="dark"]`): surfaces rethought — `--bg #101216`,
`--surface #181b21`, `--line #2a2e37`, `--ink #e8eaed`; accent lightened to
`#8095e8` (Deep Blue is too dark on dark); semantic colours ~15% desaturated.

**Workspace theming (`--ws-accent`)** — new in v3. The welcome/dashboard shell
flips its accent by module so the same components work in either theme:
**Processminer = blue** (`--ws-accent: var(--accent)`), **ArchitectMiner =
green** (`.ws-root[data-mod="am"]` → `--ws-accent: var(--hi)`).

## Spacing

- **Base unit:** 4px. Density: compact-comfortable (Tufte — high data-to-ink,
  never cramped).
- **Scale (`--space-*`):** 2xs(2) · xs(4) · sm(8) · md(12) · lg(16) · xl(24) ·
  2xl(32) · 3xl(48).

## Layout

- **Approach:** grid-disciplined — strict grid, predictable alignment.
- **App shell:** 3 columns — left section nav + progress · centre document
  canvas · right collapsible agent chat (overlays/floats when expanded; see
  roadmap R14 for the intended overlay polish).
- **Max content width:** document canvas ~720px (readable line length despite a
  dense app).
- **Viewport:** desktop-only, min width ~1280px. No mobile.
- **Border radius (`--r-*`):** sm 4px (fields, buttons, inputs) · md 6px (cards,
  panels) · pill 9999px only for confidence chips. Deliberately small — calm,
  not bubbly.

## Motion

- **Approach:** minimal-functional — only transitions that aid understanding
  (field commit, section-done, progressive draft skeleton). No decoration.
- **Easing:** enter `ease-out` · exit `ease-in` · move `ease-in-out`.
- **Duration:** micro 80–120ms · short 150–200ms · medium 250–300ms.

## Decisions log

| Date | Decision | Rationale |
|---|---|---|
| 2026-05-16 | Design system created | `/design-consultation`; memorable thing "takes my work seriously" |
| 2026-05-16 | Accent = Deep Blue `#1e40af` + Bright Blue `#2563eb` | one calm brand accent, familiar for compliance contexts; no external brand licences |
| 2026-05-16 | Font = Geist (display, body, mono) | OFL-licensed, humanist, calm; one family app-wide |
| 2026-05-17 | Token system in `globals.css` (`--text-*`, `--space-*`, `--r-*`); 12px floor; shared `:focus-visible` | `/design-review` — scale enforced, not hand-typed; consistent across screens |
| v3 migration | Design system carried into the JSON-native UI unchanged | tokens verified against current `globals.css` |
| v3 migration | Added `--ws-accent` workspace theming (blue PM / green AM) | one component set serves both Processminer and ArchitectMiner modes |
