// Tests for per-skill token accounting — run with:  npm test
// recordSkillUsage writes to a throwaway slug under data/runtime/ and cleans up.
import { test } from "node:test";
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { extractUsage, recordSkillUsage, aggregateUsage } from "./token-usage.ts";
import { getRuntime, type SkillUsage } from "./runtime-store.ts";

const entry = (
  input: number,
  output: number,
  turns: number,
  durationMs = 0,
  lastAt = "",
) => ({
  inputTokens: input,
  outputTokens: output,
  cacheReadTokens: 0,
  cacheCreationTokens: 0,
  costUsd: 0,
  turns,
  durationMs,
  lastAt,
});
const su = (
  total: ReturnType<typeof entry>,
  bySkill: Record<string, ReturnType<typeof entry>>,
  updatedAt = "",
): SkillUsage => ({ total, bySkill, updatedAt });

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
    // two document-ingest turns (1500ms + 2500ms) + one foundational-run turn
    recordSkillUsage(SLUG, "document-ingest", extractUsage({ usage: { input_tokens: 100, output_tokens: 10 } }), 1500, at);
    recordSkillUsage(SLUG, "document-ingest", extractUsage({ usage: { input_tokens: 200, output_tokens: 20 } }), 2500, at);
    recordSkillUsage(SLUG, "foundational-run", extractUsage({ usage: { input_tokens: 5, output_tokens: 1 } }), 800, at);

    const su = getRuntime(SLUG).skillUsage!;
    assert.ok(su, "skillUsage written");
    // per-skill breakdown
    assert.equal(su.bySkill["document-ingest"].inputTokens, 300);
    assert.equal(su.bySkill["document-ingest"].outputTokens, 30);
    assert.equal(su.bySkill["document-ingest"].turns, 2);
    assert.equal(su.bySkill["document-ingest"].durationMs, 4000); // 1500 + 2500
    assert.equal(su.bySkill["foundational-run"].turns, 1);
    assert.equal(su.bySkill["foundational-run"].durationMs, 800);
    // process total spans every skill
    assert.equal(su.total.inputTokens, 305);
    assert.equal(su.total.outputTokens, 31);
    assert.equal(su.total.turns, 3);
    assert.equal(su.total.durationMs, 4800); // 1500 + 2500 + 800
    assert.equal(su.updatedAt, at);
  } finally {
    rmSync(FILE, { force: true });
  }
});

test("recordSkillUsage is a no-op only when there's neither usage nor duration", () => {
  rmSync(FILE, { force: true });
  try {
    // null usage + no duration → nothing written
    recordSkillUsage(SLUG, "free-chat", null, 0);
    assert.equal(getRuntime(SLUG).skillUsage, undefined);

    // null usage but a measured duration → still recorded (run-time counts)
    recordSkillUsage(SLUG, "free-chat", null, 1200, "2026-06-07T12:00:00.000Z");
    const su = getRuntime(SLUG).skillUsage!;
    assert.equal(su.bySkill["free-chat"].turns, 1);
    assert.equal(su.bySkill["free-chat"].durationMs, 1200);
    assert.equal(su.bySkill["free-chat"].inputTokens, 0);
  } finally {
    rmSync(FILE, { force: true });
  }
});

test("aggregateUsage sums per skill + grand total across processes, skips empty", () => {
  const o = aggregateUsage([
    {
      slug: "a",
      title: "Alpha",
      usage: su(entry(300, 30, 3, 3000, "2026-06-07T10:00:00Z"), {
        "document-ingest": entry(300, 30, 3, 3000, "2026-06-07T10:00:00Z"),
      }),
    },
    {
      slug: "b",
      title: "Bravo",
      usage: su(entry(1000, 100, 5, 9000, "2026-06-07T11:00:00Z"), {
        "document-ingest": entry(400, 40, 2, 4000, "2026-06-07T11:00:00Z"),
        "foundational-run": entry(600, 60, 3, 5000, "2026-06-07T11:00:00Z"),
      }),
    },
    { slug: "c", title: "Charlie", usage: null }, // skipped
  ]);

  // grand total spans both non-empty processes
  assert.equal(o.grandTotal.inputTokens, 1300);
  assert.equal(o.grandTotal.outputTokens, 130);
  assert.equal(o.grandTotal.turns, 8);
  assert.equal(o.grandTotal.durationMs, 12000); // 3000 + 9000
  // per-skill summed across processes
  assert.equal(o.bySkill["document-ingest"].inputTokens, 700); // 300 + 400
  assert.equal(o.bySkill["document-ingest"].turns, 5); // 3 + 2
  assert.equal(o.bySkill["document-ingest"].durationMs, 7000); // 3000 + 4000
  assert.equal(o.bySkill["foundational-run"].inputTokens, 600);
  // empty process dropped; Bravo (bigger) sorts before Alpha
  assert.equal(o.processes.length, 2);
  assert.equal(o.processes[0].slug, "b");
});

test("aggregateUsage on an empty list is all zeros", () => {
  const o = aggregateUsage([]);
  assert.equal(o.grandTotal.turns, 0);
  assert.deepEqual(o.processes, []);
  assert.deepEqual(o.bySkill, {});
});
