// The Karpathy wiki "Lint" operation — a consistency pass over a process
// wiki that surfaces template-conformance issues, cross-section discrepancies
// and clarifying questions for the SME to resolve.
//
// The pass itself is the `run-lint` skill (.claude/skills/run-lint/): it does
// the cross-perspective judgement and the deterministic apply_lint.py writes
// wiki/processes/<slug>/lint.json. The app reads that file (see wiki.ts) and
// renders it in the Review panel — these are the shapes of what it reads.

export type FindingKind = "question" | "discrepancy" | "conformance";

export interface LintFinding {
  id: string;
  kind: FindingKind;
  /** One-line headline. */
  title: string;
  /** The clarifying question or the discrepancy explanation. */
  detail: string;
  /** Element IDs the finding involves — rendered as jump-to chips. */
  elements: string[];
  /**
   * "open" (the default — absent means open), "resolved" or "dismissed". A
   * finding is resolved the moment a chat deep-dive fixes the discrepancy and
   * the SME approves the change; it is dismissed when the SME judges it not
   * worth acting on and records a reason. The next `run-lint` pass rewrites
   * lint.json from scratch, so either state holds only until the next run.
   */
  status?: "open" | "resolved" | "dismissed";
  /** Resolved only — who closed it (the deep-dive specialist / SME). */
  resolvedBy?: string;
  /** Resolved only — ISO date the finding was closed. */
  resolvedAt?: string;
  /** Resolved only — one-line note on what the deep-dive changed. */
  resolutionNote?: string;
  /** Dismissed only — who set it aside. */
  dismissedBy?: string;
  /** Dismissed only — ISO date it was dismissed. */
  dismissedAt?: string;
  /** Dismissed only — why the SME judged it not worth acting on. */
  dismissReason?: string;
}

/** A finding resolved via a deep-dive. */
export function isResolved(f: LintFinding): boolean {
  return f.status === "resolved";
}

/** A finding the SME set aside with a recorded reason. */
export function isDismissed(f: LintFinding): boolean {
  return f.status === "dismissed";
}

/** A finding is open unless it has been resolved or dismissed. */
export function isOpen(f: LintFinding): boolean {
  return !isResolved(f) && !isDismissed(f);
}

/** A whole lint pass result — one per process, written to lint.json. */
export interface LintReport {
  /** ISO timestamp the pass was run. */
  generatedAt: string;
  slug: string;
  summary: { conformance: number; discrepancy: number; question: number };
  findings: LintFinding[];
}
