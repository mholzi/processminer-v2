// Tests for the session root-field writers (council-review + area-summary + ingest).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildTargetReview,
  parseSummaryParts,
  buildIngestReport,
  clearIngestConflicts,
  buildApprovalPatch,
} from "./session-writes.ts";

test("buildApprovalPatch: builds the meta patch with approver + date", () => {
  const p = buildApprovalPatch("approved", "Ada Byron", "2026-06-05");
  assert.deepEqual(p, {
    meta: { approval: "approved", approvalBy: "Ada Byron", approvalDate: "2026-06-05" },
  });
});

test("buildApprovalPatch: defaults a missing approver to SME", () => {
  const p = buildApprovalPatch("in-progress", undefined, "2026-06-05");
  assert.equal(p.meta.approvalBy, "SME");
});

test("buildApprovalPatch: rejects an invalid approval value", () => {
  assert.throws(() => buildApprovalPatch("yes-please", "A", "2026-06-05"), /Invalid approval value/);
});

test("buildTargetReview: id-stamps items R-001… and marks each pending", () => {
  const r = buildTargetReview("cob-003", {
    ran: ["process-specialist", "it-architect"],
    items: [
      { specialist: "process-specialist", title: "A", detail: "d1", targets: ["TD-1"] },
      { specialist: "it-architect", title: "B", detail: "d2", targets: ["TS-2", "TD-3"] },
    ],
  });
  assert.equal(r.slug, "cob-003");
  assert.deepEqual(r.ran, ["process-specialist", "it-architect"]);
  assert.deepEqual(r.items.map((i) => i.id), ["R-001", "R-002"]);
  assert.ok(r.items.every((i) => i.triage === "pending"));
  assert.deepEqual(r.items[1].targets, ["TS-2", "TD-3"]);
  assert.equal(typeof r.generatedAt, "string");
});

test("buildTargetReview: empty council writes an empty items list", () => {
  const r = buildTargetReview("x", { ran: ["process-specialist"], items: [] });
  assert.deepEqual(r.items, []);
});

test("buildTargetReview: tolerates missing/garbage payload", () => {
  const r = buildTargetReview("x", null);
  assert.deepEqual(r.ran, []);
  assert.deepEqual(r.items, []);
});

const MEMO = `## Introduction
Intro text.

## Current state
State text.

## What stands out
Standout text.

## Recommendation
Reco text.`;

test("parseSummaryParts: splits the four headings into parts", () => {
  const parts = parseSummaryParts(MEMO);
  assert.deepEqual(parts.map((p) => p.heading), [
    "Introduction",
    "Current state",
    "What stands out",
    "Recommendation",
  ]);
  assert.equal(parts[0].text, "Intro text.");
  assert.equal(parts[3].text, "Reco text.");
});

test("parseSummaryParts: rejects the wrong number of headings", () => {
  assert.throws(() => parseSummaryParts("## Only one\nbody"), /Expected exactly 4/);
});

test("parseSummaryParts: rejects a memo with no headings", () => {
  assert.throws(() => parseSummaryParts("just prose, no headings"), /must use/);
});

test("buildIngestReport: normalises arrays and stamps slug", () => {
  const r = buildIngestReport("cob-003", {
    file: "policy.pdf",
    created: ["PS-COB-001"],
    conflicts: [{ element: "PS-COB-002", field: "title", documentSays: "x", wikiSays: "y" }],
  });
  assert.equal(r.slug, "cob-003");
  assert.equal(r.file, "policy.pdf");
  assert.deepEqual(r.created, ["PS-COB-001"]);
  assert.deepEqual(r.updated, []); // missing array -> []
  assert.deepEqual(r.corrections, []);
  assert.equal(r.conflicts.length, 1);
  assert.equal(typeof r.generatedAt, "string");
});

test("buildIngestReport: a null payload yields an empty-but-valid report", () => {
  const r = buildIngestReport("cob-003", null);
  assert.equal(r.file, "");
  assert.deepEqual(r.created, []);
  assert.deepEqual(r.conflicts, []);
});

test("clearIngestConflicts: empties conflicts and reports how many were cleared", () => {
  const doc: any = {
    ingest: {
      conflicts: [{ element: "A" }, { element: "B" }],
      corrections: [{ element: "C" }],
    },
  };
  const res = clearIngestConflicts(doc);
  assert.equal(res.cleared, 2);
  assert.deepEqual(doc.ingest.conflicts, []);
  assert.equal(doc.ingest.corrections.length, 1); // corrections untouched
});

test("clearIngestConflicts: no-op when there is no ingest report", () => {
  const doc: any = { meta: { id: "COB-003" } };
  const res = clearIngestConflicts(doc);
  assert.equal(res.cleared, 0);
});
