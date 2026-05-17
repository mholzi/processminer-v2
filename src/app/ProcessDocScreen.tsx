"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Schema, ProcessDoc } from "@/lib/wiki";
import { isSourcedType } from "@/lib/element-types";
import { sectionForId } from "@/lib/nav";
import ElementCard from "@/components/ElementCard";
import RaciMatrix from "@/components/RaciMatrix";
import ProcessFlow from "@/components/ProcessFlow";
import OverviewPanel from "@/components/OverviewPanel";
import AgentChat, { type ChatMessage } from "@/components/AgentChat";
import ReviewPanel from "@/components/ReviewPanel";
import TriagePanel from "@/components/TriagePanel";
import SummaryPanel from "@/components/SummaryPanel";
import UploadModal from "@/components/UploadModal";
import CommandPalette from "@/components/CommandPalette";
import ApprovalBar from "@/components/ApprovalBar";
import ProcessSwitcher from "@/components/ProcessSwitcher";
import Markdown from "@/components/Markdown";

const mid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// The signed-in SME — stamped onto review-status changes in the wiki.
const CURRENT_USER = "M. Berger";

// The two non-interactive web-sourcing skills, and the sections each fills.
const INNOVATION_SECTIONS = [
  "market-trends",
  "competitor-innovation",
  "innovation-ideas",
];
const CX_SECTIONS = ["competitor-cx", "cx-benchmarks"];
function sectionSourcingKind(section: string): "innovation" | "cx" | null {
  if (INNOVATION_SECTIONS.includes(section)) return "innovation";
  if (CX_SECTIONS.includes(section)) return "cx";
  return null;
}

// Process-scope handover. Prepended to the first message of a scoped chat
// session, this tells the headless `claude` CLI which process the SME has
// open and locks the whole session to it — the CLI has no other way to know.
// Sent once per session; later turns inherit it via `--resume`. The
// + New-process flow is cross-process by nature and opts out (unscoped).
function scopePreamble(d: ProcessDoc): string {
  const { id, title } = d.process;
  return [
    "[SESSION SCOPE — applies to this whole conversation]",
    `You are the Process Assistant for exactly one process: ${title} (${id}).`,
    `Its wiki content is wiki/processes/${d.slug}/; its source documents`,
    `are under raw-sources/${d.slug}/.`,
    "",
    "Rules, in force for every turn of this session:",
    `1. Only consider, discuss and change content belonging to ${id}.`,
    "2. Never read or modify another process under wiki/processes/ or",
    "   raw-sources/, and never change anything else in the repository.",
    "3. If asked to do anything else — work on another process, change",
    "   application code, or anything unrelated to documenting this",
    "   process — decline: briefly say you are scoped to this process and",
    "   cannot help with that, in the language the SME is using.",
    "4. schema/, scripts/ and .claude/skills/ are shared framework the",
    "   skills need — reading and running those is allowed and expected.",
    "",
    "The SME's request follows below.",
    "",
    "---",
    "",
  ].join("\n");
}

// A fresh page load has no live chat — but a foundational run may still be
// mid-flight on disk (review-state.json). Seed the chat with a deterministic
// "welcome back" so the SME sees the outstanding work and where to resume it.
function resumeMessage(d: ProcessDoc): ChatMessage | null {
  const rs = d.reviewState;
  if (!rs || rs.done) return null;
  const currentId = rs.queue[rs.cursor];
  const current =
    currentId === d.process.id
      ? d.process
      : d.elements.find((e) => e.id === currentId);
  const next = current ? `**${current.id}** — ${current.title}` : currentId;
  return {
    id: mid(),
    role: "agent",
    text:
      `Welcome back. The **foundational run** for **${d.process.title}** is ` +
      `paused at **item ${rs.cursor + 1} of ${rs.total}** — next up is ${next}.` +
      `\n\nOpen **Triage** in the top bar and press **Resume** to continue the ` +
      `challenged walk through the As-Is elements.`,
  };
}

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
  // If a foundational run is in progress on any process, the app opens on it
  // (most-recently-touched first) so a reload never strands outstanding work —
  // it lands on Triage, opens the chat and seeds a resume prompt.
  const openingRunDoc =
    docs
      .filter((d) => d.reviewState && !d.reviewState.done)
      .sort((a, b) =>
        b.reviewState!.updatedAt.localeCompare(a.reviewState!.updatedAt),
      )[0] ?? null;

  const [currentSlug, setCurrentSlug] = useState(
    openingRunDoc ? openingRunDoc.slug : docs[0].slug,
  );
  const doc = docs.find((d) => d.slug === currentSlug) ?? docs[0];
  // The element the foundational run's cursor is on, if a run is active —
  // threaded into the section views as a "you are here" highlight.
  const currentRunId =
    doc.reviewState && !doc.reviewState.done
      ? (doc.reviewState.queue[doc.reviewState.cursor] ?? null)
      : null;

  // `affects` on an exception is derived, not stored: every process-step
  // whose `transitions` exit to an exception affects it. One source of truth.
  const exceptionIds = new Set(
    doc.elements.filter((e) => e.type === "exception").map((e) => e.id),
  );
  const affectsByException: Record<string, string[]> = {};
  for (const el of doc.elements) {
    if (el.type !== "process-step") continue;
    const raw = el.meta.transitions;
    const list = !raw ? [] : Array.isArray(raw) ? raw : [raw];
    for (const entry of list) {
      const to = entry.split("|")[0]?.trim();
      if (to && exceptionIds.has(to))
        (affectsByException[to] ??= []).push(el.id);
    }
  }
  // Which controls cover each step — the process flow flags uncontrolled steps.
  const controlsByStep: Record<string, string[]> = {};
  for (const el of doc.elements) {
    if (el.type !== "control") continue;
    const step = el.meta.step;
    if (typeof step === "string" && step)
      (controlsByStep[step] ??= []).push(el.id);
  }

  const processList = docs.map((d) => ({
    slug: d.slug,
    id: d.process.id,
    title: d.process.title,
  }));
  // Slugs seen so far — to detect a process a skill just scaffolded.
  const knownSlugs = useRef(new Set(docs.map((d) => d.slug)));
  // Last foundational-run cursor the canvas followed (`slug:cursor`). Seeded
  // to the opening run's cursor so the mount-time follow doesn't yank the
  // canvas off the Triage panel — it only follows once the cursor advances.
  const followedRef = useRef<string | null>(
    openingRunDoc
      ? `${openingRunDoc.slug}:${openingRunDoc.reviewState!.cursor}`
      : null,
  );

  // With a run in progress, open straight on Triage so Resume is one click.
  const [section, setSection] = useState(
    openingRunDoc ? "__triage" : "process-steps",
  );
  const [dark, setDark] = useState(false);
  // Left-nav area groups the user has collapsed (by area id).
  const [collapsedAreas, setCollapsedAreas] = useState<Set<string>>(new Set());
  // The whole left rail collapsed to a thin strip, hidden off to the left.
  const [railCollapsed, setRailCollapsed] = useState(false);

  function toggleArea(id: string) {
    setCollapsedAreas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Agent chat + lint state.
  const router = useRouter();
  // Outstanding work opens the chat with a seeded resume prompt.
  const [chatOpen, setChatOpen] = useState(Boolean(openingRunDoc));
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const m = openingRunDoc ? resumeMessage(openingRunDoc) : null;
    return m ? [m] : [];
  });
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

  // A non-interactive web-sourcing run (source-innovation / source-cx). It
  // runs outside the chat — a section banner shows progress, a dismissable
  // notice shows the result.
  const [sourcing, setSourcing] = useState<{
    kind: "innovation" | "cx";
    status: "running" | "done" | "error";
    text?: string;
  } | null>(null);

  // Per-area executive summary — viewed from the nav area heading, generated
  // silently by the area-summary skill. `summaryGen` tracks an active run.
  const [summaryGen, setSummaryGen] = useState<{
    area: string;
    status: "generating" | "error";
  } | null>(null);

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
      // A freshly-scaffolded process gets a fresh, scoped assistant session —
      // drop the session id so the next turn hands the new process over.
      setChatSessionId(null);
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
  // Which web-sourcing skill fills this section, and whether a run of that
  // kind is in progress right now.
  const sectionKind = sectionSourcingKind(section);
  const sourcingHere =
    sourcing?.status === "running" &&
    sectionKind !== null &&
    sourcing.kind === sectionKind;
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
  function handleSend(
    text: string,
    opts?: { onComplete?: () => void; unscoped?: boolean },
  ) {
    setMessages((m) => [...m, { id: mid(), role: "user", text }]);
    setChatPending(true);
    setChatActivity(null);

    // The + New-process flow is inherently cross-process, so it runs in its
    // own fresh, unscoped session — otherwise the scope lock would make the
    // assistant decline its own scaffolding request.
    const unscoped = opts?.unscoped === true;
    const sessionId = unscoped ? null : chatSessionId;
    // First turn of a scoped session: hand the open process to the CLI and
    // lock the session to it. Later turns inherit it via --resume.
    const wireText =
      !unscoped && sessionId === null ? scopePreamble(doc) + text : text;

    type SessionEvent =
      | { type: "progress"; text: string }
      | { type: "done"; reply?: string; sessionId?: string; isError?: boolean }
      | { type: "error"; error: string; sessionId?: string };

    fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: wireText, sessionId }),
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
    setChatSessionId(null);
    // A process mid-foundational-run opens on Triage with the resume prompt,
    // exactly as a reload would; otherwise a fresh welcome.
    const resume = next ? resumeMessage(next) : null;
    setSection(resume ? "__triage" : "process-steps");
    setMessages(
      resume
        ? [resume]
        : next
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
    handleSend("I want to create a new process.", { unscoped: true });
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
      `Run the foundational-run skill on the process with slug "${currentSlug}". ` +
        `The SME present in this session is ${CURRENT_USER} — stamp approvals with that name.`,
    );
  }

  // Resolve conflicts — invoke the interactive conflict-resolution skill in
  // the chat, scoped to this process. It walks each ingest conflict with the
  // SME, document version versus wiki version, and clears them when done.
  function resolveConflicts() {
    if (chatPending) return;
    setChatOpen(true);
    handleSend(
      `Run the conflict-resolution skill on the process with slug "${currentSlug}".`,
    );
  }

  // Web-sourcing — run source-innovation / source-cx fully autonomously.
  // Unlike a chat turn this does not touch the chat transcript or session: it
  // runs in its own fresh `claude` session, the affected sections show a
  // Add entry — invoke the interactive add-entry skill in the chat, scoped to
  // the section the SME is viewing. It asks what to add, researches, drafts,
  // and writes the element on approval.
  function addEntry() {
    if (chatPending) return;
    setChatOpen(true);
    handleSend(
      `Run the add-entry skill for the "${section}" section of the process with slug "${currentSlug}".`,
    );
  }

  // Generate an area's executive summary — runs the area-summary skill
  // silently (its own claude session, outside the chat); the panel shows the
  // result on completion.
  function generateAreaSummary(target: string) {
    if (summaryGen?.status === "generating") return;
    setSummaryGen({ area: target, status: "generating" });
    fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Run the area-summary skill for the "${target}" area of the process with slug "${currentSlug}".`,
        sessionId: null,
      }),
    })
      .then(async (res) => {
        if (!res.body) throw new Error("No response from the server.");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let ok: boolean | null = null;
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
              const evt = JSON.parse(line) as { type: string };
              if (evt.type === "done") ok = true;
              else if (evt.type === "error") ok = false;
            } catch {
              /* partial frame */
            }
          }
        }
        if (ok === false) {
          setSummaryGen({ area: target, status: "error" });
        } else {
          setSummaryGen(null);
          router.refresh();
        }
      })
      .catch(() => setSummaryGen({ area: target, status: "error" }));
  }

  // progress banner, and it ends with a dismissable notice.
  function runSourcing(kind: "innovation" | "cx") {
    if (sourcing?.status === "running") return;
    setSourcing({ kind, status: "running" });
    const skill = kind === "innovation" ? "source-innovation" : "source-cx";
    fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Run the ${skill} skill on the process with slug "${currentSlug}".`,
        sessionId: null,
      }),
    })
      .then(async (res) => {
        if (!res.body) throw new Error("No response from the server.");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let final: { ok: boolean; text: string } | null = null;
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
              const evt = JSON.parse(line) as {
                type: string;
                reply?: string;
                error?: string;
              };
              if (evt.type === "done")
                final = { ok: true, text: evt.reply || "Sourcing complete." };
              else if (evt.type === "error")
                final = { ok: false, text: evt.error || "Sourcing failed." };
            } catch {
              /* partial / non-JSON frame */
            }
          }
        }
        if (final && !final.ok) {
          setSourcing({ kind, status: "error", text: final.text });
        } else {
          setSourcing({
            kind,
            status: "done",
            text: `Sourcing of ${
              kind === "innovation" ? "Innovation" : "Client Experience"
            } items completed.`,
          });
          router.refresh();
        }
      })
      .catch((e: unknown) => {
        setSourcing({
          kind,
          status: "error",
          text: e instanceof Error ? e.message : "Sourcing failed.",
        });
      });
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
    // A fixed timeout races the new section's render — the element may not
    // exist yet, or its position shifts as siblings lay out. Retry across
    // animation frames until the element is in the DOM, then scroll.
    let tries = 0;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (tries++ < 30) {
        requestAnimationFrame(tryScroll);
      }
    };
    requestAnimationFrame(tryScroll);
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

      <div
        className={`shell${chatOpen ? " chat-open" : ""}${
          railCollapsed ? " rail-collapsed" : ""
        }`}
      >
        <nav className={`rail rail-l${railCollapsed ? " collapsed" : ""}`}>
          <button
            className="rail-toggle"
            onClick={() => setRailCollapsed((v) => !v)}
            aria-expanded={!railCollapsed}
            aria-label={railCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={railCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {railCollapsed ? "»" : "«"}
          </button>
          {!railCollapsed &&
            schema.areas.map((area) => {
            const collapsed = collapsedAreas.has(area.id);
            // A web-sourcing run spins against the area heading it fills.
            const areaSourcing =
              sourcing?.status === "running" &&
              ((sourcing.kind === "innovation" && area.id === "innovation") ||
                (sourcing.kind === "cx" &&
                  area.id === "client-experience"));
            return (
            <div className="nav-area" key={area.id}>
              <div className="nav-area-head">
                <button
                  className="nav-area-collapse"
                  onClick={() => toggleArea(area.id)}
                  aria-expanded={!collapsed}
                  aria-label={collapsed ? "Expand area" : "Collapse area"}
                >
                  <span
                    className={`nav-area-chevron${collapsed ? " collapsed" : ""}`}
                  >
                    ▾
                  </span>
                </button>
                <button
                  className={`nav-area-label${
                    section === `__area:${area.id}` ? " active" : ""
                  }`}
                  onClick={() => setSection(`__area:${area.id}`)}
                  title={`Executive summary of ${area.label}`}
                >
                  {area.label}
                  {areaSourcing && (
                    <span
                      className="nav-area-spinner"
                      title="Sourcing from the web…"
                    />
                  )}
                </button>
              </div>
              {!collapsed &&
              area.sections.map((s) => {
                const isOverview = s.id === "overview";
                const els = isOverview
                  ? []
                  : doc.elements.filter((e) => e.section === s.id);
                const count = isOverview ? null : els.length;
                // An element is "reviewed" when approved — or, for a
                // web-sourced type, when triaged relevant or disregarded.
                const reviewed = els.filter((e) =>
                  isSourcedType(e.type)
                    ? ["relevant", "disregarded"].includes(
                        String(e.meta.relevance ?? ""),
                      )
                    : String(e.meta.approval ?? "in-progress") === "approved",
                ).length;
                // Section review state: empty / gaps / approved.
                let state: "empty" | "gaps" | "approved";
                let dotTitle = "";
                if (isOverview) {
                  state =
                    String(doc.process.meta.approval ?? "in-progress") ===
                    "approved"
                      ? "approved"
                      : "gaps";
                  dotTitle =
                    state === "approved"
                      ? "Overview approved"
                      : "Overview not yet approved";
                } else if (els.length === 0) {
                  state = "empty";
                } else if (reviewed === els.length) {
                  state = "approved";
                  dotTitle = `All ${els.length} element(s) reviewed`;
                } else {
                  state = "gaps";
                  dotTitle = `${reviewed} of ${els.length} reviewed`;
                }
                const flag = findingsBySection[s.id];
                return (
                  <button
                    key={s.id}
                    className={`nav-item${s.id === section ? " active" : ""}${
                      state === "empty" ? " nav-empty" : ""
                    }`}
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
                      {state !== "empty" && (
                        <span
                          className={`nav-dot nav-dot-${state}`}
                          title={dotTitle}
                        />
                      )}
                      {count !== null && (
                        <span className="count">{count}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
            );
          })}
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
                  onResolveConflicts={resolveConflicts}
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
          ) : section.startsWith("__area:") ? (
            (() => {
              const areaId = section.slice("__area:".length);
              const area = schema.areas.find((a) => a.id === areaId);
              return (
                <>
                  <div className="canvas-head">
                    <h1>{area?.label ?? areaId}</h1>
                    <div className="sub">
                      Executive summary — an Amazon-style memo across the{" "}
                      {area?.label ?? areaId} area.
                    </div>
                  </div>
                  <SummaryPanel
                    summary={doc.summaries?.[areaId]}
                    status={
                      summaryGen?.area === areaId
                        ? summaryGen.status
                        : "idle"
                    }
                    slug={currentSlug}
                    area={areaId}
                    onGenerate={() => generateAreaSummary(areaId)}
                  />
                </>
              );
            })()
          ) : (
            <>
              <div className="canvas-head">
                <h1>{activeLabel}</h1>
                <button
                  className="add-entry-btn"
                  onClick={addEntry}
                  disabled={chatPending}
                  title="Add an entry — the assistant drafts it with you"
                >
                  + Add entry
                </button>
                <div className="sub">
                  {sectionElements.length}{" "}
                  {sectionElements.length === 1 ? "element" : "elements"} — each
                  one: view, let the AI work on it, or edit it yourself.
                </div>
                {sectionElements.length > 0 && sectionKind === null && (
                  <ApprovalBar elements={sectionElements} />
                )}
              </div>
              {sourcingHere && (
                <div className="source-status">
                  <span className="source-status-dot" /> Sourcing from the web
                  — this can take a couple of minutes. New drafts will appear
                  here when it finishes.
                </div>
              )}
              {section === "roles" && (
                <RaciMatrix
                  steps={doc.elements.filter((e) => e.type === "process-step")}
                  roles={doc.elements.filter((e) => e.type === "role")}
                  onGoToElement={goToElement}
                />
              )}
              {section === "process-steps" && (
                <ProcessFlow
                  steps={doc.elements.filter((e) => e.type === "process-step")}
                  onGoToElement={goToElement}
                  onDeepDive={(id, title) =>
                    deepDive({ id, title, kind: "element" })
                  }
                  knownIds={new Set(doc.elements.map((e) => e.id))}
                  currentId={currentRunId ?? undefined}
                  controlsByStep={controlsByStep}
                />
              )}
              {sectionElements.length === 0 ? (
                <div className="empty-state">
                  <p>No elements in “{activeLabel}” yet.</p>
                  {sectionKind === null ? (
                    <p className="empty-hint">
                      Let the AI suggest a draft — or capture the first element
                      yourself.
                    </p>
                  ) : sourcingHere ? (
                    <p className="empty-hint">
                      Sourcing from the web — the drafts will appear here when
                      it finishes.
                    </p>
                  ) : (
                    <>
                      <p className="empty-hint">
                        {sectionKind === "innovation"
                          ? "Let the assistant source market trends, competitor moves and innovation ideas from the web — studies, analyst reports and competitor scans in this process’s domain."
                          : "Let the assistant scan how competitors run this client journey and gather industry CX benchmarks from the web."}
                      </p>
                      <button
                        className="empty-cta"
                        onClick={() => runSourcing(sectionKind)}
                        disabled={sourcing?.status === "running"}
                      >
                        ✦ Source from the web
                      </button>
                    </>
                  )}
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
                        onGoToElement={goToElement}
                        onDeepDive={(id, title) =>
                          deepDive({ id, title, kind: "element" })
                        }
                        onSaved={() => setLastSaved(new Date())}
                        resolveSection={resolveSection}
                        defaultCollapsed={sectionElements.length > 3}
                        isCurrent={el.id === currentRunId}
                        derivedLinks={
                          el.type === "exception"
                            ? { affects: affectsByException[el.id] ?? [] }
                            : el.type === "process-step"
                              ? { controls: controlsByStep[el.id] ?? [] }
                              : undefined
                        }
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
                    onGoToElement={goToElement}
                    onDeepDive={(id, title) =>
                      deepDive({ id, title, kind: "element" })
                    }
                    onSaved={() => setLastSaved(new Date())}
                    resolveSection={resolveSection}
                    defaultCollapsed={sectionElements.length > 3}
                    isCurrent={el.id === currentRunId}
                    derivedLinks={
                      el.type === "exception"
                        ? { affects: affectsByException[el.id] ?? [] }
                        : el.type === "process-step"
                          ? { controls: controlsByStep[el.id] ?? [] }
                          : undefined
                    }
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

      {sourcing && sourcing.status !== "running" && (
        <div className={`sourcing-notif ${sourcing.status}`} role="status">
          <button
            className="sourcing-notif-x"
            onClick={() => setSourcing(null)}
            aria-label="Dismiss"
          >
            ×
          </button>
          <div className="sourcing-notif-head">
            {sourcing.status === "done"
              ? "✦ Web sourcing complete"
              : "⚠ Web sourcing failed"}
          </div>
          <div className="sourcing-notif-body">
            <Markdown text={sourcing.text ?? ""} />
          </div>
        </div>
      )}
    </>
  );
}
