// Tests for the pure lint helpers — run with:  npm run test:lint
// (Node's built-in test runner + type stripping; no extra dependency.)
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyFindingDismissals,
  findingSignature,
  isDismissed,
  isOpen,
  isResolved,
  type LintFinding,
} from "./lint.ts";

function finding(over: Partial<LintFinding> = {}): LintFinding {
  return {
    id: "F-001",
    kind: "discrepancy",
    title: "A finding",
    detail: "Something is off.",
    elements: ["PS-001"],
    ...over,
  };
}

test("isResolved / isDismissed / isOpen reflect status", () => {
  assert.equal(isOpen(finding()), true);
  assert.equal(isOpen(finding({ status: "open" })), true);
  assert.equal(isResolved(finding({ status: "resolved" })), true);
  assert.equal(isDismissed(finding({ status: "dismissed" })), true);
  assert.equal(isOpen(finding({ status: "resolved" })), false);
  assert.equal(isOpen(finding({ status: "dismissed" })), false);
});

test("findingSignature is stable across element order", () => {
  const a = findingSignature({
    kind: "discrepancy",
    title: "T",
    elements: ["B", "A", "C"],
  });
  const b = findingSignature({
    kind: "discrepancy",
    title: "T",
    elements: ["C", "A", "B"],
  });
  assert.equal(a, b);
});

test("findingSignature differs on kind, title or elements", () => {
  const base = { kind: "discrepancy", title: "T", elements: ["A"] };
  assert.notEqual(
    findingSignature(base),
    findingSignature({ ...base, kind: "question" }),
  );
  assert.notEqual(
    findingSignature(base),
    findingSignature({ ...base, title: "U" }),
  );
  assert.notEqual(
    findingSignature(base),
    findingSignature({ ...base, elements: ["A", "B"] }),
  );
});

test("applyFindingDismissals dismisses a matching finding", () => {
  const f = finding();
  const sig = findingSignature(f);
  applyFindingDismissals(
    [f],
    { [sig]: { reason: "Not material", by: "M. Berger", at: "2026-05-19" } },
    "2026-05-20",
  );
  assert.equal(f.status, "dismissed");
  assert.equal(f.dismissReason, "Not material");
  assert.equal(f.dismissedBy, "M. Berger");
});

test("applyFindingDismissals leaves an unmatched finding open", () => {
  const f = finding();
  applyFindingDismissals(
    [f],
    { "other|sig|X": { reason: "x", by: "y", at: "2026-05-19" } },
    "2026-05-20",
  );
  assert.equal(f.status, undefined);
});

test("applyFindingDismissals never overrides a resolved finding", () => {
  const f = finding({ status: "resolved" });
  const sig = findingSignature(f);
  applyFindingDismissals(
    [f],
    { [sig]: { reason: "x", by: "y", at: "2026-05-19" } },
    "2026-05-20",
  );
  assert.equal(f.status, "resolved");
});

test("applyFindingDismissals respects a snooze window", () => {
  const f1 = finding();
  const sig = findingSignature(f1);
  // Snooze lapsed — finding stays open.
  applyFindingDismissals(
    [f1],
    { [sig]: { reason: "x", by: "y", at: "2026-05-01", until: "2026-05-10" } },
    "2026-05-20",
  );
  assert.equal(f1.status, undefined);

  // Snooze still active — finding is dismissed.
  const f2 = finding();
  applyFindingDismissals(
    [f2],
    { [sig]: { reason: "x", by: "y", at: "2026-05-01", until: "2026-06-10" } },
    "2026-05-20",
  );
  assert.equal(f2.status, "dismissed");
});
