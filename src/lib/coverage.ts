// Target-state coverage — pure set arithmetic over the loaded ProcessDoc.
//
// "Is the transformation complete?" = does every OPEN As-Is problem
// (pain-point / process-gap / compliance-gap / friction-point / audit-finding)
// get resolved by at least one `transformation-decision`?
//
// Reads ONLY `transformation-decision.resolves` — never `innovation-idea.addresses`
// (a separate relation to the same problem set; conflating them would miscount
// ideas as target-state coverage). Called client-side in a useMemo, alongside
// buildRelations. No file, no script, no staleness.
import type { ProcessDoc, WikiPage } from "./wiki";

/** As-Is problem element types a `transformation-decision` can `resolves`. */
export const PROBLEM_TYPES = [
  "pain-point",
  "process-gap",
  "compliance-gap",
  "friction-point",
  "audit-finding",
] as const;

export type ProblemType = (typeof PROBLEM_TYPES)[number];

/** Plural, human labels for the problem types — used as section headings
 *  when coverage is broken down by type. */
export const PROBLEM_TYPE_LABELS: Record<ProblemType, string> = {
  "pain-point": "Pain Points",
  "process-gap": "Process Gaps",
  "compliance-gap": "Control Gaps",
  "friction-point": "Friction Points",
  "audit-finding": "Audit Findings",
};

/** `gapStatus` / `findingStatus` values that mean a problem is no longer
 *  outstanding transformation work — excluded from the coverage denominator. */
const CLOSED_STATUSES = [
  "closed",
  "resolved",
  "addressed",
  "addressed-in-target",
  "remediated",
  "mitigated",
  "done",
];

export type FindingCode =
  | "decision-resolves-nothing"
  | "inert-decision"
  | "orphan-target-state"
  | "dangling-ref"
  | "wrong-type-ref";

export interface ConsistencyFinding {
  code: FindingCode;
  /** `error` — a broken reference (red). `warning` — a coherence gap. */
  severity: "error" | "warning";
  message: string;
  /** Element ids the finding implicates. */
  refs: string[];
}

/** Coverage for one problem type — its slice of covered / uncovered / closed. */
export interface ProblemTypeCoverage {
  type: ProblemType;
  /** Plural human label, e.g. "Pain Points". */
  label: string;
  /** Open problem ids of this type resolved by ≥1 decision. */
  covered: string[];
  /** Open problem ids of this type no decision resolves. */
  uncovered: string[];
  /** Closed/resolved problem ids of this type. */
  closedExcluded: string[];
}

export interface CoverageReport {
  /** Number of `transformation-decision` elements in the process. */
  decisionCount: number;
  /** Number of `target-state` elements in the process. */
  targetStateCount: number;
  /** Count of open addressable problems — the coverage denominator. */
  totalOpen: number;
  /** Open problem ids resolved by ≥1 decision. */
  covered: string[];
  /** Open problem ids no decision resolves. */
  uncovered: string[];
  /** Closed/resolved problem ids, excluded from the denominator. */
  closedExcluded: string[];
  /** Coverage broken down by problem type — only types with ≥1 problem,
   *  in `PROBLEM_TYPES` order. */
  byType: ProblemTypeCoverage[];
  /** Problem id → the decision ids that `resolves` it. */
  resolvedBy: Record<string, string[]>;
  /** Consistency findings — broken refs (error) and coherence gaps (warning). */
  consistency: ConsistencyFinding[];
}

import { asList } from "./meta.ts";

/** A problem is closed (excluded from coverage) when its gapStatus /
 *  findingStatus is a known closed value. Missing status, "open", or any
 *  in-progress value counts as open. */
function isClosed(p: WikiPage): boolean {
  const raw = p.meta.gapStatus ?? p.meta.findingStatus;
  if (typeof raw !== "string") return false;
  return CLOSED_STATUSES.includes(raw.trim().toLowerCase());
}

/**
 * Compute target-state coverage + consistency for one process.
 *
 *   problems ──resolved by── transformation-decision ──realises── target-state
 *
 * Coverage: every OPEN problem reachable from a decision via `resolves`.
 * Consistency: decisions that resolve nothing, inert decisions, orphan
 * target-states, and broken `resolves` / `realises` references.
 */
export function computeCoverage(doc: ProcessDoc): CoverageReport {
  const byId = new Map<string, WikiPage>(doc.elements.map((e) => [e.id, e]));
  const problemTypes: Set<string> = new Set(PROBLEM_TYPES);

  const problems = doc.elements.filter((e) => problemTypes.has(e.type));
  const decisions = doc.elements.filter(
    (e) => e.type === "transformation-decision",
  );
  const targetStates = doc.elements.filter((e) => e.type === "target-state");

  const consistency: ConsistencyFinding[] = [];
  const resolvedBy: Record<string, string[]> = {};
  // target-state ids named by some decision's `realises` — for the orphan check.
  const realisedTargets = new Set<string>();

  for (const d of decisions) {
    const resolves = asList(d.meta.resolves);
    const realises = asList(d.meta.realises);
    let validResolves = 0;
    let validRealises = 0;

    for (const ref of resolves) {
      const target = byId.get(ref);
      if (!target) {
        consistency.push({
          code: "dangling-ref",
          severity: "error",
          message: `${d.id} resolves "${ref}" — no element with that id.`,
          refs: [d.id],
        });
      } else if (!problemTypes.has(target.type)) {
        consistency.push({
          code: "wrong-type-ref",
          severity: "error",
          message: `${d.id} resolves ${ref}, which is a ${target.type}, not an As-Is problem.`,
          refs: [d.id, ref],
        });
      } else {
        validResolves++;
        (resolvedBy[ref] ??= []).push(d.id);
      }
    }

    for (const ref of realises) {
      const target = byId.get(ref);
      if (!target) {
        consistency.push({
          code: "dangling-ref",
          severity: "error",
          message: `${d.id} realises "${ref}" — no element with that id.`,
          refs: [d.id],
        });
      } else if (target.type !== "target-state") {
        consistency.push({
          code: "wrong-type-ref",
          severity: "error",
          message: `${d.id} realises ${ref}, which is a ${target.type}, not a target-state.`,
          refs: [d.id, ref],
        });
      } else {
        validRealises++;
        realisedTargets.add(ref);
      }
    }

    if (validResolves === 0 && validRealises === 0) {
      consistency.push({
        code: "inert-decision",
        severity: "warning",
        message: `${d.id} resolves no problem and realises no target state — it has no effect on the transformation.`,
        refs: [d.id],
      });
    } else if (validResolves === 0) {
      consistency.push({
        code: "decision-resolves-nothing",
        severity: "warning",
        message: `${d.id} resolves no As-Is problem.`,
        refs: [d.id],
      });
    }
  }

  for (const ts of targetStates) {
    if (!realisedTargets.has(ts.id)) {
      consistency.push({
        code: "orphan-target-state",
        severity: "warning",
        message: `${ts.id} is realised by no transformation decision.`,
        refs: [ts.id],
      });
    }
  }

  const covered: string[] = [];
  const uncovered: string[] = [];
  const closedExcluded: string[] = [];
  // Per-type buckets — one slot per problem type, filled in problem order.
  const buckets = new Map<ProblemType, ProblemTypeCoverage>();
  for (const t of PROBLEM_TYPES) {
    buckets.set(t, {
      type: t,
      label: PROBLEM_TYPE_LABELS[t],
      covered: [],
      uncovered: [],
      closedExcluded: [],
    });
  }
  for (const p of problems) {
    const bucket = buckets.get(p.type as ProblemType);
    if (isClosed(p)) {
      closedExcluded.push(p.id);
      bucket?.closedExcluded.push(p.id);
      continue;
    }
    if ((resolvedBy[p.id]?.length ?? 0) > 0) {
      covered.push(p.id);
      bucket?.covered.push(p.id);
    } else {
      uncovered.push(p.id);
      bucket?.uncovered.push(p.id);
    }
  }
  const byType = [...buckets.values()].filter(
    (b) =>
      b.covered.length + b.uncovered.length + b.closedExcluded.length > 0,
  );

  return {
    decisionCount: decisions.length,
    targetStateCount: targetStates.length,
    totalOpen: covered.length + uncovered.length,
    covered,
    uncovered,
    closedExcluded,
    byType,
    resolvedBy,
    consistency,
  };
}
