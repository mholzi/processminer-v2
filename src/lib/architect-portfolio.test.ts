// Tests for the cross-process architecture aggregation (R4) — run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  adrQueue,
  applicationRegister,
  capabilityCatalog,
  collectArchitecture,
  migrationPlan,
  nfrCatalog,
  processPortfolio,
} from "./architect-portfolio.ts";
import type { ProcessDoc, WikiPage } from "./wiki.ts";

function el(id: string, section: string, title: string, meta: Record<string, unknown> = {}): WikiPage {
  return {
    id,
    type: "x",
    section,
    title,
    status: "draft",
    meta: { ...meta } as Record<string, string | string[]>,
    body: "",
    blocks: [],
  };
}

function doc(slug: string, id: string, title: string, elements: WikiPage[], lastModified?: string): ProcessDoc {
  return {
    slug,
    process: { id, type: "process", section: "overview", title, status: "draft", meta: {}, body: "", blocks: [] },
    elements,
    sources: [],
    lastModified,
  } as ProcessDoc;
}

// Process A: a domain-stage process with caps + apps + an ADR.
const docA = doc("a", "AAA", "Process A", [
  el("CAP-A-1", "capabilities", "Case orchestration", { criticality: "HIGH" }),
  el("CAP-A-2", "capabilities", "Risk scoring", { criticality: "CRITICAL" }),
  el("TGTAPP-A-1", "target-applications", "Case Hub", { verdict: "build", vendor: "Camunda" }),
  el("ADR-A-1", "architecture-decisions", "Use Camunda", { adrStatus: "ACCEPTED", owner: "Lead Architect" }),
], "2026-06-01");

// Process B: a solution-stage process, shares "Case orchestration" with A.
const docB = doc("b", "BBB", "Process B", [
  el("CAP-B-1", "capabilities", "Case orchestration", { criticality: "HIGH" }),
  el("NFR-B-1", "nfrs", "Latency", { category: "performance", target: "p95 < 1.2s" }),
  el("MIG-B-1", "migration-phases", "Cutover", { phaseStatus: "planned", startQuarter: "2026 Q3", endQuarter: "2026 Q4", delivers: ["CAP-B-1"] }),
], "2026-06-02");

// Process C: nothing authored yet (upstream).
const docC = doc("c", "CCC", "Process C", [], "2026-05-01");

const docs = [docA, docB, docC];

test("collectArchitecture: flattens + tags every element with its process", () => {
  const all = collectArchitecture(docs);
  assert.equal(all.capabilities.length, 3);
  assert.equal(all.applications.length, 1);
  assert.equal(all.adrs.length, 1);
  assert.equal(all.nfrs.length, 1);
  assert.equal(all.migrations.length, 1);
  const cap = all.capabilities.find((c) => c.id === "CAP-A-1");
  assert.equal(cap?.processTitle, "Process A");
  assert.equal(cap?.processSlug, "a");
});

test("processPortfolio: per-process counts, stage, newest first", () => {
  const rows = processPortfolio(docs);
  // sorted by lastModified desc → B (06-02), A (06-01), C (05-01)
  assert.deepEqual(rows.map((r) => r.id), ["BBB", "AAA", "CCC"]);
  const a = rows.find((r) => r.id === "AAA")!;
  assert.equal(a.caps, 2);
  assert.equal(a.apps, 1);
  assert.equal(a.adrs, 1);
  assert.equal(a.total, 4);
  assert.equal(a.stage, "domain");
  assert.equal(rows.find((r) => r.id === "BBB")!.stage, "solution"); // has nfr + migration
  assert.equal(rows.find((r) => r.id === "CCC")!.stage, "upstream"); // nothing authored
});

test("capabilityCatalog: cross-process reuse counts distinct processes", () => {
  const cat = capabilityCatalog(docs);
  const orchestration = cat.find((c) => c.name === "Case orchestration")!;
  assert.equal(orchestration.reuse, 2); // in A and B
  assert.deepEqual(orchestration.processes.sort(), ["Process A", "Process B"]);
  const scoring = cat.find((c) => c.name === "Risk scoring")!;
  assert.equal(scoring.reuse, 1);
  // most-reused first
  assert.equal(cat[0].name, "Case orchestration");
});

test("applicationRegister: verdict normalised, carries process + vendor", () => {
  const apps = applicationRegister(docs);
  assert.equal(apps.length, 1);
  assert.deepEqual(
    { name: apps[0].name, verdict: apps[0].verdict, vendor: apps[0].vendor, p: apps[0].processTitle },
    { name: "Case Hub", verdict: "BUILD", vendor: "Camunda", p: "Process A" },
  );
});

test("nfrCatalog + adrQueue + migrationPlan: real rows across processes", () => {
  assert.deepEqual(nfrCatalog(docs).map((n) => [n.category, n.target]), [["PERFORMANCE", "p95 < 1.2s"]]);
  const adrs = adrQueue(docs);
  assert.equal(adrs.length, 1);
  assert.equal(adrs[0].status, "accepted");
  assert.equal(adrs[0].owner, "Lead Architect");
  const mig = migrationPlan(docs);
  assert.equal(mig.length, 1);
  assert.deepEqual(mig[0].delivers, ["CAP-B-1"]);
  assert.equal(mig[0].startQuarter, "2026 Q3");
});

test("empty portfolio: no docs → empty everything", () => {
  assert.equal(processPortfolio([]).length, 0);
  assert.equal(capabilityCatalog([]).length, 0);
  assert.equal(applicationRegister([]).length, 0);
  assert.equal(adrQueue([]).length, 0);
});
