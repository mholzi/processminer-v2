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
/** A reviewer's disposition of a finding — the review workflow state. Defaults
 *  to "open"; the reviewer either accepts it (a DTP change to make manually) or
 *  dismisses it (which opens a chat to reconcile the wiki instead). */
export type DtpDisposition = "open" | "accepted" | "dismissed";

export interface DtpFinding {
  /** Backend-stamped, e.g. "DTPF-001". */
  id: string;
  /** outdated — the DTP describes a now-superseded state; missing — the wiki
   *  holds content the DTP omits; contradiction — the two disagree on a fact;
   *  added — the analysis introduced something the DTP never had. */
  kind: "outdated" | "missing" | "contradiction" | "added";
  /** One-line plain-English summary of the discrepancy, for scanning a list.
   *  Optional — the UI falls back to wikiSays/dtpSays when absent. */
  headline?: string;
  /** What the original DTP states (or "—" when it is silent). */
  dtpSays: string;
  /** What the corrected As-Is wiki holds. */
  wikiSays: string;
  /** Implicated wiki element ids. */
  elements: string[];
  severity: "high" | "medium" | "low";
  /** One line on WHY this severity / why it matters (e.g. "control gap",
   *  "wrong owner on a key step"). Skill-emitted, optional. */
  rationale?: string;
  /** The skill's suggested disposition — "accepted" (a DTP correction) or
   *  "dismissed" (more likely a wiki issue to reconcile). A hint only; the
   *  reviewer still decides. Optional. */
  suggestedDisposition?: "accepted" | "dismissed";
  /** Reviewer disposition — app-owned workflow state, set in the DTP Enhancer.
   *  Absent means "open". */
  disposition?: DtpDisposition;
}
/** Result of the last dtp-regenerate run: the regenerated DTP artifact's
 *  filename (written under raw-sources/<slug>/) plus the critical-review
 *  findings. The full text lives in the .md file; only the pointer + findings
 *  live here. */
export interface DtpReport {
  /** Backend-stamped run id, e.g. "DTP-007" — stable per run, used as the
   *  key in the DTP Enhancer's past-comparison history. */
  runId: string;
  /** "compare" — review the chosen DTP against the wiki (findings only, no new
   *  artifact); "regenerate" — also rebuild the DTP from the As-Is (with a
   *  generatedFile + full-text diff). Legacy reports are "regenerate". */
  mode: "compare" | "regenerate";
  generatedAt: string;
  /** The corrected As-Is is the only basis today; carried for forward-compat. */
  basis: "as-is";
  /** Original DTP filename the run was based on. */
  sourceFile: string;
  /** Regenerated DTP filename under raw-sources/<slug>/ — only for "regenerate"
   *  runs; absent for "compare". */
  generatedFile?: string;
  findings: DtpFinding[];
  /** What the run actually examined — drives the coverage map. `dtpSections` is
   *  the list of DTP sections/headings the skill walked. Optional (older runs
   *  have none). */
  coverage?: { dtpSections: string[] };
  /** Executive-summary memo for this comparison (Markdown), generated on demand
   *  by the dtp-summary skill. Optional. */
  summary?: string;
}

/** LLM token usage for one worker turn, provider-normalised. */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  /** Prompt tokens served from cache (claude `cache_read_input_tokens`). */
  cacheReadTokens: number;
  /** Prompt tokens written to cache (claude `cache_creation_input_tokens`). */
  cacheCreationTokens: number;
  /** Cost in USD if the provider reports it (claude `total_cost_usd`); else 0. */
  costUsd: number;
}

/** Accumulated usage for a skill (or the process total) across many turns. */
export interface SkillUsageEntry extends TokenUsage {
  /** Number of worker turns folded in. NB: a multi-turn skill (a foundational
   *  run is dozens of turns) counts each turn — not one per invocation. */
  turns: number;
  /** Summed wall-clock run-time of those turns, in ms (server-side processing
   *  time per turn, summed — excludes idle time between turns). */
  durationMs: number;
  /** ISO timestamp of the most recent turn folded in. */
  lastAt: string;
}

/** Per-process token-usage tally — a process total plus a per-skill breakdown.
 *  Derived/orchestration state, so it lives in the runtime store, not the wiki
 *  (Karpathy guardrail). Keyed by the `skill` the chat passed (`document-ingest`,
 *  `foundational-run`, …); free chat with no skill is keyed `"free-chat"`. */
export interface SkillUsage {
  total: SkillUsageEntry;
  bySkill: Record<string, SkillUsageEntry>;
  updatedAt: string;
}

export interface ProcessRuntime {
  /** The foundational-run cursor (walks current-state element ids). */
  reviewState?: ReviewState;
  /** LLM token usage, per skill + process total. */
  skillUsage?: SkillUsage;
  /** The qer-session cursor (walks the fixed QER step sequence). Same shape as
   *  reviewState but kept separate so the orchestrator's foundational-resume
   *  read of reviewState is never confused by a QER session. */
  qerState?: ReviewState;
  lint?: LintReport;
  findingDismissals?: FindingDismissals;
  /** The DTP Enhancer's past-comparison history — every dtp-regenerate run,
   *  newest first. Each run keeps its own regenerated artifact + findings so the
   *  history is browsable. */
  dtpReports?: DtpReport[];
  /** @deprecated Legacy single-report field (pre-history). Read for migration
   *  only; new writes go to `dtpReports`. */
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

/** Set a reviewer's disposition on one finding within a past DTP run. Returns
 *  false when the run or finding isn't found. The dispositions live with the
 *  findings in the runtime history (R9 — never the wiki JSON). */
export function setDtpDisposition(
  slug: string,
  runId: string,
  findingId: string,
  disposition: DtpDisposition,
): boolean {
  const rt = getRuntime(slug);
  // Migrate the legacy single-report field into the array if needed.
  const reports: DtpReport[] = Array.isArray(rt.dtpReports)
    ? rt.dtpReports
    : rt.dtpReport
      ? [
          {
            ...rt.dtpReport,
            runId: rt.dtpReport.runId ?? "DTP-001",
            mode: rt.dtpReport.mode ?? "regenerate",
          },
        ]
      : [];
  const report = reports.find((r) => r.runId === runId);
  const finding = report?.findings.find((f) => f.id === findingId);
  if (!finding) return false;
  finding.disposition = disposition;
  writeRuntime(slug, { dtpReports: reports, dtpReport: undefined });
  return true;
}

/** Store the executive-summary memo for a past DTP run. Returns false when the
 *  run isn't found. Runtime state (R9), never the wiki JSON. */
export function setDtpSummary(slug: string, runId: string, summary: string): boolean {
  const rt = getRuntime(slug);
  const reports: DtpReport[] = Array.isArray(rt.dtpReports)
    ? rt.dtpReports
    : rt.dtpReport
      ? [
          {
            ...rt.dtpReport,
            runId: rt.dtpReport.runId ?? "DTP-001",
            mode: rt.dtpReport.mode ?? "regenerate",
          },
        ]
      : [];
  const report = reports.find((r) => r.runId === runId);
  if (!report) return false;
  report.summary = summary;
  writeRuntime(slug, { dtpReports: reports, dtpReport: undefined });
  return true;
}
