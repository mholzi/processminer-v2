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
}

/** A whole lint pass result — one per process, written to lint.json. */
export interface LintReport {
  /** ISO timestamp the pass was run. */
  generatedAt: string;
  slug: string;
  summary: { conformance: number; discrepancy: number; question: number };
  findings: LintFinding[];
}
