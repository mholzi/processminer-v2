import type { NextRequest } from "next/server";
import { sessionPool, type WorkerEvent } from "@/lib/session-worker";

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
  if (name === "Bash") {
    const cmd = String(input?.command ?? "");
    if (cmd.includes("write_element.py")) return "✏ Writing element …";
    if (cmd.includes("next_id.py")) return "Assigning element ID …";
    if (cmd.includes("check_conformance.py")) return "Checking structure …";
    if (cmd.includes("add_source.py")) return "Recording document as a source …";
    if (cmd.includes("scaffold_process.py")) return "Creating process …";
    if (cmd.includes("derive_process_meta.py"))
      return "Deriving process details …";
    return "Working …";
  }
  if (name === "Read") return `Reading ${base(input?.file_path)}`;
  if (name === "Write") return `Writing ${base(input?.file_path)}`;
  if (name === "Edit") return `Editing ${base(input?.file_path)}`;
  if (name === "Skill") return "Working …";
  if (name === "Grep" || name === "Glob") return "Searching files …";
  if (name === "Task" || name === "Agent") return "Starting sub-agent …";
  return `${name} …`;
}

export async function POST(req: NextRequest) {
  let body: { message?: unknown; sessionId?: unknown; stream?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const sessionId =
    typeof body.sessionId === "string" && body.sessionId ? body.sessionId : null;
  if (!message) {
    return Response.json({ error: "A message is required." }, { status: 400 });
  }
  // When true, the caller wants the reply streamed as it is written — we
  // forward each text delta. The worker always runs with partial messages on,
  // so this is purely a per-request choice (the profile setting).
  const wantStream = body.stream === true;

  // The warm worker for this session — reused if alive, rehydrated via
  // --resume if its process was lost, or created fresh for a new session.
  const worker = sessionPool.acquire(sessionId);

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
      const close = () => {
        if (closed) return;
        closed = true;
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
            const block = b as { type?: string; name?: string; input?: unknown };
            if (block.type === "tool_use" && block.name) {
              const input = (block.input as Record<string, unknown>) ?? {};
              let text = describeTool(block.name, input);
              // Number each element write so a long extraction visibly
              // counts up rather than repeating one static line.
              if (
                block.name === "Bash" &&
                String(input?.command ?? "").includes("write_element.py")
              ) {
                elementsWritten += 1;
                text = `✏ Writing wiki element ${elementsWritten} …`;
              }
              send({ type: "progress", text });
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
          for await (const evt of worker.runTurn(message)) {
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
