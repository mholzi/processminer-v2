// Tests for the approval-gate provenance helper — run with:  npm test
// (Node's built-in test runner + type stripping; no extra dependency.)
import { test } from "node:test";
import assert from "node:assert/strict";
import { unconfirmedHeadings, UNCONFIRMED_SOURCES, checkTempKeyLeaks } from "./conformance.ts";
import type { Schema, WikiPage } from "./wiki.ts";

// Minimal stand-ins — checkTempKeyLeaks only reads page.blocks and
// schema.elementTypes[*].idPrefix.
const SCHEMA = {
  elementTypes: {
    "process-step": { idPrefix: "PS" },
    role: { idPrefix: "ROLE" },
    system: { idPrefix: "SYS" },
    metric: { idPrefix: "M" },
  },
} as unknown as Schema;

const pageWith = (text: string): WikiPage =>
  ({ blocks: [{ heading: "Role in this process", text }] }) as unknown as WikiPage;

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

test("checkTempKeyLeaks catches a bare tempKey left in prose", () => {
  const issues = checkTempKeyLeaks(
    pageWith("Submits the drawdown request (ps-1). Informed when complete (ps-8)."),
    SCHEMA,
  );
  assert.equal(issues.length, 2);
  assert.match(issues[0], /ps-1/);
  assert.match(issues[1], /ps-8/);
});

test("checkTempKeyLeaks catches an @-prefixed reference and dedupes repeats", () => {
  const issues = checkTempKeyLeaks(
    pageWith("Coordinates with @sys-3 and again with @sys-3 and role-2."),
    SCHEMA,
  );
  // @sys-3 collapses to one, role-2 is its own — two distinct hits.
  assert.equal(issues.length, 2);
});

test("checkTempKeyLeaks ignores real element ids and ordinary prose", () => {
  // Real ids have letters after the prefix hyphen (PS-FRDT-001); banking prose
  // like "tier-1"/"Basel-3" uses non-idPrefix words; single-letter prefixes are
  // excluded so "M-1" does not false-match.
  const issues = checkTempKeyLeaks(
    pageWith("Per PS-FRDT-001 and SYS-FRDT-002, holds tier-1 capital under Basel-3 (form M-1)."),
    SCHEMA,
  );
  assert.deepEqual(issues, []);
});
