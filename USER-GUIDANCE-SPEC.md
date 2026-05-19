# User Guidance & Help — Implementation Spec

Implementation-ready specs for five user-guidance improvements, drawn from the
20-idea shortlist. Idea numbers match that list.

- **1** — First-run guided tour overlay
- **10** — Active-skill state indicator in the chat
- **11** — Markdown tables in the chat (styling — rendering already wired)
- **17** — Element-card field hints
- **20** — Help center behind a `?` button

All five touch the SME-facing surface; none change skill behaviour or the wiki
schema's *content*. Read `DESIGN.md` before implementing any visual element.

---

## Idea 1 — First-run guided tour overlay

### Problem
A new SME lands on `ProcessDocScreen` with a top bar of unlabelled icon
buttons, a collapsed right-rail assistant, and a document canvas — no
explanation of the chat-driven workflow, the approval model, or where to start.

### Goal
A one-time, dismissible, replayable guided tour that highlights the five
surfaces an SME must understand: the process switcher, the document canvas, the
top-bar action icons, the assistant rail, and an element card's approval
control.

### UX behaviour
- Fires automatically on first load when no completion flag is stored.
- Dimmed full-screen scrim with a "spotlight" cut-out over the current target
  (one element at a time), plus a tooltip card: step title, 1–2 sentence body,
  `Back` / `Next` / `Skip tour`, and a step counter (`2 / 5`).
- `Esc` or `Skip tour` ends it; reaching the last step's `Done` ends it. Either
  way, the completion flag is written.
- Replayable any time from the Help center (Idea 20) — "Replay the tour".
- Steps (in order):
  1. **Process switcher** (`.topbar` ProcessSwitcher) — "Switch between
     processes, or create a new one."
  2. **Document canvas** (main `.docview` column) — "Each process is a living
     wiki of elements across six areas."
  3. **Top-bar actions** (`.tb-icons`) — "Search, upload a document, run the
     foundational walkthrough, and lint — all from here."
  4. **Assistant rail** (`.rail-r`) — "The assistant runs the process skills.
     Ask it to document a process or challenge any element."
  5. **Approval control** (first `.el .approval` on screen, if any) — "Every
     element is AI-drafted until you approve it. This is where you sign off."

### Implementation

**New component — `src/components/GuidedTour.tsx`** (client component):

```ts
interface TourStep {
  /** CSS selector for the element to spotlight. */
  target: string;
  title: string;
  body: string;
  /** Tooltip placement relative to the target. */
  placement: "bottom" | "top" | "left" | "right";
}

export default function GuidedTour({
  steps,
  onClose,           // called on skip OR done — caller writes the flag
}: { steps: TourStep[]; onClose: () => void }) { … }
```

Behaviour inside the component:
- On each step, `document.querySelector(step.target)?.getBoundingClientRect()`
  drives the spotlight rectangle and tooltip position. Recompute on
  `window` `resize` / `scroll`.
- If a step's target is missing (e.g. no element card on screen), auto-skip to
  the next step so the tour never dead-ends.
- Render via a portal over everything; the scrim is four divs around the
  cut-out (or one SVG mask) so the highlighted target stays visually crisp.
- Trap focus inside the tooltip card; restore focus on close.

**`ProcessDocScreen.tsx`:**
- Add state: `const [tourOpen, setTourOpen] = useState(false)`.
- On mount, in a `useEffect`:
  ```ts
  if (!localStorage.getItem("pm-tour-done")) setTourOpen(true);
  ```
  This matches the existing `localStorage` key convention (`pm-chat-width`,
  `pm-elem-filter`).
- Define the `TOUR_STEPS: TourStep[]` constant near the other module-level
  constants (`AREA_NEXT`, `SPECIALIST_COPY`).
- Render `{tourOpen && <GuidedTour steps={TOUR_STEPS} onClose={closeTour} />}`.
- `closeTour` sets `localStorage.setItem("pm-tour-done", "1")` and
  `setTourOpen(false)`.
- Expose `setTourOpen(true)` to the Help center (Idea 20) for replay — replay
  must NOT clear the done-flag (it is already set).

**CSS (`globals.css`):** `.tour-scrim`, `.tour-spotlight` (with a soft box
ring), `.tour-card`, `.tour-card-actions`, `.tour-step-count`. Use `--accent`
for the ring and primary button; respect `data-theme="dark"`.

### Edge cases
- First load is often a brand-new/empty process — step 5's target may not
  exist; the auto-skip rule covers it.
- Server-side render: gate the mount `useEffect` on the client; never read
  `localStorage` during render.
- A skill turn could be streaming during the tour — the tour is read-only
  (no clicks pass through the scrim), so it cannot corrupt a run.

### Effort
~Half a day. One new component (~150 lines), ~40 lines of CSS, ~15 lines of
wiring in `ProcessDocScreen.tsx`.

---

## Idea 10 — Active-skill state indicator in the chat

### Problem
When a skill runs, `AgentChat` shows only a generic activity line —
`activity || "Working…"` (`AgentChat.tsx:219-224`). The SME cannot tell *which*
specialist is working (process specialist? lint? a sourcing run?) or that a
long-running skill is even a "skill" versus a free-text reply. Skill turns are
invoked through wrapper functions (`runAreaSpecialist`, `runLint`,
`runFoundational`, `runCouncil`, `runAddEntry`, …) but the skill name is buried
in the message text and never tracked in state.

### Goal
A labelled indicator at the top of the chat scroll while a known skill runs:
the skill's friendly name, an "running" state, and the live activity line
underneath it.

### UX behaviour
- When a skill turn starts, a pinned chip appears above the pending line:
  `✦ Process Specialist · running` with the streamed activity line below it.
- For free-text turns (the SME typed into the box, no wrapper), no chip — just
  the existing `Working…` line, since there is no named skill.
- The chip clears when the turn completes (the `done`/`error` SSE event).
- Friendly names come from a single map; reuse the existing per-specialist
  display copy (`SPECIALIST_COPY`, `ProcessDocScreen.tsx:137`) and extend it to
  cover non-specialist skills (`run-lint`, `foundational-run`,
  `council-review`, `add-entry`, `comment-review`).

### Implementation

**`ProcessDocScreen.tsx`:**
- Add state: `const [activeSkill, setActiveSkill] = useState<string | null>(null)`.
- Extend `handleSend`'s `opts` with `skill?: string`:
  ```ts
  function handleSend(
    text: string,
    opts?: { onComplete?: () => void; unscoped?: boolean;
             displayText?: string; skill?: string },
  ) { … }
  ```
- At the start of `handleSend`: `setActiveSkill(opts?.skill ?? null)`.
- In the `.finally(...)` block (alongside `setChatPending(false)`):
  `setActiveSkill(null)`.
- Every `runX` wrapper passes its skill name. They already embed it in the
  message string — e.g. `runAreaSpecialist` builds
  `Run the ${skill} skill …`; pass `{ skill }` through to `handleSend`.
  Wrappers to update: `runAreaSpecialist`, `runLint`, `runFoundational`,
  `runCouncil`, `runAddEntry`, the deep-dive/comment-review callers.
- Pass two new props to `<AgentChat>`: `activeSkill` and a resolved label.

**Skill → friendly-name map** (new module-level constant, or fold into the
extended `SPECIALIST_COPY`):
```ts
const SKILL_LABEL: Record<string, string> = {
  "process-specialist": "Process Specialist",
  "control-compliance-specialist": "Control & Compliance Specialist",
  "client-journey-specialist": "Client Journey Specialist",
  "innovation-analyst": "Innovation Analyst",
  "it-architect": "IT Architect",
  "run-lint": "Lint",
  "foundational-run": "Foundational Run",
  "council-review": "Target Council Review",
  "add-entry": "Add Entry",
  "comment-review": "Comment Review",
};
```

**`AgentChat.tsx`:**
- Add prop `activeSkillLabel?: string | null`.
- Render the chip just inside `.chat-scroll`, before the `pending` block, only
  when `pending && activeSkillLabel`:
  ```tsx
  {pending && activeSkillLabel && (
    <div className="chat-skill-chip">
      <span className="chat-skill-glyph">✦</span>
      {activeSkillLabel} <span className="chat-skill-state">· running</span>
    </div>
  )}
  ```
- The existing `pending` activity line stays as-is, below the chip.

**Note — web-sourcing runs** already have their own `sourcing` state
(`{ status, kind, text }`) and a separate UI path; this indicator is for the
*chat-driven* skill turns only. Keep them separate to avoid double-reporting.

### Edge cases
- `restartSession()` mid-run — guarded by `if (chatPending) return`, so
  `activeSkill` cannot be orphaned.
- An `error` SSE event still flows through `.finally`, so the chip clears on
  failure too.
- A skill that scaffolds a new process triggers `switchProcess` /
  `router.refresh()`; ensure `activeSkill` is component state that survives the
  refresh (it is — `router.refresh()` re-renders, it does not remount).

### Effort
~2–3 hours. State + `opts` plumbing through ~6 wrapper functions, one small
CSS block, one chip in `AgentChat`.

---

## Idea 11 — Markdown tables in the chat (styling)

### Status correction
The original walkthrough (`WALKTHROUGH-OBSERVATIONS.md` §5a) reported chat
tables rendering as raw `|---|` pipe text. **The rendering half is already
fixed**: `AgentChat.tsx` imports `remarkGfm` and passes it to `ReactMarkdown`
(`remarkPlugins={[remarkGfm]}`, line 214) — added in commit `450966d`. GFM
tables now produce real `<table>` / `<thead>` / `<tr>` / `<td>` nodes.

**What is still missing: CSS.** `globals.css` styles `.docview table`,
`.raci-table`, and `.source-result-body table`, but there is **no
`.chat-msg table` rule**. A table in the chat currently renders as an unstyled
HTML table — no borders, no padding, no header weight — which is only
marginally more legible than raw pipes. The Innovation Analyst emits tables
routinely (trends, ideas, risks, transformation decisions).

### Goal
Chat tables render as compact, bordered, theme-aware tables that fit the narrow
(300–720px, drag-resizable) assistant rail.

### Implementation

**`globals.css` — add a `.chat-msg table` block** (model it on the existing
`.docview table` rule at line 363, sized down for the rail):

```css
.chat-msg table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.5em 0;
  font-size: var(--text-xs);
  display: block;          /* allow horizontal scroll on a narrow rail */
  overflow-x: auto;
}
.chat-msg th,
.chat-msg td {
  border: 1px solid var(--line);
  padding: 4px 8px;
  text-align: left;
  vertical-align: top;
}
.chat-msg th {
  background: var(--surface-2);
  font-weight: 600;
}
/* The user bubble has a coloured background + white text — keep borders
   readable against it. */
.chat-msg.user th,
.chat-msg.user td { border-color: rgba(255, 255, 255, 0.35); }
.chat-msg.user th { background: rgba(255, 255, 255, 0.12); }
```

(Confirm the exact `--surface-2` / `--line` token names against `DESIGN.md` and
the existing variables in `globals.css`; substitute the project's real tokens.)

**No component change needed.** `AgentChat`'s `buildComponents` already
overrides `td` and `th` (they are in the `LINKABLE` list) for element-id
linkification; the default `table` / `thead` / `tbody` / `tr` renderers are
fine and need no override.

### Verification
After the change, with the dev server running, send a message that makes a
specialist emit a table (or paste a GFM table into the chat input) and confirm:
`document.querySelectorAll('.chat-msg table').length > 0` and the table has
visible borders in both light and dark themes, at both 300px and 720px rail
widths.

### Edge cases
- Very wide tables in a 300px rail — `display: block; overflow-x: auto` lets
  the table scroll horizontally instead of breaking the layout.
- Tables inside the user bubble (rare — the SME pasting one) — the
  `.chat-msg.user` override keeps borders visible on the accent background.

### Effort
~30 minutes. CSS only.

---

## Idea 17 — Element-card field hints

### Problem
`ElementCard` renders type-specific scalar fields from the schema (`fieldSpecs`,
each a `FieldSpec` with `key` / `label` / `suffix` / `urlKey`). In edit mode
each field is a bare `<input>` with only its label (`el-edit-fields`,
`ElementCard.tsx:649-667`). Nothing tells the SME what belongs in the field.
The walkthrough (§2a) caught a systematic defect — three metrics with the
*target* figure wrongly placed in `value` and `target` left empty — exactly the
class of error an inline hint prevents. Prose blocks already have this:
`BlockSpec.purpose` is shown in the structure panel. Scalar fields have no
equivalent.

### Goal
Each scalar field carries a short hint, schema-defined, shown in edit mode under
the input; and an empty *required* field is visibly flagged.

### Implementation

**Schema type — `src/lib/wiki.ts`:** add an optional `hint` to `FieldSpec`:
```ts
export interface FieldSpec {
  key: string;
  label: string;
  suffix?: string;
  urlKey?: string;
  /** One-line guidance shown under the input in edit mode. */
  hint?: string;
}
```

**Schema data — `schema/process-schema.json`:** add a `hint` string to each
field under every type's `frontmatter.fields`. Priority types (from the
walkthrough): the `metric` type's `value` and `target` fields. Suggested copy:
- `value` — "The measured actual, today. Leave empty if the process document
  states only a target — an unmeasured metric is itself worth flagging."
- `target` — "The goal / SLA figure (e.g. 'same business day'). The stated
  figure in a design document is almost always the target, not the actual."
- `owner` — "For a step: who performs it (or 'system / unassigned' if
  automated). For a control: the accountable *function*, never a named person."

**`ElementCard.tsx` — edit mode** (`el-edit-fields`, lines 649-667): render the
hint under each input:
```tsx
{fieldSpecs.map((f) => {
  const isRequired = required?.includes(f.key);
  const empty = !(fieldValues[f.key] ?? "").trim();
  return (
    <label className="el-edit-field" key={f.key}>
      <span>
        {f.label}
        {isRequired && <span className="el-field-req" aria-hidden> *</span>}
      </span>
      <input
        value={fieldValues[f.key] ?? ""}
        className={isRequired && empty ? "el-field-input-missing" : ""}
        onChange={(e) => setFieldValues({ ...fieldValues, [f.key]: e.target.value })}
      />
      {f.hint && <span className="el-field-hint">{f.hint}</span>}
    </label>
  );
})}
```
The `required` array is `FrontmatterSpec.required` — already in the schema
(`wiki.ts:68`). It must be threaded to `ElementCard` as a prop (the parent
resolves `fieldSpecs` from the schema today; resolve `required` alongside it and
pass it through — add `required?: string[]` to the props).

**`ElementCard.tsx` — display mode** (`el-fields`, lines 668-715): keep it
compact — do not show the full hint. Instead, when a *required* field is empty,
render a subtle flag chip in the `el-fields` row: `Target: — needs a value`.
This makes the walkthrough's "metric with empty target" visible without
opening the card. (Display mode currently renders nothing for an empty field —
`if (!val) return null` — change that to render the flag when the key is
required.)

**CSS (`globals.css`):** `.el-field-hint` (small, muted, like
`.el-tpl-purpose`), `.el-field-req` (accent asterisk), `.el-field-input-missing`
(warning-coloured input border, reuse the `.el-edit-text.has-warn` treatment),
`.el-field-flag` (the display-mode "needs a value" chip).

### Edge cases
- A field with both `urlKey` and a hint — hint still shows; it describes the
  value, not the link.
- Sourced element types — they use `fieldSpecs` too; only add hints where they
  add value, an empty `hint` simply renders nothing.
- Optional empty fields — no flag, no nag. Only *required* empties are flagged.

### Effort
~Half a day. Type change + schema data entry (the bulk — one hint per field
across all types, or a prioritised subset), ~25 lines in `ElementCard`, ~20
lines CSS, plus threading `required` through the parent.

---

## Idea 20 — Help center behind a `?` button

### Problem
There is no single place to learn the app. The QER workflow, the element-type
vocabulary (ID prefixes `PS`, `CP`, `CG`, `TR`, …), the approval-vs-relevance
model, the foundational run, triage, and the keyboard shortcuts (the ⌘K
`CommandPalette` exists but is undiscoverable) are all implicit. A new SME has
nowhere to look.

### Goal
A `?` icon in the top bar opening a Help center modal with four tabs: an app
overview, a vocabulary glossary, a workflow explainer, and keyboard shortcuts —
plus a "Replay the guided tour" action (Idea 1).

### UX behaviour
- `?` icon added to `.tb-icons`, last before (or after) the user icon.
- Opens a centred modal (same overlay pattern as `CommandPalette` /
  `UploadModal`); `Esc` and a backdrop click close it.
- Tabs:
  1. **Overview** — what ProcessMiner is, the six areas, the AI-drafts /
     SME-approves model. Ends with a `Replay the guided tour` button →
     `setTourOpen(true)`.
  2. **Glossary** — element types and their ID prefixes, "draft vs approved",
     "relevant vs disregard", provenance tags (`SME` / `DOC` / `PROPOSED` /
     `WEB` / `LEGACY` — these already exist as `PROV_LABEL` in
     `ElementCard.tsx:42`). Searchable with a filter box.
  3. **Workflow** — the path: new process → ingest a document (or start a
     specialist) → triage → foundational run → source the forward view →
     target state → council review. A numbered list, each step one sentence.
  4. **Shortcuts** — ⌘K search, `Esc` to close panels, `Enter` to send in the
     chat, `Shift+Enter` for a newline.

### Implementation

**Content source.** Two viable approaches:
- **(a) Static, in-component** — define the glossary/workflow as TS constants
  in the new component. Simplest; pick this unless the content must be
  SME-editable.
- **(b) Schema-driven glossary** — `wiki.ts` already declares a `GlossaryTerm`
  interface (line 187) and `ProcessDoc` may carry glossary terms. If that field
  is populated per-process, the glossary tab can render it. Check whether
  `GlossaryTerm` is wired to real data before relying on it; if it is unused,
  go with (a) and treat the static glossary as the source of truth for the
  *app vocabulary* (element types, statuses) — which is process-independent
  anyway and should not live per-process.

Recommended: **(a)** for the app-vocabulary glossary (element types, statuses,
provenance) since it is the same for every process. Derive the element-type
list from the schema at runtime so it never drifts:
`Object.values(schema.elementTypes)` gives `{ label, idPrefix }` per type — the
glossary's "prefix → meaning" table builds itself.

**New component — `src/components/HelpCenter.tsx`** (client component):
```ts
export default function HelpCenter({
  open,
  onClose,
  schema,            // for the auto-built element-type glossary
  onReplayTour,      // () => setTourOpen(true)
}: {
  open: boolean;
  onClose: () => void;
  schema: Schema;
  onReplayTour: () => void;
}) { … }
```
- Tab state internal to the component.
- Glossary tab: derive the prefix table from `schema.elementTypes`; append the
  static status/provenance definitions.
- Reuse `CommandPalette`'s overlay/modal CSS conventions for visual
  consistency.

**`ProcessDocScreen.tsx`:**
- Add state `const [helpOpen, setHelpOpen] = useState(false)`.
- Add a new top-bar button in `.tb-icons` (mirror the existing
  `Tooltip` + `tb-icon` + `IconX` pattern):
  ```tsx
  <Tooltip label="Help">
    <button className="tb-icon" onClick={() => setHelpOpen(true)}
            aria-label="Help">
      <IconHelp />
    </button>
  </Tooltip>
  ```
- Add an `IconHelp` SVG next to the other topbar icon components
  (`IconSearch`, `IconLint`, …) — a stroked `?` in a circle, same
  `viewBox="0 0 24 24"` convention.
- Render `<HelpCenter open={helpOpen} onClose={() => setHelpOpen(false)}
  schema={schema} onReplayTour={() => { setHelpOpen(false); setTourOpen(true); }} />`.

**CSS (`globals.css`):** `.help-overlay`, `.help-modal`, `.help-tabs`,
`.help-tab` (+ `.active`), `.help-body`, `.help-glossary-row`,
`.help-search`. Reuse `cmdk-*` spacing/tokens where practical.

### Edge cases
- Opening Help while a skill streams — read-only modal, no interference.
- ⌘K and the Help modal both open — `?` and `CommandPalette` are independent;
  fine to allow, or close one when the other opens (low priority).
- Dark theme — every surface must honour `data-theme="dark"`.

### Effort
~1 day. One new component (~250 lines incl. static content), one topbar icon +
button, ~60 lines CSS. The static glossary/workflow copy is the main writing
effort.

---

## Suggested sequencing

1. **Idea 11** (~30 min, CSS only) — quickest, fixes a visible defect.
2. **Idea 10** (~½ day) — small, self-contained, high everyday value.
3. **Idea 17** (~½ day) — needs schema-data writing; prevents real content
   defects.
4. **Idea 20** (~1 day) — depends on nothing; build before Idea 1 so the tour
   has a "replay" home.
5. **Idea 1** (~½ day) — build last; wires its replay entry point into the Help
   center from Idea 20.
