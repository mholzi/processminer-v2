# Implementation Plan — Advisory Board

**Status:** draft for review · **Date:** 2026-06-06 · **Branch:** `chore/dogfood-frdb-2026-06-05`

A top-level **Advisory Board**: a panel on the Welcome dashboard, above the
individual processes, that lets the user chat with three senior advisor personas
who read across *all* the processes they can access and give **read-only**
portfolio-level advice. They never mutate any process JSON.

UX is locked (see `~/.gstack/projects/Processminer2/designs/advisory-board-embed-20260606/`):
**embedding = B** (single contained panel) · **chat = right slide-over** ·
signature = provenance-first (every claim cites the real process/element) ·
roster = **Lead Banking SME**, **Lead Architect**, **Lead Project Manager**.

---

## 1. Scope

**In:** a contained Advisory Board panel on the Welcome screen; a slide-over chat
opened per advisor; three persona prompts; a read-only cross-process tool set;
authentication + access scoping on the session route; sessionStorage transcripts.

**Out (deliberately):** any write path. Advisors have **no** write tools — not
`createElement`, not `updateElement`, not `setApproval`. This keeps the
"never hand-edit, only schema-tool-write" contract untouched and means the
feature adds **zero** new provenance/approval/conformance surface. If the user
wants a change, the advisor tells them which process to open and which specialist
to run.

**Why this is cheap:** the only genuinely new capability is *bounded read across
multiple processes*. Everything else reuses existing machinery (the warm-worker
pool, the SSE protocol, `AgentChat`, the scope-preamble pattern).

---

## 2. How it fits the existing architecture

| Concern | Reused as-is | New |
|---|---|---|
| Streaming transport | `/api/session` SSE, `sessionPool`, `SessionWorker` ([session-worker.ts](../src/lib/session-worker.ts)) | one `advisor` field on the request |
| Client SSE driver | `runSession` ([agent-chat.ts](../src/lib/agent-chat.ts:51)) | `advisorPreamble()` builder |
| Chat UI | `AgentChat` ([AgentChat.tsx](../src/components/AgentChat.tsx)) | slide-over wrapper + persona switcher |
| Persona / scope injection | scope-preamble pattern ([ProcessDocScreen.tsx:247](../src/app/ProcessDocScreen.tsx)) | `CORE_ADVISOR_PROMPT.md` + 3 `ADVISOR.md` |
| Read of process content | `listProcesses` / `getProcess` ([wiki.ts:265](../src/lib/wiki.ts), [:430](../src/lib/wiki.ts)) | 4 read-only MCP/Gemini tools |
| Access control | `canAccess` ([process-access.ts:45](../src/lib/process-access.ts)) | route auth + allow-list scoping |
| Mount | `WelcomeScreen` ([WelcomeScreen.tsx](../src/components/WelcomeScreen.tsx)) | panel section + overlay (no new workspace) |

**Key architectural fact that shapes the design:** for the `claude` provider the
worker just writes `message` to the CLI's stdin and ignores the `skill` argument
([session-worker.ts:120](../src/lib/session-worker.ts), `runTurn`). All
persona/scope context therefore travels **in the message text**, exactly like the
existing `scopePreamble`. So the advisor persona is delivered by prepending the
persona prompt to the first turn — not by a new system-prompt channel. This works
identically for the Gemini provider, which assembles its own system instruction.

---

## 3. Personas

New directory, mirroring `.claude/skills/` (pure reasoning prompts, no I/O):

```
.claude/advisors/
  CORE_ADVISOR_PROMPT.md          # shared read-only contract
  lead-banking-sme/ADVISOR.md
  lead-architect/ADVISOR.md
  lead-project-manager/ADVISOR.md
```

`CORE_ADVISOR_PROMPT.md` (the analogue of `CORE_SYSTEM_PROMPT.md`) carries the
non-negotiables:

- You are a **read-only advisor**. You have no write tools and must never claim to
  have changed anything.
- You may read any process in the **allow-list provided in the session scope** and
  compare across them. Reading anything outside the allow-list is refused.
- **Cite every claim** to a real process and element (`COB-003 › controls › CTL-004`).
  No citation → say you're inferring.
- To change a process, name the process and the specialist to run; don't offer to do it.
- Answer in the user's language.

Each `ADVISOR.md` adds the lens:

| Persona | id | Reads / advises on |
|---|---|---|
| Lead Banking SME | `lead-banking-sme` | process correctness, exceptions, controls, domain plausibility across processes |
| Lead Architect | `lead-architect` | systems, integrations, target-state architecture, reuse across processes |
| Lead Project Manager | `lead-project-manager` | scope, sequencing, handoff-readiness, delivery risk across the portfolio |

A small registry in `src/lib/advisor.ts` (new) is the single source of truth for
the roster — `{ id, name, monogram, blurb, promptPath }[]` — consumed by both the
UI (panel + switcher) and the preamble builder.

---

## 4. Read-only cross-process tools

Four tools, added to **both** providers (the schema drift-guard expects parity —
CLAUDE.md §schema):

- `claude-mcp-server.ts` — add to `ListToolsRequestSchema` + `CallToolRequestSchema`
  ([claude-mcp-server.ts:72](../src/lib/claude-mcp-server.ts)).
- `gemini-worker.ts` — add to `toolDeclarations` + the dispatch
  ([gemini-worker.ts:67](../src/lib/gemini-worker.ts)).

| Tool | Input | Returns | Wraps |
|---|---|---|---|
| `listAccessibleProcesses` | — | `{slug,title}[]` (allow-list only) | `listProcesses()` ∩ allow-list |
| `getProcessSummary` | `slug` | overview + section status + element counts | `getProcess(slug)` |
| `getProcessElements` | `slug, collection` | the elements of one section | `getProcess(slug)` |
| `searchProcesses` | `query` | keyword hits across allow-listed processes | `getProcess` sweep |

All four **hard-filter by the allow-list** (see §5) and are **read-only** —
they call no writer in `wiki-write.ts`. New thin helpers
`getProcessSummary()` / `searchProcesses()` go in `wiki.ts` beside the existing
readers.

---

## 5. Access control (the part that needs a decision)

**Current state:** `/api/session` does **not** authenticate
([route.ts:51](../src/app/api/session/route.ts) — no `verifySession`), and the
MCP read tools accept any `slug` the model supplies. Per-process isolation today
is really enforced by the *UI* (page.tsx only sends the user their accessible
docs) plus the prompt scope; reads aren't gated at the tool layer. A cross-process
advisor makes that gap material — a prompt-injected or confused model could read a
process the user can't see.

**Plan:**
1. **Authenticate the route.** Read the session cookie in `/api/session`,
   `verifySession` it, 401 if absent. (Closes the existing gap for *all* sessions,
   not just advisors.)
2. **Compute the allow-list server-side:** `listProcesses().filter(p => canAccess(user, p.slug))`.
3. **Enforce it at the tool layer, not just the prompt.** Pass the allow-list to
   the worker; the read tools refuse any slug outside it.

**DECISION (2026-06-06): Option B — prompt-level allow-list, for the moment.**

Embed the allowed slugs in the advisor preamble; the read tools stay
slug-trusting. This matches today's read model exactly (per-process scoping is
already prompt-level) and is the smallest change. It is **advisory, not
enforced** — we are explicitly accepting the current trust model for now.

> **Deferred hardening (noted follow-up, not in this build):** authenticate
> `/api/session` (`verifySession` the cookie, 401 if absent) and move enforcement
> to the tool layer via **Option A** — pass `allowedSlugs` to the `SessionWorker`
> constructor, set it as an env var on the spawned `claude`, and have the MCP
> server inherit + filter. `SessionWorker` is one process per session = one user,
> so the env is stable for the worker's life and survives `--resume`. Revisit
> before this ships to any multi-tenant / untrusted-user deployment.

Rejected for now: **Option A** as described above — correct enforcement, but more
change than warranted while the app is local/single-trust.

---

## 6. Backend wiring

1. **Request:** add optional `advisor?: string` to the `/api/session` body and to
   `SessionRequest` ([agent-chat.ts:35](../src/lib/agent-chat.ts)). When present
   and no `sessionId`, it's an advisor session.
2. **Preamble:** client prepends `advisorPreamble(persona, user, allowedSlugs)` to
   the first message (mirrors `scopePreamble`). The preamble = `CORE_ADVISOR_PROMPT.md`
   + the chosen `ADVISOR.md` + the allow-list + the user's name. Later turns inherit
   via `--resume`, same as today.
3. **Tools:** the worker offers the four read tools (plus the universal read
   `expandElement`); advisor sessions get **no** write tools. Simplest gate: the
   persona prompt instructs read-only, and (Option A) the env/allow-list makes the
   write tools no-op or absent for advisor workers. Eng-review item: cleanest way
   to withhold write tools per-session given the shared MCP server.

No change needed to the SSE event protocol or `AgentChat` rendering — advisor
replies are just markdown with element-id citations, which `AgentChat` already
linkifies into hovercards.

---

## 7. Frontend

All inside `WelcomeScreen` — **no new `AuthGate` workspace** (the slide-over
overlays the dashboard, so we stay on the splash route).

1. **Panel (B):** a new `<section className="ws-sec ws-advisory">` near the top of
   the welcome column ([WelcomeScreen.tsx](../src/components/WelcomeScreen.tsx) — above
   the attention queue). Left: title + "resume last conversation"; right: the three
   advisors from the `advisor.ts` registry, each an **Ask** button.
2. **Slide-over:** a new `AdvisorChat` component — a right-anchored overlay holding
   `AgentChat` plus a persona-switcher strip. State (`activeAdvisor`, open/closed)
   lives in `WelcomeScreen`. Switching advisor starts a fresh session (new preamble).
3. **Chat hook:** reuse `useAgentChat` / `runSession`. Transcripts persist in
   sessionStorage under a new prefix `ab` (codec already parameterised by prefix —
   [agent-chat.ts:240](../src/lib/agent-chat.ts)), keyed by advisor id instead of slug.
4. **Styles:** add `.ws-advisory` panel + `.advisor-over` slide-over tokens to
   `globals.css`, reusing existing `--accent`, `--accent-soft`, `--r-md`, spacing
   scale. No new design primitives (DESIGN.md unchanged).

---

## 8. Persistence

v1: **sessionStorage only** (same as the per-process chat) — advisor chats are
advisory and ephemeral. If durable threads are wanted later, they go in the
**runtime layer**, never the wiki: `data/advisors/<persona>/<thread>.json`,
sibling to `data/runtime/` — honoring the Karpathy guardrail (durable process
knowledge in `wiki/`, everything else above it).

---

## 9. Build sequence

1. `advisor.ts` registry + `CORE_ADVISOR_PROMPT.md` + the three `ADVISOR.md` (prompt authoring; no code risk).
2. `wiki.ts` read helpers (`getProcessSummary`, `searchProcesses`).
3. Four read tools in `claude-mcp-server.ts` **and** `gemini-worker.ts` (keep parity; `npm test` drift-guard must pass).
4. ~~Route auth + tool-layer enforcement~~ — **deferred** (Option B chosen, §5). The allow-list ships inside the preamble in step 5; no route/worker changes.
5. `advisorPreamble()` (incl. the allowed-slug list) + `advisor` field through `runSession` and the route.
6. `AdvisorChat` slide-over + Welcome panel + `globals.css`.
7. Verify (below).

Steps 1–4 are the substance; 5–6 are wiring into seams that already exist.

---

## 10. Verification

- `npm run typecheck` — clean.
- `npm test` — lint engine + **schema drift-guard** (the new tools must exist in both providers).
- `node scripts/verify_llm_schema.mjs` — schema sanity.
- Manual (preview): open Welcome → panel renders three advisors → click an advisor
  → slide-over opens → ask a cross-process question → reply cites real elements →
  switch advisor → ask to *change* something → advisor declines and points to the
  specialist. Confirm a process the user can't access is never read (governed-process test).

---

## 11. Open decisions for eng review

1. ~~Access-list enforcement: A vs B.~~ **Resolved: Option B (prompt-level), 2026-06-06.** Hardening (route auth + Option A) deferred — see §5.
2. **Withholding write tools per advisor session** given the shared MCP server — gate in-tool, or a separate read-only MCP profile?
3. **Roster source of truth** — `advisor.ts` registry vs deriving from `.claude/advisors/` directory listing.
4. **Should advisors ever launch a scoped specialist session** ("go fix this in COB-003") as a later phase, or stay strictly advisory? (UX picked advisory; this is a v2 question.)
