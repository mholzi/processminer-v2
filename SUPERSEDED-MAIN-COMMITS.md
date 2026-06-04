# Superseded main commits

> Audit generated before replacing `main` with `feature/json-native-architecture` as the new baseline.
> Lists every commit currently on `main` but **not** on the JSON-native branch, **excluding commits that only touched wiki content** (`wiki/`, `raw-sources/`).
> These changes will be superseded when the branch becomes main — use this to decide what must be re-ported onto the new baseline.

- **Fork point (merge-base):** `6895002` — feat(architectminer): real architect data layer + welcome refactor
- **Old main tip:** `b858dff` — docs(onepager): narrative + layout pass + 4-page PDF export
- **New baseline:** `b6f7b64` — feature/json-native-architecture
- **Total main-only commits:** 43  |  **Wiki-only (excluded):** 2  |  **Code-touching (below):** 41

Wiki-only commits excluded: `fae26d3` (docs(ddmm) COMP-DDMM-001), `40dcf9e` (dogfood run test process).

---

## `b858dff` — docs(onepager): narrative + layout pass + 4-page PDF export

*2026-05-29 · Markus Holzhauser*

Narrative
- Slide 1 — drop the audit angle; lead with hours-not-quarters and
  immediately-traceable docs. Replace stats grid with three benefit
  bullets: standardised documentation, live capturing with SME, no
  endless workshops. Drop "for banks" framing from the eyebrow.
- Slide 2 — strip "Onepager v0.1" and the processminer.local footer.
- Slide 3 — Karpathy gist date updated; drop the "banking process
  documentation" reference; deeper explanation of his core argument
  (problem-with-RAG, wiki-as-artifact, read/write asymmetry, three
  file layers, Processminer's per-heading provenance extension).
- Slide 4 — add a real /source-cx competitor card screenshot as proof
  of auto-research output. Genericise Anthropic / Claude Code CLI to
  "external LLM provider" + "local AI-agent runtime". Drop LOC / script
  counts from footer, keep skill count.

Layout
- Unify title header across all four slides: 200px row, eyebrow 14px,
  H1 44px, lede 18px, 16px row-gap. Same eyebrow y-position on every
  slide so the title rhythm reads consistently.
- Fix image-overflow bug on slide 1: .shot cards were flex containers
  in CSS grid cells with no enforced row height, so they auto-grew to
  the image's intrinsic size and pushed the screenshots 66px into the
  footer area. Pin .bottom grid-template-rows: 100% and add
  height: 100%; min-height: 0 to .shot, .hero-shot, and slide 4's
  .shot-frame.
- Align footer y-position across all four slides (slide 1 was 8px short
  of the content area; bottom-row 192 → 200).

PDF export
- Add pm-pdf.mjs — CDP helper that drives Chrome headless to render the
  deck to a 4-page PDF at native 1920×1080 (20" × 11.25", 16:9). Chrome
  --print-to-pdf ignores CSS @page so we use Page.printToPDF with
  explicit paperWidth/paperHeight.
- Generated public/onepager-deck.pdf — drop straight into a PowerPoint
  slide or print as-is.

Assets
- onepager-assets/05-competitor.png — Bank Guarantee Issuance > Competitor
  CX section, captured via pm-shot-competitor.mjs (CDP, dismisses the
  first-run tour, drills into the section, screenshots).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 pm-pdf.mjs                               |  61 +++++++++++++++
 pm-shot-competitor.mjs                   |  62 ++++++++++++++++
 public/onepager-assets/05-competitor.png | Bin 0 -> 180948 bytes
 public/onepager-deck.html                | 206 +++++++++++++++++++++++++++++++++------------------
 public/onepager-deck.pdf                 | Bin 0 -> 922864 bytes
 public/onepager-slide-2.html             |  10 +--
 public/onepager-slide-3.html             |  14 ++--
 public/onepager-slide-4.html             |  73 +++++++++++-------
 public/onepager-slide.html               |  74 +++++++++---------
 9 files changed, 355 insertions(+), 145 deletions(-)
```

---

## `953f817` — Docs Clean up

*2026-05-29 · Markus Holzhauser*

**Non-wiki files changed:**

```
 AI-GOVERNANCE-CHANGESET.md        |  616 -------------------------
 AI-GOVERNANCE-ROADMAP.md          |  835 ----------------------------------
 ROADMAP.md                        | 1383 ---------------------------------------------------------
 public/AI-GOVERNANCE-CHANGESET.md |  616 -------------------------
 public/AI-GOVERNANCE-ROADMAP.md   |  835 ----------------------------------
 public/ROADMAP.md                 | 1383 ---------------------------------------------------------
 6 files changed, 5668 deletions(-)
```

---

## `7899697` — chore(scripts): add pm-shot CDP screenshot helpers

*2026-05-29 · Markus Holzhauser*

Two small Node helpers used to capture the onepager screenshots in
public/onepager-assets/ from the running app at localhost:3000:

- pm-shot.mjs — drives one headless Chrome via CDP through the
  authenticated dashboard, dismisses the first-run tour, clicks into
  Sepa Payments, captures dashboard / triage / process-steps.
- pm-shot-architect.mjs — same setup, drills into the Target
  Architecture section to capture the ArchitectMiner shot.

Both mint a signed pm_session cookie locally (HMAC over
PM_SESSION_SECRET from .env.local) so headless Chrome bypasses the
login screen without scraping the live session.

Throwaway dev tooling; kept in the repo so the onepager screenshots
can be regenerated when the UI evolves.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 pm-shot-architect.mjs |  51 +++++++++++++++++++++++++++++++
 pm-shot.mjs           | 117 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 168 insertions(+)
```

---

## `1e347a6` — docs: AI governance roadmap, changeset, and Phase 2 product roadmap

*2026-05-29 · Markus Holzhauser*

Adds three planning documents authored in a parallel session, plus
their HTML-rendered views served from public/ for in-browser reading:

- ROADMAP.md — Phase 2 product roadmap (Processminer + ArchitectMiner
  candidate ideas, bank-landscape framing, positioning principles)
- AI-GOVERNANCE-ROADMAP.md — AI governance framework: controls,
  conformance review process, audit hooks, secrets handling
- AI-GOVERNANCE-CHANGESET.md — concrete changeset that lands the
  governance framework into the codebase

The public/*.md copies are byte-identical to the root copies — the
duplication serves the static rendering. Each .html file is the
in-browser-readable render of the corresponding .md.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 AI-GOVERNANCE-CHANGESET.md          |  616 +++++++++++++++++++++++
 AI-GOVERNANCE-ROADMAP.md            |  835 +++++++++++++++++++++++++++++++
 ROADMAP.md                          | 1383 ++++++++++++++++++++++++++++++++++++++++++++++++++
 public/AI-GOVERNANCE-CHANGESET.md   |  616 +++++++++++++++++++++++
 public/AI-GOVERNANCE-ROADMAP.md     |  835 +++++++++++++++++++++++++++++++
 public/ROADMAP.md                   | 1383 ++++++++++++++++++++++++++++++++++++++++++++++++++
 public/ai-governance-changeset.html | 1503 +++++++++++++++++++++++++++++++++++++++++++++++++++++++
 public/ai-governance-roadmap.html   |  894 +++++++++++++++++++++++++++++++++
 public/roadmap.html                 | 1262 ++++++++++++++++++++++++++++++++++++++++++++++
 9 files changed, 9327 insertions(+)
```

---

## `44f8ffa` — docs(onepager): add 4-slide product onepager deck

*2026-05-28 · Markus Holzhauser*

A self-contained 1920x1080 product onepager pitching Processminer to a
non-engineering audience (Head of Product framing). Four slides plus a
navigable HTML deck wrapper:

- slide 1 — the pitch (problem / pitch / outcome + product shots)
- slide 2 — two modules: ProcessMiner vs ArchitectMiner side-by-side
  with the section ownership for each, and the handoff strip
- slide 3 — Karpathy's LLM Wiki pattern explained: the problem with
  naive RAG, the wiki-as-artifact move, the read/write asymmetry, the
  three-layer file diagram, plus Processminer's per-heading provenance
  extension
- slide 4 — auto-research skills (/source-*) and the trust model
  (files local, inference via Anthropic API, no RAG)

onepager-deck.html is the navigable wrapper (arrow keys, number keys,
dot indicators, hash routing, ?export=1 mode for PNG capture). The
individual onepager-slide-N.html files are the standalone sources used
for PNG export to slide-N-1920x1080.png — ready to drop straight into
PowerPoint as 16:9 widescreen slides.

Screenshots in onepager-assets/ are captured from the running app via
headless Chrome + CDP (see pm-shot.mjs, untracked).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 public/onepager-assets/01-dashboard.png      | Bin 0 -> 108129 bytes
 public/onepager-assets/02-triage.png         | Bin 0 -> 139691 bytes
 public/onepager-assets/03-steps.png          | Bin 0 -> 147455 bytes
 public/onepager-assets/04-target-arch.png    | Bin 0 -> 95719 bytes
 public/onepager-assets/slide-1-1920x1080.png | Bin 0 -> 280191 bytes
 public/onepager-assets/slide-1920x1080.png   | Bin 0 -> 280191 bytes
 public/onepager-assets/slide-2-1920x1080.png | Bin 0 -> 272708 bytes
 public/onepager-assets/slide-3-1920x1080.png | Bin 0 -> 331358 bytes
 public/onepager-assets/slide-4-1920x1080.png | Bin 0 -> 263574 bytes
 public/onepager-deck.html                    | 767 +++++++++++++++++++++++++++++++++++++++++++++++
 public/onepager-slide-2.html                 | 265 ++++++++++++++++
 public/onepager-slide-3.html                 | 280 +++++++++++++++++
 public/onepager-slide-4.html                 | 176 +++++++++++
 public/onepager-slide.html                   | 230 ++++++++++++++
 public/onepager.html                         | 335 +++++++++++++++++++++
 15 files changed, 2053 insertions(+)
```

---

## `d3eedb8` — docs(architecture): update target-vs-current comparison for v0.4.0

*2026-05-28 · Markus Holzhauser*

Original draft was against v0.3.0 with the orchestrator listed as
"Not consolidated" / pending design plan. v0.4.0 shipped the
orchestrator, so the comparison needs to reflect that.

Changes:
- Header: baseline updated to v0.4.0; subtitle now reads "five of seven
  diagram concepts match exactly; one deliberate Karpathy-layer-2
  divergence; none pending."
- Summary table: Orchestrator row flips from "Not consolidated" to
  "Matches", pointing at src/lib/orchestrator.ts.
- Section 3 (Orchestrator) rewritten end-to-end — describes
  buildOrchestratorState + buildAttentionFeed, the action vocabulary,
  the weight formula preserved verbatim from pmAttentionForDoc,
  the 13 unit tests, the v0.4.0 release link, and the WelcomeScreen
  migration vs. the deliberate TriagePanel non-migration.
- Hard principle box (never contaminate Karpathy wiki logic) carried
  through.
- Net takeaway: "Six of seven concepts now match exactly" + the one
  deliberate divergence + "nothing remaining pending".
- Footer marks this as the post-v0.4.0 revision.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 docs/architecture-comparison.html | 60 +++++++++++++++++++++++++++++++----------------------------
 1 file changed, 32 insertions(+), 28 deletions(-)
```

---

## `641078f` — fix(ui): runSourcing routes through handleSend, not raw fetch

*2026-05-28 · Markus Holzhauser*

The "✦ Source from the web" CTA on empty Innovation / CX / Regulation
sections was firing source-* skills via a raw `fetch("/api/session", {
sessionId: null })` instead of the chat pipeline. The skill DID run —
the server log line `POST /api/session 200 in 15.4min` proves it
finished and produced 8 competitor-cx + 4 cx-benchmarks files — but
the user had no visibility into it: no chat message, no active-skill
chip, no watchdog, no error surface. The top-bar "Sourcing…" pill
stayed lit indefinitely while the work happened invisibly.

The dogfood run (2026-05-28-1502) was the canary: Stage 4 sat for
25+ minutes with no visible progress, declared the skill broken,
and stopped. The wiki turned out to have content land at 16:53–16:55,
4–6 min after the QA report was written at 16:49.

Fix: rewrite `runSourcing` in src/app/ProcessDocScreen.tsx to use
`handleSend(text, opts)` matching the rest of the codebase
(runLint, runAreaSpecialist, runCouncilReview). The CTA now:
  • opens the chat panel
  • posts a visible user message ("Source <Area> content from the web (source-X).")
  • surfaces the active-skill chip + watchdog
  • reuses the session worker (87s vs 15.4min in the dogfood log)
  • surfaces errors inline via the existing chat error path

Verified live: clicking the source-innovation CTA produces the
expected chat state (user message + agent "Working…").

Walkthrough cleanup: reverted the Stage 4 5-minute fail-safe tweak
that this same dogfood run had auto-applied to
.claude/skills/dogfood-run/SKILL.md. That tweak was based on the
wrong diagnosis (silent failure) and would have falsely flagged
legitimate slow runs (15–60 min is the normal source-* range). Replaced
with an honest "expect 15–60 minutes; watch the chat for progress"
note. Reversal documented in REVISIONS.md with a verbatim restore
path if anyone wants the original fail-safe back later.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 .claude/skills/dogfood-run/REVISIONS.md | 80 +++++++++++++++++++++++++++++++++++++++++++++
 .claude/skills/dogfood-run/SKILL.md     |  9 ++++-
 src/app/ProcessDocScreen.tsx            | 94 +++++++++++++++++------------------------------------
 3 files changed, 118 insertions(+), 65 deletions(-)
```

---

## `947ee0d` — feat(orchestrator): consolidate cross-process attention into src/lib/orchestrator.ts

*2026-05-28 · Markus Holzhauser*

Builds the v0.4 read-side orchestrator per ORCHESTRATOR-PLAN.md.
Pure-data functions over ProcessDoc + ProcessView — no writes, no new
sidecars, nothing inside wiki/. The Karpathy LLM-Wiki principle stays
intact (read-only consumer, deterministic, transient output).

New src/lib/orchestrator.ts exports:

  • buildOrchestratorState(view, doc) — per-process. Returns ranked
    actions + a coarse health summary (clean, conflicts, lint, comments,
    runResumable). Action vocabulary v1: resolve-ingest-conflict,
    resolve-lint-finding, address-comment, resume-foundational-run.
  • buildAttentionFeed(docs) — cross-process. Splits docs into
    attentionRows (ranked) and cleanProcesses (no action items),
    matching the dashboard's existing ATTENTION column shape
    byte-identically.

Weight formula preserved verbatim from pre-v0.4 pmAttentionForDoc:
conflicts * 100 + lint * 5 + comments. The resume-foundational-run
action sits between conflicts and lint via WEIGHT_RUN_BASE + items
remaining, so a barely-started run beats a half-finished one.

Migrated:

  • src/components/WelcomeScreen.tsx — removed local pmAttentionForDoc;
    the dashboard's ATTENTION column now reads from
    buildAttentionFeed(docs).attentionRows. Verified in the dev server
    against sepa-payments + the bank-guarantee dogfood processes —
    same 5 rows, same order, same reasons text.

TriagePanel intentionally NOT migrated (revision note in
ORCHESTRATOR-PLAN.md): it does post-ingest specific work (ingest
receipt, confidence spread, untouched sections) that doesn't fit the
generic action vocabulary. Forcing it through the orchestrator would
bloat the vocabulary.

13 new tests in orchestrator.test.ts covering weight ordering,
clean-process detection, dismissed/resolved filtering, and the
attention-feed split. Total test:lint suite: 35 passed / 0 failed.

Plus docs/architecture-comparison.html — the target-vs-current HTML
report written earlier in the session (Confluence diagram vs v0.3.0
codebase, with the orchestrator gap that this commit closes).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 ORCHESTRATOR-PLAN.md              |  13 +-
 docs/architecture-comparison.html | 399 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 package.json                      |   2 +-
 src/components/WelcomeScreen.tsx  |  58 ++-------
 src/lib/orchestrator.test.ts      | 291 ++++++++++++++++++++++++++++++++++++++++++
 src/lib/orchestrator.ts           | 240 +++++++++++++++++++++++++++++++++++
 6 files changed, 956 insertions(+), 47 deletions(-)
```

---

## `8a6f355` — docs: ORCHESTRATOR-PLAN.md — v0.4 design (read-only, above the wiki)

*2026-05-28 · Markus Holzhauser*

Closes the "Orchestrator deferred to v0.3" open item from
TARGET-ARCH-PLAN.md. Design only — no code in this commit.

Key findings:
- The orchestrator already exists, scattered: pmAttentionForDoc in
  WelcomeScreen, TriagePanel, getCoverage, etc. v0.4 is consolidation
  into src/lib/orchestrator.ts, not greenfield.
- Shape: state machine over ProcessView + ProcessDoc sidecars. Pure
  function, no LLM call in the hot path. Authoring stays LLM-driven;
  routing stays deterministic.
- Action vocabulary v1: resolve-ingest-conflict, resolve-lint-finding,
  address-comment, resume-foundational-run. No next-element suggestion
  (foundational-run owns that), no skill-routing (chat input self-routes).
- Migration: pmAttentionForDoc moves to orchestrator.ts; widgets read
  from the new module; no on-disk format changes.

Hard principle pinned at the top: never contaminate Karpathy wiki logic.
The orchestrator is read-only over the wiki; persistence (if ever
needed) lives outside wiki/processes/. The three Karpathy layers stay
sacred.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 ORCHESTRATOR-PLAN.md | 230 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 230 insertions(+)
```

---

## `53c8ead` — docs(plan): mark TARGET-ARCH-PLAN shipped + add "What's still open"

*2026-05-28 · Markus Holzhauser*

Header gains a Status note linking the four shipped releases.

New "What's still open" section captures four items that are explicitly
NOT yet delivered:

  1. Orchestrator — deferred from Piece 2; ProcessView.state is the
     reserved seam.
  2. Cache benchmark — the v0.2/v0.3 cache claims are unmeasured against
     Anthropic's prompt cache.
  3. TS-side context builder — contextFor() in process-view.ts has no
     UI consumer yet; not urgent.
  4. Five intentionally-skipped skills — /conflict-resolution, /run-lint,
     /qer-session, /new-process, /dogfood-*.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 TARGET-ARCH-PLAN.md | 61 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 61 insertions(+)
```

---

## `cbac4d2` — fix(test): point derive_process_meta slug-taken test at a real process

*2026-05-28 · Markus Holzhauser*

The test fed "Cob 003" and expected slugTaken:true, but cob-003 was removed
from the wiki at some point (the wiki was restructured to its current
process set: bank-guarantee-issuance variants, debit-card-replacement,
sepa-payments, etc.). The assertion has been failing since at least HEAD
8df5961 — pre-existing on main when the v0.2 work started.

Switch to "Sepa Payments" — the canonical reference process this codebase
mocks against. The test now exercises the same intent ("a derived slug
that already exists on disk should be flagged") against a process that
will actually still be there next month.

Test suite: 104 passed, 0 failed (was 103 passed, 1 failed).

Closes the spawned task flagged during Piece 3 implementation.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 scripts/wiki/test_wiki_scripts.py | 5 ++++-
 1 file changed, 4 insertions(+), 1 deletion(-)
```

---

## `927d764` — feat(skills): migrate area-summary + 4 source skills to get_context.py

*2026-05-28 · Markus Holzhauser*

Five more skills migrated to call get_context.py for their process-meta
read instead of hand-reading wiki/processes/<slug>/index.md:

  • /area-summary       — Step 1 process-context read
  • /source-cx          — Step 1 domain read
  • /source-innovation  — Step 1 domain read
  • /source-regulation  — Step 1 domain + jurisdiction read
  • /source-target      — Step 1 whole-process domain read

The pattern is consistent: one CLI call returns the overview + section
progress (the STABLE-bucket process-meta channel), cached across the
skill's turns. Per-element reads in later steps stay manual where the
skill needs the full body of specific elements; this migration is
narrowly the process-meta replacement.

/conflict-resolution deliberately untouched — it operates on the
conflict entries themselves (documentSays/wikiSays), no element body
read needed before patching.

All four verbatim cross-skill blocks remain byte-identical; tests 103/1.

This is the final batch of the v0.3 skill rollout. The remaining
skills (qer-session, run-lint, new-process, dogfood-*) don't have
context-gathering patterns the new infrastructure targets.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 .claude/skills/area-summary/SKILL.md      | 14 +++++++++-----
 .claude/skills/source-cx/SKILL.md         | 12 +++++++-----
 .claude/skills/source-innovation/SKILL.md | 12 +++++++-----
 .claude/skills/source-regulation/SKILL.md | 19 +++++++++++--------
 .claude/skills/source-target/SKILL.md     |  7 ++++---
 5 files changed, 38 insertions(+), 26 deletions(-)
```

---

## `80726a0` — docs(skills): correct stale show_template.py source reference across 11 skills

*2026-05-28 · Markus Holzhauser*

Eleven skills told the LLM that show_template.py reads "from
schema/process-schema.json". Since v0.2.0-alpha that's no longer true —
show_template.py reads from schema/.derived/<type>.llm.json (the per-type
slice). The prose was lying to the LLM about where the contract comes
from, which matters when the model decides whether to read the source
schema as a fallback.

Pure prose change — no behavioural impact. Cross-skill verbatim blocks
unaffected.

Continues v0.3 skill rollout housekeeping.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 .claude/skills/client-journey-specialist/SKILL.md     | 2 +-
 .claude/skills/control-compliance-specialist/SKILL.md | 2 +-
 .claude/skills/domain-architect/SKILL.md              | 2 +-
 .claude/skills/innovation-analyst/SKILL.md            | 2 +-
 .claude/skills/it-architect/SKILL.md                  | 2 +-
 .claude/skills/process-specialist/SKILL.md            | 2 +-
 .claude/skills/solution-architect/SKILL.md            | 2 +-
 .claude/skills/source-cx/SKILL.md                     | 2 +-
 .claude/skills/source-innovation/SKILL.md             | 2 +-
 .claude/skills/source-target/SKILL.md                 | 2 +-
 .claude/skills/transformation-agent/SKILL.md          | 2 +-
 11 files changed, 11 insertions(+), 11 deletions(-)
```

---

## `85c256e` — feat(skills): /add-entry uses derived schemas + process-meta channel

*2026-05-28 · Markus Holzhauser*

Step 1's section-context read pattern simplified:

  • "Read schema/process-schema.json for the section ... then run
    show_template.py" → drop the schema read; show_template.py already
    reads from schema/.derived/<type>.llm.json (Piece 3). The derived
    file is the per-type slice; the source schema is no longer the
    direct input here.

  • "Read index.md for the process" → run get_context.py with the
    process-meta channel. One call returns the overview + section
    progress, replacing a hand-rolled file read.

The section-elements read at the middle bullet stays — get_context.py
is element-focused, not section-focused; reading the existing entries
to avoid duplicates is still the right pattern for that bullet.

Cross-skill blocks unaffected (check_skill_blocks.py green); tests 103/1.

Continues v0.3 skill rollout.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 .claude/skills/add-entry/SKILL.md | 19 +++++++++++++------
 1 file changed, 13 insertions(+), 6 deletions(-)
```

---

## `30131bf` — feat(skills): /comment-review uses get_context.py to set up

*2026-05-28 · Markus Holzhauser*

Step 1 of the comment-review walk previously had four separate reads: the
element file, the show_template type contract, notes.json, and "the
elements the comments touch on" hunted by hand. The first three of those
collapse into one get_context.py call — focal element + type contract +
related summaries — and the STABLE bucket caches across the per-comment
loop in Step 2.

The fallback for an obscure cited element stays explicit: if a specific
comment names something not in the summaries, read that file directly.
But the per-element summaries cover the common case.

All four cross-skill verbatim blocks remain byte-identical
(check_skill_blocks.py green); test suite 103/1.

Continues v0.3 skill rollout.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 .claude/skills/comment-review/SKILL.md | 16 ++++++++++------
 1 file changed, 10 insertions(+), 6 deletions(-)
```

---

## `255ba7b` — feat(skills): /document-ingest uses derived schemas + get_context.py

*2026-05-28 · Markus Holzhauser*

Two file-read patterns in the sub-agent prompt replaced:

  • "Read schema/process-schema.json for element types' frontmatter,
    relations and template headings" → run show_template.py <type>,
    which now reads from schema/.derived/<type>.llm.json (~50–80 lines)
    instead of the 2.8k-line source schema. Sub-agents on a slice of
    the outline only pay for the types they own.

  • "Read the section folder(s) for an existing element's body to
    decide how to merge a refine" → run get_context.py --slug --element
    for refine entries. One call returns the element + directly-related
    context as summaries, instead of hunting through the section folder
    and re-reading neighbours one at a time.

The cumulative win is biggest on document-ingest because it fans out N
parallel sub-agent slices, each previously paying the full schema-read
cost. With the derived files each slice loads only its own slim
contract.

PROVENANCE-BLOCK + WEB-PROVENANCE-BLOCK untouched; check_skill_blocks.py
green; full test suite 103 passed / 1 failed (pre-existing).

Continues v0.3 skill rollout.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 .claude/skills/document-ingest/SKILL.md | 19 ++++++++++++++-----
 1 file changed, 14 insertions(+), 5 deletions(-)
```

---

## `9641985` — feat(skills): /foundational-run uses get_context.py for the per-item walk

*2026-05-28 · Markus Holzhauser*

Step 3 of the foundational run walks every current-state element one at a
time. The per-item read budget previously told the LLM to manually read
the focal element body plus each direct neighbour (roles, controls, the
exception it transitions to) — N file reads per cursor advance, re-done
identically as the cursor moved.

Replace that with one get_context.py call per item. The call returns the
focal element verbatim plus every neighbour as ~30-word summaries —
exactly the per-item picture this step needs. The STABLE bucket (type
schema + process meta) stays in the prompt cache as the cursor advances,
so only the VOLATILE bucket (focal element + summaries) is re-read per
turn — the cache-hit win get_context.py was designed for.

PROVENANCE-BLOCK verbatim region untouched; check_skill_blocks.py green
across all four shared blocks; full test suite 103 passed / 1 failed
(pre-existing).

First step of v0.3 — broader skill rollout of the v0.2 infrastructure.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 .claude/skills/foundational-run/SKILL.md | 20 +++++++++++++++-----
 1 file changed, 15 insertions(+), 5 deletions(-)
```

---

## `80f764a` — feat(skills): get_context.py — skill-side context channels (Piece 1)

*2026-05-28 · Markus Holzhauser*

The third and final piece of TARGET-ARCH-PLAN.md's v0.2 rollout. Skills
that work with existing elements no longer walk relations by hand and
re-read files one-by-one — they call one CLI that emits a bucketed
prompt over the schema + element + related context.

Shape:

  python3 scripts/wiki/get_context.py --slug <slug> --element <id>

Output is split into two clearly delimited buckets so callers can drop
them into a cached-prefix prompt structure:

  • STABLE  — type schema (from schema/.derived/<type>.llm.json, Piece 3),
              process meta (overview + sections.json status). Cacheable
              across this skill's turns via Anthropic's prompt cache.
  • VOLATILE — the focal element verbatim + ~30-word summaries of every
              directly-related element (forward + reverse + RACI +
              transitions). Re-read per turn.

Channels are selectable via --channels; new-element mode (--type X with
no --element) returns only the stable bucket. Broken relation targets
are surfaced as "(target not found in this process)" so skills don't
silently drop them.

All 8 perspective specialists' SKILL.md updated to point the LLM at
get_context.py before patching existing elements. The verbatim cross-
skill block stays byte-identical across all eight (check_skill_blocks.py
green).

11 new tests in test_wiki_scripts.py cover bucket separators, channel
selection, determinism, and the unknown-element error path.

Token-budget honest accounting: per-turn word count is roughly comparable
to the old "show_template + read element" baseline. The wins are:
  • cache efficiency — STABLE prefix reuses across turns
  • one call vs N file reads — simpler skill prose
  • scales with process size — related elements summarised, not full bodies
  • broken refs visible instead of silently dropped

Closes Piece 1 of TARGET-ARCH-PLAN.md. v0.2.0 ships.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 .claude/skills/client-journey-specialist/SKILL.md     |  13 +-
 .claude/skills/control-compliance-specialist/SKILL.md |  13 +-
 .claude/skills/domain-architect/SKILL.md              |  13 +-
 .claude/skills/innovation-analyst/SKILL.md            |  13 +-
 .claude/skills/it-architect/SKILL.md                  |  13 +-
 .claude/skills/process-specialist/SKILL.md            |  13 +-
 .claude/skills/solution-architect/SKILL.md            |  13 +-
 .claude/skills/transformation-agent/SKILL.md          |  13 +-
 scripts/wiki/get_context.py                           | 472 ++++++++++++++++++++++++++++++++++++++
 scripts/wiki/test_wiki_scripts.py                     |  57 +++++
 10 files changed, 617 insertions(+), 16 deletions(-)
```

---

## `318d817` — feat(view): ProcessView — read-side join layer over a ProcessDoc

*2026-05-28 · Markus Holzhauser*

Piece 2 of TARGET-ARCH-PLAN.md. Materialises the joins that every consumer
would otherwise reinvent (RACI grid, flow lanes, related-element summaries)
into one ProcessView built once per getProcess() call. Migrates the live
RaciMatrix and ProcessFlow renderers (plus the print path) to read from
the view instead of computing joins in-component.

Shape:

  • buildProcessView(doc, schema) returns pure data — byId, byType,
    raciGrid, flow (FlowAssignment), reverseGroups, relationsByType.
  • buildRaciGrid(roles) and buildFlowLanes(steps, raciGrid) exported as
    reusable building blocks so the target-state flow can synthesise its
    own lanes against augmented roles.
  • contextFor(view, id, opts) is a *free function* over the view, not a
    method. Discovered during implementation: ProcessDoc.view crosses the
    RSC server→client boundary, and Next.js refuses to serialise functions
    across that boundary. Pure-data view + standalone function avoids that
    failure mode.

Defaults on contextFor preserve token efficiency for the future LLM
context builder (Piece 1): includeProvenance=false, related elements
returned as ~30-word summaries, body strippable via includeBody=false.

Tests:
  • 22 new unit tests in src/lib/process-view.test.ts cover RACI pivot,
    R-wins-A-fallback lane logic, UNASSIGNED-last ordering, and contextFor
    semantics. Wired into test:lint via an extended file list.
  • Enabled allowImportingTsExtensions in tsconfig so node --test can
    resolve TS-to-TS imports through process-view.ts → stepOrder.ts.
  • Dev server verified: sepa-payments renders both views with no
    serialization errors (10 flow nodes / 11 edges; RACI grid shell with
    correct gap warnings since sepa-payments has no raci.json on disk).

Part of v0.2.0-beta (Piece 2 of TARGET-ARCH-PLAN.md). Piece 1 (skill-side
context channels via get_context.py) lands next.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 TARGET-ARCH-PLAN.md                    |  16 ++-
 package.json                           |   2 +-
 src/app/ProcessDocScreen.tsx           |   9 ++
 src/app/print/[slug]/PrintDocument.tsx |   2 +
 src/components/ProcessFlow.tsx         |  59 +++------
 src/components/RaciMatrix.tsx          |  23 ++--
 src/components/print/PrintExhibits.tsx |  15 ++-
 src/lib/process-view.test.ts           | 289 +++++++++++++++++++++++++++++++++++++++++
 src/lib/process-view.ts                | 369 +++++++++++++++++++++++++++++++++++++++++++++++++++++
 src/lib/wiki.ts                        |   8 +-
 tsconfig.json                          |   1 +
 11 files changed, 732 insertions(+), 61 deletions(-)
```

---

## `4c6d1e1` — feat(schema): derived per-type schema files for LLM-efficient context

*2026-05-28 · Markus Holzhauser*

Build script emits one compact schema/.derived/<type>.llm.json per element
type from the 2,800-line process-schema.json. Skills and the future context
builder consume the slim per-type files (~50–80 lines) instead of loading
the full schema — roughly 35x smaller per-type contract for the LLM.

- New scripts/wiki/build_derived_schemas.py with hybrid example sourcing:
  schema/.curated-examples.json wins per type when present; otherwise
  auto-pick from sepa-payments by conforms-to-schema + word-range heuristic
  (approval status not required — sepa-payments is curated by construction).
- 40 derived files generated, one per element type.
- show_template.py refactored to read derived files. Stdout shape preserved
  byte-for-byte so skills that paste its output keep working; new trailing
  Examples: section lists in-wiki reference paths.
- CI gate via --check mode wired into test_wiki_scripts.py, alongside three
  structural-parity assertions (required keys, template heading order, every
  source type has a derived file) and a curation-override smoke test.
- ARCHITECTURE.md gains invariant #10 for derived-file freshness.

TARGET-ARCH-PLAN.md documents the v0.2 plan, the four locked decisions
(commit derived files, hybrid examples, Python on wiki_lib, defer
orchestrator) and the rollout: v0.2.0-alpha (this — Piece 3) →
v0.2.0-beta (Piece 2: ProcessView) → v0.2.0 (Piece 1: context channels).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 ARCHITECTURE.md                                  |   1 +
 TARGET-ARCH-PLAN.md                              | 476 +++++++++++++++++++++++++++++++++++++++++++
 schema/.derived/adr.llm.json                     |  92 +++++++++
 schema/.derived/assumption.llm.json              |  55 +++++
 schema/.derived/audit-finding.llm.json           |  54 +++++
 schema/.derived/capability.llm.json              |  82 ++++++++
 schema/.derived/competitor-cx-eu.llm.json        |  62 ++++++
 schema/.derived/competitor-cx-fintech.llm.json   |  62 ++++++
 schema/.derived/competitor-cx-global.llm.json    |  62 ++++++
 schema/.derived/competitor-eu.llm.json           |  68 +++++++
 schema/.derived/competitor-fintech.llm.json      |  68 +++++++
 schema/.derived/competitor-global.llm.json       |  68 +++++++
 schema/.derived/compliance-gap.llm.json          |  72 +++++++
 schema/.derived/component.llm.json               |  75 +++++++
 schema/.derived/control.llm.json                 | 100 +++++++++
 schema/.derived/country-variation.llm.json       |  55 +++++
 schema/.derived/cx-benchmark.llm.json            |  56 +++++
 schema/.derived/cx-channel.llm.json              |  46 +++++
 schema/.derived/cx-touchpoint.llm.json           |  56 +++++
 schema/.derived/exception.llm.json               |  72 +++++++
 schema/.derived/friction-point.llm.json          |  71 +++++++
 schema/.derived/gap.llm.json                     |  59 ++++++
 schema/.derived/innovation-idea.llm.json         |  88 ++++++++
 schema/.derived/innovation-risk.llm.json         |  49 +++++
 schema/.derived/integration.llm.json             |  35 ++++
 schema/.derived/market-trend.llm.json            |  73 +++++++
 schema/.derived/metric.llm.json                  |  58 ++++++
 schema/.derived/migration-phase.llm.json         |  85 ++++++++
 schema/.derived/moment.llm.json                  |  54 +++++
 schema/.derived/nfr.llm.json                     |  87 ++++++++
 schema/.derived/pain-point.llm.json              |  70 +++++++
 schema/.derived/process-dependency.llm.json      |  60 ++++++
 schema/.derived/process-gap.llm.json             |  66 ++++++
 schema/.derived/process-step.llm.json            |  80 ++++++++
 schema/.derived/regulation.llm.json              |  54 +++++
 schema/.derived/requirement.llm.json             |  74 +++++++
 schema/.derived/role.llm.json                    |  52 +++++
 schema/.derived/system.llm.json                  | 102 ++++++++++
 schema/.derived/target-application.llm.json      |  70 +++++++
 schema/.derived/target-integration.llm.json      |  92 +++++++++
 schema/.derived/target-state.llm.json            |  50 +++++
 schema/.derived/transformation-decision.llm.json |  70 +++++++
 scripts/wiki/build_derived_schemas.py            | 351 +++++++++++++++++++++++++++++++
 scripts/wiki/show_template.py                    | 112 ++++++----
 scripts/wiki/test_wiki_scripts.py                |  72 +++++++
 45 files changed, 3682 insertions(+), 34 deletions(-)
```

---

## `8df5961` — mock: populate the ArchitectMiner dashboard for sepa-payments

*2026-05-27 · Markus Holzhauser*

Picks SEPA Payments (clean architecture slate) and authors 53 plausible
mock elements — 9 capabilities, 6 target apps, 10 ADRs, 6 target
integrations, 10 components, 8 NFRs, 4 migration phases — so every
section of the dashboard renders fully populated. Cross-refs hook into
real existing PS-/SYS-/PG-ids on the As-Is side and into each other on
the architecture side, so component → app, ADR → gap, integration → ADR
and migration → ADR all resolve in the rendered cards.

The narrative is a concrete legacy-batch-SEPA → ISO 20022 → SCT Inst
modernisation: build a unified Real-Time Risk Engine, modernise the
Payment Hub and CSM Gateway, P99 ≤ 10s end-to-end SCT Inst SLA, with a
four-phase migration plan ending in legacy decommission Q4 2027.

scripts/mock_sepa_architecture.py is the generator — re-runnable, emits a
write_elements.py manifest with @tempKey cross-refs.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 scripts/mock_sepa_architecture.py | 601 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 601 insertions(+)
```

---

## `5d85738` — refactor: lift RACI step:level DSL out of role frontmatter into per-process bundle

*2026-05-27 · Markus Holzhauser*

Roles used to carry `raci: [PS-X:R, PS-Y:A]` on the frontmatter — same
stringly-typed pattern as transitions before its move. The data now lives
in wiki/processes/<slug>/raci.json keyed by role id, with each entry the
structured {step, level} object the renderer wants.

scripts/wiki/wiki_lib.py adds load_raci / set_raci / parse_raci_dsl;
write_element_spec lifts relations.raci out of the frontmatter path and
into the bundle; patch_element.py --list raci writes to the bundle. The
migration script extends to cover raci alongside provenance and
transitions; 30 role files rewritten across 5 processes.

TypeScript side: WikiPage gains a raci?: RaciEntry[] joined onto each
element in getProcess(). ProcessFlow's lane assignment, RaciMatrix's grid
and targetFlow's TS-id augmentation all read structured data — the
.split(":") calls are gone.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 CLAUDE.md                          |  2 +-
 schema/process-schema.json         |  3 +-
 scripts/wiki/migrate_to_bundles.py | 72 ++++++++++++++++++++++++++++++-------------
 scripts/wiki/patch_element.py      | 77 ++++++++++++++++++++++++++--------------------
 scripts/wiki/show_template.py      |  5 +--
 scripts/wiki/test_wiki_scripts.py  |  6 ++--
 scripts/wiki/wiki_lib.py           | 97 ++++++++++++++++++++++++++++++++++++++++++++++++++--------
 src/components/ProcessFlow.tsx     | 18 +++++------
 src/components/RaciMatrix.tsx      | 12 +++-----
 src/lib/targetFlow.ts              | 24 ++++++---------
 src/lib/wiki.ts                    | 20 ++++++++++--
 11 files changed, 226 insertions(+), 110 deletions(-)
```

---

## `711f6f1` — feat(ui): chat panel overlays the canvas when expanded

*2026-05-27 · Markus Holzhauser*

In both ProcessMiner and ArchitectMiner the chat used to take a grid column
that shoved the canvas narrower the moment it opened. Now the canvas keeps
its full width: the chat panel floats over the right edge with a drop
shadow when expanded, and slots back into the 56 px rail column when
collapsed. ArchitectMiner's shell also drops four redundant chat-open grid
variants — the overlay rule covers them all.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 src/app/globals.css | 67 ++++++++++++++++++++++++++++++++++++++++---------------------------
 1 file changed, 40 insertions(+), 27 deletions(-)
```

---

## `bbcf8f0` — refactor: move provenance + transitions out of frontmatter into per-process JSON bundles

*2026-05-27 · Markus Holzhauser*

Provenance was inline JSON-in-YAML on one frontmatter line — escape-prone,
unreadable in diffs, and the LLM had to re-emit the whole blob to patch one
heading. Transitions were a `to|kind|when` pipe-DSL inside a YAML list, with
no schema validation. Both now live in per-process sidecars
(`provenance.json`, `transitions.json`) keyed by element id, matching the
existing pattern for sections.json / lint.json / notes.json.

The writer-script API is unchanged — skills still pass `provenance` and
`relations.transitions` on the spec exactly as before. The on-disk shape is
the writer's job. Validators (check_conformance / check_transitions /
check_evidence / set_approval) load the bundle once per pass.

Migration: scripts/wiki/migrate_to_bundles.py lifted 826 provenance maps + 30
transitions lists across 10 processes; validator counts match pre-migration
baselines (no new lint failures). App renders the same — process flow,
provenance banners, transition chips all driven from the bundles via
WikiPage.{provenance, transitions} populated in getProcess().

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 CLAUDE.md                             |   3 +-
 HALLUCINATION-PLAN.md                 |  28 ++++++---
 schema/process-schema.json            |   5 +-
 scripts/wiki/check_conformance.py     |  16 +++--
 scripts/wiki/check_evidence.py        |  10 +--
 scripts/wiki/check_transitions.py     |  19 +++---
 scripts/wiki/migrate_grandfather.py   |  18 ++----
 scripts/wiki/migrate_to_bundles.py    | 176 ++++++++++++++++++++++++++++++++++++++++++++++++++++
 scripts/wiki/patch_element.py         |  73 +++++++++++++++-------
 scripts/wiki/set_approval.py          |   8 +--
 scripts/wiki/test_wiki_scripts.py     |  65 ++++++++++++--------
 scripts/wiki/wiki_lib.py              | 180 ++++++++++++++++++++++++++++++++++++++++++++++--------
 src/app/ProcessDocScreen.tsx          |  11 ++--
 src/components/ElementCard.tsx        |  22 ++-----
 src/components/ProcessFlow.tsx        |   4 +-
 src/components/print/PrintElement.tsx |  11 +---
 src/lib/conformance.ts                |  16 ++---
 src/lib/stepOrder.ts                  |  46 +++++---------
 src/lib/targetFlow.ts                 |  18 ++----
 src/lib/wiki.ts                       |  39 ++++++++++++
 20 files changed, 552 insertions(+), 216 deletions(-)
```

---

## `1a42d19` — refactor: rationalize duplication — shared linkify, meta, summary registry

*2026-05-27 · Markus Holzhauser*

- src/lib/linkify.tsx — single source for element-ID linkifying, used by
  both chat (chat-ref chip) and Markdown (md-ref chip). Removes the
  duplicate copy that lived inside AgentChat.tsx, and the GetRef type is
  now the canonical export (AgentChat re-exports it for back-compat).
- src/lib/meta.ts — shared str() and asList() helpers. Were copy-pasted
  across 7+ components (ElementCard, ProcessFlow, the *Summary files,
  RaciMatrix, ClientJourneyStrip, TargetSynthesis, ControlsInTarget).
  asList widened to accept unknown so meta.X values pass through
  without a cast.
- src/hooks/usePerspectiveRotation.ts — long-wait perspective rotation
  pulled out of AgentChat (was ~25 lines of effect plumbing in a 350-line
  presentation component).
- src/components/SectionSummary.tsx — single dispatch point for per-section
  summary headers (risk matrix, worst-first bars, country×step grid…).
  ProcessDocScreen held two long section==="X" && <XSummary …> chains
  totalling 11 components; now one call-site each.
- Markdown.tsx, ReadOnlyElementCard.tsx, ArchitectureCanvas — threaded
  getRef so prose ID chips work in ArchitectMiner views too.

Also bundles in-flight work from the same branch:
- AuthGate + WelcomeScreen tweaks (AM Architect Inbox card, platform sublabel
  removed)
- ArchitectureCanvas hover-ref wiring
- CSS for md-ref chips + matrix summaries.

Typecheck clean; dev-server starts with no console or server errors.

**Non-wiki files changed:**

```
 src/app/AuthGate.tsx                        |  19 ++
 src/app/ProcessDocScreen.tsx                | 101 ++------
 src/app/globals.css                         | 213 ++++++++++++++++-
 src/components/AgentChat.tsx                |  95 +-------
 src/components/ArchitectureCanvas.tsx       | 615 ++++++++++++++++++++++++++++--------------------
 src/components/AuditFindingsSummary.tsx     |   5 +-
 src/components/ClientJourneyStrip.tsx       |  14 +-
 src/components/ControlGapsSummary.tsx       |   5 +-
 src/components/ControlsInTarget.tsx         |   6 +-
 src/components/ControlsSummary.tsx          |   5 +-
 src/components/CountryVariationsSummary.tsx |   8 +-
 src/components/CoveragePanel.tsx            |   4 +-
 src/components/ElementCard.tsx              |   9 +-
 src/components/ExceptionsSummary.tsx        |   8 +-
 src/components/InnovationIdeasSummary.tsx   |   5 +-
 src/components/Markdown.tsx                 |  50 ++--
 src/components/MetricsSummary.tsx           |   8 +-
 src/components/PainPointsSummary.tsx        |   8 +-
 src/components/ProcessFlow.tsx              |   6 +-
 src/components/RaciMatrix.tsx               |   6 +-
 src/components/ReadOnlyElementCard.tsx      | 264 +++++++++++++++++++++
 src/components/RegulationSummary.tsx        |  10 +-
 src/components/SectionSummary.tsx           | 128 ++++++++++
 src/components/TargetReviewPanel.tsx        |   4 +-
 src/components/TargetSynthesis.tsx          |   6 +-
 src/components/WelcomeScreen.tsx            | 300 +++++++++++++----------
 src/hooks/usePerspectiveRotation.ts         |  41 ++++
 src/lib/linkify.tsx                         |  90 +++++++
 src/lib/meta.ts                             |  19 ++
 src/lib/wait-perspective.ts                 |  13 +-
 30 files changed, 1415 insertions(+), 650 deletions(-)
```

---

## `1772a5c` — chore: ship in-flight work — settings + dogfood + summary panels + schema

*2026-05-26 · Markus Holzhauser*

Bundles everything that accumulated in the working tree across parallel
sessions:

  - Settings panel gains a grant-access UI (owner / admin can add
    grantees inline) on top of the existing delete-process flow.
  - ProcessDocScreen wires new section-summary panels for client
    journey, innovation ideas, and target-flow.
  - New components: ClientJourneyStrip, InnovationIdeasSummary.
  - New lib: src/lib/targetFlow.ts.
  - Schema: prioritization section is no longer required; the empty
    .gitkeeps were removed across every process to match.
  - Dogfood run skill: SKILL.md updates from the dogfood-architect /
    dogfood-run runs.
  - New wiki content for the bank-guarantee-issuance dogfood processes
    (assumptions, dependencies, gap-resolution, requirements,
    to-be-design, target-review, friction-points updates).
  - .gitignore: exclude .claude/scheduled_tasks.lock (gstack housekeeping
    lockfile, transient).

Shipped as one omnibus commit to clear the working tree. Individual
features have their own dedicated commits in history; this is the
catch-up.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 .claude/skills/dogfood-run/SKILL.md       |  21 ++---
 .gitignore                                |   1 +
 schema/process-schema.json                |  30 ++++---
 src/app/ProcessDocScreen.tsx              |  61 +++++++++++--
 src/components/ClientJourneyStrip.tsx     | 242 ++++++++++++++++++++++++++++++++++++++++++++++++++
 src/components/InnovationIdeasSummary.tsx | 168 +++++++++++++++++++++++++++++++++++
 src/components/SettingsPanel.tsx          | 200 +++++++++++++++++++++++++++++++++++++++--
 src/lib/targetFlow.ts                     | 101 +++++++++++++++++++++
 8 files changed, 783 insertions(+), 41 deletions(-)
```

---

## `08bbc07` — feat: Contributors page redesign — people roster + paginated feed

*2026-05-26 · Markus Holzhauser*

Replaces the old left-rail people filter with a top-of-page roster of
contributor cards (one per person, per-kind rollup stats, last-active
stamp) and a click-to-filter activity feed below. The most-recently-
active person is pre-selected on load, so the page lands on "who was
last active and what did they do" without a click. Clicking a card
swaps the filter banner and the feed below; clicking the selected card
again clears the filter.

Information density tuned in two passes:
  - Roster cards use container queries to drop stats to 2x2 in narrow
    columns so the numbers stay readable when the chat pane is open.
  - Activity feed is capped at 20 events on load, with a "Show N more
    · M hidden" affordance at the bottom. Each click grows the window
    by another 20. Resets when the person/kind filter changes.

Identity model: cards and event rows resolve username → display name
via useDisplayName at render time, so a rename in data/users.json
propagates without rewriting any wiki file. Actors that don't match
the live roster get a `historical` pill; skill sentinels (run-lint,
the assistant, etc.) get a `skill` pill.

Picked from a 4-way HTML mockup shotgun:
~/.gstack/projects/Processminer2/designs/contributors-page-20260526.

Note: globals.css in this commit also carries parallel CSS work from
other in-flight components (ClientJourneyStrip, InnovationIdeasSummary,
etc.) that I didn't author. Pulling them apart would have needed a
multi-step git surgery; the parallel author's eventual commit will
land on top of this clean.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 src/app/globals.css                 | 408 +++++++++++++++++++++++++++++++++++++++++++++++---------
 src/components/ContributorsView.tsx | 364 ++++++++++++++++++++++++++++++++++++++------------
 2 files changed, 624 insertions(+), 148 deletions(-)
```

---

## `ecc57f1` — feat: country-variations section + per-section summary UIs + Overview editing

*2026-05-26 · Markus Holzhauser*

Schema + workflow
- New schema section "Country Variations" under As-Is Process and a
  matching `country-variation` element type (idPrefix CV, fields
  countries + variationType required, affects → process-step).
- Skill files (process-specialist, foundational-run, qer-session,
  dogfood-architect) updated to list the new type.
- Empty `country-variations/` folder seeded into every existing
  process so writes don't fail; loader handles missing folders
  gracefully, no migration needed.
- `saveElement` now resolves the process index too (via
  findApprovableFile), so the Overview "Edit yourself" can write
  back to wiki/processes/<slug>/index.md.

Per-section summary UIs (above the section cards)
- MetricsSummary — compact data-row table (design-shotgun A).
- ExceptionsSummary — frequency × impact risk-matrix heatmap (D).
- PainPointsSummary — worst-first severity-bar list (D).
- CountryVariationsSummary — country × step matrix with type-tinted
  cells, ISO flag rows, CV chips per cell (B).
- Existing ControlsSummary / ControlGapsSummary / RegulationSummary /
  AuditFindingsSummary scaffolds picked up from working tree.
- All summaries: clickable rows/chips routed through goToElement,
  hover preview via ElementHovercard (matching chat refs).

Element-card + Overview UX
- Lint findings rendered as collapsed inline pills (variant D):
  single tinted row → click chevron to expand into full prose,
  icon-only Deep dive + Dismiss buttons. Removes the React
  nested-button warning via role="button" wrapper + stopPropagation.
- Removed the "AI draft" pill from the element hovercard tags.
- Overview becomes editable: textarea + per-field inputs, Save/Cancel
  flow via the existing wiki-write server action, ApprovalControl
  duplicated into both Purpose and Process Facts card footers
  pointing at the same process.meta.approval.
- Header switched to .canvas-title for visual consistency with
  section pages.
- Empty-section CTA: primary now calls section-scoped addEntry()
  instead of full-area specialist walkthrough; full specialist
  demoted to a secondary inline link.

ArchitectMiner side
- Added Contributors / Source Documents / Settings bottom-of-rail
  panel mirroring ProcessMiner.
- Capability + Target Application cards redesigned: details inline
  per card, collapsible sections, ID chips clickable + hoverable.

Wiki content seeds (schema-validated via write_element.py)
- bank-guarantee-issuance-dogfood-2026-05-26: full Innovation area
  (3 market trends, 2 competitors, 4 ideas, 3 risks) + CX
  benchmarks + competitor CX entries.
- bank-guarantee-issuance-dogfood-full-2026-05-26: 3 country
  variations (DE BaFin, FR ACPR, DACH cut-off) + full architect-side
  content (capabilities, target applications, ADRs, components,
  NFRs, migration phases, integrations).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 .claude/skills/dogfood-architect/REVISIONS.md |  44 +++
 .claude/skills/dogfood-architect/SKILL.md     |  31 +-
 .claude/skills/foundational-run/SKILL.md      |   2 +-
 .claude/skills/process-specialist/SKILL.md    |   5 +-
 .claude/skills/qer-session/SKILL.md           |   2 +-
 schema/process-schema.json                    |  59 ++++
 src/app/ProcessDocScreen.tsx                  | 138 +++++++--
 src/app/globals.css                           | 577 ++++++++++++++++++++++++++++++++---
 src/components/ArchitectureCanvas.tsx         | 743 ++++++++++++++++++++++++++++------------------
 src/components/AuditFindingsSummary.tsx       | 191 ++++++++++++
 src/components/ControlGapsSummary.tsx         | 195 ++++++++++++
 src/components/ControlsSummary.tsx            | 183 ++++++++++++
 src/components/CountryVariationsSummary.tsx   | 224 ++++++++++++++
 src/components/ElementCard.tsx                | 138 ++++++---
 src/components/ElementHovercard.tsx           |   6 +-
 src/components/ExceptionsSummary.tsx          | 213 +++++++++++++
 src/components/FindingDismiss.tsx             |   8 +-
 src/components/MetricsSummary.tsx             | 122 ++++++++
 src/components/OverviewPanel.tsx              | 208 +++++++++++--
 src/components/PainPointsSummary.tsx          | 175 +++++++++++
 src/components/RegulationSummary.tsx          | 191 ++++++++++++
 src/lib/wiki-write.ts                         |   5 +-
 22 files changed, 3028 insertions(+), 432 deletions(-)
```

---

## `b262fa1` — chore: chat-ref click-nav + workspace tweaks + wiki content refresh

*2026-05-26 · Markus Holzhauser*

Bundles current WIP:

- Clickable element-id refs in chat: hovercard accepts an onSelect callback,
  AgentChat threads onRefClick through to it, ProcessDocScreen wires
  goToElement so clicks land on the element in the canvas.
- Splash new-process flow: createNewToken plumbed into ProcessDocScreen,
  resume banner only seeds when the in-flight run matches the open slug,
  toolbar buttons hidden during draft-new-process.
- Per-process deletion: onDeleted clears persisted chat for the slug and
  returns to splash.
- Workspace shell: am-canvas grid collapses for hidden details / chat
  rails; resume hero pushes CTA to the right edge.
- Wiki content: drop cob-003 + sepa-payment-processing, add the
  bank-guarantee-issuance dogfood processes and sepa-payments rename.
- Misc: SKILL.md updates across nine skills, schema tweaks, script
  helpers, SettingsPanel/SourcesPanel/WelcomeScreen polish.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 .claude/skills/client-journey-specialist/SKILL.md |  32 +++-
 .claude/skills/document-ingest/SKILL.md           |  67 ++++++--
 .claude/skills/dogfood-architect/SKILL.md         | 354 ++++++++++++++++++++++++++++++++++++++++++
 .claude/skills/dogfood-run/SKILL.md               |  89 ++++++++---
 .claude/skills/foundational-run/SKILL.md          | 103 +++++++++---
 .claude/skills/it-architect/SKILL.md              |  53 +++++--
 .claude/skills/run-lint/SKILL.md                  |   8 +-
 .claude/skills/source-cx/SKILL.md                 |  80 ++++++----
 .claude/skills/source-innovation/SKILL.md         | 106 ++++++-------
 .claude/skills/source-regulation/SKILL.md         | 122 ++++++++++-----
 README.md                                         |   6 +
 package.json                                      |   3 +-
 schema/process-schema.json                        |  48 ++++++
 scripts/wiki/idea_coverage.py                     |  90 ++++++++++-
 scripts/wiki/review_cursor.py                     |  81 +++++++++-
 scripts/wiki/test_wiki_scripts.py                 |   9 +-
 scripts/wiki/write_elements.py                    |  68 +++++++-
 scripts/wiki/write_ingest_report.py               |  85 +++++++---
 src/app/AuthGate.tsx                              |  16 ++
 src/app/ProcessDocScreen.tsx                      | 235 +++++++++++++++++-----------
 src/app/api/session/route.ts                      |  12 ++
 src/app/globals.css                               |  43 ++++-
 src/components/AgentChat.tsx                      |  50 ++++--
 src/components/ArchitectureCanvas.tsx             |  35 +++--
 src/components/ElementHovercard.tsx               |  24 ++-
 src/components/SettingsPanel.tsx                  |  14 +-
 src/components/WelcomeScreen.tsx                  |   8 +-
 src/hooks/useAgentChat.ts                         |   6 +-
 src/lib/agent-chat-utils.ts                       |   8 +-
 src/lib/contributors.ts                           |  38 +++--
 30 files changed, 1522 insertions(+), 371 deletions(-)
```

---

## `3b51a56` — feat: per-process Settings section with admin/owner delete

*2026-05-25 · Markus Holzhauser*

Adds a new ⚙ Settings node at the bottom of the section-nav, next to
Contributors, for per-process info, access summary, and destructive
operations. Owners and admins see a Danger Zone with a slug-typed
Delete confirmation; the action wipes the wiki layer, raw-sources
layer, and access record in one shot.

Why a dedicated section rather than slot it into the OverviewPanel or
the AdminScreen? Picked from a 4-way HTML-mockup shotgun:
~/.gstack/projects/Processminer2/designs/delete-process-placement-20260525.
Settings keeps destructive ops out of the read-flow, scales when
Rename / Owner-Change / Archive land later, and doesn't fight
section-nav semantics (the ⚙ node is app-only `__settings`, not a
wiki section, so it never appears in element IDs).

API: DELETE /api/processes/[slug] — owner-or-admin via canManageAccess,
slug-regex-validated, idempotent (returns {ok, alreadyGone} when both
wiki and raw-sources paths are absent). Companion GET returns
{slug, owner, grantees, canManage} for the panel to render the access
summary.

Lib: removeAccess(slug) helper in process-access.ts — drops the slug
row from data/process-access.json atomically.

UI:
  - SettingsPanel.tsx: Process info (title/slug/idPrefix/sources),
    Access (owner + grantees, both resolved via useDisplayName), and
    a Danger Zone gated on canManage. Delete-modal demands typing the
    exact slug to enable the destructive button.
  - ProcessDocScreen.tsx: new ⚙ trigger + `__settings` render case.
  - globals.css: settings-block, settings-danger, settings-modal-*.

Verified end-to-end in the browser: scaffolded delete-me-test,
deleted via the UI, server logged DELETE /api/processes/delete-me-test
200, disk + access record both gone.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 src/app/ProcessDocScreen.tsx          |  53 +++++++++++
 src/app/api/processes/[slug]/route.ts |  97 ++++++++++++++++++++
 src/app/globals.css                   | 160 ++++++++++++++++++++++++++++++++
 src/components/SettingsPanel.tsx      | 270 ++++++++++++++++++++++++++++++++++++++++++++++++++++++
 src/lib/process-access.ts             |   9 ++
 5 files changed, 589 insertions(+)
```

---

## `5980ed4` — refactor: store stable user IDs in wiki, resolve display names at render time

*2026-05-25 · Markus Holzhauser*

Wiki frontmatter and JSON sidecars used to store actor display names
verbatim (`updatedBy: Markus Holzhauser`). A rename or role change in
data/users.json never reached the wiki, and the layers had already
drifted (the wiki dropped the umlaut from `Holzhäuser`).

Now the wiki stores `username` (the stable user ID) everywhere; the UI
resolves it to the current display name on read. A rename propagates
automatically with zero wiki rewrites.

What landed:
- Server-side `by` injection in /api/notes, /api/findings, /api/upload
  (clients can no longer impersonate; the session cookie is authoritative).
- wiki-write.ts server actions ignore caller-supplied `by` and stamp
  `currentActor()` → `session.username`.
- contributors.ts wraps every emitted `by` in `displayName(...)` for
  consistent resolution in the activity feed.
- New /api/users/roster + useDisplayName() hook for client-side
  components (ApprovalControl, note avatars).
- One-shot scripts/migrate_actors_to_userids.py walked 140 files and
  migrated 214 values (M. Berger → m.berger, Markus Holzhauser → admin).
  84 historical names (M. Vogel, S. Krause, typos) stay as display names
  — the resolver falls through cleanly.
- Tests: 84/84 wiki + 13/13 migration.

Also includes:
- new-process SKILL.md tighten: enforce the proposal-bullets-before-
  choices order so the description/slug/abbreviation never gets skipped.
- New process scaffolds under wiki/processes/new-hire/ and
  /employee-onboarding/ + the matching raw-sources upload.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 .claude/skills/new-process/SKILL.md  |  13 ++-
 new-hr-onboarding-dtp.md             | 176 ++++++++++++++++++++++++++++
 scripts/migrate_actors_to_userids.py | 343 +++++++++++++++++++++++++++++++++++++++++++++++++++++++
 scripts/test_migrate_actors.py       | 135 ++++++++++++++++++++++
 scripts/wiki/scaffold_process.py     |   9 ++
 scripts/wiki/test_wiki_scripts.py    |  18 +++
 src/app/ProcessDocScreen.tsx         |  18 +--
 src/app/api/findings/route.ts        |   8 +-
 src/app/api/notes/route.ts           |  22 +++-
 src/app/api/session/route.ts         |   9 +-
 src/app/api/upload/route.ts          |   9 +-
 src/app/api/users/roster/route.ts    |  28 +++++
 src/app/globals.css                  |  11 ++
 src/components/ApprovalControl.tsx   |  19 ++-
 src/components/ElementCard.tsx       |  35 +++---
 src/components/OverviewPanel.tsx     |   3 -
 src/components/WelcomeScreen.tsx     |  83 +++++++-------
 src/lib/contributors.ts              |  45 ++++++--
 src/lib/process-access.ts            |  61 +++++++---
 src/lib/session-worker.ts            |  17 ++-
 src/lib/user-roster-client.ts        |  59 ++++++++++
 src/lib/wiki-write.ts                |  13 ++-
 22 files changed, 1021 insertions(+), 113 deletions(-)
```

---

## `f49e7d1` — chore: remove BMAD-Method agent-builder install

*2026-05-25 · Markus Holzhauser*

Reverts 28d27b1. The BMAD experiment didn't earn its keep — the existing
Processminer skills cover the working agents, and BMAD's web-app
integration was blocked anyway (AskUserQuestion isn't available in the
headless session-worker context that drives /api/session).

Deletes tools/bmad/ (138 files) and the matching CLAUDE.md section +
reference-doc entry.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 CLAUDE.md                                                       |  21 -
 tools/bmad/.claude/skills/bmad-advanced-elicitation/SKILL.md    | 142 ------
 tools/bmad/.claude/skills/bmad-advanced-elicitation/methods.csv |  51 --
 tools/bmad/.claude/skills/bmad-agent-builder/SKILL.md           |  70 ---
 .../.claude/skills/bmad-agent-builder/assets/BOND-template.md   |  14 -
 .../skills/bmad-agent-builder/assets/CAPABILITIES-template.md   |  30 --
 .../.claude/skills/bmad-agent-builder/assets/CREED-template.md  |  52 --
 .../.claude/skills/bmad-agent-builder/assets/INDEX-template.md  |  15 -
 .../.claude/skills/bmad-agent-builder/assets/MEMORY-template.md |   7 -
 .../skills/bmad-agent-builder/assets/PERSONA-template.md        |  24 -
 .../.claude/skills/bmad-agent-builder/assets/PULSE-template.md  |  38 --
 .../bmad-agent-builder/assets/SKILL-template-bootloader.md      |  60 ---
 .../.claude/skills/bmad-agent-builder/assets/SKILL-template.md  |  90 ----
 .../bmad-agent-builder/assets/capability-authoring-template.md  | 110 ----
 .../skills/bmad-agent-builder/assets/customize-template.toml    |  62 ---
 .../bmad-agent-builder/assets/first-breath-config-template.md   |  80 ---
 .../skills/bmad-agent-builder/assets/first-breath-template.md   | 115 -----
 .../skills/bmad-agent-builder/assets/init-sanctum-template.py   | 277 -----------
 .../bmad-agent-builder/assets/memory-guidance-template.md       |  93 ----
 .../bmad-agent-builder/assets/sample-customize-analyst.toml     |  87 ----
 .../skills/bmad-agent-builder/references/agent-type-guidance.md |  88 ----
 .../skills/bmad-agent-builder/references/build-process.md       | 349 -------------
 .../skills/bmad-agent-builder/references/edit-guidance.md       |  88 ----
 .../references/first-breath-adaptation-guidance.md              | 116 -----
 .../bmad-agent-builder/references/mission-writing-guidance.md   |  81 ---
 .../skills/bmad-agent-builder/references/quality-analysis.md    | 139 ------
 .../skills/bmad-agent-builder/references/quality-dimensions.md  |  77 ---
 .../references/quality-scan-agent-cohesion.md                   | 151 ------
 .../references/quality-scan-customization-surface.md            | 188 -------
 .../references/quality-scan-enhancement-opportunities.md        | 189 -------
 .../references/quality-scan-execution-efficiency.md             | 159 ------
 .../bmad-agent-builder/references/quality-scan-prompt-craft.md  | 228 ---------
 .../references/quality-scan-sanctum-architecture.md             | 160 ------
 .../references/quality-scan-script-opportunities.md             | 220 --------
 .../bmad-agent-builder/references/quality-scan-structure.md     | 168 -------
 .../references/report-quality-scan-creator.md                   | 319 ------------
 .../references/sample-capability-authoring.md                   | 110 ----
 .../bmad-agent-builder/references/sample-capability-prompt.md   |  65 ---
 .../skills/bmad-agent-builder/references/sample-first-breath.md | 117 -----
 .../skills/bmad-agent-builder/references/sample-init-sanctum.py | 274 ----------
 .../bmad-agent-builder/references/sample-memory-guidance.md     |  93 ----
 .../references/script-opportunities-reference.md                | 392 ---------------
 .../skills/bmad-agent-builder/references/script-standards.md    |  91 ----
 .../bmad-agent-builder/references/skill-best-practices.md       | 144 ------
 .../skills/bmad-agent-builder/references/standard-fields.md     | 198 --------
 .../bmad-agent-builder/references/standing-order-guidance.md    |  76 ---
 .../references/template-substitution-rules.md                   |  92 ----
 .../skills/bmad-agent-builder/scripts/generate-html-report.py   | 534 --------------------
 .../skills/bmad-agent-builder/scripts/prepass-execution-deps.py | 337 -------------
 .../skills/bmad-agent-builder/scripts/prepass-prompt-metrics.py | 425 ----------------
 .../bmad-agent-builder/scripts/prepass-sanctum-architecture.py  | 385 --------------
 .../scripts/prepass-structure-capabilities.py                   | 482 ------------------
 .../skills/bmad-agent-builder/scripts/process-template.py       | 190 -------
 .../skills/bmad-agent-builder/scripts/scan-path-standards.py    | 324 ------------
 .../.claude/skills/bmad-agent-builder/scripts/scan-scripts.py   | 747 ----------------------------
 tools/bmad/.claude/skills/bmad-bmb-setup/SKILL.md               |  76 ---
 tools/bmad/.claude/skills/bmad-bmb-setup/assets/module-help.csv |  10 -
 tools/bmad/.claude/skills/bmad-bmb-setup/assets/module.yaml     |  20 -
 .../.claude/skills/bmad-bmb-setup/scripts/cleanup-legacy.py     | 259 ----------
 .../bmad/.claude/skills/bmad-bmb-setup/scripts/merge-config.py  | 408 ---------------
 .../.claude/skills/bmad-bmb-setup/scripts/merge-help-csv.py     | 218 --------
 tools/bmad/.claude/skills/bmad-brainstorming/SKILL.md           |   6 -
 tools/bmad/.claude/skills/bmad-brainstorming/brain-methods.csv  |  62 ---
 .../skills/bmad-brainstorming/steps/step-01-session-setup.md    | 214 --------
 .../skills/bmad-brainstorming/steps/step-01b-continue.md        | 124 -----
 .../skills/bmad-brainstorming/steps/step-02a-user-selected.md   | 229 ---------
 .../skills/bmad-brainstorming/steps/step-02b-ai-recommended.md  | 239 ---------
 .../bmad-brainstorming/steps/step-02c-random-selection.md       | 211 --------
 .../bmad-brainstorming/steps/step-02d-progressive-flow.md       | 266 ----------
 .../bmad-brainstorming/steps/step-03-technique-execution.md     | 401 ---------------
 .../bmad-brainstorming/steps/step-04-idea-organization.md       | 305 ------------
 tools/bmad/.claude/skills/bmad-brainstorming/template.md        |  15 -
 tools/bmad/.claude/skills/bmad-brainstorming/workflow.md        |  53 --
 tools/bmad/.claude/skills/bmad-customize/SKILL.md               | 111 -----
 .../skills/bmad-customize/scripts/list_customizable_skills.py   | 231 ---------
 .../scripts/tests/test_list_customizable_skills.py              | 249 ----------
 tools/bmad/.claude/skills/bmad-distillator/SKILL.md             | 177 -------
 .../skills/bmad-distillator/agents/distillate-compressor.md     | 116 -----
 .../skills/bmad-distillator/agents/round-trip-reconstructor.md  |  68 ---
 .../skills/bmad-distillator/resources/compression-rules.md      |  51 --
 .../bmad-distillator/resources/distillate-format-reference.md   | 227 ---------
 .../skills/bmad-distillator/resources/splitting-strategy.md     |  78 ---
 .../.claude/skills/bmad-distillator/scripts/analyze_sources.py  | 300 -----------
 .../bmad-distillator/scripts/tests/test_analyze_sources.py      | 204 --------
 tools/bmad/.claude/skills/bmad-editorial-review-prose/SKILL.md  |  86 ----
 .../.claude/skills/bmad-editorial-review-structure/SKILL.md     | 179 -------
 tools/bmad/.claude/skills/bmad-eval-runner/SKILL.md             |  91 ----
 tools/bmad/.claude/skills/bmad-eval-runner/agents/grader.md     |  93 ----
 tools/bmad/.claude/skills/bmad-eval-runner/assets/Dockerfile    |  29 --
 .../.claude/skills/bmad-eval-runner/references/eval-formats.md  | 147 ------
 .../.claude/skills/bmad-eval-runner/references/isolation.md     | 110 ----
 .../.claude/skills/bmad-eval-runner/scripts/docker_setup.py     | 115 -----
 .../.claude/skills/bmad-eval-runner/scripts/generate_report.py  | 184 -------
 .../bmad/.claude/skills/bmad-eval-runner/scripts/pty_runner.py  | 171 -------
 tools/bmad/.claude/skills/bmad-eval-runner/scripts/run_evals.py | 492 ------------------
 .../.claude/skills/bmad-eval-runner/scripts/run_triggers.py     | 366 --------------
 tools/bmad/.claude/skills/bmad-eval-runner/scripts/utils.py     | 260 ----------
 tools/bmad/.claude/skills/bmad-help/SKILL.md                    |  75 ---
 tools/bmad/.claude/skills/bmad-index-docs/SKILL.md              |  66 ---
 tools/bmad/.claude/skills/bmad-module-builder/SKILL.md          |  32 --
 .../skills/bmad-module-builder/assets/module-plan-template.md   | 128 -----
 .../bmad-module-builder/assets/setup-skill-template/SKILL.md    |  76 ---
 .../assets/setup-skill-template/assets/module-help.csv          |   1 -
 .../assets/setup-skill-template/assets/module.yaml              |   6 -
 .../assets/setup-skill-template/scripts/cleanup-legacy.py       | 259 ----------
 .../assets/setup-skill-template/scripts/merge-config.py         | 408 ---------------
 .../assets/setup-skill-template/scripts/merge-help-csv.py       | 218 --------
 .../assets/standalone-module-template/merge-config.py           | 408 ---------------
 .../assets/standalone-module-template/merge-help-csv.py         | 218 --------
 .../assets/standalone-module-template/module-setup.md           |  81 ---
 .../skills/bmad-module-builder/references/create-module.md      | 277 -----------
 .../skills/bmad-module-builder/references/ideate-module.md      | 216 --------
 .../skills/bmad-module-builder/references/validate-module.md    |  86 ----
 .../skills/bmad-module-builder/scripts/scaffold-setup-skill.py  | 124 -----
 .../bmad-module-builder/scripts/scaffold-standalone-module.py   | 190 -------
 .../scripts/tests/test-scaffold-setup-skill.py                  | 230 ---------
 .../scripts/tests/test-scaffold-standalone-module.py            | 266 ----------
 .../bmad-module-builder/scripts/tests/test-validate-module.py   | 314 ------------
 .../skills/bmad-module-builder/scripts/validate-module.py       | 293 -----------
 tools/bmad/.claude/skills/bmad-party-mode/SKILL.md              | 128 -----
 .../.claude/skills/bmad-review-adversarial-general/SKILL.md     |  37 --
 tools/bmad/.claude/skills/bmad-review-edge-case-hunter/SKILL.md |  67 ---
 tools/bmad/.claude/skills/bmad-shard-doc/SKILL.md               | 105 ----
 tools/bmad/.claude/skills/bmad-workflow-builder/SKILL.md        |  38 --
 .../skills/bmad-workflow-builder/assets/SKILL-template.md       |  53 --
 .../skills/bmad-workflow-builder/assets/customize-template.toml |  56 ---
 .../assets/sample-customize-product-brief.toml                  |  66 ---
 .../skills/bmad-workflow-builder/references/build-process.md    | 154 ------
 .../references/complex-workflow-patterns.md                     |  95 ----
 .../skills/bmad-workflow-builder/references/quality-analysis.md | 140 ------
 .../references/quality-scan-architecture.md                     |  63 ---
 .../references/quality-scan-customization.md                    |  48 --
 .../references/quality-scan-determinism.md                      |  60 ---
 .../references/quality-scan-enhancement.md                      |  55 --
 .../references/report-quality-scan-creator.md                   | 182 -------
 .../references/script-opportunities-reference.md                | 100 ----
 .../skills/bmad-workflow-builder/references/script-standards.md |  92 ----
 .../references/skill-quality-principles.md                      | 230 ---------
 .../skills/bmad-workflow-builder/references/standard-fields.md  | 196 --------
 .../references/template-substitution-rules.md                   |  47 --
 .../skills/bmad-workflow-builder/scripts/extract-report-json.py | 287 -----------
 .../bmad-workflow-builder/scripts/generate-html-report.py       | 588 ----------------------
 .../bmad-workflow-builder/scripts/prepass-execution-deps.py     | 288 -----------
 .../bmad-workflow-builder/scripts/prepass-prompt-metrics.py     | 285 -----------
 .../bmad-workflow-builder/scripts/prepass-workflow-integrity.py | 475 ------------------
 .../skills/bmad-workflow-builder/scripts/scan-path-standards.py | 298 -----------
 .../skills/bmad-workflow-builder/scripts/scan-scripts.py        | 745 ---------------------------
 tools/bmad/_bmad/_config/bmad-help.csv                          |  23 -
 tools/bmad/_bmad/_config/files-manifest.csv                     | 157 ------
 tools/bmad/_bmad/_config/manifest.yaml                          |  23 -
 tools/bmad/_bmad/_config/skill-manifest.csv                     |  18 -
 tools/bmad/_bmad/bmb/config.yaml                                |  10 -
 tools/bmad/_bmad/bmb/module-help.csv                            |  11 -
 tools/bmad/_bmad/config.toml                                    |  15 -
 tools/bmad/_bmad/config.user.toml                               |  13 -
 tools/bmad/_bmad/core/config.yaml                               |   6 -
 tools/bmad/_bmad/core/module-help.csv                           |  13 -
 tools/bmad/_bmad/custom/.gitignore                              |   1 -
 tools/bmad/_bmad/custom/config.toml                             |   7 -
 tools/bmad/_bmad/scripts/resolve_config.py                      | 176 -------
 tools/bmad/_bmad/scripts/resolve_customization.py               | 230 ---------
 161 files changed, 26138 deletions(-)
```

---

## `28d27b1` — chore: install BMAD-Method agent builder (bmb) to tools/bmad/

*2026-05-24 · Markus Holzhauser*

Adds the BMAD-Method framework as a parallel agent-building toolkit,
isolated to tools/bmad/ so it cannot collide with the existing
.claude/skills/ pipeline. Installed via:

  npx -y bmad-method install --directory tools/bmad --modules bmb \
       --tools claude-code --user-name "Markus Holzhauser" --yes

The 17 bmad-* skills (agent-builder, module-builder, workflow-builder,
brainstorming, party-mode, …) land under tools/bmad/.claude/skills/.
They are NOT part of the Processminer QER pipeline — they are tooling
for authoring fresh agents and workflows, kept entirely separate from
the SME / architect specialists in the repo root .claude/skills/.

  - .gitignore — excludes per-user config + generated outputs
    (config.user.toml, _bmad-output/, skills/reports/)
  - CLAUDE.md — new "BMAD-Method" section explains where it lives,
    when to ignore it, and the re-install command.

check_skill_blocks.py still passes — the verbatim block contract is
scoped to the named Processminer specialists, not BMAD's skills.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 .gitignore                                                      |   7 +
 CLAUDE.md                                                       |  21 +
 tools/bmad/.claude/skills/bmad-advanced-elicitation/SKILL.md    | 142 ++++++
 tools/bmad/.claude/skills/bmad-advanced-elicitation/methods.csv |  51 ++
 tools/bmad/.claude/skills/bmad-agent-builder/SKILL.md           |  70 +++
 .../.claude/skills/bmad-agent-builder/assets/BOND-template.md   |  14 +
 .../skills/bmad-agent-builder/assets/CAPABILITIES-template.md   |  30 ++
 .../.claude/skills/bmad-agent-builder/assets/CREED-template.md  |  52 ++
 .../.claude/skills/bmad-agent-builder/assets/INDEX-template.md  |  15 +
 .../.claude/skills/bmad-agent-builder/assets/MEMORY-template.md |   7 +
 .../skills/bmad-agent-builder/assets/PERSONA-template.md        |  24 +
 .../.claude/skills/bmad-agent-builder/assets/PULSE-template.md  |  38 ++
 .../bmad-agent-builder/assets/SKILL-template-bootloader.md      |  60 +++
 .../.claude/skills/bmad-agent-builder/assets/SKILL-template.md  |  90 ++++
 .../bmad-agent-builder/assets/capability-authoring-template.md  | 110 ++++
 .../skills/bmad-agent-builder/assets/customize-template.toml    |  62 +++
 .../bmad-agent-builder/assets/first-breath-config-template.md   |  80 +++
 .../skills/bmad-agent-builder/assets/first-breath-template.md   | 115 +++++
 .../skills/bmad-agent-builder/assets/init-sanctum-template.py   | 277 +++++++++++
 .../bmad-agent-builder/assets/memory-guidance-template.md       |  93 ++++
 .../bmad-agent-builder/assets/sample-customize-analyst.toml     |  87 ++++
 .../skills/bmad-agent-builder/references/agent-type-guidance.md |  88 ++++
 .../skills/bmad-agent-builder/references/build-process.md       | 349 +++++++++++++
 .../skills/bmad-agent-builder/references/edit-guidance.md       |  88 ++++
 .../references/first-breath-adaptation-guidance.md              | 116 +++++
 .../bmad-agent-builder/references/mission-writing-guidance.md   |  81 +++
 .../skills/bmad-agent-builder/references/quality-analysis.md    | 139 ++++++
 .../skills/bmad-agent-builder/references/quality-dimensions.md  |  77 +++
 .../references/quality-scan-agent-cohesion.md                   | 151 ++++++
 .../references/quality-scan-customization-surface.md            | 188 +++++++
 .../references/quality-scan-enhancement-opportunities.md        | 189 +++++++
 .../references/quality-scan-execution-efficiency.md             | 159 ++++++
 .../bmad-agent-builder/references/quality-scan-prompt-craft.md  | 228 +++++++++
 .../references/quality-scan-sanctum-architecture.md             | 160 ++++++
 .../references/quality-scan-script-opportunities.md             | 220 ++++++++
 .../bmad-agent-builder/references/quality-scan-structure.md     | 168 +++++++
 .../references/report-quality-scan-creator.md                   | 319 ++++++++++++
 .../references/sample-capability-authoring.md                   | 110 ++++
 .../bmad-agent-builder/references/sample-capability-prompt.md   |  65 +++
 .../skills/bmad-agent-builder/references/sample-first-breath.md | 117 +++++
 .../skills/bmad-agent-builder/references/sample-init-sanctum.py | 274 ++++++++++
 .../bmad-agent-builder/references/sample-memory-guidance.md     |  93 ++++
 .../references/script-opportunities-reference.md                | 392 +++++++++++++++
 .../skills/bmad-agent-builder/references/script-standards.md    |  91 ++++
 .../bmad-agent-builder/references/skill-best-practices.md       | 144 ++++++
 .../skills/bmad-agent-builder/references/standard-fields.md     | 198 ++++++++
 .../bmad-agent-builder/references/standing-order-guidance.md    |  76 +++
 .../references/template-substitution-rules.md                   |  92 ++++
 .../skills/bmad-agent-builder/scripts/generate-html-report.py   | 534 ++++++++++++++++++++
 .../skills/bmad-agent-builder/scripts/prepass-execution-deps.py | 337 +++++++++++++
 .../skills/bmad-agent-builder/scripts/prepass-prompt-metrics.py | 425 ++++++++++++++++
 .../bmad-agent-builder/scripts/prepass-sanctum-architecture.py  | 385 ++++++++++++++
 .../scripts/prepass-structure-capabilities.py                   | 482 ++++++++++++++++++
 .../skills/bmad-agent-builder/scripts/process-template.py       | 190 +++++++
 .../skills/bmad-agent-builder/scripts/scan-path-standards.py    | 324 ++++++++++++
 .../.claude/skills/bmad-agent-builder/scripts/scan-scripts.py   | 747 ++++++++++++++++++++++++++++
 tools/bmad/.claude/skills/bmad-bmb-setup/SKILL.md               |  76 +++
 tools/bmad/.claude/skills/bmad-bmb-setup/assets/module-help.csv |  10 +
 tools/bmad/.claude/skills/bmad-bmb-setup/assets/module.yaml     |  20 +
 .../.claude/skills/bmad-bmb-setup/scripts/cleanup-legacy.py     | 259 ++++++++++
 .../bmad/.claude/skills/bmad-bmb-setup/scripts/merge-config.py  | 408 +++++++++++++++
 .../.claude/skills/bmad-bmb-setup/scripts/merge-help-csv.py     | 218 ++++++++
 tools/bmad/.claude/skills/bmad-brainstorming/SKILL.md           |   6 +
 tools/bmad/.claude/skills/bmad-brainstorming/brain-methods.csv  |  62 +++
 .../skills/bmad-brainstorming/steps/step-01-session-setup.md    | 214 ++++++++
 .../skills/bmad-brainstorming/steps/step-01b-continue.md        | 124 +++++
 .../skills/bmad-brainstorming/steps/step-02a-user-selected.md   | 229 +++++++++
 .../skills/bmad-brainstorming/steps/step-02b-ai-recommended.md  | 239 +++++++++
 .../bmad-brainstorming/steps/step-02c-random-selection.md       | 211 ++++++++
 .../bmad-brainstorming/steps/step-02d-progressive-flow.md       | 266 ++++++++++
 .../bmad-brainstorming/steps/step-03-technique-execution.md     | 401 +++++++++++++++
 .../bmad-brainstorming/steps/step-04-idea-organization.md       | 305 ++++++++++++
 tools/bmad/.claude/skills/bmad-brainstorming/template.md        |  15 +
 tools/bmad/.claude/skills/bmad-brainstorming/workflow.md        |  53 ++
 tools/bmad/.claude/skills/bmad-customize/SKILL.md               | 111 +++++
 .../skills/bmad-customize/scripts/list_customizable_skills.py   | 231 +++++++++
 .../scripts/tests/test_list_customizable_skills.py              | 249 ++++++++++
 tools/bmad/.claude/skills/bmad-distillator/SKILL.md             | 177 +++++++
 .../skills/bmad-distillator/agents/distillate-compressor.md     | 116 +++++
 .../skills/bmad-distillator/agents/round-trip-reconstructor.md  |  68 +++
 .../skills/bmad-distillator/resources/compression-rules.md      |  51 ++
 .../bmad-distillator/resources/distillate-format-reference.md   | 227 +++++++++
 .../skills/bmad-distillator/resources/splitting-strategy.md     |  78 +++
 .../.claude/skills/bmad-distillator/scripts/analyze_sources.py  | 300 +++++++++++
 .../bmad-distillator/scripts/tests/test_analyze_sources.py      | 204 ++++++++
 tools/bmad/.claude/skills/bmad-editorial-review-prose/SKILL.md  |  86 ++++
 .../.claude/skills/bmad-editorial-review-structure/SKILL.md     | 179 +++++++
 tools/bmad/.claude/skills/bmad-eval-runner/SKILL.md             |  91 ++++
 tools/bmad/.claude/skills/bmad-eval-runner/agents/grader.md     |  93 ++++
 tools/bmad/.claude/skills/bmad-eval-runner/assets/Dockerfile    |  29 ++
 .../.claude/skills/bmad-eval-runner/references/eval-formats.md  | 147 ++++++
 .../.claude/skills/bmad-eval-runner/references/isolation.md     | 110 ++++
 .../.claude/skills/bmad-eval-runner/scripts/docker_setup.py     | 115 +++++
 .../.claude/skills/bmad-eval-runner/scripts/generate_report.py  | 184 +++++++
 .../bmad/.claude/skills/bmad-eval-runner/scripts/pty_runner.py  | 171 +++++++
 tools/bmad/.claude/skills/bmad-eval-runner/scripts/run_evals.py | 492 ++++++++++++++++++
 .../.claude/skills/bmad-eval-runner/scripts/run_triggers.py     | 366 ++++++++++++++
 tools/bmad/.claude/skills/bmad-eval-runner/scripts/utils.py     | 260 ++++++++++
 tools/bmad/.claude/skills/bmad-help/SKILL.md                    |  75 +++
 tools/bmad/.claude/skills/bmad-index-docs/SKILL.md              |  66 +++
 tools/bmad/.claude/skills/bmad-module-builder/SKILL.md          |  32 ++
 .../skills/bmad-module-builder/assets/module-plan-template.md   | 128 +++++
 .../bmad-module-builder/assets/setup-skill-template/SKILL.md    |  76 +++
 .../assets/setup-skill-template/assets/module-help.csv          |   1 +
 .../assets/setup-skill-template/assets/module.yaml              |   6 +
 .../assets/setup-skill-template/scripts/cleanup-legacy.py       | 259 ++++++++++
 .../assets/setup-skill-template/scripts/merge-config.py         | 408 +++++++++++++++
 .../assets/setup-skill-template/scripts/merge-help-csv.py       | 218 ++++++++
 .../assets/standalone-module-template/merge-config.py           | 408 +++++++++++++++
 .../assets/standalone-module-template/merge-help-csv.py         | 218 ++++++++
 .../assets/standalone-module-template/module-setup.md           |  81 +++
 .../skills/bmad-module-builder/references/create-module.md      | 277 +++++++++++
 .../skills/bmad-module-builder/references/ideate-module.md      | 216 ++++++++
 .../skills/bmad-module-builder/references/validate-module.md    |  86 ++++
 .../skills/bmad-module-builder/scripts/scaffold-setup-skill.py  | 124 +++++
 .../bmad-module-builder/scripts/scaffold-standalone-module.py   | 190 +++++++
 .../scripts/tests/test-scaffold-setup-skill.py                  | 230 +++++++++
 .../scripts/tests/test-scaffold-standalone-module.py            | 266 ++++++++++
 .../bmad-module-builder/scripts/tests/test-validate-module.py   | 314 ++++++++++++
 .../skills/bmad-module-builder/scripts/validate-module.py       | 293 +++++++++++
 tools/bmad/.claude/skills/bmad-party-mode/SKILL.md              | 128 +++++
 .../.claude/skills/bmad-review-adversarial-general/SKILL.md     |  37 ++
 tools/bmad/.claude/skills/bmad-review-edge-case-hunter/SKILL.md |  67 +++
 tools/bmad/.claude/skills/bmad-shard-doc/SKILL.md               | 105 ++++
 tools/bmad/.claude/skills/bmad-workflow-builder/SKILL.md        |  38 ++
 .../skills/bmad-workflow-builder/assets/SKILL-template.md       |  53 ++
 .../skills/bmad-workflow-builder/assets/customize-template.toml |  56 +++
 .../assets/sample-customize-product-brief.toml                  |  66 +++
 .../skills/bmad-workflow-builder/references/build-process.md    | 154 ++++++
 .../references/complex-workflow-patterns.md                     |  95 ++++
 .../skills/bmad-workflow-builder/references/quality-analysis.md | 140 ++++++
 .../references/quality-scan-architecture.md                     |  63 +++
 .../references/quality-scan-customization.md                    |  48 ++
 .../references/quality-scan-determinism.md                      |  60 +++
 .../references/quality-scan-enhancement.md                      |  55 ++
 .../references/report-quality-scan-creator.md                   | 182 +++++++
 .../references/script-opportunities-reference.md                | 100 ++++
 .../skills/bmad-workflow-builder/references/script-standards.md |  92 ++++
 .../references/skill-quality-principles.md                      | 230 +++++++++
 .../skills/bmad-workflow-builder/references/standard-fields.md  | 196 ++++++++
 .../references/template-substitution-rules.md                   |  47 ++
 .../skills/bmad-workflow-builder/scripts/extract-report-json.py | 287 +++++++++++
 .../bmad-workflow-builder/scripts/generate-html-report.py       | 588 ++++++++++++++++++++++
 .../bmad-workflow-builder/scripts/prepass-execution-deps.py     | 288 +++++++++++
 .../bmad-workflow-builder/scripts/prepass-prompt-metrics.py     | 285 +++++++++++
 .../bmad-workflow-builder/scripts/prepass-workflow-integrity.py | 475 ++++++++++++++++++
 .../skills/bmad-workflow-builder/scripts/scan-path-standards.py | 298 +++++++++++
 .../skills/bmad-workflow-builder/scripts/scan-scripts.py        | 745 +++++++++++++++++++++++++++
 tools/bmad/_bmad/_config/bmad-help.csv                          |  23 +
 tools/bmad/_bmad/_config/files-manifest.csv                     | 157 ++++++
 tools/bmad/_bmad/_config/manifest.yaml                          |  23 +
 tools/bmad/_bmad/_config/skill-manifest.csv                     |  18 +
 tools/bmad/_bmad/bmb/config.yaml                                |  10 +
 tools/bmad/_bmad/bmb/module-help.csv                            |  11 +
 tools/bmad/_bmad/config.toml                                    |  15 +
 tools/bmad/_bmad/config.user.toml                               |  13 +
 tools/bmad/_bmad/core/config.yaml                               |   6 +
 tools/bmad/_bmad/core/module-help.csv                           |  13 +
 tools/bmad/_bmad/custom/.gitignore                              |   1 +
 tools/bmad/_bmad/custom/config.toml                             |   7 +
 tools/bmad/_bmad/scripts/resolve_config.py                      | 176 +++++++
 tools/bmad/_bmad/scripts/resolve_customization.py               | 230 +++++++++
 162 files changed, 26145 insertions(+)
```

---

## `7a84443` — fix(access): admins see every process on disk, not just tracked ones

*2026-05-24 · Markus Holzhauser*

accessibleSlugs previously returned only the slugs already recorded in
data/process-access.json for admins. The bootstrap that backfills new
slugs runs once per Node process, so any process appearing on disk after
server start (re-ingest, /new-process, restored folder) silently
disappeared from the admin's view until restart.

The access file is for ownership + grantee bookkeeping; it is not the
admin's source of truth. Read directly from wiki/processes/ for admins
so a freshly-landed folder is immediately visible — no restart, no
"why can't I see this process I just created" puzzle.

Non-admin behaviour is unchanged.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 src/lib/process-access.ts | 8 ++++++--
 1 file changed, 6 insertions(+), 2 deletions(-)
```

---

## `ab4e351` — chore(architectminer): drop all remaining mock fixtures

*2026-05-24 · Markus Holzhauser*

Three pockets of hardcoded content cleaned up in one pass:

  - Migration view in ArchitectureCanvas: the 320x880 SVG Gantt + the
    four phase cards + the entire details aside were hardcoded to a
    mock DDMM rollout (MIG-{pid}-001..004 with fake quarters, owners,
    budgets, risks). Replaced with cards rendered from
    archData.migrations (real phaseStatus / startQuarter / endQuarter
    / delivers / dependsOn) and a details aside that pulls the first
    migration's real fields + relations + block prose.

  - Capabilities details aside: was hardcoded to a "Case capture &
    validation" example with fake CAP-/ADR-/NFR-/G- chip lists. Now
    walks doc.elements to find adrs whose realisesCapability points
    at the first capability, NFRs whose appliesTo includes it, and
    renders realisesStep / resolvesGap from the cap's own frontmatter.

  - All seven architect-view breadcrumbs (Capabilities, Target
    Applications, Target Integrations, Components, NFRs, Migration
    Phases, ADRs) previously suffixed with fake ids like CAP-{pid}-002;
    now derive from archData[section][0]?.id with the segment omitted
    when none exists. The `pid` const is removed.

  - HandoffInbox header: "workspace · Retail Banking" was a leftover
    placeholder; reads "Handoff inbox · N processes" derived from
    docs.length.

  - Pattern library removed entirely (nav row, dispatch, and the
    LibraryViews PatternLibrary + PatternCard exports). No `pattern`
    element type exists in the schema, so there's nothing to
    aggregate; bringing it back is a small re-add once that type lands.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 src/components/ArchitectureCanvas.tsx | 518 +++++++++++++++++++++++++++++-------------------------
 src/components/HandoffInbox.tsx       |  16 +-
 src/components/LibraryViews.tsx       | 154 ----------------
 3 files changed, 278 insertions(+), 410 deletions(-)
```

---

## `ddbea02` — chore(architectminer): drop dead mock ADR array + gated legacy trace table

*2026-05-24 · Markus Holzhauser*

The ADRs view + breadcrumb were the last spots in ArchitectureCanvas
still touching the mock adrs[] fixture. The breadcrumb now derives the
displayed ADR id from archData.adrsReal[0] when one exists.

Also removes the {false && (...)} legacy mock trace table that has been
gated off since Traceability got wired to doc.elements — 150 lines of
inert markup.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 src/components/ArchitectureCanvas.tsx | 173 ++++--------------------------------------------------
 1 file changed, 11 insertions(+), 162 deletions(-)
```

---

## `98faa19` — feat(skills): add domain-architect + solution-architect specialists

*2026-05-23 · Markus Holzhauser*

Two new perspective specialists for the architect-side of the wiki —
the target architecture. They follow the same Brainstorm / Author /
Verify pattern as the SME-side specialists (process-specialist,
control-compliance-specialist, …) and carry the byte-identical
BATCHING / WRITING-PROCEDURE / PROVENANCE blocks.

  - domain-architect — owns capability, target-application, adr.
    Walks the target process to elicit business capabilities, hosts
    them in target applications (reuse before build, scanning the
    bank-wide catalog first), and records architecture decisions
    where there is a real choice between alternatives. Pushes back
    on ADRs that name no alternative; pushes back on "new"
    capabilities that already exist in the catalog.

  - solution-architect — owns target-integration, component, nfr,
    migration-phase. Picks up where the Domain Architect leaves off:
    integrations between target apps (with pattern/direction/contract/
    volume), components inside each app (tech/dataStore/hosting/
    scaling), NFRs with measurable targets ("p95 < 1.2s", not "fast"),
    and migration phases with status + scope + acceptance criteria.

The canvas "Elicit with domain architect" / "Elicit with solution
architect" buttons now route to the matching skill instead of the
SME-side it-architect. SECTION_TO_SPECIALIST in ArchitectureCanvas.tsx
is the routing table; SKILL_LABEL renders the active-skill chip text;
check_skill_blocks.py covers both new specialists for verbatim-block
drift (9 PROVENANCE copies, 8 WRITING-PROCEDURE, 8 BATCHING).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 .claude/skills/domain-architect/SKILL.md   | 328 ++++++++++++++++++++++++++++++++++++++++++++++
 .claude/skills/solution-architect/SKILL.md | 343 +++++++++++++++++++++++++++++++++++++++++++++++++
 SKILLS.md                                  |   8 +-
 scripts/check_skill_blocks.py              |   2 +
 src/components/ArchitectureCanvas.tsx      |  37 ++++--
 src/lib/agent-chat-utils.ts                |   2 +
 6 files changed, 706 insertions(+), 14 deletions(-)
```

---

## `de91eef` — feat(architectminer): wire personal-work + library tiers to real data

*2026-05-23 · Markus Holzhauser*

LibraryViews and PersonalViews now derive every count, row, and card
from doc.elements across all processes the architect has access to —
no more inline mock arrays. The sidebar badge counts in HandoffInbox
also move from hardcoded numbers to live aggregates.

  - Capability catalog walks every "capabilities" element bank-wide,
    groups by title to detect reuse across processes, resolves each
    capability's hostedIn relation against the cross-process app index
    so the card shows the real host app + verdict.
  - Application register lists every target-application with its real
    verdict (BUILD / BUY / CONFIGURE / KEEP), vendor / owner, and the
    capabilities that host in it.
  - NFR templates groups authored NFRs by category (perf / avail /
    sec / comp / scale), reading the schema's `category` field.
  - All processes bucks each doc into one of six architect-side
    stages from the elements actually authored (upstream → ready →
    domain → solution → build → complete) and shows the real
    architect-element counts + approval %.
  - My ADRs queries every architecture-decision element, normalizes
    the adrStatus field, and shows the slice the signed-in architect
    owns (or all unowned ones).
  - Migration plans aggregates migration-phase elements per process
    and shows live phase counts (done / in flight / planned).

Pattern library stays static for now — no `pattern` element type in
the schema yet; TODO comment marks the upgrade path.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 src/components/HandoffInbox.tsx  |  40 +++--
 src/components/LibraryViews.tsx  | 387 +++++++++++++++++++++++++++++++++-------------
 src/components/PersonalViews.tsx | 489 +++++++++++++++++++++++++++++++++++++----------------------
 3 files changed, 620 insertions(+), 296 deletions(-)
```

---

## `27d68e4` — feat(contributors): real attribution + richer activity feed

*2026-05-23 · Markus Holzhauser*

Every wiki write now stamps `updatedBy` / `updatedAt`, and the Contributors
view surfaces five event kinds — comments, uploads, ingests, approvals,
edits, lint runs, section-status marks — with rollups and a per-person filter.

- saveElement (server action) reads the session cookie to attribute the
  edit; the Python toolkit gains `--by` on write_element / write_elements /
  patch_element and a shared `stamp_edit` helper in wiki_lib.
- contributors.ts reads approvalBy/Date + updatedBy/At off element
  frontmatter, lint.json (generatedAt + summary), and sections.json
  (status mark, by, date).
- WRITING-PROCEDURE-BLOCK across the 6 specialist skills teaches the
  skills to pass `--by "<SME name>"` so the feed gets real names instead
  of "the assistant".

**Non-wiki files changed:**

```
 .claude/skills/client-journey-specialist/SKILL.md     |  7 +++++
 .claude/skills/control-compliance-specialist/SKILL.md |  7 +++++
 .claude/skills/innovation-analyst/SKILL.md            |  7 +++++
 .claude/skills/it-architect/SKILL.md                  |  7 +++++
 .claude/skills/process-specialist/SKILL.md            |  7 +++++
 .claude/skills/transformation-agent/SKILL.md          |  7 +++++
 scripts/wiki/patch_element.py                         | 34 +++++++++++++++-----
 scripts/wiki/wiki_lib.py                              | 23 +++++++++++++-
 scripts/wiki/write_element.py                         | 23 +++++++++++---
 scripts/wiki/write_elements.py                        | 23 +++++++++++---
 src/app/globals.css                                   |  2 ++
 src/components/ContributorsView.tsx                   | 11 ++++++-
 src/lib/contributors.ts                               | 65 ++++++++++++++++++++++++++++++++++++++-
 src/lib/wiki-write.ts                                 | 25 +++++++++++++++
 14 files changed, 228 insertions(+), 20 deletions(-)
```

---

## `c00ea31` — feat(architectminer): wire chat pipeline + Add/Elicit buttons via useAgentChat

*2026-05-23 · Markus Holzhauser*

Extracts the /api/session chat pipeline from ProcessDocScreen into a
shared useAgentChat hook (src/hooks/useAgentChat.ts) backed by pure
helpers in src/lib/agent-chat-utils.ts (ETA history, watchdog timeout,
sessionStorage persistence, browser notifications, SKILL_LABEL).

ProcessDocScreen now consumes the hook — SSE streaming, the stuck-turn
watchdog, transcript persistence, and the active-skill chip all live in
one place. ArchitectureCanvas mounts the same hook with an architect-
side scope preamble and "am-chat" storage prefix, so the architect's
transcript is independent of the SME's.

Every "+ Add X" header button (ADR / Capability / Application /
Integration / Component / NFR / Phase) now fires add-entry against
the section the button lives on, and each "Elicit with architect"
primary button runs the it-architect specialist scoped to that section.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 src/app/AuthGate.tsx                  |   1 +
 src/app/ProcessDocScreen.tsx          | 512 ++++++------------------------------------------------
 src/components/ArchitectureCanvas.tsx | 247 +++++++++++++++++++++++---
 src/hooks/useAgentChat.ts             | 332 +++++++++++++++++++++++++++++++++++
 src/lib/agent-chat-utils.ts           | 172 ++++++++++++++++++
 5 files changed, 783 insertions(+), 481 deletions(-)
```

---

## `db525cf` — feat: wire Diagram + Traceability + user/access management

*2026-05-23 · Markus Holzhauser*

ArchitectMiner canvas — Diagram and Traceability now derive from
doc.elements. Diagram auto-positions caps + apps and draws hostedIn
and integration edges; Traceability scans every architect element's
relations and buckets each as OK / partial / orphan.

Adds the user-management + access-control surface around it: UserMenu
with profile and password modals, AdminScreen contributors view, and
the supporting API routes (auth/password, auth/profile, processes
grant/owner/contributors) plus lib/contributors and lib/process-access.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

**Non-wiki files changed:**

```
 src/app/AuthGate.tsx                                   |   17 +-
 src/app/ProcessDocScreen.tsx                           |  177 +----
 src/app/api/auth/login/route.ts                        |    5 +-
 src/app/api/auth/me/route.ts                           |   11 +-
 src/app/api/auth/password/route.ts                     |   53 ++
 src/app/api/auth/profile/route.ts                      |   57 ++
 src/app/api/processes/[slug]/contributors/route.ts     |   33 +
 src/app/api/processes/[slug]/grant/[username]/route.ts |   35 +
 src/app/api/processes/[slug]/grant/route.ts            |   48 ++
 src/app/api/processes/[slug]/owner/route.ts            |   42 ++
 src/app/api/processes/route.ts                         |   26 +
 src/app/globals.css                                    |  406 +++++++++++
 src/app/page.tsx                                       |   31 +-
 src/components/AdminScreen.tsx                         |  426 +++++++++++-
 src/components/ArchitectureCanvas.tsx                  | 1340 +++++++++++++++++-------------------
 src/components/ChangePasswordModal.tsx                 |  121 ++++
 src/components/ContributorsView.tsx                    |  240 +++++++
 src/components/EditProfileModal.tsx                    |   94 +++
 src/components/HandoffInbox.tsx                        |   24 +-
 src/components/UserMenu.tsx                            |  242 +++++++
 src/components/WelcomeScreen.tsx                       |   31 +-
 src/lib/auth-server.ts                                 |   24 +-
 src/lib/contributors.ts                                |  277 ++++++++
 src/lib/process-access.ts                              |  242 +++++++
 src/lib/user.ts                                        |    4 +
 25 files changed, 3096 insertions(+), 910 deletions(-)
```

---

