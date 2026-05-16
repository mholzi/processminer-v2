"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Schema, ProcessDoc } from "@/lib/wiki";
import { sectionForId } from "@/lib/nav";
import { STUB_FINDINGS, type LintFinding } from "@/lib/lint";
import { checkConformance } from "@/lib/conformance";
import { stubIngest } from "@/lib/ingest";
import ElementCard from "@/components/ElementCard";
import RaciMatrix from "@/components/RaciMatrix";
import ProcessFlow from "@/components/ProcessFlow";
import OverviewPanel from "@/components/OverviewPanel";
import AgentChat, { type ChatMessage } from "@/components/AgentChat";
import ReviewPanel from "@/components/ReviewPanel";
import IngestPanel from "@/components/IngestPanel";
import CommandPalette from "@/components/CommandPalette";
import ApprovalBar from "@/components/ApprovalBar";
import ProcessSwitcher from "@/components/ProcessSwitcher";

type IngestState = {
  fileName: string;
  summary: string;
  discrepancies: LintFinding[];
};

const mid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// The signed-in SME — stamped onto review-status changes in the wiki.
const CURRENT_USER = "M. Berger";

// The one main screen. Left rail is two-level: 4 areas (As-Is / Innovation /
// Target / IT Architecture), each with its sections — views over the wiki.
// Right rail is the agent chat + the wiki-wide lint pass.
export default function ProcessDocScreen({
  schema,
  docs,
}: {
  schema: Schema;
  docs: ProcessDoc[];
}) {
  const [currentSlug, setCurrentSlug] = useState(docs[0].slug);
  const doc = docs.find((d) => d.slug === currentSlug) ?? docs[0];
  const processList = docs.map((d) => ({
    slug: d.slug,
    id: d.process.id,
    title: d.process.title,
  }));

  const [section, setSection] = useState("process-steps");
  const [dark, setDark] = useState(false);

  // Agent chat + lint state.
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [chatPending, setChatPending] = useState(false);
  const [findings, setFindings] = useState<LintFinding[] | null>(null);
  const [linting, setLinting] = useState(false);

  // Document upload + stubbed AI extraction.
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ingesting, setIngesting] = useState(false);
  const [ingestFile, setIngestFile] = useState<string | null>(null);
  const [ingestResult, setIngestResult] = useState<IngestState | null>(null);

  // ⌘K search palette + the real "saved" indicator.
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const flatSections = schema.areas.flatMap((a) => a.sections);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  }

  const activeLabel =
    schema.areas.flatMap((a) => a.sections).find((s) => s.id === section)
      ?.label ?? section;
  const sectionElements = doc.elements
    .filter((e) => e.section === section)
    .sort((a, b) => a.id.localeCompare(b.id));

  // A section can hold several element types (e.g. Compliance =
  // regulations + gaps + audit findings). Group by type, ordered as in
  // the schema; show a subheading only when more than one type is present.
  const typeGroups = Object.keys(schema.elementTypes)
    .map((t) => ({
      type: t,
      label: schema.elementTypes[t].label,
      elements: sectionElements.filter((e) => e.type === t),
    }))
    .filter((g) => g.elements.length > 0);
  const multiType = typeGroups.length > 1;
  const resolveSection = (id: string) => sectionForId(schema, id);

  // How many lint findings touch each section (a finding counts once per
  // section it reaches through its elements).
  const findingsBySection: Record<string, number> = {};
  if (findings) {
    for (const f of findings) {
      const secs = new Set(
        f.elements
          .map((id) => sectionForId(schema, id))
          .filter((s): s is string => Boolean(s)),
      );
      for (const s of secs)
        findingsBySection[s] = (findingsBySection[s] ?? 0) + 1;
    }
  }

  // The Process Assistant chat — backed by the local `claude` CLI via
  // /api/session. Each turn runs claude headless in the repo, so it can
  // invoke the skills in .claude/skills/ and read/write the wiki.
  function handleSend(text: string) {
    setMessages((m) => [...m, { id: mid(), role: "user", text }]);
    setChatPending(true);
    fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, sessionId: chatSessionId }),
    })
      .then((r) => r.json())
      .then((data: { reply?: string; sessionId?: string; error?: string }) => {
        if (data.error) {
          setMessages((m) => [
            ...m,
            { id: mid(), role: "agent", text: `⚠ ${data.error}` },
          ]);
          return;
        }
        if (data.sessionId) setChatSessionId(data.sessionId);
        setMessages((m) => [
          ...m,
          { id: mid(), role: "agent", text: data.reply || "(no reply)" },
        ]);
        // a skill may have written wiki files this turn — re-read the doc view
        router.refresh();
      })
      .catch((e: unknown) => {
        setMessages((m) => [
          ...m,
          {
            id: mid(),
            role: "agent",
            text: `⚠ ${e instanceof Error ? e.message : "Request failed"}`,
          },
        ]);
      })
      .finally(() => setChatPending(false));
  }

  function runLint() {
    if (linting) return;
    setLinting(true);
    setChatOpen(true);
    setTimeout(() => {
      const conformance = checkConformance(doc.elements, schema);
      const found = [...conformance, ...STUB_FINDINGS];
      const c = conformance.length;
      const d = STUB_FINDINGS.filter((f) => f.kind === "discrepancy").length;
      const q = STUB_FINDINGS.length - d;
      setFindings(found);
      setLinting(false);
      setSection("__review");
      setMessages((m) => [
        ...m,
        {
          id: mid(),
          role: "agent",
          text: `Lint pass complete — I checked all ${doc.elements.length} elements across every section.\n\n• ${c} template-conformance issues — elements whose blocks don't match their schema template (this check is exact)\n• ${d} cross-section discrepancies\n• ${q} clarifying questions\n\nThey're in the Review panel — click any element ID to jump straight to it.`,
        },
      ]);
    }, 1300);
  }

  // Switch the documented process. Lint/ingest results are process-specific,
  // so they are cleared; the chat (a general assistant) is kept.
  function switchProcess(slug: string) {
    if (slug === currentSlug) return;
    setCurrentSlug(slug);
    setSection("process-steps");
    setFindings(null);
    setIngestResult(null);
    setIngestFile(null);
  }

  // New process — opens the chat and triggers the new-process skill.
  function createProcess() {
    setChatOpen(true);
    handleSend("I want to create a new process.");
  }

  // Document upload — pick a file, then run a stubbed AI extraction that
  // summarises it and diffs it against the wiki.
  function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setIngestFile(file.name);
    setIngesting(true);
    setIngestResult(null);
    setChatOpen(true);
    setSection("__ingest");
    setTimeout(() => {
      const result = stubIngest(file.name);
      setIngestResult({ fileName: file.name, ...result });
      setIngesting(false);
      setMessages((m) => [
        ...m,
        {
          id: mid(),
          role: "agent",
          text: `Ingested “${file.name}”. I extracted the document and diffed it against the COB-003 wiki — ${result.discrepancies.length} discrepancies need clarifying. The summary and the discrepancy list are in the Document panel.`,
        },
      ]);
    }, 1600);
  }

  // Deep dive — the hook that will trigger the QER brainstorming skill.
  // Stubbed for now: opens the chat and frames a QER session on the target.
  function deepDive(target: {
    id: string;
    title: string;
    kind: "element" | "finding";
  }) {
    setChatOpen(true);
    setMessages((m) => [
      ...m,
      { id: mid(), role: "user", text: `Deep dive — ${target.id}: ${target.title}` },
    ]);
    setTimeout(() => {
      const intro =
        target.kind === "finding"
          ? `Starting a QER deep dive on finding ${target.id} (“${target.title}”). The QER agent would now run an interactive brainstorming session — working through the discrepancy with you, asking targeted clarifying questions until the wiki is consistent again.`
          : `Starting a QER deep dive on ${target.id} (“${target.title}”). The QER agent would now run an interactive brainstorming session on this element — probing for edge cases, exceptions and tacit detail to deepen the documentation.`;
      setMessages((m) => [
        ...m,
        {
          id: mid(),
          role: "agent",
          text: `${intro}\n\nThe QER skill is stubbed in this build — wiring it is the next slice.`,
        },
      ]);
    }, 700);
  }

  function goToElement(id: string) {
    const sec = sectionForId(schema, id);
    if (!sec) return;
    setSection(sec);
    setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  }

  return (
    <>
      <header className="topbar">
        <ProcessSwitcher
          processes={processList}
          currentSlug={currentSlug}
          onSelect={switchProcess}
          onCreate={createProcess}
        />
        <span className="spacer" />
        <span
          className={`save${lastSaved ? " just-saved" : ""}`}
          key={lastSaved ? lastSaved.getTime() : "idle"}
        >
          <span className="dot" />{" "}
          {lastSaved
            ? `Saved ${lastSaved.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : "Auto-save on"}
        </span>
        <span className="sme">{CURRENT_USER} · Subject-Matter Expert</span>
        <button
          className="lint-btn"
          onClick={() => setPaletteOpen(true)}
          title="Search (⌘K)"
        >
          ⌕ Search <kbd className="kbd">⌘K</kbd>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.md,.rtf"
          style={{ display: "none" }}
          onChange={onFileChosen}
        />
        <button
          className="lint-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={ingesting}
        >
          {ingesting ? "Extracting…" : "⬆ Upload document"}
        </button>
        {ingestResult && (
          <button
            className="lint-btn"
            onClick={() => setSection("__ingest")}
          >
            Document
          </button>
        )}
        <button
          className="lint-btn"
          onClick={() => (findings ? setSection("__review") : runLint())}
          disabled={linting}
        >
          {linting
            ? "Linting…"
            : findings
              ? `Review · ${findings.length}`
              : "⊛ Run lint"}
        </button>
        <button className="theme-btn" onClick={toggleTheme}>
          {dark ? "light" : "dark"}
        </button>
      </header>

      <div className={`shell${chatOpen ? " chat-open" : ""}`}>
        <nav className="rail rail-l">
          {schema.areas.map((area) => (
            <div className="nav-area" key={area.id}>
              <div className="nav-area-label">{area.label}</div>
              {area.sections.map((s) => {
                const count =
                  s.id === "overview"
                    ? null
                    : doc.elements.filter((e) => e.section === s.id).length;
                const flag = findingsBySection[s.id];
                return (
                  <button
                    key={s.id}
                    className={`nav-item${s.id === section ? " active" : ""}`}
                    onClick={() => setSection(s.id)}
                  >
                    <span className="nav-label">{s.label}</span>
                    <span className="nav-meta">
                      {flag ? (
                        <span
                          className="nav-flag"
                          title={`${flag} lint finding${flag === 1 ? "" : "s"}`}
                        >
                          !
                        </span>
                      ) : null}
                      {count !== null && (
                        <span className="count">{count}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <main className="canvas">
          {section === "overview" ? (
            <>
              <div className="canvas-head">
                <h1>Overview</h1>
                <div className="sub">
                  {doc.process.id} — {doc.process.title}
                </div>
              </div>
              <OverviewPanel
                process={doc.process}
                elements={doc.elements}
                onNavigate={setSection}
                resolveSection={resolveSection}
              />
            </>
          ) : section === "__review" ? (
            <>
              <div className="canvas-head">
                <h1>Lint Review</h1>
                <div className="sub">
                  Consistency findings across the whole COB-003 wiki —
                  clarifying questions and discrepancies for the SME to resolve.
                </div>
              </div>
              {findings && (
                <ReviewPanel
                  findings={findings}
                  onGoToElement={goToElement}
                  onDeepDive={(f) =>
                    deepDive({ id: f.id, title: f.title, kind: "finding" })
                  }
                  onRerun={runLint}
                  linting={linting}
                />
              )}
            </>
          ) : section === "__ingest" ? (
            <>
              <div className="canvas-head">
                <h1>Document Ingest</h1>
                <div className="sub">
                  An uploaded document, AI-extracted and diffed against the
                  COB-003 wiki — resolve the discrepancies it raises.
                </div>
              </div>
              {ingesting ? (
                <div className="ingest-processing">
                  Extracting “{ingestFile}” and diffing it against the wiki…
                </div>
              ) : ingestResult ? (
                <IngestPanel
                  fileName={ingestResult.fileName}
                  summary={ingestResult.summary}
                  discrepancies={ingestResult.discrepancies}
                  onGoToElement={goToElement}
                  onDeepDive={(f) =>
                    deepDive({ id: f.id, title: f.title, kind: "finding" })
                  }
                />
              ) : (
                <div className="empty-state">
                  <p>No document uploaded yet.</p>
                  <p className="empty-hint">
                    Use “Upload document” in the top bar to ingest one.
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="canvas-head">
                <h1>{activeLabel}</h1>
                <div className="sub">
                  {sectionElements.length}{" "}
                  {sectionElements.length === 1 ? "element" : "elements"} — each
                  one: view, let the AI work on it, or edit it yourself.
                </div>
                {sectionElements.length > 0 && (
                  <ApprovalBar elements={sectionElements} />
                )}
              </div>
              {section === "roles" && (
                <RaciMatrix
                  steps={doc.elements.filter((e) => e.type === "process-step")}
                  roles={doc.elements.filter((e) => e.type === "role")}
                  onNavigate={setSection}
                />
              )}
              {section === "process-steps" && (
                <ProcessFlow
                  steps={doc.elements.filter((e) => e.type === "process-step")}
                />
              )}
              {sectionElements.length === 0 ? (
                <div className="empty-state">
                  <p>No elements in “{activeLabel}” yet.</p>
                  <p className="empty-hint">
                    Let the AI suggest a draft — or capture the first element
                    yourself. (Slice 2)
                  </p>
                </div>
              ) : multiType ? (
                typeGroups.map((g) => (
                  <section key={g.type}>
                    <h2 className="type-group-head">{g.label}</h2>
                    {g.elements.map((el) => (
                      <ElementCard
                        key={el.id}
                        page={el}
                        slug={doc.slug}
                        userName={CURRENT_USER}
                        typeLabel={
                          schema.elementTypes[el.type]?.label ?? el.type
                        }
                        template={schema.elementTypes[el.type]?.template}
                        onNavigate={setSection}
                        onDeepDive={(id, title) =>
                          deepDive({ id, title, kind: "element" })
                        }
                        onSaved={() => setLastSaved(new Date())}
                        resolveSection={resolveSection}
                      />
                    ))}
                  </section>
                ))
              ) : (
                sectionElements.map((el) => (
                  <ElementCard
                    key={el.id}
                    page={el}
                    slug={doc.slug}
                    userName={CURRENT_USER}
                    typeLabel={schema.elementTypes[el.type]?.label ?? el.type}
                    template={schema.elementTypes[el.type]?.template}
                    onNavigate={setSection}
                    onDeepDive={(id, title) =>
                      deepDive({ id, title, kind: "element" })
                    }
                    onSaved={() => setLastSaved(new Date())}
                    resolveSection={resolveSection}
                  />
                ))
              )}
            </>
          )}

          <p className="slice-note">
            Slice 1 — UI shell + file-backed Karpathy wiki, four areas. Agent
            chat and lint are stubbed; the model is wired in slice 2.
          </p>
        </main>

        <AgentChat
          open={chatOpen}
          onToggle={() => setChatOpen((v) => !v)}
          messages={messages}
          onSend={handleSend}
          pending={chatPending}
          onRunLint={runLint}
          linting={linting}
          findingCount={findings ? findings.length : null}
        />
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        elements={doc.elements}
        sections={flatSections}
        onPickElement={goToElement}
        onPickSection={setSection}
      />
    </>
  );
}
