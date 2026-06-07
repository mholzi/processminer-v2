// Deterministic consolidation inputs for the synthesis skills. source-target
// must resolve EVERY open As-Is problem (a decision resolves it, or it becomes a
// gap) and report accurate "consolidated from" tallies; source-innovation must
// ground every idea in a real documented problem. Both re-walked the document by
// hand and tallied from memory — error-prone. This computes the open-problem
// inventory, the input tallies, the idea/system lists, and the existing target
// (extend-not-duplicate) once, so the model is handed the ids instead of
// re-deriving them.
//
// Pure / I/O-free: callers pass the parsed process doc.

function ids(doc: any, section: string): string[] {
  const list = doc?.[section];
  return Array.isArray(list)
    ? list.map((e) => e?.meta?.id).filter((x): x is string => typeof x === "string" && !!x)
    : [];
}

export interface ConsolidationInputs {
  /** The open As-Is problems the target must resolve (a decision must resolve each, else it is a gap). */
  openProblems: {
    painPoints: string[];
    processGaps: string[];
    complianceGaps: string[]; // the `control-gaps` collection
    frictionPoints: string[];
    auditFindings: string[];
    /** Union of every open problem id — the model must cover all of these. */
    all: string[];
  };
  /** Raw material for target-states / innovation grounding. */
  innovationIdeas: string[];
  /** For dependency seeds + capability assumptions. */
  systems: string[];
  integrations: string[];
  /** What the Target Process area already holds — extend, never duplicate. */
  existingTarget: {
    toBeDesign: string[];
    transformationDecisions: string[];
    gapResolution: string[];
  };
  /** The report's "Consolidated from" tallies (counted, not from memory). */
  tallies: {
    painProcessGaps: number;
    complianceGapsAuditFindings: number;
    frictionPoints: number;
    innovationIdeas: number;
  };
  /** Perspectives that are empty — so the report can flag a thin consolidation. */
  emptyPerspectives: string[];
}

export function buildConsolidationInputs(doc: any): ConsolidationInputs {
  const painPoints = ids(doc, "pain-points");
  const processGaps = ids(doc, "process-gaps");
  const complianceGaps = ids(doc, "control-gaps");
  const frictionPoints = ids(doc, "friction-points");
  const auditFindings = ids(doc, "audit-findings");
  const innovationIdeas = ids(doc, "innovation-ideas");
  const systems = ids(doc, "systems");
  const integrations = ids(doc, "integrations");

  const all = [
    ...painPoints,
    ...processGaps,
    ...complianceGaps,
    ...frictionPoints,
    ...auditFindings,
  ];

  const emptyPerspectives: string[] = [];
  if (ids(doc, "process-steps").length === 0) emptyPerspectives.push("As-Is process");
  if (complianceGaps.length + auditFindings.length + ids(doc, "controls").length === 0)
    emptyPerspectives.push("Risk & Compliance");
  if (frictionPoints.length + ids(doc, "touchpoints").length === 0)
    emptyPerspectives.push("Client Experience");
  if (innovationIdeas.length === 0) emptyPerspectives.push("Innovation");
  if (systems.length === 0) emptyPerspectives.push("IT Architecture");

  return {
    openProblems: { painPoints, processGaps, complianceGaps, frictionPoints, auditFindings, all },
    innovationIdeas,
    systems,
    integrations,
    existingTarget: {
      toBeDesign: ids(doc, "to-be-design"),
      transformationDecisions: ids(doc, "transformation-decisions"),
      gapResolution: ids(doc, "gap-resolution"),
    },
    tallies: {
      painProcessGaps: painPoints.length + processGaps.length,
      complianceGapsAuditFindings: complianceGaps.length + auditFindings.length,
      frictionPoints: frictionPoints.length,
      innovationIdeas: innovationIdeas.length,
    },
    emptyPerspectives,
  };
}
