import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { NextRequest } from "next/server";
import { sessionPool, type WorkerEvent } from "@/lib/session-worker";
import { buildAdvisorPreamble } from "@/lib/advisor-server";
import { COOKIE_NAME, verifySession } from "@/lib/auth-server";
import { canAccess } from "@/lib/process-access";

// The session → process-slug map the worker writes after each turn
// (claude-mcp-server.ts / gemini-worker.ts). Used to cross-check resume turns:
// a body slug can be spoofed, but a sessionId is bound to the slug it first ran
// against, so re-confirm access against the recorded slug too.
const SESSIONS_MAP_PATH = join(process.cwd(), "wiki", "processes", ".sessions.json");
function recordedSlug(sessionId: string): string | null {
  try {
    if (!existsSync(SESSIONS_MAP_PATH)) return null;
    const data = JSON.parse(readFileSync(SESSIONS_MAP_PATH, "utf8")) as Record<
      string,
      string | { slug?: string } | undefined
    >;
    const entry = data[sessionId];
    if (typeof entry === "string") return entry || null;
    if (entry && typeof entry === "object") return entry.slug || null;
    return null;
  } catch {
    return null;
  }
}

// The Process Assistant chat is backed by the local `claude` CLI. Each chat
// turn used to spawn a fresh `claude` process — paying a full cold start
// (Node boot, ~20 SKILL.md discovery, MCP init, auth) before any model work.
//
// Turns now run on a pool of warm `claude` processes (see
// src/lib/session-worker.ts): the cold start is paid once per session, then
// each turn is written to a live worker's stdin. Auth is still the machine's
// Claude Code login — no API key.
//
// The worker emits one JSON event per line; we translate those to Server-Sent
// Events for the browser: `progress` lines drive the live activity line,
// `delta` carries reply text as it streams (when the caller opted in via the
// profile setting), `done` carries the final reply, `error` carries a failure.
//
// `--dangerously-skip-permissions` (set on the worker) is required: a headless
// run has no terminal to approve prompts, and the skills both write wiki files
// and run the Python helper scripts. Acceptable here: a local, internal tool
// the user runs on their own machine.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// A skill turn can be long — document-ingest extracts dozens of elements.
// Allow generous headroom; the worker enforces its own per-turn timeout.
export const maxDuration = 1800;

// Turn a CLI tool call into a short, human-readable activity line.
function describeTool(name: string, input: Record<string, unknown>): string {
  const base = (p: unknown) => String(p ?? "").split("/").pop() || "";
  if (name === "expandElement") {
    return input.id ? `🔍 Expanding element ${input.id} …` : `🔍 Scanning collection ${input.type} …`;
  }
  if (name === "createElement") {
    return `✏ Creating new element in ${input.type} …`;
  }
  if (name === "updateElement") {
    return `✏ Updating element ${input.id} …`;
  }
  // Advisory Board read-only cross-process tools.
  if (name === "listAccessibleProcesses") return "Listing your processes …";
  if (name === "getProcessSummary") return input.slug ? `Reading ${base(input.slug)} overview …` : "Reading a process overview …";
  if (name === "getProcessElements") return input.slug ? `Reading ${base(input.slug)} › ${String(input.collection ?? "section")} …` : "Reading a section …";
  if (name === "searchProcesses") return input.query ? `Searching for “${String(input.query)}” across processes …` : "Searching across processes …";
  if (name === "Bash") return "Working …";
  if (name === "Read") return `Reading ${base(input?.file_path)}`;
  if (name === "Write") return `Writing ${base(input?.file_path)}`;
  if (name === "Edit") return `Editing ${base(input?.file_path)}`;
  if (name === "Skill") return "Working …";
  if (name === "Grep" || name === "Glob") return "Searching files …";
  if (name === "Task" || name === "Agent") return "Starting sub-agent …";
  return `${name} …`;
}

export async function POST(req: NextRequest) {
  // Authentication gate. This endpoint drives a `claude` worker running with
  // --dangerously-skip-permissions that writes wiki files and runs scripts —
  // the single most powerful surface in the app. It must never be reachable
  // without a valid session.
  const sessionUser = verifySession(req.cookies.get(COOKIE_NAME)?.value);
  if (!sessionUser) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: {
    message?: unknown;
    sessionId?: unknown;
    slug?: unknown;
    stream?: unknown;
    skill?: unknown;
    advisor?: unknown;
    advisorSlugs?: unknown;
    userName?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const sessionId =
    typeof body.sessionId === "string" && body.sessionId ? body.sessionId : null;
  const skill = typeof body.skill === "string" && body.skill ? body.skill.trim() : null;
  const slug = typeof body.slug === "string" && body.slug ? body.slug.trim() : null;
  if (!message) {
    return Response.json({ error: "A message is required." }, { status: 400 });
  }

  // Advisory Board: on the FIRST turn of an advisor session (no resume id yet)
  // the server prepends the persona + read-only contract + allow-list, exactly
  // like the per-process scope preamble but cross-process. Later turns inherit
  // it via --resume. Access scoping is prompt-level for now (plan §5, B).
  const advisor =
    typeof body.advisor === "string" && body.advisor ? body.advisor.trim() : null;

  // Per-process access gate (R16). Ordinary process/architect turns carry the
  // open process `slug`; the user must pass canAccess for it — exactly the
  // check page.tsx and resolveWriter (wiki-write.ts) enforce on the read and
  // write paths. Advisor turns are deliberately cross-process (read-only
  // fan-out) and exempt: they scope access at the prompt level via
  // buildAdvisorPreamble, so they never carry a single per-process slug.
  if (!advisor && slug) {
    if (!canAccess(sessionUser, slug)) {
      return Response.json(
        { error: "You don't have access to this process." },
        { status: 403 },
      );
    }
    // Resume turns: a body slug can be spoofed to one the caller can access
    // while resuming a session bound to a process they cannot. Re-confirm
    // against the slug the worker recorded for this session, if any.
    if (sessionId) {
      const bound = recordedSlug(sessionId);
      if (bound && !canAccess(sessionUser, bound)) {
        return Response.json(
          { error: "You don't have access to this process." },
          { status: 403 },
        );
      }
    }
  }

  let wireMessage = message;
  if (advisor && !sessionId) {
    const advisorSlugs = Array.isArray(body.advisorSlugs)
      ? body.advisorSlugs.filter((s): s is string => typeof s === "string")
      : [];
    const userName =
      typeof body.userName === "string" && body.userName ? body.userName : undefined;
    const preamble = buildAdvisorPreamble(advisor, advisorSlugs, userName);
    if (preamble) wireMessage = preamble + message;
  }
  // When true, the caller wants the reply streamed as it is written — we
  // forward each text delta. The worker always runs with partial messages on,
  // so this is purely a per-request choice (the profile setting).
  const wantStream = body.stream === true;

  // The warm worker for this session — reused if alive, rehydrated via
  // --resume if its process was lost, or created fresh for a new session.
  // The user identity rides along so the tool layer enforces canAccess (R16):
  // a session can only reach processes its user can see, not every process on
  // disk (the cross-process read tools would otherwise leak governed ones).
  const worker = sessionPool.acquire(sessionId, {
    username: sessionUser.username,
    isAdmin: sessionUser.isAdmin === true,
  });

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      let closed = false;
      let resultSent = false;
      // Running count of wiki elements written this turn — surfaced in the
      // activity line so a long extraction shows visible progress.
      let elementsWritten = 0;
      // Whether any reply text has streamed yet — used to insert a paragraph
      // break between consecutive assistant text blocks.
      let streamedText = false;

      const send = (obj: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));
        } catch {
          /* controller already closed */
        }
      };
      // Keepalive heartbeat. A skill turn can fall silent for many minutes —
      // a long sub-agent fan-out (source-cx) or pure model reasoning emits no
      // tool events, so the SSE stream produces nothing. The client arms a
      // 5-min stuck-turn watchdog that bumps on every event; without a signal
      // it wrongly declares "lost contact" on a perfectly healthy turn, and a
      // restart then risks killing the still-running worker. A lightweight
      // `ping` every 20s keeps the watchdog armed and the connection warm.
      const heartbeat = setInterval(() => {
        if (closed || resultSent) return;
        send({ type: "ping" });
      }, 20_000);

      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      const handleEvent = (evt: WorkerEvent) => {
        if (evt.type === "assistant") {
          const msg = evt.message as { content?: unknown[] } | undefined;
          for (const b of msg?.content ?? []) {
            const block = b as {
              type?: string;
              name?: string;
              input?: unknown;
              id?: string;
            };
            if (block.type === "tool_use" && block.name) {
              const input = (block.input as Record<string, unknown>) ?? {};
              let text = describeTool(block.name, input);
              // Number each element write so a long extraction visibly
              // counts up rather than repeating one static line. Element
              // writes go through the createElement MCP tool now.
              if (block.name === "createElement") {
                elementsWritten += 1;
                text = `✏ Writing wiki element ${elementsWritten} …`;
              }
              send({ type: "progress", text });
              // Task / Agent dispatches are the long-tail in skills that
              // fan out (document-ingest, source-cx, source-innovation).
              // Emit a structured event so the client can track each
              // sub-agent independently and show a fan-out strip.
              if ((block.name === "Task" || block.name === "Agent") && block.id) {
                const desc = String(input?.description ?? "").trim();
                const sub = String(input?.subagent_type ?? "").trim();
                const promptHead = String(input?.prompt ?? "")
                  .split("\n")[0]
                  .slice(0, 60)
                  .trim();
                send({
                  type: "task_start",
                  id: block.id,
                  label: desc || promptHead || sub || "sub-agent",
                });
              }
            }
          }
        } else if (evt.type === "user") {
          // The CLI re-emits a user message carrying tool_result blocks once
          // each tool returns — match them back to the Task tool_use ids so
          // the client can mark the right sub-agent chip done.
          const msg = evt.message as { content?: unknown[] } | undefined;
          for (const b of msg?.content ?? []) {
            const block = b as { type?: string; tool_use_id?: string };
            if (block.type === "tool_result" && block.tool_use_id) {
              send({ type: "task_end", id: block.tool_use_id });
            }
          }
        } else if (evt.type === "result") {
          resultSent = true;
          send({
            type: "done",
            reply: typeof evt.result === "string" ? evt.result : "",
            sessionId: worker.sessionId,
            isError: Boolean(evt.is_error),
          });
        } else if (evt.type === "error") {
          resultSent = true;
          send({
            type: "error",
            error: typeof evt.error === "string" ? evt.error : "Unknown worker error",
            sessionId: worker.sessionId,
          });
        } else if (evt.type === "stream_event" && wantStream) {
          // Partial-message chunks — forward each text delta so the reply
          // appears live; a new text block gets a paragraph break from the
          // previous one.
          const inner = evt.event as
            | {
                type?: string;
                content_block?: { type?: string };
                delta?: { type?: string; text?: string };
              }
            | undefined;
          if (
            inner?.type === "content_block_start" &&
            inner.content_block?.type === "text" &&
            streamedText
          ) {
            send({ type: "delta", text: "\n\n" });
          } else if (
            inner?.type === "content_block_delta" &&
            inner.delta?.type === "text_delta" &&
            typeof inner.delta.text === "string"
          ) {
            streamedText = true;
            send({ type: "delta", text: inner.delta.text });
          }
        }
      };

      (async () => {
        try {
          for await (const evt of worker.runTurn(wireMessage, skill)) {
            handleEvent(evt);
          }
          if (!resultSent) {
            send({
              type: "error",
              error: "The assistant ended without a reply.",
              sessionId: worker.sessionId,
            });
          }
        } catch (e) {
          send({
            type: "error",
            error: e instanceof Error ? e.message : "The assistant failed.",
            sessionId: worker.sessionId,
          });
        } finally {
          close();
        }
      })();
    },
    cancel() {
      worker.dispose();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
