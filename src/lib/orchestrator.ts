// Orchestrator — read-side consolidation over a ProcessDoc.
//
// The job here is to answer two questions, in pure-data form:
//
//   1. "Across all my processes, where does my attention go next?"
//      → buildAttentionFeed(docs)
//
//   2. "Inside this one process, what's outstanding and where should I work?"
//      → buildOrchestratorState(doc)
//
// Both are state machines over the wiki state. No LLM call. No writes. No new
// sidecars in wiki/. This is the canonical read layer the dashboard
// (WelcomeScreen) consumes; consumers sort by the weights here but never
// reinvent the formula.
//
// Runtime inputs (open lint findings, the foundational-run cursor) are read
// off the hydrated ProcessDoc — getProcess stitches them in from the runtime
// store (R9), so this layer never touches data/runtime/ directly and never
// reads runtime state back out of the wiki JSON.
//
// The action vocabulary is intentionally tight — four kinds — and matches what
// the wiki actually carries today (ingest conflicts, lint findings, open
// comments, the foundational-run cursor). Adding new kinds means adding new
// wiki shape; do not invent actions the wiki can't ground.

import { isOpen } from "./lint.ts";
import type { ProcessDoc } from "./wiki.ts";

// ---- Action vocabulary --------------------------------------------------

export type ActionSpec =
  | {
      kind: "resolve-ingest-conflict";
      slug: string;
      /** Total conflicts on the process. The UI may surface them individually
       *  via doc.ingest.conflicts; this kind is the "open this process and
       *  resolve them" handle. */
      count: number;
      weight: number;
    }
  | {
      kind: "resolve-lint-finding";
      slug: string;
      /** Number of open (not resolved, not dismissed) findings. */
      count: number;
      weight: number;
    }
  | {
      kind: "address-comment";
      slug: string;
      /** Number of unresolved SME notes across all elements. */
      count: number;
      weight: number;
    }
  | {
      kind: "resume-foundational-run";
      slug: string;
      cursor: number;
      total: number;
      weight: number;
    }
  | {
      kind: "resume-qer-session";
      slug: string;
      cursor: number;
      total: number;
      /** The step name the QER cursor is paused on (the queue holds step names). */
      current: string | null;
      weight: number;
    };

export type ActionKind = ActionSpec["kind"];

/** Coarse health summary for one process — what the dashboard renders without
 *  re-walking the doc. Same numbers buildOrchestratorState computed during
 *  build; surfaced separately so consumers can render the chrome without
 *  pulling the full action list. */
export interface OrchestratorHealth {
  /** True when no action would be ranked — the process is in a clean state. */
  clean: boolean;
  conflicts: number;
  openLintFindings: number;
  openComments: number;
  /** A foundational run exists and isn't finished. */
  runResumable: boolean;
  /** A QER session exists and isn't finished. */
  qerSessionResumable: boolean;
}

export interface OrchestratorState {
  /** Actions for one process, sorted by weight (highest first). */
  actions: ActionSpec[];
  /** Highest-weighted action, or null if the process is clean. */
  topAction: ActionSpec | null;
  /** Coarse health summary. */
  health: OrchestratorHealth;
}

/** Cross-process row for the dashboard ATTENTION column. Carries the reasons
 *  text the WelcomeScreen renders inline. */
export interface AttentionRow {
  slug: string;
  /** Process id (for the "PM" tag chip). */
  id: string;
  /** Process title. */
  title: string;
  /** Sub-bullets rendered under the title — e.g. "6 ingest conflicts · 21
   *  quality findings · 2 comments". */
  reasons: string[];
  /** For sort order — higher = more urgent. Same formula as the actions. */
  weight: number;
}

// ---- Weight formula -----------------------------------------------------
// Conflicts beat lint beats comments. Resume-run sits between conflicts and
// lint. Formula is locked here so callers can sort but never reinvent.

const WEIGHT_CONFLICT = 100;
const WEIGHT_LINT = 5;
const WEIGHT_COMMENT = 1;
const WEIGHT_RUN_BASE = 50; // mid-band; below conflicts, above lint
const WEIGHT_QER_BASE = 50; // same band as the foundational run

// ---- Counts -------------------------------------------------------------

function countOpenLintFindings(doc: ProcessDoc): number {
  return doc.lint?.findings?.filter(isOpen).length ?? 0;
}

function countOpenComments(doc: ProcessDoc): number {
  if (!doc.notes) return 0;
  let n = 0;
  for (const arr of Object.values(doc.notes)) {
    for (const note of arr) if (!note.resolved) n++;
  }
  return n;
}

// ---- buildOrchestratorState --------------------------------------------

export function buildOrchestratorState(doc: ProcessDoc): OrchestratorState {
  const conflicts = doc.ingest?.conflicts?.length ?? 0;
  const openLintFindings = countOpenLintFindings(doc);
  const openComments = countOpenComments(doc);
  const rs = doc.reviewState;
  const runResumable = !!(rs && !rs.done && rs.total > 0);
  const qs = doc.qerState;
  const qerSessionResumable = !!(qs && !qs.done && qs.total > 0);

  const actions: ActionSpec[] = [];
  if (conflicts > 0) {
    actions.push({
      kind: "resolve-ingest-conflict",
      slug: doc.slug,
      count: conflicts,
      weight: conflicts * WEIGHT_CONFLICT,
    });
  }
  if (runResumable) {
    // Weight nudges with how much of the run is left, so a barely-started
    // run is heavier than one a few items from the end.
    const remaining = rs!.total - rs!.cursor;
    actions.push({
      kind: "resume-foundational-run",
      slug: doc.slug,
      cursor: rs!.cursor,
      total: rs!.total,
      weight: WEIGHT_RUN_BASE + remaining,
    });
  }
  if (qerSessionResumable) {
    const remaining = qs!.total - qs!.cursor;
    actions.push({
      kind: "resume-qer-session",
      slug: doc.slug,
      cursor: qs!.cursor,
      total: qs!.total,
      current: qs!.queue[qs!.cursor] ?? null,
      weight: WEIGHT_QER_BASE + remaining,
    });
  }
  if (openLintFindings > 0) {
    actions.push({
      kind: "resolve-lint-finding",
      slug: doc.slug,
      count: openLintFindings,
      weight: openLintFindings * WEIGHT_LINT,
    });
  }
  if (openComments > 0) {
    actions.push({
      kind: "address-comment",
      slug: doc.slug,
      count: openComments,
      weight: openComments * WEIGHT_COMMENT,
    });
  }
  actions.sort((a, b) => b.weight - a.weight);

  return {
    actions,
    topAction: actions[0] ?? null,
    health: {
      clean: actions.length === 0,
      conflicts,
      openLintFindings,
      openComments,
      runResumable,
      qerSessionResumable,
    },
  };
}

// ---- buildAttentionFeed -------------------------------------------------
//
// Cross-process aggregation for the dashboard. Produces one AttentionRow per
// process that has anything outstanding, ranked by weight. Clean processes are
// returned separately so the dashboard can surface them under RESUME / OPEN
// PROCESS instead of ATTENTION.

export function buildAttentionFeed(docs: ProcessDoc[]): {
  attentionRows: AttentionRow[];
  cleanProcesses: ProcessDoc[];
} {
  const attentionRows: AttentionRow[] = [];
  const cleanProcesses: ProcessDoc[] = [];

  for (const doc of docs) {
    const conflicts = doc.ingest?.conflicts?.length ?? 0;
    const openLintFindings = countOpenLintFindings(doc);
    const openComments = countOpenComments(doc);

    const reasons: string[] = [];
    if (conflicts) {
      reasons.push(`${conflicts} ingest conflict${conflicts === 1 ? "" : "s"}`);
    }
    if (openLintFindings) {
      reasons.push(
        `${openLintFindings} quality finding${openLintFindings === 1 ? "" : "s"}`,
      );
    }
    if (openComments) {
      reasons.push(`${openComments} comment${openComments === 1 ? "" : "s"}`);
    }

    if (reasons.length === 0) {
      cleanProcesses.push(doc);
      continue;
    }

    attentionRows.push({
      slug: doc.slug,
      id: doc.process.id,
      title: doc.process.title,
      reasons,
      // Same per-row weighting WelcomeScreen used pre-orchestrator
      // (`conflicts * 100 + lint * 5 + comments`) so the dashboard's row
      // order is byte-identical after migration.
      weight:
        conflicts * WEIGHT_CONFLICT +
        openLintFindings * WEIGHT_LINT +
        openComments * WEIGHT_COMMENT,
    });
  }

  attentionRows.sort((a, b) => b.weight - a.weight);
  return { attentionRows, cleanProcesses };
}
