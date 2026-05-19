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

**The cursor.** `qer_cursor.py` owns `wiki/processes/<slug>/qer-state.json` —
the resumable record of which step the session is on. A QER session is long
and easily interrupted; the cursor is what lets a stopped session resume at the
right step rather than you re-deriving it by eye. You read it at the start
(Step 1) and advance it at the end of every step.

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
`qer_cursor.py status` reports, per perspective, whether its specialist skill
is built (`skillBuilt`); skip any that is not.

| Perspective | Skill | Owns |
|---|---|---|
| Process | `process-specialist` | process-step, exception, pain-point, process-gap, role, metric, stakeholder |
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
- **Existing** — list the slugs under `wiki/processes/`, let the SME pick. Read
  the current `index.md` so the session extends rather than duplicates.
- **New** — run the `new-process` skill (read `.claude/skills/new-process/
  SKILL.md` and follow it) to scaffold the process folder, the section folders
  and a skeleton `index.md`.

**Read the cursor** — `python3 scripts/wiki/qer_cursor.py status <slug>`:
- **`exists: false`, or `done: true`** — a fresh session. Run `python3
  scripts/wiki/qer_cursor.py start <slug>`, ask the SME their **name** and
  **role** (the human-in-the-loop record and `source` context the specialists
  use), then `python3 scripts/wiki/qer_cursor.py advance <slug>` and go to
  Step 2.
- **`exists: true`, `done: false`** — a session is already in flight. Tell the
  SME: "Resuming the QER session for **{process}** — at step {current}." Jump
  straight to the step the cursor names; do not re-run the completed steps.

Every step below ends by advancing the cursor — that is what moves the session
forward and lands a resume in the right place.

## Step 2 — OVERVIEW

Capture the process-level frame with the SME: **purpose, trigger, frequency,
volume, what is in scope and out of scope.** Draft it — never make the SME
write prose — then confirm with the **Y / E / R** loop. Offer the SME exactly
these three choices, verbatim, never just two:

- **[Y] Yes** — accurate, accept it.
- **[E] Edit** — apply the SME's corrections, show the result, ask again.
- **[R] Rewrite** — the draft missed; redraft together, then re-present.

On **[Y]**, write the overview with the script — never hand-edit `index.md`.
Assemble a JSON spec, save it to `/tmp/<slug>-overview.json`, and run
`python3 scripts/wiki/write_overview.py /tmp/<slug>-overview.json`:
```json
{
  "slug": "<slug>",
  "processOwner": "<role or ROLE id>",
  "trigger": "<what starts the process>",
  "frequency": "<how often>",
  "scopeIn": "<what the process covers>",
  "scopeOut": "<what it explicitly excludes>",
  "processInput": "<what comes in>",
  "processOutput": "<what comes out>",
  "docStatus": "As-Is draft",
  "purpose": "<a two-paragraph Purpose: what the process does, and why it matters to the bank>"
}
```
The script preserves the process identity (`id`, `type`, `title`, `status`)
from the scaffolded `index.md` and owns the frontmatter format — the overview
cannot come out malformed.

When the overview is written, run `python3 scripts/wiki/qer_cursor.py advance
<slug>` to move to Step 3.

## Step 3 — PERSPECTIVE PASSES

This step is six cursor positions — one per perspective, in registry order.
Loop, driven by the cursor:

1. Run `python3 scripts/wiki/qer_cursor.py status <slug>`. While `currentKey`
   names a perspective (the `skill` field is set):
2. If `skillBuilt` is `false`, tell the SME that specialist is not built yet,
   run `qer_cursor.py advance <slug>`, and continue the loop.
3. Tell the SME which perspective is starting and why ("Next we document the
   Process perspective — the steps, who does them, where it breaks").
4. Dispatch the `skill` in **`orchestrated` mode**: read its `SKILL.md` and run
   its perspective phases for this process. `orchestrated` mode tells the
   specialist to skip its own setup, overview and validation.
5. When the perspective is done, run `qer_cursor.py advance <slug>`, then
   **checkpoint with the SME**: "{Perspective} done — N elements drafted.
   Continue to the next perspective, or pause here?" The SME may stop at any
   point — the cursor holds the place for a later session.

The Target Process pass runs last (registry order): it synthesises the other
documented perspectives, so they must exist first. When the cursor's
`currentKey` reaches `cross-review`, the perspective passes are complete — go
to Step 4.

## Step 4 — CROSS-PERSPECTIVE REVIEW

Once **two or more** perspectives have been documented, each specialist reviews
the *other* perspectives' elements from its own lens — a process step with no
control, a touchpoint with no step behind it, a system nothing references.
Dispatch each built specialist again for a review-only pass; collect what they
flag as clarifying questions for the SME.

With only one perspective documented, state "cross-perspective review needs at
least two perspectives — skipping" and move on.

When the review pass is done, run `python3 scripts/wiki/qer_cursor.py advance
<slug>`.

## Step 5 — VALIDATION

First run the deterministic conformance check —
`python3 scripts/wiki/check_conformance.py <slug>` — which lists every element
whose blocks don't match its schema template.

Then do a judgement gap-analysis pass over everything written this session:
elements missing required links, steps with no owner or no rationale, orphaned
elements, anything that reads thin. Surface each finding — and each conformance
issue from the script — as a short clarifying question the SME can answer now,
defer, or skip. Apply any answers through the owning specialist.

When validation is done, run `python3 scripts/wiki/qer_cursor.py advance
<slug>`.

## Step 6 — DONE

Run `python3 scripts/wiki/qer_cursor.py advance <slug>` — that marks the
session `done`. Then close with the canonical close-out: run `python3
scripts/wiki/verbatim.py qer-closeout` and present what it prints, filling the
`{process}` / `{n}` / `{type}` placeholders from the counts. Reproduce every
other character — the bullet labels, the `status: draft` line, the closing
sentence — exactly; `verbatim.py` is the single source of truth, never write
it from memory. You never set `approved` — that is the SME's call, in the app.
