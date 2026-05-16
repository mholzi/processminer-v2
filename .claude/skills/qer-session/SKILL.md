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

## How you dispatch a specialist

Each perspective is owned by a specialist skill (registry below). To run a
perspective: **read that skill's `SKILL.md` and follow it, here, in this same
session.** The SME is interactive, so the elicitation happens in this
conversation — not in a subagent. Tell the specialist that `qer-session` has
already selected the process and captured its overview, so it skips its own
setup and runs only its perspective phases.

If a perspective's specialist skill does not exist yet, say so plainly and move
on. A session covers whatever specialists are built — it does not stall waiting
for the rest.

## Specialist registry

Dispatch in this order. Skip any not-built specialist.

| Perspective | Skill | Status | Owns |
|---|---|---|---|
| Process | `process-specialist` | built | process-step, exception, pain-point, process-gap, role, metric |
| Control & Compliance | `control-specialist` | not built yet | control, regulation, compliance-gap, audit-finding |
| Client Journey | `client-journey-specialist` | not built yet | cx-touchpoint, moment, cx-channel, friction-point |
| Innovation | `innovation-analyst` | not built yet | market-trend, innovation-idea, innovation-risk, target-state, transformation-decision, gap |
| IT Architecture | `it-architect` | not built yet | system, integration |

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

Greet the SME. Ask their **name** and **role** — it is the human-in-the-loop
record and `source` context the specialists use.

Identify the process:
- **Existing** — list the slugs under `wiki/processes/`, let the SME pick. Read
  the current `index.md` so the session extends rather than duplicates.
- **New** — run the `new-process` skill (read `.claude/skills/new-process/
  SKILL.md` and follow it) to scaffold the process folder, the section folders
  and a skeleton `index.md`. Then continue to Step 2, which fills the overview.

## Step 2 — OVERVIEW

Capture the process-level frame with the SME: **purpose, trigger, frequency,
volume, what is in scope and out of scope.** Draft it — never make the SME
write prose — then confirm with the **Y / E / R** loop:

- **[Y] Yes** — accurate, accept it.
- **[E] Edit** — apply the SME's corrections, show the result, ask again.
- **[R] Rewrite** — the draft missed; redraft together, then re-present.

Write `wiki/processes/<slug>/index.md`:
```
---
id: <PROC>
type: process
title: <Process name>
status: draft
processOwner: <role or ROLE id>
trigger: <what starts the process>
frequency: <how often>
scopeIn: <what the process covers>
scopeOut: <what it explicitly excludes>
processInput: <what comes in>
processOutput: <what comes out>
docStatus: As-Is draft
---
<a two-paragraph Purpose: what the process does, and why it matters to the bank>
```

## Step 3 — PERSPECTIVE PASSES

For each **built** specialist in registry order:

1. Tell the SME which perspective is starting and why ("Next we document the
   Process perspective — the steps, who does them, where it breaks").
2. Dispatch it: read the specialist's `SKILL.md` and run its perspective
   phases for this process. The process is already selected and its overview
   captured — the specialist skips its own setup/overview/validation.
3. When the specialist's perspective is done, **checkpoint with the SME**:
   "Process perspective done — N elements drafted. Continue to the next
   perspective, or pause here?" The SME may stop at any point; a session need
   not cover every perspective in one sitting.

Today only `process-specialist` is built, so a session documents the Process
perspective and then moves to Step 4. As each further specialist is built it
joins the registry and this step dispatches it too — no other change needed.

## Step 4 — CROSS-PERSPECTIVE REVIEW

Once **two or more** perspectives have been documented, each specialist reviews
the *other* perspectives' elements from its own lens — a process step with no
control, a touchpoint with no step behind it, a system nothing references.
Dispatch each built specialist again for a review-only pass; collect what they
flag as clarifying questions for the SME.

With only one perspective documented, state "cross-perspective review needs at
least two perspectives — skipping" and move on.

## Step 5 — VALIDATION

Do a gap-analysis pass over everything written this session: elements missing
required links, blocks that read thin against their schema template, steps
with no owner or no rationale, orphaned elements. Surface each as a short
clarifying question — the SME can answer it now, defer it, or skip it. Apply
any answers through the owning specialist.

## Step 6 — DONE

Summarise the session: every element written, with counts per type and per
perspective, and the process slug. Tell the SME to **review and approve the
elements in the web app** — everything is `status: draft`; approval is their
decision there, not yours here.
