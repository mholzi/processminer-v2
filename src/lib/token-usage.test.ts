// Tests for per-skill token accounting — run with:  npm test
// recordSkillUsage writes to a throwaway slug under data/runtime/ and cleans up.
import { test } from "node:test";
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { extractUsage, recordSkillUsage } from "./token-usage.ts";
import { getRuntime } from "./runtime-store.ts";

const SLUG = "__token_usage_test";
const FILE = join(process.cwd(), "data", "runtime", `${SLUG}.json`);

test("extractUsage reads the claude CLI result-event shape", () => {
  const u = extractUsage({
    type: "result",
    usage: {
      input_tokens: 1200,
      output_tokens: 340,
      cache_read_input_tokens: 50,
      cache_creation_input_tokens: 10,
    },
    total_cost_usd: 0.0123,
  });
  assert.deepEqual(u, {
    inputTokens: 1200,
    outputTokens: 340,
    cacheReadTokens: 50,
    cacheCreationTokens: 10,
    costUsd: 0.0123,
  });
});

test("extractUsage reads the Gemini usageMetadata shape and nets out cache", () => {
  const u = extractUsage({
    type: "result",
    usageMetadata: {
      promptTokenCount: 1000, // includes the 200 cached
      candidatesTokenCount: 250,
      cachedContentTokenCount: 200,
    },
  });
  assert.deepEqual(u, {
    inputTokens: 800, // 1000 - 200 cached
    outputTokens: 250,
    cacheReadTokens: 200,
    cacheCreationTokens: 0,
    costUsd: 0, // SDK reports no cost
  });
});

test("extractUsage returns null for no-usage / all-zero / unknown events", () => {
  assert.equal(extractUsage({ type: "result", result: "hi" }), null);
  assert.equal(
    extractUsage({ usage: { input_tokens: 0, output_tokens: 0 } }),
    null,
  );
  assert.equal(extractUsage({ type: "stream_event" }), null);
});

test("recordSkillUsage folds turns into per-skill + total, keyed by skill", () => {
  rmSync(FILE, { force: true });
  try {
    const at = "2026-06-07T12:00:00.000Z";
    // two document-ingest turns + one foundational-run turn
    recordSkillUsage(SLUG, "document-ingest", extractUsage({ usage: { input_tokens: 100, output_tokens: 10 } }), at);
    recordSkillUsage(SLUG, "document-ingest", extractUsage({ usage: { input_tokens: 200, output_tokens: 20 } }), at);
    recordSkillUsage(SLUG, "foundational-run", extractUsage({ usage: { input_tokens: 5, output_tokens: 1 } }), at);

    const su = getRuntime(SLUG).skillUsage!;
    assert.ok(su, "skillUsage written");
    // per-skill breakdown
    assert.equal(su.bySkill["document-ingest"].inputTokens, 300);
    assert.equal(su.bySkill["document-ingest"].outputTokens, 30);
    assert.equal(su.bySkill["document-ingest"].turns, 2);
    assert.equal(su.bySkill["foundational-run"].turns, 1);
    // process total spans every skill
    assert.equal(su.total.inputTokens, 305);
    assert.equal(su.total.outputTokens, 31);
    assert.equal(su.total.turns, 3);
    assert.equal(su.updatedAt, at);
  } finally {
    rmSync(FILE, { force: true });
  }
});

test("recordSkillUsage is a no-op when usage is null", () => {
  rmSync(FILE, { force: true });
  try {
    recordSkillUsage(SLUG, "free-chat", null);
    assert.equal(getRuntime(SLUG).skillUsage, undefined);
  } finally {
    rmSync(FILE, { force: true });
  }
});
