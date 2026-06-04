// Cross-process architecture aggregation (R4) — pure functions behind the
// ArchitectMiner Personal Work + Library tiers. Given every process's
// ProcessDoc, they roll the authored architecture elements up across the whole
// portfolio: the per-process progress table, the ADR queue, the migration
// phases, and the capability / application / NFR catalogs (with cross-process
// reuse). No React, no I/O.
//
// Relations + frontmatter fields live on the WikiPage DTO under `meta` (see
// architecture-view.ts / jsonElementToWikiPage). `str` reads a scalar field.

import type { ProcessDoc, WikiPage } from "./wiki.ts";
import { relIds } from "./architecture-view.ts";

/** One authored architecture element, tagged with the process it belongs to. */
export interface PortfolioElement {
  id: string;
  title: string;
  /** The element's WikiPage (meta carries fields + relations). */
  page: WikiPage;
  processSlug: string;
  processId: string;
  processTitle: string;
}

export interface ProcessArch {
  slug: string;
  id: string;
  title: string;
  lastModified?: string;
  caps: number;
  apps: number;
  adrs: number;
  integrations: number;
  components: number;
  nfrs: number;
  migrations: number;
  /** Total authored architecture elements. */
  total: number;
  /** Coarse stage derived from what's authored so far. */
  stage: "upstream" | "domain" | "solution";
}

function str(page: WikiPage, key: string): string {
  const v = page.meta?.[key];
  return typeof v === "string" ? v : "";
}

function bySection(doc: ProcessDoc, section: string): WikiPage[] {
  return doc.elements.filter((el) => el.section === section);
}

function tag(doc: ProcessDoc, pages: WikiPage[]): PortfolioElement[] {
  return pages.map((page) => ({
    id: page.id,
    title: page.title || page.id,
    page,
    processSlug: doc.slug,
    processId: doc.process.id,
    processTitle: doc.process.title,
  }));
}

export interface PortfolioCollections {
  capabilities: PortfolioElement[];
  applications: PortfolioElement[];
  adrs: PortfolioElement[];
  integrations: PortfolioElement[];
  components: PortfolioElement[];
  nfrs: PortfolioElement[];
  migrations: PortfolioElement[];
}

/** Flatten every authored architecture element across all processes. */
export function collectArchitecture(docs: ProcessDoc[]): PortfolioCollections {
  const out: PortfolioCollections = {
    capabilities: [],
    applications: [],
    adrs: [],
    integrations: [],
    components: [],
    nfrs: [],
    migrations: [],
  };
  for (const doc of docs) {
    out.capabilities.push(...tag(doc, bySection(doc, "capabilities")));
    out.applications.push(...tag(doc, bySection(doc, "target-applications")));
    out.adrs.push(...tag(doc, bySection(doc, "architecture-decisions")));
    out.integrations.push(...tag(doc, bySection(doc, "target-integrations")));
    out.components.push(...tag(doc, bySection(doc, "components")));
    out.nfrs.push(...tag(doc, bySection(doc, "nfrs")));
    out.migrations.push(...tag(doc, bySection(doc, "migration-phases")));
  }
  return out;
}

/** Per-process architecture progress, newest activity first. */
export function processPortfolio(docs: ProcessDoc[]): ProcessArch[] {
  const rows = docs.map((doc): ProcessArch => {
    const caps = bySection(doc, "capabilities").length;
    const apps = bySection(doc, "target-applications").length;
    const adrs = bySection(doc, "architecture-decisions").length;
    const integrations = bySection(doc, "target-integrations").length;
    const components = bySection(doc, "components").length;
    const nfrs = bySection(doc, "nfrs").length;
    const migrations = bySection(doc, "migration-phases").length;
    const total = caps + apps + adrs + integrations + components + nfrs + migrations;
    // Stage: solution work present → "solution"; any domain element → "domain";
    // nothing authored → "upstream".
    const stage =
      integrations + components + nfrs + migrations > 0
        ? "solution"
        : caps + apps + adrs > 0
          ? "domain"
          : "upstream";
    return {
      slug: doc.slug,
      id: doc.process.id,
      title: doc.process.title,
      lastModified: doc.lastModified,
      caps,
      apps,
      adrs,
      integrations,
      components,
      nfrs,
      migrations,
      total,
      stage,
    };
  });
  rows.sort((a, b) => (b.lastModified ?? "").localeCompare(a.lastModified ?? ""));
  return rows;
}

// ---- Catalog rows -------------------------------------------------------

export interface CapabilityCatalogRow {
  /** Representative element id (first occurrence). */
  id: string;
  name: string;
  criticality: string;
  /** Number of distinct processes that authored a capability with this name. */
  reuse: number;
  /** The processes (titles) the capability appears in. */
  processes: string[];
}

/** Capability catalog with cross-process reuse — grouped by normalised name. */
export function capabilityCatalog(docs: ProcessDoc[]): CapabilityCatalogRow[] {
  const byName = new Map<string, { rep: PortfolioElement; processes: Set<string>; crit: string }>();
  for (const cap of collectArchitecture(docs).capabilities) {
    const key = cap.title.trim().toLowerCase();
    if (!key) continue;
    const entry = byName.get(key);
    if (entry) {
      entry.processes.add(cap.processTitle);
    } else {
      byName.set(key, {
        rep: cap,
        processes: new Set([cap.processTitle]),
        crit: str(cap.page, "criticality"),
      });
    }
  }
  const rows = [...byName.values()].map((e) => ({
    id: e.rep.id,
    name: e.rep.title,
    criticality: e.crit,
    reuse: e.processes.size,
    processes: [...e.processes],
  }));
  // Most-reused first, then by name.
  rows.sort((a, b) => b.reuse - a.reuse || a.name.localeCompare(b.name));
  return rows;
}

export interface ApplicationRow {
  id: string;
  name: string;
  verdict: string;
  vendor: string;
  processTitle: string;
}

/** Application register across processes, grouped by BUILD/BUY/CONFIGURE/KEEP. */
export function applicationRegister(docs: ProcessDoc[]): ApplicationRow[] {
  return collectArchitecture(docs).applications.map((app) => ({
    id: app.id,
    name: app.title,
    verdict: str(app.page, "verdict").toUpperCase(),
    vendor: str(app.page, "vendor"),
    processTitle: app.processTitle,
  }));
}

export interface NfrRow {
  id: string;
  name: string;
  category: string;
  target: string;
  processTitle: string;
}

/** Every NFR across processes. */
export function nfrCatalog(docs: ProcessDoc[]): NfrRow[] {
  return collectArchitecture(docs).nfrs.map((nfr) => ({
    id: nfr.id,
    name: nfr.title,
    category: str(nfr.page, "category").toUpperCase(),
    target: str(nfr.page, "target"),
    processTitle: nfr.processTitle,
  }));
}

export interface AdrRow {
  id: string;
  title: string;
  status: string;
  owner: string;
  processTitle: string;
  processId: string;
}

/** Every ADR across processes, with its lifecycle status. */
export function adrQueue(docs: ProcessDoc[]): AdrRow[] {
  return collectArchitecture(docs).adrs.map((adr) => ({
    id: adr.id,
    title: adr.title,
    status: (str(adr.page, "adrStatus") || "draft").toLowerCase(),
    owner: str(adr.page, "owner"),
    processTitle: adr.processTitle,
    processId: adr.processId,
  }));
}

export interface MigrationRow {
  id: string;
  title: string;
  phaseStatus: string;
  startQuarter: string;
  endQuarter: string;
  processTitle: string;
  processId: string;
  /** Ids this phase delivers. */
  delivers: string[];
}

/** Every migration phase across processes. */
export function migrationPlan(docs: ProcessDoc[]): MigrationRow[] {
  return collectArchitecture(docs).migrations.map((mig) => ({
    id: mig.id,
    title: mig.title,
    phaseStatus: (str(mig.page, "phaseStatus") || "planned").toLowerCase(),
    startQuarter: str(mig.page, "startQuarter"),
    endQuarter: str(mig.page, "endQuarter"),
    processTitle: mig.processTitle,
    processId: mig.processId,
    delivers: relIds(mig.page, "delivers"),
  }));
}
