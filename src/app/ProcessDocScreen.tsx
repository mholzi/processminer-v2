"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Schema, ProcessDoc, WikiPage } from "@/lib/wiki";
import { isSourcedType } from "@/lib/element-types";
import { buildRelations, type LinkGroup } from "@/lib/relations";
import { sectionForId } from "@/lib/nav";
import type { LintFinding } from "@/lib/lint";
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
import SourcesPanel from "@/components/SourcesPanel";
import SourceDocViewer from "@/components/SourceDocViewer";
import Tooltip from "@/components/Tooltip";
import ToastStack, { type Toast } from "@/components/ToastStack";

const mid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// The signed-in SME — stamped onto review-status changes in the wiki.
const CURRENT_USER = "M. Berger";
const CURRENT_USER_ROLE = "Subject-Matter Expert";
const USER_INITIALS = CURRENT_USER.split(/\s+/)
  .map((w) => w[0])
  .join("")
  .toUpperCase();

// Top-bar action icons — stroked line glyphs, sized + coloured via CSS.
const IconSearch = () => (
  <svg viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);
const IconUpload = () => (
  <svg viewBox="0 0 24 24">
    <path d="M12 16V4M6 10l6-6 6 6" />
    <path d="M4 20h16" />
  </svg>
);
const IconRun = () => (
  <svg viewBox="0 0 24 24">
    <path d="M6 4l14 8-14 8z" />
  </svg>
);
const IconLint = () => (
  <svg viewBox="0 0 24 24">
    <path d="M9 11l3 3 8-8" />
    <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
  </svg>
);
const IconMoon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
  </svg>
);
const IconSun = () => (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="3.6" />
    <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
  </svg>
);

// The non-interactive web-sourcing skills, and the sections each fills.
const INNOVATION_SECTIONS = [
  "market-trends",
  "competitor-innovation",
  "innovation-ideas",
];
const CX_SECTIONS = ["competitor-cx", "cx-benchmarks"];
const REGULATION_SECTIONS = ["regulation"];

// Each area's foundational specialist skill — drives the empty-area next-step
// card shown when a whole area still has no elements.
const AREA_NEXT: Record<
  string,
  { skill: string; label: string; blurb: string }
> = {
  "as-is": {
    skill: "process-specialist",
    label: "process specialist",
    blurb: "map the as-is process with an SME",
  },
  "risk-compliance": {
    skill: "control-compliance-specialist",
    label: "control & compliance specialist",
    blurb: "map the controls, regulations and compliance gaps",
  },
  "client-experience": {
    skill: "client-journey-specialist",
    label: "client journey specialist",
    blurb: "map the client journey",
  },
  innovation: {
    skill: "innovation-analyst",
    label: "innovation analyst",
    blurb: "develop the forward-looking view",
  },
  target: {
    skill: "innovation-analyst",
    label: "innovation analyst",
    blurb: "design the target state",
  },
  "it-architecture": {
    skill: "it-architect",
    label: "IT architect",
    blurb: "map the systems landscape",
  },
};

// Display copy for each elicitation specialist — keyed by skill name, the
// value a section carries in `schema.areas[].sections[].specialist`. Used to
// offer an empty section its owning specialist as the call-to-action.
const SPECIALIST: Record<string, { label: string; blurb: string }> = {
  "process-specialist": {
    label: "Process Specialist",
    blurb: "maps the As-Is process with you",
  },
  "control-compliance-specialist": {
    label: "Control & Compliance Specialist",
    blurb: "documents the controls, regulations and compliance gaps",
  },
  "client-journey-specialist": {
    label: "Client Journey Specialist",
    blurb: "maps the client journey",
  },
  "it-architect": {
    label: "IT Architect",
    blurb: "maps the systems landscape",
  },
  "innovation-analyst": {
    label: "Innovation Analyst",
    blurb: "develops the forward-looking view",
  },
};
function sectionSourcingKind(
  section: string,
): "innovation" | "cx" | "regulation" | null {
  if (INNOVATION_SECTIONS.includes(section)) return "innovation";
  if (CX_SECTIONS.includes(section)) return "cx";
  if (REGULATION_SECTIONS.includes(section)) return "regulation";
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

// The one main screen. Left rail is a numbered 1..6 area spine — always
// visible so the process sequence never scrolls away — plus a collapsible
// section panel that lists the sections of the selected area.
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

  // Generic forward + reverse relation index — drives every card's link
  // groups from the schema. Built once per doc, not per render.
  const relIndex = useMemo(
    () => buildRelations(schema, doc.elements),
    [schema, doc],
  );
  // Link groups for one element's card: schema-driven forward + reverse, plus
  // the transitions-derived `affects` for exceptions (not a stored relation).
  function elementLinks(el: WikiPage): LinkGroup[] {
    const groups = [...relIndex.forward(el), ...relIndex.reverse(el.id)];
    if (el.type === "exception" && (affectsByException[el.id]?.length ?? 0) > 0)
      groups.push({ label: "Affects", ids: affectsByException[el.id] });
    return groups;
  }

  // Resolve a referenced element id to its page + type label — backs the
  // hovercards on link chips, transitions and the process flow.
  const elementsById = useMemo(
    () => new Map(doc.elements.map((e) => [e.id, e])),
    [doc],
  );
  function getRef(id: string) {
    const page = elementsById.get(id);
    return page
      ? { page, typeLabel: schema.elementTypes[page.type]?.label ?? page.type }
      : undefined;
  }

  // Per-process attention counts — drive the switcher's badges (#18). An
  // element is reviewed when approved, or (web-sourced) once triaged.
  const processList = docs.map((d) => {
    const reviewed = (e: WikiPage) =>
      isSourcedType(e.type)
        ? ["relevant", "disregarded"].includes(String(e.meta.relevance ?? ""))
        : String(e.meta.approval ?? "in-progress") === "approved";
    return {
      slug: d.slug,
      id: d.process.id,
      title: d.process.title,
      status: {
        review: d.elements.filter((e) => !reviewed(e)).length,
        conflicts: d.ingest?.conflicts?.length ?? 0,
        lint: d.lint?.findings?.length ?? 0,
      },
    };
  });
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
  // The numbered area spine (1..6) is always visible; the section detail
  // panel beside it collapses to widen the canvas.
  const [sectionsCollapsed, setSectionsCollapsed] = useState(false);
  // Which area's sections the detail panel lists. Follows `section`
  // whenever it resolves to an area, and stays put for area-less views
  // (lint, triage, a source document).
  const [navAreaId, setNavAreaId] = useState(
    () =>
      schema.areas.find((a) => a.sections.some((s) => s.id === section))?.id ??
      schema.areas[0].id,
  );
  useEffect(() => {
    const a = schema.areas.find(
      (ar) =>
        ar.sections.some((s) => s.id === section) ||
        section === `__area:${ar.id}`,
    );
    if (a) setNavAreaId(a.id);
  }, [section, schema.areas]);

  // Spine click: re-clicking the active area toggles the panel; a different
  // area selects it, reopens the panel and shows its executive summary.
  function selectArea(id: string) {
    if (id === navAreaId) {
      setSectionsCollapsed((v) => !v);
    } else {
      setNavAreaId(id);
      setSectionsCollapsed(false);
      setSection(`__area:${id}`);
    }
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
  // Signed-in-user popover — the topbar person icon opens it.
  const [userModalOpen, setUserModalOpen] = useState(false);

  // A non-interactive web-sourcing run (source-innovation / source-cx /
  // source-regulation). It runs outside the chat — a section banner shows
  // progress, a dismissable notice shows the result.
  const [sourcing, setSourcing] = useState<{
    kind: "innovation" | "cx" | "regulation";
    status: "running" | "done" | "error";
    text?: string;
  } | null>(null);

  // Per-area executive summary — viewed from the nav area heading, generated
  // silently by the area-summary skill. `summaryGen` tracks an active run.
  const [summaryGen, setSummaryGen] = useState<{
    area: string;
    status: "generating" | "error";
  } | null>(null);

  // ⌘K search palette.
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Bottom-right toast stack — one home for transient outcomes.
  const [toasts, setToasts] = useState<Toast[]>([]);
  function pushToast(kind: Toast["kind"], title: string, body?: string) {
    setToasts((t) => [...t, { id: mid(), kind, title, body }]);
  }
  function dismissToast(id: string) {
    setToasts((t) => t.filter((x) => x.id !== id));
  }

  // The "+ Add entry" type-picker menu (#8).
  const [addMenuOpen, setAddMenuOpen] = useState(false);

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

  // Keyboard navigation — [ / ] step through sections, j / k scroll the
  // element cards. Ignored while typing in a field or with the palette open.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || paletteOpen) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      )
        return;
      if (e.key === "[" || e.key === "]") {
        const idx = flatSections.findIndex((s) => s.id === section);
        if (idx === -1) return;
        const next = idx + (e.key === "]" ? 1 : -1);
        if (next >= 0 && next < flatSections.length) {
          e.preventDefault();
          setSection(flatSections[next].id);
        }
      } else if (e.key === "j" || e.key === "k") {
        const cards = Array.from(
          document.querySelectorAll<HTMLElement>(".canvas .el"),
        );
        if (cards.length === 0) return;
        e.preventDefault();
        const target =
          e.key === "j"
            ? cards.find((c) => c.getBoundingClientRect().top > 110)
            : [...cards]
                .reverse()
                .find((c) => c.getBoundingClientRect().top < 70);
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flatSections, section, paletteOpen]);

  // A finished web-sourcing run surfaces as a toast, then clears.
  useEffect(() => {
    if (sourcing && sourcing.status !== "running") {
      pushToast(
        sourcing.status === "done" ? "success" : "error",
        sourcing.status === "done"
          ? "Web sourcing complete"
          : "Web sourcing failed",
        sourcing.text,
      );
      setSourcing(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourcing]);

  // Per-section UI state — reset when the section changes.
  useEffect(() => {
    setAddMenuOpen(false);
  }, [section]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  }

  const currentSection =
    schema.areas.flatMap((a) => a.sections).find((s) => s.id === section) ??
    null;
  const activeLabel = currentSection?.label ?? section;
  // A section is "planned" when no element type targets it — it can't yet
  // hold anything, so the app must not promise an Add entry there.
  const sectionHasType = Object.values(schema.elementTypes).some(
    (t) => t.section === section,
  );
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

  // Lint findings grouped by the element id they involve — each element card
  // shows its own findings inline. A finding spanning N elements shows on each.
  const findingsByElement: Record<string, LintFinding[]> = {};
  if (findings) {
    for (const f of findings) {
      for (const id of f.elements) {
        (findingsByElement[id] ??= []).push(f);
      }
    }
  }

  // Per-area review progress — drives the left-rail progress bars. An element
  // counts as reviewed when approved, or (for a web-sourced type) once triaged.
  const isReviewed = (e: WikiPage) =>
    isSourcedType(e.type)
      ? ["relevant", "disregarded"].includes(String(e.meta.relevance ?? ""))
      : String(e.meta.approval ?? "in-progress") === "approved";
  const areaStats: Record<string, { reviewed: number; total: number }> = {};
  for (const area of schema.areas) {
    const ids = new Set(area.sections.map((s) => s.id));
    const els = doc.elements.filter((e) => ids.has(e.section));
    areaStats[area.id] = {
      total: els.length,
      reviewed: els.filter(isReviewed).length,
    };
  }

  // The area the left-rail detail panel currently lists, and its 1-based
  // position in the process sequence (the number shown on the spine).
  const activeAreaIdx = Math.max(
    0,
    schema.areas.findIndex((a) => a.id === navAreaId),
  );
  const activeArea = schema.areas[activeAreaIdx];
  const activeAreaNo = activeAreaIdx + 1;

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
  // Launch an area's foundational specialist — the empty-area next-step CTA.
  function runAreaSpecialist(skill: string) {
    if (chatPending) return;
    setChatOpen(true);
    handleSend(
      `Run the ${skill} skill on the process with slug "${currentSlug}".`,
    );
  }

  function runLint() {
    if (linting || chatPending) return;
    setChatOpen(true);
    setLinting(true);
    setSection("__review");
    handleSend(
      `Run the run-lint skill on the process with slug "${currentSlug}".`,
      {
        onComplete: () => {
          setLinting(false);
          pushToast(
            "success",
            "Lint pass complete",
            "Open Review in the top bar to see the findings.",
          );
        },
      },
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
  function addEntry(typeLabel?: string) {
    if (chatPending) return;
    setAddMenuOpen(false);
    setChatOpen(true);
    const typeNote = typeLabel
      ? ` The SME wants to add a "${typeLabel}" element.`
      : "";
    handleSend(
      `Run the add-entry skill for the "${section}" section of the process with slug "${currentSlug}".${typeNote}`,
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
  function runSourcing(kind: "innovation" | "cx" | "regulation") {
    if (sourcing?.status === "running") return;
    setSourcing({ kind, status: "running" });
    const skill =
      kind === "innovation"
        ? "source-innovation"
        : kind === "cx"
          ? "source-cx"
          : "source-regulation";
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
              kind === "innovation"
                ? "Innovation"
                : kind === "cx"
                  ? "Client Experience"
                  : "Regulation"
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

  // The perspective specialist that owns an element's section. The schema
  // assigns a `specialist` to every section; routing through it keeps skill
  // selection authored, not an LLM decision (SKILLS.md §4/§9).
  function specialistForId(id: string): string | null {
    const secId = sectionForId(schema, id);
    if (!secId) return null;
    for (const area of schema.areas) {
      const sec = area.sections.find((s) => s.id === secId);
      if (sec) return sec.specialist ?? null;
    }
    return null;
  }

  // Deep dive — run the owning specialist's Brainstorm on the target via
  // /api/session. An element routes by its own section; a finding routes
  // through its first implicated element. The specialist carries the
  // Brainstorm pattern inline (SKILLS.md §5) — there is no separate skill.
  function deepDive(target: {
    id: string;
    title: string;
    kind: "element" | "finding";
    /** Finding only — the element IDs the finding implicates. */
    elements?: string[];
    /** Finding only — the discrepancy explanation / clarifying question. */
    detail?: string;
  }) {
    if (chatPending) return;
    const routeId =
      target.kind === "finding" ? (target.elements?.[0] ?? null) : target.id;
    const specialist = routeId ? specialistForId(routeId) : null;
    const skillClause = specialist
      ? `run the ${specialist} skill on the process with slug "${currentSlug}" and `
      : "";
    const message =
      target.kind === "finding"
        ? `Deep dive on lint finding ${target.id} ("${target.title}") — ${skillClause}work through this discrepancy with me with targeted clarifying questions until the wiki is consistent.` +
          (target.detail ? `\n\nFinding detail: ${target.detail}` : "") +
          (target.elements?.length
            ? `\nImplicated elements: ${target.elements.join(", ")}.`
            : "")
        : `Deep dive on element ${target.id} ("${target.title}") — ${skillClause}brainstorm this element with me: probe for edge cases, exceptions and tacit detail to deepen its documentation.`;
    setChatOpen(true);
    handleSend(message);
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
      if (!el) {
        if (tries++ < 30) requestAnimationFrame(tryScroll);
        return;
      }
      // A collapsed card would otherwise scroll into view still closed —
      // expand it via its own toggle so React owns the state, then scroll
      // once the expanded layout has settled.
      if (el.classList.contains("collapsed")) {
        el.querySelector<HTMLElement>(".el-collapse")?.click();
      }
      requestAnimationFrame(() =>
        el.scrollIntoView({ behavior: "smooth", block: "center" }),
      );
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
        <div className="tb-icons">
          <Tooltip label="Search (⌘K)">
            <button
              className="tb-icon"
              onClick={() => setPaletteOpen(true)}
              aria-label="Search"
            >
              <IconSearch />
            </button>
          </Tooltip>
          <Tooltip label="Upload document">
            <button
              className="tb-icon"
              onClick={() => setUploadModalOpen(true)}
              aria-label="Upload document"
            >
              <IconUpload />
            </button>
          </Tooltip>
          {(doc.ingest || doc.reviewState) && (
            <Tooltip
              label={
                doc.reviewState && !doc.reviewState.done
                  ? `Foundational run · ${doc.reviewState.cursor} / ${doc.reviewState.total}`
                  : "Triage"
              }
            >
              <button
                className="tb-icon"
                onClick={() => setSection("__triage")}
                aria-label="Triage"
              >
                <IconRun />
                {doc.reviewState && !doc.reviewState.done && (
                  <span className="tb-badge">{doc.reviewState.cursor}</span>
                )}
              </button>
            </Tooltip>
          )}
          <Tooltip
            label={
              linting
                ? "Running lint…"
                : findings
                  ? `Lint review · ${findings.length} finding(s)`
                  : "Run lint"
            }
          >
            <button
              className="tb-icon"
              onClick={() => (findings ? setSection("__review") : runLint())}
              disabled={linting}
              aria-label="Run lint"
            >
              <IconLint />
              {findings && findings.length > 0 && (
                <span className="tb-badge">{findings.length}</span>
              )}
            </button>
          </Tooltip>
          <Tooltip label="Toggle light / dark">
            <button
              className="tb-icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {dark ? <IconSun /> : <IconMoon />}
            </button>
          </Tooltip>
          <Tooltip label={`${CURRENT_USER} · ${CURRENT_USER_ROLE}`}>
            <button
              className="tb-icon"
              onClick={() => setUserModalOpen(true)}
              aria-label="Signed-in user"
            >
              <IconUser />
            </button>
          </Tooltip>
        </div>
      </header>

      <div
        className={`shell${chatOpen ? " chat-open" : ""}${
          sectionsCollapsed ? " sections-collapsed" : ""
        }`}
      >
        <nav className={`rail rail-l${sectionsCollapsed ? " collapsed" : ""}`}>
          <div className="nav-spine">
            <button
              className="spine-toggle"
              onClick={() => setSectionsCollapsed((v) => !v)}
              aria-expanded={!sectionsCollapsed}
              aria-label={
                sectionsCollapsed ? "Show section list" : "Hide section list"
              }
              title={
                sectionsCollapsed ? "Show section list" : "Hide section list"
              }
            >
              {sectionsCollapsed ? "»" : "«"}
            </button>
            <div className="spine-nodes">
              {schema.areas.map((area, i) => {
                const stats = areaStats[area.id];
                const done = stats.total > 0 && stats.reviewed === stats.total;
                const hasFindings = area.sections.some(
                  (s) => findingsBySection[s.id],
                );
                // A web-sourcing run spins against the area it fills.
                const areaSourcing =
                  sourcing?.status === "running" &&
                  ((sourcing.kind === "innovation" &&
                    area.id === "innovation") ||
                    (sourcing.kind === "cx" &&
                      area.id === "client-experience") ||
                    (sourcing.kind === "regulation" &&
                      area.id === "risk-compliance"));
                return (
                  <button
                    key={area.id}
                    className={`spine-node${
                      area.id === navAreaId ? " active" : ""
                    }${done ? " done" : ""}`}
                    onClick={() => selectArea(area.id)}
                    aria-current={area.id === navAreaId ? "true" : undefined}
                    title={area.label}
                  >
                    <span className="spine-num">{i + 1}</span>
                    <span className="spine-lbl">{area.label}</span>
                    {areaSourcing ? (
                      <span
                        className="spine-spinner"
                        title="Sourcing from the web…"
                      />
                    ) : hasFindings ? (
                      <span
                        className="spine-dot"
                        title="Open lint findings in this area"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {!sectionsCollapsed && (
            <div className="nav-sections">
              <div className="nav-scroll">
                <div className="nav-sec-head">
                  <button
                    className={`nav-sec-title${
                      section === `__area:${activeArea.id}` ? " active" : ""
                    }`}
                    onClick={() => setSection(`__area:${activeArea.id}`)}
                    title={`Executive summary of ${activeArea.label}`}
                  >
                    <span className="nav-sec-n">{activeAreaNo}</span>
                    {activeArea.label}
                  </button>
                  {areaStats[activeArea.id].total > 0 && (
                    <Tooltip
                      label={`${areaStats[activeArea.id].reviewed} of ${
                        areaStats[activeArea.id].total
                      } elements reviewed`}
                      placement="right"
                    >
                      <span className="nav-area-frac">
                        {areaStats[activeArea.id].reviewed}/
                        {areaStats[activeArea.id].total}
                      </span>
                    </Tooltip>
                  )}
                </div>
                {areaStats[activeArea.id].total > 0 && (
                  <div className="nav-area-meter">
                    <i
                      style={{
                        width: `${Math.round(
                          (areaStats[activeArea.id].reviewed /
                            areaStats[activeArea.id].total) *
                            100,
                        )}%`,
                      }}
                    />
                  </div>
                )}
                {activeArea.sections.map((s) => {
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
                        <Tooltip
                          label={`${flag} lint finding${flag === 1 ? "" : "s"}`}
                          placement="right"
                        >
                          <span className="nav-flag">!</span>
                        </Tooltip>
                      ) : null}
                      {state !== "empty" && (
                        <Tooltip label={dotTitle} placement="right">
                          <span className={`nav-dot nav-dot-${state}`} />
                        </Tooltip>
                      )}
                      {count !== null && (
                        <span className="count">{count}</span>
                      )}
                    </span>
                  </button>
                );
                })}
              </div>
              <SourcesPanel
                sources={doc.sources}
                ingest={doc.ingest}
                activeFile={
                  section.startsWith("__doc:")
                    ? section.slice("__doc:".length)
                    : null
                }
                onOpen={(f) => setSection(`__doc:${f}`)}
                onUpload={() => setUploadModalOpen(true)}
              />
            </div>
          )}
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
                    deepDive({
                      id: f.id,
                      title: f.title,
                      kind: "finding",
                      elements: f.elements,
                      detail: f.detail,
                    })
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
                    <div className="canvas-actions">
                      <button
                        className="canvas-act"
                        onClick={() => window.print()}
                        title="Export this area as a PDF"
                      >
                        ⎙ Export PDF
                      </button>
                    </div>
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
          ) : section.startsWith("__doc:") ? (
            (() => {
              const file = section.slice("__doc:".length);
              return (
                <>
                  <div className="canvas-head">
                    <h1>{file}</h1>
                    <div className="sub">
                      Imported source document — raw-sources/{currentSlug}/
                      {file}
                    </div>
                  </div>
                  <SourceDocViewer slug={currentSlug} file={file} />
                </>
              );
            })()
          ) : (
            <>
              <div className="canvas-title">
                <h1>{activeLabel}</h1>
                <div className="sub">
                  {currentSection?.description ?? activeLabel}
                </div>
              </div>
              <div className="canvas-strip">
                <span className="strip-name">{activeLabel}</span>
                {sectionElements.length > 0 && sectionKind === null && (
                  <ApprovalBar elements={sectionElements} />
                )}
                <span className="strip-spacer" />
                <div className="strip-actions">
                  <button
                    className="canvas-act"
                    onClick={() => window.print()}
                    title="Export this section as a PDF"
                  >
                    ⎙ Export PDF
                  </button>
                  {sectionKind !== null && sectionElements.length > 0 && (
                    <button
                      className="canvas-act"
                      onClick={() => runSourcing(sectionKind)}
                      disabled={sourcing?.status === "running"}
                      title="Re-run the web-sourcing skill for this section"
                    >
                      ✦ Refresh from the web
                    </button>
                  )}
                  {sectionHasType &&
                    (() => {
                    const addTypes = Object.values(schema.elementTypes)
                      .filter((t) => t.section === section)
                      .map((t) => t.label);
                    return (
                      <div className="add-entry-wrap">
                        <button
                          className="add-entry-btn"
                          onClick={() =>
                            addTypes.length > 1
                              ? setAddMenuOpen((v) => !v)
                              : addEntry(addTypes[0])
                          }
                          disabled={chatPending}
                          title="Add an entry — the assistant drafts it with you"
                        >
                          + Add entry{addTypes.length > 1 ? " ▾" : ""}
                        </button>
                        {addMenuOpen && addTypes.length > 1 && (
                          <>
                            <div
                              className="add-menu-scrim"
                              onClick={() => setAddMenuOpen(false)}
                            />
                            <div className="add-menu" role="menu">
                              <div className="add-menu-head">
                                Add to {activeLabel}
                              </div>
                              {addTypes.map((tl) => (
                                <button
                                  key={tl}
                                  className="add-menu-item"
                                  onClick={() => addEntry(tl)}
                                >
                                  {tl}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
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
                  {!sectionHasType ? (
                    <>
                      <p>{activeLabel} is not yet available.</p>
                      <p className="empty-hint">
                        This section is planned — its element type has not been
                        built yet, so nothing can be added here.
                      </p>
                    </>
                  ) : (
                    <>
                  <p>No elements in “{activeLabel}” yet.</p>
                  {sectionKind === null ? (
                    (() => {
                      const areaOf = schema.areas.find((a) =>
                        a.sections.some((s) => s.id === section),
                      );
                      const next = areaOf ? AREA_NEXT[areaOf.id] : undefined;
                      const areaEmpty =
                        areaOf && areaStats[areaOf.id]?.total === 0;
                      if (areaEmpty && next)
                        return (
                          <div className="area-next">
                            <h3>{areaOf!.label} is empty</h3>
                            <p>
                              No elements anywhere in this area yet. Run the{" "}
                              {next.label} to {next.blurb}.
                            </p>
                            <button
                              onClick={() => runAreaSpecialist(next.skill)}
                              disabled={chatPending}
                            >
                              Start the {next.label}
                            </button>
                          </div>
                        );
                      const sec = areaOf?.sections.find(
                        (s) => s.id === section,
                      );
                      const spec = sec?.specialist
                        ? SPECIALIST[sec.specialist]
                        : undefined;
                      return spec ? (
                        <>
                          <p className="empty-hint">
                            The {spec.label} {spec.blurb} — or add one entry
                            yourself.
                          </p>
                          <button
                            className="empty-cta"
                            onClick={() => runAreaSpecialist(sec!.specialist!)}
                            disabled={chatPending}
                          >
                            ✦ Start the {spec.label}
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="empty-hint">
                            Let the assistant draft the first one with you —
                            or capture it yourself.
                          </p>
                          <button
                            className="empty-cta"
                            onClick={() => addEntry()}
                            disabled={chatPending}
                          >
                            ✦ Add the first entry
                          </button>
                        </>
                      );
                    })()
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
                          : sectionKind === "regulation"
                            ? "Let the assistant source the regulations that govern this process from the web — financial-services regulation, supervisory rules and guidance in this process’s domain."
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
                        fieldSpecs={
                          schema.elementTypes[el.type]?.frontmatter?.fields ??
                          []
                        }
                        links={elementLinks(el)}
                        getRef={getRef}
                        notes={doc.notes?.[el.id]}
                        onGoToElement={goToElement}
                        onDeepDive={(id, title) =>
                          deepDive({ id, title, kind: "element" })
                        }
                        findings={findingsByElement[el.id]}
                        onFindingDeepDive={(f) =>
                          deepDive({
                      id: f.id,
                      title: f.title,
                      kind: "finding",
                      elements: f.elements,
                      detail: f.detail,
                    })
                        }
                        defaultCollapsed={sectionElements.length > 3}
                        isCurrent={el.id === currentRunId}
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
                    fieldSpecs={
                      schema.elementTypes[el.type]?.frontmatter?.fields ?? []
                    }
                    links={elementLinks(el)}
                    getRef={getRef}
                    notes={doc.notes?.[el.id]}
                    onGoToElement={goToElement}
                    onDeepDive={(id, title) =>
                      deepDive({ id, title, kind: "element" })
                    }
                    findings={findingsByElement[el.id]}
                    onFindingDeepDive={(f) =>
                      deepDive({
                      id: f.id,
                      title: f.title,
                      kind: "finding",
                      elements: f.elements,
                      detail: f.detail,
                    })
                    }
                    defaultCollapsed={sectionElements.length > 3}
                    isCurrent={el.id === currentRunId}
                  />
                ))
              )}
              {sectionElements.length > 0 && (
                <div className="back-to-top">
                  <button
                    onClick={() =>
                      document
                        .querySelector(".canvas")
                        ?.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  >
                    ↑ Back to top
                  </button>
                </div>
              )}
            </>
          )}

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

      {userModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setUserModalOpen(false)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Signed-in user"
          >
            <div className="modal-title">Signed-in user</div>
            <div className="user-card">
              <span className="user-avatar">{USER_INITIALS}</span>
              <div>
                <div className="user-name">{CURRENT_USER}</div>
                <div className="user-role">{CURRENT_USER_ROLE}</div>
              </div>
            </div>
            <p className="modal-text">
              Approvals and edits in this process are stamped with this name.
            </p>
            <div className="modal-actions">
              <button
                className="act"
                onClick={() => setUserModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
