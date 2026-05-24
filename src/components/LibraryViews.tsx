"use client";

// Cross-process Library views in the ArchitectMiner shell. Each view walks
// every process the architect has access to and aggregates that section's
// element type into a single bank-wide catalogue. The architect uses these
// to find existing pieces before declaring something "new" — capabilities
// reused across 3+ processes are the obvious candidates for promotion to
// the catalog, applications already KEEP are the obvious targets to host
// a new capability without inventing one. JSX shape ports from
// public/architectminer.html frames 12-15. Pattern library stays static
// until a "pattern" element type is added to the schema.

import { useMemo } from "react";
import type { ProcessDoc, WikiPage } from "@/lib/wiki";

// Treat unknown fields as strings for downstream comparisons. Returns "" for
// missing/non-string values, so an undefined meta field doesn't blow up the
// uppercase comparison.
function metaStr(meta: Record<string, unknown>, key: string): string {
  const v = meta[key];
  return typeof v === "string" ? v : "";
}

function metaList(meta: Record<string, unknown>, key: string): string[] {
  const v = meta[key];
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string");
  if (typeof v === "string" && v) return [v];
  return [];
}

type EnrichedElement = { el: WikiPage; doc: ProcessDoc };

// Cross-process element index — for every element of `section`, return the
// element plus the process it came from (so the row can show "+ 3 processes"
// or link back).
function collect(docs: ProcessDoc[], section: string): EnrichedElement[] {
  const out: EnrichedElement[] = [];
  for (const doc of docs) {
    for (const el of doc.elements) {
      if (el.section === section) out.push({ el, doc });
    }
  }
  return out;
}

// ---------------------------------------------------------------------
// Capability catalog
// ---------------------------------------------------------------------
export function CapabilityCatalog({ docs }: { docs: ProcessDoc[] }) {
  const stats = useMemo(() => {
    const caps = collect(docs, "capabilities");
    // Same capability title appearing across processes counts as reused.
    const byTitle: Record<string, EnrichedElement[]> = {};
    for (const e of caps) {
      const key = e.el.title.trim().toLowerCase();
      (byTitle[key] ??= []).push(e);
    }
    const critN = caps.filter((e) => metaStr(e.el.meta, "criticality").toUpperCase() === "CRITICAL").length;
    const highN = caps.filter((e) => metaStr(e.el.meta, "criticality").toUpperCase() === "HIGH").length;
    const reusedN = Object.values(byTitle).filter((g) => g.length >= 2).length;
    const processCount = new Set(caps.map((e) => e.doc.slug)).size;
    return { caps, byTitle, critN, highN, reusedN, processCount };
  }, [docs]);

  // Apps across all processes — needed to resolve hostedIn → app title.
  const appsById = useMemo(() => {
    const m = new Map<string, WikiPage>();
    for (const doc of docs) {
      for (const el of doc.elements) {
        if (el.section === "target-applications") m.set(el.id, el);
      }
    }
    return m;
  }, [docs]);

  return (
    <>
      <div className="am-lib-head">
        <h1>Capability catalog</h1>
        <p className="am-sub">
          {stats.caps.length} capabilit{stats.caps.length === 1 ? "y" : "ies"} authored across{" "}
          {stats.processCount} process{stats.processCount === 1 ? "" : "es"} · {stats.reusedN} used in 2+ processes ·
          check before declaring &ldquo;new&rdquo;
        </p>
      </div>

      <div className="am-filters">
        <button type="button" className="am-chip am-chip-on">All <span className="am-chip-n">{stats.caps.length}</span></button>
        <button type="button" className="am-chip">Reused <span className="am-chip-n">{stats.reusedN}</span></button>
        <button type="button" className="am-chip">Critical <span className="am-chip-n">{stats.critN}</span></button>
        <button type="button" className="am-chip">High <span className="am-chip-n">{stats.highN}</span></button>
        <span style={{ flex: 1 }} />
        <input className="am-search" placeholder="Search by name, ID or hosted-in app…" />
      </div>

      {stats.caps.length === 0 ? (
        <div className="am-input-empty" style={{ marginTop: 20 }}>
          No capabilities authored anywhere yet. Open a process, author a
          capability under <code>Domain Architecture</code>, and it&rsquo;ll
          appear here.
        </div>
      ) : (
        <div className="am-cat-grid">
          {stats.caps.map(({ el, doc }) => {
            const hostId = metaList(el.meta, "hostedIn")[0];
            const hostApp = hostId ? appsById.get(hostId) : undefined;
            const titleKey = el.title.trim().toLowerCase();
            const reuseN = stats.byTitle[titleKey]?.length ?? 1;
            const verdict = (hostApp ? metaStr(hostApp.meta, "verdict") : "").toUpperCase();
            const crit = metaStr(el.meta, "criticality").toUpperCase();
            return (
              <CatalogCard
                key={el.id}
                id={el.id}
                name={el.title}
                reuse={reuseN}
                reuseClass={reuseN >= 3 ? "hi" : reuseN === 1 ? "solo" : undefined}
                critical={crit === "CRITICAL"}
                high={crit === "HIGH"}
                host={hostApp?.title ?? "—"}
                hostTag={
                  verdict === "BUILD" || verdict === "BUY" || verdict === "CONFIGURE" || verdict === "KEEP"
                    ? (verdict as "BUILD" | "BUY" | "CONFIGURE" | "KEEP")
                    : undefined
                }
                procs={[doc.process.title]}
                prov={el.status === "confirmed" ? "verified" : "machine"}
                provText={el.status === "confirmed" ? "approved" : "draft · pending review"}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

function CatalogCard({
  id, name, reuse, reuseClass, critical, high, host, hostTag, procs, prov, provText, selected,
}: {
  id: string;
  name: string;
  reuse: number;
  reuseClass?: "hi" | "solo";
  critical?: boolean;
  high?: boolean;
  host: string;
  hostTag?: "BUILD" | "BUY" | "CONFIGURE" | "KEEP";
  procs: string[];
  prov: "verified" | "machine";
  provText: string;
  selected?: boolean;
}) {
  const reuseLabel = reuse === 1 ? `solo · ${procs[0]}` : `${reuseClass === "hi" ? "★ " : ""}used in ${reuse}`;
  return (
    <div className={`am-canvas-cap-card${selected ? " am-canvas-cap-card-sel" : ""}`}>
      <div className="am-canvas-cap-head">
        <span className="am-canvas-cap-id">{id}</span>
        <span className={`am-reuse-pill${reuseClass ? ` am-reuse-pill-${reuseClass}` : ""}`}>{reuseLabel}</span>
      </div>
      <div className="am-canvas-cap-name">{name}</div>
      <div className="am-canvas-cap-meta">
        {critical && <span className="am-pill am-pill-neu">Critical</span>}
        {high && <span className="am-pill am-pill-mid">High</span>}
      </div>
      <div className="am-canvas-cap-host">
        hosted in: <b>{host}</b>
        {hostTag && <span className={`am-verdict am-verdict-${hostTag.toLowerCase()}`} style={{ marginLeft: 6 }}>{hostTag}</span>}
      </div>
      <div className="am-cat-procs">
        {procs.map((p, i) => <span key={i} className="am-cat-pchip">{p}</span>)}
      </div>
      <div className={`am-canvas-cap-prov am-canvas-cap-prov-${prov}`}>
        {prov === "verified" ? "✓" : "▲"} {provText}
      </div>
    </div>
  );
}


// ---------------------------------------------------------------------
// Application register
// ---------------------------------------------------------------------
export function ApplicationRegister({ docs }: { docs: ProcessDoc[] }) {
  const stats = useMemo(() => {
    const apps = collect(docs, "target-applications");
    const verdicts = { BUILD: 0, BUY: 0, CONFIGURE: 0, KEEP: 0 };
    for (const { el } of apps) {
      const v = metaStr(el.meta, "verdict").toUpperCase();
      if (v in verdicts) verdicts[v as keyof typeof verdicts]++;
    }
    // For each app, find the capabilities that host in it (across all docs).
    const capsHostedByApp: Record<string, WikiPage[]> = {};
    for (const doc of docs) {
      for (const el of doc.elements) {
        if (el.section !== "capabilities") continue;
        for (const hid of metaList(el.meta, "hostedIn")) {
          (capsHostedByApp[hid] ??= []).push(el);
        }
      }
    }
    return { apps, verdicts, capsHostedByApp };
  }, [docs]);

  return (
    <>
      <div className="am-lib-head">
        <h1>Application register</h1>
        <p className="am-sub">
          {stats.apps.length} application{stats.apps.length === 1 ? "" : "s"} across the bank · {stats.verdicts.KEEP} KEEP /
          {" "}{stats.verdicts.BUILD} BUILD / {stats.verdicts.BUY} BUY / {stats.verdicts.CONFIGURE} CONFIGURE
        </p>
      </div>

      <div className="am-filters">
        <button type="button" className="am-chip am-chip-on">All <span className="am-chip-n">{stats.apps.length}</span></button>
        <button type="button" className="am-chip">BUILD <span className="am-chip-n">{stats.verdicts.BUILD}</span></button>
        <button type="button" className="am-chip">BUY <span className="am-chip-n">{stats.verdicts.BUY}</span></button>
        <button type="button" className="am-chip">CONFIGURE <span className="am-chip-n">{stats.verdicts.CONFIGURE}</span></button>
        <button type="button" className="am-chip">KEEP <span className="am-chip-n">{stats.verdicts.KEEP}</span></button>
        <span style={{ flex: 1 }} />
        <input className="am-search" placeholder="Search by name, vendor or capability…" />
      </div>

      {stats.apps.length === 0 ? (
        <div className="am-input-empty" style={{ marginTop: 20 }}>
          No target applications authored anywhere yet.
        </div>
      ) : (
        <table className="am-canvas-app-table" style={{ marginTop: 14 }}>
          <thead>
            <tr>
              <th style={{ width: "22%" }}>Application</th>
              <th>Verdict</th>
              <th>Vendor / tech</th>
              <th>Capabilities hosted</th>
              <th>Used by</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.apps.map(({ el, doc }) => {
              const verdict = metaStr(el.meta, "verdict").toLowerCase() as "build" | "buy" | "configure" | "keep";
              const validVerdict =
                verdict === "build" || verdict === "buy" || verdict === "configure" || verdict === "keep"
                  ? verdict
                  : "keep";
              return (
                <RegisterRow
                  key={el.id}
                  name={el.title}
                  id={el.id}
                  domain={metaStr(el.meta, "domain") || "—"}
                  verdict={validVerdict}
                  tech={metaStr(el.meta, "vendor") || metaStr(el.meta, "tech") || "—"}
                  techSub={metaStr(el.meta, "owner") || ""}
                  caps={(stats.capsHostedByApp[el.id] ?? []).map((c) => c.title)}
                  usedBy={[doc.process.title]}
                  status={el.status === "confirmed" ? "Approved" : "Draft"}
                  statusTone={el.status === "confirmed" ? "hi" : "mid"}
                />
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}

function RegisterRow({
  selected, name, id, domain, verdict, tech, techSub, caps, usedBy, status, statusTone,
}: {
  selected?: boolean;
  name: string;
  id: string;
  domain: string;
  verdict: "build" | "buy" | "configure" | "keep";
  tech: string;
  techSub: string;
  caps: string[];
  usedBy: string | string[];
  status: string;
  statusTone: "hi" | "mid";
}) {
  return (
    <tr className={selected ? "am-canvas-app-sel" : undefined}>
      <td>
        <div className="am-canvas-app-name">{name}</div>
        <div className="am-canvas-app-id">{id}</div>
        <div className="am-app-domain">{domain}</div>
      </td>
      <td><span className={`am-verdict am-verdict-${verdict}`}>{verdict.toUpperCase()}</span></td>
      <td>
        <div>{tech}</div>
        {techSub && <div className="am-canvas-app-stack">{techSub}</div>}
      </td>
      <td>
        <div className="am-canvas-app-chips">
          {caps.length === 0
            ? <span className="am-canvas-app-stack">— no hosted capabilities yet</span>
            : caps.map((c, i) => <span key={i} className="am-canvas-app-chip">{c}</span>)}
        </div>
      </td>
      <td>
        <div className="am-cat-procs">
          {typeof usedBy === "string"
            ? <span className="am-cat-pchip">{usedBy}</span>
            : usedBy.map((p, i) => <span key={i} className="am-cat-pchip">{p}</span>)}
        </div>
      </td>
      <td><span className={`am-pill am-pill-${statusTone}`}><span className="am-dot" />{status}</span></td>
    </tr>
  );
}


// ---------------------------------------------------------------------
// NFR templates — grouped by category
// ---------------------------------------------------------------------
type NfrCat = "perf" | "avail" | "sec" | "comp" | "scale";

const NFR_CAT_LABEL: Record<NfrCat, string> = {
  perf: "Performance",
  avail: "Availability",
  sec: "Security",
  comp: "Compliance",
  scale: "Scalability",
};

function nfrCategoryToShort(raw: string): NfrCat {
  const v = raw.toUpperCase();
  if (v.startsWith("PERF")) return "perf";
  if (v.startsWith("AVAIL")) return "avail";
  if (v.startsWith("SEC")) return "sec";
  if (v.startsWith("COMP")) return "comp";
  if (v.startsWith("SCAL")) return "scale";
  return "perf";
}

export function NfrTemplates({ docs }: { docs: ProcessDoc[] }) {
  const groups = useMemo(() => {
    const nfrs = collect(docs, "nfrs");
    const buckets: Record<NfrCat, EnrichedElement[]> = {
      perf: [], avail: [], sec: [], comp: [], scale: [],
    };
    for (const e of nfrs) {
      buckets[nfrCategoryToShort(metaStr(e.el.meta, "category"))].push(e);
    }
    return { all: nfrs, buckets };
  }, [docs]);

  return (
    <>
      <div className="am-lib-head">
        <h1>NFR templates</h1>
        <p className="am-sub">
          {groups.all.length} authored NFR{groups.all.length === 1 ? "" : "s"} across the bank ·{" "}
          {groups.buckets.perf.length} perf / {groups.buckets.avail.length} avail / {groups.buckets.sec.length} sec /
          {" "}{groups.buckets.comp.length} comp / {groups.buckets.scale.length} scale
        </p>
      </div>

      <div className="am-filters">
        <button type="button" className="am-chip am-chip-on">All <span className="am-chip-n">{groups.all.length}</span></button>
        {(Object.keys(NFR_CAT_LABEL) as NfrCat[]).map((cat) => (
          <button key={cat} type="button" className="am-chip">
            {NFR_CAT_LABEL[cat]} <span className="am-chip-n">{groups.buckets[cat].length}</span>
          </button>
        ))}
        <span style={{ flex: 1 }} />
        <input className="am-search" placeholder="Search templates…" />
      </div>

      {groups.all.length === 0 ? (
        <div className="am-input-empty" style={{ marginTop: 20 }}>
          No NFRs authored yet anywhere. NFRs you author on individual processes
          will collect into this catalogue.
        </div>
      ) : (
        (Object.keys(NFR_CAT_LABEL) as NfrCat[]).map((cat) => {
          const items = groups.buckets[cat];
          if (items.length === 0) return null;
          return (
            <NfrTmplGroup key={cat} title={NFR_CAT_LABEL[cat]} count={items.length}>
              {items.map(({ el, doc }) => (
                <NfrTmplCard
                  key={el.id}
                  id={el.id}
                  cat={cat}
                  name={el.title}
                  target={metaStr(el.meta, "target") || "—"}
                  satisfies={metaList(el.meta, "satisfies")}
                  process={doc.process.title}
                />
              ))}
            </NfrTmplGroup>
          );
        })
      )}
    </>
  );
}

function NfrTmplGroup({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="am-nfr-tmpl-group">
      <div className="am-nfr-tmpl-head">
        <h3>{title}</h3>
        <span className="am-nfr-tmpl-count">{count} authored</span>
      </div>
      <div className="am-nfr-tmpl-cards">{children}</div>
    </div>
  );
}

function NfrTmplCard({
  id, cat, name, target, satisfies, process,
}: {
  id: string;
  cat: NfrCat;
  name: string;
  target: string;
  satisfies: string[];
  process: string;
}) {
  return (
    <div className="am-nfr-tmpl-card">
      <div className="am-nfr-tmpl-head-row">
        <span className="am-nfr-tmpl-id">{id}</span>
        <span className={`am-nfr-cat am-nfr-cat-${cat}`}>{cat.toUpperCase()}</span>
        <span className="am-reuse-pill" style={{ marginLeft: "auto" }}>{process}</span>
      </div>
      <div className="am-nfr-tmpl-name">{name}</div>
      <div className="am-nfr-tmpl-target">{target}</div>
      {satisfies.length > 0 && (
        <div className="am-nfr-tmpl-traces">
          <span className="am-nfr-tmpl-traces-lbl">satisfies</span>
          {satisfies.map((s, i) => <span key={i}>{s}</span>)}
        </div>
      )}
    </div>
  );
}

