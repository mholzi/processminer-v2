// Tests for the session root-field writers (council-review + area-summary).
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildTargetReview, parseSummaryParts } from "./session-writes.ts";

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
