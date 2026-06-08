"use client";

// Cross-process Library views in the ArchitectMiner shell (R4).
// Each renders the <main> column inside HandoffInbox when its Library sidebar
// item is selected. Content is derived from every process's authored
// architecture elements via src/lib/architect-portfolio.ts — capabilities (with
// cross-process reuse), the target-application register, and the NFR catalog.
// Reads thin until processes are architected; each shows an honest empty state.

import type { ProcessDoc } from "@/lib/wiki";
import {
  applicationRegister,
  capabilityCatalog,
  nfrCatalog,
} from "@/lib/architect-portfolio";

function EmptyTier({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <div className="am-canvas-banner" style={{ marginTop: 18 }}>
      <b>{title}</b> {body}
    </div>
  );
}

// ---------------------------------------------------------------------
// Capability catalog — grouped by name, with cross-process reuse
// ---------------------------------------------------------------------
export function CapabilityCatalog({ docs }: { docs: ProcessDoc[] }) {
  const cat = capabilityCatalog(docs);
  const reused = cat.filter((c) => c.reuse >= 2).length;

  return (
    <>
      <div className="am-lib-head">
        <h1>Capability catalog</h1>
        <p className="am-sub">
          {cat.length} distinct capabilit{cat.length === 1 ? "y" : "ies"} across
          the portfolio · {reused} used in 2+ processes · check before declaring
          &ldquo;new&rdquo;
        </p>
      </div>

      {cat.length === 0 ? (
        <EmptyTier
          title="No capabilities authored yet."
          body="Map capabilities with the domain architect on any process — shared names are detected as reuse here."
        />
      ) : (
        <div className="am-cat-grid">
          {cat.map((c) => (
            <div key={c.id} className="am-canvas-cap-card">
              <div className="am-canvas-cap-head">
                <span className="am-canvas-cap-id">{c.id}</span>
                <span className={`am-reuse-pill${c.reuse >= 2 ? " am-reuse-pill-hi" : " am-reuse-pill-solo"}`}>
                  {c.reuse >= 2 ? `★ used in ${c.reuse}` : `solo · ${c.processes[0]}`}
                </span>
              </div>
              <div className="am-canvas-cap-name">{c.name}</div>
              {c.criticality && (
                <div className="am-canvas-cap-meta">
                  <span className="am-pill am-pill-neu">{c.criticality}</span>
                </div>
              )}
              <div className="am-cat-procs">
                {c.processes.map((p, i) => (
                  <span key={i} className="am-cat-pchip">{p}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------
// Application register — every target application + its verdict
// ---------------------------------------------------------------------
export function ApplicationRegister({ docs }: { docs: ProcessDoc[] }) {
  const apps = applicationRegister(docs);
  const v = (verdict: string) => apps.filter((a) => a.verdict === verdict).length;

  return (
    <>
      <div className="am-lib-head">
        <h1>Application register</h1>
        <p className="am-sub">
          {apps.length} target application{apps.length === 1 ? "" : "s"} ·{" "}
          {v("KEEP")} KEEP / {v("BUILD")} BUILD / {v("BUY")} BUY /{" "}
          {v("CONFIGURE")} CONFIGURE
        </p>
      </div>

      {apps.length === 0 ? (
        <EmptyTier
          title="No target applications yet."
          body="Decide the application landscape (build / buy / configure / keep) with the domain architect — apps register here across processes."
        />
      ) : (
        <table className="am-canvas-app-table" style={{ marginTop: 14 }}>
          <thead>
            <tr>
              <th className="col-pct28">Application</th>
              <th>Verdict</th>
              <th>Vendor / tech</th>
              <th>Process</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => (
              <tr key={a.id}>
                <td>
                  <div className="am-canvas-app-name">{a.name}</div>
                  <div className="am-canvas-app-id">{a.id}</div>
                </td>
                <td>
                  {a.verdict ? (
                    <span className={`am-verdict am-verdict-${a.verdict.toLowerCase()}`}>
                      {a.verdict}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{a.vendor || "—"}</td>
                <td>{a.processTitle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

// ---------------------------------------------------------------------
// NFR catalog — every non-functional requirement across processes
// ---------------------------------------------------------------------
export function NfrTemplates({ docs }: { docs: ProcessDoc[] }) {
  const nfrs = nfrCatalog(docs);

  return (
    <>
      <div className="am-lib-head">
        <h1>NFR catalog</h1>
        <p className="am-sub">
          {nfrs.length} non-functional requirement{nfrs.length === 1 ? "" : "s"}{" "}
          across the portfolio · derive from group standards before authoring new
        </p>
      </div>

      {nfrs.length === 0 ? (
        <EmptyTier
          title="No NFRs authored yet."
          body="Set measurable NFRs with the solution architect — they catalog here across processes for reuse."
        />
      ) : (
        <table className="am-canvas-app-table" style={{ marginTop: 14 }}>
          <thead>
            <tr>
              <th className="col-w140">NFR</th>
              <th>Name</th>
              <th>Category</th>
              <th>Target</th>
              <th>Process</th>
            </tr>
          </thead>
          <tbody>
            {nfrs.map((n) => (
              <tr key={n.id}>
                <td className="am-canvas-app-id">{n.id}</td>
                <td className="am-canvas-app-name">{n.name}</td>
                <td>{n.category || "—"}</td>
                <td>{n.target || "—"}</td>
                <td>{n.processTitle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

// ---------------------------------------------------------------------
// Pattern library — no element-type backing yet
// ---------------------------------------------------------------------
export function PatternLibrary() {
  return (
    <>
      <div className="am-lib-head">
        <h1>Pattern library</h1>
        <p className="am-sub">
          Reusable architecture patterns, cited from ADRs to make decisions
          reviewable
        </p>
      </div>
      <EmptyTier
        title="No pattern catalog yet."
        body="Patterns aren't a tracked element type in the schema, so there's nothing to aggregate from the process documents. Reusable patterns can be cited inline from ADR text in the meantime; a first-class pattern catalog is a future step."
      />
    </>
  );
}
