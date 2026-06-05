// R9 — the runtime layer ABOVE the wiki.
//
// The Karpathy LLM-Wiki guardrail: `wiki/processes/<slug>.json` holds only the
// durable, curated process knowledge. Runtime / orchestration / derived state
// must never live inside it. This sibling store keeps that transient state
// outside the wiki, under `data/runtime/<slug>.json`:
//   - reviewState        — the foundational-run cursor (orchestration)
//   - lint               — the latest lint report (derived, regenerated)
//   - findingDismissals  — per-finding dismissals keyed by content signature
//
// `data/` is gitignored, so runtime state is per-environment and never
// version-controlled — which is correct for transient state.
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { atomicWriteFileSync } from "./atomic-write.ts";
import { join } from "node:path";
import type { ReviewState } from "./wiki.ts";
import type { FindingDismissals, LintReport } from "./lint.ts";

const RUNTIME_DIR = join(process.cwd(), "data", "runtime");

export interface ProcessRuntime {
  /** The foundational-run cursor (walks current-state element ids). */
  reviewState?: ReviewState;
  /** The qer-session cursor (walks the fixed QER step sequence). Same shape as
   *  reviewState but kept separate so the orchestrator's foundational-resume
   *  read of reviewState is never confused by a QER session. */
  qerState?: ReviewState;
  lint?: LintReport;
  findingDismissals?: FindingDismissals;
}

function pathFor(slug: string): string {
  return join(RUNTIME_DIR, `${slug}.json`);
}

/** Read a process's runtime state. Returns `{}` when none has been written. */
export function getRuntime(slug: string): ProcessRuntime {
  const p = pathFor(slug);
  if (!existsSync(p)) return {};
  try {
    return JSON.parse(readFileSync(p, "utf8")) as ProcessRuntime;
  } catch {
    return {};
  }
}

/** Merge a partial update into a process's runtime state. */
export function writeRuntime(slug: string, patch: Partial<ProcessRuntime>): void {
  if (!existsSync(RUNTIME_DIR)) mkdirSync(RUNTIME_DIR, { recursive: true });
  const next = { ...getRuntime(slug), ...patch };
  atomicWriteFileSync(pathFor(slug), JSON.stringify(next, null, 2) + "\n");
}
