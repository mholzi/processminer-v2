import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildFoundationalQueue,
  newReviewState,
  advance,
  foundationalStatus,
  qerStatus,
  QER_STEPS,
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
