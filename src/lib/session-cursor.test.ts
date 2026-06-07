import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildFoundationalQueue,
  newReviewState,
  advance,
  foundationalStatus,
  qerStatus,
  qerStatusWithPerspectives,
  qerPerspectiveStatus,
  documentedPerspectiveCount,
  nextBuiltPerspective,
  renderQerCloseout,
  QER_STEPS,
  QER_PERSPECTIVES,
  FOUNDATIONAL_OUTCOMES_LINE,
  FOUNDATIONAL_CLOSEOUT_TEMPLATE,
} from "./session-cursor.ts";

const DOC = {
  meta: { id: "COB-003" },
  "process-steps": [
    { meta: { id: "PS-COB-002" } },
    { meta: { id: "PS-COB-001" } },
  ],
  roles: [{ meta: { id: "ROLE-COB-001" } }],
  "process-gaps": [{ meta: { id: "PG-COB-001" } }],
  // forward-looking — must be excluded:
  "market-trends": [{ meta: { id: "MT-COB-001" } }],
  "to-be-design": [{ meta: { id: "TS-COB-001" } }],
};

test("buildFoundationalQueue: overview first, gaps last, forward-looking excluded", () => {
  const q = buildFoundationalQueue(DOC);
  assert.deepEqual(q, [
    "COB-003", // overview root id first
    "PS-COB-002",
    "PS-COB-001", // preserves array order within a section
    "ROLE-COB-001",
    "PG-COB-001", // process-gap tail last
  ]);
  // forward-looking sections never enter the queue
  assert.equal(q.includes("MT-COB-001"), false);
  assert.equal(q.includes("TS-COB-001"), false);
});

test("newReviewState: starts at cursor 0 over the queue", () => {
  const rs = newReviewState("cob-003", ["a", "b", "c"], "T0");
  assert.equal(rs.cursor, 0);
  assert.equal(rs.total, 3);
  assert.equal(rs.done, false);
  assert.equal(rs.startedAt, "T0");
});

test("newReviewState: an empty queue is immediately done", () => {
  const rs = newReviewState("cob-003", [], "T0");
  assert.equal(rs.done, true);
});

test("advance: moves the cursor and flips done at the end", () => {
  let rs = newReviewState("cob-003", ["a", "b"], "T0");
  rs = advance(rs, "T1");
  assert.equal(rs.cursor, 1);
  assert.equal(rs.done, false);
  assert.equal(rs.updatedAt, "T1");
  rs = advance(rs, "T2");
  assert.equal(rs.cursor, 2);
  assert.equal(rs.done, true);
  // advancing past the end stays clamped + done
  rs = advance(rs, "T3");
  assert.equal(rs.cursor, 2);
  assert.equal(rs.done, true);
});

test("foundationalStatus: reports current + outcomes_line while running", () => {
  const rs = newReviewState("cob-003", ["a", "b"], "T0");
  const v = foundationalStatus(rs);
  assert.equal(v.exists, true);
  assert.equal(v.position, 1);
  assert.equal(v.total, 2);
  assert.equal(v.done, false);
  assert.equal(v.current, "a");
  assert.equal(v.outcomes_line, FOUNDATIONAL_OUTCOMES_LINE);
  assert.equal(v.closeout_template, undefined);
});

test("foundationalStatus: reports closeout_template + null current once done", () => {
  let rs = newReviewState("cob-003", ["a"], "T0");
  rs = advance(rs, "T1");
  const v = foundationalStatus(rs);
  assert.equal(v.done, true);
  assert.equal(v.current, null);
  assert.equal(v.closeout_template, FOUNDATIONAL_CLOSEOUT_TEMPLATE);
  assert.equal(v.outcomes_line, undefined);
});

test("foundationalStatus: exists:false when there is no state", () => {
  assert.deepEqual(foundationalStatus(undefined), { exists: false });
});

test("qerStatus: walks the QER step names, no outcome text", () => {
  const qs = newReviewState("cob-003", QER_STEPS, "T0");
  const v = qerStatus(qs);
  assert.equal(v.current, "OVERVIEW");
  assert.equal(v.total, QER_STEPS.length);
  assert.equal(v.outcomes_line, undefined);
  assert.equal(v.closeout_template, undefined);
});

// ---- QER perspective map + close-out (the perspective-aware cursor) ----

const allBuilt = () => true;

// A doc with two perspectives documented: Process (steps+roles) and Innovation
// (market-trends). The forward-looking to-be-design belongs to Target Process.
const QER_DOC = {
  meta: { id: "COB-003" },
  content: { title: "Client Onboarding" },
  "process-steps": [{ meta: { id: "PS-1" } }, { meta: { id: "PS-2" } }],
  roles: [{ meta: { id: "ROLE-1" } }],
  "market-trends": [{ meta: { id: "MT-1" } }],
  "to-be-design": [{ meta: { id: "TS-1" } }],
};

test("qerPerspectiveStatus: documented reflects element presence per perspective", () => {
  const ps = qerPerspectiveStatus(QER_DOC, allBuilt);
  const byKey = Object.fromEntries(ps.map((p) => [p.key, p]));
  assert.equal(byKey["process"].documented, true);
  assert.equal(byKey["process"].count, 3);
  assert.equal(byKey["innovation"].documented, true);
  assert.equal(byKey["target-process"].documented, true); // to-be-design
  assert.equal(byKey["control-compliance"].documented, false);
  assert.equal(byKey["client-journey"].documented, false);
});

test("qerPerspectiveStatus: skillBuilt is the injected fact", () => {
  const onlyProcess = (s: string) => s === "process-specialist";
  const ps = qerPerspectiveStatus(QER_DOC, onlyProcess);
  assert.equal(ps.find((p) => p.key === "process")!.skillBuilt, true);
  assert.equal(ps.find((p) => p.key === "innovation")!.skillBuilt, false);
});

test("documentedPerspectiveCount + crossReview gate", () => {
  const ps = qerPerspectiveStatus(QER_DOC, allBuilt);
  assert.equal(documentedPerspectiveCount(ps), 3);
  const empty = qerPerspectiveStatus({ meta: { id: "X" } }, allBuilt);
  assert.equal(documentedPerspectiveCount(empty), 0);
});

test("nextBuiltPerspective: first built AND not-yet-documented, in registry order", () => {
  // process + innovation + target documented → next built-undocumented is control-compliance
  const ps = qerPerspectiveStatus(QER_DOC, allBuilt);
  assert.equal(nextBuiltPerspective(ps)!.key, "control-compliance");
  // skip an unbuilt one: if control-compliance isn't built, jump to client-journey
  const skipControl = (s: string) => s !== "control-compliance-specialist";
  const ps2 = qerPerspectiveStatus(QER_DOC, skipControl);
  assert.equal(nextBuiltPerspective(ps2)!.key, "client-journey");
  // everything documented + built → null
  const fullDoc: any = { meta: { id: "Z" }, content: { title: "Z" } };
  for (const p of QER_PERSPECTIVES) fullDoc[p.sections[0]] = [{ meta: { id: "E" } }];
  assert.equal(nextBuiltPerspective(qerPerspectiveStatus(fullDoc, allBuilt)), null);
});

test("qerStatusWithPerspectives: perspective map present while running, closeout once done", () => {
  let qs = newReviewState("cob-003", QER_STEPS, "T0");
  const running = qerStatusWithPerspectives(qs, QER_DOC, allBuilt);
  assert.equal(running.crossReviewEligible, true);
  assert.equal(running.documentedPerspectives, 3);
  assert.ok(Array.isArray(running.perspectives));
  assert.equal(running.nextBuiltPerspective!.key, "control-compliance");
  assert.equal(running.closeout, undefined);

  for (let i = 0; i < QER_STEPS.length; i++) qs = advance(qs, "T" + i);
  const done = qerStatusWithPerspectives(qs, QER_DOC, allBuilt);
  assert.equal(done.done, true);
  assert.ok(done.closeout && done.closeout.includes("Client Onboarding"));
  assert.equal(done.perspectives, undefined);
});

test("renderQerCloseout: fills process, totals and by-type counts", () => {
  const out = renderQerCloseout(QER_DOC);
  assert.match(out, /Client Onboarding/);
  assert.match(out, /across 3 perspective\(s\)/);
  assert.match(out, /Process 3/);
  assert.match(out, /Innovation 1/);
  // never leaves a raw placeholder
  assert.ok(!out.includes("{"));
});

test("actor is carried on the cursor and surfaced in status", () => {
  const qs = newReviewState("cob-003", QER_STEPS, "T0", { name: "Dana", role: "Ops Lead" });
  assert.deepEqual(qs.actor, { name: "Dana", role: "Ops Lead" });
  assert.deepEqual(qerStatus(qs).actor, { name: "Dana", role: "Ops Lead" });
  // no actor → no field
  assert.equal(qerStatus(newReviewState("x", QER_STEPS, "T0")).actor, undefined);
});
