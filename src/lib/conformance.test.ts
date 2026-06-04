// Tests for the approval-gate provenance helper — run with:  npm test
// (Node's built-in test runner + type stripping; no extra dependency.)
import { test } from "node:test";
import assert from "node:assert/strict";
import { unconfirmedHeadings, UNCONFIRMED_SOURCES } from "./conformance.ts";

test("unconfirmedHeadings flags proposed and web sources", () => {
  const prov = {
    "What happens": { source: "elicited", evidence: "SME confirmed it" },
    Inputs: { source: "document", evidence: "DOC v1" },
    "Control activity": { source: "proposed", evidence: "" },
    Timing: { source: "web", evidence: "https://x — fetched 2026-06-04" },
  };
  assert.deepEqual(unconfirmedHeadings(prov).sort(), [
    "Control activity",
    "Timing",
  ]);
});

test("unconfirmedHeadings returns empty when all headings are confirmed", () => {
  const prov = {
    "What happens": { source: "elicited", evidence: "q" },
    Inputs: { source: "document", evidence: "d" },
    Legacy: { source: "legacy-approved", evidence: "" },
  };
  assert.deepEqual(unconfirmedHeadings(prov), []);
});

test("unconfirmedHeadings treats missing/empty provenance as nothing to block", () => {
  assert.deepEqual(unconfirmedHeadings(undefined), []);
  assert.deepEqual(unconfirmedHeadings(null), []);
  assert.deepEqual(unconfirmedHeadings({}), []);
});

test("unconfirmedHeadings ignores malformed entries", () => {
  const prov = {
    Good: { source: "proposed", evidence: "" },
    NoSource: { evidence: "x" } as { source?: string },
    NotAnObject: "proposed" as unknown as { source?: string },
  };
  assert.deepEqual(unconfirmedHeadings(prov), ["Good"]);
});

test("UNCONFIRMED_SOURCES is exactly proposed + web", () => {
  assert.deepEqual([...UNCONFIRMED_SOURCES].sort(), ["proposed", "web"]);
});
