"use client";

// Personal Work views in the ArchitectMiner shell.
// Cross-process queues for the current architect — the "what am I working
// on across the portfolio" tier. Each view walks every process the architect
// has access to and aggregates architect-side elements by status / owner /
// process. JSX shape ports from public/architectminer.html frames 16-18.

import { useMemo } from "react";
import type { ProcessDoc, WikiPage } from "@/lib/wiki";
import type { User } from "@/lib/user";

function metaStr(meta: Record<string, unknown>, key: string): string {
  const v = meta[key];
  return typeof v === "string" ? v : "";
}

// ---------------------------------------------------------------------
// All processes — portfolio table
// ---------------------------------------------------------------------
type Stage = "upstream" | "ready" | "domain" | "solution" | "build" | "complete";
type ProgressTone = "" | "mid" | "hi";

function StageChip({ stage, label }: { stage: Stage; label: string }) {
  return <span className={`am-stage am-stage-${stage}`}>{label}</span>;
}

function MicroBar({ pct, tone }: { pct: number; tone: ProgressTone }) {
  return (
    <div className={`am-micro-bar${tone ? ` am-micro-bar-${tone}` : ""}`}>
      <i style={{ width: `${pct}%` }} />
    </div>
  );
}

function Avatar({ initials }: { initials: string }) {
  return <span className="am-avatar-inline">{initials}</span>;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Bucket a process into one of the six architect-side stages, based on what
// architect-side elements have been authored and what the upstream looks like.
//   upstream  — process exists but no architect work + upstream not approved
//   ready     — upstream approved but no architect-side elements yet
//   domain    — capabilities authored, ADRs in progress
//   solution  — apps + integrations + NFRs in progress
//   build     — migration phases authored + most elements approved
//   complete  — all migration phases marked done
function archStage(doc: ProcessDoc): { stage: Stage; label: string } {
  const caps = doc.elements.filter((e) => e.section === "capabilities");
  const apps = doc.elements.filter((e) => e.section === "target-applications");
  const adrs = doc.elements.filter((e) => e.section === "architecture-decisions");
  const integ = doc.elements.filter((e) => e.section === "target-integrations");
  const nfrs = doc.elements.filter((e) => e.section === "nfrs");
  const migs = doc.elements.filter((e) => e.section === "migration-phases");

  if (migs.length > 0 && migs.every((m) => m.status === "confirmed")) {
    return { stage: "complete", label: "COMPLETE" };
  }
  if (migs.length > 0) return { stage: "build", label: "IN BUILD" };
  if (apps.length > 0 || integ.length > 0 || nfrs.length > 0) {
    return { stage: "solution", label: "IN SOLUTION" };
  }
  if (caps.length > 0 || adrs.length > 0) return { stage: "domain", label: "IN DOMAIN" };
  // No architect-side work: is upstream done?
  const upstreamSections = ["to-be-design", "transformation-decisions", "requirements", "gap-resolution"];
  const upstream = doc.elements.filter((e) => upstreamSections.includes(e.section));
  if (upstream.length > 0 && upstream.every((e) => e.status === "confirmed")) {
    return { stage: "ready", label: "READY" };
  }
  return { stage: "upstream", label: "UPSTREAM" };
}

export function AllProcesses({ docs }: { docs: ProcessDoc[] }) {
  const rows = useMemo(() => {
    return docs.map((doc) => {
      const s = archStage(doc);
      const caps = doc.elements.filter((e) => e.section === "capabilities").length;
      const apps = doc.elements.filter((e) => e.section === "target-applications").length;
      const adrs = doc.elements.filter((e) => e.section === "architecture-decisions").length;
      const nfrs = doc.elements.filter((e) => e.section === "nfrs").length;
      const migs = doc.elements.filter((e) => e.section === "migration-phases").length;
      const total = caps + apps + adrs + nfrs + migs;
      // Crude progress: % of architect-side elements that are confirmed.
      const archEls = doc.elements.filter((e) =>
        ["capabilities", "target-applications", "architecture-decisions", "target-integrations", "components", "nfrs", "migration-phases"].includes(e.section),
      );
      const confirmed = archEls.filter((e) => e.status === "confirmed").length;
      const pct = archEls.length === 0 ? 0 : Math.round((confirmed / archEls.length) * 100);
      const tone: ProgressTone = pct >= 80 ? "hi" : pct >= 40 ? "mid" : "";
      return {
        doc,
        stage: s,
        elementCounts: { caps, apps, adrs, nfrs, migs, total, confirmed },
        pct,
        tone,
      };
    });
  }, [docs]);

  const stageCounts = useMemo(() => {
    const c: Record<Stage, number> = { upstream: 0, ready: 0, domain: 0, solution: 0, build: 0, complete: 0 };
    for (const r of rows) c[r.stage.stage]++;
    return c;
  }, [rows]);

  return (
    <>
      <div className="am-lib-head">
        <h1>All processes</h1>
        <p className="am-sub">
          {docs.length} process{docs.length === 1 ? "" : "es"} · {stageCounts.upstream} upstream ·{" "}
          {stageCounts.ready} ready · {stageCounts.domain} in domain ·{" "}
          {stageCounts.solution} in solution · {stageCounts.build} in build · all driven from Processminer
        </p>
      </div>

      <div className="am-filters">
        <button type="button" className="am-chip am-chip-on">All <span className="am-chip-n">{docs.length}</span></button>
        <button type="button" className="am-chip">Upstream <span className="am-chip-n">{stageCounts.upstream}</span></button>
        <button type="button" className="am-chip">Ready <span className="am-chip-n">{stageCounts.ready}</span></button>
        <button type="button" className="am-chip">In domain <span className="am-chip-n">{stageCounts.domain}</span></button>
        <button type="button" className="am-chip">In solution <span className="am-chip-n">{stageCounts.solution}</span></button>
        <button type="button" className="am-chip">In build <span className="am-chip-n">{stageCounts.build}</span></button>
        <span style={{ flex: 1 }} />
        <input className="am-search" placeholder="Search process or ID…" />
      </div>

      <table className="am-canvas-app-table" style={{ marginTop: 14 }}>
        <thead>
          <tr>
            <th style={{ width: "24%" }}>Process</th>
            <th>Stage</th>
            <th>Architect elements</th>
            <th>Architecture progress</th>
            <th>Approved</th>
            <th>Owner</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const c = r.elementCounts;
            const progress = c.total === 0
              ? "—"
              : `${c.adrs} ADR${c.adrs === 1 ? "" : "s"} · ${c.caps} cap${c.caps === 1 ? "" : "s"} · ${c.apps} app${c.apps === 1 ? "" : "s"} · ${c.nfrs} NFR${c.nfrs === 1 ? "" : "s"}`;
            const owner = metaStr(r.doc.process.meta, "owner") || metaStr(r.doc.process.meta, "documentedBy") || "—";
            return (
              <ProcessRow
                key={r.doc.slug}
                name={r.doc.process.title}
                id={r.doc.process.id}
                domain={metaStr(r.doc.process.meta, "domain") || metaStr(r.doc.process.meta, "owningArea") || ""}
                stage={r.stage.stage}
                stageLabel={r.stage.label}
                progress={progress}
                pct={r.pct}
                tone={r.tone}
                progressSub={c.total === 0 ? "no architect-side work yet" : `${c.confirmed}/${c.total} approved`}
                activity={`${c.total} element${c.total === 1 ? "" : "s"}`}
                owner={owner}
                initials={getInitials(owner)}
              />
            );
          })}
        </tbody>
      </table>
    </>
  );
}

function ProcessRow({
  name, id, domain, stage, stageLabel,
  progress, pct, tone, progressSub, activity, owner, initials,
}: {
  name: string;
  id: string;
  domain: string;
  stage: Stage;
  stageLabel: string;
  progress: string;
  pct: number;
  tone: ProgressTone;
  progressSub: string;
  activity: string;
  owner: string;
  initials: string;
}) {
  return (
    <tr>
      <td>
        <div className="am-canvas-app-name">{name}</div>
        <div className="am-canvas-app-id">{id}</div>
        {domain && <div className="am-app-domain">{domain}</div>}
      </td>
      <td><StageChip stage={stage} label={stageLabel} /></td>
      <td>
        <div>{progress}</div>
        <div className="am-canvas-app-stack">{progressSub}</div>
      </td>
      <td>
        <MicroBar pct={pct} tone={tone} />
        <div className="am-canvas-app-stack">{pct}%</div>
      </td>
      <td>
        <div>{activity}</div>
      </td>
      <td><Avatar initials={initials} /></td>
    </tr>
  );
}


// ---------------------------------------------------------------------
// My ADRs — personal queue
// ---------------------------------------------------------------------
type AdrStatus = "draft" | "proposed" | "accepted" | "rejected" | "superseded";

function normalizeAdrStatus(raw: string): AdrStatus {
  const v = raw.toLowerCase();
  if (v === "draft" || v === "proposed" || v === "accepted" || v === "rejected" || v === "superseded") {
    return v as AdrStatus;
  }
  return "draft";
}

type AdrItem = { el: WikiPage; doc: ProcessDoc; status: AdrStatus; mine: boolean };

export function MyAdrs({ docs, user }: { docs: ProcessDoc[]; user: User }) {
  const adrs = useMemo<AdrItem[]>(() => {
    const out: AdrItem[] = [];
    for (const doc of docs) {
      for (const el of doc.elements) {
        if (el.section !== "architecture-decisions") continue;
        const status = normalizeAdrStatus(metaStr(el.meta, "adrStatus"));
        const owner = metaStr(el.meta, "owner");
        const mine = owner === user.name || owner === user.username || owner === "";
        out.push({ el, doc, status, mine });
      }
    }
    return out;
  }, [docs, user]);

  const stats = useMemo(() => {
    const mine = adrs.filter((a) => a.mine);
    const byStatus = (s: AdrStatus) => mine.filter((a) => a.status === s).length;
    return {
      total: mine.length,
      drafts: byStatus("draft"),
      proposed: byStatus("proposed"),
      accepted: byStatus("accepted"),
      rejected: byStatus("rejected") + byStatus("superseded"),
      processCount: new Set(mine.map((a) => a.doc.slug)).size,
    };
  }, [adrs]);

  const mine = adrs.filter((a) => a.mine);

  return (
    <>
      <div className="am-lib-head">
        <h1>My ADRs</h1>
        <p className="am-sub">
          {stats.total} total · {stats.accepted} accepted · {stats.proposed} proposed · {stats.drafts} draft ·{" "}
          spans {stats.processCount} process{stats.processCount === 1 ? "" : "es"} · {user.name}
        </p>
      </div>

      <div className="am-filters">
        <button type="button" className="am-chip am-chip-on">All <span className="am-chip-n">{stats.total}</span></button>
        <button type="button" className="am-chip">My drafts <span className="am-chip-n">{stats.drafts}</span></button>
        <button type="button" className="am-chip">Proposed <span className="am-chip-n">{stats.proposed}</span></button>
        <button type="button" className="am-chip">Accepted <span className="am-chip-n">{stats.accepted}</span></button>
        <button type="button" className="am-chip">Rejected / superseded <span className="am-chip-n">{stats.rejected}</span></button>
        <span style={{ flex: 1 }} />
        <input className="am-search" placeholder="Search ADR title or ID…" />
      </div>

      {mine.length === 0 ? (
        <div className="am-input-empty" style={{ marginTop: 20 }}>
          No ADRs assigned to {user.name} yet. ADRs authored without an{" "}
          <code>owner</code> field still show here so they don&rsquo;t get
          lost — open a process and use <b>+ Add ADR</b> to create one.
        </div>
      ) : (
        <table className="am-canvas-app-table" style={{ marginTop: 14 }}>
          <thead>
            <tr>
              <th style={{ width: 120 }}>ADR</th>
              <th>Title</th>
              <th>Process</th>
              <th>Status</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {mine.map(({ el, doc, status }) => (
              <AdrRow
                key={el.id}
                id={el.id}
                title={el.title}
                titleSub={metaStr(el.meta, "owner") ? `owned by ${metaStr(el.meta, "owner")}` : "no explicit owner — open queue"}
                process={doc.process.title}
                processId={doc.process.id}
                status={status}
                approval={el.status === "confirmed" ? "approved" : "draft"}
              />
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

function AdrRow({
  id, title, titleSub, process, processId, status, approval,
}: {
  id: string;
  title: string;
  titleSub: string;
  process: string;
  processId: string;
  status: AdrStatus;
  approval: "approved" | "draft";
}) {
  return (
    <tr>
      <td className="am-canvas-app-id">{id}</td>
      <td>
        <div className="am-canvas-app-name">{title}</div>
        <div className="am-canvas-app-stack">{titleSub}</div>
      </td>
      <td>
        <div>{process}</div>
        <div className="am-canvas-app-stack">{processId}</div>
      </td>
      <td><span className={`am-adr-status am-adr-status-${status}`}>{status.toUpperCase()}</span></td>
      <td>
        <span className={`am-pill am-pill-${approval === "approved" ? "hi" : "mid"}`}>
          <span className="am-dot" />{approval}
        </span>
      </td>
    </tr>
  );
}


// ---------------------------------------------------------------------
// Migration plans — cross-process Gantt
// ---------------------------------------------------------------------
function statusToGantt(s: string): "done" | "flight" | "planned" {
  const v = s.toLowerCase();
  if (v === "confirmed" || v === "done") return "done";
  if (v === "in-flight" || v === "in_flight") return "flight";
  return "planned";
}

export function MigrationPlans({ docs }: { docs: ProcessDoc[] }) {
  const rows = useMemo(() => {
    const groups: { doc: ProcessDoc; phases: WikiPage[] }[] = [];
    for (const doc of docs) {
      const phases = doc.elements.filter((e) => e.section === "migration-phases");
      if (phases.length > 0) groups.push({ doc, phases });
    }
    let totalPhases = 0;
    let done = 0;
    let flight = 0;
    for (const g of groups) {
      for (const p of g.phases) {
        totalPhases++;
        const s = statusToGantt(metaStr(p.meta, "phaseStatus") || p.status);
        if (s === "done") done++;
        else if (s === "flight") flight++;
      }
    }
    return { groups, totalPhases, done, flight, planned: totalPhases - done - flight };
  }, [docs]);

  return (
    <>
      <div className="am-lib-head">
        <h1>Migration plans</h1>
        <p className="am-sub">
          {rows.groups.length} process{rows.groups.length === 1 ? "" : "es"} in flight across{" "}
          {rows.totalPhases} phase{rows.totalPhases === 1 ? "" : "s"} · {rows.done} done · {rows.flight} in flight ·{" "}
          {rows.planned} planned
        </p>
      </div>

      <div className="am-filters">
        <button type="button" className="am-chip am-chip-on">
          All ({rows.groups.length} process{rows.groups.length === 1 ? "" : "es"} · {rows.totalPhases} phases)
        </button>
        {rows.groups.map(({ doc, phases }) => (
          <button key={doc.slug} type="button" className="am-chip">
            {doc.process.id} ({phases.length} phase{phases.length === 1 ? "" : "s"})
          </button>
        ))}
        <span style={{ flex: 1 }} />
      </div>

      {rows.groups.length === 0 ? (
        <div className="am-input-empty" style={{ marginTop: 20 }}>
          No migration phases authored anywhere yet. Open a process and add a
          phase under <b>Migration Phases</b> — it&rsquo;ll join the cross-
          process Gantt here.
        </div>
      ) : (
        <div className="am-canvas-gantt-wrap">
          <div className="am-canvas-gantt-legend">
            <span><i className="am-canvas-gantt-sw am-canvas-gantt-sw-done" />done</span>
            <span><i className="am-canvas-gantt-sw am-canvas-gantt-sw-flight" />in flight</span>
            <span><i className="am-canvas-gantt-sw am-canvas-gantt-sw-planned" />planned</span>
          </div>

          {rows.groups.map(({ doc, phases }) => (
            <div key={doc.slug} className="am-canvas-mig-group">
              <h3 style={{ marginTop: 24, marginBottom: 8 }}>
                {doc.process.title} <span style={{ color: "var(--muted)", fontWeight: 400 }}>· {doc.process.id}</span>
              </h3>
              <table className="am-canvas-app-table">
                <thead>
                  <tr>
                    <th style={{ width: 120 }}>Phase</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Target</th>
                  </tr>
                </thead>
                <tbody>
                  {phases.map((p) => {
                    const gstate = statusToGantt(metaStr(p.meta, "phaseStatus") || p.status);
                    return (
                      <tr key={p.id}>
                        <td className="am-canvas-app-id">{p.id}</td>
                        <td>
                          <div className="am-canvas-app-name">{p.title}</div>
                          {metaStr(p.meta, "description") && (
                            <div className="am-canvas-app-stack">{metaStr(p.meta, "description")}</div>
                          )}
                        </td>
                        <td>
                          <span className={`am-pill am-pill-${gstate === "done" ? "hi" : gstate === "flight" ? "mid" : "neu"}`}>
                            <span className="am-dot" />{gstate === "flight" ? "in flight" : gstate}
                          </span>
                        </td>
                        <td>{metaStr(p.meta, "targetDate") || metaStr(p.meta, "windowEnd") || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      <div className="am-migration-summary" style={{ marginTop: 24 }}>
        <div className="am-mig-stat"><div className="am-mig-stat-v">{rows.totalPhases}</div><div className="am-mig-stat-l">total phases</div></div>
        <div className="am-mig-stat"><div className="am-mig-stat-v am-mig-stat-v-hi">{rows.done}</div><div className="am-mig-stat-l">done</div></div>
        <div className="am-mig-stat"><div className="am-mig-stat-v am-mig-stat-v-mid">{rows.flight}</div><div className="am-mig-stat-l">in flight</div></div>
        <div className="am-mig-stat"><div className="am-mig-stat-v">{rows.planned}</div><div className="am-mig-stat-l">planned</div></div>
      </div>
    </>
  );
}
