// Build a target-state view of the process flow from the As-Is steps and the
// `target-state` (TS) elements. The to-be flow shares the As-Is spine — TS
// elements declare which PS they `replaces`, and unreplaced PS steps simply
// carry over. We synthesise a step-shaped WikiPage per slot so the existing
// ProcessFlow component renders the target flow with no logic changes.
//
// Transitions on the synthesised TS inherit from the replaced PS's transitions,
// with PS-id targets remapped to the TS-id that replaces them (so arrows
// land on the target step, not its retired PS).
//
// RACI on each role is augmented: every PS-id RACI entry is also written as
// a TS-id entry at the same level (R/A/C/I), so the existing ownerOf() lookup
// places the TS in the lane the PS would have been in.

import type { RaciEntry, Transition, WikiPage } from "./wiki";

function asList(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export interface TargetFlowView {
  /** Synthesised step list — TS where one replaces a PS, else the PS itself. */
  steps: WikiPage[];
  /** Roles with RACI augmented so TS ids inherit their replaced PS's lane. */
  roles: WikiPage[];
}

export function buildTargetFlowView(
  asIsSteps: WikiPage[],
  targetStates: WikiPage[],
  roles: WikiPage[],
): TargetFlowView {
  // Map each PS-id → the first TS that replaces it. A TS may list multiple
  // replacements; we record the TS against each PS it lists.
  const psToTs = new Map<string, WikiPage>();
  for (const ts of targetStates) {
    for (const psId of asList(ts.meta.replaces as string | string[] | undefined)) {
      if (!psToTs.has(psId)) psToTs.set(psId, ts);
    }
  }

  if (psToTs.size === 0) {
    // No target-state replacements yet — nothing to show that isn't already
    // the As-Is flow. Caller decides whether to render.
    return { steps: [], roles };
  }

  // Remap a transition target id: PS → TS if a replacement exists, else as-is.
  function remapTransition(t: Transition): Transition {
    const replacement = psToTs.get(t.to);
    return replacement ? { ...t, to: replacement.id } : t;
  }

  // Synthesise each step slot: TS if one replaces this PS, else PS unchanged.
  const steps: WikiPage[] = asIsSteps.map((ps) => {
    const ts = psToTs.get(ps.id);
    if (!ts) return ps;
    const remapped = (ps.transitions ?? []).map(remapTransition);
    // Synthesised step keeps the TS body and title but inherits the PS's
    // transitions (remapped to TS ids). We do NOT mutate the TS element —
    // it stays untouched on disk; this is a render-time projection only.
    return {
      ...ts,
      transitions: remapped,
      meta: {
        ...ts.meta,
        // Mark synthesised origin so the flow can opt into styling later
        // ("new target step" etc.) without re-deriving.
        __originPS: ps.id,
      },
    };
  });

  // RACI augmentation: for each role's RACI entry, when the step is a PS that
  // has a TS replacement, also emit a TS-id entry at the same level. We do
  // NOT mutate the role's bundle data on disk; this is a render-time
  // projection only — the synthesised role overrides .raci in memory.
  const augmentedRoles: WikiPage[] = roles.map((role) => {
    const existing = role.raci ?? [];
    const extras: RaciEntry[] = [];
    for (const entry of existing) {
      const ts = psToTs.get(entry.step);
      if (ts) extras.push({ step: ts.id, level: entry.level });
    }
    if (extras.length === 0) return role;
    return { ...role, raci: [...existing, ...extras] };
  });

  return { steps, roles: augmentedRoles };
}
