// Server-only. Warm-worker pool for the Process Assistant.
//
// Each chat turn used to `spawn("claude")` fresh — paying a full cold start
// (Node boot, ~20 SKILL.md discovery, MCP init, auth) before any model work.
// A SessionWorker instead keeps one `claude` process alive in streaming-input
// mode: that cost is paid once, then each turn is written to its stdin.

import { spawn, type ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";

export type WorkerEvent = Record<string, unknown> & { type?: string };

const MODEL = process.env.SESSION_MODEL || "claude-sonnet-4-6";
const TURN_TIMEOUT_MS = Number(process.env.SESSION_TURN_TIMEOUT_MS) || 1_800_000;
const IDLE_TTL_MS = Number(process.env.SESSION_IDLE_TTL_MS) || 30 * 60_000;
const MAX_WORKERS = Number(process.env.SESSION_MAX_WORKERS) || 6;

// Internal sentinel: a failure pushed onto the turn queue so it surfaces in
// arrival order with the events, rather than via a separate flag.
const FAIL = "__worker_fail__";

/**
 * One long-lived `claude` CLI process, driven in streaming-input mode. Holds
 * one conversation; runs one turn at a time.
 */
export class SessionWorker {
  /** Stable handle — known before `claude` assigns a session id. */
  readonly id = randomUUID();
  /** `claude`'s session id, captured from the event stream; stable for life. */
  sessionId: string | null = null;
  /** True while a turn is in flight — the worker handles one turn at a time. */
  busy = false;
  /** Wall-clock of the last turn boundary — drives idle eviction. */
  lastUsed = Date.now();
  /** False once the child has exited; the pool discards dead workers. */
  alive = true;

  private readonly child: ChildProcess;
  private stdoutBuf = "";
  private stderrTail = "";
  private sink: ((e: WorkerEvent) => void) | null = null;

  /** `resumeId` rehydrates a known session whose warm worker was lost. */
  constructor(resumeId?: string | null) {
    const args = [
      "-p",
      "--input-format", "stream-json",
      "--output-format", "stream-json",
      // Always on: streaming the reply is a per-request, per-user choice the
      // route makes — keeping it on here means one worker config serves both.
      "--include-partial-messages",
      "--verbose",
      "--model", MODEL,
      "--dangerously-skip-permissions",
    ];
    if (resumeId) {
      args.push("--resume", resumeId);
      this.sessionId = resumeId;
    }
    this.child = spawn("claude", args, { cwd: process.cwd() });
    this.child.stdout?.on("data", (d: Buffer) => this.onStdout(d));
    this.child.stderr?.on("data", (d: Buffer) => {
      this.stderrTail = (this.stderrTail + d.toString()).slice(-600);
    });
    this.child.on("error", (e: NodeJS.ErrnoException) =>
      this.onExit(
        e.code === "ENOENT"
          ? "The `claude` CLI is not on the server's PATH."
          : e.message,
      ),
    );
    this.child.on("close", () => this.onExit(null));
  }

  private onStdout(d: Buffer): void {
    this.stdoutBuf += d.toString();
    let nl: number;
    while ((nl = this.stdoutBuf.indexOf("\n")) !== -1) {
      const line = this.stdoutBuf.slice(0, nl).trim();
      this.stdoutBuf = this.stdoutBuf.slice(nl + 1);
      if (!line) continue;
      let evt: WorkerEvent;
      try {
        evt = JSON.parse(line) as WorkerEvent;
      } catch {
        continue; // not a JSON event line
      }
      if (typeof evt.session_id === "string" && !this.sessionId) {
        this.sessionId = evt.session_id;
      }
      this.sink?.(evt);
    }
  }

  private onExit(reason: string | null): void {
    this.alive = false;
    this.sink?.({
      type: FAIL,
      error:
        "The assistant process exited unexpectedly." +
        (reason ? ` ${reason}` : "") +
        (this.stderrTail ? `\n\n${this.stderrTail.trim()}` : ""),
    });
  }

  /**
   * Run one turn: write the user message, yield raw `claude` events until the
   * turn's `result`. Throws if the worker is dead, already busy, the turn
   * times out, or the process exits mid-turn.
   */
  async *runTurn(message: string): AsyncGenerator<WorkerEvent> {
    if (!this.alive) {
      throw new Error("This assistant session is no longer running.");
    }
    if (this.busy) {
      throw new Error("This assistant session is already handling a turn.");
    }
    this.busy = true;
    this.lastUsed = Date.now();

    const queue: WorkerEvent[] = [];
    let wake: (() => void) | null = null;
    const ping = () => {
      const w = wake;
      wake = null;
      w?.();
    };
    this.sink = (e) => {
      queue.push(e);
      ping();
    };

    const timer = setTimeout(() => {
      this.sink?.({
        type: FAIL,
        error: `The assistant turn was stopped after ${Math.round(
          TURN_TIMEOUT_MS / 60_000,
        )} min.`,
      });
      this.dispose(); // a stuck process cannot be reused
    }, TURN_TIMEOUT_MS);

    try {
      this.child.stdin?.write(
        JSON.stringify({
          type: "user",
          message: { role: "user", content: message },
        }) + "\n",
      );

      let resultSeen = false;
      while (!resultSeen) {
        while (queue.length) {
          const e = queue.shift() as WorkerEvent;
          if (e.type === FAIL) {
            throw new Error(String(e.error ?? "The assistant failed."));
          }
          yield e;
          if (e.type === "result") resultSeen = true;
        }
        if (resultSeen) break;
        await new Promise<void>((r) => {
          wake = r;
        });
      }
    } finally {
      clearTimeout(timer);
      this.sink = null;
      this.busy = false;
      this.lastUsed = Date.now();
    }
  }

  /** Kill the child. The worker is dead afterwards and must be discarded. */
  dispose(): void {
    this.alive = false;
    try {
      this.child.stdin?.end();
    } catch {
      /* already closed */
    }
    try {
      this.child.kill("SIGTERM");
    } catch {
      /* already gone */
    }
  }
}

/**
 * Process-wide pool of warm workers, one per active assistant session. Keyed
 * by the worker's own id; looked up by `claude` session id. Evicts idle
 * workers and caps the total. Relies on the app running as a single local
 * Node process (it spawns `claude` on the same machine).
 */
class SessionPool {
  private readonly workers = new Map<string, SessionWorker>();

  constructor() {
    const sweeper = setInterval(() => this.sweep(), 60_000);
    sweeper.unref?.();
    process.once("exit", () => this.disposeAll());
  }

  /**
   * The warm worker for `sessionId`, or a new one. A known session with no
   * warm worker (server restarted, evicted, or crashed) is rehydrated with
   * `--resume`. A null `sessionId` always starts a fresh session.
   */
  acquire(sessionId: string | null): SessionWorker {
    for (const [id, w] of this.workers) {
      if (!w.alive) this.workers.delete(id);
    }

    if (sessionId) {
      for (const w of this.workers.values()) {
        if (w.alive && w.sessionId === sessionId) {
          w.lastUsed = Date.now();
          return w;
        }
      }
      const revived = new SessionWorker(sessionId);
      this.workers.set(revived.id, revived);
      this.enforceCap();
      return revived;
    }

    const fresh = new SessionWorker();
    this.workers.set(fresh.id, fresh);
    this.enforceCap();
    return fresh;
  }

  private enforceCap(): void {
    while (this.workers.size > MAX_WORKERS) {
      const victim = [...this.workers.values()]
        .filter((w) => !w.busy)
        .sort((a, b) => a.lastUsed - b.lastUsed)[0];
      if (!victim) break; // all busy — let the cap drift rather than kill work
      victim.dispose();
      this.workers.delete(victim.id);
    }
  }

  private sweep(): void {
    const now = Date.now();
    for (const [id, w] of this.workers) {
      if (!w.alive || (!w.busy && now - w.lastUsed > IDLE_TTL_MS)) {
        w.dispose();
        this.workers.delete(id);
      }
    }
  }

  private disposeAll(): void {
    for (const w of this.workers.values()) w.dispose();
    this.workers.clear();
  }
}

// Pinned on globalThis so Next.js dev hot-reloads reuse the live pool instead
// of orphaning worker processes on every module re-evaluation.
const store = globalThis as unknown as { __pmSessionPool?: SessionPool };
export const sessionPool: SessionPool =
  store.__pmSessionPool ?? (store.__pmSessionPool = new SessionPool());
