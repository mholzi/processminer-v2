import { spawn } from "node:child_process";
import type { NextRequest } from "next/server";

// The Process Assistant chat is backed by the local `claude` CLI in headless
// mode. Each chat turn spawns `claude -p`, which runs in the repo so it
// discovers the skills in `.claude/skills/` and reads/writes the wiki files.
// Auth is the machine's existing Claude Code login — no API key.
//
// The CLI runs with `--output-format stream-json`: it emits one JSON event
// per line as work happens (tool calls, the final result). We forward those
// to the browser as Server-Sent Events so the chat can show a live activity
// line during a long skill run — document-ingest can take many minutes.
//
// One turn per request; multi-turn continuity is the `--resume <sessionId>`
// the client carries back. `--dangerously-skip-permissions` is required: a
// headless run has no terminal to approve prompts, and the skills both write
// wiki files and run the Python helper scripts (Bash) — so all permission
// checks must be skipped. This is acceptable here: a local, internal tool
// the user runs on their own machine.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// A skill turn can be long — document-ingest extracts dozens of elements,
// each via the next_id → write_element → check_conformance scripts. Allow
// generous headroom; override with SESSION_TURN_TIMEOUT_MS if needed.
export const maxDuration = 1800;

const TURN_TIMEOUT_MS = Number(process.env.SESSION_TURN_TIMEOUT_MS) || 1_800_000;

// Skill turns run on Sonnet — fast and cost-effective for these long,
// tool-heavy elicitation runs. Override with SESSION_MODEL if a turn
// needs a stronger model.
const TURN_MODEL = process.env.SESSION_MODEL || "claude-sonnet-4-6";

// Turn a CLI tool call into a short, human-readable activity line.
function describeTool(name: string, input: Record<string, unknown>): string {
  const base = (p: unknown) => String(p ?? "").split("/").pop() || "";
  if (name === "Bash") {
    const cmd = String(input?.command ?? "");
    if (cmd.includes("write_element.py")) return "✏ Writing wiki element …";
    if (cmd.includes("next_id.py")) return "Assigning element ID …";
    if (cmd.includes("check_conformance.py")) return "Checking conformance …";
    if (cmd.includes("add_source.py")) return "Recording document as a source …";
    if (cmd.includes("scaffold_process.py")) return "Creating process …";
    if (cmd.includes("derive_process_meta.py"))
      return "Deriving process metadata …";
    return `Running command: ${cmd.slice(0, 48)}…`;
  }
  if (name === "Read") return `Reading ${base(input?.file_path)}`;
  if (name === "Write") return `Writing ${base(input?.file_path)}`;
  if (name === "Edit") return `Editing ${base(input?.file_path)}`;
  if (name === "Skill") return `Starting skill “${String(input?.skill ?? "")}”`;
  if (name === "Grep" || name === "Glob") return "Searching files …";
  if (name === "Task" || name === "Agent") return "Starting sub-agent …";
  return `${name} …`;
}

export async function POST(req: NextRequest) {
  let body: { message?: unknown; sessionId?: unknown };
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

  const args = [
    "-p",
    message,
    "--model",
    TURN_MODEL,
    "--output-format",
    "stream-json",
    "--verbose",
    "--dangerously-skip-permissions",
  ];
  if (sessionId) args.push("--resume", sessionId);

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      const child = spawn("claude", args, { cwd: process.cwd() });

      let stdoutBuf = "";
      let stderr = "";
      let liveSession = sessionId;
      let resultSent = false;
      let closed = false;

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
        clearTimeout(timer);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      const timer = setTimeout(() => {
        child.kill("SIGKILL");
        const tail = (stderr || stdoutBuf).trim().slice(-600);
        const mins = Math.round(TURN_TIMEOUT_MS / 60_000);
        send({
          type: "error",
          error:
            `The assistant was stopped after ${mins} min.` +
            (tail ? `\n\nLast output:\n${tail}` : ""),
          sessionId: liveSession,
        });
        close();
      }, TURN_TIMEOUT_MS);

      const handleEvent = (evt: Record<string, unknown>) => {
        if (typeof evt.session_id === "string") liveSession = evt.session_id;

        if (evt.type === "assistant") {
          const msg = evt.message as { content?: unknown[] } | undefined;
          for (const b of msg?.content ?? []) {
            const block = b as { type?: string; name?: string; input?: unknown };
            if (block.type === "tool_use" && block.name) {
              send({
                type: "progress",
                text: describeTool(
                  block.name,
                  (block.input as Record<string, unknown>) ?? {},
                ),
              });
            }
          }
        } else if (evt.type === "result") {
          resultSent = true;
          send({
            type: "done",
            reply: typeof evt.result === "string" ? evt.result : "",
            sessionId: liveSession,
            isError: Boolean(evt.is_error),
          });
          close();
        }
      };

      child.stdout.on("data", (d: Buffer) => {
        stdoutBuf += d.toString();
        let nl: number;
        while ((nl = stdoutBuf.indexOf("\n")) !== -1) {
          const line = stdoutBuf.slice(0, nl).trim();
          stdoutBuf = stdoutBuf.slice(nl + 1);
          if (!line) continue;
          try {
            handleEvent(JSON.parse(line) as Record<string, unknown>);
          } catch {
            /* not a JSON event line — ignore */
          }
        }
      });

      child.stderr.on("data", (d: Buffer) => (stderr += d.toString()));

      child.on("error", (e: NodeJS.ErrnoException) => {
        const hint =
          e.code === "ENOENT"
            ? "The `claude` CLI is not on the server's PATH."
            : e.message;
        send({ type: "error", error: `claude failed to start: ${hint}` });
        close();
      });

      child.on("close", (code) => {
        if (!resultSent) {
          send({
            type: "error",
            error: stderr.trim() || `claude exited with code ${code}.`,
            sessionId: liveSession,
          });
        }
        close();
      });
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
