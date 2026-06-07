// Deterministic relation / coverage / orphan facts several specialists derive by
// hand today. One read-only computation the specialists can look up instead of
// re-deriving from the document each run:
//
//   - Process Specialist: orphans + per-step coverage,
//   - Control & Compliance: step→control coverage, orphan regulations,
//   - Client Journey: per-step touchpoint coverage,
//   - IT Architect: step↔system coverage, integration candidates, orphan systems.
//
// Pure / I/O-free: callers pass the parsed process doc. Relation directions
// (verified against the live schema):
//   step.content.systems = [SYS ids]          control.content.step = step id
//   control.content.regulatedBy = [REG ids]   integration.content.systems = [SYS,SYS]
//   touchpoint.content.occursAt = step id

function ids(list: any): string[] {
  return Array.isArray(list)
    ? list.map((e) => e?.meta?.id).filter((x): x is string => typeof x === "string" && !!x)
    : [];
}

function asArray(v: any): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string");
  if (typeof v === "string" && v) return [v];
  return [];
}

/** A sorted, deduped pair key so {A,B} and {B,A} compare equal. */
function pairKey(a: string, b: string): string {
  return a < b ? `${a}::${b}` : `${b}::${a}`;
}

export interface StepRelations {
  id: string;
  title: string;
  systems: string[];
  controls: string[];
  touchpoints: string[];
  hasControl: boolean;
  hasSystem: boolean;
}

export interface IntegrationCandidate {
  systems: [string, string];
  viaSteps: string[];
}

export interface ProcessRelations {
  steps: StepRelations[];
  orphans: {
    /** systems referenced by no process-step */
    systems: string[];
    /** controls whose `step` is missing or not a real step */
    controls: string[];
    /** regulations referenced by no control's `regulatedBy` */
    regulations: string[];
  };
  /** system pairs that co-occur on a step but have no integration linking them */
  integrationCandidates: IntegrationCandidate[];
  uncovered: {
    stepsWithoutControl: string[];
    stepsWithoutSystem: string[];
  };
}

export function buildProcessRelations(doc: any): ProcessRelations {
  const steps = Array.isArray(doc?.["process-steps"]) ? doc["process-steps"] : [];
  const controls = Array.isArray(doc?.controls) ? doc.controls : [];
  const touchpoints = Array.isArray(doc?.touchpoints) ? doc.touchpoints : [];
  const integrations = Array.isArray(doc?.integrations) ? doc.integrations : [];

  const stepIds = new Set(ids(steps));
  const systemIds = new Set(ids(doc?.systems));
  const regulationIds = new Set(ids(doc?.regulation));

  // step id → controls that point at it
  const controlsByStep = new Map<string, string[]>();
  const orphanControls: string[] = [];
  const referencedRegs = new Set<string>();
  for (const c of controls) {
    const cid = c?.meta?.id;
    const step = c?.content?.step;
    for (const r of asArray(c?.content?.regulatedBy)) referencedRegs.add(r);
    if (typeof step === "string" && stepIds.has(step)) {
      const arr = controlsByStep.get(step) ?? [];
      if (cid) arr.push(cid);
      controlsByStep.set(step, arr);
    } else if (cid) {
      orphanControls.push(cid);
    }
  }

  // step id → touchpoints that occur at it
  const touchpointsByStep = new Map<string, string[]>();
  for (const t of touchpoints) {
    const tid = t?.meta?.id;
    for (const step of asArray(t?.content?.occursAt)) {
      if (!stepIds.has(step)) continue;
      const arr = touchpointsByStep.get(step) ?? [];
      if (tid) arr.push(tid);
      touchpointsByStep.set(step, arr);
    }
  }

  // systems actually referenced by a step
  const referencedSystems = new Set<string>();
  const stepRows: StepRelations[] = [];
  for (const s of steps) {
    const id = s?.meta?.id;
    if (typeof id !== "string") continue;
    const sys = asArray(s?.content?.systems).filter((x) => systemIds.has(x));
    for (const x of sys) referencedSystems.add(x);
    const ctrls = controlsByStep.get(id) ?? [];
    const tps = touchpointsByStep.get(id) ?? [];
    stepRows.push({
      id,
      title: s?.content?.title ?? "",
      systems: sys,
      controls: ctrls,
      touchpoints: tps,
      hasControl: ctrls.length > 0,
      hasSystem: sys.length > 0,
    });
  }

  // existing integration pairs (every pair within each integration's systems)
  const existingPairs = new Set<string>();
  for (const i of integrations) {
    const sys = asArray(i?.content?.systems).filter((x) => systemIds.has(x));
    for (let a = 0; a < sys.length; a++)
      for (let b = a + 1; b < sys.length; b++) existingPairs.add(pairKey(sys[a], sys[b]));
  }

  // candidate integrations: system pairs co-occurring on a step, not already linked
  const candByPair = new Map<string, IntegrationCandidate>();
  for (const row of stepRows) {
    const sys = row.systems;
    for (let a = 0; a < sys.length; a++) {
      for (let b = a + 1; b < sys.length; b++) {
        const key = pairKey(sys[a], sys[b]);
        if (existingPairs.has(key)) continue;
        const cur = candByPair.get(key);
        if (cur) cur.viaSteps.push(row.id);
        else candByPair.set(key, { systems: [sys[a], sys[b]] as [string, string], viaSteps: [row.id] });
      }
    }
  }

  return {
    steps: stepRows,
    orphans: {
      systems: [...systemIds].filter((id) => !referencedSystems.has(id)),
      controls: orphanControls,
      regulations: [...regulationIds].filter((id) => !referencedRegs.has(id)),
    },
    integrationCandidates: [...candByPair.values()],
    uncovered: {
      stepsWithoutControl: stepRows.filter((r) => !r.hasControl).map((r) => r.id),
      stepsWithoutSystem: stepRows.filter((r) => !r.hasSystem).map((r) => r.id),
    },
  };
}
