"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProcessDoc } from "@/lib/wiki";
import type { User } from "@/lib/user";
import Tooltip from "./Tooltip";
import Markdown from "./Markdown";
import AgentChat from "./AgentChat";
import { useAgentChat } from "./useAgentChat";
import { buildDiagramModel, buildTraceability } from "@/lib/architecture-view";

// Frame-03 of the ArchitectMiner mockup. Inputs from Processminer (left nav,
// top group) use REAL counts from the open process; the architect-side
// elements read from the same process JSON. The canvas chat is the live
// architect agent (R1) — domain-architect + solution-architect specialists
// author the target architecture into this process's JSON via the same
// schema-enforced write path as Processminer.

// The two architect-side specialists, and the friendly labels for the
// active-skill chip + completion notifications.
const AM_SKILL_LABELS: Record<string, string> = {
  "domain-architect": "Domain Architect",
  "solution-architect": "Solution Architect",
};

/** Trim a node label so it fits inside its diagram box. */
function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

/** Display label for a traceability row's element type. */
const TRACE_TYPE_LABEL: Record<string, string> = {
  capability: "Capability",
  "target-application": "Target App",
  adr: "ADR",
  "target-integration": "Integration",
  component: "Component",
  nfr: "NFR",
  "migration-phase": "Migration phase",
};

// Architect session scope — prepended to the first turn of a chat session,
// the analogue of Processminer's scopePreamble. Locks the headless `claude`
// CLI to this one process and frames it as the architecture author.
function archScopePreamble(d: ProcessDoc, user: User): string {
  const { id, title } = d.process;
  return [
    "[SESSION SCOPE — applies to this whole conversation]",
    `You are the Architecture Assistant for exactly one process: ${title} (${id}).`,
    "You author its TARGET ARCHITECTURE — capabilities, target applications,",
    "ADRs, target integrations, components, NFRs and migration phases —",
    "grounded in the upstream Processminer artifacts (target process,",
    "transformation decisions, requirements, gap resolution, dependencies,",
    "controls, regulation, as-is systems and integrations).",
    `Its wiki content is wiki/processes/${d.slug}/; its source documents`,
    `are under raw-sources/${d.slug}/.`,
    "",
    `The architect present in this session is ${user.name} (${user.role}). Use`,
    "that name verbatim wherever an approval or edit is stamped — never ask",
    "for their name.",
    "",
    "Rules, in force for every turn of this session:",
    `1. Only consider, discuss and change content belonging to ${id}.`,
    "2. Never read or modify another process under wiki/processes/ or",
    "   raw-sources/, and never change anything else in the repository.",
    "3. Author every element through the schema-enforced tools (createElement /",
    "   updateElement / expandElement) — never hand-edit the process JSON.",
    "4. If asked to do anything unrelated to architecting this process, decline:",
    "   briefly say you are scoped to this process's architecture, in the",
    "   language the architect is using.",
    "5. schema/, scripts/ and .claude/skills/ are shared framework the skills",
    "   need — reading and running those is allowed and expected.",
    "",
    "The architect's request follows below.",
    "",
    "---",
    "",
  ].join("\n");
}

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
  | "migration"
  | "inputs";

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
  // When view === "inputs", which upstream section is open. Elements in that
  // section render vertically as Processminer-style cards — no separate
  // "selected element" because every card is already expanded.
  const [inputSection, setInputSection] = useState<string>("to-be-design");
  const inputElements = useMemo(
    () => doc.elements.filter((el) => el.section === inputSection),
    [doc, inputSection],
  );
  const inputSectionLabel =
    UPSTREAM_SECTIONS.find((s) => s.id === inputSection)?.label ?? inputSection;

  const upstreamCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const el of doc.elements) counts[el.section] = (counts[el.section] ?? 0) + 1;
    return counts;
  }, [doc]);

  // Real architect-side data for the open process — read straight from
  // doc.elements via the 7 target-architecture section ids. Empty arrays
  // when nothing is authored yet for this process.
  const archData = useMemo(() => {
    const caps = doc.elements.filter((el) => el.section === "capabilities");
    const apps = doc.elements.filter((el) => el.section === "target-applications");
    const adrsReal = doc.elements.filter((el) => el.section === "architecture-decisions");
    const integrations = doc.elements.filter((el) => el.section === "target-integrations");
    const components = doc.elements.filter((el) => el.section === "components");
    const nfrsReal = doc.elements.filter((el) => el.section === "nfrs");
    const migrations = doc.elements.filter((el) => el.section === "migration-phases");
    const upperEq = (v: unknown, target: string) =>
      typeof v === "string" && v.toUpperCase() === target;
    return {
      caps,
      apps,
      adrsReal,
      integrations,
      components,
      nfrsReal,
      migrations,
      critN: caps.filter((c) => upperEq(c.meta.criticality, "CRITICAL")).length,
      highN: caps.filter((c) => upperEq(c.meta.criticality, "HIGH")).length,
      reusedN: caps.filter((c) => upperEq(c.meta.reuse, "REUSED")).length,
      newN: caps.filter((c) => upperEq(c.meta.reuse, "NEW")).length,
      confirmedN: caps.filter((c) => c.status === "confirmed").length,
      draftN: caps.filter((c) => c.status === "draft").length,
      buildN: apps.filter((a) => upperEq(a.meta.verdict, "BUILD")).length,
      buyN: apps.filter((a) => upperEq(a.meta.verdict, "BUY")).length,
      configureN: apps.filter((a) => upperEq(a.meta.verdict, "CONFIGURE")).length,
      keepN: apps.filter((a) => upperEq(a.meta.verdict, "KEEP")).length,
      adrAccepted: adrsReal.filter((a) => upperEq(a.meta.adrStatus, "ACCEPTED")).length,
      adrProposed: adrsReal.filter((a) => upperEq(a.meta.adrStatus, "PROPOSED")).length,
      adrDraft: adrsReal.filter((a) => upperEq(a.meta.adrStatus, "DRAFT")).length,
    };
  }, [doc]);

  // R3 — the Diagram and Traceability views are derived from the authored
  // architecture elements (and their relations), not hardcoded. Both read empty
  // until the architect authors capabilities / apps / integrations via the
  // domain- and solution-architect specialists.
  const diagram = useMemo(
    () => buildDiagramModel(archData.caps, archData.apps, archData.integrations),
    [archData],
  );
  const trace = useMemo(
    () =>
      buildTraceability({
        capabilities: archData.caps,
        applications: archData.apps,
        adrs: archData.adrsReal,
        integrations: archData.integrations,
        components: archData.components,
        nfrs: archData.nfrsReal,
        migrations: archData.migrations,
      }),
    [archData],
  );

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

  // The architect canvas reuses Processminer's AgentChat component and the
  // shared useAgentChat pipeline (R1) — same SSE driver, watchdog, ETA and
  // persistence as the SME canvas, scoped to the architect role via its own
  // sessionStorage namespace ("am") and scope preamble.
  const router = useRouter();
  const archPreamble = useMemo(() => archScopePreamble(doc, user), [doc, user]);
  const chat = useAgentChat({
    storePrefix: "am",
    slug: doc.slug,
    streamReplies: user.streamReplies === true,
    skillLabels: AM_SKILL_LABELS,
    scopePreamble: archPreamble,
    // A turn may have authored architecture elements — re-read the doc.
    onTurnDone: () => router.refresh(),
  });

  // Resolve element-id references in chat replies to their page for hovercards.
  const getRef = useCallback(
    (id: string) => {
      const page =
        doc.elements.find((e) => e.id === id) ??
        (id === doc.process.id ? doc.process : undefined);
      return page ? { page, typeLabel: page.type } : undefined;
    },
    [doc],
  );

  // Add / Elicit buttons across the views seed a scoped turn with the right
  // specialist. "Add" drafts a single element; "Elicit" works the whole
  // section against the upstream artifacts.
  const elicit = useCallback(
    (skill: "domain-architect" | "solution-architect", prompt: string) => {
      chat.send(prompt, { skill });
    },
    [chat],
  );

  const chatSidebar = (
    <div className="am-canvas-chat">
      <AgentChat
        open={true}
        onToggle={() => {}}
        onWidthChange={() => {}}
        messages={chat.messages}
        onSend={chat.send}
        pending={chat.pending}
        activity={chat.activity}
        tasks={chat.tasks}
        activeSkillLabel={
          chat.activeSkill ? (AM_SKILL_LABELS[chat.activeSkill] ?? null) : null
        }
        activeSkillEta={chat.activeSkillEta}
        onRestart={chat.restart}
        onRunLint={() =>
          chat.send(
            "Cross-check the architecture traces across all views for this process: every ADR, capability, application, integration, component, NFR and migration phase. Flag anything orphaned, partially traced, or inconsistent with the upstream Processminer artifacts, and list the gaps.",
          )
        }
        linting={chat.pending}
        findingCount={null}
        getRef={getRef}
        onStop={chat.stop}
        title="ArchitectMiner"
        subtitle="Authors the architecture with you"
        placeholder="Message the architect…"
        lintLabel="⊛ Cross-check traces across all views"
        emptyText={
          <>
            Ask the architect agent about <b>{doc.process.title}</b>. I can
            summarise across views, flag inconsistencies with upstream
            Processminer artifacts, or draft starting points for new ADRs,
            capabilities, applications, NFRs, or migration phases.
          </>
        }
      />
    </div>
  );

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
          {view === "inputs" && (
            <>
              <span className="am-input-ro">FROM PROCESSMINER</span>
              <span style={{ margin: "0 8px", opacity: 0.6 }}>·</span>
              <b>{inputSectionLabel}</b>
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
          {UPSTREAM_SECTIONS.map((s) => {
            const active = view === "inputs" && inputSection === s.id;
            return (
              <div
                key={s.id}
                className={`am-canvas-secrow${active ? " am-canvas-secrow-on" : ""}`}
                onClick={() => {
                  setView("inputs");
                  setInputSection(s.id);
                }}
              >
                <span>{s.label}</span>
                <span className="am-canvas-n">{upstreamCounts[s.id] ?? 0}</span>
              </div>
            );
          })}

          <h4 className="am-canvas-grouph">Domain Architecture</h4>
          <div
            className={`am-canvas-secrow${view === "capabilities" ? " am-canvas-secrow-on" : ""}`}
            onClick={() => setView("capabilities")}
          >
            <span>Capabilities</span>
            <span className="am-canvas-n">{archData.caps.length}</span>
          </div>
          <div
            className={`am-canvas-secrow${view === "applications" ? " am-canvas-secrow-on" : ""}`}
            onClick={() => setView("applications")}
          >
            <span>Target Applications</span>
            <span className="am-canvas-n">{archData.apps.length}</span>
          </div>
          <div
            className={`am-canvas-secrow${view === "adrs" ? " am-canvas-secrow-on" : ""}`}
            onClick={() => setView("adrs")}
          >
            <span>Architecture Decisions</span>
            <span className="am-canvas-n">{archData.adrsReal.length}</span>
          </div>

          <h4 className="am-canvas-grouph">Solution Architecture</h4>
          <div
            className={`am-canvas-secrow${view === "integrations" ? " am-canvas-secrow-on" : ""}`}
            onClick={() => setView("integrations")}
          >
            <span>Target Integrations</span>
            <span className="am-canvas-n">{archData.integrations.length}</span>
          </div>
          <div
            className={`am-canvas-secrow${view === "components" ? " am-canvas-secrow-on" : ""}`}
            onClick={() => setView("components")}
          >
            <span>Components</span>
            <span className="am-canvas-n">{archData.components.length}</span>
          </div>
          <div
            className={`am-canvas-secrow${view === "nfrs" ? " am-canvas-secrow-on" : ""}`}
            onClick={() => setView("nfrs")}
          >
            <span>NFRs</span>
            <span className="am-canvas-n">{archData.nfrsReal.length}</span>
          </div>
          <div
            className={`am-canvas-secrow${view === "migration" ? " am-canvas-secrow-on" : ""}`}
            onClick={() => setView("migration")}
          >
            <span>Migration Phases</span>
            <span className="am-canvas-n">{archData.migrations.length}</span>
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
            <span className="am-canvas-n">{trace.total === 0 ? "—" : `${trace.tracedPct}%`}</span>
          </div>
          <div className="am-canvas-secrow am-canvas-secrow-locked">
            <span>Comments</span>
            <span className="am-canvas-n">—</span>
          </div>
        </aside>

        {view === "adrs" && (
          <>
        <main className="am-canvas-doc am-canvas-doc-wide">
          <div className="am-canvas-sechead">
            <h2>Architecture Decisions</h2>
            <span className="am-canvas-secmeta">
              12 elements · 2 accepted · 2 proposed · 1 draft
            </span>
            <span style={{ flex: 1 }} />
            <button
              type="button"
              className="am-canvas-btn"
              onClick={() =>
                elicit(
                  "domain-architect",
                  "Let's add a single Architecture Decision Record (ADR) for this process. Ask me the decision to capture, then draft it with context, the decision, the alternatives considered and the consequences.",
                )
              }
            >
              ＋ Add ADR
            </button>
            <button
              type="button"
              className="am-canvas-btn am-canvas-btn-primary"
              onClick={() =>
                elicit(
                  "domain-architect",
                  "Let's work the ADRs for this architecture together: review what exists, surface the decisions implied by the target process and transformation decisions that aren't yet recorded, and elicit them with me one at a time.",
                )
              }
            >
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
        {chatSidebar}
          </>
        )}

        {view === "diagram" && (
          <>
            <main className="am-canvas-diagram-main">
              <div className="am-canvas-diagram-toolbar">
                <h2>Target architecture</h2>
                <span className="am-canvas-secmeta">
                  derived from {archData.caps.length} capabilit
                  {archData.caps.length === 1 ? "y" : "ies"} ·{" "}
                  {archData.apps.length} application
                  {archData.apps.length === 1 ? "" : "s"} ·{" "}
                  {archData.integrations.length} integration
                  {archData.integrations.length === 1 ? "" : "s"}
                </span>
                <span style={{ flex: 1 }} />
                <div className="am-canvas-legend">
                  <span><i className="am-canvas-legend-sync" />hosted in</span>
                  <span><i className="am-canvas-legend-async" />integration</span>
                </div>
              </div>

              {diagram.isEmpty ? (
                <div className="am-canvas-banner">
                  No target architecture yet for <b>{doc.process.title}</b>. Author
                  capabilities and target applications with the domain architect,
                  and integrations with the solution architect — the diagram draws
                  itself from their <code>hostedIn</code> and integration relations.
                </div>
              ) : (
                <svg
                  viewBox={`0 0 ${diagram.width} ${diagram.height}`}
                  className="am-canvas-diagram-svg"
                >
                  <text className="am-svg-swim" x="16" y="28">
                    Business capabilities
                  </text>
                  <text
                    className="am-svg-swim"
                    x="16"
                    y={(diagram.appNodes[0]?.y ?? 350) - 16}
                  >
                    Target applications
                  </text>

                  {/* hostedIn edges (capability → application) */}
                  {diagram.hostEdges.map((e, i) => (
                    <path
                      key={`h${i}`}
                      className="am-svg-edge-sync"
                      d={`M${e.x1} ${e.y1} L ${e.x2} ${e.y2}`}
                    />
                  ))}
                  {/* integration edges (application → application) */}
                  {diagram.intEdges.map((e, i) => (
                    <path
                      key={`i${i}`}
                      className={
                        e.kind === "async" || e.kind === "batch"
                          ? "am-svg-edge-async"
                          : e.kind === "event"
                            ? "am-svg-edge-event"
                            : "am-svg-edge-sync"
                      }
                      d={`M${e.x1} ${e.y1} C ${e.x1} ${e.y1 + 40}, ${e.x2} ${e.y2 + 40}, ${e.x2} ${e.y2}`}
                    />
                  ))}

                  {/* capability nodes */}
                  {diagram.capNodes.map((n) => (
                    <g key={n.id}>
                      <rect className="am-svg-cap" x={n.x} y={n.y} width={n.w} height={n.h} rx="6" />
                      <text className="am-svg-lbl" x={n.x + 14} y={n.y + 22}>{n.id}</text>
                      <text className="am-svg-lbl am-svg-lbl-strong" x={n.x + 14} y={n.y + 40}>{truncate(n.title, 22)}</text>
                      {n.sub && <text className="am-svg-sub" x={n.x + 14} y={n.y + 56}>{n.sub}</text>}
                    </g>
                  ))}
                  {/* application nodes */}
                  {diagram.appNodes.map((n) => (
                    <g key={n.id}>
                      <rect className="am-svg-app" x={n.x} y={n.y} width={n.w} height={n.h} rx="6" />
                      <text className="am-svg-lbl am-svg-lbl-strong" x={n.x + 14} y={n.y + 26}>{truncate(n.title, 22)}</text>
                      {n.sub && <text className="am-svg-sub" x={n.x + 14} y={n.y + 46}>{n.sub}</text>}
                    </g>
                  ))}
                </svg>
              )}
            </main>

            <aside className="am-canvas-details">
              <h3>Architecture summary</h3>
              <div className="am-canvas-details-id">{doc.process.title}</div>

              <div className="am-canvas-details-block">
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Capabilities</span>
                  <span>{archData.caps.length}</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Target applications</span>
                  <span>{archData.apps.length}</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Integrations</span>
                  <span>{archData.integrations.length}</span>
                </div>
                <div className="am-canvas-details-row">
                  <span className="am-canvas-details-k">Hosted edges drawn</span>
                  <span>{diagram.hostEdges.length}</span>
                </div>
              </div>

              <div className="am-canvas-details-block">
                <h4>Traceability</h4>
                <div className="am-canvas-traces">
                  <span className="am-canvas-trace">
                    <span className="am-canvas-trace-lbl">traced</span>{trace.traced}
                  </span>
                  <span className="am-canvas-trace">
                    <span className="am-canvas-trace-lbl">partial</span>{trace.partial}
                  </span>
                  <span className="am-canvas-trace">
                    <span className="am-canvas-trace-lbl">orphan</span>{trace.orphan}
                  </span>
                </div>
              </div>
            </aside>
            {chatSidebar}
          </>
        )}

        {view === "traceability" && (
          <>
          <main className="am-canvas-trace-main">
            <div className="am-canvas-trace-head">
              <h2>Traceability — {doc.process.title}</h2>
              <span className="am-canvas-secmeta">
                derived from {trace.total} architecture element
                {trace.total === 1 ? "" : "s"}
              </span>
            </div>

            <div className="am-canvas-stats">
              <div className="am-canvas-stat">
                <div className="am-canvas-stat-v">{trace.total}</div>
                <div className="am-canvas-stat-l">architecture elements</div>
              </div>
              <div className="am-canvas-stat">
                <div className="am-canvas-stat-v am-canvas-stat-ok">
                  {trace.total === 0 ? "—" : `${trace.tracedPct}%`}
                </div>
                <div className="am-canvas-stat-l">fully traced</div>
              </div>
              <div className="am-canvas-stat">
                <div className="am-canvas-stat-v am-canvas-stat-warn">{trace.partial}</div>
                <div className="am-canvas-stat-l">partial traces</div>
              </div>
              <div className="am-canvas-stat">
                <div className="am-canvas-stat-v am-canvas-stat-bad">{trace.orphan}</div>
                <div className="am-canvas-stat-l">orphans</div>
              </div>
            </div>

            {trace.total === 0 ? (
              <div className="am-canvas-banner">
                No architecture elements to trace yet for <b>{doc.process.title}</b>.
                As the domain and solution architects author capabilities,
                applications, ADRs, integrations, components, NFRs and migration
                phases, each is checked here for whether its relations connect it to
                the rest of the architecture.
              </div>
            ) : (
              <table className="am-canvas-trace-table">
                <thead>
                  <tr>
                    <th style={{ width: 120 }}>ID</th>
                    <th>Element</th>
                    <th style={{ width: 150 }}>Type</th>
                    <th>Trace check</th>
                    <th style={{ width: 90, textAlign: "right" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trace.rows.map((r) => (
                    <tr
                      key={r.id}
                      className={
                        r.status === "partial"
                          ? "am-canvas-trace-row-partial"
                          : r.status === "orphan"
                            ? "am-canvas-trace-row-orphan"
                            : undefined
                      }
                    >
                      <td className="am-canvas-trace-id">{r.id}</td>
                      <td className="am-canvas-trace-title">{r.title}</td>
                      <td className="am-canvas-trace-type">
                        {TRACE_TYPE_LABEL[r.type] ?? r.type}
                      </td>
                      <td>
                        <span
                          className={
                            r.status === "orphan"
                              ? "am-canvas-trace am-canvas-trace-bad"
                              : r.status === "partial"
                                ? "am-canvas-trace am-canvas-trace-warn"
                                : "am-canvas-trace"
                          }
                        >
                          {r.reason}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span
                          className={
                            r.status === "traced"
                              ? "am-pill am-pill-hi"
                              : r.status === "partial"
                                ? "am-pill am-pill-mid"
                                : "am-pill am-pill-lo"
                          }
                        >
                          {r.status === "traced"
                            ? "OK"
                            : r.status === "partial"
                              ? "Partial"
                              : "Orphan"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </main>
          {chatSidebar}
          </>
        )}

        {view === "capabilities" && (
          <>
            <main className="am-canvas-doc">
              <div className="am-canvas-sechead">
                <h2>Capabilities</h2>
                <span className="am-canvas-secmeta">
                  {archData.caps.length} element{archData.caps.length === 1 ? "" : "s"} ·{" "}
                  {archData.confirmedN} confirmed · {archData.draftN} draft
                </span>
                <span style={{ flex: 1 }} />
                <button
                  type="button"
                  className="am-canvas-btn"
                  onClick={() =>
                    elicit(
                      "domain-architect",
                      "Let's add a single business capability to the target architecture for this process. Ask me what it is and draft it.",
                    )
                  }
                >
                  ＋ Add Capability
                </button>
                <button
                  type="button"
                  className="am-canvas-btn am-canvas-btn-primary"
                  onClick={() =>
                    elicit(
                      "domain-architect",
                      "Let's work the capability map for this architecture: derive the capabilities the target process needs, check them against the requirements and gap resolution, and elicit what's missing with me.",
                    )
                  }
                >
                  ／ Elicit with domain architect
                </button>
              </div>

              <div className="am-canvas-cap-filterbar">
                <span className="am-pill am-pill-acc">All ({archData.caps.length})</span>
                <span className="am-pill am-pill-neu">Critical ({archData.critN})</span>
                <span className="am-pill am-pill-neu">Reused ({archData.reusedN})</span>
                <span className="am-pill am-pill-neu">New ({archData.newN})</span>
              </div>

              {archData.caps.length === 0 ? (
                <div className="am-input-empty">
                  No capabilities authored yet for <b>{doc.process.title}</b>.
                  Use the chat to elicit them with the domain architect, or
                  hand-author element files under{" "}
                  <code>wiki/processes/{doc.slug}/capabilities/</code>.
                </div>
              ) : (
                <div className="am-canvas-cap-grid">
                  {archData.caps.map((cap, i) => {
                    const crit = ((cap.meta.criticality as string) ?? "").toUpperCase();
                    const reuse = ((cap.meta.reuse as string) ?? "").toUpperCase();
                    const hostedRaw = Array.isArray(cap.meta.hostedIn)
                      ? cap.meta.hostedIn[0]
                      : (cap.meta.hostedIn as string | undefined);
                    const hostedApp = hostedRaw
                      ? archData.apps.find((a) => a.id === hostedRaw)
                      : undefined;
                    const hostName = hostedApp?.title ?? hostedRaw ?? "—";
                    const verdict = hostedApp?.meta.verdict as string | undefined;
                    const hostLabel = verdict ? `${hostName} (${verdict})` : hostName;
                    const status =
                      cap.status === "confirmed" ? "Accepted"
                      : cap.status === "draft" ? "Proposed"
                      : "Draft";
                    const adrsForCap = archData.adrsReal.filter((a) => {
                      const r = a.meta.realisesCapability ?? a.meta.realises;
                      const list = Array.isArray(r) ? r : r ? [r as string] : [];
                      return list.includes(cap.id);
                    }).length;
                    return (
                      <CapCard
                        key={cap.id}
                        id={cap.id}
                        name={cap.title}
                        status={status as "Accepted" | "Proposed" | "Draft"}
                        critical={crit === "CRITICAL"}
                        high={crit === "HIGH"}
                        medium={crit === "MEDIUM"}
                        reused={reuse === "REUSED"}
                        newCap={reuse === "NEW"}
                        host={hostLabel}
                        steps={0}
                        adrs={adrsForCap}
                        nfrs={0}
                        prov={cap.confidence === "high" ? "verified" : "machine"}
                        provText={
                          cap.confidence === "high"
                            ? "human-confirmed"
                            : "draft · awaiting confirmation"
                        }
                        selected={i === 0}
                      />
                    );
                  })}
                </div>
              )}

              <div
                className="am-canvas-banner"
                style={{
                  background: "var(--hi-bg)",
                  color: "var(--hi)",
                  borderColor: "#c7dccf",
                }}
              >
                Real data — these capabilities are file-backed under{" "}
                <code>wiki/processes/{doc.slug}/capabilities/</code> and read
                live through the same path as Processminer elements.
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
            {chatSidebar}
          </>
        )}

        {view === "applications" && (
          <>
            <main className="am-canvas-doc">
              <div className="am-canvas-sechead">
                <h2>Target Applications</h2>
                <span className="am-canvas-secmeta">
                  {archData.apps.length} element{archData.apps.length === 1 ? "" : "s"} ·{" "}
                  {archData.buildN} BUILD · {archData.buyN} BUY ·{" "}
                  {archData.configureN} CONFIGURE · {archData.keepN} KEEP
                </span>
                <span style={{ flex: 1 }} />
                <button
                  type="button"
                  className="am-canvas-btn"
                  onClick={() =>
                    elicit(
                      "domain-architect",
                      "Let's add a single target application to the architecture. Ask me about it and draft it, including the build / buy / configure / keep verdict and its rationale.",
                    )
                  }
                >
                  ＋ Add Application
                </button>
                <button
                  type="button"
                  className="am-canvas-btn am-canvas-btn-primary"
                  onClick={() =>
                    elicit(
                      "domain-architect",
                      "Let's work the target application landscape: map the applications that realise the capabilities, decide build / buy / configure / keep for each, and elicit what's missing with me.",
                    )
                  }
                >
                  ／ Elicit with domain architect
                </button>
              </div>

              <div className="am-canvas-cap-filterbar">
                <span className="am-pill am-pill-acc">All ({archData.apps.length})</span>
                <span className="am-pill am-pill-neu">BUILD ({archData.buildN})</span>
                <span className="am-pill am-pill-neu">BUY ({archData.buyN})</span>
                <span className="am-pill am-pill-neu">CONFIGURE ({archData.configureN})</span>
                <span className="am-pill am-pill-neu">KEEP ({archData.keepN})</span>
              </div>

              {archData.apps.length === 0 ? (
                <div className="am-input-empty">
                  No target applications authored yet for <b>{doc.process.title}</b>.
                  Use the chat to elicit them, or hand-author element files under{" "}
                  <code>wiki/processes/{doc.slug}/target-applications/</code>.
                </div>
              ) : (
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
                  {archData.apps.map((app, idx) => {
                    const verdict = ((app.meta.verdict as string) ?? "").toLowerCase();
                    const hostedCaps = archData.caps.filter((c) => {
                      const h = Array.isArray(c.meta.hostedIn) ? c.meta.hostedIn[0] : c.meta.hostedIn;
                      return h === app.id;
                    });
                    return (
                      <tr key={app.id} className={idx === 0 ? "am-canvas-app-sel" : undefined}>
                        <td>
                          <div className="am-canvas-app-name">{app.title}</div>
                          <div className="am-canvas-app-id">{app.id}</div>
                          <div className="am-canvas-app-stack">
                            {(app.meta.owningDomain as string) ?? ""}
                          </div>
                        </td>
                        <td>
                          {verdict ? (
                            <span className={`am-verdict am-verdict-${verdict}`}>
                              {verdict.toUpperCase()}
                            </span>
                          ) : (
                            <span className="am-pill am-pill-neu">—</span>
                          )}
                        </td>
                        <td>
                          <div className="am-canvas-app-chips">
                            {hostedCaps.length === 0 ? (
                              <span className="am-canvas-app-stack">none yet</span>
                            ) : (
                              hostedCaps.map((c) => (
                                <span key={c.id} className="am-canvas-app-chip">
                                  {c.id} {c.title.split(" ")[0].toLowerCase()}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td>
                          <div>{(app.meta.vendor as string) ?? "—"}</div>
                          {app.meta.costBand && (
                            <div className="am-canvas-app-stack">
                              {app.meta.costBand as string}
                            </div>
                          )}
                        </td>
                        <td>
                          <span
                            className={`am-pill am-pill-${
                              app.status === "confirmed" ? "hi" : "mid"
                            }`}
                          >
                            <span className="am-dot" />
                            {app.status === "confirmed" ? "Accepted" : "Proposed"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              )}

              <div className="am-canvas-banner" style={{ background: "var(--hi-bg)", color: "var(--hi)", borderColor: "#c7dccf" }}>
                Real data — file-backed under{" "}
                <code>wiki/processes/{doc.slug}/target-applications/</code>.
              </div>
            </main>

            <aside className="am-canvas-details">
              {archData.apps.length === 0 ? (
                <div className="am-input-empty" style={{ marginTop: 0 }}>
                  No application selected — author one to see its details here.
                </div>
              ) : (
                <>
                  <h3>Application — {archData.apps[0].title}</h3>
                  <div className="am-canvas-details-id">{archData.apps[0].id}</div>

                  <div className="am-canvas-details-block">
                    <div className="am-canvas-details-row">
                      <span className="am-canvas-details-k">Verdict</span>
                      <span>
                        {archData.apps[0].meta.verdict ? (
                          <span className={`am-verdict am-verdict-${((archData.apps[0].meta.verdict as string) ?? "").toLowerCase()}`}>
                            {(archData.apps[0].meta.verdict as string) ?? "—"}
                          </span>
                        ) : "—"}
                      </span>
                    </div>
                    {archData.apps[0].meta.owningDomain && (
                      <div className="am-canvas-details-row">
                        <span className="am-canvas-details-k">Owning domain</span>
                        <span>{archData.apps[0].meta.owningDomain as string}</span>
                      </div>
                    )}
                    {archData.apps[0].meta.vendor && (
                      <div className="am-canvas-details-row">
                        <span className="am-canvas-details-k">Vendor / tech</span>
                        <span>{archData.apps[0].meta.vendor as string}</span>
                      </div>
                    )}
                    {archData.apps[0].meta.costBand && (
                      <div className="am-canvas-details-row">
                        <span className="am-canvas-details-k">Cost band</span>
                        <span>{archData.apps[0].meta.costBand as string}</span>
                      </div>
                    )}
                    <div className="am-canvas-details-row">
                      <span className="am-canvas-details-k">Status</span>
                      <span>
                        <span className={`am-pill am-pill-${archData.apps[0].status === "confirmed" ? "hi" : "mid"}`}>
                          {archData.apps[0].status === "confirmed" ? "Accepted" : "Draft"}
                        </span>
                      </span>
                    </div>
                  </div>

                  {archData.apps[0].blocks.length > 0 && archData.apps[0].blocks.map((b) => (
                    <div className="am-input-block" key={b.heading}>
                      <h4>{b.heading}</h4>
                      <div className="am-input-prose"><Markdown text={b.text} /></div>
                    </div>
                  ))}
                </>
              )}
            </aside>
            {chatSidebar}
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
                <button
                  type="button"
                  className="am-canvas-btn"
                  onClick={() =>
                    elicit(
                      "solution-architect",
                      "Let's add a single target integration between two applications. Ask me the endpoints, the data and the pattern, then draft it.",
                    )
                  }
                >
                  ＋ Add Integration
                </button>
                <button
                  type="button"
                  className="am-canvas-btn am-canvas-btn-primary"
                  onClick={() =>
                    elicit(
                      "solution-architect",
                      "Let's work the integration architecture: derive the interfaces between target applications that the target process needs, and elicit what's missing with me.",
                    )
                  }
                >
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
            {chatSidebar}
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
                <button
                  type="button"
                  className="am-canvas-btn"
                  onClick={() =>
                    elicit(
                      "solution-architect",
                      "Let's add a single component of a target application (a service, gateway, worker or store). Ask me about it and draft it.",
                    )
                  }
                >
                  ＋ Add Component
                </button>
                <button
                  type="button"
                  className="am-canvas-btn am-canvas-btn-primary"
                  onClick={() =>
                    elicit(
                      "solution-architect",
                      "Let's work the component breakdown for the target applications: decompose each into its components and elicit what's missing with me.",
                    )
                  }
                >
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
            {chatSidebar}
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
                <button
                  type="button"
                  className="am-canvas-btn"
                  onClick={() =>
                    elicit(
                      "solution-architect",
                      "Let's add a single non-functional requirement. Ask me the category and the target, then draft it with its traces.",
                    )
                  }
                >
                  ＋ Add NFR
                </button>
                <button
                  type="button"
                  className="am-canvas-btn am-canvas-btn-primary"
                  onClick={() =>
                    elicit(
                      "solution-architect",
                      "Let's work the NFRs for this architecture: derive them from the requirements, controls and regulation, set measurable targets, and elicit what's missing with me.",
                    )
                  }
                >
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
            {chatSidebar}
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
                <button
                  type="button"
                  className="am-canvas-btn"
                  onClick={() =>
                    elicit(
                      "solution-architect",
                      "Let's add a single migration phase. Ask me its scope and sequencing, then draft it.",
                    )
                  }
                >
                  ＋ Add Phase
                </button>
                <button
                  type="button"
                  className="am-canvas-btn am-canvas-btn-primary"
                  onClick={() =>
                    elicit(
                      "solution-architect",
                      "Let's work the migration plan: sequence the move from the as-is systems to the target architecture into phases with clear entry and exit criteria, and elicit what's missing with me.",
                    )
                  }
                >
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
            {chatSidebar}
          </>
        )}

        {view === "inputs" && (
          <>
            <main className="am-canvas-doc am-canvas-doc-wide">
              <div className="am-canvas-sechead">
                <h2>{inputSectionLabel}</h2>
                <span className="am-canvas-secmeta">
                  {inputElements.length} elements ·{" "}
                  {inputElements.filter((el) => el.status === "confirmed").length} confirmed ·
                  read-only · sourced from Processminer
                </span>
                <span style={{ flex: 1 }} />
                <span className="am-input-ro">FROM PROCESSMINER</span>
              </div>

              {inputElements.length === 0 ? (
                <div className="am-input-empty">
                  No elements in this section yet — author them in Processminer first.
                </div>
              ) : (
                <div className="am-input-stack">
                  {inputElements.map((el) => (
                    <article
                      key={el.id}
                      className={`el${el.status === "draft" ? " draft" : ""}`}
                      id={el.id}
                    >
                      <div className="el-top">
                        <span className="el-id">{el.id}</span>
                        {el.confidence && (
                          <Tooltip label={`${el.confidence} confidence`}>
                            <span className={`el-conf-dot conf-${el.confidence}`} />
                          </Tooltip>
                        )}
                        <label
                          className={`approval approval-${
                            el.status === "confirmed" ? "approved" : "none"
                          }`}
                          style={{ pointerEvents: "none" }}
                          title="Read-only — authored in Processminer"
                        >
                          <span className="statusctl-dot" aria-hidden="true" />
                          <span className="statusctl-label">
                            {el.status === "confirmed" ? "Confirmed" : "Draft"}
                          </span>
                        </label>
                        <span className="el-id" style={{ marginLeft: "auto" }}>
                          {el.type}
                        </span>
                      </div>
                      <div className="el-title">{el.title}</div>

                      {el.blocks.length > 0 ? (
                        <div className="el-blocks">
                          {el.blocks.map((b) => (
                            <div className="el-block" key={b.heading}>
                              <div className="el-block-head">
                                <span className="el-block-head-name">{b.heading}</span>
                              </div>
                              <div className="el-block-text">
                                <Markdown text={b.text} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        el.body && (
                          <div className="el-body">
                            <Markdown text={el.body} />
                          </div>
                        )
                      )}
                    </article>
                  ))}
                </div>
              )}
            </main>
            {chatSidebar}
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
