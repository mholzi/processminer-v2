import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildControlCoverage,
  uncoveredSteps,
  stillToDocument,
  closeoutCounts,
  enrichFoundationalStatus,
} from "./foundational.ts";
import {
  buildReconciledApprovalPatch,
  syncRelationsFromProse,
} from "./session-writes.ts";
import { newReviewState, advance, buildFoundationalQueue } from "./session-cursor.ts";

const DOC = {
  meta: { id: "COB-003" },
  content: { title: "Client Onboarding" },
  "process-steps": [
    { meta: { id: "PS-1" }, content: { title: "Intake", systems: ["SYS-1"] } },
    { meta: { id: "PS-2" }, content: { title: "KYC" } },
    { meta: { id: "PS-3" }, content: { title: "Approve" } },
  ],
  controls: [
    { meta: { id: "CP-1" }, content: { step: "PS-2" } }, // covers PS-2 only
  ],
  systems: [{ meta: { id: "SYS-1" } }, { meta: { id: "SYS-2" } }],
  roles: [{ meta: { id: "ROLE-1" } }],
  "process-gaps": [{ meta: { id: "PG-1" } }, { meta: { id: "PG-2" } }],
};

// ---- control coverage (idea 2) ----

test("buildControlCoverage: a step is covered iff a control's step points at it", () => {
  const cov = buildControlCoverage(DOC);
  assert.equal(cov["PS-1"], false);
  assert.equal(cov["PS-2"], true);
  assert.equal(cov["PS-3"], false);
});

test("uncoveredSteps: lists exactly the steps with no control", () => {
  assert.deepEqual(uncoveredSteps(DOC).sort(), ["PS-1", "PS-3"]);
});

// ---- still-to-document + counts (ideas 4 + 10) ----

test("stillToDocument: empty mapped sections only, with their fill action", () => {
  const std = stillToDocument(DOC);
  const sections = std.map((s) => s.section);
  assert.ok(sections.includes("channels")); // empty → listed
  assert.ok(sections.includes("regulation"));
  assert.ok(!sections.includes("controls")); // has an element → not listed
  // never lists Target Process sections
  assert.ok(!sections.includes("to-be-design"));
  const channels = std.find((s) => s.section === "channels")!;
  assert.match(channels.action, /client-journey-specialist/);
  const reg = std.find((s) => s.section === "regulation")!;
  assert.match(reg.action, /Source from the web/);
});

test("closeoutCounts: non-empty sections only, total summed", () => {
  const { byType, total } = closeoutCounts(DOC);
  const map = Object.fromEntries(byType.map((b) => [b.section, b.count]));
  assert.equal(map["process-steps"], 3);
  assert.equal(map["controls"], 1);
  assert.equal(map["process-gaps"], 2);
  assert.equal(total, 3 + 1 + 2 + 2 + 1); // steps + controls + gaps + systems + roles
});

// ---- enriched status (ideas 2, 7, 4) ----

test("enrichFoundationalStatus: currentHasControl set when current is a step", () => {
  const queue = buildFoundationalQueue(DOC);
  // queue: overview, steps, roles, ... gaps last. First item is the overview id.
  let rs = newReviewState("cob-003", queue, "T0");
  // advance to the first process-step (PS-1) — overview is index 0
  rs = advance(rs, "T1");
  const v = enrichFoundationalStatus(rs, DOC);
  assert.equal(v.current, "PS-1");
  assert.equal(v.currentHasControl, false);
  assert.deepEqual(v.uncoveredSteps!.sort(), ["PS-1", "PS-3"]);
});

test("enrichFoundationalStatus: gapTail batch lists remaining gaps when in the tail", () => {
  const queue = buildFoundationalQueue(DOC);
  // walk to the first process-gap
  let rs = newReviewState("cob-003", queue, "T0");
  while (rs.queue[rs.cursor] !== "PG-1" && !rs.done) rs = advance(rs, "T");
  const v = enrichFoundationalStatus(rs, DOC);
  assert.equal(v.current, "PG-1");
  assert.deepEqual(v.gapTail!.ids, ["PG-1", "PG-2"]);
});

test("enrichFoundationalStatus: close-out data once done", () => {
  let rs = newReviewState("cob-003", ["only"], "T0");
  rs = advance(rs, "T1"); // done
  const v = enrichFoundationalStatus(rs, DOC);
  assert.equal(v.done, true);
  assert.ok(v.closeoutCounts && v.closeoutCounts.length > 0);
  assert.ok(typeof v.closeoutTotal === "number");
  assert.ok(Array.isArray(v.stillToDocument));
});

// ---- inline provenance reconcile on [Y] (idea 5) ----

test("buildReconciledApprovalPatch: flips confirmed headings to elicited, preserves others", () => {
  const el = {
    meta: {
      provenance: {
        "What happens": { source: "document", evidence: "doc quote" },
        "Why it matters": { source: "proposed", evidence: "" },
      },
    },
  };
  const patch = buildReconciledApprovalPatch(el, "approved", "Dana", "2026-06-07", {
    "Why it matters": "SME confirmed it reduces onboarding risk",
  });
  assert.equal(patch.meta.approval, "approved");
  const prov = (patch.meta as any).provenance;
  assert.equal(prov["Why it matters"].source, "elicited");
  assert.match(prov["Why it matters"].evidence, /reduces onboarding risk/);
  // untouched heading preserved
  assert.equal(prov["What happens"].source, "document");
});

test("buildReconciledApprovalPatch: no reconcile → plain approval patch", () => {
  const patch = buildReconciledApprovalPatch(null, "approved", "Dana", "2026-06-07", undefined);
  assert.equal(patch.meta.approval, "approved");
  assert.equal((patch.meta as any).provenance, undefined);
});

// ---- frontmatter-sync on [E] edit (idea 6) ----
// Real Processminer ids are three-part (PREFIX-PROC-NNN); the prose scanner
// matches that shape, so these tests use realistic ids.
const SYNC_DOC = {
  meta: { id: "COB-003" },
  systems: [{ meta: { id: "SYS-COB-001" } }, { meta: { id: "SYS-COB-002" } }],
};

test("syncRelationsFromProse: adds a prose-named system id that exists and is missing", () => {
  const el = {
    content: {
      description: "This step now also writes to SYS-COB-002 after the handoff.",
      systems: ["SYS-COB-001"],
    },
  };
  const { content, added } = syncRelationsFromProse(el, SYNC_DOC);
  assert.deepEqual(content.systems, ["SYS-COB-001", "SYS-COB-002"]);
  assert.deepEqual(added.systems, ["SYS-COB-002"]);
});

test("syncRelationsFromProse: ignores ids that don't exist or are already listed", () => {
  const el = {
    content: {
      description: "Mentions SYS-COB-001 (already listed) and SYS-COB-999 (does not exist).",
      systems: ["SYS-COB-001"],
    },
  };
  const { content } = syncRelationsFromProse(el, SYNC_DOC);
  assert.deepEqual(content, {}); // nothing to add
});

test("syncRelationsFromProse: only syncs fields the element actually carries", () => {
  // element has no `systems` list field → no sync even if prose names a system
  const el = { content: { description: "References SYS-COB-002." } };
  const { content } = syncRelationsFromProse(el, SYNC_DOC);
  assert.deepEqual(content, {});
});
