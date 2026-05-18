# Funds Release — Full F2B Walkthrough: Observations

A front-to-back walkthrough of Processminer v2, performed entirely through the
web UI (no CLI used to advance the process). Path exercised:

`new-process` → `document-ingest` (funds-release-dtp-mockup.md) → triage screen →
`foundational-run` (37 As-Is items) → `source-regulation` / `source-cx` /
`source-innovation` → `innovation-analyst` → full Target State.

Result on disk: 1 process, ~108 elements across all six areas, As-Is baseline of
37 elements approved, full forward view (trends, competitors, ideas, risks, 4
target-state elements, 4 transformation decisions, 7 gap-resolution elements).

Observations below are grouped by where the fix belongs. Severity: **[H]** high,
**[M]** medium, **[L]** low/cosmetic.

---

## 1. Language inconsistency — the most visible issue **[H]**

Every skill's chat *replies* and summaries are in English, but the streamed
*activity / pending lines* are in German. Observed across **every** skill:

- "Legt Prozess an …" (new-process)
- "Führt Befehl aus: find wiki/processes/funds-release -type f …" (document-ingest)
- "Bearbeitet index.md" (foundational-run)
- "Prüft Konformität …" (foundational-run close-out)
- "✏ Schreibt Wiki-Element …" (innovation-analyst)

The whole UI, the schema, and all element content are English. The activity-line
generation is not pinned to a language.

**Fix:** pin the activity-line language in the session route / the skill prompts
(or drive it from a locale setting). It is jarring and looks unfinished — a
reviewer notices it immediately.

---

## 2. Content inconsistencies in skill output (→ skill prompts)

These are the "inconsistencies in the answers" — defects in what the skills
*drafted*, which the prompts should prevent.

### 2a. document-ingest mis-maps metric `target` vs `value` **[H]**

3 of the 4 ingested metrics (M-FR-001, M-FR-002, M-FR-003) put the **target**
figure ("within 2 hours of receipt", "same business day", "within 1 business
day") into the `value` field and left `target` **empty**. M-FR-004 was the only
one structured correctly. This is systematic, not a one-off.

A foundational As-Is baseline with three turnaround metrics and **zero measured
actuals** has no quantitative picture of the process.

**Fix — document-ingest prompt:** add an explicit rule for SLA/target tables:
"the stated figure is the *target*; the measured actual is usually absent in a
process-design document — leave `value` empty and flag it unmeasured." Consider
having the foundational-run / lint flag any metric whose `target` is empty.

### 2b. document-ingest draws element `owner` at inconsistent granularity **[M]**

Owners came out as a mix of function ("Operations", "Compliance"), role
("Operations Analyst"), and were applied without distinguishing *who performs a
step* from *who is accountable for a control*:

- PS-FR-003 (compliance screening) got `Owner: Compliance` — but the step is
  automated; Compliance owns the *control*, not the step action.
- CP-FR-001 (an **automated** control) got `Owner: Operations Analyst` — an
  individual — while CP-FR-002 (also automated) got `Owner: Compliance` — a
  function. Two automated controls, two different owner grains.

**Fix — document-ingest prompt:** specify owner granularity. Step owner = who
performs it (or "system / unassigned" if automated); control owner = the
accountable *function*, never an individual; never pin an automated control to a
named person.

### 2c. source-innovation maps trends/ideas only to the documented happy-path **[M]**

- TR-FR-004 (agentic AI) was sourced with `bearsOn PS-FR-002/006` and said
  nothing about the STP path — yet agentic triage is the obvious compensating
  control for the STP control gap.
- The sourced trend set had **no** trend on "continuous / automated controls on
  automated payment rails" — the single most relevant supervisory theme for a
  process whose biggest finding is the STP 4-eyes carve-out.
- No innovation idea addressed CG-FR-002 (the point-in-time facility-limit
  check) — ideas were generated against pain points and process gaps but not
  cross-checked against **control gaps**.

**Fix — source-innovation prompt:** tell it to consider *all* process branches
(including STP / automated paths), the control & regulatory angle, and to
cross-check generated ideas against every control gap, not only pain points and
process gaps.

### 2d. Skills narrate element IDs before they are reserved **[M]**

At item 5 the foundational run cited "PG-FR-005" for a gap it had only just
decided to create; later it told me it would raise "CG-FR-003" against CP-FR-004,
but the file written was actually **CG-FR-004** (CG-FR-003 had gone to a
different gap). `next_id.py` assigns IDs on write, so any ID the skill mentions
*before* writing can be wrong.

**Fix — all skills:** reserve the ID (call `next_id.py`) *before* narrating it,
or narrate provisionally ("a new control gap") and only state the ID once
written.

---

## 3. Workflow / skill-design inconsistencies

### 3a. foundational-run challenges all elements, not "every As-Is element" **[M]**

SKILLS.md §7 and the foundational-run description say the run challenges "every
**As-Is** element". The actual queue was all 37: overview + 8 process-steps +
5 roles + 4 exceptions + **6 controls** + **5 systems** + 4 metrics + 4
process-gaps. Controls belong to Risk & Compliance and systems to IT
Architecture — not the As-Is area. Mid-run the agent itself switched to "the
Control & Compliance lens" and "the IT Architect lens", contradicting the
"As-Is" / "Process Analyst persona" framing.

The control/system challenges were genuinely valuable — so the fix is probably
the **wording**, not the scope: SKILLS.md and the skill prompt should say "every
ingested element" and acknowledge the run adopts multiple lenses.

### 3b. Elements created mid-run fall outside the run's own queue **[M]**

The foundational run's queue is frozen at build time. The challenged walk created
**14 new elements** (PG-FR-005…011, CG-FR-001…004, PP-FR-001, EX-FR-005,
ROLE-FR-006) — none of which the run could then challenge or approve; they ended
draft/in-progress. The close-out flags this honestly ("Pick them off on the
cards"), but: ROLE-FR-006, EX-FR-005 and PP-FR-001 are genuine As-Is elements
that logically *should* have been reviewed.

**Fix — foundational-run prompt:** either offer to extend the queue with
newly-created As-Is elements before close-out, or have the close-out queue a
short follow-up review for them.

### 3c. Reworked elements are self-approved without showing the result **[L]**

When the SME gives a substantive answer, the run reworks the element, runs
`set_approval.py`, and advances — without re-presenting the reworked text. The
SME approves changes sight-unseen. Acceptable (the SME instructed the rework) but
worth a deliberate choice: a one-line "here is the reworked X — approved" echo
would let the SME catch a mis-applied rework.

### 3d. innovation-analyst cannot write a `market-trend` (needs a `sourceUrl`) **[M]**

The Innovation Analyst correctly refused to fabricate a `sourceUrl` for a new
trend (TR-FR-006, DORA) and deferred it to a `source-innovation` web pass — but
the handoff is just a sentence in the close-out telling the user to run another
skill. A specialist that legitimately needs a web-sourced element has no smooth
path to one.

**Fix:** either let the specialist trigger a scoped web lookup, or surface the
deferral as an actionable item (a button / triage entry), not buried prose.

---

## 4. UX observations

### 4a. Process selection + chat history lost on browser reload **[M]**

After any page reload the app reverts to the first process (COB-003), losing the
selected Funds Release process — there is no URL param or persisted selection.
The chat panel also resets to 0 messages. During a long multi-step session an
accidental reload loses your place. The top-bar **Triage** button only appears
for the *selected* process, so you can't see that a process has a pending triage
without first switching to it.

**Fix:** put the current process slug in the URL (and/or localStorage); persist
or rehydrate the chat session.

### 4b. Web-sourcing runs are strictly sequential, with no UI completion summary **[L]**

`runSourcing` guards with `if (sourcing?.status === "running") return;`, so
source-regulation / source-cx / source-innovation cannot be queued — sourcing all
three areas is three long waits, started one at a time. There is also a lag
between the element files existing on disk and the section updating (the section
shows "No elements yet" + the banner until the stream's `done` event triggers
`router.refresh()`). And unlike `document-ingest` (which lands on a triage
screen), a sourcing run ends with the banner just vanishing — no "sourced N
elements" confirmation.

**Fix:** allow queuing sourcing runs; show a short completion summary consistent
with the ingest triage.

### 4c. Triage "Start foundational run · 37" vs "36 drafts" **[L]**

The triage panel shows "Draft confidence — 36 drafts" but the run button reads
"· 37". The extra item is the process overview (approvable but not a "draft").
The off-by-one is briefly confusing; a word ("36 drafts + overview") or matching
the counts would help.

---

## 5. Formatting issues

### 5a. The Process Assistant chat does not render Markdown tables **[H]**

`document.querySelectorAll('.chat-msg table').length === 0` — and 4 chat messages
contained raw pipe text including `|---|---|` separator rows. The
Innovation Analyst outputs tables repeatedly (the trends, ideas, risks and
transformation-decision summaries were all tables) and every one rendered as
unaligned raw `| ID | Idea | … |` text. The chat's Markdown component renders
`<p>` / `<strong>` / `<code>` but not GFM tables.

**Fix:** add `remark-gfm` to the chat's `react-markdown` (the document view's
`Markdown.tsx` may already differ — confirm both), or instruct skills not to emit
tables in chat. Rendering them is the better fix.

---

## 6. What worked well (for balance)

- **document-ingest verification** stripped 3 inferred details (EX-FR-003 Impact,
  EX-FR-004 Description + Handling) and reported each clearly on both the triage
  screen and in chat. Exactly the right behaviour.
- **foundational-run challenge quality was high** — every process-step,
  exception, control, system and metric challenge surfaced a real defect (missing
  STP branch, point-in-time controls, owner granularity, SLA-clock treatment,
  per-currency cut-offs). The challenge → rework → approve loop is the strongest
  part of the product.
- **Cross-reference hygiene:** when PS-FR-006 moved to route-by-reason rejection
  routing, the run proactively realigned the already-approved PS-FR-004 loopback
  wording and flagged the change.
- **Innovation Analyst phase structure** (orient → refine trends → competitors →
  ideas → risks → target state → decisions → gaps → validation sweep) was
  coherent, and the closing validation sweep (orphan-idea / target-with-no-idea /
  gap-traces-nowhere checks) is a strong close-out.
- **Honest gap handling:** uncovered As-Is gaps (VG-FR-005/006/007) were written
  as explicitly *open* gap elements rather than hidden, and out-of-scope work
  (PG-FR-007) was flagged for the IT-Architect rather than silently dropped.

---

## 7. Priority shortlist for the skill prompts

1. **[H]** Pin activity-line language to English (§1).
2. **[H]** Fix document-ingest metric `target`/`value` mapping (§2a).
3. **[H]** Render Markdown tables in the chat (§5a).
4. **[M]** Standardise `owner` granularity in document-ingest (§2b).
5. **[M]** Reconcile foundational-run "As-Is" wording with its actual all-element
   scope (§3a), and handle mid-run-created elements (§3b).
6. **[M]** source-innovation: cover STP/automated branches + control gaps (§2c).
7. **[M]** Reserve element IDs before narrating them (§2d).
8. **[M]** Persist process selection across reload (§4a).
