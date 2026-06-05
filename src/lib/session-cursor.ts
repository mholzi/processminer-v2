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
): ReviewState {
  return {
    slug,
    queue,
    cursor: 0,
    total: queue.length,
    done: queue.length === 0,
    startedAt: now,
    updatedAt: now,
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
  };
}
