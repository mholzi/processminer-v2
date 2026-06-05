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

/** One discrepancy the dtp-regenerate critical review surfaced — the original
 *  DTP measured against the corrected As-Is wiki. Derived/transient → runtime
 *  store, never the wiki JSON. */
export interface DtpFinding {
  /** Backend-stamped, e.g. "DTPF-001". */
  id: string;
  /** outdated — the DTP describes a now-superseded state; missing — the wiki
   *  holds content the DTP omits; contradiction — the two disagree on a fact;
   *  added — the analysis introduced something the DTP never had. */
  kind: "outdated" | "missing" | "contradiction" | "added";
  /** What the original DTP states (or "—" when it is silent). */
  dtpSays: string;
  /** What the corrected As-Is wiki holds. */
  wikiSays: string;
  /** Implicated wiki element ids. */
  elements: string[];
  severity: "high" | "medium" | "low";
}
/** Result of the last dtp-regenerate run: the regenerated DTP artifact's
 *  filename (written under raw-sources/<slug>/) plus the critical-review
 *  findings. The full text lives in the .md file; only the pointer + findings
 *  live here. */
export interface DtpReport {
  generatedAt: string;
  /** The corrected As-Is is the only basis today; carried for forward-compat. */
  basis: "as-is";
  /** Original DTP filename the regeneration was based on (doc.ingest.file). */
  sourceFile: string;
  /** Regenerated DTP filename under raw-sources/<slug>/. */
  generatedFile: string;
  findings: DtpFinding[];
}

export interface ProcessRuntime {
  /** The foundational-run cursor (walks current-state element ids). */
  reviewState?: ReviewState;
  /** The qer-session cursor (walks the fixed QER step sequence). Same shape as
   *  reviewState but kept separate so the orchestrator's foundational-resume
   *  read of reviewState is never confused by a QER session. */
  qerState?: ReviewState;
  lint?: LintReport;
  findingDismissals?: FindingDismissals;
  /** The last dtp-regenerate result (regenerated DTP + critical review). */
  dtpReport?: DtpReport;
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
