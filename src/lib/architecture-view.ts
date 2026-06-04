// Architecture view derivations (R3) — pure functions that turn the authored
// architecture elements of a process into the Diagram and Traceability views.
// No React, no I/O: the ArchitectMiner canvas renders whatever these return.
//
// Relations live on the element's content and surface on the WikiPage DTO under
// `meta` (jsonElementToWikiPage merges content into meta), as a string or a
// string[]. `relIds` normalises either shape to an id list.

import type { WikiPage } from "./wiki.ts";

/** Normalise a relation field (`meta[key]`) to a list of element ids. */
export function relIds(page: WikiPage, key: string): string[] {
  const v = page.meta?.[key];
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string" && x.length > 0);
  if (typeof v === "string" && v.length > 0) return [v];
  return [];
}

// ---- Diagram model ------------------------------------------------------
// Two lanes: target applications on the lower lane, capabilities on the upper
// lane. `hostedIn` draws a capability→application edge; a target-integration's
// `from`/`to` draws an application→application edge, styled by its pattern.

export interface DiagramNode {
  id: string;
  title: string;
  /** Verdict (apps) or criticality (caps) — rendered as the node's sub-label. */
  sub: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DiagramEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** "host" (capability→app) or the integration pattern (sync/async/event/batch). */
  kind: string;
  label?: string;
}

export interface DiagramModel {
  width: number;
  height: number;
  capNodes: DiagramNode[];
  appNodes: DiagramNode[];
  hostEdges: DiagramEdge[];
  intEdges: DiagramEdge[];
  isEmpty: boolean;
}

const NODE_W = 168;
const NODE_H = 64;
const GAP_X = 28;
const MARGIN_X = 40;
const CAP_Y = 70;
const APP_Y = 360;

function layoutRow(pages: WikiPage[], y: number): DiagramNode[] {
  return pages.map((p, i) => ({
    id: p.id,
    title: p.title || p.id,
    sub: "",
    x: MARGIN_X + i * (NODE_W + GAP_X),
    y,
    w: NODE_W,
    h: NODE_H,
  }));
}

/** Build the positioned node/edge model for the target-architecture diagram. */
export function buildDiagramModel(
  caps: WikiPage[],
  apps: WikiPage[],
  integrations: WikiPage[],
): DiagramModel {
  const capNodes = layoutRow(caps, CAP_Y).map((n, i) => ({
    ...n,
    sub: subLabel(caps[i].meta?.criticality),
  }));
  const appNodes = layoutRow(apps, APP_Y).map((n, i) => ({
    ...n,
    sub: subLabel(apps[i].meta?.verdict),
  }));

  const appById = new Map(appNodes.map((n) => [n.id, n]));
  const capById = new Map(capNodes.map((n) => [n.id, n]));

  const hostEdges: DiagramEdge[] = [];
  for (let i = 0; i < caps.length; i++) {
    const capNode = capNodes[i];
    for (const appId of relIds(caps[i], "hostedIn")) {
      const appNode = appById.get(appId);
      if (!appNode) continue;
      hostEdges.push({
        x1: capNode.x + capNode.w / 2,
        y1: capNode.y + capNode.h,
        x2: appNode.x + appNode.w / 2,
        y2: appNode.y,
        kind: "host",
      });
    }
  }

  const intEdges: DiagramEdge[] = [];
  for (const integ of integrations) {
    const fromId = relIds(integ, "from")[0];
    const toId = relIds(integ, "to")[0];
    const a = fromId ? appById.get(fromId) : undefined;
    const b = toId ? appById.get(toId) : undefined;
    if (!a || !b) continue;
    const pattern =
      typeof integ.meta?.pattern === "string" ? integ.meta.pattern.toLowerCase() : "sync";
    intEdges.push({
      x1: a.x + a.w / 2,
      y1: a.y + a.h,
      x2: b.x + b.w / 2,
      y2: b.y + b.h,
      kind: pattern,
      label: integ.title || integ.id,
    });
  }

  const rightmost = Math.max(
    MARGIN_X + 2 * NODE_W,
    ...capNodes.map((n) => n.x + n.w),
    ...appNodes.map((n) => n.x + n.w),
  );

  return {
    width: rightmost + MARGIN_X,
    height: APP_Y + NODE_H + 80,
    capNodes,
    appNodes,
    hostEdges,
    intEdges,
    isEmpty: caps.length === 0 && apps.length === 0,
  };
}

function subLabel(v: unknown): string {
  return typeof v === "string" ? v : "";
}

// ---- Traceability -------------------------------------------------------
// Each architecture element is classified by whether its expected outward (or,
// for applications, inward) relations are present:
//   - traced  — fully connected to the rest of the architecture
//   - partial — connected on some but not all required ends
//   - orphan  — connected to nothing
// The recommendation to the architect is "make every element at least traced".

export type TraceStatus = "traced" | "partial" | "orphan";

export interface TraceRow {
  id: string;
  title: string;
  type: string;
  status: TraceStatus;
  /** Short human reason for the status — what's missing, or what it links to. */
  reason: string;
}

export interface TraceabilitySummary {
  total: number;
  traced: number;
  partial: number;
  orphan: number;
  /** traced / total as a 0–100 integer; 0 when there are no elements. */
  tracedPct: number;
  rows: TraceRow[];
}

export interface ArchElements {
  capabilities: WikiPage[];
  applications: WikiPage[];
  adrs: WikiPage[];
  integrations: WikiPage[];
  components: WikiPage[];
  nfrs: WikiPage[];
  migrations: WikiPage[];
}

function classify(
  page: WikiPage,
  type: string,
  status: TraceStatus,
  reason: string,
): TraceRow {
  return { id: page.id, title: page.title || page.id, type, status, reason };
}

/** Classify every architecture element and roll up the totals. */
export function buildTraceability(arch: ArchElements): TraceabilitySummary {
  const rows: TraceRow[] = [];

  // Applications are traced by what *points at* them (capabilities hostedIn +
  // their driving ADR), so pre-compute the inbound host count per app.
  const hostCount = new Map<string, number>();
  for (const cap of arch.capabilities) {
    for (const appId of relIds(cap, "hostedIn")) {
      hostCount.set(appId, (hostCount.get(appId) ?? 0) + 1);
    }
  }

  for (const cap of arch.capabilities) {
    const host = relIds(cap, "hostedIn").length > 0;
    const grounded =
      relIds(cap, "realisesStep").length > 0 || relIds(cap, "resolvesGap").length > 0;
    if (host && grounded) rows.push(classify(cap, "capability", "traced", "hosted + grounded upstream"));
    else if (host) rows.push(classify(cap, "capability", "partial", "hosted, but not traced to a target step or gap"));
    else rows.push(classify(cap, "capability", "orphan", "not hosted in any application"));
  }

  for (const app of arch.applications) {
    const hosts = hostCount.get(app.id) ?? 0;
    const hasAdr = relIds(app, "drivenByADR").length > 0;
    if (hosts > 0 && hasAdr) rows.push(classify(app, "target-application", "traced", `hosts ${hosts} capability(s) · has ADR`));
    else if (hosts > 0 || hasAdr) rows.push(classify(app, "target-application", "partial", hosts > 0 ? "hosts capabilities, no driving ADR" : "has ADR but hosts no capability"));
    else rows.push(classify(app, "target-application", "orphan", "hosts no capability and has no ADR"));
  }

  for (const adr of arch.adrs) {
    const links =
      relIds(adr, "decision").length + relIds(adr, "resolvesGap").length + relIds(adr, "satisfiesControl").length;
    if (links > 0) rows.push(classify(adr, "adr", "traced", "linked to a decision / gap / control"));
    else rows.push(classify(adr, "adr", "orphan", "records a decision traced to nothing upstream"));
  }

  for (const integ of arch.integrations) {
    const from = relIds(integ, "from").length > 0;
    const to = relIds(integ, "to").length > 0;
    if (from && to) rows.push(classify(integ, "target-integration", "traced", "connects two applications"));
    else if (from || to) rows.push(classify(integ, "target-integration", "partial", "names only one endpoint"));
    else rows.push(classify(integ, "target-integration", "orphan", "names no endpoints"));
  }

  for (const comp of arch.components) {
    if (relIds(comp, "inApp").length > 0) rows.push(classify(comp, "component", "traced", "lives in an application"));
    else rows.push(classify(comp, "component", "orphan", "not placed in any application"));
  }

  for (const nfr of arch.nfrs) {
    const links =
      relIds(nfr, "appliesTo").length + relIds(nfr, "satisfiesControl").length + relIds(nfr, "regulatedBy").length;
    if (links > 0) rows.push(classify(nfr, "nfr", "traced", "applies to / satisfies something"));
    else rows.push(classify(nfr, "nfr", "orphan", "constrains nothing"));
  }

  for (const mig of arch.migrations) {
    if (relIds(mig, "delivers").length > 0) rows.push(classify(mig, "migration-phase", "traced", "delivers architecture elements"));
    else rows.push(classify(mig, "migration-phase", "orphan", "delivers nothing"));
  }

  const total = rows.length;
  const traced = rows.filter((r) => r.status === "traced").length;
  const partial = rows.filter((r) => r.status === "partial").length;
  const orphan = rows.filter((r) => r.status === "orphan").length;
  return {
    total,
    traced,
    partial,
    orphan,
    tracedPct: total === 0 ? 0 : Math.round((traced / total) * 100),
    rows,
  };
}
