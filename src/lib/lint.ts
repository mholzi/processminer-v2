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

// ---- Durable dismissals -------------------------------------------------
// `run-lint` rewrites lint.json from scratch, and finding ids (F-001…) are
// re-numbered each pass — so a dismissal keyed to an id would not survive a
// re-lint. Dismissals are therefore stored in a separate app-owned sidecar,
// finding-dismissals.json, keyed by a *content* signature that is stable
// across re-lints. The app re-applies them whenever it loads a lint report.

/** One dismissal record in finding-dismissals.json. */
export interface FindingDismissal {
  /** Why the SME judged the finding not worth acting on. */
  reason: string;
  /** Who dismissed it. */
  by: string;
  /** ISO date it was dismissed. */
  at: string;
  /** ISO date a snoozed dismissal lapses — absent means a permanent dismissal. */
  until?: string;
}

/** finding-dismissals.json — signature → dismissal. */
export type FindingDismissals = Record<string, FindingDismissal>;

/** A content signature for a finding — stable across re-lints (unlike its id),
 *  so a dismissal keyed to it still matches the same finding next pass. */
export function findingSignature(f: {
  kind: string;
  title: string;
  elements: string[];
}): string {
  return `${f.kind}|${f.title}|${[...f.elements].sort().join(",")}`;
}

/** Re-apply the dismissal sidecar to a fresh lint report — sets `dismissed`
 *  status on any finding whose signature is dismissed and not snooze-lapsed.
 *  `today` is an ISO date (YYYY-MM-DD). Mutates and returns the findings. */
export function applyFindingDismissals(
  findings: LintFinding[],
  dismissals: FindingDismissals,
  today: string,
): LintFinding[] {
  for (const f of findings) {
    if (f.status === "resolved") continue;
    const d = dismissals[findingSignature(f)];
    if (!d) continue;
    if (d.until && d.until < today) continue; // a snooze that has lapsed
    f.status = "dismissed";
    f.dismissReason = d.reason;
    f.dismissedBy = d.by;
    f.dismissedAt = d.at;
  }
  return findings;
}
