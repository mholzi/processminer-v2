// Tests for the approval-gate provenance helper — run with:  npm test
// (Node's built-in test runner + type stripping; no extra dependency.)
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  unconfirmedHeadings,
  UNCONFIRMED_SOURCES,
  checkTempKeyLeaks,
  parseProvenance,
  checkProvenance,
  checkFrontmatter,
  checkFieldValues,
} from "./conformance.ts";
import type { ElementType, Schema, WikiPage } from "./wiki.ts";

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

// --- parseProvenance (the provenance decoder; malformed input must be safe) ---

const pageMeta = (meta: Record<string, string | string[]>): WikiPage =>
  ({ meta, blocks: [] }) as unknown as WikiPage;

test("parseProvenance decodes a well-formed provenance map", () => {
  const prov = { "What happens": { source: "elicited", evidence: "q" } };
  assert.deepEqual(parseProvenance(pageMeta({ provenance: JSON.stringify(prov) })), prov);
});

test("parseProvenance returns {} for absent, empty, malformed, array or non-object input", () => {
  assert.deepEqual(parseProvenance(pageMeta({})), {}); // no provenance key
  assert.deepEqual(parseProvenance(pageMeta({ provenance: "" })), {}); // empty
  assert.deepEqual(parseProvenance(pageMeta({ provenance: "   " })), {}); // whitespace
  assert.deepEqual(parseProvenance(pageMeta({ provenance: "{ not json" })), {}); // malformed
  assert.deepEqual(parseProvenance(pageMeta({ provenance: "[1,2]" })), {}); // array
  assert.deepEqual(parseProvenance(pageMeta({ provenance: "42" })), {}); // scalar
  assert.deepEqual(parseProvenance(pageMeta({ provenance: "null" })), {}); // null
});

// --- checkProvenance (per-heading provenance contract) ---

const typeTpl = (...headings: string[]): ElementType =>
  ({ template: headings.map((h) => ({ heading: h })) }) as unknown as ElementType;

const provPage = (prov: unknown): WikiPage =>
  pageMeta({ provenance: JSON.stringify(prov) });

test("checkProvenance is a no-op for a template-less type", () => {
  assert.deepEqual(checkProvenance(provPage({}), {} as ElementType), []);
});

test("checkProvenance flags a missing provenance map", () => {
  const issues = checkProvenance(pageMeta({}), typeTpl("What happens"));
  assert.equal(issues.length, 1);
  assert.match(issues[0], /provenance map is missing/);
});

test("checkProvenance flags a heading with no entry and a stray (renamed) key", () => {
  const issues = checkProvenance(
    provPage({ "Old name": { source: "elicited", evidence: "q" } }),
    typeTpl("What happens"),
  );
  assert.ok(issues.some((i) => /“What happens” has no provenance entry/.test(i)));
  assert.ok(issues.some((i) => /“Old name” names no template heading/.test(i)));
});

test("checkProvenance flags an unknown source and a missing evidence quote", () => {
  const badSource = checkProvenance(
    provPage({ X: { source: "guessed", evidence: "q" } }),
    typeTpl("X"),
  );
  assert.ok(badSource.some((i) => /source “guessed” is not one of/.test(i)));

  const noEvidence = checkProvenance(
    provPage({ X: { source: "document", evidence: "" } }),
    typeTpl("X"),
  );
  assert.ok(noEvidence.some((i) => /is document but carries no evidence/.test(i)));
});

test("checkProvenance accepts a fully-backed map (proposed needs no evidence)", () => {
  const issues = checkProvenance(
    provPage({
      A: { source: "document", evidence: "DOC v1" },
      B: { source: "proposed", evidence: "" },
      C: { source: "legacy-approved", evidence: "" },
    }),
    typeTpl("A", "B", "C"),
  );
  assert.deepEqual(issues, []);
});

// --- checkFrontmatter (required keys present) ---

test("checkFrontmatter flags missing or empty required keys, passes when present", () => {
  const type = { frontmatter: { required: ["owner", "systems"], fields: [] } } as unknown as ElementType;
  assert.deepEqual(checkFrontmatter(pageMeta({ owner: "RM", systems: ["SYS-1"] }), type), []);
  const missing = checkFrontmatter(pageMeta({ owner: "RM", systems: [] }), type);
  assert.equal(missing.length, 1);
  assert.match(missing[0], /required frontmatter “systems” is missing/);
  assert.equal(checkFrontmatter(pageMeta({}), type).length, 2);
});

// --- checkFieldValues (enumerated fields stay in their value set) ---

const fvSchema = { fieldValues: { gapStatus: ["open", "closed"] } } as unknown as Schema;
const fvType = { frontmatter: { fields: [{ key: "gapStatus" }, { key: "note" }] } } as unknown as ElementType;

test("checkFieldValues flags a value outside the schema's allowed set (casing drift)", () => {
  const issues = checkFieldValues(pageMeta({ gapStatus: "OPEN" }), fvType, fvSchema);
  assert.equal(issues.length, 1);
  assert.match(issues[0], /“gapStatus” is “OPEN” — not one of open, closed/);
});

test("checkFieldValues passes a valid value and skips fields with no value set or empty value", () => {
  assert.deepEqual(checkFieldValues(pageMeta({ gapStatus: "open" }), fvType, fvSchema), []);
  // `note` has no fieldValues entry → unconstrained; empty gapStatus → skipped.
  assert.deepEqual(checkFieldValues(pageMeta({ note: "anything", gapStatus: "" }), fvType, fvSchema), []);
});
