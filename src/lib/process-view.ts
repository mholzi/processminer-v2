// ProcessView — the read-side join layer over a ProcessDoc.
//
// `getProcess()` returns a ProcessDoc whose elements already carry their
// provenance, transitions and RACI (joined from per-process JSON sidecars).
// ProcessView goes one step further and *materializes* the views that every
// consumer would otherwise reinvent:
//
//   • renderers — `RaciMatrix` builds `grid[stepId][roleId]`; `ProcessFlow`
//     derives swimlane assignment from each role's RACI. Both can pull the
//     pre-built shape from `view.raciGrid` / `view.flow` instead.
//   • the future LLM context builder (TARGET-ARCH-PLAN.md piece 1) — when
//     asked for "the context around element X" it can call `view.contextFor`
//     and get the element plus summaries of every directly-related element,
//     without re-walking relations and sidecars itself.
//
// View building is pure over a ProcessDoc + Schema; nothing here reads from
// disk. The view is rebuilt once per `getProcess()` call.

import type {
  ProcessDoc,
  Schema,
  WikiPage,
  RelationSpec,
} from "./wiki.ts";
import { orderSteps, transitionsOf } from "./stepOrder.ts";

/** Sentinel role id for the lane that gathers steps with no RACI assignment. */
export const UNASSIGNED_ROLE = "__unassigned__";

export type RaciLevel = "R" | "A" | "C" | "I";

/** One element rendered down to ~30 words — what the LLM and link chips see
 *  when an element is mentioned but is not the focal point. */
export interface ElementSummary {
  id: string;
  type: string;
  title: string;
  /** First prose block trimmed to `summaryWords` words; empty for elements
   *  with no body. */
  summary: string;
}

/** A swimlane in the ProcessFlow chart — one role, the steps it owns. */
export interface FlowLane {
  /** Role id, or {@link UNASSIGNED_ROLE} for the catch-all lane. */
  roleId: string;
  /** Process-step ids in this lane, in flow order. */
  stepIds: string[];
}

/** Pre-built lane assignment for the process-step flow chart — what
 *  ProcessFlow needs to render swimlanes without doing the join itself. */
export interface FlowAssignment {
  lanes: FlowLane[];
  /** stepId → lane index (matches `lanes[]` order). */
  stepLane: Map<string, number>;
  /** stepId → role id that owns the lane (R role, A fallback, or
   *  {@link UNASSIGNED_ROLE}). */
  ownerOf: Map<string, string>;
}

export interface ContextOpts {
  /** 0 = element only; 1 = element + direct relations (default). */
  depth?: 0 | 1;
  /** Default false — provenance is dense and useless to the authoring LLM. */
  includeProvenance?: boolean;
  /** Default true — the focal element's body is included. */
  includeBody?: boolean;
  /** Word cap on each related element's summary. Default 30. */
  summaryWords?: number;
}

export interface ElementContext {
  /** The focal element. Body is stripped when `includeBody` is false. */
  element: WikiPage;
  /** Every directly-related element, grouped by relationship label.
   *  Keys include the schema relation labels (forward), reverse-relation
   *  labels, and — for process-steps — RACI levels and flow neighbours. */
  related: Record<string, ElementSummary[]>;
  meta: { slug: string; processTitle: string };
}

export interface ProcessView {
  /** Process slug — surfaced here so {@link contextFor} can include it in
   *  meta without re-passing the doc. */
  slug: string;
  /** Process title — surfaced here so {@link contextFor} can include it in
   *  meta without re-passing the doc. */
  processTitle: string;
  /** Lookup by id. */
  byId: Map<string, WikiPage>;
  /** Lookup by element type — values are in file (load) order. */
  byType: Map<string, WikiPage[]>;
  /** RACI grid: stepId → roleId → level. Pivoted from role.raci on load. */
  raciGrid: Map<string, Map<string, RaciLevel>>;
  /** Lane assignment over the as-is process-steps. For target-state flows
   *  (a reordered or synthesised step set), call {@link buildFlowLanes}
   *  directly with the alternate step list. */
  flow: FlowAssignment;
  /** Pre-built reverse index: every target id → relation label → ids of
   *  elements pointing at it. {@link contextFor} reads from this. */
  reverseGroups: Map<string, Map<string, string[]>>;
  /** Pre-built per-type relation specs — saves a schema lookup per call. */
  relationsByType: Map<string, RelationSpec[]>;
}

// Note: ProcessView is *pure data* — no methods. The view is attached to
// ProcessDoc (see src/lib/wiki.ts) and that doc crosses the React Server
// Components boundary into client components; Next.js refuses to serialise
// functions across that boundary. {@link contextFor} is exported as a free
// function over the view instead.

// ---- Helpers --------------------------------------------------------------

/** Trim a prose body to its leading N words. Strips bullet markers and joins
 *  multi-paragraph text so the result reads as one continuous sentence. */
function summarise(body: string, wordCap: number): string {
  if (!body) return "";
  // Strip leading "## Heading" lines and bullet markers; collapse whitespace.
  const flat = body
    .replace(/^##\s+.+$/gm, "")
    .replace(/^[\s\-*•]+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!flat) return "";
  const words = flat.split(" ");
  if (words.length <= wordCap) return flat;
  return words.slice(0, wordCap).join(" ") + "…";
}

function summaryOf(el: WikiPage, wordCap: number): ElementSummary {
  // Prefer the first prose block — that's the "what is this" paragraph;
  // falls back to the body for elements with no `## ` blocks (e.g. roles).
  const source = el.blocks[0]?.text ?? el.body;
  return {
    id: el.id,
    type: el.type,
    title: el.title,
    summary: summarise(source, wordCap),
  };
}

function asIds(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  return [String(value)];
}

/**
 * Pivot a roles list into a stepId → roleId → level grid.
 *
 * Exported so callers that synthesise their own role set (e.g. the
 * target-state flow, which augments each role's RACI to redirect at TS ids)
 * can produce a matching grid without duplicating the loop.
 */
export function buildRaciGrid(
  roles: WikiPage[],
): Map<string, Map<string, RaciLevel>> {
  const grid = new Map<string, Map<string, RaciLevel>>();
  for (const role of roles) {
    for (const entry of role.raci ?? []) {
      const row = grid.get(entry.step) ?? new Map<string, RaciLevel>();
      row.set(role.id, entry.level);
      grid.set(entry.step, row);
    }
  }
  return grid;
}

/**
 * Build a lane assignment for a step list — pure pivot over a raciGrid.
 *
 * Exported so the target-state flow can lane its own (reordered, recomposed)
 * step set against the same raciGrid the as-is uses, without duplicating
 * the assignment logic in the component.
 *
 *   • For each step, the owning role is its R role; falling back to A;
 *     falling back to {@link UNASSIGNED_ROLE}.
 *   • Lane order follows first-appearance along `sortedSteps` (sort the
 *     input via `orderSteps` before calling for the canonical spine order).
 *   • The UNASSIGNED lane is always last.
 */
export function buildFlowLanes(
  sortedSteps: WikiPage[],
  raciGrid: Map<string, Map<string, RaciLevel>>,
): FlowAssignment {
  const ownerOf = new Map<string, string>();
  for (const step of sortedSteps) {
    const row = raciGrid.get(step.id);
    let r: string | undefined;
    let a: string | undefined;
    if (row) {
      for (const [roleId, level] of row) {
        if (level === "R" && r === undefined) r = roleId;
        else if (level === "A" && a === undefined) a = roleId;
      }
    }
    ownerOf.set(step.id, r ?? a ?? UNASSIGNED_ROLE);
  }
  const laneRoleOrder: string[] = [];
  for (const step of sortedSteps) {
    const owner = ownerOf.get(step.id)!;
    if (!laneRoleOrder.includes(owner)) laneRoleOrder.push(owner);
  }
  const ui = laneRoleOrder.indexOf(UNASSIGNED_ROLE);
  if (ui >= 0 && ui !== laneRoleOrder.length - 1) {
    laneRoleOrder.splice(ui, 1);
    laneRoleOrder.push(UNASSIGNED_ROLE);
  }
  const lanes: FlowLane[] = laneRoleOrder.map((roleId) => ({
    roleId,
    stepIds: sortedSteps
      .filter((s) => ownerOf.get(s.id) === roleId)
      .map((s) => s.id),
  }));
  const stepLane = new Map<string, number>();
  laneRoleOrder.forEach((roleId, i) => {
    for (const stepId of lanes[i].stepIds) stepLane.set(stepId, i);
  });
  return { lanes, stepLane, ownerOf };
}

// ---- Builder --------------------------------------------------------------

export function buildProcessView(doc: ProcessDoc, schema: Schema): ProcessView {
  const byId = new Map<string, WikiPage>();
  const byType = new Map<string, WikiPage[]>();
  for (const el of doc.elements) {
    byId.set(el.id, el);
    const bucket = byType.get(el.type) ?? [];
    bucket.push(el);
    byType.set(el.type, bucket);
  }

  // ---- RACI grid: pivot role.raci entries into stepId → roleId → level.
  const raciGrid = buildRaciGrid(byType.get("role") ?? []);

  // ---- Flow lanes for the as-is steps. Target-state flows synthesize their
  // own step list and should call buildFlowLanes directly.
  const flow = buildFlowLanes(
    orderSteps(byType.get("process-step") ?? []),
    raciGrid,
  );

  // ---- Reverse-relation index: every element that points at X via a relation
  // with a `reverseLabel` produces, on X, a group under that label. Same shape
  // as buildRelations() in src/lib/relations.ts — kept separate here so the
  // view is self-contained and doesn't import a UI helper.
  const relationsByType = new Map<string, RelationSpec[]>();
  const relsOf = (type: string): RelationSpec[] => {
    if (relationsByType.has(type)) return relationsByType.get(type)!;
    const rels = schema.elementTypes[type]?.frontmatter?.relations ?? [];
    relationsByType.set(type, rels);
    return rels;
  };
  const reverseGroups = new Map<string, Map<string, string[]>>();
  for (const el of doc.elements) {
    for (const rel of relsOf(el.type)) {
      if (!rel.reverseLabel) continue;
      for (const targetId of asIds(el.meta[rel.key])) {
        const groups = reverseGroups.get(targetId) ?? new Map<string, string[]>();
        const ids = groups.get(rel.reverseLabel) ?? [];
        ids.push(el.id);
        groups.set(rel.reverseLabel, ids);
        reverseGroups.set(targetId, groups);
      }
    }
  }

  return {
    slug: doc.slug,
    processTitle: doc.process.title,
    byId,
    byType,
    raciGrid,
    flow,
    reverseGroups,
    relationsByType,
  };
}

/**
 * Assemble the LLM's view of one element from a ProcessView.
 *
 * Free function (not a method on the view) because ProcessView crosses the
 * React Server Components boundary into client components, and Next.js
 * refuses to serialise functions across that boundary. Callers that need a
 * context object call `contextFor(view, id)` on either side.
 *
 * Returns null when the id isn't in this process.
 */
export function contextFor(
  view: ProcessView,
  id: string,
  opts?: ContextOpts,
): ElementContext | null {
  const el = view.byId.get(id);
  if (!el) return null;
  const depth = opts?.depth ?? 1;
  const includeBody = opts?.includeBody ?? true;
  const includeProvenance = opts?.includeProvenance ?? false;
  const wordCap = opts?.summaryWords ?? 30;

  // Strip body and/or provenance per opts. We never mutate the original
  // WikiPage — the view must be safe to read concurrently.
  const focal: WikiPage = { ...el };
  if (!includeBody) {
    focal.body = "";
    focal.blocks = [];
  }
  if (!includeProvenance) delete focal.provenance;

  const related: Record<string, ElementSummary[]> = {};
  const addSummary = (label: string, target: WikiPage) => {
    (related[label] ??= []).push(summaryOf(target, wordCap));
  };

  if (depth >= 1) {
    // Forward relations declared by the schema for this element type.
    const rels = view.relationsByType.get(el.type) ?? [];
    for (const rel of rels) {
      for (const targetId of asIds(el.meta[rel.key])) {
        const target = view.byId.get(targetId);
        if (target) addSummary(rel.label, target);
      }
    }
    // Reverse relations — elements that point at this one.
    const reverse = view.reverseGroups.get(el.id);
    if (reverse) {
      for (const [label, ids] of reverse) {
        for (const targetId of ids) {
          const target = view.byId.get(targetId);
          if (target) addSummary(label, target);
        }
      }
    }
    // RACI: for steps, surface the assigned roles per level. For roles,
    // surface the steps they participate in. The label embeds the level
    // so the LLM sees R/A/C/I distinctly.
    if (el.type === "process-step") {
      const row = view.raciGrid.get(el.id);
      if (row) {
        for (const [roleId, level] of row) {
          const role = view.byId.get(roleId);
          if (role) addSummary(`RACI · ${level}`, role);
        }
      }
    } else if (el.type === "role") {
      for (const entry of el.raci ?? []) {
        const step = view.byId.get(entry.step);
        if (step) addSummary(`RACI · ${entry.level}`, step);
      }
    }
    // Flow neighbours for process-step — outgoing transitions resolved to
    // their target elements. Incoming edges fall out of `reverse` already.
    if (el.type === "process-step") {
      for (const t of transitionsOf(el)) {
        const target = view.byId.get(t.to);
        if (target) addSummary(`Transitions · ${t.kind}`, target);
      }
    }
  }

  return {
    element: focal,
    related,
    meta: { slug: view.slug, processTitle: view.processTitle },
  };
}
