import { test } from "node:test";
import assert from "node:assert/strict";
import { buildProcessRelations } from "./process-relations.ts";

const DOC = {
  meta: { id: "COB-003" },
  "process-steps": [
    { meta: { id: "PS-1" }, content: { title: "Intake", systems: ["SYS-1", "SYS-2"] } },
    { meta: { id: "PS-2" }, content: { title: "KYC", systems: ["SYS-2"] } },
    { meta: { id: "PS-3" }, content: { title: "Approve" } }, // no systems, no control
  ],
  systems: [{ meta: { id: "SYS-1" } }, { meta: { id: "SYS-2" } }, { meta: { id: "SYS-3" } }],
  controls: [
    { meta: { id: "CP-1" }, content: { step: "PS-2", regulatedBy: ["REG-1"] } },
    { meta: { id: "CP-ORPH" }, content: { step: "PS-999" } }, // dangling step → orphan
  ],
  regulation: [{ meta: { id: "REG-1" } }, { meta: { id: "REG-2" } }],
  touchpoints: [
    { meta: { id: "JT-1" }, content: { occursAt: "PS-1" } },
    { meta: { id: "JT-2" }, content: { occursAt: "PS-1" } },
  ],
  integrations: [{ meta: { id: "INT-1" }, content: { systems: ["SYS-1", "SYS-2"] } }],
};

test("per-step coverage: systems, controls, touchpoints + flags", () => {
  const r = buildProcessRelations(DOC);
  const byId = Object.fromEntries(r.steps.map((s) => [s.id, s]));
  assert.deepEqual(byId["PS-1"].systems, ["SYS-1", "SYS-2"]);
  assert.deepEqual(byId["PS-1"].touchpoints.sort(), ["JT-1", "JT-2"]);
  assert.equal(byId["PS-1"].hasControl, false);
  assert.equal(byId["PS-2"].hasControl, true); // CP-1 → PS-2
  assert.deepEqual(byId["PS-2"].controls, ["CP-1"]);
  assert.equal(byId["PS-3"].hasSystem, false);
});

test("orphans: unreferenced systems, dangling-step controls, unreferenced regulations", () => {
  const r = buildProcessRelations(DOC);
  assert.deepEqual(r.orphans.systems, ["SYS-3"]); // in no step
  assert.deepEqual(r.orphans.controls, ["CP-ORPH"]); // step PS-999 doesn't exist
  assert.deepEqual(r.orphans.regulations, ["REG-2"]); // no control regulatedBy it
});

test("integration candidates: co-occurring system pair without an integration", () => {
  // PS-1 has SYS-1+SYS-2 but that pair IS already an integration (INT-1) → not a candidate.
  const r = buildProcessRelations(DOC);
  assert.deepEqual(r.integrationCandidates, []);

  // Add a step pairing SYS-2+SYS-3 with no integration → candidate.
  const doc2 = JSON.parse(JSON.stringify(DOC));
  doc2["process-steps"].push({ meta: { id: "PS-4" }, content: { title: "X", systems: ["SYS-2", "SYS-3"] } });
  const r2 = buildProcessRelations(doc2);
  assert.equal(r2.integrationCandidates.length, 1);
  assert.deepEqual(r2.integrationCandidates[0].systems.sort(), ["SYS-2", "SYS-3"]);
  assert.deepEqual(r2.integrationCandidates[0].viaSteps, ["PS-4"]);
});

test("uncovered: steps without a control / without a system", () => {
  const r = buildProcessRelations(DOC);
  assert.deepEqual(r.uncovered.stepsWithoutControl.sort(), ["PS-1", "PS-3"]);
  assert.deepEqual(r.uncovered.stepsWithoutSystem, ["PS-3"]);
});

test("empty / missing collections don't throw", () => {
  const r = buildProcessRelations({ meta: { id: "X" } });
  assert.deepEqual(r.steps, []);
  assert.deepEqual(r.orphans.systems, []);
  assert.deepEqual(r.integrationCandidates, []);
});
