// Pure core for the resumable-session cursors the AI uses:
//
//   - foundational-run walks the documented CURRENT-STATE elements one by one,
//     challenging each (cursor over element ids), and
//   - qer-session walks a FIXED step sequence (cursor over step names).
//
// Both cursors are the same `ReviewState` shape (a queue + a cursor index). The
// state is RUNTIME / orchestration — it lives in the runtime store
// (data/runtime/<slug>.json via runtime-store.ts), never in the wiki JSON
// (Karpathy guardrail). This module has no I/O: the providers read the runtime,
// call these, and write it back.
//
// Verification note: the exact queue ORDER (below) and the QER step GRANULARITY
// are read from the skill prose (foundational-run / qer-session SKILL.md) and
// cannot be checked against a live run here — they are encoded as plain
// constants so they are trivial to adjust if the skills say otherwise.

import type { ReviewState } from "./wiki.ts";

/**
 * The fixed wording foundational-run reads to the SME for each element's
 * outcome — kept here as the single source of truth so the skill cannot drift
 * it (it reproduces this character-for-character).
 */
export const FOUNDATIONAL_OUTCOMES_LINE =
  "**[Y] Yes — accept** · **[E] Edit — I have corrections** · **[D] Deep dive — full elicitation** · **Move on — defer approval**";

/**
 * The canonical foundational-run close-out. `{…}` placeholders are filled by
 * the skill (counts it tallies); every fixed word is reproduced verbatim.
 */
export const FOUNDATIONAL_CLOSEOUT_TEMPLATE = [
  "Process Analyst perspective documented — **{process}**:",
  "",
  "- **Documented:** {n} element(s)",
  "- **By type:** {type} {n} · {type} {n} · …",
  "",
  "Elements you approved during this session are signed off; any left `in-progress` are yours to review and approve on their cards in the app. Approval is always your decision there.",
].join("\n");

/**
 * Foundational-run walks current-state elements only — forward-looking and
 * target-state sections are excluded. The queue is the overview first, then
 * these collections in order, with the process-gap tail last (per the skill).
 * Sections absent from the doc are simply skipped.
 */
export const FOUNDATIONAL_QUEUE_SECTIONS: string[] = [
  "process-steps",
  "roles",
  "exceptions",
  "controls",
  "regulation",
  "control-gaps",
  "audit-findings",
  "pain-points",
  "friction-points",
  "channels",
  "touchpoints",
  "moments",
  "systems",
  "integrations",
  "metrics",
  "country-variations",
  // process-gaps come last — see FOUNDATIONAL_GAP_SECTIONS.
];

/** The gap tail of the foundational queue — appended after every other section. */
export const FOUNDATIONAL_GAP_SECTIONS: string[] = ["process-gaps"];

/**
 * The qer-session step sequence — the `## Step N` headers the cursor steps
 * through. SELECT (Step 1) is where the session is set up / the cursor built,
 * so the cursor's first stop is OVERVIEW. PERSPECTIVE PASSES is one cursor stop
 * (the six specialists are dispatched within it).
 */
export const QER_STEPS: string[] = [
  "OVERVIEW",
  "PERSPECTIVE PASSES",
  "CROSS-PERSPECTIVE REVIEW",
  "VALIDATION",
  "DONE",
];

/**
 * The QER perspective registry — the six specialists the PERSPECTIVE PASSES
 * step dispatches, in cursor order, each with the collections it owns. This is
 * the single source of truth the qer-session skill's Step 3 reads from, so the
 * cursor (not the model) decides which perspectives exist, which are built, and
 * which are documented. Target Process runs last (it synthesises the others).
 */
export interface QerPerspective {
  key: string;
  label: string;
  skill: string;
  sections: string[];
}

export const QER_PERSPECTIVES: QerPerspective[] = [
  { key: "process", label: "Process", skill: "process-specialist",
    sections: ["process-steps", "exceptions", "pain-points", "process-gaps", "roles", "metrics"] },
  { key: "control-compliance", label: "Control & Compliance", skill: "control-compliance-specialist",
    sections: ["controls", "regulation", "control-gaps", "audit-findings"] },
  { key: "client-journey", label: "Client Journey", skill: "client-journey-specialist",
    sections: ["channels", "touchpoints", "moments", "friction-points", "competitor-cx", "cx-benchmarks"] },
  { key: "innovation", label: "Innovation", skill: "innovation-analyst",
    sections: ["market-trends", "competitor-innovation", "innovation-ideas", "innovation-risks"] },
  { key: "it-architecture", label: "IT Architecture", skill: "solution-architect",
    sections: ["systems", "integrations"] },
  { key: "target-process", label: "Target Process", skill: "transformation-agent",
    sections: ["to-be-design", "transformation-decisions", "gap-resolution"] },
];

/** The canonical QER close-out. `{…}` placeholders are filled deterministically by `renderQerCloseout`; every fixed word is reproduced verbatim. */
export const QER_CLOSEOUT_TEMPLATE = [
  "QER session complete — **{process}**:",
  "",
  "- **Documented:** {n} element(s) across {p} perspective(s)",
  "- **By type:** {byType}",
  "",
  "Elements you approved during this session are signed off; any left `in-progress` are yours to review and approve in the web app. Approval is your decision there, not mine here.",
].join("\n");

export interface PerspectiveStatus extends QerPerspective {
  /** Whether the specialist skill is installed (deterministic, injected). */
  skillBuilt: boolean;
  /** Whether the process has at least one element in this perspective. */
  documented: boolean;
  /** Element count across this perspective's collections. */
  count: number;
}

function sectionCount(doc: any, sections: string[]): number {
  let n = 0;
  for (const s of sections) {
    const list = doc?.[s];
    if (Array.isArray(list)) n += list.length;
  }
  return n;
}

/**
 * The deterministic per-perspective map for the PERSPECTIVE PASSES step.
 * `skillBuilt` is injected (callers check which specialist skill dirs exist) so
 * this module stays I/O-free.
 */
export function qerPerspectiveStatus(
  doc: any,
  skillBuilt: (skill: string) => boolean,
): PerspectiveStatus[] {
  return QER_PERSPECTIVES.map((p) => {
    const count = sectionCount(doc, p.sections);
    return { ...p, skillBuilt: skillBuilt(p.skill), documented: count > 0, count };
  });
}

/** Count of perspectives with at least one documented element. */
export function documentedPerspectiveCount(perspectives: PerspectiveStatus[]): number {
  return perspectives.filter((p) => p.documented).length;
}

/**
 * The next perspective to actually work: the first one that is BUILT but not
 * yet DOCUMENTED (in registry order). This is doc-driven — as each perspective's
 * elements are written it becomes `documented`, so the next call advances —
 * meaning the model never spends a turn on an unbuilt perspective and never
 * re-runs a completed one. Null when every built perspective is documented.
 */
export function nextBuiltPerspective(
  perspectives: PerspectiveStatus[],
): PerspectiveStatus | null {
  return perspectives.find((p) => p.skillBuilt && !p.documented) ?? null;
}

/** Fill the QER close-out from the doc — counts by perspective element type. */
export function renderQerCloseout(doc: any): string {
  const title = doc?.content?.title || doc?.meta?.title || doc?.meta?.id || "the process";
  let total = 0;
  const byTypeParts: string[] = [];
  let documentedPerspectives = 0;
  for (const p of QER_PERSPECTIVES) {
    const n = sectionCount(doc, p.sections);
    if (n > 0) {
      documentedPerspectives += 1;
      byTypeParts.push(`${p.label} ${n}`);
      total += n;
    }
  }
  const byType = byTypeParts.length ? byTypeParts.join(" · ") : "none yet";
  return QER_CLOSEOUT_TEMPLATE
    .replace("{process}", String(title))
    .replace("{n}", String(total))
    .replace("{p}", String(documentedPerspectives))
    .replace("{byType}", byType);
}

/** Build the foundational-run queue of element ids for a doc. */
export function buildFoundationalQueue(doc: any): string[] {
  const ids: string[] = [];
  const overviewId = doc?.meta?.id;
  if (typeof overviewId === "string" && overviewId) ids.push(overviewId);

  const collect = (section: string) => {
    const list = doc?.[section];
    if (!Array.isArray(list)) return;
    for (const el of list) {
      const id = el?.meta?.id;
      if (typeof id === "string" && id) ids.push(id);
    }
  };
  for (const section of FOUNDATIONAL_QUEUE_SECTIONS) collect(section);
  for (const section of FOUNDATIONAL_GAP_SECTIONS) collect(section);
  return ids;
}

/** Create a fresh cursor state over a queue (cursor at 0, not done). */
export function newReviewState(
  slug: string,
  queue: string[],
  now: string,
  actor?: { name?: string; role?: string },
): ReviewState {
  return {
    slug,
    queue,
    cursor: 0,
    total: queue.length,
    done: queue.length === 0,
    startedAt: now,
    updatedAt: now,
    ...(actor && (actor.name || actor.role) ? { actor } : {}),
  };
}

/**
 * Advance the cursor by one. When it moves past the last item the run is
 * `done` and the cursor is clamped to `total`. Returns a new state (does not
 * mutate the input).
 */
export function advance(state: ReviewState, now: string): ReviewState {
  const cursor = Math.min(state.cursor + 1, state.total);
  return { ...state, cursor, done: cursor >= state.total, updatedAt: now };
}

export interface StatusView {
  exists: boolean;
  position?: number;
  total?: number;
  done?: boolean;
  /** The id (foundational) or step name (qer) to work now — absent once done. */
  current?: string | null;
  outcomes_line?: string;
  closeout_template?: string;
  // ---- QER perspective view (only populated on the PERSPECTIVE PASSES step) ----
  /** Per-perspective build + documented status, in dispatch order. */
  perspectives?: PerspectiveStatus[];
  /** The next BUILT perspective to dispatch (skips unbuilt ones). */
  nextBuiltPerspective?: PerspectiveStatus | null;
  /** Count of perspectives with at least one documented element. */
  documentedPerspectives?: number;
  /** Cross-review needs ≥2 documented perspectives — a counted fact, not a judgement. */
  crossReviewEligible?: boolean;
  // ---- QER close-out (only populated once done) ----
  /** The fully-rendered QER close-out (counts filled) to relay verbatim. */
  closeout?: string;
  /** The SME running the session, carried on the cursor (QER) — present on resume. */
  actor?: { name?: string; role?: string };
  // ---- foundational-run enrichment (see foundational.ts) ----
  /** When the current item is a process-step: does any control link to it? */
  currentHasControl?: boolean;
  /** Process-step ids with no control linked — the control-coverage probe targets. */
  uncoveredSteps?: string[];
  /** When the current item is in the process-gap tail: the remaining gap ids to batch. */
  gapTail?: { ids: string[] };
  /** Close-out counts by section (non-empty), populated once done. */
  closeoutCounts?: { section: string; count: number }[];
  /** Close-out element total, populated once done. */
  closeoutTotal?: number;
  /** Empty sections mapped to their filling skill/✦ button, populated once done. */
  stillToDocument?: { section: string; label: string; action: string }[];
}

/**
 * Assemble the QER status with the deterministic perspective view merged in.
 * `skillBuilt` is injected by the caller (which checks the filesystem). On the
 * PERSPECTIVE PASSES step it adds the perspective map + next-built + counts; on
 * the DONE step it adds the rendered close-out.
 */
export function qerStatusWithPerspectives(
  state: ReviewState | undefined,
  doc: any,
  skillBuilt: (skill: string) => boolean,
): StatusView {
  const view = qerStatus(state);
  if (!view.exists) return view;
  if (view.done) {
    view.closeout = renderQerCloseout(doc);
    return view;
  }
  // The deterministic perspective map is cheap and useful from SELECT onward
  // (pre-flight skill-built map, cross-review eligibility), so populate it on
  // every non-done step rather than only during PERSPECTIVE PASSES.
  const perspectives = qerPerspectiveStatus(doc, skillBuilt);
  view.perspectives = perspectives;
  view.documentedPerspectives = documentedPerspectiveCount(perspectives);
  view.crossReviewEligible = view.documentedPerspectives >= 2;
  view.nextBuiltPerspective = nextBuiltPerspective(perspectives);
  return view;
}

/** Status for the foundational cursor — adds the canonical outcome/close-out text. */
export function foundationalStatus(state: ReviewState | undefined): StatusView {
  if (!state) return { exists: false };
  const done = state.done || state.cursor >= state.total;
  const current = done ? null : state.queue[state.cursor] ?? null;
  return {
    exists: true,
    position: Math.min(state.cursor + 1, state.total),
    total: state.total,
    done,
    current,
    ...(done
      ? { closeout_template: FOUNDATIONAL_CLOSEOUT_TEMPLATE }
      : { outcomes_line: FOUNDATIONAL_OUTCOMES_LINE }),
  };
}

/** Status for the qer cursor — the current step name, no element-specific text. */
export function qerStatus(state: ReviewState | undefined): StatusView {
  if (!state) return { exists: false };
  const done = state.done || state.cursor >= state.total;
  const current = done ? null : state.queue[state.cursor] ?? null;
  return {
    exists: true,
    position: Math.min(state.cursor + 1, state.total),
    total: state.total,
    done,
    current,
    ...(state.actor ? { actor: state.actor } : {}),
  };
}
