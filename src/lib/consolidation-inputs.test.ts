import { test } from "node:test";
import assert from "node:assert/strict";
import { buildConsolidationInputs } from "./consolidation-inputs.ts";

const DOC = {
  meta: { id: "COB-003" },
  "process-steps": [{ meta: { id: "PS-1" } }],
  "pain-points": [{ meta: { id: "PP-1" } }, { meta: { id: "PP-2" } }],
  "process-gaps": [{ meta: { id: "PG-1" } }],
  "control-gaps": [{ meta: { id: "CG-1" } }],
  "friction-points": [{ meta: { id: "FP-1" } }],
  "audit-findings": [{ meta: { id: "AF-1" } }, { meta: { id: "AF-2" } }],
  "innovation-ideas": [{ meta: { id: "II-1" } }, { meta: { id: "II-2" } }, { meta: { id: "II-3" } }],
  systems: [{ meta: { id: "SYS-1" } }],
  integrations: [{ meta: { id: "INT-1" } }],
  "to-be-design": [{ meta: { id: "TS-1" } }], // already-populated target
};

test("openProblems: every problem class + the union 'all'", () => {
  const c = buildConsolidationInputs(DOC);
  assert.deepEqual(c.openProblems.painPoints, ["PP-1", "PP-2"]);
  assert.deepEqual(c.openProblems.processGaps, ["PG-1"]);
  assert.deepEqual(c.openProblems.complianceGaps, ["CG-1"]); // from control-gaps
  assert.deepEqual(c.openProblems.frictionPoints, ["FP-1"]);
  assert.deepEqual(c.openProblems.auditFindings, ["AF-1", "AF-2"]);
  assert.equal(c.openProblems.all.length, 2 + 1 + 1 + 1 + 2); // 7 open problems
});

test("tallies match the report's 'consolidated from' line", () => {
  const c = buildConsolidationInputs(DOC);
  assert.equal(c.tallies.painProcessGaps, 3); // 2 pain + 1 process gap
  assert.equal(c.tallies.complianceGapsAuditFindings, 3); // 1 control-gap + 2 audit
  assert.equal(c.tallies.frictionPoints, 1);
  assert.equal(c.tallies.innovationIdeas, 3);
});

test("existingTarget surfaces what's already there (extend, not duplicate)", () => {
  const c = buildConsolidationInputs(DOC);
  assert.deepEqual(c.existingTarget.toBeDesign, ["TS-1"]);
  assert.deepEqual(c.existingTarget.transformationDecisions, []);
});

test("emptyPerspectives flags a thin process", () => {
  const thin = { meta: { id: "X" }, "process-steps": [{ meta: { id: "PS-1" } }] };
  const c = buildConsolidationInputs(thin);
  // no controls/gaps/findings, no friction/touchpoints, no ideas, no systems
  assert.ok(c.emptyPerspectives.includes("Risk & Compliance"));
  assert.ok(c.emptyPerspectives.includes("Client Experience"));
  assert.ok(c.emptyPerspectives.includes("Innovation"));
  assert.ok(c.emptyPerspectives.includes("IT Architecture"));
  assert.ok(!c.emptyPerspectives.includes("As-Is process"));
});

test("empty doc doesn't throw and reports all perspectives empty", () => {
  const c = buildConsolidationInputs({ meta: { id: "X" } });
  assert.deepEqual(c.openProblems.all, []);
  assert.equal(c.tallies.innovationIdeas, 0);
  assert.ok(c.emptyPerspectives.includes("As-Is process"));
});
