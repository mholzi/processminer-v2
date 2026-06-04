// Tests for the architecture view derivations (R3) — run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildDiagramModel,
  buildTraceability,
  relIds,
  type ArchElements,
} from "./architecture-view.ts";
import type { WikiPage } from "./wiki.ts";

// Minimal WikiPage with relations/fields in `meta` (where jsonElementToWikiPage
// merges content), keyed however the test needs.
function page(id: string, title: string, meta: Record<string, unknown> = {}): WikiPage {
  return {
    id,
    type: "x",
    section: "x",
    title,
    status: "draft",
    meta: meta as Record<string, string | string[]>,
    body: "",
    blocks: [],
  };
}

const empty: ArchElements = {
  capabilities: [],
  applications: [],
  adrs: [],
  integrations: [],
  components: [],
  nfrs: [],
  migrations: [],
};

// ---- relIds -------------------------------------------------------------

test("relIds: normalises string, array and missing to an id list", () => {
  assert.deepEqual(relIds(page("C", "c", { hostedIn: ["A-1", "A-2"] }), "hostedIn"), ["A-1", "A-2"]);
  assert.deepEqual(relIds(page("C", "c", { hostedIn: "A-1" }), "hostedIn"), ["A-1"]);
  assert.deepEqual(relIds(page("C", "c", {}), "hostedIn"), []);
  assert.deepEqual(relIds(page("C", "c", { hostedIn: "" }), "hostedIn"), []);
});

// ---- buildDiagramModel --------------------------------------------------

test("buildDiagramModel: empty when no caps or apps", () => {
  const m = buildDiagramModel([], [], []);
  assert.equal(m.isEmpty, true);
  assert.equal(m.capNodes.length, 0);
  assert.equal(m.appNodes.length, 0);
});

test("buildDiagramModel: hostedIn draws a capability→application edge", () => {
  const apps = [page("APP-1", "Case Hub", { verdict: "BUILD" })];
  const caps = [page("CAP-1", "Case capture", { criticality: "HIGH", hostedIn: ["APP-1"] })];
  const m = buildDiagramModel(caps, apps, []);
  assert.equal(m.isEmpty, false);
  assert.equal(m.hostEdges.length, 1);
  // edge runs from the capability node down to the application node
  assert.ok(m.hostEdges[0].y2 > m.hostEdges[0].y1);
  assert.equal(m.capNodes[0].sub, "HIGH");
  assert.equal(m.appNodes[0].sub, "BUILD");
});

test("buildDiagramModel: a hostedIn to an unknown app is dropped", () => {
  const caps = [page("CAP-1", "c", { hostedIn: ["APP-X"] })];
  const m = buildDiagramModel(caps, [page("APP-1", "a")], []);
  assert.equal(m.hostEdges.length, 0);
});

test("buildDiagramModel: integration from/to draws an app→app edge styled by pattern", () => {
  const apps = [page("APP-1", "A"), page("APP-2", "B")];
  const integ = [page("INT-1", "A→B", { from: ["APP-1"], to: ["APP-2"], pattern: "ASYNC" })];
  const m = buildDiagramModel([], apps, integ);
  assert.equal(m.intEdges.length, 1);
  assert.equal(m.intEdges[0].kind, "async");
  assert.equal(m.intEdges[0].label, "A→B");
});

// ---- buildTraceability --------------------------------------------------

test("buildTraceability: empty summary is all zeros, 0%", () => {
  const s = buildTraceability(empty);
  assert.deepEqual(
    { total: s.total, traced: s.traced, partial: s.partial, orphan: s.orphan, pct: s.tracedPct },
    { total: 0, traced: 0, partial: 0, orphan: 0, pct: 0 },
  );
});

test("buildTraceability: capability classified traced / partial / orphan", () => {
  const arch: ArchElements = {
    ...empty,
    capabilities: [
      page("CAP-1", "full", { hostedIn: ["APP-1"], realisesStep: ["TS-1"] }),
      page("CAP-2", "partial", { hostedIn: ["APP-1"] }),
      page("CAP-3", "orphan", {}),
    ],
    applications: [page("APP-1", "app", { drivenByADR: ["ADR-1"] })],
  };
  const s = buildTraceability(arch);
  const byId = Object.fromEntries(s.rows.map((r) => [r.id, r.status]));
  assert.equal(byId["CAP-1"], "traced");
  assert.equal(byId["CAP-2"], "partial");
  assert.equal(byId["CAP-3"], "orphan");
  // APP-1 is hosted by 2 caps and has an ADR → traced
  assert.equal(byId["APP-1"], "traced");
});

test("buildTraceability: integration endpoints drive traced/partial/orphan", () => {
  const arch: ArchElements = {
    ...empty,
    integrations: [
      page("INT-1", "both", { from: ["A"], to: ["B"] }),
      page("INT-2", "one", { from: ["A"] }),
      page("INT-3", "none", {}),
    ],
  };
  const s = buildTraceability(arch);
  const byId = Object.fromEntries(s.rows.map((r) => [r.id, r.status]));
  assert.equal(byId["INT-1"], "traced");
  assert.equal(byId["INT-2"], "partial");
  assert.equal(byId["INT-3"], "orphan");
  assert.equal(s.total, 3);
  assert.equal(s.tracedPct, 33);
});

test("buildTraceability: component needs inApp; nfr needs a link; migration needs delivers", () => {
  const arch: ArchElements = {
    ...empty,
    components: [page("COMP-1", "in", { inApp: ["APP-1"] }), page("COMP-2", "out", {})],
    nfrs: [page("NFR-1", "applies", { appliesTo: ["CAP-1"] }), page("NFR-2", "floating", {})],
    migrations: [page("MIG-1", "delivers", { delivers: ["CAP-1"] }), page("MIG-2", "empty", {})],
    adrs: [page("ADR-1", "linked", { decision: ["TD-1"] }), page("ADR-2", "loose", {})],
  };
  const s = buildTraceability(arch);
  const byId = Object.fromEntries(s.rows.map((r) => [r.id, r.status]));
  assert.equal(byId["COMP-1"], "traced");
  assert.equal(byId["COMP-2"], "orphan");
  assert.equal(byId["NFR-1"], "traced");
  assert.equal(byId["NFR-2"], "orphan");
  assert.equal(byId["MIG-1"], "traced");
  assert.equal(byId["MIG-2"], "orphan");
  assert.equal(byId["ADR-1"], "traced");
  assert.equal(byId["ADR-2"], "orphan");
});
