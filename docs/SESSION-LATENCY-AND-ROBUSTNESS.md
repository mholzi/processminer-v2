# Session Latency & Robustness — per-turn cost scales with document size

**Status (2026-06-06):** open `[infra]` finding. Recorded from the
2026-06-05-1841 dogfood run (item 3 of that run's `walkthrough-tweaks.md`).
Not fixable in the dogfood walkthrough — this is a property of the live session
path. No code change has been made for it yet; the read-once-per-turn cache
below is the recommended first slice.

This document captures **why** an AI session gets slower as the process JSON
grows, and **why** a long autonomous turn could crash or wedge the dev server,
so the fix can be made deliberately with before/after timing rather than blind.

---

## Symptom (observed)

During the dogfood run, as the process document grew toward ~140 elements:

- Stage-5 turns ballooned from ~3–4 min to **~15–25 min** each.
- The dev server **crashed mid `source-cx`**.
- A worker **idle-timeout left a wedge** (a "lost contact" stall).

A full run became a day-long affair instead of an hours-long one.

---

## Issue A — latency grows with the document

Two layers compound as the document grows.

### A1. The MCP server re-reads and re-writes the *whole* document per tool call

Every tool handler invocation parses the entire process file:

- Full read: `JSON.parse(fs.readFileSync(...))` at
  [`src/lib/claude-mcp-server.ts:470`](../src/lib/claude-mcp-server.ts) — runs
  once **per tool call**, not once per turn.
- Full write: every mutating tool does a whole-document
  `atomicWriteFileSync(processFilePath, JSON.stringify(doc, …))` — e.g.
  [`createElement`](../src/lib/claude-mcp-server.ts) at `:508`,
  [`createElements`](../src/lib/claude-mcp-server.ts) at `:526`, and ~10 other
  call sites.

So per-call cost is **O(document size)**, and a turn that makes many tool calls
pays it repeatedly. The Gemini worker has the same shape
([`src/lib/gemini-worker.ts`](../src/lib/gemini-worker.ts), `createElementsBatch`
at `:914`). As the run progresses the document only grows, so the same turn
gets monotonically more expensive.

### A2. The worker pulls large context each turn

The LLM agent tends to read the whole process file (and, in an
un-sandboxed run, app source — see the sandbox finding) into its context each
turn. A targeted getter exists — `expandElement` can return either an
id/title list or a single element
([`src/lib/claude-mcp-server.ts:483-493`](../src/lib/claude-mcp-server.ts)) —
but there is **no section-scoped or summary getter**, so the path of least
resistance is to slurp the full document.

---

## Issue B — long autonomous turns crash/wedge the dev server

- The session worker spawns one long-lived `claude` CLI and streams events.
  `TURN_TIMEOUT_MS` defaults to **30 min** and `IDLE_TTL_MS` to **30 min**
  ([`src/lib/session-worker.ts:23-24`](../src/lib/session-worker.ts)).
- A turn that legitimately runs 15–25 min sits right against that boundary.
  `source-cx` crashed the dev server mid-turn; a worker idle-timeout left a
  wedge.

**Already mitigated (partly):** commit `ca5ae9f` (2026-06-05) added an **SSE
heartbeat** that fixes the false "lost contact" on silent long turns
(dogfood #1) and made process-JSON writes **atomic** (dogfood #7). That landed
just before the run finalized, so some of the wedge symptom is already
addressed. The crash-mid-`source-cx` path and the timeout tuning remain open.

---

## Proposed solution

Ordered by leverage and safety.

1. **Read-once-per-turn cache (recommended first slice).** Keep the in-memory
   `doc` warm across tool calls within a single turn instead of re-parsing the
   file on each call; flush on write. Contained to the MCP server request
   handler.
2. **Section-scoped MCP getter.** Add a getter that returns only the slice the
   agent needs, so the worker stops pulling the whole document into context.
3. **Worker robustness.** Make the turn/idle timeouts explicit and tunable for
   long autonomous turns; ensure a crashed/timed-out worker is reaped and
   rehydratable (the rehydrate path already exists at
   [`src/lib/session-worker.ts:216`](../src/lib/session-worker.ts)); confirm the
   heartbeat covers the `source-cx` path.
4. **Batched writes (optional, with care).** Serializing the whole doc per
   mutation is the remaining write cost. Writing once at turn end would cut it
   but trades off crash-durability — see the architecture note.

---

## Impact on architecture

- **Cache coherence.** Today, every call re-reading the file means external
  writes (the app's own server actions in
  [`src/lib/wiki-write.ts`](../src/lib/wiki-write.ts)) are always seen. A
  per-turn in-memory `doc` cache risks clobbering a concurrent in-app edit on
  flush. Mitigation: scope the cache to a single turn and re-read if the file
  mtime changed.
- **Durability vs. throughput.** Batched writes weaken the guarantee that
  `ca5ae9f` (#7) just strengthened — atomic per-mutation writes mean a crash
  loses at most one element. Don't undo that intent without a deliberate
  trade-off.
- **Interaction with the sandbox finding.** This problem partially dissolves
  once the worker is sandboxed to MCP-only: it can no longer read app source,
  which shrinks per-turn context. Sequence the sandbox work first, then measure
  again before deciding how far to push the read/write optimizations.
- **Scope.** This is genuinely `[infra]` — a performance/robustness change to
  the live session path, not a self-contained bug. It deserves its own measured
  change with before/after timing, not a blind edit.
