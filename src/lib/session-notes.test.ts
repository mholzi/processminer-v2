import { test } from "node:test";
import assert from "node:assert/strict";
import { buildNote, appendNote, resolveNotesInDoc } from "./session-notes.ts";

test("buildNote assembles a note with the given id/ts and trims text", () => {
  const n = buildNote(
    { author: "Ada", text: "  needs a control  ", type: "summary" },
    { id: "n-1", ts: "2026-06-04T00:00:00Z" },
  );
  assert.deepEqual(n, {
    id: "n-1",
    author: "Ada",
    text: "needs a control",
    ts: "2026-06-04T00:00:00Z",
    type: "summary",
  });
});

test("buildNote defaults a missing author and omits empty optionals", () => {
  const n = buildNote({ author: "", text: "hi" }, { id: "n-2", ts: "t" });
  assert.equal(n.author, "SME");
  assert.equal("type" in n, false);
  assert.equal("replyTo" in n, false);
});

test("buildNote rejects an empty note", () => {
  assert.throws(() => buildNote({ author: "A", text: "   " }, { id: "n", ts: "t" }), /empty/);
});

test("appendNote creates the thread map and element thread", () => {
  const doc: any = {};
  appendNote(doc, "PS-COB-001", buildNote({ author: "A", text: "x" }, { id: "n-1", ts: "t" }));
  appendNote(doc, "PS-COB-001", buildNote({ author: "B", text: "y" }, { id: "n-2", ts: "t" }));
  assert.equal(doc.notes["PS-COB-001"].length, 2);
});

test("appendNote requires an elementId", () => {
  assert.throws(() => appendNote({}, "", { id: "n", author: "A", text: "x", ts: "t" }), /elementId/);
});

test("resolveNotesInDoc marks matching ids resolved across all threads", () => {
  const doc: any = {
    notes: {
      "PS-COB-001": [
        { id: "n-1", author: "A", text: "x", ts: "t" },
        { id: "n-2", author: "A", text: "y", ts: "t" },
      ],
      "EX-COB-002": [{ id: "n-3", author: "B", text: "z", ts: "t" }],
    },
  };
  const res = resolveNotesInDoc(doc, ["n-1", "n-3", "n-missing"], "Ada", "2026-06-04");
  assert.deepEqual(res.resolved.sort(), ["n-1", "n-3"]);
  assert.deepEqual(res.notFound, ["n-missing"]);
  assert.equal(doc.notes["PS-COB-001"][0].resolved, true);
  assert.equal(doc.notes["PS-COB-001"][0].resolvedBy, "Ada");
  assert.equal(doc.notes["PS-COB-001"][0].resolvedAt, "2026-06-04");
  // untouched notes stay unresolved
  assert.equal(doc.notes["PS-COB-001"][1].resolved, undefined);
});

test("resolveNotesInDoc is a no-op safe call when there are no threads", () => {
  const res = resolveNotesInDoc({ meta: {} }, ["n-1"], "A", "2026-06-04");
  assert.deepEqual(res.resolved, []);
  assert.deepEqual(res.notFound, ["n-1"]);
});
