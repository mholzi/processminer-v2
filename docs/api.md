# HTTP API

Reference for every endpoint under [`src/app/api/`](../src/app/api). The app
has a small REST surface — six routes — because most "writes" go through the
Claude Code CLI session, not through HTTP. The endpoints here cover only the
non-LLM operations (file IO, lint dismissals, feedback) plus the SSE bridge to
the session worker.

All routes run on the Node runtime (`runtime = "nodejs"`) with caching
disabled (`dynamic = "force-dynamic"`). All accept and return JSON unless
stated otherwise. Errors have the shape `{ error: string }` with an HTTP 4xx
or 5xx status; success responses include `{ ok: true, ... }` where the route
returns more than data.

There is **no auth at the HTTP layer** — the app is intended to run locally,
gated by the in-app name + role login (see [`src/app/AuthGate.tsx`](../src/app/AuthGate.tsx)).
If you deploy this anywhere reachable, put auth in front of it.

## Quick index

| Path | Methods | Purpose | Implementation |
|---|---|---|---|
| `/api/session` | POST | Server-Sent Events stream of a Claude Code skill turn | [route.ts](../src/app/api/session/route.ts), pool in [session-worker.ts](../src/lib/session-worker.ts) |
| `/api/upload` | POST (multipart) | Save an uploaded source document into `raw-sources/<slug>/` | [route.ts](../src/app/api/upload/route.ts) |
| `/api/sources` | GET | List or read source documents under `raw-sources/<slug>/` | [route.ts](../src/app/api/sources/route.ts) |
| `/api/feedback` | POST, PATCH | File an app-feedback item (`feedback/FB-NNN.md`) or change its status | [route.ts](../src/app/api/feedback/route.ts), [feedback-store.ts](../src/lib/feedback-store.ts) |
| `/api/findings` | PATCH | Dismiss or restore a `run-lint` finding (sidecar `finding-dismissals.json`) | [route.ts](../src/app/api/findings/route.ts) |
| `/api/notes` | POST, PATCH | Add an SME note to an element's discussion, or toggle a note's `resolved` flag | [route.ts](../src/app/api/notes/route.ts) |

---

## POST `/api/session`

The Process Assistant chat. Each request is one user turn; the response is a
Server-Sent Events stream that proxies events from a long-lived `claude` CLI
subprocess.

### Request

`Content-Type: application/json`

```ts
{
  message: string;        // The user's turn. Required, trimmed.
  sessionId?: string;     // A returned `sessionId` from a prior turn — reuses
                          // (or rehydrates via `claude --resume`) that
                          // worker's conversation.
  stream?: boolean;       // When true, intermediate text deltas are streamed
                          // as `delta` events. Default false: only the final
                          // reply lands, in the `done` event.
}
```

### Response

`Content-Type: text/event-stream; charset=utf-8`

One JSON event per SSE message. Event shapes:

| `type` | Fields | Meaning |
|---|---|---|
| `progress` | `text: string` | Short human-readable activity line, e.g. `"✏ Writing wiki element 7 …"`. Derived from the CLI's `tool_use` blocks. |
| `task_start` | `id: string`, `label: string` | A sub-agent (`Task` / `Agent` tool) has been dispatched. `id` matches the tool_use id. |
| `task_end` | `id: string` | The sub-agent identified by `id` has returned. |
| `delta` | `text: string` | A streamed chunk of the assistant's reply text. Only emitted when the request opted in with `stream: true`. New text blocks are preceded by `"\n\n"`. |
| `done` | `reply: string`, `sessionId: string`, `isError: boolean` | The final reply for the turn. The caller should keep `sessionId` for follow-up turns. |
| `error` | `error: string`, `sessionId?: string` | The turn failed. The session may still be alive. |

The stream is closed after `done` (or `error`).

### Behaviour

- Acquires a warm worker from [`sessionPool`](../src/lib/session-worker.ts).
  If `sessionId` is unknown to the pool, the pool spawns `claude --resume
  <sessionId>` to rehydrate the conversation.
- The CLI runs with `--dangerously-skip-permissions` because there is no TTY
  to approve tool prompts. **Required** — skills both write wiki files and
  shell out to the Python helpers. Acceptable because the app is local.
- Timeout: 30 min per turn (`maxDuration = 1800`; the worker enforces its own
  matching timeout).
- The CLI writes wiki files in-place under `wiki/processes/<slug>/`. The
  caller is expected to `router.refresh()` after `done` — server components
  re-read the wiki on every request because `page.tsx` declares
  `dynamic = "force-dynamic"`.

### Errors

- 400 — body not JSON, or `message` missing/empty.

Runtime failures are surfaced inside the SSE stream as a `type: "error"`
event with HTTP 200 — the stream had already opened.

---

## POST `/api/upload`

Saves a document uploaded from the chat's "⬆ Upload document" modal into
`raw-sources/<slug>/`. Karpathy layer 1 — the immutable imported documents.

### Request

`Content-Type: multipart/form-data`

| Field | Type | Required | Notes |
|---|---|---|---|
| `file` | File | yes | The document. PDF, Word, Markdown, plain text all accepted — the ingest skill handles parsing. |
| `slug` | string | yes | The process slug. Used as the subdirectory name. |

### Response

`200`:

```ts
{ ok: true, file: string, path: string }   // file: sanitised filename
                                           // path: `raw-sources/<slug>/<file>`
```

### Behaviour

- `mkdir -p raw-sources/<slug>/` if not present.
- Filename is sanitised: stripped to a safe basename, non-`[A-Za-z0-9._-]`
  replaced with `_`, leading `.` or `_` removed. Falls back to `"document"`.
- Does **not** record the upload in the wiki's `index.md` — that's the
  `document-ingest` skill's job (its first step shells out to
  [`add_source.py`](../scripts/wiki/add_source.py)).

### Errors

- 400 — form has no `file`, or `slug` missing.
- 500 — filesystem write failed.

---

## GET `/api/sources`

Lists or reads documents under `raw-sources/<slug>/`. Backs the in-canvas
document viewer; the left-rail Source Documents widget gets the list directly
from server components, not from this route.

### Request

Query string:

| Param | Required | Notes |
|---|---|---|
| `slug` | yes | Must match `^[a-z0-9]+(?:-[a-z0-9]+)*$` (kebab-case, no traversal). |
| `file` | no | If absent, returns the listing. If present, returns that single document's text. `basename()` is applied; the resolved path is asserted to live under `raw-sources/<slug>/`. |

### Response

Without `file`:

```ts
{ files: SourceFile[] }                    // listSources(slug) — see wiki.ts
```

With `file`:

```ts
{ name: string, content: string }          // file body as UTF-8 text
```

### Errors

- 400 — `slug` missing or not kebab-case.
- 404 — document not found, or the resolved path escapes `raw-sources/<slug>/`
  (path traversal is treated as 404, not a different error code, on purpose).

### Security note

Slugs match a strict kebab-case grammar with no dots or slashes, so a slug
itself cannot traverse out of `raw-sources/`. The `file` parameter is then
`basename`-ed *and* the resolved path is asserted to start with
`raw-sources/<slug>/<sep>`. Defence in depth — both checks are intentional.

---

## POST `/api/feedback`

Files an app-feedback item (feedback on Processminer itself, not on a
documented process) into `feedback/FB-NNN.md`. The `feedback/` tree is
intentionally separate from `wiki/` — this is product feedback. See
[`feedback/README.md`](../feedback/README.md).

### Request

```ts
{
  title: string;          // Required, trimmed, ≤ 200 chars
  body: string;           // Required, trimmed, ≤ 8,000 chars
  category: "bug" | "idea" | "improvement" | "question";  // Required
  page?: string;          // App page/area the feedback is about
  author?: string;        // Falls back to "Anonymous"
  role?: string;          // The author's role
}
```

### Response

```ts
{ ok: true, item: FeedbackItem }
```

`FeedbackItem` shape is defined in [`src/lib/feedback.ts`](../src/lib/feedback.ts).

### Errors

- 400 — title or body missing, category unknown, or either field too long.
- 500 — filesystem write failed.

---

## PATCH `/api/feedback`

Changes a feedback item's status.

### Request

```ts
{
  id: string;             // Must match /^FB-\d+$/
  status: "open" | "planned" | "done" | "declined";
}
```

### Response

```ts
{ ok: true, item: FeedbackItem }
```

### Errors

- 400 — `id` malformed or `status` unknown.
- 404 — no such feedback item.

---

## PATCH `/api/findings`

Records (or restores) a dismissal of a `run-lint` finding in
`wiki/processes/<slug>/finding-dismissals.json`.

Why this is a sidecar, not a field on the finding itself: `lint.json` is
**skill-owned** — `run-lint` rewrites it from scratch each pass and finding
ids re-number every run, so a dismissal stored inside `lint.json` would not
survive a re-lint. This sidecar is keyed by a content signature (not by
finding id) so the dismissal sticks even when the id changes. See
[`src/lib/lint.ts`](../src/lib/lint.ts) for the signature definition.

### Request

```ts
{
  slug: string;           // Process slug; same grammar as /api/sources
  signature: string;      // The finding's content signature (from lint.ts)
  action?: "dismiss" | "restore";  // Default "dismiss"
  reason?: string;        // Required when action is "dismiss"
  days?: number;          // Optional snooze — re-surfaces after N days
  by?: string;            // The user; falls back to "SME"
}
```

### Response

```ts
{ ok: true }
```

### Behaviour

- `dismiss`: writes `{reason, by, at, until?}` keyed by `signature`. `until`
  is set only when `days > 0` (snooze; otherwise the dismissal is permanent
  until restored).
- `restore`: removes the signature from the sidecar.
- The sidecar is re-applied by [`wiki.ts`](../src/lib/wiki.ts) every time a
  lint report is loaded.

### Errors

- 400 — `slug` missing or malformed, `signature` missing, or `reason` missing
  on a dismiss.
- 500 — filesystem write failed.

---

## POST `/api/notes`

Appends an SME note to an element's discussion thread. The thread is
co-owned: the app writes here via the in-canvas UI; the
[`comment-review`](../.claude/skills/comment-review/SKILL.md) skill also
writes via [`scripts/wiki/notes.py`](../scripts/wiki/notes.py) when the
analyst posts its closing summary.

The thread file is `wiki/processes/<slug>/notes.json`, keyed by element id:

```jsonc
{
  "PS-FR-003": [
    { "id": "n-…", "author": "…", "text": "…", "ts": "…", "resolved": true, "resolvedBy": "…", "resolvedAt": "YYYY-MM-DD" },
    …
  ]
}
```

### Request

```ts
{
  slug: string;           // Process slug; same grammar as elsewhere
  elementId: string;      // e.g. "PS-FR-003"
  text: string;           // The note body, trimmed
  author?: string;        // Falls back to "SME"
  replyTo?: string;       // Another note id; threads the new note as a reply
}
```

### Response

```ts
{ ok: true, note: { id, author, text, ts, replyTo? } }
```

### Errors

- 400 — `slug`/`elementId`/`text` missing or malformed.
- 500 — filesystem write failed.

---

## PATCH `/api/notes`

Toggles a note's `resolved` flag (SME marking a comment as handled, or
reopening it).

### Request

```ts
{
  slug: string;
  elementId: string;
  noteId: string;
  resolved: boolean;
  by?: string;            // Falls back to "SME". Recorded as resolvedBy.
}
```

### Response

```ts
{ ok: true }
```

### Behaviour

- `resolved: true` sets `resolved/resolvedBy/resolvedAt` on the note.
- `resolved: false` removes all three.

### Errors

- 400 — required field missing or malformed.
- 404 — `notes.json` doesn't exist, or no such note id under the element.
- 500 — filesystem write failed.

---

## Recurring patterns

A few conventions hold across every route — useful to know before reading the
source.

| Convention | Where it applies | Why |
|---|---|---|
| `runtime = "nodejs"` | every route | We touch `node:fs` and spawn `claude` — Edge runtime can't do either. |
| `dynamic = "force-dynamic"` | every route + `page.tsx` | The wiki is a live filesystem source of truth; skills mutate it out-of-band. Caching any of this would lie. |
| Slug grammar `^[a-z0-9]+(?:-[a-z0-9]+)*$` | `/api/sources`, `/api/findings`, `/api/notes` | Defines what slugs can exist; closes path-traversal at the validation layer. |
| Errors as `{ error: string }` with 4xx/5xx | every route | Single error shape — the client renders the string. |
| No auth | every route | Local-only app. If you front this with a server, add auth in middleware. |
| Empty/missing body → 400 with the message "Invalid request." | every route | Consistent shape; the client doesn't need to distinguish "no body" from "non-JSON body". |
| File writes are not transactional | `/api/findings`, `/api/notes`, `/api/feedback` | The wiki is files; concurrent writers race. Acceptable because the app is single-user; not acceptable if you scale this. See [ARCHITECTURE.md §11](../ARCHITECTURE.md#11-known-tradeoffs-and-debt). |

---

## What's deliberately **not** here

These are operations the architecture chose to put elsewhere — knowing why
saves time.

| Operation | Where it lives instead | Why |
|---|---|---|
| Write a wiki element | `claude` CLI runs a skill → shells out to [`write_element.py`](../scripts/wiki/write_element.py) | The LLM emits a JSON spec; Python validates against the schema and writes the file. Going through an HTTP endpoint would lose the schema gate. |
| Approve an element | Same — [`set_approval.py`](../scripts/wiki/set_approval.py) | The approval gate enforces the provenance contract (every heading must be `elicited` or `document`); the Python script is the only place that knows the rule. |
| Lint a process | `claude` runs `/run-lint` skill | The lint is a 5-lens cross-perspective sweep — not a deterministic check; it needs the LLM. |
| Read the wiki for rendering | Server component reads via [`src/lib/wiki.ts`](../src/lib/wiki.ts) | No HTTP indirection needed — server components run on the same Node process. |
| Authenticate the user | [`src/app/AuthGate.tsx`](../src/app/AuthGate.tsx) — a local name + role gate, no HTTP | Local app. Replace with real auth if hosted. |
