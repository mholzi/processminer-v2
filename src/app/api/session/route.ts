import { spawn } from "node:child_process";
import type { NextRequest } from "next/server";

// The Process Assistant chat is backed by the local `claude` CLI in headless
// mode. Each chat turn spawns `claude -p`, which runs in the repo so it
// discovers the skills in `.claude/skills/` and reads/writes the wiki files.
// Auth is the machine's existing Claude Code login — no API key.
//
// One turn per request; multi-turn continuity is the `--resume <sessionId>`
// the client carries back. `--permission-mode acceptEdits` lets a skill write
// wiki files without an interactive prompt (there is no terminal to prompt).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TURN_TIMEOUT_MS = 180_000;

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
    "--output-format",
    "json",
    "--permission-mode",
    "acceptEdits",
  ];
  if (sessionId) args.push("--resume", sessionId);

  return new Promise<Response>((resolve) => {
    const child = spawn("claude", args, { cwd: process.cwd() });
    let stdout = "";
    let stderr = "";
    let settled = false;

    const finish = (res: Response) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(res);
    };

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      finish(
        Response.json(
          { error: "The assistant took too long and was stopped." },
          { status: 504 },
        ),
      );
    }, TURN_TIMEOUT_MS);

    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));

    child.on("error", (e) => {
      const hint =
        "code" in e && (e as NodeJS.ErrnoException).code === "ENOENT"
          ? "The `claude` CLI is not on the server's PATH."
          : e.message;
      finish(
        Response.json({ error: `Could not start claude: ${hint}` }, { status: 500 }),
      );
    });

    child.on("close", (code) => {
      if (code !== 0) {
        finish(
          Response.json(
            { error: stderr.trim() || `claude exited with code ${code}.` },
            { status: 500 },
          ),
        );
        return;
      }
      try {
        const parsed = JSON.parse(stdout) as {
          result?: string;
          session_id?: string;
          is_error?: boolean;
        };
        finish(
          Response.json({
            reply: parsed.result ?? "",
            sessionId: parsed.session_id ?? sessionId,
            isError: Boolean(parsed.is_error),
          }),
        );
      } catch {
        finish(
          Response.json(
            { error: "Could not parse the assistant's output." },
            { status: 500 },
          ),
        );
      }
    });
  });
}
