"use client";

// Personal Work views in the ArchitectMiner shell (R4).
// Cross-process tiers — "what does the architecture look like across the whole
// portfolio" — derived from every process's authored architecture elements via
// src/lib/architect-portfolio.ts. Reads thin until processes are architected:
// each view shows an honest empty state rather than fabricated rows.

import type { ProcessDoc } from "@/lib/wiki";
import type { User } from "@/lib/user";
import {
  adrQueue,
  migrationPlan,
  processPortfolio,
} from "@/lib/architect-portfolio";
import { useCapped } from "./useCapped";

function EmptyTier({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <div className="am-canvas-banner" style={{ marginTop: 18 }}>
      <b>{title}</b> {body}
    </div>
  );
}

const STAGE_LABEL: Record<string, string> = {
  upstream: "UPSTREAM",
  domain: "IN DOMAIN",
  solution: "IN SOLUTION",
};

// ---------------------------------------------------------------------
// All processes — portfolio table
// ---------------------------------------------------------------------
export function AllProcesses({ docs }: { docs: ProcessDoc[] }) {
  const rows = processPortfolio(docs);
  const architected = rows.filter((r) => r.total > 0).length;
  const { shown, hasMore, remaining, showAll } = useCapped(rows);

  return (
    <>
      <div className="am-lib-head">
        <h1>All processes</h1>
        <p className="am-sub">
          {rows.length} process{rows.length === 1 ? "" : "es"} ·{" "}
          {architected} with architecture authored · all driven from Processminer
        </p>
      </div>

      <table className="am-canvas-app-table" style={{ marginTop: 14 }}>
        <thead>
          <tr>
            <th style={{ width: "30%" }}>Process</th>
            <th>Stage</th>
            <th>Architecture progress</th>
            <th>Last activity</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => (
            <tr key={r.slug}>
              <td>
                <div className="am-canvas-app-name">{r.title}</div>
                <div className="am-canvas-app-id">{r.id}</div>
              </td>
              <td>
                <span className={`am-stage am-stage-${r.stage}`}>
                  {STAGE_LABEL[r.stage]}
                </span>
              </td>
              <td>
                {r.total === 0 ? (
                  <span className="am-canvas-app-stack">none yet</span>
                ) : (
                  <div>
                    {r.adrs} ADRs · {r.caps} caps · {r.apps} apps · {r.nfrs} NFRs
                    {r.migrations > 0 ? ` · ${r.migrations} phases` : ""}
                  </div>
                )}
              </td>
              <td className="am-num">
                {r.lastModified ? r.lastModified.slice(0, 10) : "—"}
              </td>
            </tr>
          ))}
          {hasMore && (
            <tr className="am-more-row">
              <td colSpan={4}>
                <button type="button" className="am-more-btn" onClick={showAll}>
                  Show {remaining} more
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {rows.length === 0 && (
        <EmptyTier title="No processes yet." body="Create a process in Processminer to start." />
      )}
    </>
  );
}

// ---------------------------------------------------------------------
// ADRs — cross-process queue
// ---------------------------------------------------------------------
export function MyAdrs({ docs, user }: { docs: ProcessDoc[]; user: User }) {
  const adrs = adrQueue(docs);
  const procCount = new Set(adrs.map((a) => a.processId)).size;
  const count = (s: string) => adrs.filter((a) => a.status === s).length;

  return (
    <>
      <div className="am-lib-head">
        <h1>Architecture decisions</h1>
        <p className="am-sub">
          {adrs.length} ADR{adrs.length === 1 ? "" : "s"} across {procCount} process
          {procCount === 1 ? "" : "es"} · {count("accepted")} accepted ·{" "}
          {count("proposed")} proposed · {count("draft")} draft · viewing as{" "}
          {user.name}
        </p>
      </div>

      {adrs.length === 0 ? (
        <EmptyTier
          title="No ADRs authored yet."
          body="Record decisions with the domain architect on any process — they roll up here across the portfolio."
        />
      ) : (
        <table className="am-canvas-app-table" style={{ marginTop: 14 }}>
          <thead>
            <tr>
              <th style={{ width: 140 }}>ADR</th>
              <th>Title</th>
              <th>Process</th>
              <th>Owner</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {adrs.map((a) => (
              <tr key={a.id}>
                <td className="am-canvas-app-id">{a.id}</td>
                <td className="am-canvas-app-name">{a.title}</td>
                <td>
                  <div>{a.processTitle}</div>
                  <div className="am-canvas-app-stack">{a.processId}</div>
                </td>
                <td>{a.owner || "—"}</td>
                <td>
                  <span className={`am-adr-status am-adr-status-${a.status}`}>
                    {a.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

// ---------------------------------------------------------------------
// Migration plans — cross-process phases
// ---------------------------------------------------------------------
export function MigrationPlans({ docs }: { docs: ProcessDoc[] }) {
  const phases = migrationPlan(docs);
  const procCount = new Set(phases.map((p) => p.processId)).size;
  const count = (s: string) => phases.filter((p) => p.phaseStatus === s).length;

  return (
    <>
      <div className="am-lib-head">
        <h1>Migration plans</h1>
        <p className="am-sub">
          {phases.length} phase{phases.length === 1 ? "" : "s"} across {procCount}{" "}
          process{procCount === 1 ? "" : "es"} · {count("done")} done ·{" "}
          {count("in-flight")} in flight · {count("planned")} planned
        </p>
      </div>

      {phases.length === 0 ? (
        <EmptyTier
          title="No migration phases yet."
          body="Plan the move from as-is to target with the solution architect — phases roll up here across processes."
        />
      ) : (
        <table className="am-canvas-app-table" style={{ marginTop: 14 }}>
          <thead>
            <tr>
              <th style={{ width: 140 }}>Phase</th>
              <th>Scope</th>
              <th>Process</th>
              <th>Window</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {phases.map((p) => (
              <tr key={p.id}>
                <td className="am-canvas-app-id">{p.id}</td>
                <td className="am-canvas-app-name">{p.title}</td>
                <td>
                  <div>{p.processTitle}</div>
                  <div className="am-canvas-app-stack">{p.processId}</div>
                </td>
                <td>
                  {p.startQuarter || "?"}
                  {p.endQuarter ? ` → ${p.endQuarter}` : ""}
                </td>
                <td>
                  <span
                    className={`am-adr-status am-adr-status-${
                      p.phaseStatus === "done"
                        ? "accepted"
                        : p.phaseStatus === "in-flight"
                          ? "proposed"
                          : "draft"
                    }`}
                  >
                    {p.phaseStatus.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
