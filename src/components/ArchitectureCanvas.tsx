"use client";

import { useCallback, useMemo, useState } from "react";
import type { ProcessDoc, Schema } from "@/lib/wiki";
import type { User } from "@/lib/user";
import Tooltip from "./Tooltip";
import Markdown from "./Markdown";
import AgentChat from "./AgentChat";
import UserMenu from "./UserMenu";
import { useAgentChat } from "@/hooks/useAgentChat";
import { SKILL_LABEL } from "@/lib/agent-chat-utils";

// Architect-side scope preamble — same shape as the Processminer one but
// tells the CLI the user is now an architect authoring the target / solution
// side of the wiki. Sent once per session; later turns inherit via --resume.
function archScopePreamble(d: ProcessDoc, user: User): string {
  const { id, title } = d.process;
  return [
    "[SESSION SCOPE — applies to this whole conversation]",
    `You are the Architecture Assistant for exactly one process: ${title} (${id}).`,
    `Its wiki content is wiki/processes/${d.slug}/; its source documents`,
    `are under raw-sources/${d.slug}/.`,
    "",
    `The architect present in this session is ${user.name} (${user.role}). Use`,
    "that name verbatim wherever an approval or edit is stamped — never ask",
    "the architect for their name.",
    "",
    "Rules, in force for every turn of this session:",
    `1. Only consider, discuss and change content belonging to ${id}.`,
    "2. Focus on the architect-side sections: capabilities, target-",
    "   applications, architecture-decisions, target-integrations, components,",
    "   nfrs, migration-phases. Upstream sections (the SME side) are read-only",
    "   reference — refer to them but do not edit them.",
    "3. Never read or modify another process under wiki/processes/ or",
    "   raw-sources/, and never change anything else in the repository.",
    "4. schema/, scripts/ and .claude/skills/ are shared framework the",
    "   skills need — reading and running those is allowed and expected.",
    "",
    "The architect's request follows below.",
    "",
    "---",
    "",
  ].join("\n");
}

// The ArchitectMiner canvas — the architect-side counterpart of the
// Processminer canvas. Every view derives from doc.elements: capabilities,
// target applications, ADRs, integrations, components, NFRs and migration
// phases on the architect side; the SME-side sections (left nav, "Inputs
// from Processminer") are read-only references the architect builds on top.

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
  schema,
  doc,
  user,
  onUserUpdated,
  onEnterAdmin,
  onSignOut,
  onReturnToInbox,
}: {
  schema: Schema;
  doc: ProcessDoc;
  user: User;
  onUserUpdated: (u: User) => void;
  onEnterAdmin?: () => void;
  onSignOut: () => void;
  onReturnToInbox: () => void;
}) {
  const [view, setView] = useState<ArchView>("adrs");
  // Chat panel open/closed — collapsed state mirrors ProcessMiner's shell so
  // the architect can hide the rail and reclaim canvas width for the diagram.
  const [chatOpen, setChatOpen] = useState(true);
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

  const initials = user.name
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Real chat pipeline via the shared useAgentChat hook. Same SSE / activity
  // / skill chip / watchdog as Processminer; sessionStorage prefix "am-chat"
  // keeps the architect's transcript separate from the SME's.
  const {
    messages,
    chatPending,
    chatActivity,
    chatTasks,
    activeSkill,
    activeSkillEta,
    handleSend,
    restartSession,
  } = useAgentChat({
    doc,
    user,
    scopePreamble: archScopePreamble,
    storePrefix: "am-chat",
    productName: "ArchitectMiner",
  });

  // Element-id hovercards in chat replies — resolve any "<PREFIX>-<SLUG>-<NN>"
  // back to its page and human-readable type label, the same way the
  // Processminer chat does it.
  const elementsById = useMemo(
    () => new Map(doc.elements.map((el) => [el.id, el])),
    [doc.elements],
  );
  const getRef = useCallback(
    (id: string) => {
      const page = elementsById.get(id);
      return page
        ? { page, typeLabel: schema.elementTypes[page.type]?.label ?? page.type }
        : undefined;
    },
    [elementsById, schema],
  );

  const chatSidebar = (
    <div className={`am-canvas-chat${chatOpen ? "" : " am-canvas-chat-collapsed"}`}>
      <AgentChat
        open={chatOpen}
        onToggle={() => setChatOpen((v) => !v)}
        onWidthChange={() => {}}
        messages={messages}
        onSend={(t) => handleSend(t)}
        pending={chatPending}
        activity={chatActivity}
        tasks={chatTasks}
        activeSkillLabel={activeSkill ? (SKILL_LABEL[activeSkill] ?? null) : null}
        activeSkillEta={activeSkillEta}
        onRestart={restartSession}
        onRunLint={() =>
          handleSend(
            `Run the run-lint skill on the process with slug "${doc.slug}" — cross-check traces across all architect views.`,
            {
              skill: "run-lint",
              displayText: "Cross-check traces across all views.",
            },
          )
        }
        linting={false}
        findingCount={null}
        getRef={getRef}
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

  // "+ Add X" header buttons fan out into a single skill call — add-entry,
  // scoped to the section the button lives on. The architect sees a friendly
  // line in the transcript ("Add a new ADR to this section.") while the CLI
  // gets the precise directive ("Run the add-entry skill ... section X").
  const addElement = (section: string, typeLabel: string) => {
    if (chatPending) return;
    handleSend(
      `Run the add-entry skill for the "${section}" section of the process with slug "${doc.slug}". The architect wants to add a new "${typeLabel}".`,
      {
        skill: "add-entry",
        displayText: `Add a new ${typeLabel} to this section.`,
      },
    );
  };

  // "Elicit with X architect" header buttons run the matching architect-
  // side specialist skill. Domain Architect owns the upstream layer
  // (capabilities + target-applications + ADRs); Solution Architect owns
  // the technical layer (integrations + components + NFRs + migration
  // phases). The canvas button text already reflects this split.
  const SECTION_TO_SPECIALIST: Record<string, "domain-architect" | "solution-architect"> = {
    "capabilities": "domain-architect",
    "target-applications": "domain-architect",
    "architecture-decisions": "domain-architect",
    "target-integrations": "solution-architect",
    "components": "solution-architect",
    "nfrs": "solution-architect",
    "migration-phases": "solution-architect",
  };
  const elicitWith = (forSection: string) => {
    if (chatPending) return;
    const specialist = SECTION_TO_SPECIALIST[forSection] ?? "domain-architect";
    const role = specialist === "domain-architect" ? "domain" : "solution";
    handleSend(
      `Run the ${specialist} skill on the "${forSection}" section of the process with slug "${doc.slug}" — work with the architect to develop this section interactively.`,
      {
        skill: specialist,
        displayText: `Elicit ${forSection.replace(/-/g, " ")} with the ${role} architect.`,
      },
    );
  };

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
              {archData.adrsReal.length > 0 && (
                <>
                  <span style={{ margin: "0 8px", opacity: 0.6 }}>·</span>
                  {archData.adrsReal[0].id}
                </>
              )}
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
              {archData.caps.length > 0 && (
                <>
                  <span style={{ margin: "0 8px", opacity: 0.6 }}>·</span>
                  {archData.caps[0].id}
                </>
              )}
            </>
          )}
          {view === "applications" && (
            <>
              <b>Target Applications</b>
              {archData.apps.length > 0 && (
                <>
                  <span style={{ margin: "0 8px", opacity: 0.6 }}>·</span>
                  {archData.apps[0].id}
                </>
              )}
            </>
          )}
          {view === "integrations" && (
            <>
              <b>Target Integrations</b>
              {archData.integrations.length > 0 && (
                <>
                  <span style={{ margin: "0 8px", opacity: 0.6 }}>·</span>
                  {archData.integrations[0].id}
                </>
              )}
            </>
          )}
          {view === "components" && (
            <>
              <b>Components</b>
              {archData.components.length > 0 && (
                <>
                  <span style={{ margin: "0 8px", opacity: 0.6 }}>·</span>
                  {archData.components[0].id}
                </>
              )}
            </>
          )}
          {view === "nfrs" && (
            <>
              <b>NFRs</b>
              {archData.nfrsReal.length > 0 && (
                <>
                  <span style={{ margin: "0 8px", opacity: 0.6 }}>·</span>
                  {archData.nfrsReal[0].id}
                </>
              )}
            </>
          )}
          {view === "migration" && (
            <>
              <b>Migration Phases</b>
              {archData.migrations.length > 0 && (
                <>
                  <span style={{ margin: "0 8px", opacity: 0.6 }}>·</span>
                  {archData.migrations[0].id}
                </>
              )}
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
        <UserMenu
          user={user}
          onUserUpdated={onUserUpdated}
          onEnterAdmin={onEnterAdmin}
          onSignOut={onSignOut}
        />
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
            <span className="am-canvas-n">88%</span>
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
                  {archData.adrsReal.length} element{archData.adrsReal.length === 1 ? "" : "s"} ·{" "}
                  {archData.adrAccepted} accepted · {archData.adrProposed} proposed ·{" "}
                  {archData.adrDraft} draft
                </span>
                <span style={{ flex: 1 }} />
                <button
                  type="button"
                  className="am-canvas-btn"
                  onClick={() => addElement("architecture-decisions", "ADR")}
                  disabled={chatPending}
                >
                  ＋ Add ADR
                </button>
                <button
                  type="button"
                  className="am-canvas-btn am-canvas-btn-primary"
                  onClick={() => elicitWith("architecture-decisions")}
                  disabled={chatPending}
                >
                  ／ Elicit with domain architect
                </button>
              </div>

              {archData.adrsReal.length === 0 ? (
                <div className="am-input-empty">
                  No architecture decisions authored yet for <b>{doc.process.title}</b>.
                  Author element files under{" "}
                  <code>wiki/processes/{doc.slug}/architecture-decisions/</code>.
                </div>
              ) : (
                <>
                  <div className="am-canvas-elemlist">
                    {archData.adrsReal.map((adr, i) => {
                      const stat = ((adr.meta.adrStatus as string) ?? "").toUpperCase();
                      const tone =
                        stat === "ACCEPTED" ? "hi" :
                        stat === "PROPOSED" ? "mid" :
                        stat === "REJECTED" || stat === "SUPERSEDED" ? "neu" : "neu";
                      const drives = Array.isArray(adr.meta.decision)
                        ? adr.meta.decision[0]
                        : (adr.meta.decision as string | undefined);
                      return (
                        <div
                          key={adr.id}
                          className={`am-canvas-elem${i === 0 ? " am-canvas-elem-open" : ""}`}
                        >
                          <span className="am-canvas-elem-id">{adr.id}</span>
                          <span className="am-canvas-elem-title">{adr.title}</span>
                          <span className={`am-pill am-pill-${tone}`}>{stat || "DRAFT"}</span>
                          {drives && (
                            <span className="am-pill am-pill-neu">→ {drives}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {(() => {
                    const openReal = archData.adrsReal[0];
                    const stat = ((openReal.meta.adrStatus as string) ?? "DRAFT").toUpperCase();
                    const tone = stat === "ACCEPTED" ? "hi" : stat === "PROPOSED" ? "mid" : "neu";
                    return (
                      <article className="am-canvas-adr">
                        <header className="am-canvas-adr-head">
                          <span className="am-canvas-elem-id">{openReal.id}</span>
                          <h3>{openReal.title}</h3>
                          <span className={`am-pill am-pill-${tone}`}>
                            <span className="am-dot" />
                            {stat}
                          </span>
                        </header>
                        <div className="am-canvas-adr-meta">
                          {openReal.meta.domain && (
                            <span><b>Domain</b> {openReal.meta.domain as string}</span>
                          )}
                          {openReal.meta.owner && (
                            <span><b>Owner</b> {openReal.meta.owner as string}</span>
                          )}
                          <span><b>Status</b> {openReal.status}</span>
                        </div>

                        {openReal.blocks.map((b) => (
                          <div key={b.heading}>
                            <div className="am-canvas-heading">
                              <h4>{b.heading}</h4>
                            </div>
                            <div className="am-canvas-prose">
                              <Markdown text={b.text} />
                            </div>
                          </div>
                        ))}
                      </article>
                    );
                  })()}
                </>
              )}

              <div
                className="am-canvas-banner"
                style={{ background: "var(--hi-bg)", color: "var(--hi)", borderColor: "#c7dccf" }}
              >
                Real data — file-backed under{" "}
                <code>wiki/processes/{doc.slug}/architecture-decisions/</code>.
              </div>
            </main>
            {chatSidebar}
          </>
        )}

        {view === "diagram" && (
          <>
            <main
              className={`am-canvas-diagram-main${archData.caps.length === 0 ? " am-canvas-doc-wide" : ""}`}
            >
              <div className="am-canvas-diagram-toolbar">
                <h2>Target architecture</h2>
                <span className="am-canvas-secmeta">
                  derived live from {archData.apps.length} app{archData.apps.length === 1 ? "" : "s"}
                  {", "}
                  {archData.caps.length} capabilit{archData.caps.length === 1 ? "y" : "ies"}
                  {", "}
                  {archData.integrations.length} integration{archData.integrations.length === 1 ? "" : "s"}
                </span>
                <span style={{ flex: 1 }} />
                <div className="am-canvas-legend">
                  <span><i className="am-canvas-legend-sync" />sync</span>
                  <span><i className="am-canvas-legend-async" />async</span>
                  <span><i className="am-canvas-legend-event" />event</span>
                </div>
              </div>

              {archData.apps.length === 0 && archData.caps.length === 0 ? (
                <div className="am-input-empty">
                  No architecture elements authored yet for <b>{doc.process.title}</b>.
                  The diagram populates once capabilities and target applications
                  are authored.
                </div>
              ) : (() => {
                const W = 880;
                const H = 380;
                const capH = 80;
                const appH = 60;
                const capRow = 60;
                const appRow = 240;
                const capCount = Math.max(1, archData.caps.length);
                const appCount = Math.max(1, archData.apps.length);
                const capSlot = (W - 60) / capCount;
                const appSlot = (W - 60) / appCount;
                const capW = Math.max(140, Math.min(220, capSlot - 20));
                const appW = Math.max(140, Math.min(220, appSlot - 20));
                const capX = (i: number) => 40 + i * capSlot;
                const appX = (i: number) => 40 + i * appSlot;
                const capCx = (i: number) => capX(i) + capW / 2;
                const appCx = (i: number) => appX(i) + appW / 2;
                const appById = new Map(archData.apps.map((a, i) => [a.id, { idx: i, app: a }]));
                const capById = new Map(archData.caps.map((c, i) => [c.id, { idx: i, cap: c }]));
                return (
                  <svg viewBox={`0 0 ${W} ${H}`} className="am-canvas-diagram-svg">
                    <line x1="0" y1="40" x2={W} y2="40" stroke="#dde0e5" strokeDasharray="2 4" />
                    <line x1="0" y1={appRow - 30} x2={W} y2={appRow - 30} stroke="#dde0e5" strokeDasharray="2 4" />
                    <text className="am-svg-swim" x="16" y="30">Business capabilities</text>
                    <text className="am-svg-swim" x="16" y={appRow - 10}>Systems &amp; data</text>

                    {/* capability boxes */}
                    {archData.caps.map((cap, i) => {
                      const hostedRaw = Array.isArray(cap.meta.hostedIn) ? cap.meta.hostedIn[0] : (cap.meta.hostedIn as string | undefined);
                      const hostedApp = hostedRaw ? archData.apps.find((a) => a.id === hostedRaw) : undefined;
                      const hostLabel = hostedApp ? hostedApp.title : (hostedRaw ?? "—");
                      const verdict = (hostedApp?.meta.verdict as string | undefined);
                      return (
                        <g key={cap.id}>
                          <rect
                            className={`am-svg-cap${i === 0 ? " am-svg-cap-sel" : ""}`}
                            x={capX(i)}
                            y={capRow}
                            width={capW}
                            height={capH}
                            rx="6"
                          />
                          <text className="am-svg-lbl" x={capX(i) + 12} y={capRow + 22}>{cap.id}</text>
                          <text className="am-svg-lbl am-svg-lbl-strong" x={capX(i) + 12} y={capRow + 40}>
                            {cap.title.slice(0, 28)}
                          </text>
                          <text className="am-svg-sub" x={capX(i) + 12} y={capRow + 62}>
                            hosted in: {hostLabel.slice(0, 22)}{verdict ? ` · ${verdict}` : ""}
                          </text>
                        </g>
                      );
                    })}

                    {/* app boxes */}
                    {archData.apps.map((app, i) => {
                      const verdict = ((app.meta.verdict as string) ?? "").toUpperCase();
                      return (
                        <g key={app.id}>
                          <rect
                            className="am-svg-app"
                            x={appX(i)}
                            y={appRow}
                            width={appW}
                            height={appH}
                            rx="6"
                          />
                          <text className="am-svg-lbl am-svg-lbl-strong" x={appX(i) + 12} y={appRow + 22}>
                            {app.title.slice(0, 24)}
                          </text>
                          <text className="am-svg-sub" x={appX(i) + 12} y={appRow + 40}>
                            {verdict}{app.meta.vendor ? ` · ${(app.meta.vendor as string).slice(0, 26)}` : ""}
                          </text>
                          <text className="am-svg-sub" x={appX(i) + 12} y={appRow + 54}>
                            {app.id}
                          </text>
                        </g>
                      );
                    })}

                    {/* edges: capability hostedIn → app */}
                    {archData.caps.map((cap, i) => {
                      const hostedRaw = Array.isArray(cap.meta.hostedIn) ? cap.meta.hostedIn[0] : (cap.meta.hostedIn as string | undefined);
                      const target = hostedRaw ? appById.get(hostedRaw) : undefined;
                      if (!target) return null;
                      return (
                        <path
                          key={`cap-app-${cap.id}`}
                          className="am-svg-edge-sync"
                          d={`M${capCx(i)} ${capRow + capH} L${appCx(target.idx)} ${appRow}`}
                        />
                      );
                    })}

                    {/* edges: target-integration from → to */}
                    {archData.integrations.map((it) => {
                      const fromId = Array.isArray(it.meta.from) ? it.meta.from[0] : (it.meta.from as string | undefined);
                      const toId = Array.isArray(it.meta.to) ? it.meta.to[0] : (it.meta.to as string | undefined);
                      const from = fromId ? appById.get(fromId) : undefined;
                      const to = toId ? appById.get(toId) : undefined;
                      if (!from || !to) return null;
                      const pattern = ((it.meta.pattern as string) ?? "").toLowerCase();
                      const cls = pattern === "async" ? "am-svg-edge-async" :
                                  pattern === "event" ? "am-svg-edge-event" :
                                  pattern === "batch" ? "am-svg-edge-async" :
                                  "am-svg-edge-sync";
                      const y = appRow + appH + 14;
                      return (
                        <path
                          key={it.id}
                          className={cls}
                          d={`M${appCx(from.idx)} ${appRow + appH} C ${appCx(from.idx)} ${y + 20}, ${appCx(to.idx)} ${y + 20}, ${appCx(to.idx)} ${appRow + appH}`}
                        />
                      );
                    })}
                  </svg>
                );
              })()}

              <div
                className="am-canvas-banner"
                style={{ background: "var(--hi-bg)", color: "var(--hi)", borderColor: "#c7dccf" }}
              >
                Real data — capabilities, target apps and integrations are
                positioned from <code>doc.elements</code>. Edges follow{" "}
                <code>hostedIn</code> + integration <code>from / to</code>.
              </div>
            </main>

            {archData.caps.length > 0 ? (
            <aside className="am-canvas-details">
              {(() => {
                const cap = archData.caps[0];
                const hostedRaw = Array.isArray(cap.meta.hostedIn) ? cap.meta.hostedIn[0] : (cap.meta.hostedIn as string | undefined);
                const hostedApp = hostedRaw ? archData.apps.find((a) => a.id === hostedRaw) : undefined;
                return (
                  <>
                    <h3>Capability — {cap.title}</h3>
                    <div className="am-canvas-details-id">{cap.id}</div>

                    <div className="am-canvas-details-block">
                      {hostedApp && (
                        <div className="am-canvas-details-row">
                          <span className="am-canvas-details-k">Hosted in</span>
                          <span>
                            {hostedApp.title}
                            {hostedApp.meta.verdict && (
                              <span
                                className={`am-verdict am-verdict-${((hostedApp.meta.verdict as string) ?? "").toLowerCase()}`}
                                style={{ marginLeft: 6 }}
                              >
                                {hostedApp.meta.verdict as string}
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      {cap.meta.criticality && (
                        <div className="am-canvas-details-row">
                          <span className="am-canvas-details-k">Criticality</span>
                          <span>{cap.meta.criticality as string}</span>
                        </div>
                      )}
                      {cap.meta.reuse && (
                        <div className="am-canvas-details-row">
                          <span className="am-canvas-details-k">Reuse</span>
                          <span>{cap.meta.reuse as string}</span>
                        </div>
                      )}
                      {cap.meta.owningDomain && (
                        <div className="am-canvas-details-row">
                          <span className="am-canvas-details-k">Owning domain</span>
                          <span>{cap.meta.owningDomain as string}</span>
                        </div>
                      )}
                      <div className="am-canvas-details-row">
                        <span className="am-canvas-details-k">Status</span>
                        <span>
                          <span className={`am-pill am-pill-${cap.status === "confirmed" ? "hi" : "mid"}`}>
                            {cap.status === "confirmed" ? "Accepted" : "Draft"}
                          </span>
                        </span>
                      </div>
                    </div>

                    {cap.blocks.length > 0 && cap.blocks.map((b) => (
                      <div className="am-input-block" key={b.heading}>
                        <h4>{b.heading}</h4>
                        <div className="am-input-prose"><Markdown text={b.text} /></div>
                      </div>
                    ))}
                  </>
                );
              })()}
            </aside>
            ) : null}
            {chatSidebar}
          </>
        )}

        {view === "traceability" && (
          <>
          <main className="am-canvas-trace-main">
            <div className="am-canvas-trace-head">
              <h2>Traceability — {doc.process.title}</h2>
              <span className="am-canvas-secmeta">
                derived live from file-backed elements · resolve check across all sections
              </span>
            </div>

            {(() => {
              // Architect element types + the relation keys we expect each to carry.
              // For each element we collect all declared trace ids, resolve them
              // against the rest of doc.elements, and bucket the element as
              // OK / Partial / Orphan.
              const TYPES: Array<{ type: string; label: string; rels: string[] }> = [
                { type: "capability", label: "Capability", rels: ["hostedIn", "realisesStep", "resolvesGap"] },
                { type: "target-application", label: "Target App", rels: ["drivenByADR"] },
                { type: "adr", label: "ADR", rels: ["decision", "resolvesGap", "satisfiesControl", "supersededBy", "dependsOn"] },
                { type: "target-integration", label: "Integration", rels: ["from", "to", "realises", "drivenByADR"] },
                { type: "component", label: "Component", rels: ["inApp", "dependsOn", "realisesCapability"] },
                { type: "nfr", label: "NFR", rels: ["satisfiesControl", "regulatedBy", "appliesTo", "drivenByADR"] },
                { type: "migration-phase", label: "Migration Phase", rels: ["dependsOn", "delivers", "resolvesGap"] },
              ];
              const byId = new Map(doc.elements.map((e) => [e.id, e]));
              type Row = {
                id: string;
                title: string;
                label: string;
                resolved: string[];
                broken: string[];
                status: "ok" | "partial" | "orphan";
              };
              const rows: Row[] = [];
              for (const t of TYPES) {
                const els = doc.elements.filter((e) => e.type === t.type);
                for (const el of els) {
                  const resolved: string[] = [];
                  const broken: string[] = [];
                  for (const k of t.rels) {
                    const v = el.meta[k];
                    if (!v) continue;
                    const ids = Array.isArray(v) ? v : [v as string];
                    for (const id of ids) {
                      if (byId.has(id)) resolved.push(id);
                      else broken.push(id);
                    }
                  }
                  let status: Row["status"];
                  if (resolved.length === 0 && broken.length === 0) status = "orphan";
                  else if (broken.length === 0) status = "ok";
                  else if (resolved.length === 0) status = "orphan";
                  else status = "partial";
                  rows.push({ id: el.id, title: el.title, label: t.label, resolved, broken, status });
                }
              }
              const total = rows.length;
              const okN = rows.filter((r) => r.status === "ok").length;
              const partialN = rows.filter((r) => r.status === "partial").length;
              const orphanN = rows.filter((r) => r.status === "orphan").length;
              const tracedPct = total === 0 ? 0 : Math.round((okN / total) * 100);

              return (
                <>
                  <div className="am-canvas-stats">
                    <div className="am-canvas-stat">
                      <div className="am-canvas-stat-v">{total}</div>
                      <div className="am-canvas-stat-l">architecture elements</div>
                    </div>
                    <div className="am-canvas-stat">
                      <div className="am-canvas-stat-v am-canvas-stat-ok">{tracedPct}%</div>
                      <div className="am-canvas-stat-l">fully traced</div>
                    </div>
                    <div className="am-canvas-stat">
                      <div className="am-canvas-stat-v am-canvas-stat-warn">{partialN}</div>
                      <div className="am-canvas-stat-l">partial traces</div>
                    </div>
                    <div className="am-canvas-stat">
                      <div className="am-canvas-stat-v am-canvas-stat-bad">{orphanN}</div>
                      <div className="am-canvas-stat-l">orphans</div>
                    </div>
                    <div className="am-canvas-stat">
                      <div className="am-canvas-stat-v">{okN}</div>
                      <div className="am-canvas-stat-l">resolved cleanly</div>
                    </div>
                  </div>

                  {total === 0 ? (
                    <div className="am-input-empty">
                      No architecture elements authored yet for{" "}
                      <b>{doc.process.title}</b>. Traceability will populate as
                      capabilities, applications, ADRs, integrations, components,
                      NFRs and migration phases are authored.
                    </div>
                  ) : (
                    <table className="am-canvas-trace-table">
                      <thead>
                        <tr>
                          <th style={{ width: 110 }}>ID</th>
                          <th>Element</th>
                          <th style={{ width: 130 }}>Type</th>
                          <th>Traces to upstream</th>
                          <th style={{ width: 90, textAlign: "right" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr
                            key={r.id}
                            className={
                              r.status === "partial" ? "am-canvas-trace-row-partial" :
                              r.status === "orphan" ? "am-canvas-trace-row-orphan" :
                              undefined
                            }
                          >
                            <td className="am-canvas-trace-id">{r.id}</td>
                            <td className="am-canvas-trace-title">{r.title}</td>
                            <td className="am-canvas-trace-type">{r.label}</td>
                            <td>
                              {r.resolved.length === 0 && r.broken.length === 0 ? (
                                <span className="am-canvas-trace am-canvas-trace-bad">
                                  no upstream link
                                </span>
                              ) : (
                                <>
                                  {r.resolved.map((id) => (
                                    <span key={id} className="am-canvas-trace">{id}</span>
                                  ))}
                                  {r.broken.map((id) => (
                                    <span key={id} className="am-canvas-trace am-canvas-trace-warn">
                                      {id} missing
                                    </span>
                                  ))}
                                </>
                              )}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <span
                                className={`am-pill am-pill-${
                                  r.status === "ok" ? "hi" :
                                  r.status === "partial" ? "mid" : "lo"
                                }`}
                              >
                                {r.status === "ok" ? "OK" : r.status === "partial" ? "Partial" : "Orphan"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              );
            })()}

            <div
              className="am-canvas-banner"
              style={{ background: "var(--hi-bg)", color: "var(--hi)", borderColor: "#c7dccf" }}
            >
              Real data — every row above is an architect element scanned live
              from <code>wiki/processes/{doc.slug}/</code>. Resolution checks
              run against the rest of <code>doc.elements</code> on each render.
            </div>
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
                  onClick={() => addElement("capabilities", "capability")}
                  disabled={chatPending}
                >
                  ＋ Add Capability
                </button>
                <button
                  type="button"
                  className="am-canvas-btn am-canvas-btn-primary"
                  onClick={() => elicitWith("capabilities")}
                  disabled={chatPending}
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
              {archData.caps.length === 0 ? (
                <div className="am-input-empty" style={{ marginTop: 0 }}>
                  No capability selected — author one to see its details here.
                </div>
              ) : (() => {
                const cap = archData.caps[0];
                const hostedRaw = Array.isArray(cap.meta.hostedIn)
                  ? cap.meta.hostedIn[0]
                  : (cap.meta.hostedIn as string | undefined);
                const hostedApp = hostedRaw ? archData.apps.find((a) => a.id === hostedRaw) : undefined;
                const realisesStep = Array.isArray(cap.meta.realisesStep) ? cap.meta.realisesStep as string[] : [];
                const realisesGap = Array.isArray(cap.meta.resolvesGap) ? cap.meta.resolvesGap as string[] : [];
                const adrsForCap = archData.adrsReal.filter((a) => {
                  const r = a.meta.realisesCapability ?? a.meta.realises;
                  const list = Array.isArray(r) ? r : r ? [r as string] : [];
                  return list.includes(cap.id);
                });
                const nfrsForCap = archData.nfrsReal.filter((n) => {
                  const a = Array.isArray(n.meta.appliesTo) ? n.meta.appliesTo as string[] : [];
                  return a.includes(cap.id);
                });
                return (
                  <>
                    <h3>Capability — {cap.title}</h3>
                    <div className="am-canvas-details-id">{cap.id}</div>
                    <div className="am-canvas-details-block">
                      {hostedApp && (
                        <div className="am-canvas-details-row">
                          <span className="am-canvas-details-k">Hosted in</span>
                          <span>
                            {hostedApp.title}
                            {hostedApp.meta.verdict && (
                              <span
                                className={`am-verdict am-verdict-${((hostedApp.meta.verdict as string) ?? "").toLowerCase()}`}
                                style={{ marginLeft: 6 }}
                              >
                                {hostedApp.meta.verdict as string}
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      {cap.meta.criticality && (
                        <div className="am-canvas-details-row">
                          <span className="am-canvas-details-k">Criticality</span>
                          <span>{cap.meta.criticality as string}</span>
                        </div>
                      )}
                      {cap.meta.reuse && (
                        <div className="am-canvas-details-row">
                          <span className="am-canvas-details-k">Reuse</span>
                          <span>{cap.meta.reuse as string}</span>
                        </div>
                      )}
                      {cap.meta.owningDomain && (
                        <div className="am-canvas-details-row">
                          <span className="am-canvas-details-k">Owning domain</span>
                          <span>{cap.meta.owningDomain as string}</span>
                        </div>
                      )}
                      <div className="am-canvas-details-row">
                        <span className="am-canvas-details-k">Status</span>
                        <span>
                          <span className={`am-pill am-pill-${cap.status === "confirmed" ? "hi" : "mid"}`}>
                            {cap.status === "confirmed" ? "Accepted" : "Draft"}
                          </span>
                        </span>
                      </div>
                    </div>

                    {realisesStep.length > 0 && (
                      <div className="am-canvas-details-block">
                        <h4>Realises target steps</h4>
                        <div className="am-canvas-traces">
                          {realisesStep.map((id) => (
                            <span key={id} className="am-canvas-trace">{id}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {adrsForCap.length > 0 && (
                      <div className="am-canvas-details-block">
                        <h4>Realised by ADRs</h4>
                        <div className="am-canvas-traces">
                          {adrsForCap.map((a) => (
                            <span key={a.id} className="am-canvas-trace">{a.id}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {nfrsForCap.length > 0 && (
                      <div className="am-canvas-details-block">
                        <h4>NFRs</h4>
                        <div className="am-canvas-traces">
                          {nfrsForCap.map((n) => (
                            <span key={n.id} className="am-canvas-trace">{n.id}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {realisesGap.length > 0 && (
                      <div className="am-canvas-details-block">
                        <h4>Resolves gaps</h4>
                        <div className="am-canvas-traces">
                          {realisesGap.map((id) => (
                            <span key={id} className="am-canvas-trace">{id}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {cap.blocks.length > 0 && cap.blocks.map((b) => (
                      <div className="am-input-block" key={b.heading}>
                        <h4>{b.heading}</h4>
                        <div className="am-input-prose"><Markdown text={b.text} /></div>
                      </div>
                    ))}
                  </>
                );
              })()}
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
                  onClick={() => addElement("target-applications", "target application")}
                  disabled={chatPending}
                >
                  ＋ Add Application
                </button>
                <button
                  type="button"
                  className="am-canvas-btn am-canvas-btn-primary"
                  onClick={() => elicitWith("target-applications")}
                  disabled={chatPending}
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
            <main className="am-canvas-doc am-canvas-doc-wide">
              <div className="am-canvas-sechead">
                <h2>Target Integrations</h2>
                <span className="am-canvas-secmeta">
                  {archData.integrations.length} element{archData.integrations.length === 1 ? "" : "s"}
                </span>
                <span style={{ flex: 1 }} />
                <button
                  type="button"
                  className="am-canvas-btn"
                  onClick={() => addElement("target-integrations", "target integration")}
                  disabled={chatPending}
                >
                  ＋ Add Integration
                </button>
                <button
                  type="button"
                  className="am-canvas-btn am-canvas-btn-primary"
                  onClick={() => elicitWith("target-integrations")}
                  disabled={chatPending}
                >
                  ／ Elicit with solution architect
                </button>
              </div>

              {archData.integrations.length === 0 ? (
                <div className="am-input-empty">
                  No target integrations authored yet for <b>{doc.process.title}</b>.
                  Author element files under{" "}
                  <code>wiki/processes/{doc.slug}/target-integrations/</code>.
                </div>
              ) : (
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
                    {archData.integrations.map((it, i) => {
                      const fromId = Array.isArray(it.meta.from) ? it.meta.from[0] : (it.meta.from as string | undefined);
                      const toId = Array.isArray(it.meta.to) ? it.meta.to[0] : (it.meta.to as string | undefined);
                      const fromTitle = fromId ? (archData.apps.find((a) => a.id === fromId)?.title ?? fromId) : "—";
                      const toTitle = toId ? (archData.apps.find((a) => a.id === toId)?.title ?? toId) : "—";
                      const pattern = ((it.meta.pattern as string) ?? "").toLowerCase();
                      return (
                        <IntegrationRow
                          key={it.id}
                          selected={i === 0}
                          from={fromTitle}
                          to={toTitle}
                          id={it.id}
                          sub={it.title}
                          pattern={(["sync","async","event","batch"].includes(pattern) ? pattern : "sync") as "sync"|"async"|"event"|"batch"}
                          direction={(it.meta.direction as string) ?? "—"}
                          volume={(it.meta.volume as string) ?? "—"}
                          volSub=""
                          contract={(it.meta.contract as string) ?? "—"}
                          status={it.status === "confirmed" ? "Accepted" : "Proposed"}
                        />
                      );
                    })}
                  </tbody>
                </table>
              )}

              <div
                className="am-canvas-banner"
                style={{ background: "var(--hi-bg)", color: "var(--hi)", borderColor: "#c7dccf" }}
              >
                Real data — file-backed under{" "}
                <code>wiki/processes/{doc.slug}/target-integrations/</code>.
              </div>
            </main>
            {chatSidebar}
          </>
        )}

        {view === "components" && (
          <>
            <main className="am-canvas-doc am-canvas-doc-wide">
              <div className="am-canvas-sechead">
                <h2>Components</h2>
                <span className="am-canvas-secmeta">
                  {archData.components.length} element{archData.components.length === 1 ? "" : "s"} ·{" "}
                  across {archData.apps.length} app{archData.apps.length === 1 ? "" : "s"}
                </span>
                <span style={{ flex: 1 }} />
                <button
                  type="button"
                  className="am-canvas-btn"
                  onClick={() => addElement("components", "component")}
                  disabled={chatPending}
                >
                  ＋ Add Component
                </button>
                <button
                  type="button"
                  className="am-canvas-btn am-canvas-btn-primary"
                  onClick={() => elicitWith("components")}
                  disabled={chatPending}
                >
                  ／ Elicit with solution architect
                </button>
              </div>

              {archData.components.length === 0 ? (
                <div className="am-input-empty">
                  No components authored yet for <b>{doc.process.title}</b>.
                  Author element files under{" "}
                  <code>wiki/processes/{doc.slug}/components/</code>.
                </div>
              ) : (
                archData.apps.map((app) => {
                  const inApp = archData.components.filter((c) => {
                    const a = Array.isArray(c.meta.inApp) ? c.meta.inApp[0] : c.meta.inApp;
                    return a === app.id;
                  });
                  if (inApp.length === 0) return null;
                  const verdict = ((app.meta.verdict as string) ?? "").toLowerCase();
                  return (
                    <div key={app.id} className="am-canvas-comp-group">
                      <div className="am-canvas-comp-group-head">
                        <h3>
                          {app.title}
                          {verdict && (
                            <span className={`am-verdict am-verdict-${verdict}`} style={{ marginLeft: 6 }}>
                              {verdict.toUpperCase()}
                            </span>
                          )}
                        </h3>
                        <span className="am-canvas-comp-count">
                          {inApp.length} component{inApp.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="am-canvas-comp-cards">
                        {inApp.map((c, i) => {
                          const dependsOn = Array.isArray(c.meta.dependsOn)
                            ? (c.meta.dependsOn as string[])
                            : c.meta.dependsOn ? [c.meta.dependsOn as string] : [];
                          return (
                            <ComponentCard
                              key={c.id}
                              selected={i === 0}
                              id={c.id}
                              name={c.title}
                              tech={(c.meta.tech as string) ?? "—"}
                              sub={(c.meta.dataStore as string) ?? ""}
                              deps={dependsOn.map((d) => `→ ${d}`)}
                              status={c.status === "confirmed" ? "Accepted" : "Proposed"}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}

              <div
                className="am-canvas-banner"
                style={{ background: "var(--hi-bg)", color: "var(--hi)", borderColor: "#c7dccf" }}
              >
                Real data — file-backed under{" "}
                <code>wiki/processes/{doc.slug}/components/</code>.
              </div>
            </main>
            {chatSidebar}
          </>
        )}

        {view === "nfrs" && (
          <>
            <main className="am-canvas-doc am-canvas-doc-wide">
              <div className="am-canvas-sechead">
                <h2>NFRs</h2>
                <span className="am-canvas-secmeta">
                  {archData.nfrsReal.length} element{archData.nfrsReal.length === 1 ? "" : "s"}
                </span>
                <span style={{ flex: 1 }} />
                <button
                  type="button"
                  className="am-canvas-btn"
                  onClick={() => addElement("nfrs", "NFR")}
                  disabled={chatPending}
                >
                  ＋ Add NFR
                </button>
                <button
                  type="button"
                  className="am-canvas-btn am-canvas-btn-primary"
                  onClick={() => elicitWith("nfrs")}
                  disabled={chatPending}
                >
                  ／ Elicit with solution architect
                </button>
              </div>

              {archData.nfrsReal.length === 0 ? (
                <div className="am-input-empty">
                  No NFRs authored yet for <b>{doc.process.title}</b>.
                  Author element files under{" "}
                  <code>wiki/processes/{doc.slug}/nfrs/</code>.
                </div>
              ) : (
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
                    {archData.nfrsReal.map((n, i) => {
                      const catRaw = ((n.meta.category as string) ?? "").toUpperCase();
                      const cat =
                        catRaw.startsWith("PERF") ? "perf" :
                        catRaw.startsWith("AVAIL") ? "avail" :
                        catRaw.startsWith("SEC") ? "sec" :
                        catRaw.startsWith("COMP") ? "comp" :
                        catRaw.startsWith("SCAL") ? "scale" : "perf";
                      const catLabel = catRaw.slice(0, 5) || "PERF";
                      const satisfies = Array.isArray(n.meta.satisfiesControl)
                        ? (n.meta.satisfiesControl as string[])
                        : n.meta.satisfiesControl ? [n.meta.satisfiesControl as string] : [];
                      const regs = Array.isArray(n.meta.regulatedBy)
                        ? (n.meta.regulatedBy as string[])
                        : n.meta.regulatedBy ? [n.meta.regulatedBy as string] : [];
                      return (
                        <NfrRow
                          key={n.id}
                          selected={i === 0}
                          id={n.id}
                          cat={cat as "perf"|"avail"|"sec"|"comp"|"scale"}
                          catLabel={catLabel}
                          name={n.title}
                          sub=""
                          target={(n.meta.target as string) ?? "—"}
                          traces={[...satisfies, ...regs]}
                          status={n.status === "confirmed" ? "Accepted" : "Proposed"}
                        />
                      );
                    })}
                  </tbody>
                </table>
              )}

              <div
                className="am-canvas-banner"
                style={{ background: "var(--hi-bg)", color: "var(--hi)", borderColor: "#c7dccf" }}
              >
                Real data — file-backed under{" "}
                <code>wiki/processes/{doc.slug}/nfrs/</code>.
              </div>
            </main>
            {chatSidebar}
          </>
        )}

        {view === "migration" && (
          <>
            <main className="am-canvas-doc am-canvas-doc-wide">
              <div className="am-canvas-sechead">
                <h2>Migration Phases</h2>
                <span className="am-canvas-secmeta">
                  {archData.migrations.length} phase{archData.migrations.length === 1 ? "" : "s"}
                </span>
                <span style={{ flex: 1 }} />
                <button
                  type="button"
                  className="am-canvas-btn"
                  onClick={() => addElement("migration-phases", "migration phase")}
                  disabled={chatPending}
                >
                  ＋ Add Phase
                </button>
                <button
                  type="button"
                  className="am-canvas-btn am-canvas-btn-primary"
                  onClick={() => elicitWith("migration-phases")}
                  disabled={chatPending}
                >
                  ／ Elicit with solution architect
                </button>
              </div>

              {archData.migrations.length === 0 ? (
                <div className="am-input-empty">
                  No migration phases authored yet for <b>{doc.process.title}</b>.
                  Author element files under{" "}
                  <code>wiki/processes/{doc.slug}/migration-phases/</code>.
                </div>
              ) : (
                <div className="am-canvas-phase-cards">
                  {archData.migrations.map((m, i) => {
                    const phaseStatus = ((m.meta.phaseStatus as string) ?? "").toLowerCase();
                    const tone =
                      phaseStatus === "done" ? "hi"
                        : phaseStatus === "in_progress" || phaseStatus === "in-progress" ? "mid"
                        : "neu";
                    const statusLbl =
                      phaseStatus === "done" ? "Done"
                        : phaseStatus === "in_progress" || phaseStatus === "in-progress" ? "In flight"
                        : "Planned";
                    const start = (m.meta.startQuarter as string) ?? "";
                    const end = (m.meta.endQuarter as string) ?? "";
                    const window = start && end ? `${start} — ${end}` : start || end || "—";
                    const delivers = Array.isArray(m.meta.delivers) ? m.meta.delivers as string[] : [];
                    const deps = Array.isArray(m.meta.dependsOn) ? m.meta.dependsOn as string[] : [];
                    return (
                      <div key={m.id} className={`am-canvas-phase-card${i === 0 ? " am-canvas-phase-card-sel" : ""}`}>
                        <div className="am-canvas-phase-head">
                          <span className="am-canvas-phase-id">{m.id}</span>
                          <span className={`am-pill am-pill-${tone}`}>
                            <span className="am-dot" />
                            {statusLbl}
                          </span>
                        </div>
                        <div className="am-canvas-phase-name">{m.title}</div>
                        <div className="am-canvas-phase-when">{window}</div>
                        {delivers.length > 0 && (
                          <div className="am-canvas-phase-deps">
                            <b>Delivers</b>: {delivers.join(", ")}
                          </div>
                        )}
                        {deps.length > 0 && (
                          <div className="am-canvas-phase-deps">
                            <b>Depends on</b>: {deps.join(", ")}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div
                className="am-canvas-banner"
                style={{ background: "var(--hi-bg)", color: "var(--hi)", borderColor: "#c7dccf" }}
              >
                Real data — file-backed under{" "}
                <code>wiki/processes/{doc.slug}/migration-phases/</code>.
              </div>
            </main>

            <aside className="am-canvas-details">
              {archData.migrations.length === 0 ? (
                <div className="am-input-empty" style={{ marginTop: 0 }}>
                  No phase selected — author one to see its details here.
                </div>
              ) : (() => {
                const m = archData.migrations[0];
                const phaseStatus = ((m.meta.phaseStatus as string) ?? "").toLowerCase();
                const statusLbl =
                  phaseStatus === "done" ? "Done"
                    : phaseStatus === "in_progress" || phaseStatus === "in-progress" ? "In flight"
                    : "Planned";
                const start = (m.meta.startQuarter as string) ?? "";
                const end = (m.meta.endQuarter as string) ?? "";
                const delivers = Array.isArray(m.meta.delivers) ? m.meta.delivers as string[] : [];
                const deps = Array.isArray(m.meta.dependsOn) ? m.meta.dependsOn as string[] : [];
                return (
                  <>
                    <h3>Phase — {m.title}</h3>
                    <div className="am-canvas-details-id">{m.id}</div>
                    <div className="am-canvas-details-block">
                      <div className="am-canvas-details-row">
                        <span className="am-canvas-details-k">Status</span>
                        <span>
                          <span className={`am-pill am-pill-${
                            phaseStatus === "done" ? "hi"
                              : phaseStatus === "in_progress" || phaseStatus === "in-progress" ? "mid"
                              : "neu"
                          }`}>{statusLbl}</span>
                        </span>
                      </div>
                      {(start || end) && (
                        <div className="am-canvas-details-row">
                          <span className="am-canvas-details-k">Window</span>
                          <span>{start && end ? `${start} → ${end}` : start || end}</span>
                        </div>
                      )}
                      {m.meta.owner && (
                        <div className="am-canvas-details-row">
                          <span className="am-canvas-details-k">Owner</span>
                          <span>{m.meta.owner as string}</span>
                        </div>
                      )}
                    </div>

                    {delivers.length > 0 && (
                      <div className="am-canvas-details-block">
                        <h4>Delivers</h4>
                        <div className="am-canvas-traces">
                          {delivers.map((id) => (
                            <span key={id} className="am-canvas-trace">{id}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {deps.length > 0 && (
                      <div className="am-canvas-details-block">
                        <h4>Depends on</h4>
                        <div className="am-canvas-traces">
                          {deps.map((id) => (
                            <span key={id} className="am-canvas-trace">{id}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {m.blocks.length > 0 && m.blocks.map((b) => (
                      <div className="am-input-block" key={b.heading}>
                        <h4>{b.heading}</h4>
                        <div className="am-input-prose"><Markdown text={b.text} /></div>
                      </div>
                    ))}
                  </>
                );
              })()}
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
