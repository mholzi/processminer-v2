// Tests for the ProcessView builder — run with:  npm run test:lint
// (Node's built-in test runner + type stripping; no extra dependency.)
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  UNASSIGNED_ROLE,
  buildFlowLanes,
  buildProcessView,
  buildRaciGrid,
  contextFor,
} from "./process-view.ts";
import type { ProcessDoc, RaciEntry, Schema, Transition, WikiPage } from "./wiki.ts";

// ---- Fixture helpers -----------------------------------------------------

function step(
  id: string,
  title: string,
  body: string,
  transitions: Transition[] = [],
): WikiPage {
  return {
    id,
    type: "process-step",
    section: "process-steps",
    title,
    status: "draft",
    meta: { id, type: "process-step", title },
    body,
    blocks: [{ heading: "What happens", text: body }],
    transitions,
  };
}

function role(id: string, title: string, raci: RaciEntry[] = []): WikiPage {
  return {
    id,
    type: "role",
    section: "roles",
    title,
    status: "draft",
    meta: { id, type: "role", title },
    body: `${title} owns this work.`,
    blocks: [],
    raci,
  };
}

function fixtureDoc(): ProcessDoc {
  const steps = [
    step("PS-001", "Intake", "The officer receives the request and logs it.", [
      { to: "PS-002", kind: "normal", when: "" },
    ]),
    step("PS-002", "Validate", "Validate the request against documentation.", [
      { to: "PS-003", kind: "normal", when: "" },
    ]),
    step("PS-003", "Approve", "Final approval and release."),
  ];
  const roles = [
    role("ROLE-001", "Officer", [
      { step: "PS-001", level: "R" },
      { step: "PS-002", level: "R" },
    ]),
    role("ROLE-002", "Supervisor", [
      { step: "PS-001", level: "A" },
      { step: "PS-003", level: "R" },
    ]),
  ];
  return {
    slug: "test",
    process: {
      id: "test",
      type: "process",
      section: "overview",
      title: "Test Process",
      status: "draft",
      meta: {},
      body: "",
      blocks: [],
    },
    elements: [...steps, ...roles],
    sources: [],
    view: undefined as never, // filled by buildProcessView below
  };
}

function fixtureSchema(): Schema {
  return {
    version: "test",
    areas: [],
    elementTypes: {
      role: { label: "Role", section: "roles", idPrefix: "ROLE" },
      "process-step": {
        label: "Step",
        section: "process-steps",
        idPrefix: "PS",
        frontmatter: { fields: [], relations: [] },
      },
    },
  };
}

// ---- buildRaciGrid -------------------------------------------------------

test("buildRaciGrid pivots role.raci into stepId → roleId → level", () => {
  const roles = [
    role("ROLE-001", "Officer", [
      { step: "PS-001", level: "R" },
      { step: "PS-002", level: "C" },
    ]),
    role("ROLE-002", "Supervisor", [{ step: "PS-001", level: "A" }]),
  ];
  const grid = buildRaciGrid(roles);
  assert.equal(grid.get("PS-001")?.get("ROLE-001"), "R");
  assert.equal(grid.get("PS-001")?.get("ROLE-002"), "A");
  assert.equal(grid.get("PS-002")?.get("ROLE-001"), "C");
  assert.equal(grid.get("PS-003"), undefined);
});

// ---- buildFlowLanes ------------------------------------------------------

test("buildFlowLanes: R wins over A", () => {
  const grid = new Map([
    [
      "PS-001",
      new Map<string, "R" | "A" | "C" | "I">([
        ["ROLE-A", "A"],
        ["ROLE-R", "R"],
      ]),
    ],
  ]);
  const steps = [step("PS-001", "S", "")];
  const flow = buildFlowLanes(steps, grid);
  assert.equal(flow.ownerOf.get("PS-001"), "ROLE-R");
});

test("buildFlowLanes: A falls back when no R", () => {
  const grid = new Map([
    [
      "PS-001",
      new Map<string, "R" | "A" | "C" | "I">([["ROLE-A", "A"]]),
    ],
  ]);
  const steps = [step("PS-001", "S", "")];
  const flow = buildFlowLanes(steps, grid);
  assert.equal(flow.ownerOf.get("PS-001"), "ROLE-A");
});

test("buildFlowLanes: unassigned step gets UNASSIGNED_ROLE and lane is last", () => {
  const grid = new Map([
    [
      "PS-002",
      new Map<string, "R" | "A" | "C" | "I">([["ROLE-X", "R"]]),
    ],
  ]);
  // PS-001 has no RACI entry → unassigned; PS-002 has ROLE-X.
  const steps = [step("PS-001", "First", ""), step("PS-002", "Second", "")];
  const flow = buildFlowLanes(steps, grid);
  assert.equal(flow.ownerOf.get("PS-001"), UNASSIGNED_ROLE);
  // Lane order must end with UNASSIGNED even though PS-001 appeared first.
  assert.deepEqual(
    flow.lanes.map((l) => l.roleId),
    ["ROLE-X", UNASSIGNED_ROLE],
  );
});

// ---- buildProcessView ----------------------------------------------------

test("buildProcessView populates byId and byType", () => {
  const doc = fixtureDoc();
  const view = buildProcessView(doc, fixtureSchema());
  assert.equal(view.byId.get("PS-002")?.title, "Validate");
  assert.equal(view.byType.get("process-step")?.length, 3);
  assert.equal(view.byType.get("role")?.length, 2);
});

test("buildProcessView raciGrid matches a manual pivot", () => {
  const doc = fixtureDoc();
  const view = buildProcessView(doc, fixtureSchema());
  assert.equal(view.raciGrid.get("PS-001")?.get("ROLE-001"), "R");
  assert.equal(view.raciGrid.get("PS-001")?.get("ROLE-002"), "A");
  assert.equal(view.raciGrid.get("PS-003")?.get("ROLE-002"), "R");
});

test("buildProcessView flow lanes follow first-step-appearance order", () => {
  const doc = fixtureDoc();
  const view = buildProcessView(doc, fixtureSchema());
  // PS-001 (R = Officer), PS-002 (R = Officer), PS-003 (R = Supervisor).
  // First appearance: Officer, then Supervisor.
  assert.deepEqual(
    view.flow.lanes.map((l) => l.roleId),
    ["ROLE-001", "ROLE-002"],
  );
  assert.equal(view.flow.stepLane.get("PS-001"), 0);
  assert.equal(view.flow.stepLane.get("PS-003"), 1);
});

// ---- contextFor ----------------------------------------------------------

test("contextFor returns null for an unknown id", () => {
  const doc = fixtureDoc();
  const view = buildProcessView(doc, fixtureSchema());
  assert.equal(contextFor(view, "BOGUS"), null);
});

test("contextFor omits provenance by default and keeps the body", () => {
  const doc = fixtureDoc();
  // Plant some provenance on PS-001 — buildProcessView reads from doc as-is.
  doc.elements.find((e) => e.id === "PS-001")!.provenance = {
    "What happens": { source: "elicited", evidence: "SME said..." },
  };
  const view = buildProcessView(doc, fixtureSchema());
  const ctx = contextFor(view, "PS-001");
  assert.ok(ctx);
  assert.equal(ctx!.element.provenance, undefined);
  assert.ok(ctx!.element.body.length > 0);
});

test("contextFor with includeBody:false strips body and blocks", () => {
  const doc = fixtureDoc();
  const view = buildProcessView(doc, fixtureSchema());
  const ctx = contextFor(view, "PS-001", { includeBody: false });
  assert.ok(ctx);
  assert.equal(ctx!.element.body, "");
  assert.equal(ctx!.element.blocks.length, 0);
});

test("contextFor depth 0 returns no related entries", () => {
  const doc = fixtureDoc();
  const view = buildProcessView(doc, fixtureSchema());
  const ctx = contextFor(view, "PS-001", { depth: 0 });
  assert.ok(ctx);
  assert.deepEqual(ctx!.related, {});
});

test("contextFor depth 1 surfaces RACI roles for a process-step", () => {
  const doc = fixtureDoc();
  const view = buildProcessView(doc, fixtureSchema());
  const ctx = contextFor(view, "PS-001"); // default depth 1
  assert.ok(ctx);
  // PS-001 has Officer (R) and Supervisor (A) in fixtureDoc.
  assert.ok(ctx!.related["RACI · R"]?.some((s) => s.id === "ROLE-001"));
  assert.ok(ctx!.related["RACI · A"]?.some((s) => s.id === "ROLE-002"));
});

test("contextFor depth 1 surfaces outgoing transitions for a process-step", () => {
  const doc = fixtureDoc();
  const view = buildProcessView(doc, fixtureSchema());
  const ctx = contextFor(view, "PS-001");
  assert.ok(ctx);
  // PS-001 transitions normally to PS-002 in the fixture.
  assert.ok(
    ctx!.related["Transitions · normal"]?.some((s) => s.id === "PS-002"),
  );
});

test("contextFor trims related-element summaries to summaryWords", () => {
  // Build a step with a long body and inspect what a related element looks
  // like through another element's view.
  const doc = fixtureDoc();
  const longBody = "Lorem ipsum dolor sit amet ".repeat(40).trim(); // ~200 words
  const long = doc.elements.find((e) => e.id === "PS-002")!;
  long.blocks = [{ heading: "What happens", text: longBody }];
  long.body = longBody;
  const view = buildProcessView(doc, fixtureSchema());
  const ctx = contextFor(view, "PS-001", { summaryWords: 10 });
  assert.ok(ctx);
  const ps2Summary = ctx!.related["Transitions · normal"]?.find(
    (s) => s.id === "PS-002",
  );
  assert.ok(ps2Summary);
  // Summary should be 10 words plus an ellipsis token — well under the full body.
  const wordCount = ps2Summary!.summary.replace("…", "").trim().split(/\s+/).length;
  assert.ok(
    wordCount <= 10,
    `expected ≤10 words, got ${wordCount}: "${ps2Summary!.summary}"`,
  );
  assert.ok(ps2Summary!.summary.endsWith("…"));
});

test("contextFor for a role surfaces the steps the role is on", () => {
  const doc = fixtureDoc();
  const view = buildProcessView(doc, fixtureSchema());
  const ctx = contextFor(view, "ROLE-001");
  assert.ok(ctx);
  // Officer is R on PS-001 and PS-002 in the fixture.
  const rSteps = (ctx!.related["RACI · R"] ?? []).map((s) => s.id).sort();
  assert.deepEqual(rSteps, ["PS-001", "PS-002"]);
});
