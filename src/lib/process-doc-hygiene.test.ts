import { test } from "node:test";
import assert from "node:assert/strict";
import { stripRuntimeState, RUNTIME_DOC_KEYS } from "./process-doc-hygiene.ts";

test("strips every runtime-owned key", () => {
  const doc: Record<string, unknown> = {
    meta: { id: "FRL-001" },
    content: { overview: "x" },
    "process-steps": [{ meta: { id: "PS-1" } }],
    reviewState: { cursor: 5 },
    lint: { findings: [] },
    findingDismissals: { sig: {} },
    skillUsage: { "foundational-run": {} },
    dtpReports: [{ runId: "DTP-1" }],
    dtpReport: { runId: "DTP-0" },
    sources: [{ name: "a.pdf" }],
  };
  const out = stripRuntimeState(doc);
  for (const k of RUNTIME_DOC_KEYS) {
    assert.equal(k in out, false, `${k} should be stripped`);
  }
  // Durable keys are untouched.
  assert.deepEqual(out.meta, { id: "FRL-001" });
  assert.deepEqual(out.content, { overview: "x" });
  assert.ok(Array.isArray(out["process-steps"]));
});

test("preserves durable keys that resemble runtime (ingest, notes)", () => {
  const doc = {
    meta: { id: "X" },
    ingest: { created: ["PS-1"] }, // durable — read from the doc by getProcess
    notes: { "PS-1": [{ id: "n-1", text: "hi" }] }, // durable collaboration data
  };
  const out = stripRuntimeState(doc);
  assert.ok("ingest" in out);
  assert.ok("notes" in out);
});

test("is idempotent — a clean doc passes through untouched", () => {
  const clean = { meta: { id: "X" }, content: {}, roles: [] };
  const once = stripRuntimeState({ ...clean });
  const twice = stripRuntimeState(stripRuntimeState({ ...clean }));
  assert.deepEqual(once, clean);
  assert.deepEqual(twice, clean);
});

test("mutates in place and returns the same reference", () => {
  const doc = { meta: {}, lint: {} };
  const out = stripRuntimeState(doc);
  assert.equal(out, doc);
  assert.equal("lint" in doc, false);
});

test("tolerates null / non-object input", () => {
  assert.equal(stripRuntimeState(null as unknown as Record<string, unknown>), null);
});
