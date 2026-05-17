"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Schema, ProcessDoc } from "@/lib/wiki";
import { sectionForId } from "@/lib/nav";
import ElementCard from "@/components/ElementCard";
import RaciMatrix from "@/components/RaciMatrix";
import ProcessFlow from "@/components/ProcessFlow";
import OverviewPanel from "@/components/OverviewPanel";
import AgentChat, { type ChatMessage } from "@/components/AgentChat";
import ReviewPanel from "@/components/ReviewPanel";
import TriagePanel from "@/components/TriagePanel";
import UploadModal from "@/components/UploadModal";
import CommandPalette from "@/components/CommandPalette";
import ApprovalBar from "@/components/ApprovalBar";
import ProcessSwitcher from "@/components/ProcessSwitcher";

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
  // Slugs seen so far — to detect a process a skill just scaffolded.
  const knownSlugs = useRef(new Set(docs.map((d) => d.slug)));
  // Last foundational-run cursor the canvas followed (`slug:cursor`).
  const followedRef = useRef<string | null>(null);

  const [section, setSection] = useState("process-steps");
  const [dark, setDark] = useState(false);

  // Agent chat + lint state.
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [chatPending, setChatPending] = useState(false);
  // Live activity line while a turn runs — updated from the SSE stream.
  const [chatActivity, setChatActivity] = useState<string | null>(null);
  const [linting, setLinting] = useState(false);
  // Findings come from the last run-lint pass — wiki/processes/<slug>/lint.json,
  // read server-side into doc.lint. Re-running the skill refreshes it.
  const findings = doc.lint?.findings ?? null;

  // Document upload — the modal saves to raw-sources/, then the chat runs
  // the document-ingest skill on the saved file.
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

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

  // When a skill scaffolds a new process, the chat turn's router.refresh()
  // brings it into `docs` — switch the app to it automatically so the user
  // lands on the process they just created.
  useEffect(() => {
    const fresh = docs.find((d) => !knownSlugs.current.has(d.slug));
    knownSlugs.current = new Set(docs.map((d) => d.slug));
    if (fresh) {
      setCurrentSlug(fresh.slug);
      setSection("overview");
    }
  }, [docs]);

  // While a foundational run is active, the canvas follows the skill's lead —
  // review-state.json advances each turn, and the app opens the section of
  // the element now under review.
  useEffect(() => {
    const rs = doc.reviewState;
    if (!rs || rs.done) return;
    const key = `${doc.slug}:${rs.cursor}`;
    if (followedRef.current === key) return;
    followedRef.current = key;
    const id = rs.queue[rs.cursor];
    if (!id) return;
    if (id === doc.process.id) {
      setSection("overview");
      return;
    }
    const sec = sectionForId(schema, id);
    if (sec) {
      setSection(sec);
      setTimeout(() => {
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 80);
    }
  }, [doc, schema]);

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
  // invoke the skills in .claude/skills/ and read/write the wiki. The route
  // streams Server-Sent Events: `progress` lines drive the live activity
  // line, `done` carries the final reply, `error` carries a failure.
  function handleSend(text: string, opts?: { onComplete?: () => void }) {
    setMessages((m) => [...m, { id: mid(), role: "user", text }]);
    setChatPending(true);
    setChatActivity(null);

    type SessionEvent =
      | { type: "progress"; text: string }
      | { type: "done"; reply?: string; sessionId?: string; isError?: boolean }
      | { type: "error"; error: string; sessionId?: string };

    fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, sessionId: chatSessionId }),
    })
      .then(async (res) => {
        if (!res.body) throw new Error("Keine Antwort vom Server.");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        const apply = (evt: SessionEvent) => {
          if (evt.type === "progress") {
            setChatActivity(evt.text);
          } else if (evt.type === "done") {
            if (evt.sessionId) setChatSessionId(evt.sessionId);
            setMessages((m) => [
              ...m,
              { id: mid(), role: "agent", text: evt.reply || "(no reply)" },
            ]);
            // a skill may have written wiki files — re-read the doc view
            router.refresh();
          } else if (evt.type === "error") {
            if (evt.sessionId) setChatSessionId(evt.sessionId);
            setMessages((m) => [
              ...m,
              { id: mid(), role: "agent", text: `⚠ ${evt.error}` },
            ]);
          }
        };

        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let sep: number;
          while ((sep = buf.indexOf("\n\n")) !== -1) {
            const frame = buf.slice(0, sep);
            buf = buf.slice(sep + 2);
            const line = frame.startsWith("data:")
              ? frame.slice(5).trim()
              : frame.trim();
            if (!line) continue;
            try {
              apply(JSON.parse(line) as SessionEvent);
            } catch {
              /* partial / non-JSON frame — ignore */
            }
          }
        }
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
      .finally(() => {
        setChatPending(false);
        setChatActivity(null);
        opts?.onComplete?.();
      });
  }

  // Restart the assistant session — clear the transcript and drop the claude
  // session id, so the next message starts a fresh `claude` session.
  function restartSession() {
    if (chatPending) return;
    setMessages([]);
    setChatSessionId(null);
  }

  // Lint — invoke the run-lint skill via the chat. It checks conformance,
  // sweeps the wiki from all five perspectives, writes lint.json and re-opens
  // implicated approvals. router.refresh() then brings the findings into
  // doc.lint, which the Review panel renders.
  function runLint() {
    if (linting || chatPending) return;
    setChatOpen(true);
    setLinting(true);
    setSection("__review");
    handleSend(
      `Run the run-lint skill on the process with slug "${currentSlug}".`,
      { onComplete: () => setLinting(false) },
    );
  }

  // Switch the documented process. A different process gets a fresh
  // assistant session — drop the claude session id and the transcript — and
  // a deterministic welcome message naming the process now loaded. Blocked
  // while a turn is running, so an in-flight reply can't land in the new
  // process's transcript.
  function switchProcess(slug: string) {
    if (slug === currentSlug || chatPending) return;
    const next = docs.find((d) => d.slug === slug);
    setCurrentSlug(slug);
    setSection("process-steps");
    setChatSessionId(null);
    setMessages(
      next
        ? [
            {
              id: mid(),
              role: "agent",
              text: `Loaded **${next.process.title}** (${next.process.id}). I've started a fresh assistant session for this process — ask me to document it, run a lint pass, or work on any element.`,
            },
          ]
        : [],
    );
  }

  // New process — opens the chat and triggers the new-process skill.
  function createProcess() {
    setChatOpen(true);
    handleSend("I want to create a new process.");
  }

  // Document upload — once the modal has saved the file into raw-sources/,
  // open the chat and run the document-ingest skill on it.
  function onUploaded(path: string) {
    setUploadModalOpen(false);
    setChatOpen(true);
    handleSend(
      `A document has been uploaded to ${path}. Run the document-ingest skill on it for the "${doc.process.title}" process.`,
      { onComplete: () => setSection("__triage") },
    );
  }

  // Foundational run — invoke the foundational-run skill via the chat. It
  // builds or resumes the review queue; the canvas then follows the cursor.
  function runFoundational() {
    if (chatPending) return;
    setChatOpen(true);
    handleSend(
      `Run the foundational-run skill on the process with slug "${currentSlug}".`,
    );
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
        <button
          className="lint-btn"
          onClick={() => setUploadModalOpen(true)}
        >
          ⬆ Upload document
        </button>
        {(doc.ingest || doc.reviewState) && (
          <button className="lint-btn" onClick={() => setSection("__triage")}>
            {doc.reviewState && !doc.reviewState.done
              ? `Run · ${doc.reviewState.cursor} / ${doc.reviewState.total}`
              : "Triage"}
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
                slug={doc.slug}
                userName={CURRENT_USER}
                onNavigate={setSection}
                resolveSection={resolveSection}
                onSaved={() => setLastSaved(new Date())}
              />
            </>
          ) : section === "__review" ? (
            <>
              <div className="canvas-head">
                <h1>Lint Review</h1>
                <div className="sub">
                  Consistency findings across the {doc.process.title} wiki —
                  conformance issues, discrepancies and clarifying questions
                  for the SME to resolve.
                </div>
              </div>
              {doc.lint ? (
                <ReviewPanel
                  report={doc.lint}
                  onGoToElement={goToElement}
                  onDeepDive={(f) =>
                    deepDive({ id: f.id, title: f.title, kind: "finding" })
                  }
                  onRerun={runLint}
                  linting={linting}
                />
              ) : linting ? (
                <div className="empty-state">
                  <p>Running the lint pass…</p>
                  <p className="empty-hint">
                    The run-lint skill is sweeping the wiki — watch the
                    assistant chat for live progress.
                  </p>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No lint pass has been run for this process yet.</p>
                  <p className="empty-hint">
                    Use “⊛ Run lint” in the top bar to run one.
                  </p>
                </div>
              )}
            </>
          ) : section === "__triage" ? (
            <>
              <div className="canvas-head">
                <h1>Triage</h1>
                <div className="sub">
                  What the last ingest produced for {doc.process.title} — and
                  the launch point for the foundational run.
                </div>
              </div>
              {doc.ingest || doc.reviewState ? (
                <TriagePanel
                  doc={doc}
                  schema={schema}
                  onStartRun={runFoundational}
                  onGoToElement={goToElement}
                />
              ) : (
                <div className="empty-state">
                  <p>No document has been ingested for this process yet.</p>
                  <p className="empty-hint">
                    Use “⬆ Upload document” in the top bar to ingest one.
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
          activity={chatActivity}
          onRestart={restartSession}
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

      <UploadModal
        open={uploadModalOpen}
        slug={currentSlug}
        onClose={() => setUploadModalOpen(false)}
        onUploaded={onUploaded}
      />
    </>
  );
}
