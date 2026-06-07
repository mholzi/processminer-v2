// Deterministic helpers for the foundational-run skill. The walk's judgement
// (the sharp, lens-specific challenge) stays the model's; these turn the
// run's *mechanical* facts into counted data so they replay identically:
//
//   - control coverage per process-step (a step with no control is SKILLS.md's
//     "most valuable finding" — make it a boolean, not a re-derivation),
//   - the process-gap tail of the queue (batchable),
//   - the filled close-out counts + the "still to document" section→skill map.
//
// Pure / I/O-free: callers pass the parsed process doc. `foundationalStatus`
// (session-cursor.ts) owns the base cursor view; `enrichFoundationalStatus`
// here layers the doc-derived facts on top.

import type { ReviewState } from "./wiki.ts";
import { foundationalStatus, type StatusView } from "./session-cursor.ts";

/**
 * Per process-step: does any control link to it? Controls carry
 * `content.step` = the step id they cover. A step absent from this map's
 * `true` set has no control linked — the control-coverage probe should fire.
 */
export function buildControlCoverage(doc: any): Record<string, boolean> {
  const covered = new Set<string>();
  for (const c of doc?.controls ?? []) {
    const step = c?.content?.step;
    if (typeof step === "string" && step) covered.add(step);
    else if (Array.isArray(step)) for (const s of step) if (typeof s === "string") covered.add(s);
  }
  const out: Record<string, boolean> = {};
  for (const s of doc?.["process-steps"] ?? []) {
    const id = s?.meta?.id;
    if (typeof id === "string" && id) out[id] = covered.has(id);
  }
  return out;
}

/** The process-step ids that have no control linked (the probe targets). */
export function uncoveredSteps(doc: any): string[] {
  const cov = buildControlCoverage(doc);
  return Object.keys(cov).filter((id) => !cov[id]);
}

/** The process-gap ids in a doc — the batchable tail of the foundational queue. */
function processGapIds(doc: any): Set<string> {
  const s = new Set<string>();
  for (const g of doc?.["process-gaps"] ?? []) {
    const id = g?.meta?.id;
    if (typeof id === "string" && id) s.add(id);
  }
  return s;
}

/**
 * The empty-section → filling-action map the close-out reads (SKILLS.md §4/§11).
 * Sections not listed here are never surfaced as "still to document" (the Target
 * Process area is built last and excluded by design).
 */
export const FOUNDATIONAL_FILL_MAP: Record<string, { label: string; action: string }> = {
  channels: { label: "Channels", action: "run the **client-journey-specialist** skill" },
  touchpoints: { label: "Touchpoints", action: "run the **client-journey-specialist** skill" },
  moments: { label: "Moments of Truth", action: "run the **client-journey-specialist** skill" },
  "friction-points": { label: "Friction Points", action: "run the **client-journey-specialist** skill" },
  "audit-findings": { label: "Audit Findings", action: "run the **control-compliance-specialist** skill" },
  "innovation-risks": { label: "Innovation Risks", action: "run the **innovation-analyst** skill" },
  integrations: { label: "Integrations", action: "run the **it-architect** skill" },
  regulation: { label: "Regulation", action: "use the **✦ Source from the web** button on the section" },
  "competitor-cx": { label: "Competitor CX", action: "use the **✦ Source from the web** button on the section" },
  "cx-benchmarks": { label: "CX Benchmarks", action: "use the **✦ Source from the web** button on the section" },
  "market-trends": { label: "Market Trends", action: "use the **✦ Source from the web** button on the section" },
  "competitor-innovation": { label: "Competitor Innovation", action: "use the **✦ Source from the web** button on the section" },
  "innovation-ideas": { label: "Innovation Ideas", action: "use the **✦ Source from the web** button on the section" },
};

/** Empty sections from the fill map, each paired with its filling action. */
export function stillToDocument(doc: any): { section: string; label: string; action: string }[] {
  const out: { section: string; label: string; action: string }[] = [];
  for (const [section, info] of Object.entries(FOUNDATIONAL_FILL_MAP)) {
    const list = doc?.[section];
    const empty = !Array.isArray(list) || list.length === 0;
    if (empty) out.push({ section, ...info });
  }
  return out;
}

/** Element counts by section for the close-out's "By type" line (non-empty only). */
export function closeoutCounts(doc: any): { byType: { section: string; count: number }[]; total: number } {
  const byType: { section: string; count: number }[] = [];
  let total = 0;
  for (const [k, v] of Object.entries(doc ?? {})) {
    if (!Array.isArray(v) || v.length === 0) continue;
    byType.push({ section: k, count: v.length });
    total += v.length;
  }
  return { byType, total };
}

/**
 * The base foundational cursor view (session-cursor) enriched with the
 * doc-derived facts: control coverage for the current step, the gap-tail batch,
 * and (once done) the close-out counts + still-to-document map.
 */
export function enrichFoundationalStatus(state: ReviewState | undefined, doc: any): StatusView {
  const view = foundationalStatus(state);
  if (!view.exists) return view;

  if (view.done) {
    const { byType, total } = closeoutCounts(doc);
    view.closeoutCounts = byType;
    view.closeoutTotal = total;
    view.stillToDocument = stillToDocument(doc);
    return view;
  }

  const current = view.current ?? null;
  if (current) {
    const cov = buildControlCoverage(doc);
    if (Object.prototype.hasOwnProperty.call(cov, current)) {
      // current item is a process-step
      view.currentHasControl = cov[current];
    }
    const gaps = processGapIds(doc);
    if (gaps.has(current)) {
      // in the batchable process-gap tail — list the remaining gap ids from here
      const rest = (state!.queue.slice(state!.cursor)).filter((id) => gaps.has(id));
      view.gapTail = { ids: rest };
    }
  }
  // Always expose the uncovered-step list so Step 1 orientation can name them.
  view.uncoveredSteps = uncoveredSteps(doc);
  return view;
}
