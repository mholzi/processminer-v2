// Tests for the R6b author display-name resolver — run with:  npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveAuthor,
  transitionToString,
  transitionTarget,
  raciToString,
  normalizeIngestReport,
  parseProcessListing,
} from "./wiki.ts";

test("parseProcessListing reads the title from valid JSON", () => {
  const e = parseProcessListing("cob-003", JSON.stringify({ content: { title: "Client Onboarding" } }));
  assert.deepEqual(e, { slug: "cob-003", title: "Client Onboarding" });
});

test("parseProcessListing falls back to the slug when there is no title", () => {
  assert.deepEqual(parseProcessListing("frl-001", "{}"), { slug: "frl-001", title: "frl-001" });
});

test("parseProcessListing returns null for malformed JSON (so one bad file is skipped, not fatal)", () => {
  assert.equal(parseProcessListing("broken", "{ not json"), null);
  assert.equal(parseProcessListing("empty", ""), null);
});

const roster = new Map([
  ["m.berger", "M. Berger"],
  ["a.klein", "Anna Klein"],
]);

test("resolveAuthor maps a known username to its current display name", () => {
  assert.equal(resolveAuthor("m.berger", roster), "M. Berger");
  assert.equal(resolveAuthor("a.klein", roster), "Anna Klein");
});

test("resolveAuthor falls back to the stored value (legacy display-name records)", () => {
  // A stored display name is not a username key, so it passes through unchanged.
  assert.equal(resolveAuthor("M. Berger", roster), "M. Berger");
  assert.equal(resolveAuthor("SME", roster), "SME");
});

test("resolveAuthor passes through non-strings and empties", () => {
  assert.equal(resolveAuthor(undefined, roster), undefined);
  assert.equal(resolveAuthor(null, roster), null);
  assert.equal(resolveAuthor("", roster), "");
});

// R7/R8 — transition/RACI form-agnostic helpers
test("transitionToString renders both the object and string forms", () => {
  assert.equal(
    transitionToString({ to: "PS-2", kind: "branch", when: "if overdraft" }),
    "PS-2|branch|if overdraft",
  );
  assert.equal(transitionToString({ to: "PS-3" }), "PS-3|normal|"); // defaults kind
  assert.equal(transitionToString("PS-4|normal|"), "PS-4|normal|"); // legacy string passes through
});

test("transitionTarget extracts the target id from either form", () => {
  assert.equal(transitionTarget({ to: "EX-1", kind: "exception", when: "" }), "EX-1");
  assert.equal(transitionTarget("EX-2|exception|fraud"), "EX-2");
  assert.equal(transitionTarget(""), "");
});

test("raciToString renders both the object and string forms", () => {
  assert.equal(raciToString({ step: "PS-1", level: "A" }), "PS-1:A");
  assert.equal(raciToString("PS-2:R"), "PS-2:R"); // legacy string passes through
});

test("normalizeIngestReport coerces a malformed report's arrays (F-002)", () => {
  // The exact shape a bypassed/legacy write produced: no created/updated, no
  // generatedAt/slug — the report that crashed TriagePanel (F-003).
  const r = normalizeIngestReport(
    { file: "doc-v1.md", conflicts: [], corrections: [] },
    "cob-003",
  );
  assert.ok(r);
  assert.deepEqual(r!.created, []); // was undefined -> [] (no more `.length` throw)
  assert.deepEqual(r!.updated, []);
  assert.deepEqual(r!.conflicts, []);
  assert.deepEqual(r!.corrections, []);
  assert.equal(r!.file, "doc-v1.md"); // scalar preserved
  assert.equal(r!.slug, "cob-003"); // missing slug defaulted from the arg
});

test("normalizeIngestReport preserves a well-formed report", () => {
  const src = {
    generatedAt: "2026-06-07T00:00:00.000Z",
    slug: "frd-001",
    file: "v2.md",
    created: ["PS-1"],
    updated: ["PS-2"],
    conflicts: [{ element: "M-1", field: "target", documentSays: "4h", wikiSays: "2h" }],
    corrections: [],
  };
  const r = normalizeIngestReport(src, "ignored");
  assert.deepEqual(r, src); // unchanged, and the arg slug is NOT used
});

test("normalizeIngestReport returns undefined when there is no report", () => {
  assert.equal(normalizeIngestReport(undefined, "s"), undefined);
  assert.equal(normalizeIngestReport(null, "s"), undefined);
  assert.equal(normalizeIngestReport("not-an-object", "s"), undefined);
});
