"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProcessDoc, WikiPage } from "@/lib/wiki";
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

// The scalar frontmatter fields worth surfacing as pills on an architecture
// element card, in display order. Relations (id-list fields) are omitted — the
// blocks already carry the narrative.
const ARCH_FIELD_PILLS: { key: string; label: string }[] = [
  { key: "criticality", label: "Criticality" },
  { key: "reuse", label: "Reuse" },
  { key: "owningDomain", label: "Domain" },
  { key: "verdict", label: "Verdict" },
  { key: "vendor", label: "Vendor" },
  { key: "costBand", label: "Cost" },
  { key: "adrStatus", label: "Status" },
  { key: "owner", label: "Owner" },
  { key: "domain", label: "Domain" },
  { key: "category", label: "Category" },
  { key: "target", label: "Target" },
  { key: "pattern", label: "Pattern" },
  { key: "direction", label: "Direction" },
  { key: "contract", label: "Contract" },
  { key: "volume", label: "Volume" },
  { key: "tech", label: "Tech" },
  { key: "dataStore", label: "Store" },
  { key: "hosting", label: "Hosting" },
  { key: "phaseStatus", label: "Phase" },
  { key: "startQuarter", label: "Start" },
  { key: "endQuarter", label: "End" },
];

// One authored architecture element, rendered as a Processminer-style card —
// id, status, type, the key frontmatter as pills, then the template blocks.
// Read-only here: the architect approves on the element's card in the app.
function ArchElementCard({ el }: { el: WikiPage }) {
  const pills = ARCH_FIELD_PILLS.map((f) => {
    const v = el.meta?.[f.key];
    return typeof v === "string" && v ? ([f.label, v] as [string, string]) : null;
  }).filter(Boolean) as [string, string][];
  return (
    <article className={`el${el.status === "draft" ? " draft" : ""}`} id={el.id}>
      <div className="el-top">
        <span className="el-id">{el.id}</span>
        <label
          className={`approval approval-${el.status === "confirmed" ? "approved" : "none"}`}
          style={{ pointerEvents: "none" }}
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
      {pills.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "6px 0 2px" }}>
          {pills.map(([k, v]) => (
            <span key={k} className="am-pill am-pill-neu">
              {k}: {v}
            </span>
          ))}
        </div>
      )}
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
  );
}

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

  const initials = user.name
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

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

  // The seven architecture section views all render the same shape: a header
  // with the real element count + Add / Elicit, then the authored elements as
  // cards (or an empty state). Replaces seven bespoke mock blocks.
  function archSectionMain(opts: {
    label: string;
    elements: WikiPage[];
    addLabel: string;
    skill: "domain-architect" | "solution-architect";
    addPrompt: string;
    elicitPrompt: string;
  }) {
    const { label, elements, addLabel, skill, addPrompt, elicitPrompt } = opts;
    return (
      <main className="am-canvas-doc am-canvas-doc-wide">
        <div className="am-canvas-sechead">
          <h2>{label}</h2>
          <span className="am-canvas-secmeta">
            {elements.length} element{elements.length === 1 ? "" : "s"} · authored here
          </span>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            className="am-canvas-btn"
            onClick={() => elicit(skill, addPrompt)}
          >
            ＋ Add {addLabel}
          </button>
          <button
            type="button"
            className="am-canvas-btn am-canvas-btn-primary"
            onClick={() => elicit(skill, elicitPrompt)}
          >
            ／ Elicit
          </button>
        </div>
        {elements.length === 0 ? (
          <div className="am-input-empty">
            No {label.toLowerCase()} authored yet — use <b>Add</b> or <b>Elicit</b>{" "}
            to create them with the architect. They write into this process&rsquo;s
            JSON through the same schema-enforced path as Processminer.
          </div>
        ) : (
          <div className="am-input-stack">
            {elements.map((el) => (
              <ArchElementCard key={el.id} el={el} />
            ))}
          </div>
        )}
      </main>
    );
  }

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
          {view === "adrs" && <b>Architecture Decisions</b>}
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
          {view === "capabilities" && <b>Capabilities</b>}
          {view === "applications" && <b>Target Applications</b>}
          {view === "integrations" && <b>Target Integrations</b>}
          {view === "components" && <b>Components</b>}
          {view === "nfrs" && <b>NFRs</b>}
          {view === "migration" && <b>Migration Phases</b>}
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
            {archSectionMain({
              label: "Architecture decisions",
              elements: archData.adrsReal,
              addLabel: "ADR",
              skill: "domain-architect",
              addPrompt:
                "Let's add a single Architecture Decision Record (ADR) for this process. Ask me the decision to capture, then draft it with context, the decision, the alternatives considered and the consequences.",
              elicitPrompt:
                "Let's work the ADRs for this architecture together: review what exists, surface the decisions implied by the target process and transformation decisions that aren't yet recorded, and elicit them with me one at a time.",
            })}
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
                    <th className="col-w120">ID</th>
                    <th>Element</th>
                    <th className="col-w150">Type</th>
                    <th>Trace check</th>
                    <th className="col-w90 col-right">Status</th>
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
            {archSectionMain({
              label: "Capabilities",
              elements: archData.caps,
              addLabel: "Capability",
              skill: "domain-architect",
              addPrompt:
                "Let's add a single business capability to the target architecture for this process. Ask me what it is and draft it.",
              elicitPrompt:
                "Let's work the capability map for this architecture: derive the capabilities the target process needs, check them against the requirements and gap resolution, and elicit what's missing with me.",
            })}
            {chatSidebar}
          </>
        )}

        {view === "applications" && (
          <>
            {archSectionMain({
              label: "Target applications",
              elements: archData.apps,
              addLabel: "Application",
              skill: "domain-architect",
              addPrompt:
                "Let's add a single target application to the architecture. Ask me about it and draft it, including the build / buy / configure / keep verdict and its rationale.",
              elicitPrompt:
                "Let's work the target application landscape: map the applications that realise the capabilities, decide build / buy / configure / keep for each, and elicit what's missing with me.",
            })}
            {chatSidebar}
          </>
        )}

        {view === "integrations" && (
          <>
            {archSectionMain({
              label: "Target integrations",
              elements: archData.integrations,
              addLabel: "Integration",
              skill: "solution-architect",
              addPrompt:
                "Let's add a single target integration between two applications. Ask me the endpoints, the data and the pattern, then draft it.",
              elicitPrompt:
                "Let's work the integration architecture: derive the interfaces between target applications that the target process needs, and elicit what's missing with me.",
            })}
            {chatSidebar}
          </>
        )}

        {view === "components" && (
          <>
            {archSectionMain({
              label: "Components",
              elements: archData.components,
              addLabel: "Component",
              skill: "solution-architect",
              addPrompt:
                "Let's add a single component of a target application (a service, gateway, worker or store). Ask me about it and draft it.",
              elicitPrompt:
                "Let's work the component breakdown for the target applications: decompose each into its components and elicit what's missing with me.",
            })}
            {chatSidebar}
          </>
        )}

        {view === "nfrs" && (
          <>
            {archSectionMain({
              label: "NFRs",
              elements: archData.nfrsReal,
              addLabel: "NFR",
              skill: "solution-architect",
              addPrompt:
                "Let's add a single non-functional requirement. Ask me the category and the target, then draft it with its traces.",
              elicitPrompt:
                "Let's work the NFRs for this architecture: derive them from the requirements, controls and regulation, set measurable targets, and elicit what's missing with me.",
            })}
            {chatSidebar}
          </>
        )}

        {view === "migration" && (
          <>
            {archSectionMain({
              label: "Migration phases",
              elements: archData.migrations,
              addLabel: "Phase",
              skill: "solution-architect",
              addPrompt:
                "Let's add a single migration phase. Ask me its scope and sequencing, then draft it.",
              elicitPrompt:
                "Let's work the migration plan: sequence the move from the as-is systems to the target architecture into phases with clear entry and exit criteria, and elicit what's missing with me.",
            })}
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
