// ProcessView — the read-side join layer over a ProcessDoc's elements.
//
// `getProcess()` returns elements that already carry their RACI (as
// "STEP:LEVEL" frontmatter strings) and transitions. Two renderers then need
// the *same* derived shapes:
//
//   • RaciMatrix pivots role RACI into a stepId → roleId → level grid.
//   • ProcessFlow pivots that grid into swimlane assignment — the role that
//     owns each step (its Responsible role, falling back to Accountable),
//     and the lane order down the chart.
//
// Both used to compute these joins inline, with subtly different parsing
// (one trimmed/upper-cased the level, the other didn't). This module is the
// single source of truth for the two joins, so the matrix and the flow can't
// drift, and the pivot logic is unit-tested independently of the DOM.
//
// Pure data over the element arrays — no disk, no schema, no React. The
// generic forward/reverse relation index lives separately in `relations.ts`;
// the LLM context builder (the old `contextFor`) is intentionally not
// restored — it had no consumer.

import type { WikiPage } from "./wiki.ts";
import { asList } from "./meta.ts";

/** Sentinel lane id for steps with no Responsible/Accountable role. */
export const UNASSIGNED_ROLE = "__unassigned__";

export type RaciLevel = "R" | "A" | "C" | "I";

/** stepId → (roleId → level). The matrix renders this directly; the flow
 *  derives lane ownership from it. */
export type RaciGrid = Record<string, Record<string, string>>;

/** Pre-built lane assignment for the process-step flow chart. */
export interface FlowAssignment {
  /** stepId → owning role id (R, then A fallback, then {@link UNASSIGNED_ROLE}). */
  ownerOf: Map<string, string>;
  /** Lane role ids in display order — {@link UNASSIGNED_ROLE} is always last. */
  laneOrder: string[];
  /** Owner role id → lane index (into {@link laneOrder}). */
  laneIndex: Map<string, number>;
  /** True when at least one step has a real (non-unassigned) owner — drives
   *  whether the flow renders lane stripes + the role label column. */
  hasLaneData: boolean;
}

/**
 * Pivot a roles list into a `stepId → roleId → level` grid.
 *
 * RACI lives on each role page as `raci: ["STEP:LEVEL", …]` frontmatter
 * strings. Step ids are trimmed and levels normalised to upper-case so the
 * matrix's badge/legend lookup and the flow's R/A detection read the same
 * values (the two callers previously normalised differently). Roles are
 * walked in array order, so the grid's per-step role order — which decides
 * which role wins the lane when several share a level — is stable.
 */
export function buildRaciGrid(roles: WikiPage[]): RaciGrid {
  const grid: RaciGrid = {};
  for (const role of roles) {
    for (const entry of asList(role.meta.raci)) {
      const [stepId, level] = entry.split(":");
      if (!stepId || !level) continue;
      (grid[stepId.trim()] ??= {})[role.id] = level.trim().toUpperCase();
    }
  }
  return grid;
}

/**
 * Build lane assignment for a step list — a pure pivot over a {@link RaciGrid}.
 *
 *   • Each step's owning role is its Responsible (R) role, falling back to its
 *     Accountable (A) role, falling back to {@link UNASSIGNED_ROLE}. When more
 *     than one role shares R (or A) on a step, the first in `grid` insertion
 *     order wins — i.e. the first in the roles array passed to
 *     {@link buildRaciGrid}.
 *   • Lane order follows first appearance along `sortedSteps`, so the chart
 *     reads roughly diagonally. The unassigned lane is always pushed last.
 *
 * `sortedSteps` is taken already ordered (the caller runs `orderSteps`), so
 * this stays a pure pivot — a target-state flow can lane its own recomposed
 * step set against the same grid without duplicating the logic.
 */
export function buildFlowLanes(
  sortedSteps: WikiPage[],
  grid: RaciGrid,
): FlowAssignment {
  const ownerOf = new Map<string, string>();
  for (const step of sortedSteps) {
    const row = grid[step.id];
    let r: string | undefined;
    let a: string | undefined;
    if (row) {
      for (const [roleId, level] of Object.entries(row)) {
        if (level === "R" && r === undefined) r = roleId;
        else if (level === "A" && a === undefined) a = roleId;
      }
    }
    ownerOf.set(step.id, r ?? a ?? UNASSIGNED_ROLE);
  }

  const laneOrder: string[] = [];
  for (const step of sortedSteps) {
    const owner = ownerOf.get(step.id)!;
    if (!laneOrder.includes(owner)) laneOrder.push(owner);
  }
  const ui = laneOrder.indexOf(UNASSIGNED_ROLE);
  if (ui >= 0 && ui !== laneOrder.length - 1) {
    laneOrder.splice(ui, 1);
    laneOrder.push(UNASSIGNED_ROLE);
  }

  const laneIndex = new Map<string, number>();
  laneOrder.forEach((roleId, i) => laneIndex.set(roleId, i));
  const hasLaneData = laneOrder.some((k) => k !== UNASSIGNED_ROLE);

  return { ownerOf, laneOrder, laneIndex, hasLaneData };
}
