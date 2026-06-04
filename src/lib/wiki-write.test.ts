// Tests for updateElement's write-gating — run with:  npm test
// Verifies that metadata-only writes (approval / relevance / status) are NOT
// blocked by an element's pre-existing content non-conformance, while the A1
// approval gate still blocks approving unconfirmed content. Uses a throwaway
// process JSON under wiki/processes/ and cleans it up.
import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { updateElement } from "./wiki-write.ts";

const SLUG = "__wwtest";
const FILE = join(process.cwd(), "wiki", "processes", `${SLUG}.json`);

// A deliberately sparse (non-conformant) element with one `proposed` heading.
function fixture() {
  return {
    meta: { id: "TEST-PROC", type: "process", section: "process", title: "T", status: "draft" },
    content: { title: "T", body: "" },
    "process-steps": [
      {
        meta: {
          id: "PS-TEST-001",
          type: "process-step",
          section: "process-steps",
          status: "draft",
          approval: "in-progress",
          sequence: 1,
          provenance: { "What happens": { source: "proposed", evidence: "" } },
        },
        content: { title: "Step one" },
      },
    ],
  };
}
const writeFixture = () => writeFileSync(FILE, JSON.stringify(fixture(), null, 2));
const elMeta = () =>
  JSON.parse(readFileSync(FILE, "utf8"))["process-steps"][0].meta;

test("metadata-only reject succeeds on a non-conformant element", async () => {
  writeFixture();
  try {
    const res = await updateElement(SLUG, "PS-TEST-001", {
      meta: { approval: "rejected", approvalBy: "x", approvalDate: "2026-06-04" },
    });
    assert.equal(res.ok, true);
    assert.equal(elMeta().approval, "rejected");
  } finally {
    rmSync(FILE, { force: true });
  }
});

test("metadata-only relevance triage succeeds on a non-conformant element", async () => {
  writeFixture();
  try {
    const res = await updateElement(SLUG, "PS-TEST-001", {
      meta: { relevance: "disregarded", relevanceBy: "x", relevanceDate: "2026-06-04" },
    });
    assert.equal(res.ok, true);
    assert.equal(elMeta().relevance, "disregarded");
  } finally {
    rmSync(FILE, { force: true });
  }
});

test("approval is still blocked while a heading is proposed (A1 gate intact)", async () => {
  writeFixture();
  try {
    const res = await updateElement(SLUG, "PS-TEST-001", {
      meta: { approval: "approved", approvalBy: "x", approvalDate: "2026-06-04" },
    });
    assert.equal(res.ok, false);
    assert.match(res.error ?? "", /not yet confirmed/);
    assert.equal(elMeta().approval, "in-progress"); // unchanged — no write occurred
  } finally {
    rmSync(FILE, { force: true });
  }
});
