// Tests for the R9 runtime store — run with:  npm test
// Writes to a throwaway slug under data/runtime/ and cleans up.
import { test } from "node:test";
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { getRuntime, writeRuntime } from "./runtime-store.ts";

const SLUG = "__runtime_test";
const FILE = join(process.cwd(), "data", "runtime", `${SLUG}.json`);

test("getRuntime returns {} when no runtime file exists", () => {
  rmSync(FILE, { force: true });
  assert.deepEqual(getRuntime(SLUG), {});
});

test("writeRuntime persists and merges partial updates", () => {
  try {
    writeRuntime(SLUG, { reviewState: { cursor: 1 } as any });
    assert.equal(getRuntime(SLUG).reviewState?.cursor, 1);

    // A second partial write merges, leaving the earlier key intact.
    writeRuntime(SLUG, { lint: { findings: [] } as any });
    const rt = getRuntime(SLUG);
    assert.equal(rt.reviewState?.cursor, 1);
    assert.deepEqual(rt.lint?.findings, []);
  } finally {
    rmSync(FILE, { force: true });
  }
});
