"use client";

import { useMemo, useState } from "react";
import type { ProcessDoc } from "@/lib/wiki";
import type { User } from "@/lib/user";
import Tooltip from "./Tooltip";
import RelativeTime from "./RelativeTime";
import {
  CapabilityCatalog,
  ApplicationRegister,
  NfrTemplates,
  PatternLibrary,
} from "./LibraryViews";
import { AllProcesses, MyAdrs, MigrationPlans } from "./PersonalViews";
import { useCapped } from "./useCapped";
import {
  adrQueue,
  applicationRegister,
  capabilityCatalog,
  migrationPlan,
  nfrCatalog,
} from "@/lib/architect-portfolio";

// Sidebar sections beyond the default Handoff inbox view. null = inbox.
type SidebarSection =
  | "all-processes"
  | "my-adrs"
  | "migration-plans"
  | "capabilities"
  | "applications"
  | "nfrs"
  | "patterns";

// ArchitectMiner's first surface — the handoff inbox. Lists every process
// from Processminer with a derived "ready for architecture" status. The
// architecture-side columns are placeholders today (the architect data model
// doesn't exist yet); this is the entry point the work will hang off.
//
// Sections that constitute the Target Process area — once every element in
// these sections is confirmed, the process is "ready for architecture".
const TARGET_SECTIONS = new Set([
  "to-be-design",
  "transformation-decisions",
  "requirements",
  "dependencies",
  "assumptions",
  "gap-resolution",
  "validation",
]);

type HandoffStatus = "pending" | "in-processminer" | "ready" | "in-architecture" | "complete";

type Row = {
  slug: string;
  id: string;
  title: string;
  status: HandoffStatus;
  targetConfirmed: number;
  targetTotal: number;
  transformationDecisions: number;
  transformationDecisionsDraft: number;
  gapCount: number;
  lastModified?: string;
};

function summarise(doc: ProcessDoc): Row {
  let targetConfirmed = 0;
  let targetTotal = 0;
  let transformationDecisions = 0;
  let transformationDecisionsDraft = 0;
  let gapCount = 0;
  for (const el of doc.elements) {
    if (TARGET_SECTIONS.has(el.section)) {
      targetTotal++;
      if (el.status === "confirmed") targetConfirmed++;
    }
    if (el.section === "transformation-decisions") {
      transformationDecisions++;
      if (el.status !== "confirmed") transformationDecisionsDraft++;
    }
    if (el.section === "gap-resolution") {
      gapCount++;
    }
  }
  let status: HandoffStatus;
  if (targetTotal === 0 || targetConfirmed === 0) status = "pending";
  else if (targetConfirmed < targetTotal) status = "in-processminer";
  else status = "ready";
  return {
    slug: doc.slug,
    id: doc.process.id || doc.slug,
    title: doc.process.title || doc.slug,
    status,
    targetConfirmed,
    targetTotal,
    transformationDecisions,
    transformationDecisionsDraft,
    gapCount,
    lastModified: doc.lastModified,
  };
}

type Filter = "all" | "needs-domain" | "needs-solution" | "in-build";

function inFilter(row: Row, filter: Filter): boolean {
  if (filter === "all") return true;
  // Needs-domain == ready for the architect to start. The other two filters
  // become meaningful once architect data lands; today they collapse to "no
  // matches" so the filter still works as a control.
  if (filter === "needs-domain") return row.status === "ready";
  if (filter === "needs-solution") return false;
  if (filter === "in-build") return false;
  return true;
}

function statusPill(s: HandoffStatus) {
  switch (s) {
    case "ready":
      return { label: "Ready for architecture", tone: "hi" as const };
    case "in-processminer":
      return { label: "In Processminer", tone: "mid" as const };
    case "pending":
      return { label: "Pending target process", tone: "neu" as const };
    case "in-architecture":
      return { label: "In architecture", tone: "mid" as const };
    case "complete":
      return { label: "Complete", tone: "hi" as const };
  }
}

export default function HandoffInbox({
  docs,
  user,
  onReturnToSplash,
  onOpenProcess,
}: {
  docs: ProcessDoc[];
  user: User;
  onReturnToSplash: () => void;
  onOpenProcess: (slug: string) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [sidebarSection, setSidebarSection] = useState<SidebarSection | null>(null);

  const rows = useMemo(
    () =>
      docs.map(summarise).sort((a, b) => {
        // Ready first, then in-processminer, then pending. Within a status,
        // most recently modified first.
        const order: Record<HandoffStatus, number> = {
          ready: 0,
          "in-architecture": 1,
          "in-processminer": 2,
          complete: 3,
          pending: 4,
        };
        const d = order[a.status] - order[b.status];
        if (d !== 0) return d;
        return (b.lastModified ?? "").localeCompare(a.lastModified ?? "");
      }),
    [docs],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (!inFilter(r, filter)) return false;
      if (!q) return true;
      return r.title.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
    });
  }, [rows, filter, query]);
  const { shown, hasMore, remaining, showAll } = useCapped(filtered);

  const counts = useMemo(() => {
    const c = { all: rows.length, "needs-domain": 0, "needs-solution": 0, "in-build": 0 } as Record<Filter, number>;
    for (const r of rows) {
      if (r.status === "ready") c["needs-domain"]++;
    }
    return c;
  }, [rows]);

  // Real portfolio counts for the Library / Personal sidebar badges (R4).
  const archCounts = useMemo(
    () => ({
      processes: docs.length,
      adrs: adrQueue(docs).length,
      migrations: migrationPlan(docs).length,
      caps: capabilityCatalog(docs).length,
      apps: applicationRegister(docs).length,
      nfrs: nfrCatalog(docs).length,
    }),
    [docs],
  );

  const initials = user.name
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="am">
      <header className="topbar am-topbar">
        <Tooltip label="Back to workspace chooser">
          <button
            type="button"
            className="tb-modchip am-modchip"
            onClick={onReturnToSplash}
            aria-label="Back to workspace chooser"
          >
            <svg viewBox="0 0 24 24" className="tb-modchip-icon" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" />
            </svg>
            <span className="tb-modchip-wordmark">ARCHITECTMINER</span>
          </button>
        </Tooltip>
        <span className="am-crumb">
          workspace · <b>Retail Banking</b>
        </span>
        <span className="spacer" style={{ flex: 1 }} />
        <span className="am-user">
          <b>{user.name}</b> · {user.role}
        </span>
        <div className="am-avatar" aria-hidden>
          {initials || "·"}
        </div>
      </header>

      <div className="am-shell">
        <aside className="am-side">
          <div className="am-side-group">Work</div>
          <div
            className={`am-navitem${sidebarSection === null ? " am-navitem-on" : ""}`}
            onClick={() => setSidebarSection(null)}
          >
            Handoff inbox
            <span className="am-navitem-n">{counts.all}</span>
          </div>
          <div
            className={`am-navitem${sidebarSection === "all-processes" ? " am-navitem-on" : ""}`}
            onClick={() => setSidebarSection("all-processes")}
          >
            All processes
            <span className="am-navitem-n">{archCounts.processes}</span>
          </div>
          <div
            className={`am-navitem${sidebarSection === "my-adrs" ? " am-navitem-on" : ""}`}
            onClick={() => setSidebarSection("my-adrs")}
          >
            Architecture decisions
            <span className="am-navitem-n">{archCounts.adrs}</span>
          </div>
          <div
            className={`am-navitem${sidebarSection === "migration-plans" ? " am-navitem-on" : ""}`}
            onClick={() => setSidebarSection("migration-plans")}
          >
            Migration plans
            <span className="am-navitem-n">{archCounts.migrations}</span>
          </div>

          <div className="am-side-group">Library</div>
          <div
            className={`am-navitem${sidebarSection === "capabilities" ? " am-navitem-on" : ""}`}
            onClick={() => setSidebarSection("capabilities")}
          >
            Capability catalog
            <span className="am-navitem-n">{archCounts.caps}</span>
          </div>
          <div
            className={`am-navitem${sidebarSection === "applications" ? " am-navitem-on" : ""}`}
            onClick={() => setSidebarSection("applications")}
          >
            Application register
            <span className="am-navitem-n">{archCounts.apps}</span>
          </div>
          <div
            className={`am-navitem${sidebarSection === "nfrs" ? " am-navitem-on" : ""}`}
            onClick={() => setSidebarSection("nfrs")}
          >
            NFR catalog
            <span className="am-navitem-n">{archCounts.nfrs}</span>
          </div>
          <div
            className={`am-navitem${sidebarSection === "patterns" ? " am-navitem-on" : ""}`}
            onClick={() => setSidebarSection("patterns")}
          >
            Pattern library
            <span className="am-navitem-n">—</span>
          </div>
        </aside>

        <main className="am-main">
        {sidebarSection === "all-processes" && <AllProcesses docs={docs} />}
        {sidebarSection === "my-adrs" && <MyAdrs docs={docs} user={user} />}
        {sidebarSection === "migration-plans" && <MigrationPlans docs={docs} />}
        {sidebarSection === "capabilities" && <CapabilityCatalog docs={docs} />}
        {sidebarSection === "applications" && <ApplicationRegister docs={docs} />}
        {sidebarSection === "nfrs" && <NfrTemplates docs={docs} />}
        {sidebarSection === "patterns" && <PatternLibrary />}
        {sidebarSection === null && (
          <>
          <div className="am-head">
            <h1>Handoff inbox</h1>
            <p className="am-sub">
              Target Process work in Processminer — ready for domain and solution
              architecture once locked.
            </p>
          </div>

          <div className="am-filters">
            {(
              [
                { key: "all" as Filter, label: "All", n: counts.all },
                { key: "needs-domain" as Filter, label: "Needs domain", n: counts["needs-domain"] },
                { key: "needs-solution" as Filter, label: "Needs solution", n: counts["needs-solution"] },
                { key: "in-build" as Filter, label: "In build", n: counts["in-build"] },
              ]
            ).map((f) => (
              <button
                key={f.key}
                type="button"
                className={`am-chip${filter === f.key ? " am-chip-on" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label} <span className="am-chip-n">{f.n}</span>
              </button>
            ))}
            <span style={{ flex: 1 }} />
            <input
              className="am-search"
              type="search"
              placeholder="Search process or ID…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <table className="am-table">
            <thead>
              <tr>
                <th style={{ width: "34%" }}>Process</th>
                <th>Handoff</th>
                <th>Domain architecture</th>
                <th>Solution architecture</th>
                <th>Last activity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="am-empty">
                    No processes match this view.
                  </td>
                </tr>
              )}
              {shown.map((r) => {
                const pill = statusPill(r.status);
                const targetPct =
                  r.targetTotal === 0 ? 0 : Math.round((r.targetConfirmed / r.targetTotal) * 100);
                return (
                  <tr
                    key={r.slug}
                    className="am-row-link"
                    onClick={() => onOpenProcess(r.slug)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onOpenProcess(r.slug);
                      }
                    }}
                  >
                    <td>
                      <div className="am-ptitle">{r.title}</div>
                      <div className="am-pmeta">
                        <span className="am-pid">{r.id}</span>
                      </div>
                      <div className="am-tracks">
                        <span className="am-pill am-pill-neu">
                          {r.transformationDecisions} transformation decisions
                          {r.transformationDecisionsDraft > 0 && (
                            <em> · {r.transformationDecisionsDraft} draft</em>
                          )}
                        </span>
                        <span className="am-pill am-pill-neu">{r.gapCount} gaps</span>
                      </div>
                    </td>
                    <td>
                      <span className={`am-pill am-pill-${pill.tone}`}>
                        <span className="am-dot" />
                        {pill.label}
                      </span>
                      {r.targetTotal > 0 && (
                        <div className="am-progress" title={`${r.targetConfirmed}/${r.targetTotal} target elements confirmed`}>
                          <i
                            style={{
                              width: `${targetPct}%`,
                              background:
                                r.status === "ready" ? "var(--hi)" : "var(--mid)",
                            }}
                          />
                        </div>
                      )}
                      <div className="am-pmeta">
                        <span className="am-pmono">{r.targetConfirmed}/{r.targetTotal}</span> target elements confirmed
                      </div>
                    </td>
                    <td>
                      <span className="am-pill am-pill-neu">
                        <span className="am-dot" />
                        {r.status === "ready" ? "Ready to start" : "Locked"}
                      </span>
                      <div className="am-pmeta">
                        {r.status === "ready"
                          ? "domain architect can pick this up"
                          : "unlocks once target process is locked"}
                      </div>
                    </td>
                    <td>
                      <span className="am-pill am-pill-neu">
                        <span className="am-dot" />
                        Locked
                      </span>
                      <div className="am-pmeta">solution module coming soon</div>
                    </td>
                    <td>
                      {r.lastModified ? (
                        <RelativeTime ts={r.lastModified} className="am-pmeta am-pmono" />
                      ) : (
                        <span className="am-pmeta">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {hasMore && (
                <tr className="am-more-row">
                  <td colSpan={5}>
                    <button type="button" className="am-more-btn" onClick={showAll}>
                      Show {remaining} more
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </>
        )}
        </main>
      </div>
    </div>
  );
}
