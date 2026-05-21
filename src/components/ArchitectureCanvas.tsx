"use client";

import { useMemo, useState } from "react";
import type { ProcessDoc } from "@/lib/wiki";
import type { User } from "@/lib/user";
import Tooltip from "./Tooltip";

// Frame-03 of the ArchitectMiner mockup, stubbed with mock ADR/capability
// content. Inputs from Processminer (left nav, top group) use REAL counts
// from the open process so the upstream side reads truthfully; the
// architect-side elements are illustrative until the architect data model
// lands.

// Architect-relevant upstream sections — these are what the architect reads
// before authoring. Order matches the natural flow of architecture work.
const UPSTREAM_SECTIONS: { id: string; label: string }[] = [
  { id: "to-be-design", label: "Target Process" },
  { id: "transformation-decisions", label: "Transformation Decisions" },
  { id: "requirements", label: "Requirements" },
  { id: "gap-resolution", label: "Gap Resolution" },
  { id: "dependencies", label: "Dependencies" },
  { id: "controls", label: "Controls" },
  { id: "regulation", label: "Regulation" },
  { id: "systems", label: "As-Is Systems" },
  { id: "integrations", label: "As-Is Integrations" },
];

type ArchView =
  | "adrs"
  | "diagram"
  | "traceability"
  | "capabilities"
  | "applications"
  | "integrations"
  | "components"
  | "nfrs"
  | "migration";

export default function ArchitectureCanvas({
  doc,
  user,
  onReturnToInbox,
}: {
  doc: ProcessDoc;
  user: User;
  onReturnToInbox: () => void;
}) {
  const [view, setView] = useState<ArchView>("adrs");

  const upstreamCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const el of doc.elements) counts[el.section] = (counts[el.section] ?? 0) + 1;
    return counts;
  }, [doc]);

  const pid = doc.process.id || "PR";
  const initials = user.name
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Mock ADRs — content is illustrative. The open ADR's heading content is
  // the long-form mockup body; the others are list-only.
  const adrs = [
    { id: `ADR-${pid}-001`, title: "Single case object across review lifecycle", status: "Accepted", trace: `TD-${pid}-001` },
    { id: `ADR-${pid}-005`, title: "KYC data sourced from Customer Master, not re-entered", status: "Accepted", trace: `TD-${pid}-004` },
    { id: `ADR-${pid}-007`, title: "Case orchestration via Camunda 8 BPMN engine", status: "Proposed", trace: `TD-${pid}-002`, open: true },
    { id: `ADR-${pid}-008`, title: "Document ingestion via existing Hyland enterprise ECM", status: "Proposed", trace: `TD-${pid}-005` },
    { id: `ADR-${pid}-009`, title: "Risk score recalculated nightly off DWH, not on-read", status: "Draft", trace: `G-${pid}-002` },
  ];
  const openAdr = adrs.find((a) => a.open) ?? adrs[2];

  return (
    <div className="am">
      <header className="topbar am-topbar">
        <Tooltip label="Back to handoff inbox">
          <button
            type="button"
            className="tb-modchip am-modchip"
            onClick={onReturnToInbox}
            aria-label="Back to handoff inbox"
          >
            <svg viewBox="0 0 24 24" className="tb-modchip-icon" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" />
            </svg>
            <span className="tb-modchip-wordmark">ARCHITECTMINER</span>
          </button>
        </Tooltip>
        <span className="am-crumb">
          <span style={{ color: "var(--ink)" }}>{doc.process.title}</span>
          <span style={{ margin: "0 8px", opacity: 0.6 }}>·</span>
          {view === "adrs" && (
            <>
              <b>Architecture Decisions</b>
              <span style={{ margin: "0 8px", opacity: 0.6 }}>·</span>
              {openAdr.id}
            </>
          )}
          {view === "diagram" && (
            <>
              <b>Diagram</b>
              <span style={{ margin: "0 8px", opacity: 0.6 }}>·</span>
              target state
            </>
          )}
          {view === "traceability" && (
            <>
              <b>Traceability</b>
              <span style={{ margin: "0 8px", opacity: 0.6 }}>·</span>
              audit-ready view
            </>
          )}
          {view === "capabilities" && (
            <>
              <b>Capabilities</b>
              <span style={{ margin: "0 8px", opacity: 0.6 }}>·</span>
              CAP-{pid}-002
            </>
          )}
          {view === "applications" && (
            <>
              <b>Target Applications</b>
              <span style={{ margin: "0 8px", opacity: 0.6 }}>·</span>
              TGTAPP-{pid}-001
            </>
          )}
          {view === "integrations" && (
            <>
              <b>Target Integrations</b>
              <span style={{ margin: "0 8px", opacity: 0.6 }}>·</span>
              INT-{pid}-001
            </>
          )}
          {view === "components" && (
            <>
              <b>Components</b>
              <span style={{ margin: "0 8px", opacity: 0.6 }}>·</span>
              COMP-{pid}-002
            </>
          )}
          {view === "nfrs" && (
            <>
              <b>NFRs</b>
              <span style={{ margin: "0 8px", opacity: 0.6 }}>·</span>
              NFR-{pid}-001
            </>
          )}
          {view === "migration" && (
            <>
              <b>Migration Phases</b>
              <span style={{ margin: "0 8px", opacity: 0.6 }}>·</span>
              MIG-{pid}-002
            </>
          )}
        </span>
        <span className="spacer" style={{ flex: 1 }} />
        <span className="am-user">
          <b>{user.name}</b> · {user.role}
        </span>
        <div className="am-avatar" aria-hidden>
          {initials || "·"}
        </div>
      </header>

      <div className="am-canvas-shell">
        <aside className="am-canvas-side">
          <div className="am-canvas-crumb">
            PROCESS · <span style={{ color: "var(--ink)", fontWeight: 600 }}>{doc.process.title}</span>
          </div>

          <h4 className="am-canvas-grouph">Inputs from Processminer</h4>
          {UPSTREAM_SECTIONS.map((s) => (
            <div key={s.id} className="am-canvas-secrow">
              <span>{s.label}</span>
              <span className="am-canvas-n">{upstreamCounts[s.id] ?? 0}</span>
            </div>
          ))}

          <h4 className="am-canvas-grouph">Domain Architecture</h4>
          <div
            className={`am-canvas-secrow${view === "capabilities" ? " am-canvas-secrow-on" : ""}`}
            onClick={() => setView("capabilities")}
          >
            <span>Capabilities</span>
            <span className="am-canvas-n">7</span>
          </div>
          <div
            className={`am-canvas-secrow${view === "applications" ? " am-canvas-secrow-on" : ""}`}
            onClick={() => setView("applications")}
          >
            <span>Target Applications</span>
            <span className="am-canvas-n">6</span>
          </div>
          <div
            className={`am-canvas-secrow${view === "adrs" ? " am-canvas-secrow-on" : ""}`}
            onClick={() => setView("adrs")}
          >
            <span>Architecture Decisions</span>
            <span className="am-canvas-n">12</span>
          </div>

          <h4 className="am-canvas-grouph">Solution Architecture</h4>
          <div
            className={`am-canvas-secrow${view === "integrations" ? " am-canvas-secrow-on" : ""}`}
            onClick={() => setView("integrations")}
          >
            <span>Target Integrations</span>
            <span className="am-canvas-n">8</span>
          </div>
          <div
            className={`am-canvas-secrow${view === "components" ? " am-canvas-secrow-on" : ""}`}
            onClick={() => setView("components")}
          >
            <span>Components</span>
            <span className="am-canvas-n">17</span>
          </div>
          <div
            className={`am-canvas-secrow${view === "nfrs" ? " am-canvas-secrow-on" : ""}`}
            onClick={() => setView("nfrs")}
          >
            <span>NFRs</span>
            <span className="am-canvas-n">8</span>
          </div>
          <div
            className={`am-canvas-secrow${view === "migration" ? " am-canvas-secrow-on" : ""}`}
            onClick={() => setView("migration")}
          >
            <span>Migration Phases</span>
            <span className="am-canvas-n">4</span>
          </div>

          <h4 className="am-canvas-grouph">Cross-cutting</h4>
          <div
            className={`am-canvas-secrow${view === "diagram" ? " am-canvas-secrow-on" : ""}`}
            onClick={() => setView("diagram")}
          >
            <span>Diagram</span>
          </div>
          <div
            className={`am-canvas-secrow${view === "traceability" ? " am-canvas-secrow-on" : ""}`}
            onClick={() => setView("traceability")}
          >
            <span>Traceability</span>
            <span className="am-canvas-n">88%</span>
          </div>
          <div className="am-canvas-secrow am-canvas-secrow-locked">
            <span>Comments</span>
            <span className="am-canvas-n">—</span>
          </div>
        </aside>

        {view === "adrs" && (
          <>
        <main className="am-canvas-doc">
          <div className="am-canvas-sechead">
            <h2>Architecture Decisions</h2>
            <span className="am-canvas-secmeta">
              12 elements · 2 accepted · 2 proposed · 1 draft
            </span>
            <span style={{ flex: 1 }} />
            <button type="button" className="am-canvas-btn">＋ Add ADR</button>
            <button type="button" className="am-canvas-btn am-canvas-btn-primary">
              ／ Elicit with domain architect
            </button>
          </div>

          <div className="am-canvas-elemlist">
            {adrs.map((adr) => {
              const tone =
                adr.status === "Accepted" ? "hi" : adr.status === "Proposed" ? "mid" : "neu";
              return (
                <div
                  key={adr.id}
                  className={`am-canvas-elem${adr.open ? " am-canvas-elem-open" : ""}`}
                >
                  <span className="am-canvas-elem-id">{adr.id}</span>
                  <span className="am-canvas-elem-title">{adr.title}</span>
                  <span className={`am-pill am-pill-${tone}`}>{adr.status}</span>
                  <span className="am-pill am-pill-neu">→ {adr.trace}</span>
                </div>
              );
            })}
          </div>

          <article className="am-canvas-adr">
            <header className="am-canvas-adr-head">
              <span className="am-canvas-elem-id">{openAdr.id}</span>
              <h3>{openAdr.title}</h3>
              <span className="am-pill am-pill-mid">
                <span className="am-dot" />
                {openAdr.status}
              </span>
            </header>
            <div className="am-canvas-adr-meta">
              <span><b>Domain</b> Case Management</span>
              <span><b>Owner</b> {user.name} · Domain Architect</span>
              <span><b>Updated</b> today</span>
              <span><b>Reviewers</b> 2/3</span>
            </div>

            <div className="am-canvas-heading">
              <h4>Context</h4>
              <span className="am-canvas-src">
                <span className="am-canvas-verified">✓ human-confirmed</span> · traced to{" "}
                <b>{openAdr.trace}</b>
              </span>
            </div>
            <p className="am-canvas-prose">
              {doc.process.title} cases today live in mailboxes and shared
              spreadsheets. The Target Process requires a single, stateful case
              object whose lifecycle is observable end-to-end and whose SLAs
              can be enforced by the orchestrator rather than by reviewers.
              The orchestrator must run BPMN authored by the business and
              integrate with the existing IAM, DMS and DWH.
            </p>

            <div className="am-canvas-heading">
              <h4>Decision</h4>
              <span className="am-canvas-src">
                <span className="am-canvas-verified">✓ human-confirmed</span>
              </span>
            </div>
            <p className="am-canvas-prose">
              Adopt Camunda 8 (Zeebe + Operate + Tasklist) as the case-orchestration
              engine. Deploy the SaaS region (eu-frankfurt) for the corporate-clients
              tenant. Workflows are authored as BPMN 2.0; case state is held by the
              engine, not the database. Custom UI for reviewers consumes Tasklist + GraphQL.
            </p>

            <div className="am-canvas-heading">
              <h4>Alternatives considered</h4>
              <span className="am-canvas-src">
                <span className="am-canvas-machine">▲ drafted by domain-architect agent · awaiting review</span>
              </span>
            </div>
            <ul className="am-canvas-prose am-canvas-prose-list">
              <li>
                <b>Build on existing Pega platform</b> — rejected: licence covers
                Retail only, corporate tenant would need a separate cluster (cost)
                and Pega's BPMN export is not round-trip safe.
              </li>
              <li>
                <b>Workflow on top of Salesforce Service Cloud</b> — rejected:
                review SLA logic does not fit Service Cloud's case escalation model.
              </li>
              <li>
                <b>In-house orchestrator on Postgres</b> — rejected: 4–6 FTE-quarter
                build, no business-readable model.
              </li>
            </ul>

            <div className="am-canvas-heading">
              <h4>Consequences</h4>
              <span className="am-canvas-src">
                <span className="am-canvas-verified">✓ human-confirmed</span>
              </span>
            </div>
            <ul className="am-canvas-prose am-canvas-prose-list">
              <li>New runtime dependency on Camunda SaaS — adds NFR-{pid}-004 (RTO ≤ 4h via active-passive).</li>
              <li>Reviewers gain a real worklist; manual mailbox triage goes away.</li>
              <li>IAM integration via OIDC — couples this ADR to ADR-{pid}-003 (single sign-on via Keycloak).</li>
              <li>BPMN models become a versioned artefact owned jointly by process owner and architect.</li>
            </ul>

            <div className="am-canvas-heading">
              <h4>Traces</h4>
            </div>
            <div className="am-canvas-traces">
              <span className="am-canvas-trace">
                <span className="am-canvas-trace-lbl">decision</span>
                {openAdr.trace}
              </span>
              <span className="am-canvas-trace">
                <span className="am-canvas-trace-lbl">resolves gap</span>
                G-{pid}-003
              </span>
              <span className="am-canvas-trace">
                <span className="am-canvas-trace-lbl">supports capability</span>
                CAP-{pid}-002 Case orchestration
              </span>
              <span className="am-canvas-trace">
                <span className="am-canvas-trace-lbl">depends on</span>
                ADR-{pid}-003
              </span>
            </div>

            <footer className="am-canvas-adr-foot">
              <span>3/4 headings confirmed · ✓ all traces resolve · 0 lint findings</span>
              <span style={{ flex: 1 }} />
              <button type="button" className="am-canvas-btn">Reject</button>
              <button type="button" className="am-canvas-btn">Edit</button>
              <button type="button" className="am-canvas-btn am-canvas-btn-primary">
                Approve as Accepted
              </button>
            </footer>
          </article>

          <div className="am-canvas-banner">
            Illustrative content — ArchitectMiner authoring is still being built.
            The data model behind ADRs, Capabilities, NFRs and Migration Phases lands next.
          </div>
        </main>

        <aside className="am-canvas-chat">
          <header className="am-canvas-chat-head">
            <div className="am-canvas-chat-avatar">DA</div>
            <div>
              <div className="am-canvas-chat-who">Domain Architect</div>
              <div className="am-canvas-chat-role">/domain-architect · {openAdr.id}</div>
            </div>
          </header>
          <div className="am-canvas-chat-body">
            <div className="am-canvas-bubble">
              I have drafted the Alternatives heading from your inputs (3 candidates).
              Two need your confirmation — the Pega licence scope and the Service-Cloud
              rejection reason came from the As-Is Systems section and are{" "}
              <b>machine-drafted</b>.
              <div className="am-canvas-bubble-ref">
                <span>{openAdr.trace}</span>
                <span>G-{pid}-003</span>
                <span>Sys: Pega</span>
                <span>Sys: Salesforce</span>
              </div>
            </div>
            <div className="am-canvas-bubble am-canvas-bubble-me">
              The Pega licence note is correct. For Service Cloud I would phrase
              the reject differently — review-SLA logic does not fit, but the real
              reason is data residency.
            </div>
            <div className="am-canvas-bubble">
              Updated <b>Alternatives</b>. I will re-mark that bullet as{" "}
              <i>human-confirmed</i> once you approve the section. Two follow-ups
              before you accept this ADR:
              <ol style={{ paddingLeft: 18, marginTop: 6 }}>
                <li>Add <b>NFR-{pid}-004</b> for the RTO ≤ 4h consequence. I can draft.</li>
                <li>
                  Open <b>ADR-{pid}-003</b> (Keycloak SSO) — currently in{" "}
                  <i>Proposed</i>, this ADR depends on it.
                </li>
              </ol>
              <div className="am-canvas-bubble-ref">
                <span>NFR-{pid}-004</span>
                <span>ADR-{pid}-003</span>
              </div>
            </div>
          </div>
          <div className="am-canvas-chat-actions">
            <span className="am-canvas-quick">Draft NFR-{pid}-004</span>
            <span className="am-canvas-quick">Open ADR-{pid}-003</span>
            <span className="am-canvas-quick">Suggest next ADR</span>
            <span className="am-canvas-quick">Cross-check traces</span>
          </div>
          <div className="am-canvas-chat-input">
            <textarea placeholder="Ask the domain architect agent…" disabled />
            <button type="button" className="am-canvas-btn am-canvas-btn-primary" disabled>
              Send
            </button>
          </div>
        </aside>
          </>
        )}

        {view === "diagram" && (
          <>
            <main className="am-canvas-diagram-main">
              <div className="am-canvas-diagram-toolbar">
                <h2>Target architecture</h2>
                <span className="am-canvas-secmeta">
                  v3 · auto-generated from approved elements · illustrative
                </span>
                <span style={{ flex: 1 }} />
                <button type="button" className="am-canvas-toggle am-canvas-toggle-on">
                  Capabilities
                </button>
                <button type="button" className="am-canvas-toggle">Apps only</button>
                <button type="button" className="am-canvas-toggle">Integrations</button>
                <button type="button" className="am-canvas-toggle">Data flow</button>
                <div style={{ width: 16 }} />
                <div className="am-canvas-legend">
                  <span><i className="am-canvas-legend-sync" />sync</span>
                  <span><i className="am-canvas-legend-async" />async</span>
                  <span><i className="am-canvas-legend-event" />event</span>
                </div>
              </div>

              <svg viewBox="0 0 880 540" className="am-canvas-diagram-svg">
                {/* swim-lane separators */}
                <line x1="0" y1="120" x2="880" y2="120" stroke="#dde0e5" strokeDasharray="2 4" />
                <line x1="0" y1="310" x2="880" y2="310" stroke="#dde0e5" strokeDasharray="2 4" />
                <text className="am-svg-swim" x="16" y="32">Channels</text>
                <text className="am-svg-swim" x="16" y="152">Business capabilities</text>
                <text className="am-svg-swim" x="16" y="342">Systems &amp; data</text>

                {/* channels */}
                <g>
                  <rect className="am-svg-app" x="40" y="50" width="170" height="50" rx="6" />
                  <text className="am-svg-lbl" x="58" y="76">Online Banking</text>
                  <text className="am-svg-sub" x="58" y="92">channel · sync</text>

                  <rect className="am-svg-app" x="230" y="50" width="170" height="50" rx="6" />
                  <text className="am-svg-lbl" x="248" y="76">Mobile App</text>
                  <text className="am-svg-sub" x="248" y="92">channel · sync</text>

                  <rect className="am-svg-app" x="420" y="50" width="170" height="50" rx="6" />
                  <text className="am-svg-lbl" x="438" y="76">Branch Frontend</text>
                  <text className="am-svg-sub" x="438" y="92">channel · sync</text>

                  <rect className="am-svg-app" x="610" y="50" width="220" height="50" rx="6" />
                  <text className="am-svg-lbl" x="628" y="76">Document upload (PDF)</text>
                  <text className="am-svg-sub" x="628" y="92">channel · async</text>
                </g>

                {/* capability boxes */}
                <g>
                  <rect className="am-svg-cap am-svg-cap-sel" x="40" y="180" width="200" height="80" rx="6" />
                  <text className="am-svg-lbl" x="58" y="206">CAP-{pid}-002</text>
                  <text className="am-svg-lbl am-svg-lbl-strong" x="58" y="224">Case capture &amp; validation</text>
                  <text className="am-svg-sub" x="58" y="244">hosted in: Case Hub (new)</text>

                  <rect className="am-svg-cap" x="260" y="180" width="200" height="80" rx="6" />
                  <text className="am-svg-lbl" x="278" y="206">CAP-{pid}-005</text>
                  <text className="am-svg-lbl am-svg-lbl-strong" x="278" y="224">Case lifecycle</text>
                  <text className="am-svg-sub" x="278" y="244">hosted in: Case Hub</text>

                  <rect className="am-svg-cap" x="480" y="180" width="200" height="80" rx="6" />
                  <text className="am-svg-lbl" x="498" y="206">CAP-{pid}-008</text>
                  <text className="am-svg-lbl am-svg-lbl-strong" x="498" y="224">Backend processing</text>
                  <text className="am-svg-sub" x="498" y="244">hosted in: Core Platform</text>

                  <rect className="am-svg-cap" x="700" y="180" width="140" height="80" rx="6" />
                  <text className="am-svg-lbl" x="716" y="206">CAP-{pid}-009</text>
                  <text className="am-svg-lbl am-svg-lbl-strong" x="716" y="224">Outbound</text>
                  <text className="am-svg-sub" x="716" y="244">Gateway</text>
                </g>

                {/* systems */}
                <g>
                  <rect className="am-svg-app" x="40" y="360" width="200" height="60" rx="6" />
                  <text className="am-svg-lbl am-svg-lbl-strong" x="58" y="386">Case Hub</text>
                  <text className="am-svg-sub" x="58" y="402">BUILD · Camunda 8 + Postgres</text>

                  <rect className="am-svg-app" x="260" y="360" width="200" height="60" rx="6" />
                  <text className="am-svg-lbl am-svg-lbl-strong" x="278" y="386">Customer Master</text>
                  <text className="am-svg-sub" x="278" y="402">existing · authoritative party</text>

                  <rect className="am-svg-app" x="480" y="360" width="200" height="60" rx="6" />
                  <text className="am-svg-lbl am-svg-lbl-strong" x="498" y="386">Core Platform</text>
                  <text className="am-svg-sub" x="498" y="402">existing · keep</text>

                  <rect className="am-svg-ext" x="700" y="360" width="140" height="60" rx="6" />
                  <text className="am-svg-lbl am-svg-lbl-strong" x="716" y="386">External scheme</text>
                  <text className="am-svg-sub" x="716" y="402">external</text>

                  <rect className="am-svg-app" x="40" y="450" width="200" height="60" rx="6" />
                  <text className="am-svg-lbl am-svg-lbl-strong" x="58" y="476">Hyland ECM</text>
                  <text className="am-svg-sub" x="58" y="492">existing · document store</text>

                  <rect className="am-svg-app" x="480" y="450" width="200" height="60" rx="6" />
                  <text className="am-svg-lbl am-svg-lbl-strong" x="498" y="476">DWH (Snowflake)</text>
                  <text className="am-svg-sub" x="498" y="492">reporting · risk score</text>
                </g>

                {/* edges channels -> capabilities */}
                <path className="am-svg-edge-sync" d="M125 100 C 125 140, 140 150, 140 180" />
                <path className="am-svg-edge-sync" d="M315 100 C 315 140, 200 150, 200 180" />
                <path className="am-svg-edge-sync" d="M505 100 C 505 140, 360 150, 360 180" />
                <path className="am-svg-edge-async" d="M720 100 C 720 130, 140 150, 140 180" />

                {/* edges capabilities -> systems */}
                <path className="am-svg-edge-sync" d="M140 260 L 140 360" />
                <path className="am-svg-edge-sync" d="M360 260 L 360 360" />
                <path className="am-svg-edge-sync" d="M580 260 L 580 360" />
                <path className="am-svg-edge-sync" d="M770 260 L 770 360" />

                {/* inter-capability edges */}
                <path className="am-svg-edge-event" d="M240 220 L 260 220" />
                <text className="am-svg-edge-lbl" x="244" y="214">event</text>
                <path className="am-svg-edge-event" d="M460 220 L 480 220" />
                <text className="am-svg-edge-lbl" x="464" y="214">event</text>
                <path className="am-svg-edge-sync" d="M680 220 L 700 220" />

                {/* system to system */}
                <path className="am-svg-edge-async" d="M140 420 L 140 450" />
                <text className="am-svg-edge-lbl" x="146" y="442">PDF</text>
                <path className="am-svg-edge-async" d="M360 420 C 360 440, 280 450, 480 470" />
                <path className="am-svg-edge-async" d="M580 420 L 580 450" />
                <text className="am-svg-edge-lbl" x="586" y="442">nightly</text>
              </svg>

              <div className="am-canvas-banner">
                Illustrative diagram — ArchitectMiner authoring is still being built.
                Capabilities, target apps and integrations will be derived from
                approved architecture elements once the data model lands.
              </div>
            </main>

            <aside className="am-canvas-details">
              <h3>Capability — Case capture &amp; validation</h3>
              <div className="am-canvas-details-id">CAP-{pid}-002</div>

              <div className="am-canvas-details-block">
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Hosted in</span>
                  <span>
                    Case Hub <span className="am-pill am-pill-acc">BUILD</span>
                  </span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Criticality</span>
                  <span><span className="am-pill am-pill-mid">High</span></span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Reuse</span>
                  <span>new capability — no existing analog in catalog</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Owning domain</span>
                  <span>Case &amp; lifecycle management</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Status</span>
                  <span><span className="am-pill am-pill-hi">Accepted</span> · today</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Realises</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">
                    <span className="am-canvas-trace-lbl">target step</span>TS-{pid}-002
                  </span>
                  <span className="am-canvas-trace">
                    <span className="am-canvas-trace-lbl">target step</span>TS-{pid}-003
                  </span>
                  <span className="am-canvas-trace">
                    <span className="am-canvas-trace-lbl">resolves gap</span>G-{pid}-004
                  </span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Realised by ADRs</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">ADR-{pid}-002 schema</span>
                  <span className="am-canvas-trace">ADR-{pid}-007 orchestration</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>NFRs</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">NFR-{pid}-001 p95 &lt; 1.2s</span>
                  <span className="am-canvas-trace">NFR-{pid}-003 audit-log 10y</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Provenance</h4>
                <div className="am-canvas-details-prov">
                  <div><span className="am-canvas-verified">✓</span> Hosted in — human-confirmed</div>
                  <div><span className="am-canvas-verified">✓</span> Criticality — derived from transformation decision</div>
                  <div><span className="am-canvas-machine">▲</span> NFRs — drafted by solution-architect agent · review</div>
                </div>
              </div>
            </aside>
          </>
        )}

        {view === "traceability" && (
          <main className="am-canvas-trace-main">
            <div className="am-canvas-trace-head">
              <h2>Traceability — {doc.process.title}</h2>
              <span className="am-canvas-secmeta">
                last scanned today · run-lint architecture · illustrative
              </span>
            </div>

            <div className="am-canvas-stats">
              <div className="am-canvas-stat">
                <div className="am-canvas-stat-v">63</div>
                <div className="am-canvas-stat-l">architecture elements</div>
              </div>
              <div className="am-canvas-stat">
                <div className="am-canvas-stat-v am-canvas-stat-ok">87%</div>
                <div className="am-canvas-stat-l">fully traced</div>
              </div>
              <div className="am-canvas-stat">
                <div className="am-canvas-stat-v am-canvas-stat-warn">5</div>
                <div className="am-canvas-stat-l">partial traces</div>
              </div>
              <div className="am-canvas-stat">
                <div className="am-canvas-stat-v am-canvas-stat-bad">3</div>
                <div className="am-canvas-stat-l">orphans</div>
              </div>
              <div className="am-canvas-stat">
                <div className="am-canvas-stat-v">2</div>
                <div className="am-canvas-stat-l">stale (upstream changed)</div>
              </div>
            </div>

            <table className="am-canvas-trace-table">
              <thead>
                <tr>
                  <th style={{ width: 100 }}>ID</th>
                  <th>Element</th>
                  <th style={{ width: 130 }}>Type</th>
                  <th>Traces to upstream</th>
                  <th style={{ width: 90, textAlign: "right" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="am-canvas-trace-id">CAP-{pid}-002</td>
                  <td className="am-canvas-trace-title">Case capture &amp; validation</td>
                  <td className="am-canvas-trace-type">Capability</td>
                  <td>
                    <span className="am-canvas-trace">TS-{pid}-002</span>{" "}
                    <span className="am-canvas-trace">TS-{pid}-003</span>{" "}
                    <span className="am-canvas-trace">G-{pid}-004</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className="am-pill am-pill-hi">OK</span>
                  </td>
                </tr>
                <tr>
                  <td className="am-canvas-trace-id">CAP-{pid}-005</td>
                  <td className="am-canvas-trace-title">Case lifecycle</td>
                  <td className="am-canvas-trace-type">Capability</td>
                  <td>
                    <span className="am-canvas-trace">TS-{pid}-005</span>{" "}
                    <span className="am-canvas-trace">TD-{pid}-003</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className="am-pill am-pill-hi">OK</span>
                  </td>
                </tr>
                <tr>
                  <td className="am-canvas-trace-id">ADR-{pid}-007</td>
                  <td className="am-canvas-trace-title">Case orchestration via Camunda 8</td>
                  <td className="am-canvas-trace-type">ADR</td>
                  <td>
                    <span className="am-canvas-trace">TD-{pid}-002</span>{" "}
                    <span className="am-canvas-trace">G-{pid}-003</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className="am-pill am-pill-hi">OK</span>
                  </td>
                </tr>
                <tr className="am-canvas-trace-row-partial">
                  <td className="am-canvas-trace-id">ADR-{pid}-011</td>
                  <td className="am-canvas-trace-title">Async revocation via Kafka topic</td>
                  <td className="am-canvas-trace-type">ADR</td>
                  <td>
                    <span className="am-canvas-trace">TD-{pid}-006</span>{" "}
                    <span className="am-canvas-trace am-canvas-trace-warn">
                      G-{pid}-?? missing
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className="am-pill am-pill-mid">Partial</span>
                  </td>
                </tr>
                <tr>
                  <td className="am-canvas-trace-id">NFR-{pid}-003</td>
                  <td className="am-canvas-trace-title">Audit-log retention 10y</td>
                  <td className="am-canvas-trace-type">NFR</td>
                  <td>
                    <span className="am-canvas-trace">CP-{pid}-004</span>{" "}
                    <span className="am-canvas-trace">REG-{pid}-002</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className="am-pill am-pill-hi">OK</span>
                  </td>
                </tr>
                <tr className="am-canvas-trace-row-partial">
                  <td className="am-canvas-trace-id">NFR-{pid}-006</td>
                  <td className="am-canvas-trace-title">RTO ≤ 4h for Case Hub</td>
                  <td className="am-canvas-trace-type">NFR</td>
                  <td>
                    <span className="am-canvas-trace">ADR-{pid}-007</span>{" "}
                    <span className="am-canvas-trace am-canvas-trace-warn">
                      no control reference
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className="am-pill am-pill-mid">Partial</span>
                  </td>
                </tr>
                <tr className="am-canvas-trace-row-orphan">
                  <td className="am-canvas-trace-id">ADR-{pid}-013</td>
                  <td className="am-canvas-trace-title">Custom retry queue in Case Hub</td>
                  <td className="am-canvas-trace-type">ADR</td>
                  <td>
                    <span className="am-canvas-trace am-canvas-trace-bad">no upstream link</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className="am-pill am-pill-lo">Orphan</span>
                  </td>
                </tr>
                <tr className="am-canvas-trace-row-orphan">
                  <td className="am-canvas-trace-id">MIG-{pid}-003</td>
                  <td className="am-canvas-trace-title">Phase 3 — branch network rollout</td>
                  <td className="am-canvas-trace-type">Migration phase</td>
                  <td>
                    <span className="am-canvas-trace am-canvas-trace-bad">
                      no transformation-decision link
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className="am-pill am-pill-lo">Orphan</span>
                  </td>
                </tr>
                <tr>
                  <td className="am-canvas-trace-id">MIG-{pid}-001</td>
                  <td className="am-canvas-trace-title">Phase 1 — case hub live, dual-write to legacy</td>
                  <td className="am-canvas-trace-type">Migration phase</td>
                  <td>
                    <span className="am-canvas-trace">TD-{pid}-007</span>{" "}
                    <span className="am-canvas-trace">G-{pid}-009</span>{" "}
                    <span className="am-canvas-trace">ADR-{pid}-002</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className="am-pill am-pill-hi">OK</span>
                  </td>
                </tr>
                <tr>
                  <td className="am-canvas-trace-id">TGTAPP-{pid}-001</td>
                  <td className="am-canvas-trace-title">Case Hub</td>
                  <td className="am-canvas-trace-type">Target App</td>
                  <td>
                    <span className="am-canvas-trace">CAP-{pid}-002</span>{" "}
                    <span className="am-canvas-trace">CAP-{pid}-005</span>{" "}
                    <span className="am-canvas-trace">TD-{pid}-001</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className="am-pill am-pill-hi">OK</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="am-canvas-banner">
              Illustrative matrix — ArchitectMiner authoring is still being built.
              Traces will be derived from real architecture elements once the data
              model lands.
            </div>
          </main>
        )}

        {view === "capabilities" && (
          <>
            <main className="am-canvas-doc">
              <div className="am-canvas-sechead">
                <h2>Capabilities</h2>
                <span className="am-canvas-secmeta">
                  7 elements · 4 accepted · 3 proposed · 0 draft
                </span>
                <span style={{ flex: 1 }} />
                <button type="button" className="am-canvas-btn">＋ Add Capability</button>
                <button type="button" className="am-canvas-btn am-canvas-btn-primary">
                  ／ Elicit with domain architect
                </button>
              </div>

              <div className="am-canvas-cap-filterbar">
                <span className="am-pill am-pill-acc">All (7)</span>
                <span className="am-pill am-pill-neu">Critical (3)</span>
                <span className="am-pill am-pill-neu">Reused (4)</span>
                <span className="am-pill am-pill-neu">New (3)</span>
              </div>

              <div className="am-canvas-cap-grid">
                <CapCard id={`CAP-${pid}-001`} name="Customer identification" status="Accepted" critical reused host="Customer Master" steps={3} adrs={2} nfrs={1} prov="verified" />
                <CapCard id={`CAP-${pid}-002`} name="Case capture & validation" status="Accepted" high newCap host="Case Hub (BUILD)" steps={4} adrs={3} nfrs={2} prov="verified" selected />
                <CapCard id={`CAP-${pid}-003`} name="Risk assessment & scoring" status="Proposed" high reused host="Risk Score Service" steps={5} adrs={2} nfrs={3} prov="machine" provText={`drafted · review NFR-${pid}-008`} />
                <CapCard id={`CAP-${pid}-004`} name="KYC refresh" status="Accepted" critical reused host="KYC Engine (CONFIGURE)" steps={3} adrs={1} nfrs={1} prov="verified" />
                <CapCard id={`CAP-${pid}-005`} name="Case lifecycle" status="Proposed" high newCap host="Case Hub (BUILD)" steps={6} adrs={2} nfrs={2} prov="machine" provText="drafted by domain-architect agent" />
                <CapCard id={`CAP-${pid}-006`} name="Document collection" status="Accepted" medium reused host="Hyland ECM" steps={2} adrs={1} nfrs={2} prov="verified" />
                <CapCard id={`CAP-${pid}-007`} name="Periodic review reporting" status="Proposed" medium newCap host="DWH (Snowflake)" steps={2} adrs={1} nfrs={2} prov="machine" provText="drafted · awaiting reviewer" />
              </div>

              <div className="am-canvas-banner">
                Illustrative content — ArchitectMiner authoring is still being built.
                Capabilities will be authored as real schema-validated elements once
                the architect data model lands.
              </div>
            </main>

            <aside className="am-canvas-details">
              <h3>Capability — Case capture &amp; validation</h3>
              <div className="am-canvas-details-id">CAP-{pid}-002</div>

              <div className="am-canvas-details-block">
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Hosted in</span>
                  <span>Case Hub <span className="am-verdict am-verdict-build">BUILD</span></span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Criticality</span>
                  <span><span className="am-pill am-pill-mid">High</span></span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Reuse</span>
                  <span>new — no existing analog</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Owning domain</span>
                  <span>Case &amp; lifecycle management</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Owner</span>
                  <span>{user.name} · Domain Architect</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Status</span>
                  <span><span className="am-pill am-pill-hi">Accepted</span> · today</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Realises target steps</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">TS-{pid}-002 Capture</span>
                  <span className="am-canvas-trace">TS-{pid}-003 Validate</span>
                  <span className="am-canvas-trace">TS-{pid}-004 Enrich</span>
                  <span className="am-canvas-trace">TS-{pid}-009 Triage</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Realised by ADRs</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">ADR-{pid}-002 schema</span>
                  <span className="am-canvas-trace">ADR-{pid}-007 orchestration</span>
                  <span className="am-canvas-trace">ADR-{pid}-011 async revocation</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>NFRs</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">NFR-{pid}-001 p95 &lt; 1.2s</span>
                  <span className="am-canvas-trace">NFR-{pid}-003 audit-log 10y</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Resolves gaps</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">G-{pid}-003 mailbox-only triage</span>
                  <span className="am-canvas-trace">G-{pid}-004 no audit trail</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Provenance</h4>
                <div className="am-canvas-details-prov">
                  <div><span className="am-canvas-verified">✓</span> Hosted in — human-confirmed</div>
                  <div><span className="am-canvas-verified">✓</span> Criticality — derived from TD-{pid}-001</div>
                  <div><span className="am-canvas-verified">✓</span> Reuse — verified against catalog (no match)</div>
                  <div><span className="am-canvas-machine">▲</span> NFRs — drafted by solution-architect agent · review</div>
                </div>
              </div>
            </aside>
          </>
        )}

        {view === "applications" && (
          <>
            <main className="am-canvas-doc">
              <div className="am-canvas-sechead">
                <h2>Target Applications</h2>
                <span className="am-canvas-secmeta">
                  6 elements · 4 accepted · 2 proposed · 1 BUILD · 1 BUY · 1 CONFIGURE · 3 KEEP
                </span>
                <span style={{ flex: 1 }} />
                <button type="button" className="am-canvas-btn">＋ Add Application</button>
                <button type="button" className="am-canvas-btn am-canvas-btn-primary">
                  ／ Elicit with domain architect
                </button>
              </div>

              <div className="am-canvas-cap-filterbar">
                <span className="am-pill am-pill-acc">All (6)</span>
                <span className="am-pill am-pill-neu">BUILD (1)</span>
                <span className="am-pill am-pill-neu">BUY (1)</span>
                <span className="am-pill am-pill-neu">CONFIGURE (1)</span>
                <span className="am-pill am-pill-neu">KEEP (3)</span>
              </div>

              <table className="am-canvas-app-table">
                <thead>
                  <tr>
                    <th style={{ width: "24%" }}>Application</th>
                    <th>Verdict</th>
                    <th>Capabilities hosted</th>
                    <th>Tech / vendor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="am-canvas-app-sel">
                    <td>
                      <div className="am-canvas-app-name">Case Hub</div>
                      <div className="am-canvas-app-id">TGTAPP-{pid}-001</div>
                      <div className="am-canvas-app-stack">new app · owned by case-mgmt domain</div>
                    </td>
                    <td><span className="am-verdict am-verdict-build">BUILD</span></td>
                    <td>
                      <div className="am-canvas-app-chips">
                        <span className="am-canvas-app-chip">CAP-{pid}-002 capture</span>
                        <span className="am-canvas-app-chip">CAP-{pid}-005 lifecycle</span>
                      </div>
                    </td>
                    <td>
                      <div>Camunda 8 + Postgres</div>
                      <div className="am-canvas-app-stack">eu-frankfurt · self-hosted</div>
                    </td>
                    <td><span className="am-pill am-pill-hi"><span className="am-dot" />Accepted</span></td>
                  </tr>
                  <tr>
                    <td>
                      <div className="am-canvas-app-name">Customer Master</div>
                      <div className="am-canvas-app-id">TGTAPP-{pid}-002</div>
                      <div className="am-canvas-app-stack">existing · authoritative party data</div>
                    </td>
                    <td><span className="am-verdict am-verdict-keep">KEEP</span></td>
                    <td>
                      <div className="am-canvas-app-chips">
                        <span className="am-canvas-app-chip">CAP-{pid}-001 identification</span>
                      </div>
                    </td>
                    <td>
                      <div>Oracle Siebel</div>
                      <div className="am-canvas-app-stack">existing · vendor-supported</div>
                    </td>
                    <td><span className="am-pill am-pill-hi"><span className="am-dot" />Accepted</span></td>
                  </tr>
                  <tr>
                    <td>
                      <div className="am-canvas-app-name">KYC Engine</div>
                      <div className="am-canvas-app-id">TGTAPP-{pid}-003</div>
                      <div className="am-canvas-app-stack">existing · requires periodic-review config</div>
                    </td>
                    <td><span className="am-verdict am-verdict-configure">CONFIGURE</span></td>
                    <td>
                      <div className="am-canvas-app-chips">
                        <span className="am-canvas-app-chip">CAP-{pid}-004 KYC refresh</span>
                      </div>
                    </td>
                    <td>
                      <div>Fenergo</div>
                      <div className="am-canvas-app-stack">existing · vendor config + 2 dev-weeks</div>
                    </td>
                    <td><span className="am-pill am-pill-hi"><span className="am-dot" />Accepted</span></td>
                  </tr>
                  <tr>
                    <td>
                      <div className="am-canvas-app-name">Risk Score Service</div>
                      <div className="am-canvas-app-id">TGTAPP-{pid}-004</div>
                      <div className="am-canvas-app-stack">no in-house option · evaluated 3 vendors</div>
                    </td>
                    <td><span className="am-verdict am-verdict-buy">BUY</span></td>
                    <td>
                      <div className="am-canvas-app-chips">
                        <span className="am-canvas-app-chip">CAP-{pid}-003 risk scoring</span>
                      </div>
                    </td>
                    <td>
                      <div>Quantexa</div>
                      <div className="am-canvas-app-stack">SaaS · €240k/yr · 8-week onboarding</div>
                    </td>
                    <td><span className="am-pill am-pill-mid"><span className="am-dot" />Proposed</span></td>
                  </tr>
                  <tr>
                    <td>
                      <div className="am-canvas-app-name">Hyland ECM</div>
                      <div className="am-canvas-app-id">TGTAPP-{pid}-005</div>
                      <div className="am-canvas-app-stack">existing · group-wide document store</div>
                    </td>
                    <td><span className="am-verdict am-verdict-keep">KEEP</span></td>
                    <td>
                      <div className="am-canvas-app-chips">
                        <span className="am-canvas-app-chip">CAP-{pid}-006 document collection</span>
                      </div>
                    </td>
                    <td>
                      <div>OnBase</div>
                      <div className="am-canvas-app-stack">existing · keep as-is</div>
                    </td>
                    <td><span className="am-pill am-pill-hi"><span className="am-dot" />Accepted</span></td>
                  </tr>
                  <tr>
                    <td>
                      <div className="am-canvas-app-name">DWH (Snowflake)</div>
                      <div className="am-canvas-app-id">TGTAPP-{pid}-006</div>
                      <div className="am-canvas-app-stack">existing · add periodic-review marts</div>
                    </td>
                    <td><span className="am-verdict am-verdict-keep">KEEP</span></td>
                    <td>
                      <div className="am-canvas-app-chips">
                        <span className="am-canvas-app-chip">CAP-{pid}-007 reporting</span>
                      </div>
                    </td>
                    <td>
                      <div>Snowflake</div>
                      <div className="am-canvas-app-stack">existing · adds ~2TB to footprint</div>
                    </td>
                    <td><span className="am-pill am-pill-mid"><span className="am-dot" />Proposed</span></td>
                  </tr>
                </tbody>
              </table>

              <div className="am-canvas-banner">
                Illustrative content — Target Applications will be authored as real
                schema-validated elements once the architect data model lands.
              </div>
            </main>

            <aside className="am-canvas-details">
              <h3>Application — Case Hub</h3>
              <div className="am-canvas-details-id">TGTAPP-{pid}-001</div>

              <div className="am-canvas-details-block">
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Verdict</span>
                  <span><span className="am-verdict am-verdict-build">BUILD</span></span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Owning domain</span>
                  <span>Case &amp; lifecycle management</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Tech stack</span>
                  <span>Camunda 8 + Postgres 16</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Hosting</span>
                  <span>self-hosted · eu-frankfurt</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Cost band</span>
                  <span>€420k build · €120k/yr run</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Build estimate</span>
                  <span>14 FTE-weeks</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Status</span>
                  <span><span className="am-pill am-pill-hi">Accepted</span> · today</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Capabilities hosted</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">CAP-{pid}-002 capture &amp; validation</span>
                  <span className="am-canvas-trace">CAP-{pid}-005 case lifecycle</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Integrations</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">→ Customer Master · sync</span>
                  <span className="am-canvas-trace">→ Risk Score Service · event</span>
                  <span className="am-canvas-trace">→ Hyland ECM · async</span>
                  <span className="am-canvas-trace">→ DWH · nightly</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Driven by ADRs</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">ADR-{pid}-007 orchestration</span>
                  <span className="am-canvas-trace">ADR-{pid}-002 schema</span>
                  <span className="am-canvas-trace">ADR-{pid}-013 retry queue</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>NFRs &amp; risks</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">NFR-{pid}-001 p95 &lt; 1.2s</span>
                  <span className="am-canvas-trace">NFR-{pid}-006 RTO ≤ 4h</span>
                  <span className="am-canvas-trace am-canvas-trace-bad">RISK SaaS region cap</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Provenance</h4>
                <div className="am-canvas-details-prov">
                  <div><span className="am-canvas-verified">✓</span> Verdict — human-confirmed</div>
                  <div><span className="am-canvas-verified">✓</span> Cost band — derived from RFP-{pid}-001</div>
                  <div><span className="am-canvas-verified">✓</span> Capabilities hosted — linked to CAP-{pid}-002, CAP-{pid}-005</div>
                  <div><span className="am-canvas-machine">▲</span> Cost band detail — drafted by procurement-agent · review</div>
                </div>
              </div>
            </aside>
          </>
        )}

        {view === "integrations" && (
          <>
            <main className="am-canvas-doc">
              <div className="am-canvas-sechead">
                <h2>Target Integrations</h2>
                <span className="am-canvas-secmeta">
                  8 elements · 5 accepted · 3 proposed · 4 sync · 2 async · 1 event · 1 batch
                </span>
                <span style={{ flex: 1 }} />
                <button type="button" className="am-canvas-btn">＋ Add Integration</button>
                <button type="button" className="am-canvas-btn am-canvas-btn-primary">
                  ／ Elicit with solution architect
                </button>
              </div>

              <div className="am-canvas-cap-filterbar">
                <span className="am-pill am-pill-acc">All (8)</span>
                <span className="am-pill am-pill-neu">SYNC (4)</span>
                <span className="am-pill am-pill-neu">ASYNC (2)</span>
                <span className="am-pill am-pill-neu">EVENT (1)</span>
                <span className="am-pill am-pill-neu">BATCH (1)</span>
              </div>

              <table className="am-canvas-app-table">
                <thead>
                  <tr>
                    <th style={{ width: "22%" }}>From → To</th>
                    <th>Pattern</th>
                    <th>Direction</th>
                    <th>Volume</th>
                    <th>Contract</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <IntegrationRow selected from="Case Hub" to="Customer Master" id={`INT-${pid}-001`} sub="read party data on case open" pattern="sync" direction="request / response" volume="~12k req/day" volSub="p95 380ms" contract="OpenAPI 3.1 · v2" status="Accepted" />
                  <IntegrationRow from="Case Hub" to="Risk Score Service" id={`INT-${pid}-002`} sub="subscribe to score updates" pattern="event" direction="pub / sub · at-least-once" volume="~5k events/day" volSub="batched 50ms" contract="AsyncAPI 2.6" status="Proposed" />
                  <IntegrationRow from="Case Hub" to="KYC Engine" id={`INT-${pid}-003`} sub="trigger KYC refresh task" pattern="sync" direction="request / response" volume="~4k req/day" volSub="p95 900ms" contract="OpenAPI 3.0" status="Accepted" />
                  <IntegrationRow from="Case Hub" to="Hyland ECM" id={`INT-${pid}-004`} sub="upload supporting documents" pattern="async" direction="fire-and-forget · retry" volume="~8k uploads/day" volSub="avg 1.2 MB" contract="CMIS 1.1" status="Accepted" />
                  <IntegrationRow from="Case Hub" to="DWH" id={`INT-${pid}-005`} sub="nightly snapshot of closed cases" pattern="batch" direction="nightly · 02:00 UTC" volume="~12 GB/night" volSub="Parquet" contract="Snowflake stage" status="Proposed" />
                  <IntegrationRow from="Risk Score Service" to="DWH" id={`INT-${pid}-006`} sub="score history append" pattern="async" direction="streaming · Kinesis" volume="~30k events/day" volSub="retention 7d" contract="AsyncAPI 2.6" status="Accepted" />
                  <IntegrationRow from="Customer Master" to="Case Hub" id={`INT-${pid}-007`} sub="webhook on customer change" pattern="sync" direction="webhook · POST" volume="~200 events/day" volSub="low volume" contract="OpenAPI 3.1" status="Accepted" />
                  <IntegrationRow from="KYC Engine" to="Case Hub" id={`INT-${pid}-008`} sub="notify on KYC verdict" pattern="sync" direction="callback URL" volume="~4k events/day" volSub="p95 280ms" contract="OpenAPI 3.0" status="Proposed" />
                </tbody>
              </table>

              <div className="am-canvas-banner">
                Illustrative content — Target Integrations will be authored as real
                schema-validated elements once the architect data model lands.
              </div>
            </main>

            <aside className="am-canvas-details">
              <h3>Integration — Case Hub → Customer Master</h3>
              <div className="am-canvas-details-id">INT-{pid}-001</div>

              <div className="am-canvas-details-block">
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Pattern</span>
                  <span><span className="am-int-pattern am-int-pattern-sync">SYNC</span></span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Direction</span>
                  <span>request / response · idempotent reads</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Volume</span>
                  <span>~12k req/day · p95 380ms</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Contract</span>
                  <span>OpenAPI 3.1 · <code>/v2/customers/{"{id}"}</code></span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Auth</span>
                  <span>mTLS + OAuth2 client_credentials</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Failure mode</span>
                  <span>cached read (5 min TTL) on 5xx</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Status</span>
                  <span><span className="am-pill am-pill-hi">Accepted</span> · today</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Realises</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">CAP-{pid}-001 identification</span>
                  <span className="am-canvas-trace">CAP-{pid}-002 capture &amp; validation</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Driven by ADRs</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">ADR-{pid}-002 schema</span>
                  <span className="am-canvas-trace">ADR-{pid}-005 reuse</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>NFRs</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">NFR-{pid}-001 p95 &lt; 1.2s</span>
                  <span className="am-canvas-trace">NFR-{pid}-005 encrypt-in-transit</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Provenance</h4>
                <div className="am-canvas-details-prov">
                  <div><span className="am-canvas-verified">✓</span> Pattern — human-confirmed</div>
                  <div><span className="am-canvas-verified">✓</span> Contract — verified against OpenAPI registry</div>
                  <div><span className="am-canvas-machine">▲</span> Failure mode — drafted by solution-architect agent · review</div>
                </div>
              </div>
            </aside>
          </>
        )}

        {view === "components" && (
          <>
            <main className="am-canvas-doc">
              <div className="am-canvas-sechead">
                <h2>Components</h2>
                <span className="am-canvas-secmeta">
                  17 elements · across 3 BUILD/BUY apps · 11 accepted · 6 proposed
                </span>
                <span style={{ flex: 1 }} />
                <button type="button" className="am-canvas-btn">＋ Add Component</button>
                <button type="button" className="am-canvas-btn am-canvas-btn-primary">
                  ／ Elicit with solution architect
                </button>
              </div>

              <div className="am-canvas-cap-filterbar">
                <span className="am-pill am-pill-acc">All (17)</span>
                <span className="am-pill am-pill-neu">Case Hub (8)</span>
                <span className="am-pill am-pill-neu">Risk Score (5)</span>
                <span className="am-pill am-pill-neu">DWH PR mart (4)</span>
              </div>

              <div className="am-canvas-comp-group">
                <div className="am-canvas-comp-group-head">
                  <h3>
                    Case Hub <span className="am-verdict am-verdict-build" style={{ marginLeft: 6 }}>BUILD</span>
                  </h3>
                  <span className="am-canvas-comp-count">8 components</span>
                </div>
                <div className="am-canvas-comp-cards">
                  <ComponentCard id={`COMP-${pid}-001`} name="API Gateway" tech="Kong + JWT" sub="TLS 1.3" deps={["→ Keycloak"]} status="Accepted" />
                  <ComponentCard selected id={`COMP-${pid}-002`} name="Case Service" tech="Spring Boot 3" sub="Postgres 16" deps={["→ API Gateway", "→ Workflow Engine"]} status="Accepted" />
                  <ComponentCard id={`COMP-${pid}-003`} name="Workflow Engine" tech="Camunda 8 / Zeebe" sub="" deps={["→ Postgres"]} status="Accepted" />
                  <ComponentCard id={`COMP-${pid}-004`} name="Task Service" tech="Camunda Tasklist + GraphQL" sub="" deps={["→ Workflow Engine"]} status="Accepted" />
                  <ComponentCard id={`COMP-${pid}-005`} name="Notification Worker" tech="Quarkus" sub="SES + Slack adapter" deps={["→ Case Service", "→ SMTP"]} status="Proposed" />
                  <ComponentCard id={`COMP-${pid}-006`} name="Auth Adapter" tech="Keycloak SDK" sub="" deps={["→ API Gateway"]} status="Accepted" />
                  <ComponentCard id={`COMP-${pid}-007`} name="Retry Queue" tech="Redis Streams" sub="" deps={["→ Case Service"]} status="Proposed" />
                  <ComponentCard id={`COMP-${pid}-008`} name="Outbox Publisher" tech="Debezium" sub="Postgres CDC" deps={["→ Case Service", "→ Kinesis"]} status="Proposed" />
                </div>
              </div>

              <div className="am-canvas-comp-group">
                <div className="am-canvas-comp-group-head">
                  <h3>
                    Risk Score Service <span className="am-verdict am-verdict-buy" style={{ marginLeft: 6 }}>BUY</span>
                  </h3>
                  <span className="am-canvas-comp-count">5 components</span>
                </div>
                <div className="am-canvas-comp-cards">
                  <ComponentCard id={`COMP-${pid}-009`} name="Scoring Engine" tech="Quantexa core" sub="vendor" deps={["vendor-managed"]} status="Accepted" />
                  <ComponentCard id={`COMP-${pid}-010`} name="Score API" tech="REST" sub="OpenAPI 3" deps={["→ Scoring Engine"]} status="Accepted" />
                  <ComponentCard id={`COMP-${pid}-011`} name="Event Bridge" tech="Kinesis" sub="producer" deps={["→ Scoring Engine"]} status="Proposed" />
                </div>
              </div>

              <div className="am-canvas-comp-group">
                <div className="am-canvas-comp-group-head">
                  <h3>
                    DWH — Periodic Review marts <span className="am-verdict am-verdict-keep" style={{ marginLeft: 6 }}>KEEP</span>
                  </h3>
                  <span className="am-canvas-comp-count">4 components</span>
                </div>
                <div className="am-canvas-comp-cards">
                  <ComponentCard id={`COMP-${pid}-014`} name="Case Snapshot Stage" tech="Snowflake stage" sub="S3 backed" deps={[`← INT-${pid}-005`]} status="Accepted" />
                  <ComponentCard id={`COMP-${pid}-015`} name="Review Cube" tech="Snowflake" sub="dbt models" deps={["← Case Snapshot Stage"]} status="Accepted" />
                </div>
              </div>

              <div className="am-canvas-banner">
                Illustrative content — Components will be authored as real
                schema-validated elements once the architect data model lands.
              </div>
            </main>

            <aside className="am-canvas-details">
              <h3>Component — Case Service</h3>
              <div className="am-canvas-details-id">COMP-{pid}-002 · in TGTAPP-{pid}-001 Case Hub</div>

              <div className="am-canvas-details-block">
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Tech</span>
                  <span>Spring Boot 3 (Java 21)</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Data store</span>
                  <span>Postgres 16 · shared cluster</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Hosting</span>
                  <span>EKS · eu-frankfurt</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Scaling</span>
                  <span>HPA · 3 → 12 replicas</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Status</span>
                  <span><span className="am-pill am-pill-hi">Accepted</span> · today</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Internal dependencies</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">→ COMP-{pid}-001 API Gateway</span>
                  <span className="am-canvas-trace">→ COMP-{pid}-003 Workflow Engine</span>
                  <span className="am-canvas-trace">→ COMP-{pid}-007 Retry Queue</span>
                  <span className="am-canvas-trace">→ COMP-{pid}-008 Outbox Publisher</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>External integrations</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">→ INT-{pid}-001 Customer Master</span>
                  <span className="am-canvas-trace">→ INT-{pid}-003 KYC Engine</span>
                  <span className="am-canvas-trace">→ INT-{pid}-004 Hyland ECM</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Realises</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">CAP-{pid}-002 capture &amp; validation</span>
                  <span className="am-canvas-trace">CAP-{pid}-005 case lifecycle</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>NFRs</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">NFR-{pid}-001 p95 &lt; 1.2s</span>
                  <span className="am-canvas-trace">NFR-{pid}-006 RTO ≤ 4h</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Provenance</h4>
                <div className="am-canvas-details-prov">
                  <div><span className="am-canvas-verified">✓</span> Tech stack — human-confirmed</div>
                  <div><span className="am-canvas-verified">✓</span> Hosting — derived from ADR-{pid}-007</div>
                  <div><span className="am-canvas-machine">▲</span> Scaling profile — drafted by solution-architect agent</div>
                </div>
              </div>
            </aside>
          </>
        )}

        {view === "nfrs" && (
          <>
            <main className="am-canvas-doc">
              <div className="am-canvas-sechead">
                <h2>NFRs</h2>
                <span className="am-canvas-secmeta">
                  8 elements · 5 accepted · 3 proposed · 2 perf · 2 avail · 2 sec · 2 compliance
                </span>
                <span style={{ flex: 1 }} />
                <button type="button" className="am-canvas-btn">＋ Add NFR</button>
                <button type="button" className="am-canvas-btn am-canvas-btn-primary">
                  ／ Elicit with solution architect
                </button>
              </div>

              <div className="am-canvas-cap-filterbar">
                <span className="am-pill am-pill-acc">All (8)</span>
                <span className="am-pill am-pill-neu">Performance (2)</span>
                <span className="am-pill am-pill-neu">Availability (2)</span>
                <span className="am-pill am-pill-neu">Security (2)</span>
                <span className="am-pill am-pill-neu">Compliance (2)</span>
              </div>

              <table className="am-canvas-app-table">
                <thead>
                  <tr>
                    <th style={{ width: 90 }}>ID</th>
                    <th style={{ width: 110 }}>Category</th>
                    <th>NFR</th>
                    <th>Target</th>
                    <th>Traces to</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <NfrRow selected id={`NFR-${pid}-001`} cat="perf" catLabel="PERF" name="Case opening latency" sub="measured on the case-open API" target="p95 < 1.2s" traces={[`CP-${pid}-004`, `CAP-${pid}-002`]} status="Accepted" />
                  <NfrRow id={`NFR-${pid}-002`} cat="perf" catLabel="PERF" name="Bulk batch throughput" sub="closing batch for 5k cases overnight" target="≥ 1k cases / min" traces={[`CAP-${pid}-005`]} status="Proposed" />
                  <NfrRow id={`NFR-${pid}-003`} cat="comp" catLabel="COMP" name="Audit-log retention" sub="every state transition and approval" target="10 years" traces={[`CP-${pid}-001`, `REG-${pid}-002 PSD2 §95`]} status="Accepted" />
                  <NfrRow id={`NFR-${pid}-004`} cat="avail" catLabel="AVAIL" name="Case Hub recovery time" sub="RTO on regional failover" target="RTO ≤ 4h" traces={[`ADR-${pid}-007`, `CP-${pid}-005`]} status="Accepted" />
                  <NfrRow id={`NFR-${pid}-005`} cat="sec" catLabel="SEC" name="Encryption in transit" sub="all inter-service traffic" target="TLS 1.3 · mTLS" traces={[`CP-${pid}-006`, `REG-${pid}-001 DORA`]} status="Accepted" />
                  <NfrRow id={`NFR-${pid}-006`} cat="avail" catLabel="AVAIL" name="Recovery point objective" sub="data loss tolerance after failover" target="RPO ≤ 15 min" traces={[`CP-${pid}-005`]} status="Proposed" />
                  <NfrRow id={`NFR-${pid}-007`} cat="sec" catLabel="SEC" name="Segregation of duties" sub="reviewer ≠ approver on same case" target="enforced at engine" traces={[`CP-${pid}-002`, `CP-${pid}-003`]} status="Accepted" />
                  <NfrRow id={`NFR-${pid}-008`} cat="comp" catLabel="COMP" name="PII data residency" sub="EU-only storage and processing" target="eu-frankfurt only" traces={[`REG-${pid}-003 GDPR`, `REG-${pid}-004 BAFIN`]} status="Proposed" />
                </tbody>
              </table>

              <div className="am-canvas-banner">
                Illustrative content — NFRs will be authored as real
                schema-validated elements once the architect data model lands.
              </div>
            </main>

            <aside className="am-canvas-details">
              <h3>NFR — Case opening latency</h3>
              <div className="am-canvas-details-id">
                NFR-{pid}-001 · <span className="am-nfr-cat am-nfr-cat-perf" style={{ marginLeft: 4 }}>PERFORMANCE</span>
              </div>

              <div className="am-canvas-details-block">
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Target</span>
                  <span><span className="am-nfr-target">p95 &lt; 1.2s</span> · p99 &lt; 2.5s</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Scope</span>
                  <span>case-open API on Case Hub</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Measurement</span>
                  <span>Prometheus histogram · 1-min buckets</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Verified by</span>
                  <span>k6 load test (Phase 1 acceptance)</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Owner</span>
                  <span>SRE · solution-architect</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Status</span>
                  <span><span className="am-pill am-pill-hi">Accepted</span> · today</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Traces upstream</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace"><span style={{ color: "var(--muted)" }}>satisfies control</span> CP-{pid}-004</span>
                  <span className="am-canvas-trace"><span style={{ color: "var(--muted)" }}>required by</span> CAP-{pid}-002</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Applies to</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">COMP-{pid}-002 Case Service</span>
                  <span className="am-canvas-trace">INT-{pid}-001 → Customer Master</span>
                  <span className="am-canvas-trace">INT-{pid}-003 → KYC Engine</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Driven by ADRs</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">ADR-{pid}-007 orchestration</span>
                  <span className="am-canvas-trace">ADR-{pid}-002 schema</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Provenance</h4>
                <div className="am-canvas-details-prov">
                  <div><span className="am-canvas-verified">✓</span> Target — human-confirmed</div>
                  <div><span className="am-canvas-verified">✓</span> Control trace — verified against CP-{pid}-004</div>
                  <div><span className="am-canvas-machine">▲</span> Verification plan — drafted by SRE agent · review</div>
                </div>
              </div>
            </aside>
          </>
        )}

        {view === "migration" && (
          <>
            <main className="am-canvas-doc">
              <div className="am-canvas-sechead">
                <h2>Migration Phases</h2>
                <span className="am-canvas-secmeta">
                  4 phases · 1 done · 1 in flight · 2 planned · go-live 2027 Q2
                </span>
                <span style={{ flex: 1 }} />
                <button type="button" className="am-canvas-btn">＋ Add Phase</button>
                <button type="button" className="am-canvas-btn am-canvas-btn-primary">
                  ／ Elicit with solution architect
                </button>
              </div>

              <div className="am-canvas-gantt-wrap">
                <div className="am-canvas-gantt-legend">
                  <span><i className="am-canvas-gantt-sw am-canvas-gantt-sw-done" />done</span>
                  <span><i className="am-canvas-gantt-sw am-canvas-gantt-sw-flight" />in flight</span>
                  <span><i className="am-canvas-gantt-sw am-canvas-gantt-sw-planned" />planned</span>
                </div>

                <svg viewBox="0 0 880 320" className="am-canvas-gantt-svg">
                  <g>
                    <line className="am-svg-grid-line" x1="160" y1="40" x2="160" y2="290" />
                    <line className="am-svg-grid-line" x1="280" y1="40" x2="280" y2="290" />
                    <line className="am-svg-grid-line" x1="400" y1="40" x2="400" y2="290" />
                    <line className="am-svg-grid-line" x1="520" y1="40" x2="520" y2="290" />
                    <line className="am-svg-grid-line" x1="640" y1="40" x2="640" y2="290" />
                    <line className="am-svg-grid-line" x1="760" y1="40" x2="760" y2="290" />

                    <text className="am-svg-axis-lbl" x="160" y="30" textAnchor="middle">2026 Q2</text>
                    <text className="am-svg-axis-lbl" x="280" y="30" textAnchor="middle">2026 Q3</text>
                    <text className="am-svg-axis-lbl" x="400" y="30" textAnchor="middle">2026 Q4</text>
                    <text className="am-svg-axis-lbl" x="520" y="30" textAnchor="middle">2027 Q1</text>
                    <text className="am-svg-axis-lbl" x="640" y="30" textAnchor="middle">2027 Q2</text>
                    <text className="am-svg-axis-lbl" x="760" y="30" textAnchor="middle">2027 Q3</text>
                  </g>

                  <line className="am-svg-today" x1="200" y1="40" x2="200" y2="295" />
                  <text className="am-svg-today-lbl" x="204" y="50">TODAY</text>

                  <text className="am-svg-row-id" x="14" y="90">MIG-{pid}-001</text>
                  <text className="am-svg-row-lbl" x="14" y="106">Foundations &amp; SSO</text>
                  <rect className="am-svg-gantt-bar-done" x="160" y="80" width="120" height="32" rx="4" />
                  <text className="am-svg-gantt-bar-lbl" x="170" y="100">Foundations · done</text>

                  <text className="am-svg-row-id" x="14" y="150">MIG-{pid}-002</text>
                  <text className="am-svg-row-lbl" x="14" y="166">Case Hub live · dual-write to legacy</text>
                  <rect className="am-svg-gantt-bar-flight" x="160" y="140" width="360" height="32" rx="4" />
                  <text className="am-svg-gantt-bar-lbl" x="170" y="160">Case Hub MVP → migration · in flight</text>

                  <text className="am-svg-row-id" x="14" y="210">MIG-{pid}-003</text>
                  <text className="am-svg-row-lbl" x="14" y="226">Risk Score Service onboarding</text>
                  <rect className="am-svg-gantt-bar-planned" x="400" y="200" width="240" height="32" rx="4" />
                  <text className="am-svg-gantt-bar-lbl am-svg-gantt-bar-lbl-planned" x="410" y="220">Vendor · 8-week onboarding</text>

                  <text className="am-svg-row-id" x="14" y="270">MIG-{pid}-004</text>
                  <text className="am-svg-row-lbl" x="14" y="286">Legacy decommission &amp; cutover</text>
                  <rect className="am-svg-gantt-bar-planned" x="520" y="260" width="240" height="32" rx="4" />
                  <text className="am-svg-gantt-bar-lbl am-svg-gantt-bar-lbl-planned" x="530" y="280">Full cutover · go-live 2027 Q2</text>

                  <path className="am-svg-dep" d="M280 96 C 320 96, 320 156, 360 156" />
                  <polygon className="am-svg-dep-arrow" points="360,156 354,152 354,160" />
                  <path className="am-svg-dep" d="M520 156 C 540 156, 540 216, 560 216" />
                  <polygon className="am-svg-dep-arrow" points="560,216 554,212 554,220" />
                  <path className="am-svg-dep" d="M640 216 C 660 216, 660 276, 680 276" />
                  <polygon className="am-svg-dep-arrow" points="680,276 674,272 674,280" />
                </svg>
              </div>

              <div className="am-canvas-phase-cards">
                <div className="am-canvas-phase-card">
                  <div className="am-canvas-phase-head">
                    <span className="am-canvas-phase-id">MIG-{pid}-001</span>
                    <span className="am-pill am-pill-hi"><span className="am-dot" />Done</span>
                  </div>
                  <div className="am-canvas-phase-name">Foundations &amp; SSO</div>
                  <div className="am-canvas-phase-when">2026 Q2 — 2026 Q3</div>
                  <div className="am-canvas-phase-deps"><b>Delivers</b>: ADR-{pid}-003 Keycloak SSO</div>
                </div>
                <div className="am-canvas-phase-card am-canvas-phase-card-sel">
                  <div className="am-canvas-phase-head">
                    <span className="am-canvas-phase-id">MIG-{pid}-002</span>
                    <span className="am-pill am-pill-mid"><span className="am-dot" />In flight</span>
                  </div>
                  <div className="am-canvas-phase-name">Case Hub live · dual-write</div>
                  <div className="am-canvas-phase-when">2026 Q2 — 2027 Q1 · 60% complete</div>
                  <div className="am-canvas-phase-deps"><b>Delivers</b>: CAP-{pid}-002, COMP-{pid}-002…008</div>
                </div>
                <div className="am-canvas-phase-card">
                  <div className="am-canvas-phase-head">
                    <span className="am-canvas-phase-id">MIG-{pid}-003</span>
                    <span className="am-pill am-pill-neu"><span className="am-dot" />Planned</span>
                  </div>
                  <div className="am-canvas-phase-name">Risk Score onboarding</div>
                  <div className="am-canvas-phase-when">2026 Q4 — 2027 Q2</div>
                  <div className="am-canvas-phase-deps"><b>Depends on</b>: MIG-{pid}-002</div>
                </div>
                <div className="am-canvas-phase-card">
                  <div className="am-canvas-phase-head">
                    <span className="am-canvas-phase-id">MIG-{pid}-004</span>
                    <span className="am-pill am-pill-neu"><span className="am-dot" />Planned</span>
                  </div>
                  <div className="am-canvas-phase-name">Legacy decommission</div>
                  <div className="am-canvas-phase-when">2027 Q1 — 2027 Q3</div>
                  <div className="am-canvas-phase-deps"><b>Depends on</b>: MIG-{pid}-002, MIG-{pid}-003</div>
                </div>
              </div>

              <div className="am-canvas-banner">
                Illustrative content — Migration Phases will be authored as real
                schema-validated elements once the architect data model lands.
              </div>
            </main>

            <aside className="am-canvas-details">
              <h3>Phase — Case Hub live · dual-write</h3>
              <div className="am-canvas-details-id">MIG-{pid}-002</div>

              <div className="am-canvas-details-block">
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Status</span>
                  <span><span className="am-pill am-pill-mid">In flight</span> · 60% complete</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Window</span>
                  <span>2026 Q2 → 2027 Q1</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Owner</span>
                  <span>{user.name} · Domain Architect</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Delivery team</span>
                  <span>case-ops squad · 6 FTE</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Budget</span>
                  <span>€420k build · €120k/yr run</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Delivers</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">CAP-{pid}-002 capture &amp; validation</span>
                  <span className="am-canvas-trace">CAP-{pid}-005 case lifecycle</span>
                  <span className="am-canvas-trace">COMP-{pid}-002 Case Service</span>
                  <span className="am-canvas-trace">COMP-{pid}-003 Workflow Engine</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Depends on</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">MIG-{pid}-001 Foundations &amp; SSO</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Blocks</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">MIG-{pid}-003 Risk Score onboarding</span>
                  <span className="am-canvas-trace">MIG-{pid}-004 Legacy decommission</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Risks</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace" style={{ color: "var(--mid)" }}>⚠ dual-write reconciliation drift</span>
                  <span className="am-canvas-trace" style={{ color: "var(--mid)" }}>⚠ Camunda licence renewal Q1</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Provenance</h4>
                <div className="am-canvas-details-prov">
                  <div><span className="am-canvas-verified">✓</span> Window — human-confirmed</div>
                  <div><span className="am-canvas-verified">✓</span> Delivers — linked to approved capabilities</div>
                  <div><span className="am-canvas-machine">▲</span> Risks — drafted by solution-architect agent · review</div>
                </div>
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}

function IntegrationRow({
  selected, from, to, id, sub, pattern, direction, volume, volSub, contract, status,
}: {
  selected?: boolean;
  from: string;
  to: string;
  id: string;
  sub: string;
  pattern: "sync" | "async" | "event" | "batch";
  direction: string;
  volume: string;
  volSub: string;
  contract: string;
  status: "Accepted" | "Proposed";
}) {
  return (
    <tr className={selected ? "am-canvas-app-sel" : undefined}>
      <td>
        <div className="am-int-arrow"><b>{from}</b><span className="am-int-arrow-arr">→</span><b>{to}</b></div>
        <div className="am-canvas-app-id">{id}</div>
        <div className="am-canvas-app-stack">{sub}</div>
      </td>
      <td><span className={`am-int-pattern am-int-pattern-${pattern}`}>{pattern.toUpperCase()}</span></td>
      <td><span className="am-int-direction">{direction}</span></td>
      <td>
        <div>{volume}</div>
        <div className="am-canvas-app-stack">{volSub}</div>
      </td>
      <td><span className="am-canvas-app-chip">{contract}</span></td>
      <td><span className={`am-pill am-pill-${status === "Accepted" ? "hi" : "mid"}`}><span className="am-dot" />{status}</span></td>
    </tr>
  );
}

function ComponentCard({
  selected, id, name, tech, sub, deps, status,
}: {
  selected?: boolean;
  id: string;
  name: string;
  tech: string;
  sub?: string;
  deps: string[];
  status: "Accepted" | "Proposed";
}) {
  return (
    <div className={`am-canvas-comp-card${selected ? " am-canvas-comp-card-sel" : ""}`}>
      <div className="am-canvas-comp-head">
        <span className="am-canvas-comp-id">{id}</span>
        <span className={`am-pill am-pill-${status === "Accepted" ? "hi" : "mid"}`}>
          <span className="am-dot" />
          {status}
        </span>
      </div>
      <div className="am-canvas-comp-name">{name}</div>
      <div className="am-canvas-comp-tech">
        <b>{tech}</b>{sub ? ` · ${sub}` : ""}
      </div>
      <div className="am-canvas-comp-deps">
        {deps.map((d, i) => (
          <span key={i} className="am-canvas-comp-dep">{d}</span>
        ))}
      </div>
    </div>
  );
}

function NfrRow({
  selected, id, cat, catLabel, name, sub, target, traces, status,
}: {
  selected?: boolean;
  id: string;
  cat: "perf" | "avail" | "sec" | "comp" | "scale";
  catLabel: string;
  name: string;
  sub: string;
  target: string;
  traces: string[];
  status: "Accepted" | "Proposed";
}) {
  return (
    <tr className={selected ? "am-canvas-app-sel" : undefined}>
      <td className="am-canvas-app-id" style={{ paddingTop: 14 }}>{id}</td>
      <td style={{ paddingTop: 12 }}><span className={`am-nfr-cat am-nfr-cat-${cat}`}>{catLabel}</span></td>
      <td>
        <div className="am-canvas-app-name">{name}</div>
        <div className="am-canvas-app-stack">{sub}</div>
      </td>
      <td style={{ paddingTop: 14 }}><span className="am-nfr-target">{target}</span></td>
      <td>
        <div className="am-canvas-app-chips">
          {traces.map((t, i) => <span key={i} className="am-canvas-app-chip">{t}</span>)}
        </div>
      </td>
      <td style={{ paddingTop: 12 }}><span className={`am-pill am-pill-${status === "Accepted" ? "hi" : "mid"}`}><span className="am-dot" />{status}</span></td>
    </tr>
  );
}

// Small inline card component to keep the capabilities-view JSX readable.
function CapCard({
  id, name, status, selected, critical, high, medium, reused, newCap, host,
  steps, adrs, nfrs, prov, provText,
}: {
  id: string;
  name: string;
  status: "Accepted" | "Proposed" | "Draft";
  selected?: boolean;
  critical?: boolean;
  high?: boolean;
  medium?: boolean;
  reused?: boolean;
  newCap?: boolean;
  host: string;
  steps: number;
  adrs: number;
  nfrs: number;
  prov: "verified" | "machine";
  provText?: string;
}) {
  const statusTone = status === "Accepted" ? "hi" : status === "Proposed" ? "mid" : "neu";
  return (
    <div className={`am-canvas-cap-card${selected ? " am-canvas-cap-card-sel" : ""}`}>
      <div className="am-canvas-cap-head">
        <span className="am-canvas-cap-id">{id}</span>
        <span className={`am-pill am-pill-${statusTone}`}>
          <span className="am-dot" />
          {status}
        </span>
      </div>
      <div className="am-canvas-cap-name">{name}</div>
      <div className="am-canvas-cap-meta">
        {critical && <span className="am-pill am-pill-neu">Critical</span>}
        {high && <span className="am-pill am-pill-mid">High</span>}
        {medium && <span className="am-pill am-pill-neu">Medium</span>}
        {reused && <span className="am-pill am-pill-bright">Reused</span>}
        {newCap && <span className="am-pill am-pill-acc">New</span>}
      </div>
      <div className="am-canvas-cap-host">
        hosted in: <b>{host}</b>
      </div>
      <div className="am-canvas-cap-traces">
        <span><b>{steps}</b> steps</span>
        <span><b>{adrs}</b> ADRs</span>
        <span><b>{nfrs}</b> NFRs</span>
      </div>
      <div className={`am-canvas-cap-prov am-canvas-cap-prov-${prov}`}>
        {prov === "verified" ? "✓" : "▲"} {provText ?? (prov === "verified" ? "human-confirmed" : "drafted")}
      </div>
    </div>
  );
}
