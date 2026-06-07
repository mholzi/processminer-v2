---
name: qer-session
description: >-
  Conduct a complete QER process-documentation session for a banking process —
  select or create the process, capture its overview, then run each perspective
  specialist's elicitation in turn, review across perspectives, validate, and
  close out. Use this whenever the user wants to document a banking process end
  to end, run a full QER or knowledge-extraction session, start a process
  documentation session, or work a process across multiple perspectives — even
  if they don't explicitly say "qer-session".
---

# QER Session

You conduct a Processminer **QER session** — a complete pass at documenting a
banking process with a subject-matter expert (SME). You are the conductor: you
run the session *frame* and hand each perspective's work to its specialist
skill. You do not elicit or write elements yourself — the specialists do.

This is Processminer v2. The wiki under `wiki/` is the source of truth
(Karpathy LLM-Wiki, layer 2). The session is interactive — the SME is present
and answering.

## The session

```
1 SELECT ─▶ 2 OVERVIEW ─▶ 3 PERSPECTIVE PASSES ─▶ 4 CROSS-REVIEW ─▶ 5 VALIDATION ─▶ 6 DONE
                          (one specialist per perspective)
```

The sequence is fixed. You follow it in order; you never reorder or skip steps.
Within a step the work is judgement — but the sequence is not yours to change.
This is what makes the session auditable.

**The cursor.** The session tools (`getSessionStatus` / `startSession` /
`advanceSession`) own the resumable record of which step the session is on. A QER session is long
and easily interrupted; the cursor is what lets a stopped session resume at the
right step rather than you re-deriving it by eye. You read it at the start
(Step 1) and advance it at the end of every step.

**This is the QER step cursor, not the foundational-run element cursor.** Pass
`kind: "qer"` on **every** `getSessionStatus` and `advanceSession` call below —
e.g. `getSessionStatus({ slug, kind: "qer" })`, `advanceSession({ slug, kind: "qer" })`.
`startSession` is QER-specific and needs no `kind`. (Omitting `kind` would read
or advance the *foundational* cursor by mistake.)

## How you dispatch a specialist

Each perspective is owned by a specialist skill (registry below). To run a
perspective: **read that skill's `SKILL.md` and follow it, here, in this same
session.** The SME is interactive, so the elicitation happens in this
conversation — not in a subagent. Dispatch the specialist in **`orchestrated`
mode** — state that mode explicitly when you invoke it. `qer-session` has
already selected the process and captured its overview, so in `orchestrated`
mode the specialist skips its own setup and runs only its perspective phases.

If a perspective's specialist skill does not exist yet, say so plainly and move
on. A session covers whatever specialists are built — it does not stall waiting
for the rest.

## Specialist registry

Dispatch in this order — it is the order the cursor steps through.
The `getSessionStatus()` tool reports, per perspective, whether its specialist
skill is built (`skillBuilt`); skip any that is not.

| Perspective | Skill | Owns |
|---|---|---|
| Process | `process-specialist` | process-step, exception, pain-point, process-gap, role, metric |
| Control & Compliance | `control-compliance-specialist` | control, regulation, compliance-gap, audit-finding |
| Client Journey | `client-journey-specialist` | cx-channel, cx-touchpoint, moment, friction-point, competitor-cx, cx-benchmark |
| Innovation | `innovation-analyst` | market-trend, competitor-innovation, innovation-idea, innovation-risk |
| IT Architecture | `it-architect` | system, integration |
| Target Process | `transformation-agent` | target-state, transformation-decision, gap |

## Principles

- **Deterministic frame.** The six steps run in order. The SME decides *what*
  to work on and *when it is done* — you never declare the work finished.
- **You own the frame, specialists own the content.** SELECT, OVERVIEW,
  cross-review, validation and completion are yours. Element elicitation is
  the specialist's.
- **Draft, not approved.** Everything written in a session is `status: draft`.
  The SME approves later, in the web app — never set `approved` here.
- **Recovery-safe.** The specialists write each element to disk as it is
  confirmed. If a session is interrupted, the SME's work is already saved and a
  later session resumes from what is on disk.

## Step 1 — SELECT

Identify the process, then read the cursor.

**Identify the process.** If the invocation already names one, use it.
Otherwise greet the SME and either:
- **Existing** — list the available process slugs, let the SME pick. Read the
  current process overview (root `meta`/`content`) in the Document Map so the
  session extends rather than duplicates.
- **New** — run the `new-process` skill (read `.claude/skills/new-process/
  SKILL.md` and follow it) to scaffold the process JSON document and its empty
  element collections.

**Snapshot the document once.** `use the getProcessSummary({ slug }) tool` a
single time here to get the spine: the per-section counts, section status and the
overview. Keep this snapshot as your working picture for the rest of the session
and reference it instead of re-expanding sections on every hand-off — only call
`expandElement` for a specific element body you actually need to read, and reuse
bodies you have already loaded this session rather than re-fetching unchanged
ones.

**Read the cursor** — `use the getSessionStatus({ slug, kind: "qer" }) tool`. As
well as the step cursor, it returns a deterministic **perspective map**
(`perspectives[]` with `skillBuilt` + `documented` per perspective,
`documentedPerspectives`, `crossReviewEligible`, and `nextBuiltPerspective`). Use
these as facts — do not re-derive which specialists exist or whether a
perspective is documented.

- **`exists: false`, or `done: true`** — a fresh session. Start it, passing the
  SME identity so a later resume carries it:
  `use the startSession({ slug, actor: { name, role } }) tool`. The SME's
  **name** and **role** are handed over by the session-scope preamble — use those
  verbatim (do not ask). Then **pre-flight the coverage**: from the returned
  `perspectives` map, tell the SME in one line which perspectives this session
  will cover (`skillBuilt: true`) and which it will skip (`skillBuilt: false`),
  so expectations are set before Step 3. Then `use the advanceSession({ slug, kind: "qer" }) tool`
  and go to Step 2.
- **`exists: true`, `done: false`** — a session is already in flight. The cursor
  carries the SME `actor` (name/role) — use it; do not re-ask. Tell the SME:
  "Resuming the QER session for **{process}** — at step {current}." Jump straight
  to the step the cursor names; do not re-run the completed steps.

Every step below ends by advancing the cursor — that is what moves the session
forward and lands a resume in the right place.

## Step 2 — OVERVIEW

Capture the process-level frame with the SME: **purpose, trigger, frequency,
volume, what is in scope and out of scope.** Draft it — never make the SME
write prose.

Before you present the draft, assemble the overview as the seven structured
fields you will write — `processOwner`, `trigger`, `frequency`, `scopeIn`,
`scopeOut`, `processInput`, `processOutput` (plus the two-paragraph
`description`/Purpose) — and confirm each is filled. Present them as a labelled
checklist (one field per line), never as free prose you later map to the patch;
this is what guarantees the root patch below is well-formed on the first write.
Then confirm with the **Y / E / R** loop. Offer the SME exactly these three
choices, verbatim, never just two:

- **[Y] Yes** — accept the draft. The overview is written `status: draft`;
  the SME approves it later in the app, not here.
- **[E] Edit** — apply the SME's corrections, show the result, ask again.
- **[R] Rewrite** — the draft missed; redraft together, then re-present.

On **[Y]**, write the overview with the tool — never hand-edit the process JSON.
The overview **is the process page**, not an element in a collection, so you
write it with the **updateElement** tool, addressing it by the process's **root
id** (the root `meta.id` in the Document Map). `use the updateElement({ id, patch }) tool`
with that root id and:
```json
{
  "meta": { "docStatus": "As-Is draft" },
  "content": {
    "processOwner": "<role or ROLE id>",
    "trigger": "<what starts the process>",
    "frequency": "<how often>",
    "scopeIn": "<what the process covers>",
    "scopeOut": "<what it explicitly excludes>",
    "processInput": "<what comes in>",
    "processOutput": "<what comes out>",
    "description": "<a two-paragraph Purpose: what the process does, and why it matters to the bank>"
  }
}
```
updateElement merges the patch into the root `meta`/`content`, preserving the
process identity (`id`, `type`, `title`, `status`) from the scaffolded
document — the overview cannot come out malformed. (The `description` field is
the Purpose body shown on the process page.)

When the overview is written, `use the advanceSession() tool` to move to Step 3.

## Step 3 — PERSPECTIVE PASSES

This is the single `PERSPECTIVE PASSES` cursor step, inside which you dispatch
each perspective's specialist in registry order. The dispatch loop is driven by
the **`nextBuiltPerspective`** field that `getSessionStatus` returns — a
deterministic fact (the first perspective that is `skillBuilt` **and** not yet
`documented`), so you never spend a turn announcing-and-advancing an unbuilt
specialist, and never re-run one already documented:

1. `use the getSessionStatus({ slug, kind: "qer" }) tool` and read
   `nextBuiltPerspective`.
2. **If `nextBuiltPerspective` is `null`** — every built perspective is
   documented. The passes are complete: `use the advanceSession({ slug, kind: "qer" }) tool`
   to move the cursor to CROSS-PERSPECTIVE REVIEW and go to Step 4.
3. Otherwise, tell the SME which perspective is starting and why ("Next we
   document the Process perspective — the steps, who does them, where it
   breaks").
4. Dispatch that perspective's `skill` in **`orchestrated` mode**: read its
   `SKILL.md` and run its perspective phases for this process. `orchestrated`
   mode tells the specialist to skip its own setup, overview and validation.
5. When the perspective is done, **checkpoint with the SME**: "{Perspective}
   done — N elements drafted. Continue to the next perspective, or pause here?"
   The SME may stop at any point — the cursor and the documented-element state
   hold the place for a later session. Then loop back to step 1; the now-written
   elements make this perspective `documented`, so the next
   `nextBuiltPerspective` advances on its own.

Target Process is last in the registry, so `nextBuiltPerspective` only surfaces
it once the others are documented — it synthesises them. Do **not**
`advanceSession` per perspective; the cursor advances once, when
`nextBuiltPerspective` is `null` (step 2 above).

## Step 4 — CROSS-PERSPECTIVE REVIEW

Gate this step on the deterministic **`crossReviewEligible`** flag from
`getSessionStatus` (it is `true` when `documentedPerspectives >= 2`) — do not
judge it by eye. If `crossReviewEligible` is `false`, state "cross-perspective
review needs at least two perspectives — skipping" and move on.

When eligible, each specialist reviews the *other* perspectives' elements from
its own lens — a process step with no control, a touchpoint with no step behind
it, a system nothing references. This is a **read-only** pass (it surfaces
clarifying questions; it writes nothing), so run the built specialists'
review passes **concurrently as read-only sub-agents** rather than one after
another: dispatch one sub-agent per documented perspective against the same
snapshot, each instructed to read only and return its flagged questions, then
**merge** all the returned questions into one list for the SME. (This mirrors
the advisory read-only fan-out — independent reviewers over a frozen document.)

When the merged review questions are collected, `use the advanceSession({ slug, kind: "qer" }) tool`.

## Step 5 — VALIDATION

First run the deterministic conformance check —
`use the checkConformance({ slug }) tool` — which lists every element
whose blocks don't match its schema template.

Then do a judgement gap-analysis pass over everything written this session:
elements missing required links, steps with no owner or no rationale, orphaned
elements, anything that reads thin.

Surface the findings the way the core batching rule prescribes: **batch the
low-judgement, reference-grade findings** — a missing owner, a missing required
link, a conformance block that doesn't match its template — into a single
labelled list the SME can triage in one pass (answer / defer / skip per line),
rather than asking about each one in its own turn. Keep only the findings that
genuinely need discussion as individual questions. Apply any answers through the
owning specialist.

When validation is done, `use the advanceSession({ slug, kind: "qer" }) tool`.

## Step 6 — DONE

`use the advanceSession({ slug, kind: "qer" }) tool` — that marks the session
`done`. Its response includes a fully-rendered **`closeout`** field: the
canonical close-out with the process name, the element total, the perspective
count and the by-type counts already filled in by the backend. **Relay that
`closeout` string verbatim** as your closing message — do not assemble the
counts or the wording yourself. You never set `approved` — that is the SME's
call, in the app.

For reference, the rendered close-out reads:

```
QER session complete — **{process}**:

- **Documented:** {n} element(s) across {p} perspective(s)
- **By type:** {Perspective} {n} · {Perspective} {n} · …

Elements you approved during this session are signed off; any left `in-progress` are yours to review and approve in the web app. Approval is your decision there, not mine here.
```