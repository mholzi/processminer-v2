import { test } from "node:test";
import assert from "node:assert/strict";
import {
  replaceTempKeys,
  generateNextId,
  singularTypeFor,
  buildElement,
  createElementsBatch,
} from "./session-create.ts";

/**
 * A minimal, permissive schema fixture: two element types with empty templates
 * and no required frontmatter, so conformance passes trivially and these tests
 * exercise the batch orchestration (id assignment, tempKey resolution, counts,
 * error isolation) rather than re-testing the conformance engine.
 */
const SCHEMA = {
  elementTypes: {
    widget: { section: "widgets", idPrefix: "W", template: [], frontmatter: [] },
    gadget: { section: "gadgets", idPrefix: "G", template: [], frontmatter: [] },
  },
} as any;

function freshDoc() {
  return { meta: { id: "ACME-001" } } as any;
}

test("replaceTempKeys recursively resolves @tempKey references", () => {
  const map = new Map([["w1", "W-ACME-001"]]);
  const out = replaceTempKeys(
    { a: "@w1", b: ["@w1", "literal"], c: { d: "@unknown" } },
    map
  );
  assert.deepEqual(out, {
    a: "W-ACME-001",
    b: ["W-ACME-001", "literal"],
    c: { d: "@unknown" }, // unknown keys pass through untouched
  });
});

test("singularTypeFor maps a section to its element type", () => {
  assert.equal(singularTypeFor(SCHEMA, "widgets"), "widget");
  assert.equal(singularTypeFor(SCHEMA, "nope"), null);
});

test("buildElement assigns the next id and does not mutate the doc", () => {
  const doc = freshDoc();
  const res = buildElement(doc, SCHEMA, "widgets", { content: {} }, new Map());
  assert.equal(res.ok, true);
  assert.equal(res.id, "W-ACME-001");
  assert.equal(res.fullElement.meta.type, "widget");
  assert.equal(res.fullElement.meta.status, "draft");
  // buildElement is pure: nothing pushed yet
  assert.equal(doc.widgets, undefined);
});

test("buildElement reports an unknown collection type as an issue", () => {
  const res = buildElement(freshDoc(), SCHEMA, "sprockets", { content: {} }, new Map());
  assert.equal(res.ok, false);
  assert.match(res.issues!.join(" "), /Unknown collection type/);
});

test("createElementsBatch assigns sequential ids per type and counts them", () => {
  const doc = freshDoc();
  const res = createElementsBatch(doc, SCHEMA, [
    { type: "widgets", element: { content: {} } },
    { type: "widgets", element: { content: {} } },
    { type: "gadgets", element: { content: {} } },
  ]);
  assert.equal(res.ok, true);
  assert.deepEqual(res.counts, { widgets: 2, gadgets: 1 });
  assert.deepEqual(
    res.created.map((c) => c.id),
    ["W-ACME-001", "W-ACME-002", "G-ACME-001"]
  );
  // the doc was mutated in place
  assert.equal(doc.widgets.length, 2);
  assert.equal(doc.gadgets.length, 1);
});

test("createElementsBatch resolves intra-batch @tempKey cross-references", () => {
  const doc = freshDoc();
  const res = createElementsBatch(doc, SCHEMA, [
    { type: "widgets", element: { content: {} }, tempKey: "w1" },
    // gadget references the widget created earlier in the same batch
    { type: "gadgets", element: { content: { linkedTo: "@w1" } } },
  ]);
  assert.equal(res.ok, true);
  assert.equal(doc.gadgets[0].content.linkedTo, "W-ACME-001");
});

test("createElementsBatch isolates a bad element without dropping the good ones", () => {
  const doc = freshDoc();
  const res = createElementsBatch(doc, SCHEMA, [
    { type: "widgets", element: { content: {} } },
    { type: "sprockets", element: { content: {} } }, // unknown type
    { type: "gadgets", element: { content: {} } },
  ]);
  assert.equal(res.ok, false);
  assert.equal(res.errors.length, 1);
  assert.equal(res.errors[0].index, 1);
  assert.deepEqual(res.counts, { widgets: 1, gadgets: 1 });
  assert.equal(res.created.length, 2);
});

// --- A1 approval gate at create time (LIB-1) ---
// The create path writes the doc directly, bypassing wiki-write's gate, so
// buildElement must itself refuse to mint an element that is `approved` while
// any heading is still proposed/web.

test("buildElement refuses to create an element born approved with an unconfirmed heading", () => {
  const res = buildElement(
    freshDoc(),
    SCHEMA,
    "widgets",
    {
      meta: { approval: "approved", provenance: { "What happens": { source: "proposed", evidence: "x" } } },
      content: {},
    },
    new Map(),
  );
  assert.equal(res.ok, false);
  assert.match(res.issues!.join(" "), /as approved/);
  assert.match(res.issues!.join(" "), /What happens/);
});

test("buildElement allows approved when every heading is confirmed", () => {
  const res = buildElement(
    freshDoc(),
    SCHEMA,
    "widgets",
    {
      meta: { approval: "approved", provenance: { "What happens": { source: "document", evidence: "x" } } },
      content: {},
    },
    new Map(),
  );
  assert.equal(res.ok, true);
  assert.equal(res.fullElement.meta.approval, "approved");
});

test("buildElement allows a normal unapproved create with proposed headings", () => {
  const res = buildElement(
    freshDoc(),
    SCHEMA,
    "widgets",
    { meta: { provenance: { "What happens": { source: "proposed", evidence: "x" } } }, content: {} },
    new Map(),
  );
  assert.equal(res.ok, true);
});

test("createElementsBatch isolates a gate-violating element but writes the rest", () => {
  const doc = freshDoc();
  const res = createElementsBatch(doc, SCHEMA, [
    { type: "widgets", element: { content: {} } },
    {
      type: "gadgets",
      element: { meta: { approval: "approved", provenance: { "X": { source: "web" } } }, content: {} },
    },
    { type: "widgets", element: { content: {} } },
  ]);
  assert.equal(res.ok, false);
  assert.equal(res.errors.length, 1);
  assert.equal(res.errors[0].index, 1);
  assert.match(res.errors[0].issues.join(" "), /as approved/);
  assert.deepEqual(res.counts, { widgets: 2 });
  assert.equal(doc.gadgets, undefined); // the gate-violating element never landed
});

test("generateNextId continues from the existing max sequence", () => {
  const doc = {
    meta: { id: "ACME-001" },
    widgets: [
      { meta: { id: "W-ACME-001", type: "widget" } },
      { meta: { id: "W-ACME-004", type: "widget" } },
    ],
  };
  assert.equal(generateNextId(doc, "widget", "W"), "W-ACME-005");
});
