// Tests for the ProcessView join layer (R18) — run with:  npm test
// Node's built-in test runner + type stripping; no extra dependency.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildRaciGrid,
  buildFlowLanes,
  UNASSIGNED_ROLE,
} from "./process-view.ts";
import type { WikiPage } from "./wiki.ts";

// ---- Fixture helpers -----------------------------------------------------
// buildRaciGrid/buildFlowLanes only read `.id` and `.meta.raci`, so the
// fixtures are deliberately minimal WikiPages.

function role(id: string, raci: string[]): WikiPage {
  return {
    id,
    type: "role",
    section: "roles",
    title: id,
    status: "draft",
    meta: { raci },
    body: "",
    blocks: [],
  };
}

function step(id: string): WikiPage {
  return {
    id,
    type: "process-step",
    section: "process-steps",
    title: id,
    status: "draft",
    meta: {},
    body: "",
    blocks: [],
  };
}

// ---- buildRaciGrid -------------------------------------------------------

test("buildRaciGrid pivots STEP:LEVEL entries into stepId → roleId → level", () => {
  const grid = buildRaciGrid([
    role("RL-1", ["PS-1:R", "PS-2:C"]),
    role("RL-2", ["PS-1:A"]),
  ]);
  assert.deepEqual(grid, {
    "PS-1": { "RL-1": "R", "RL-2": "A" },
    "PS-2": { "RL-1": "C" },
  });
});

test("buildRaciGrid normalises whitespace and upper-cases the level", () => {
  const grid = buildRaciGrid([role("RL-1", [" PS-1 : r "])]);
  assert.deepEqual(grid, { "PS-1": { "RL-1": "R" } });
});

test("buildRaciGrid skips malformed entries (missing id or level)", () => {
  const grid = buildRaciGrid([role("RL-1", ["PS-1", ":R", "PS-2:", "PS-3:I"])]);
  assert.deepEqual(grid, { "PS-3": { "RL-1": "I" } });
});

test("buildRaciGrid handles a role with no RACI frontmatter", () => {
  const grid = buildRaciGrid([
    { ...role("RL-1", []), meta: {} } as WikiPage,
  ]);
  assert.deepEqual(grid, {});
});

// ---- buildFlowLanes ------------------------------------------------------

test("buildFlowLanes assigns each step to its Responsible role", () => {
  const steps = [step("PS-1"), step("PS-2")];
  const grid = buildRaciGrid([
    role("RL-1", ["PS-1:R", "PS-2:A"]),
    role("RL-2", ["PS-2:R"]),
  ]);
  const { ownerOf } = buildFlowLanes(steps, grid);
  assert.equal(ownerOf.get("PS-1"), "RL-1");
  assert.equal(ownerOf.get("PS-2"), "RL-2"); // R wins over the A on RL-1
});

test("buildFlowLanes falls back to Accountable when no Responsible is set", () => {
  const steps = [step("PS-1")];
  const grid = buildRaciGrid([role("RL-1", ["PS-1:A"]), role("RL-2", ["PS-1:C"])]);
  const { ownerOf } = buildFlowLanes(steps, grid);
  assert.equal(ownerOf.get("PS-1"), "RL-1");
});

test("buildFlowLanes marks a step UNASSIGNED when it has no R or A", () => {
  const steps = [step("PS-1")];
  const grid = buildRaciGrid([role("RL-1", ["PS-1:C"]), role("RL-2", ["PS-1:I"])]);
  const { ownerOf, hasLaneData } = buildFlowLanes(steps, grid);
  assert.equal(ownerOf.get("PS-1"), UNASSIGNED_ROLE);
  assert.equal(hasLaneData, false);
});

test("buildFlowLanes: first R in roles order wins when several roles share R", () => {
  const steps = [step("PS-1")];
  // RL-2 listed first in the roles array → first into the grid → wins.
  const grid = buildRaciGrid([role("RL-2", ["PS-1:R"]), role("RL-1", ["PS-1:R"])]);
  const { ownerOf } = buildFlowLanes(steps, grid);
  assert.equal(ownerOf.get("PS-1"), "RL-2");
});

test("buildFlowLanes orders lanes by first appearance along the step spine", () => {
  const steps = [step("PS-1"), step("PS-2"), step("PS-3")];
  const grid = buildRaciGrid([
    role("RL-A", ["PS-1:R", "PS-3:R"]),
    role("RL-B", ["PS-2:R"]),
  ]);
  const { laneOrder, laneIndex } = buildFlowLanes(steps, grid);
  assert.deepEqual(laneOrder, ["RL-A", "RL-B"]);
  assert.equal(laneIndex.get("RL-A"), 0);
  assert.equal(laneIndex.get("RL-B"), 1);
});

test("buildFlowLanes always pushes the unassigned lane last", () => {
  const steps = [step("PS-1"), step("PS-2"), step("PS-3")];
  // PS-1 unassigned, PS-2 → RL-A, PS-3 → RL-B. Unassigned appears first along
  // the spine but must be moved to the end.
  const grid = buildRaciGrid([
    role("RL-A", ["PS-2:R"]),
    role("RL-B", ["PS-3:R"]),
  ]);
  const { laneOrder, hasLaneData } = buildFlowLanes(steps, grid);
  assert.equal(laneOrder[laneOrder.length - 1], UNASSIGNED_ROLE);
  assert.deepEqual(laneOrder, ["RL-A", "RL-B", UNASSIGNED_ROLE]);
  assert.equal(hasLaneData, true);
});
