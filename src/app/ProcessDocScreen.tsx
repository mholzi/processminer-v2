"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Schema, ProcessDoc, WikiPage } from "@/lib/wiki";
import { isSourcedType } from "@/lib/element-types";
import { initials, type User } from "@/lib/user";
import { buildRelations, type LinkGroup } from "@/lib/relations";
import { sectionForId } from "@/lib/nav";
import { isOpen, type LintFinding } from "@/lib/lint";
import ElementCard from "@/components/ElementCard";
import WholeDocWordView from "@/components/WholeDocWordView";
import WholeDocJsonView from "@/components/WholeDocJsonView";
import RaciMatrix from "@/components/RaciMatrix";
import SkillsDashboard from "@/components/SkillsDashboard";
import SettingsPanel from "@/components/SettingsPanel";
import ProcessFlow from "@/components/ProcessFlow";
import OverviewPanel from "@/components/OverviewPanel";
import AgentChat, { type ChatMessage } from "@/components/AgentChat";
import ReviewPanel from "@/components/ReviewPanel";
import TriagePanel from "@/components/TriagePanel";
import SummaryPanel from "@/components/SummaryPanel";
import { CoveragePanel, CoverageRollup } from "@/components/CoveragePanel";
import { computeCoverage } from "@/lib/coverage";
import TargetReviewPanel from "@/components/TargetReviewPanel";
import TargetSynthesis from "@/components/TargetSynthesis";
import ControlsInTarget from "@/components/ControlsInTarget";
import { COUNCIL_SPECIALISTS } from "@/lib/target-review";
import UploadModal from "@/components/UploadModal";
import CommandPalette from "@/components/CommandPalette";
import HelpCenter from "@/components/HelpCenter";
import GuidedTour, { TOUR_STEPS } from "@/components/GuidedTour";
import ExportModal from "@/components/ExportModal";
import ApprovalBar from "@/components/ApprovalBar";
import ProcessSwitcher from "@/components/ProcessSwitcher";
import SourcesPanel from "@/components/SourcesPanel";
import SourceDocViewer from "@/components/SourceDocViewer";
import Tooltip from "@/components/Tooltip";
import ToastStack, { type Toast } from "@/components/ToastStack";
import FeedbackScreen from "@/components/FeedbackScreen";
import type { FeedbackItem } from "@/lib/feedback";

const mid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

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
const IconSkills = () => (
  <svg viewBox="0 0 24 24">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);
const IconHelp = () => (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" />
    <path d="M9.2 9.3a2.8 2.8 0 0 1 5.5.8c0 1.9-2.7 2.4-2.7 4" />
    <path d="M12 17.3v.01" />
  </svg>
);
const IconExport = () => (
  <svg viewBox="0 0 24 24">
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6M9 17h6" />
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

// Each area's first-step skill — drives the empty-area next-step card shown
// when a whole area still has no elements. Usually the area's owning
// specialist; for Target Process it's source-target, which stubs the area.
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
    skill: "source-target",
    label: "target consolidation",
    blurb: "draft a first-stub target state from the work so far",
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
  "transformation-agent": {
    label: "Transformation Agent",
    blurb: "designs the target state with you",
  },
};
// Friendly name for each chat-driven skill — shown in the assistant's
// active-skill chip while a turn runs. Covers the elicitation specialists
// plus the non-specialist skills the run-* wrappers invoke.
// Long-turn UX helpers — ETA from past runs and a browser notification on
// completion when the user has tabbed away. Both are best-effort: storage
// failures and a missing Notification API are silent no-ops.

/** Don't fire a Notification for short turns — they were never painful. */
const NOTIFY_THRESHOLD_MS = 2 * 60 * 1000;
/** Cap per-skill history so a runaway log never bloats localStorage. */
const ETA_HISTORY_CAP = 10;
const ETA_STORAGE_KEY = "pm.skillDurationsMs.v1";
const NOTIFY_ASKED_KEY = "pm.notifyPermissionAsked.v1";

function readSkillHistory(): Record<string, number[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ETA_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, number[]>)
      : {};
  } catch {
    return {};
  }
}

function recordSkillDuration(skill: string, ms: number) {
  if (typeof window === "undefined" || !Number.isFinite(ms) || ms <= 0) return;
  try {
    const all = readSkillHistory();
    const list = Array.isArray(all[skill]) ? all[skill].slice() : [];
    list.push(Math.round(ms));
    while (list.length > ETA_HISTORY_CAP) list.shift();
    all[skill] = list;
    window.localStorage.setItem(ETA_STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* storage full or blocked — silently skip */
  }
}

function readSkillEta(skill: string): { medianMs: number; runs: number } | null {
  const list = readSkillHistory()[skill];
  if (!list || list.length === 0) return null;
  const sorted = [...list].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const medianMs =
    sorted.length % 2 === 0
      ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
      : sorted[mid];
  return { medianMs, runs: list.length };
}

/** Render `ms` as a tight human label like "12 min" or "45 s". */
function formatEta(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)} s`;
  const min = Math.round(ms / 60_000);
  return `${min} min`;
}

/**
 * Browser notification on long-turn completion. Best-effort:
 *   - never asks until the first long turn actually completes (no permission
 *     prompt on first page load);
 *   - asks at most once — declines are remembered;
 *   - silent if the API is unavailable or the tab is currently focused.
 */
function notifyTurnComplete(durationMs: number, skill: string | null) {
  if (typeof window === "undefined") return;
  if (typeof Notification === "undefined") return;
  // If the user is looking at the tab right now, they don't need a ping.
  if (!document.hidden) return;
  const label = skill ? SKILL_LABEL[skill] || skill : "Assistant";
  const body = `${label} finished after ${formatEta(durationMs)}.`;
  const fire = () => {
    try {
      new Notification("Processminer — done", { body, tag: "pm-turn-done" });
    } catch {
      /* user-agent quirk — drop silently */
    }
  };
  if (Notification.permission === "granted") {
    fire();
  } else if (Notification.permission === "default") {
    // Only ask once per browser. A decline isn't asked again.
    let asked = false;
    try {
      asked = window.localStorage.getItem(NOTIFY_ASKED_KEY) === "1";
    } catch {
      /* storage blocked — assume not asked */
    }
    if (asked) return;
    try {
      window.localStorage.setItem(NOTIFY_ASKED_KEY, "1");
    } catch {
      /* storage blocked — proceed without remembering */
    }
    Notification.requestPermission()
      .then((p) => {
        if (p === "granted") fire();
      })
      .catch(() => {
        /* user dismissed — ignore */
      });
  }
}

const SKILL_LABEL: Record<string, string> = {
  "process-specialist": "Process Specialist",
  "control-compliance-specialist": "Control & Compliance Specialist",
  "client-journey-specialist": "Client Journey Specialist",
  "it-architect": "IT Architect",
  "innovation-analyst": "Innovation Analyst",
  "transformation-agent": "Transformation Agent",
  "run-lint": "Quality Check",
  "foundational-run": "Foundational Run",
  "council-review": "Target Council Review",
  "add-entry": "Add Entry",
  "comment-review": "Comment Review",
  "conflict-resolution": "Conflict Resolution",
  "document-ingest": "Document Import",
  "new-process": "New Process",
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
function scopePreamble(d: ProcessDoc, user: User): string {
  const { id, title } = d.process;
  return [
    "[SESSION SCOPE — applies to this whole conversation]",
    `You are the Process Assistant for exactly one process: ${title} (${id}).`,
    `Its wiki content is wiki/processes/${d.slug}/; its source documents`,
    `are under raw-sources/${d.slug}/.`,
    "",
    `The SME present in this session is ${user.name} (${user.role}). Use that`,
    "name verbatim wherever an approval or edit is stamped — never ask the SME",
    "for their name.",
    "",
    "Rules, in force for every turn of this session:",
    `1. Only consider, discuss and change content belonging to ${id}.`,
    "2. Never read or modify another process under wiki/processes/ or",
    "   raw-sources/, and never change anything else in the repository.",
    "3. If asked to do anything else — work on another process, change",
    "   application code, or anything unrelated to documenting this",
    "   process — decline: briefly say you are scoped to this process and",
    "   cannot help with that, in the language the SME is using. If the",
    "   request was to create or switch to another process, point the SME",
    "   at the “+ New process” button in the app's top bar (and the process",
    "   switcher beside it) — never tell them to run a CLI skill or start a",
    "   new session; they are working in the web app, not a terminal.",
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

// The chat transcript + claude session id are persisted to sessionStorage
// per process, so a page reload (or dev hot-reload) restores the conversation
// instead of dropping it — a foundational run can span hours. sessionStorage
// is deliberate: it survives a reload but clears when the tab closes, so a
// transcript never goes stale across days.
const chatStoreKey = (slug: string) => `pm-chat-${slug}`;
function loadStoredChat(
  slug: string,
): { messages: ChatMessage[]; sessionId: string | null } | null {
  try {
    const raw = sessionStorage.getItem(chatStoreKey(slug));
    if (!raw) return null;
    const saved = JSON.parse(raw) as {
      messages?: ChatMessage[];
      sessionId?: string | null;
    };
    if (!Array.isArray(saved.messages) || saved.messages.length === 0) {
      return null;
    }
    return {
      messages: saved.messages,
      sessionId:
        typeof saved.sessionId === "string" ? saved.sessionId : null,
    };
  } catch {
    return null;
  }
}

// The one main screen. Left rail is a numbered 1..6 area spine — always
// visible so the process sequence never scrolls away — plus a collapsible
// section panel that lists the sections of the selected area.
// Right rail is the agent chat + the wiki-wide lint pass.
export default function ProcessDocScreen({
  schema,
  docs,
  feedback,
  user,
  onUpdateUser,
  onSignOut,
  initialSlug,
  onReturnToSplash,
}: {
  schema: Schema;
  docs: ProcessDoc[];
  feedback: FeedbackItem[];
  user: User;
  onUpdateUser: (user: User) => void;
  onSignOut: () => void;
  initialSlug?: string;
  onReturnToSplash?: () => void;
}) {
  // If a foundational run is in progress on any process, the app opens on it
  // (most-recently-touched first) so a reload never strands outstanding work —
  // it lands on Triage, opens the chat and seeds a resume prompt. An explicit
  // initialSlug from the splash (user picked a process to continue) wins
  // over both the run cursor and docs[0].
  const openingRunDoc =
    docs
      .filter((d) => d.reviewState && !d.reviewState.done)
      .sort((a, b) =>
        b.reviewState!.updatedAt.localeCompare(a.reviewState!.updatedAt),
      )[0] ?? null;

  const splashPick = initialSlug && docs.some((d) => d.slug === initialSlug) ? initialSlug : null;
  const [currentSlug, setCurrentSlug] = useState(
    splashPick ?? (openingRunDoc ? openingRunDoc.slug : docs[0].slug),
  );
  // The app has two top-level views: the process documentation shell, and the
  // App Feedback page (feedback on the tool itself, kept in feedback/).
  const [appView, setAppView] = useState<"process" | "feedback">("process");
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
      if (typeof entry !== "string") continue;
      const to = entry.split("|")[0]?.trim();
      if (to && exceptionIds.has(to))
        (affectsByException[to] ??= []).push(el.id);
    }
  }
  // Which controls cover each step — the process flow flags uncontrolled
  // steps. `step` is authored as a list (`step: [PS-FR-002]`) but may also
  // be a bare string — normalise to a list so neither form is missed.
  const controlsByStep: Record<string, string[]> = {};
  for (const el of doc.elements) {
    if (el.type !== "control") continue;
    const raw = el.meta.step;
    const steps = Array.isArray(raw) ? raw : raw ? [raw] : [];
    for (const stepId of steps) {
      if (stepId) (controlsByStep[stepId] ??= []).push(el.id);
    }
  }

  // Generic forward + reverse relation index — drives every card's link
  // groups from the schema. Built once per doc, not per render.
  const relIndex = useMemo(
    () => buildRelations(schema, doc.elements),
    [schema, doc],
  );
  // Target-state coverage — pure set arithmetic over the loaded doc, the same
  // client-side useMemo pattern as buildRelations. Backs the Validation
  // section and the Target Process area overview.
  const coverage = useMemo(() => computeCoverage(doc), [doc]);
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
  const getRef = useCallback(
    (id: string) => {
      const page = elementsById.get(id);
      return page
        ? { page, typeLabel: schema.elementTypes[page.type]?.label ?? page.type }
        : undefined;
    },
    [elementsById, schema],
  );

  // Map a role's title → its element id, so an element's `owner` field can
  // link straight to the role (its RACI entry). Owners are stored as the
  // role's title text; some may already be a role id.
  const roleByTitle = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of doc.elements) {
      if (e.type === "role") m.set(e.title.trim().toLowerCase(), e.id);
    }
    return m;
  }, [doc.elements]);
  const resolveOwner = useCallback(
    (name: string): string | undefined => {
      const key = name.trim();
      if (elementsById.has(key)) return key;
      return roleByTitle.get(key.toLowerCase());
    },
    [roleByTitle, elementsById],
  );

  // Per-process attention counts — drive the switcher's badges (#18). An
  // element is reviewed when approved, or (web-sourced) once triaged.
  // Per-area progress is a 6-tuple of approved/total ratios in schema area
  // order, rendered as the 6-dot progress strip in the palette.
  const sectionToAreaIdx = useMemo(() => {
    const m = new Map<string, number>();
    schema.areas.forEach((a, i) => {
      for (const s of a.sections) m.set(s.id, i);
    });
    return m;
  }, [schema.areas]);
  const processList = docs.map((d) => {
    const reviewed = (e: WikiPage) =>
      isSourcedType(e.type)
        ? ["relevant", "disregarded"].includes(String(e.meta.relevance ?? ""))
        : String(e.meta.approval ?? "in-progress") === "approved";
    const areaTotals = [0, 0, 0, 0, 0, 0];
    const areaApproved = [0, 0, 0, 0, 0, 0];
    for (const e of d.elements) {
      const idx = sectionToAreaIdx.get(e.section);
      if (idx === undefined) continue;
      areaTotals[idx]++;
      if (reviewed(e)) areaApproved[idx]++;
    }
    return {
      slug: d.slug,
      id: d.process.id,
      title: d.process.title,
      lastModified: d.lastModified,
      progress: areaTotals.map((t, i) =>
        t === 0 ? 0 : areaApproved[i] / t,
      ),
      status: {
        review: d.elements.filter((e) => !reviewed(e)).length,
        conflicts: d.ingest?.conflicts?.length ?? 0,
        lint: d.lint?.findings?.filter(isOpen).length ?? 0,
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
  const [wholeDocMode, setWholeDocMode] = useState<"word" | "word-meta" | "source" | "source-expanded">("word");
  // Element-list view filter for the current section: all, only those a lint
  // finding touches, or only those not yet reviewed. Set by the nav `!` badge
  // and the area progress meter; reset to "all" on a plain section change.
  const [elemFilter, setElemFilter] = useState<
    "all" | "flagged" | "unreviewed"
  >("all");
  // The target-state theme selected in the As-Is overlay — its `replaces`
  // steps light up in the process flow. Null = no theme picked.
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
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
  // Chat panel width — drag-resizable, persisted across sessions.
  const [chatWidth, setChatWidth] = useState(340);
  useEffect(() => {
    const saved = Number(localStorage.getItem("pm-chat-width"));
    if (saved >= 300 && saved <= 720) setChatWidth(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("pm-chat-width", String(chatWidth));
  }, [chatWidth]);
  // Element-list filter — persisted so a reload keeps the chosen view.
  useEffect(() => {
    const saved = localStorage.getItem("pm-elem-filter");
    if (saved === "flagged" || saved === "unreviewed" || saved === "all") {
      setElemFilter(saved);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("pm-elem-filter", elemFilter);
  }, [elemFilter]);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const m = openingRunDoc ? resumeMessage(openingRunDoc) : null;
    return m ? [m] : [];
  });
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  // Restore a persisted transcript for the process shown on mount, so a
  // reload picks the conversation back up (FB-004). Runs once; later process
  // switches restore via switchProcess().
  const chatPersistReady = useRef(false);
  // Watchdog: timestamp (ms) of the last SSE event we saw on the active turn.
  // The watchdog effect uses this to break out of a stuck-pending state if the
  // chain went silent — e.g. an HMR reload orphaned the fetch's body reader,
  // or the network connection dropped mid-stream and `.finally` never fired.
  const lastTurnEventRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  useEffect(() => {
    const saved = loadStoredChat(currentSlug);
    if (saved) {
      setMessages(saved.messages);
      setChatSessionId(saved.sessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    // Skip the mount run so the restore above is not clobbered before it lands.
    if (!chatPersistReady.current) {
      chatPersistReady.current = true;
      return;
    }
    try {
      sessionStorage.setItem(
        chatStoreKey(currentSlug),
        JSON.stringify({ messages, sessionId: chatSessionId }),
      );
    } catch {
      /* storage full or unavailable — persistence is best-effort */
    }
  }, [messages, chatSessionId, currentSlug]);
  const [chatPending, setChatPending] = useState(false);
  // Live activity line while a turn runs — updated from the SSE stream.
  const [chatActivity, setChatActivity] = useState<string | null>(null);
  // Live sub-agent fan-out — when document-ingest / source-cx / source-
  // innovation dispatch multiple Task tools, each shows as its own chip so
  // the long-tail (the slow one that holds up the whole turn) is visible.
  // Ordered by start so the strip is stable; status flips done when the
  // tool_result comes back. Cleared on turn boundary.
  const [chatTasks, setChatTasks] = useState<
    { id: string; label: string; status: "running" | "done" }[]
  >([]);
  // The named skill a run-* wrapper kicked off — drives the assistant's
  // active-skill chip. Null for a free-text turn (no named skill).
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  // Median ETA for the current active skill, taken from past-run history in
  // localStorage. Null when there's no prior data or no named skill.
  const [activeSkillEta, setActiveSkillEta] = useState<{
    medianMs: number;
    runs: number;
  } | null>(null);
  // True from the moment the user kicks off the new-process flow until the
  // scaffolded process appears on disk (or the user bails). While true, the
  // canvas hides the previously-open process so the SME isn't editing one
  // process while the chat is creating another.
  const [draftingNewProcess, setDraftingNewProcess] =
    useState<boolean>(false);
  const [linting, setLinting] = useState(false);
  // Findings come from the last run-lint pass — wiki/processes/<slug>/lint.json,
  // read server-side into doc.lint. Re-running the skill refreshes it.
  const findings = doc.lint?.findings ?? null;
  // Findings still open — resolved ones (closed in a deep-dive) drop out of
  // the section/element badges and the top-bar count, but stay in doc.lint
  // for the Review panel's collapsed "resolved" group.
  const openFindings = findings?.filter(isOpen) ?? null;

  // Document upload — the modal saves to raw-sources/, then the chat runs
  // the document-ingest skill on the saved file.
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  // Signed-in-user popover — the topbar person icon opens it. The name/role
  // fields are editable; `userEdit` holds the draft while the modal is open.
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userEdit, setUserEdit] = useState<User>(user);

  // A non-interactive web-sourcing run (source-innovation / source-cx /
  // source-regulation). It runs outside the chat — a section banner shows
  // progress, then a result banner with a link that opens the full report.
  const [sourcing, setSourcing] = useState<{
    kind: "innovation" | "cx" | "regulation";
    status: "running" | "done" | "error";
    text?: string;
    report?: string;
  } | null>(null);
  // Whether the web-sourcing result popup is open.
  const [sourceResultOpen, setSourceResultOpen] = useState(false);

  // Live document refresh while work is in flight. A chat turn or a web-
  // sourcing run writes wiki files element-by-element; without this the
  // document view only re-reads when the turn *ends*, so a 25-minute ingest
  // shows a frozen, empty wiki the whole time (FB-003 / FB-008). Polling
  // router.refresh() re-reads the server component so cards appear and
  // approvals flip live as the skill produces them.
  useEffect(() => {
    if (!chatPending && sourcing?.status !== "running") return;
    const t = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(t);
  }, [chatPending, sourcing, router]);

  // Stuck-turn watchdog. A chat turn streams SSE events (progress, delta,
  // done, error) — the worst-case gap between events during real work is
  // seconds, not minutes, even on a long extraction. If the gap exceeds
  // CHAT_WATCHDOG_MS while pending is still true, the promise chain that
  // would clear pending is almost certainly orphaned — most often an HMR
  // reload during dev, or a dropped network mid-stream. Self-heal: clear
  // pending and surface a lost-contact message the SME can act on.
  useEffect(() => {
    if (!chatPending) return;
    const CHAT_WATCHDOG_MS = 5 * 60 * 1000;
    const t = setInterval(() => {
      const silent = Date.now() - lastTurnEventRef.current;
      if (silent < CHAT_WATCHDOG_MS) return;
      setChatPending(false);
      setChatActivity(null);
      setChatTasks([]);
      setActiveSkill(null);
      setActiveSkillEta(null);
      setMessages((m) => [
        ...m,
        {
          id: mid(),
          role: "agent",
          text:
            `⚠ Lost contact with the assistant — no activity for ${Math.round(
              silent / 60_000,
            )} min. The turn may have completed on the server; click **↻** to ` +
            `restart the session and start fresh, or send a new message to retry.`,
        },
      ]);
    }, 30_000);
    return () => clearInterval(t);
  }, [chatPending]);

  // Per-area executive summary — viewed from the nav area heading, generated
  // silently by the area-summary skill. `summaryGen` tracks an active run.
  const [summaryGen, setSummaryGen] = useState<{
    area: string;
    status: "generating" | "error";
  } | null>(null);

  // ⌘K search palette.
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  // First-run guided tour — opens once, gated on a localStorage flag.
  const [tourOpen, setTourOpen] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("pm-tour-done")) setTourOpen(true);
  }, []);
  function closeTour() {
    localStorage.setItem("pm-tour-done", "1");
    setTourOpen(false);
  }

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
      window.history.replaceState(null, "", `?p=${fresh.slug}`);
      setSection("overview");
      // A freshly-scaffolded process gets a fresh, scoped assistant session —
      // drop the session id so the next turn hands the new process over.
      setChatSessionId(null);
      setDraftingNewProcess(false);
    }
  }, [docs]);

  // Process selection survives a browser reload: the current slug is mirrored
  // into the URL (?p=<slug>) on every switch, and restored from it on mount.
  // Without this a reload strands the user on docs[0].
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "feedback") {
      setAppView("feedback");
      return;
    }
    const urlSlug = params.get("p");
    if (urlSlug && urlSlug !== currentSlug && docs.some((d) => d.slug === urlSlug)) {
      switchProcess(urlSlug);
    } else if (!urlSlug) {
      window.history.replaceState(null, "", `?p=${currentSlug}`);
    }
    // Mount-only: restore once from the URL, then switchProcess keeps it synced.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // A failed web-sourcing run surfaces as a toast, then clears. A successful
  // one is kept in state so its result banner persists until dismissed.
  useEffect(() => {
    if (sourcing && sourcing.status === "error") {
      pushToast("error", "Web sourcing failed", sourcing.text);
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
  if (openFindings) {
    for (const f of openFindings) {
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
  if (openFindings) {
    for (const f of openFindings) {
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

  // Element-list filter (#2 / #6). The chips in the section header and the
  // counts they show are computed here; `visibleElements` is what the section
  // actually renders.
  const elemVisible = (e: WikiPage) =>
    elemFilter === "all"
      ? true
      : elemFilter === "flagged"
        ? Boolean(findingsByElement[e.id])
        : !isReviewed(e);
  const flaggedCount = sectionElements.filter(
    (e) => findingsByElement[e.id],
  ).length;
  const unreviewedCount = sectionElements.filter(
    (e) => !isReviewed(e),
  ).length;
  const visibleElements = sectionElements.filter(elemVisible);

  // A brand-new process: no elements anywhere, and no ingest or foundational
  // run started. Drives the "getting started" empty state and lets the
  // foundational-walkthrough toolbar icon launch the run directly.
  const processEmpty =
    doc.elements.length === 0 && !doc.ingest && !doc.reviewState;

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
    opts?: {
      onComplete?: () => void;
      unscoped?: boolean;
      displayText?: string;
      /** Name of the skill this turn invokes — drives the active-skill chip. */
      skill?: string;
    },
  ) {
    // `text` is sent to the CLI; `displayText`, when given, is what the SME
    // sees in the transcript — lets a turn carry an internal directive the
    // assistant must act on but the SME should not see.
    setMessages((m) => [
      ...m,
      { id: mid(), role: "user", text: opts?.displayText ?? text },
    ]);
    setChatPending(true);
    setChatActivity(null);
    setChatTasks([]);
    if (opts?.skill !== undefined) {
      setActiveSkill(opts.skill);
      setActiveSkillEta(opts.skill ? readSkillEta(opts.skill) : null);
    }
    // Arm the watchdog — bumped on every SSE event below.
    lastTurnEventRef.current = Date.now();
    // Wall-clock for this turn — used to decide whether to fire a
    // browser notification on completion (only for runs that lasted more
    // than `NOTIFY_THRESHOLD_MS`) and to record the duration into the
    // per-skill ETA history.
    const turnStartedAt = Date.now();
    const turnSkill = opts?.skill !== undefined ? opts.skill : activeSkill;

    // The + New-process flow is inherently cross-process, so it runs in its
    // own fresh, unscoped session — otherwise the scope lock would make the
    // assistant decline its own scaffolding request.
    const unscoped = opts?.unscoped === true;
    const sessionId = unscoped ? null : chatSessionId;
    // First turn of a scoped session: hand the open process to the CLI and
    // lock the session to it. Later turns inherit it via --resume.
    const wireText =
      !unscoped && sessionId === null ? scopePreamble(doc, user) + text : text;

    type SessionEvent =
      | { type: "progress"; text: string }
      | { type: "delta"; text: string }
      | { type: "task_start"; id: string; label: string }
      | { type: "task_end"; id: string }
      | { type: "done"; reply?: string; sessionId?: string; isError?: boolean }
      | { type: "error"; error: string; sessionId?: string };

    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        message: wireText,
        sessionId,
        stream: user.streamReplies === true,
        skill: opts?.skill || turnSkill || null,
      }),
    })
      .then(async (res) => {
        if (!res.body) throw new Error("Keine Antwort vom Server.");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        // Id of the live agent message while reply text streams in — null
        // until the first delta (and for the whole turn if not streaming).
        let streamingId: string | null = null;

        const apply = (evt: SessionEvent) => {
          // Bump the watchdog every time we see life from the server.
          lastTurnEventRef.current = Date.now();
          if (evt.type === "progress") {
            setChatActivity(evt.text);
          } else if (evt.type === "task_start") {
            setChatTasks((ts) =>
              ts.some((t) => t.id === evt.id)
                ? ts
                : [...ts, { id: evt.id, label: evt.label, status: "running" }],
            );
          } else if (evt.type === "task_end") {
            setChatTasks((ts) =>
              ts.map((t) => (t.id === evt.id ? { ...t, status: "done" } : t)),
            );
          } else if (evt.type === "delta") {
            // Reply text arriving live — append to the streaming message,
            // creating it on the first delta.
            if (streamingId === null) {
              const id = mid();
              streamingId = id;
              setMessages((m) => [
                ...m,
                { id, role: "agent", text: evt.text },
              ]);
            } else {
              const id = streamingId;
              setMessages((m) =>
                m.map((msg) =>
                  msg.id === id ? { ...msg, text: msg.text + evt.text } : msg,
                ),
              );
            }
          } else if (evt.type === "done") {
            if (evt.sessionId) setChatSessionId(evt.sessionId);
            if (streamingId !== null) {
              // The reply already streamed in — keep what was shown; only
              // fall back to the result text if nothing actually streamed.
              const id = streamingId;
              const reply = evt.reply || "";
              setMessages((m) =>
                m.map((msg) =>
                  msg.id === id && !msg.text ? { ...msg, text: reply } : msg,
                ),
              );
              streamingId = null;
            } else {
              setMessages((m) => [
                ...m,
                { id: mid(), role: "agent", text: evt.reply || "(no reply)" },
              ]);
            }
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
        const isAbort = e instanceof DOMException && e.name === "AbortError";
        setMessages((m) => [
          ...m,
          {
            id: mid(),
            role: "agent",
            text: isAbort ? "⚠ Turn canceled by user." : `⚠ ${e instanceof Error ? e.message : "Request failed"}`,
          },
        ]);
      })
      .finally(() => {
        abortControllerRef.current = null;
        const durationMs = Date.now() - turnStartedAt;
        // Record the duration so future invocations of the same skill can
        // show an honest median ETA up-front.
        if (turnSkill) recordSkillDuration(turnSkill, durationMs);
        // If the turn was a long one, ping the user — only meaningful when
        // they've tabbed away. We ask for permission lazily on the first
        // long turn so first-load doesn't show a permission prompt.
        if (durationMs >= NOTIFY_THRESHOLD_MS) {
          notifyTurnComplete(durationMs, turnSkill);
        }
        setChatPending(false);
        setChatActivity(null);
        setChatTasks([]);
        opts?.onComplete?.();
      });
  }

  function handleStop() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }

  // Restart the assistant session — clear the transcript and drop the claude
  // session id, so the next message starts a fresh `claude` session.
  function restartSession() {
    // Restart is a kill switch — works even while pending. If a turn is in
    // flight (e.g. a hung worker or an orphaned fetch after HMR), clicking
    // restart is the SME's explicit "abandon and start over" signal.
    setChatPending(false);
    setChatActivity(null);
    setChatTasks([]);
    setActiveSkill(null);
    setActiveSkillEta(null);
    setMessages([]);
    setChatSessionId(null);
    setDraftingNewProcess(false);
    // Drop the persisted transcript too — a restart is a deliberate clear.
    try {
      sessionStorage.removeItem(chatStoreKey(currentSlug));
    } catch {
      /* storage unavailable — nothing to clear */
    }
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
      `Run the ${skill} skill on the process with slug "${currentSlug}" in standalone mode. ` +
        `The SME present in this session is ${user.name} (${user.role}) — use that as the ` +
        `SME identity, and stamp approvals and source context with that name.`,
      {
        skill,
        displayText: `Start a documentation session with the ${
          SKILL_LABEL[skill] ?? skill
        }.`,
      },
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
        skill: "run-lint",
        displayText: "Run a quality check across the whole process.",
        onComplete: () => {
          setLinting(false);
          pushToast(
            "success",
            "Quality check complete",
            "Open the quality review in the top bar to see the findings.",
          );
        },
      },
    );
  }

  // Council review — invoke the council-review skill via the chat. The five
  // (or one) perspective specialists challenge the proposed target and write
  // target-review.json; router.refresh() brings it into doc.targetReview,
  // which the Validation section's Council Review panel renders.
  function runCouncilReview(specialist?: string) {
    if (chatPending) return;
    setChatOpen(true);
    handleSend(
      `Run the council-review skill on the process with slug "${currentSlug}"` +
        (specialist
          ? `, with only the ${specialist} specialist.`
          : ", with the full council (all five perspective specialists)."),
      {
        skill: "council-review",
        displayText: specialist
          ? `Review the target state with the ${specialist} specialist.`
          : "Review the target state with the full council.",
        onComplete: () =>
          pushToast(
            "success",
            "Council review complete",
            "See the Council Review panel in the Validation section.",
          ),
      },
    );
  }

  // Switch the documented process. A different process gets a fresh
  // assistant session — drop the claude session id and the transcript — and
  // a deterministic welcome message naming the process now loaded. Blocked
  // while a turn is running, so an in-flight reply can't land in the new
  // process's transcript.
  function switchProcess(slug: string) {
    if (chatPending) return;
    if (slug === currentSlug && !draftingNewProcess) return;
    const next = docs.find((d) => d.slug === slug);
    setDraftingNewProcess(false);
    setCurrentSlug(slug);
    // Mirror the selection into the URL so a browser reload restores it.
    window.history.replaceState(null, "", `?p=${slug}`);
    // A process mid-foundational-run opens on Triage with the resume prompt,
    // exactly as a reload would; otherwise a fresh welcome.
    const resume = next ? resumeMessage(next) : null;
    setSection(resume ? "__triage" : "process-steps");
    // If this process has a persisted transcript from earlier in the tab
    // session, restore it (and its claude session) rather than starting over.
    const saved = loadStoredChat(slug);
    if (saved) {
      setChatSessionId(saved.sessionId);
      setMessages(saved.messages);
      return;
    }
    setChatSessionId(null);
    setMessages(
      resume
        ? [resume]
        : next
          ? [
              {
                id: mid(),
                role: "agent",
                text: `Loaded **${next.process.title}** (${next.process.id}). I've started a fresh assistant session for this process — ask me to document it, run a quality check, or work on any element.`,
              },
            ]
          : [],
    );
  }

  // New process — opens the chat and triggers the new-process skill.
  function createProcess() {
    setChatOpen(true);
    // The new-process flow is cross-process — drop any prior transcript
    // (e.g. another process's "welcome back" resume banner) so the
    // conversation starts clean and nothing stale bleeds across.
    setMessages([]);
    // Blank the canvas while the user names + confirms the new process.
    // The fresh-process effect clears this once scaffold_process.py lands
    // files on disk and the new doc appears.
    setDraftingNewProcess(true);
    handleSend("I want to create a new process.", {
      unscoped: true,
      skill: "new-process",
    });
  }

  // The App Feedback page — feedback on the tool itself, kept in feedback/.
  // Opening it leaves the process shell mounted underneath; the URL carries
  // the view so a browser reload returns here.
  function openFeedback() {
    setAppView("feedback");
    window.history.replaceState(null, "", "?view=feedback");
  }
  function closeFeedback() {
    setAppView("process");
    window.history.replaceState(null, "", `?p=${currentSlug}`);
  }

  // Document upload — once the modal has saved the file into raw-sources/,
  // open the chat and run the document-ingest skill on it.
  function onUploaded(path: string) {
    setUploadModalOpen(false);
    setChatOpen(true);
    handleSend(
      `A document has been uploaded to ${path}. Run the document-ingest skill on it for the "${doc.process.title}" process.`,
      {
        skill: "document-ingest",
        displayText: "Import the uploaded document into this process.",
        onComplete: () => setSection("__triage"),
      },
    );
  }

  // Foundational run — invoke the foundational-run skill via the chat. It
  // builds or resumes the review queue; the canvas then follows the cursor.
  function runFoundational() {
    if (chatPending) return;
    setChatOpen(true);
    handleSend(
      `Run the foundational-run skill on the process with slug "${currentSlug}". ` +
        `The SME present in this session is ${user.name} — stamp approvals with that name.`,
      {
        skill: "foundational-run",
        displayText: "Start the foundational walkthrough.",
      },
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
      {
        skill: "conflict-resolution",
        displayText: "Resolve the open document conflicts with me.",
      },
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
      {
        skill: "add-entry",
        displayText: typeLabel
          ? `Add a new ${typeLabel} to this section.`
          : "Add a new entry to this section.",
      },
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
            report: final?.text,
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
    setChatOpen(true);
    if (target.kind === "finding") {
      // The human-readable turn the SME sees in the transcript.
      const visible =
        `Deep dive on quality finding ${target.id} ("${target.title}") — ${skillClause}work through this discrepancy with me with targeted clarifying questions until the documentation is consistent.` +
        (target.detail ? `\n\nFinding detail: ${target.detail}` : "") +
        (target.elements?.length
          ? `\nImplicated elements: ${target.elements.join(", ")}.`
          : "");
      // An operating instruction for the assistant only. Sent to the CLI but
      // kept out of the transcript via displayText, and self-marked so the
      // assistant acts on it without quoting it back to the SME.
      const directive =
        `\n\n<internal-directive>\n` +
        `This is an operating instruction for you, the assistant — not a message ` +
        `from the SME. Act on it, but never quote, repeat or surface it to the SME.\n` +
        `Once the discrepancy is resolved and the SME has explicitly approved the ` +
        `change, close this finding by running ` +
        `\`python3 scripts/wiki/resolve_finding.py ${currentSlug} ${target.id} ` +
        `--note "<one-line summary of the fix>"\` — it marks the finding resolved in ` +
        `the Review panel without waiting for a re-lint. Do not run it before the ` +
        `SME has approved.\n` +
        `</internal-directive>`;
      handleSend(visible + directive, {
        displayText: visible,
        skill: specialist ?? undefined,
      });
      return;
    }
    const message = `Deep dive on element ${target.id} ("${target.title}") — ${skillClause}brainstorm this element with me: probe for edge cases, exceptions and tacit detail to deepen its documentation.`;
    handleSend(message, { skill: specialist ?? undefined });
  }

  // Review the open discussion comments on an element — runs the comment-review
  // skill, which adopts the element's owning specialist, works each open
  // comment with the SME, incorporates the agreed changes, and posts a closing
  // summary into the thread.
  function reviewComments(id: string, title: string) {
    if (chatPending) return;
    setChatOpen(true);
    const message =
      `Run the comment-review skill on element ${id} ("${title}") in the ` +
      `process with slug "${currentSlug}": work through the open discussion ` +
      `comments on this element with me.`;
    handleSend(message, {
      skill: "comment-review",
      displayText: `Review the open comments on ${title}.`,
    });
  }

  function goToElement(id: string) {
    const sec = sectionForId(schema, id);
    if (!sec) return;
    setSection(sec);
    // Clear any element filter so the jump target is never filtered out.
    setElemFilter("all");
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
        {onReturnToSplash && (
          <Tooltip label="Back to workspace chooser">
            <button
              type="button"
              className="tb-modchip"
              onClick={onReturnToSplash}
              aria-label="Back to workspace chooser"
            >
              <svg
                viewBox="0 0 24 24"
                className="tb-modchip-icon"
                aria-hidden="true"
              >
                <path d="M15 6l-6 6 6 6" />
              </svg>
              <span className="tb-modchip-wordmark">PROCESSMINER</span>
            </button>
          </Tooltip>
        )}
        <ProcessSwitcher
          processes={processList}
          currentSlug={currentSlug}
          draftingNewProcess={draftingNewProcess}
          onSelect={(slug) => {
            setAppView("process");
            switchProcess(slug);
          }}
          onCreate={() => {
            setAppView("process");
            createProcess();
          }}
          onOpenFeedback={openFeedback}
        />
        <span className="spacer" />
        <div className="tb-icons">
          {sourcing?.status === "running" && (
            <Tooltip
              label={`Sourcing ${
                sourcing.kind === "cx"
                  ? "Client Experience"
                  : sourcing.kind === "innovation"
                    ? "Innovation"
                    : "Regulation"
              } from the web — runs in the background; click to jump to it`}
            >
              <button
                className="tb-sourcing"
                onClick={() => {
                  const target =
                    sourcing.kind === "innovation"
                      ? INNOVATION_SECTIONS[0]
                      : sourcing.kind === "cx"
                        ? CX_SECTIONS[0]
                        : REGULATION_SECTIONS[0];
                  if (target) setSection(target);
                }}
                aria-label="Web sourcing in progress"
              >
                <span className="tb-sourcing-dot" />
                Sourcing…
              </button>
            </Tooltip>
          )}
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
          <Tooltip
            label={
              doc.reviewState && !doc.reviewState.done
                ? `Foundational run · ${doc.reviewState.cursor} / ${doc.reviewState.total}`
                : doc.ingest || doc.reviewState
                  ? "Triage"
                  : "Run foundational walkthrough"
            }
          >
            <button
              className="tb-icon"
              onClick={() =>
                doc.ingest || doc.reviewState
                  ? setSection("__triage")
                  : runFoundational()
              }
              aria-label="Foundational walkthrough"
            >
              <IconRun />
              {doc.reviewState && !doc.reviewState.done && (
                <span className="tb-badge">
                  {doc.reviewState.total - doc.reviewState.cursor}
                </span>
              )}
            </button>
          </Tooltip>
          <Tooltip
            label={
              linting
                ? "Running quality check…"
                : openFindings
                  ? `Quality review · ${openFindings.length} open finding(s)`
                  : "Run quality check"
            }
          >
            <button
              className="tb-icon"
              onClick={() => (findings ? setSection("__review") : runLint())}
              disabled={linting}
              aria-label="Run quality check"
            >
              <IconLint />
              {openFindings && openFindings.length > 0 && (
                <span className="tb-badge">{openFindings.length}</span>
              )}
            </button>
          </Tooltip>
          <Tooltip label="Export documentation as PDF">
            <button
              className="tb-icon"
              onClick={() => setExportOpen(true)}
              aria-label="Export documentation"
            >
              <IconExport />
            </button>
          </Tooltip>
          <Tooltip label="Agent Skills">
            <button
              className={`tb-icon${section === "__skills" ? " active" : ""}`}
              onClick={() => setSection(section === "__skills" ? "overview" : "__skills")}
              aria-label="Agent Skills"
            >
              <IconSkills />
            </button>
          </Tooltip>
          {user.isAdmin && (
            <Tooltip label="Process settings">
              <button
                className={`tb-icon${section === "__settings" ? " active" : ""}`}
                onClick={() => setSection(section === "__settings" ? "overview" : "__settings")}
                aria-label="Process settings"
              >
                ⚙
              </button>
            </Tooltip>
          )}
          <Tooltip label="Help">
            <button
              className="tb-icon"
              onClick={() => setHelpOpen(true)}
              aria-label="Help"
            >
              <IconHelp />
            </button>
          </Tooltip>
          <Tooltip label={`${user.name} · ${user.role}`}>
            <button
              className="tb-icon"
              onClick={() => {
                setUserEdit(user);
                setUserModalOpen(true);
              }}
              aria-label="Signed-in user"
            >
              <IconUser />
            </button>
          </Tooltip>
        </div>
      </header>

      {appView === "feedback" && (
        <FeedbackScreen
          feedback={feedback}
          user={user}
          onClose={closeFeedback}
        />
      )}

      <div
        className={`shell${chatOpen ? " chat-open" : ""}${
          sectionsCollapsed ? " sections-collapsed" : ""
        }${appView === "feedback" ? " is-hidden" : ""}${
          draftingNewProcess ? " drafting" : ""
        }`}
        style={{ "--chat-w": `${chatWidth}px` } as CSSProperties}
      >
        {draftingNewProcess ? (
          <main className="canvas canvas-drafting">
            <div className="canvas-head">
              <h1>New Process</h1>
              <div className="sub">
                Naming a new process — continue in the assistant on the right.
              </div>
            </div>
            <div className="empty-state">
              <p>
                The assistant will ask for the process name, then propose a
                slug, abbreviation and one-line description for you to confirm.
              </p>
              <p className="empty-hint">
                Once you approve, the process is scaffolded and this canvas
                fills in with the new process. Pick another process from the
                breadcrumb above to bail out.
              </p>
            </div>
          </main>
        ) : (
        <>
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
                        title="Open quality findings in this area"
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
                <div
                  className="nav-item-wrap"
                  style={{
                    borderBottom: "1px solid var(--line)",
                    paddingBottom: "4px",
                    marginBottom: "8px",
                  }}
                >
                  <button
                    className={`nav-item${section === "__wholedoc" ? " active" : ""}`}
                    onClick={() => setSection("__wholedoc")}
                  >
                    <span style={{ fontSize: "14px", marginRight: "4px" }}>📄</span>
                    View Document
                  </button>
                </div>
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
                      label={
                        areaStats[activeArea.id].reviewed ===
                        areaStats[activeArea.id].total
                          ? `All ${areaStats[activeArea.id].total} elements reviewed`
                          : `${areaStats[activeArea.id].reviewed} of ${
                              areaStats[activeArea.id].total
                            } elements reviewed — click to jump to what's left`
                      }
                      placement="right"
                    >
                      <button
                        type="button"
                        className="nav-area-frac"
                        disabled={
                          areaStats[activeArea.id].reviewed ===
                          areaStats[activeArea.id].total
                        }
                        onClick={() => {
                          const target = activeArea.sections.find((s) =>
                            doc.elements.some(
                              (e) => e.section === s.id && !isReviewed(e),
                            ),
                          );
                          if (target) {
                            setSection(target.id);
                            setElemFilter("unreviewed");
                          }
                        }}
                      >
                        {areaStats[activeArea.id].reviewed}/
                        {areaStats[activeArea.id].total}
                      </button>
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
                  <div key={s.id} className="nav-item-wrap">
                    <button
                      className={`nav-item${
                        s.id === section ? " active" : ""
                      }${state === "empty" ? " nav-empty" : ""}`}
                      onClick={() => {
                        setSection(s.id);
                        setElemFilter("all");
                      }}
                    >
                      <span className="nav-label">{s.label}</span>
                      <span className="nav-meta">
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
                    {flag ? (
                      <Tooltip
                        label={`${flag} quality finding${
                          flag === 1 ? "" : "s"
                        } — click to filter this section`}
                        placement="right"
                      >
                        <button
                          type="button"
                          className="nav-flag"
                          aria-label={`Filter ${s.label} to its ${flag} flagged element${
                            flag === 1 ? "" : "s"
                          }`}
                          onClick={() => {
                            setSection(s.id);
                            setElemFilter("flagged");
                          }}
                        >
                          !
                        </button>
                      </Tooltip>
                    ) : null}
                  </div>
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
          {section === "__settings" ? (
            <SettingsPanel
              slug={currentSlug}
              title={doc.process.title}
              id={doc.process.id}
              elementCount={doc.elements.length}
              sourceCount={doc.sources.length}
              onDeleted={() => {
                setSection("overview");
                router.refresh();
                onReturnToSplash?.();
              }}
            />
          ) : section === "__skills" ? (
            <SkillsDashboard onBack={() => setSection("overview")} />
          ) : section === "__wholedoc" ? (
            <>
              <div className="canvas-head">
                <h1>{doc.process.title} - {doc.process.id}</h1>
                <div className="canvas-actions">
                  <select
                    className="canvas-act"
                    value={wholeDocMode}
                    onChange={(e) => setWholeDocMode(e.target.value as any)}
                    style={{ padding: "4px 8px" }}
                  >
                    <option value="word">Document</option>
                    <option value="word-meta">Document + Meta</option>
                    <option value="source">Source</option>
                    <option value="source-expanded">Source Expanded</option>
                  </select>
                </div>
              </div>

              {wholeDocMode === "word" && (
                <WholeDocWordView
                  doc={doc}
                  schema={schema}
                  user={user}
                  elementLinks={elementLinks}
                  getRef={getRef}
                  resolveOwner={resolveOwner}
                  findingsByElement={findingsByElement}
                  currentRunId={currentRunId ?? undefined}
                  goToElement={goToElement}
                  deepDive={deepDive}
                  reviewComments={reviewComments}
                  setSelectedThemeId={setSelectedThemeId}
                  setSection={setSection}
                  expandMeta={false}
                />
              )}

              {wholeDocMode === "word-meta" && (
                <WholeDocWordView
                  doc={doc}
                  schema={schema}
                  user={user}
                  elementLinks={elementLinks}
                  getRef={getRef}
                  resolveOwner={resolveOwner}
                  findingsByElement={findingsByElement}
                  currentRunId={currentRunId ?? undefined}
                  goToElement={goToElement}
                  deepDive={deepDive}
                  reviewComments={reviewComments}
                  setSelectedThemeId={setSelectedThemeId}
                  setSection={setSection}
                  expandMeta={true}
                />
              )}

              {wholeDocMode === "source" && (
                <WholeDocJsonView doc={doc} dark={dark} expanded={false} />
              )}

              {wholeDocMode === "source-expanded" && (
                <WholeDocJsonView doc={doc} dark={dark} expanded={true} />
              )}
            </>
          ) : section === "overview" ? (
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
                userName={user.name}
                onNavigate={setSection}
                resolveSection={resolveSection}
              />
            </>
          ) : section === "__review" ? (
            <>
              <div className="canvas-head">
                <h1>Quality Review</h1>
                <div className="sub">
                  Consistency findings across the {doc.process.title}{" "}
                  documentation — structure issues, discrepancies and
                  clarifying questions for you to resolve.
                </div>
              </div>
              {doc.lint ? (
                <ReviewPanel
                  report={doc.lint}
                  slug={doc.slug}
                  userName={user.name}
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
                  <p>Running the quality check…</p>
                  <p className="empty-hint">
                    The assistant is sweeping the documentation — watch the
                    assistant chat for live progress.
                  </p>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No quality check has been run for this process yet.</p>
                  <p className="empty-hint">
                    Use “⊛ Run quality check” in the top bar to run one.
                  </p>
                </div>
              )}
            </>
          ) : section === "__triage" ? (
            <>
              <div className="canvas-head">
                <h1>Triage</h1>
                <div className="sub">
                  What the last import produced for {doc.process.title} — and
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
                  <p>No document has been imported for this process yet.</p>
                  <p className="empty-hint">
                    Use “⬆ Upload document” in the top bar to import one.
                  </p>
                </div>
              )}
            </>
          ) : section === "validation" ? (
            <>
              <div className="canvas-head">
                <h1>Validation</h1>
                <div className="sub">
                  Does the target state resolve every open As-Is problem?
                  Coverage and consistency, computed live from the
                  transformation decisions.
                </div>
              </div>
              <CoveragePanel
                coverage={coverage}
                getRef={getRef}
                onGoToElement={goToElement}
              />
              <section className="trv-block">
                <h2 className="type-group-head">Council review</h2>
                <p className="trv-block-sub">
                  The five other perspective specialists challenge the proposed
                  target — collectively, or one lens at a time.
                </p>
                <div className="trv-invoke">
                  <button
                    className="canvas-act"
                    onClick={() => runCouncilReview()}
                    disabled={chatPending}
                  >
                    ✦ Run full council
                  </button>
                  {COUNCIL_SPECIALISTS.map((s) => (
                    <button
                      key={s.id}
                      className="canvas-act"
                      onClick={() => runCouncilReview(s.id)}
                      disabled={chatPending}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {doc.targetReview ? (
                  <TargetReviewPanel
                    review={doc.targetReview}
                    getRef={getRef}
                    onGoToElement={goToElement}
                  />
                ) : (
                  <p className="empty-hint">
                    No council review has been run yet — run the full council,
                    or ask a single specialist, above.
                  </p>
                )}
              </section>
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
                        onClick={() => setExportOpen(true)}
                        title="Export process documentation as a PDF"
                      >
                        ⎙ Export PDF
                      </button>
                    </div>
                    <div className="sub">
                      Executive summary — an Amazon-style memo across the{" "}
                      {area?.label ?? areaId} area.
                    </div>
                  </div>
                  {areaId === "target" && (
                    <>
                      <section className="cov-area">
                        <h2 className="type-group-head">
                          Transformation coverage
                        </h2>
                        <CoverageRollup coverage={coverage} />
                      </section>
                      <ControlsInTarget
                        controls={doc.elements.filter(
                          (e) => e.type === "control",
                        )}
                        themes={doc.elements.filter(
                          (e) => e.type === "target-state",
                        )}
                        onGoToElement={goToElement}
                      />
                    </>
                  )}
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
                {sectionElements.length > 0 &&
                  sectionKind === null &&
                  (flaggedCount > 0 ||
                    unreviewedCount > 0 ||
                    elemFilter !== "all") && (
                    <div
                      className="elem-filter"
                      role="group"
                      aria-label="Filter elements"
                    >
                      <button
                        type="button"
                        className={`elem-filter-chip${
                          elemFilter === "all" ? " active" : ""
                        }`}
                        onClick={() => setElemFilter("all")}
                      >
                        All {sectionElements.length}
                      </button>
                      {(flaggedCount > 0 || elemFilter === "flagged") && (
                        <button
                          type="button"
                          className={`elem-filter-chip${
                            elemFilter === "flagged" ? " active" : ""
                          }`}
                          onClick={() => setElemFilter("flagged")}
                        >
                          Flagged {flaggedCount}
                        </button>
                      )}
                      {(unreviewedCount > 0 ||
                        elemFilter === "unreviewed") && (
                        <button
                          type="button"
                          className={`elem-filter-chip${
                            elemFilter === "unreviewed" ? " active" : ""
                          }`}
                          onClick={() => setElemFilter("unreviewed")}
                        >
                          Unreviewed {unreviewedCount}
                        </button>
                      )}
                    </div>
                  )}
                <span className="strip-spacer" />
                <div className="strip-actions">
                  <button
                    className="canvas-act"
                    onClick={() => setExportOpen(true)}
                    title="Export process documentation as a PDF"
                  >
                    ⎙ Export PDF
                  </button>
                  {sectionKind !== null && sectionElements.length > 0 && (
                    <button
                      className="canvas-act"
                      onClick={() => runSourcing(sectionKind)}
                      disabled={sourcing?.status === "running"}
                      title="Re-source this section from the web"
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
              {sourcing?.status === "done" &&
                sourcing.kind === sectionKind && (
                  <div className="source-status source-status-done">
                    <span className="source-status-dot" /> Web sourcing
                    complete — the drafts are below.
                    {sourcing.report && (
                      <button
                        type="button"
                        className="source-result-link"
                        onClick={() => setSourceResultOpen(true)}
                      >
                        View result
                      </button>
                    )}
                    <button
                      type="button"
                      className="source-result-dismiss"
                      onClick={() => setSourcing(null)}
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              {section === "roles" && (
                <RaciMatrix
                  steps={doc.elements.filter((e) => e.type === "process-step")}
                  roles={doc.elements.filter((e) => e.type === "role")}
                  onGoToElement={goToElement}
                />
              )}
              {section === "to-be-design" && (
                <TargetSynthesis
                  steps={doc.elements.filter((e) => e.type === "process-step")}
                  themes={doc.elements.filter((e) => e.type === "target-state")}
                  onGoToElement={goToElement}
                />
              )}
              {section === "process-steps" &&
                (() => {
                  const themes = doc.elements.filter(
                    (e) => e.type === "target-state",
                  );
                  const theme =
                    themes.find((t) => t.id === selectedThemeId) ?? null;
                  const replaces = theme
                    ? Array.isArray(theme.meta.replaces)
                      ? theme.meta.replaces
                      : theme.meta.replaces
                        ? [theme.meta.replaces]
                        : []
                    : [];
                  const highlight = theme ? new Set(replaces) : undefined;
                  return (
                    <>
                      {themes.length > 0 && (
                        <div className="flow-themepick">
                          <label htmlFor="flow-theme">
                            Overlay a target theme
                          </label>
                          <select
                            id="flow-theme"
                            value={selectedThemeId ?? ""}
                            onChange={(e) =>
                              setSelectedThemeId(e.target.value || null)
                            }
                          >
                            <option value="">Show a target theme…</option>
                            {themes.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.id} · {t.title}
                              </option>
                            ))}
                          </select>
                          {theme && replaces.length === 0 && (
                            <span className="flow-themepick-note">
                              This theme touches no As-Is steps.
                            </span>
                          )}
                        </div>
                      )}
                      <ProcessFlow
                        steps={doc.elements.filter(
                          (e) => e.type === "process-step",
                        )}
                        roles={doc.elements.filter((e) => e.type === "role")}
                        onGoToElement={goToElement}
                        onDeepDive={(id, title) =>
                          deepDive({ id, title, kind: "element" })
                        }
                        knownIds={new Set(doc.elements.map((e) => e.id))}
                        currentId={currentRunId ?? undefined}
                        controlsByStep={controlsByStep}
                        highlight={highlight}
                      />
                    </>
                  );
                })()}
              {sectionElements.length === 0 ? (
                <div className="empty-state">
                  {processEmpty ? (
                    <div className="area-next getting-started">
                      <h3>Nothing documented yet</h3>
                      <p>
                        Get started in one of two ways. Upload the initial
                        process document with the upload icon at the top right
                        — the assistant extracts it into the documentation. Or
                        run the foundational walkthrough and build the process
                        step by step with the assistant.
                      </p>
                      <div className="getting-started-actions">
                        <button
                          onClick={() => setUploadModalOpen(true)}
                          disabled={chatPending}
                        >
                          ↑ Upload the initial document
                        </button>
                        <button
                          className="ghost"
                          onClick={runFoundational}
                          disabled={chatPending}
                        >
                          ✦ Run the foundational walkthrough
                        </button>
                      </div>
                    </div>
                  ) : !sectionHasType ? (
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
                typeGroups.map((g) => {
                  const gels = g.elements.filter(elemVisible);
                  if (gels.length === 0) return null;
                  return (
                  <section key={g.type}>
                    <h2 className="type-group-head">{g.label}</h2>
                    {gels.map((el) => (
                      <ElementCard
                        key={el.id}
                        page={el}
                        slug={doc.slug}
                        userName={user.name}
                        typeLabel={
                          schema.elementTypes[el.type]?.label ?? el.type
                        }
                        template={schema.elementTypes[el.type]?.template}
                        fieldSpecs={
                          schema.elementTypes[el.type]?.frontmatter?.fields ??
                          []
                        }
                        requiredFields={
                          schema.elementTypes[el.type]?.frontmatter
                            ?.required ?? []
                        }
                        relationSpecs={
                          schema.elementTypes[el.type]?.frontmatter?.relations ??
                          []
                        }
                        links={elementLinks(el)}
                        getRef={getRef}
                        resolveOwner={resolveOwner}
                        notes={doc.notes?.[el.id]}
                        onGoToElement={goToElement}
                        onDeepDive={(id, title) =>
                          deepDive({ id, title, kind: "element" })
                        }
                        onReviewComments={reviewComments}
                        onShowOnFlow={(themeId) => {
                          setSelectedThemeId(themeId);
                          setSection("process-steps");
                        }}
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
                        allElements={doc.elements}
                      />
                    ))}
                  </section>
                  );
                })
              ) : (
                visibleElements.map((el) => (
                  <ElementCard
                    key={el.id}
                    page={el}
                    slug={doc.slug}
                    userName={user.name}
                    typeLabel={schema.elementTypes[el.type]?.label ?? el.type}
                    template={schema.elementTypes[el.type]?.template}
                    fieldSpecs={
                      schema.elementTypes[el.type]?.frontmatter?.fields ?? []
                    }
                    requiredFields={
                      schema.elementTypes[el.type]?.frontmatter?.required ?? []
                    }
                    relationSpecs={
                      schema.elementTypes[el.type]?.frontmatter?.relations ?? []
                    }
                    links={elementLinks(el)}
                    getRef={getRef}
                    resolveOwner={resolveOwner}
                    notes={doc.notes?.[el.id]}
                    onGoToElement={goToElement}
                    onDeepDive={(id, title) =>
                      deepDive({ id, title, kind: "element" })
                    }
                    onReviewComments={reviewComments}
                    onShowOnFlow={(themeId) => {
                      setSelectedThemeId(themeId);
                      setSection("process-steps");
                    }}
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
                    allElements={doc.elements}
                  />
                ))
              )}
              {sectionKind === null &&
                sectionElements.length > 0 &&
                visibleElements.length === 0 && (
                  <div className="elem-filter-empty">
                    No{" "}
                    {elemFilter === "flagged" ? "flagged" : "unreviewed"}{" "}
                    elements in this section.{" "}
                    <button
                      type="button"
                      onClick={() => setElemFilter("all")}
                    >
                      Show all {sectionElements.length}
                    </button>
                  </div>
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
        </>
        )}

        <AgentChat
          open={chatOpen}
          onToggle={() => setChatOpen((v) => !v)}
          onWidthChange={setChatWidth}
          messages={messages}
          onSend={handleSend}
          pending={chatPending}
          activity={chatActivity}
          tasks={chatTasks}
          activeSkillLabel={activeSkill ? (SKILL_LABEL[activeSkill] ?? null) : null}
          activeSkillEta={activeSkillEta}
          onRestart={restartSession}
          onRunLint={runLint}
          linting={linting}
          findingCount={openFindings ? openFindings.length : null}
          getRef={getRef}
          onStop={handleStop}
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

      <HelpCenter
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        schema={schema}
        onReplayTour={() => {
          setHelpOpen(false);
          setTourOpen(true);
        }}
        onOpenFeedback={openFeedback}
      />

      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        schema={schema}
        slug={currentSlug}
        userName={user.name}
      />

      {tourOpen && <GuidedTour steps={TOUR_STEPS} onClose={closeTour} />}

      <UploadModal
        open={uploadModalOpen}
        slug={currentSlug}
        uploadedBy={user.name}
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
              <span className="user-avatar">
                {initials(userEdit.name.trim() || user.name)}
              </span>
              <div>
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role}</div>
              </div>
            </div>
            <p className="modal-text">
              Approvals and edits in this process are stamped with this name.
              Change it below, or sign out to switch user.
            </p>
            <label className="login-field">
              <span>Name</span>
              <input
                value={userEdit.name}
                onChange={(e) =>
                  setUserEdit((u) => ({ ...u, name: e.target.value }))
                }
              />
            </label>
            <label className="login-field">
              <span>Role</span>
              <input
                value={userEdit.role}
                onChange={(e) =>
                  setUserEdit((u) => ({ ...u, role: e.target.value }))
                }
              />
            </label>
            <label className="pref-field">
              <input
                type="checkbox"
                checked={userEdit.streamReplies === true}
                onChange={(e) =>
                  setUserEdit((u) => ({
                    ...u,
                    streamReplies: e.target.checked,
                  }))
                }
              />
              <span>
                Stream replies as they are written
                <small>
                  Show the assistant&apos;s answer word by word, instead of
                  all at once when the turn finishes.
                </small>
              </span>
            </label>
            <label className="pref-field">
              <input
                type="checkbox"
                checked={dark}
                onChange={toggleTheme}
              />
              <span>
                <span className="pref-field-row">
                  Dark mode
                  <span className="pref-field-ico" aria-hidden>
                    {dark ? <IconSun /> : <IconMoon />}
                  </span>
                </span>
                <small>
                  Switch to a darker palette. Applies immediately; no need to
                  save.
                </small>
              </span>
            </label>
            <div className="modal-actions">
              <button
                className="act act-signout"
                onClick={() => {
                  setUserModalOpen(false);
                  onSignOut();
                }}
              >
                Sign out
              </button>
              <span className="modal-actions-gap" />
              <button
                className="act"
                onClick={() => setUserModalOpen(false)}
              >
                Close
              </button>
              <button
                className="act ai"
                disabled={
                  !userEdit.name.trim() ||
                  !userEdit.role.trim() ||
                  (userEdit.name.trim() === user.name &&
                    userEdit.role.trim() === user.role &&
                    (userEdit.streamReplies === true) ===
                      (user.streamReplies === true))
                }
                onClick={() => {
                  onUpdateUser({
                    ...user,
                    name: userEdit.name.trim(),
                    role: userEdit.role.trim(),
                    streamReplies: userEdit.streamReplies === true,
                  });
                  setUserModalOpen(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {sourceResultOpen && sourcing?.report && (
        <div
          className="modal-overlay"
          onClick={() => setSourceResultOpen(false)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Web sourcing result"
          >
            <div className="modal-title">Web sourcing result</div>
            <div className="source-result-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {sourcing.report}
              </ReactMarkdown>
            </div>
            <div className="modal-actions">
              <button
                className="act"
                onClick={() => setSourceResultOpen(false)}
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
