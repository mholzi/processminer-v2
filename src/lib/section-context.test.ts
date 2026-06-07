import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSectionContext } from "./section-context.ts";
import type { Schema } from "./wiki.ts";

const SCHEMA = {
  elementTypes: {
    "innovation-idea": {
      label: "Innovation Idea",
      section: "innovation-ideas",
      idPrefix: "II",
      frontmatter: {
        fields: [{ key: "category", label: "Category", hint: "kind of idea" }],
        relations: [
          { key: "addresses", label: "Addresses", target: ["pain-point", "friction-point"] },
          { key: "fromTrend", label: "From trend", target: "market-trend" },
        ],
        required: ["addresses"],
      },
      template: [{ heading: "The idea" }, { heading: "Why it matters" }],
    },
    role: { label: "Role", section: "roles", idPrefix: "ROLE", template: [{ heading: "Responsibility" }] },
  },
} as unknown as Schema;

const DOC = {
  meta: { id: "COB-003" },
  content: { title: "Client Onboarding", description: "How clients are onboarded." },
  "innovation-ideas": [
    { meta: { id: "II-1" }, content: { title: "Auto-KYC" } },
    { meta: { id: "II-2" }, content: { title: "Self-serve portal" } },
  ],
};

test("skeleton: blocks, fields, relation targets (normalized to arrays) and required", () => {
  const c = buildSectionContext(DOC, SCHEMA, "innovation-ideas");
  assert.equal(c.types.length, 1);
  const t = c.types[0];
  assert.equal(t.type, "innovation-idea");
  assert.deepEqual(t.blocks, ["The idea", "Why it matters"]);
  assert.deepEqual(t.fields.map((f) => f.key), ["category"]);
  assert.deepEqual(t.relations.find((r) => r.key === "addresses")!.target, ["pain-point", "friction-point"]);
  assert.deepEqual(t.relations.find((r) => r.key === "fromTrend")!.target, ["market-trend"]); // string → array
  assert.deepEqual(t.required, ["addresses"]);
});

test("existing elements (id+title) are listed for the duplicate check", () => {
  const c = buildSectionContext(DOC, SCHEMA, "innovation-ideas");
  assert.deepEqual(c.existing, [
    { id: "II-1", title: "Auto-KYC" },
    { id: "II-2", title: "Self-serve portal" },
  ]);
});

test("overview is carried for domain context", () => {
  const c = buildSectionContext(DOC, SCHEMA, "innovation-ideas");
  assert.equal(c.overview!.id, "COB-003");
  assert.equal(c.overview!.title, "Client Onboarding");
  assert.match(c.overview!.description, /onboarded/);
});

test("a type with no frontmatter still yields an empty-but-present skeleton", () => {
  const c = buildSectionContext(DOC, SCHEMA, "roles");
  const t = c.types[0];
  assert.deepEqual(t.blocks, ["Responsibility"]);
  assert.deepEqual(t.fields, []);
  assert.deepEqual(t.relations, []);
  assert.deepEqual(t.required, []);
});

test("an empty / unknown section: no types, no existing, overview still present", () => {
  const c = buildSectionContext(DOC, SCHEMA, "controls");
  assert.deepEqual(c.types, []);
  assert.deepEqual(c.existing, []);
  assert.equal(c.overview!.id, "COB-003");
});
