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
import UserMenu from "@/components/UserMenu";
import ContributorsView from "@/components/ContributorsView";
import { buildRelations, type LinkGroup } from "@/lib/relations";
import { sectionForId } from "@/lib/nav";
import { isOpen, type LintFinding } from "@/lib/lint";
import ElementCard from "@/components/ElementCard";
import RaciMatrix from "@/components/RaciMatrix";
import ProcessFlow from "@/components/ProcessFlow";
import AuditFindingsSummary from "@/components/AuditFindingsSummary";
import ControlGapsSummary from "@/components/ControlGapsSummary";
import ControlsSummary from "@/components/ControlsSummary";
import CountryVariationsSummary from "@/components/CountryVariationsSummary";
import ExceptionsSummary from "@/components/ExceptionsSummary";
import MetricsSummary from "@/components/MetricsSummary";
import OverviewPanel from "@/components/OverviewPanel";
import PainPointsSummary from "@/components/PainPointsSummary";
import RegulationSummary from "@/components/RegulationSummary";
import SettingsPanel from "@/components/SettingsPanel";
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
import { useAgentChat } from "@/hooks/useAgentChat";
import {
  SKILL_LABEL,
  chatStoreKey,
  loadStoredChat,
  mid,
} from "@/lib/agent-chat-utils";

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
// The long-turn UX helpers (ETA + notifications + SKILL_LABEL) and the chat
// session-storage helpers live in @/lib/agent-chat-utils; the chat state +
// SSE pipeline live in @/hooks/useAgentChat.

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
    `The SME present in this session is ${user.name} (${user.role}), stable`,
    `user ID \`${user.username}\`. When you stamp \`updatedBy\`, \`approvedBy\`,`,
    "or any other attribution field — and when you pass `--by` to a wiki",
    `script — use the user ID \`${user.username}\`, not the display name.`,
    "Display names are resolved at render time. Never ask the SME for their",
    "name or ID.",
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

// The Processminer chat transcript is keyed under "pm-chat-<slug>" by
// chatStoreKey + loadStoredChat from @/lib/agent-chat-utils, so a page
// reload (or dev hot-reload) restores the conversation instead of dropping
// it — a foundational run can span hours.
const PM_CHAT_STORE_PREFIX = "pm-chat";

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
  onEnterAdmin,
  onSignOut,
  initialSlug,
  createNewToken,
  onReturnToSplash,
}: {
  schema: Schema;
  docs: ProcessDoc[];
  feedback: FeedbackItem[];
  user: User;
  onUpdateUser: (user: User) => void;
  onEnterAdmin?: () => void;
  onSignOut: () => void;
  initialSlug?: string;
  /** Monotonically increases each time the splash's "+ New process" chip is
   *  clicked. When it changes, run the new-process flow. */
  createNewToken?: number;
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
  // Lights up when a chat turn finishes while the chat isn't visible — the
  // user closed it, switched to the feedback view, etc. Renders as a dot on
  // the collapsed assistant rail, clears as soon as the chat is back in view.
  const [chatUnread, setChatUnread] = useState(false);
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
  // All chat state + the SSE pipeline + transcript persistence + the
  // stuck-turn watchdog live in the useAgentChat hook. ProcessDocScreen only
  // needs the values + the handleSend / restartSession callbacks to drive
  // the right rail and the run-* wrappers further down.
  const chat = useAgentChat({
    doc,
    user,
    scopePreamble,
    storePrefix: PM_CHAT_STORE_PREFIX,
    productName: "Processminer",
    // Only seed the resume banner when the in-flight run belongs to the
    // process the user actually opened — otherwise a user picking New Hire
    // from the splash would see a "Resume SEPA Payment Processing" banner.
    initialMessage: () =>
      openingRunDoc && openingRunDoc.slug === currentSlug
        ? resumeMessage(openingRunDoc)
        : null,
  });
  const {
    messages,
    setMessages,
    chatPending,
    setChatPending,
    chatActivity,
    chatTasks,
    activeSkill,
    activeSkillEta,
    chatSessionId,
    setChatSessionId,
    handleSend,
    restartSession: baseRestartSession,
  } = chat;
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
  // Legacy local user-modal state was removed in favor of the UserMenu
  // popover (see src/components/UserMenu.tsx). Profile + password edits now
  // hit /api/auth/profile + /api/auth/password directly.

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

  // Live document refresh while a sourcing run is in flight. The chat-turn
  // case is handled by useAgentChat (which already polls router.refresh on
  // its own state); this effect covers source-* runs, which run outside the
  // chat and would otherwise leave the document frozen while files land.
  useEffect(() => {
    if (sourcing?.status !== "running") return;
    const t = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(t);
  }, [sourcing, router]);

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

  // Turn-completion badge — set when a pending turn ends and the chat isn't
  // visible, cleared as soon as the user can see it. We track the previous
  // value of chatPending so we react to the falling edge, not the steady
  // state. The chat is "visible" when it's open AND we're on the process
  // canvas (the feedback / admin overlays hide it).
  const prevChatPending = useRef(false);
  useEffect(() => {
    const wasPending = prevChatPending.current;
    prevChatPending.current = chatPending;
    if (!wasPending || chatPending) return;
    const chatVisible = chatOpen && appView === "process";
    if (!chatVisible) setChatUnread(true);
  }, [chatPending, chatOpen, appView]);
  useEffect(() => {
    if (chatOpen && appView === "process") setChatUnread(false);
  }, [chatOpen, appView]);

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

  // The Process Assistant chat is driven by useAgentChat above:
  //   - handleSend(text, opts) — send a turn (free text or a skill wrapper)
  //   - restartSession()       — kill switch, clears transcript + claude session
  // The hook handles SSE streaming, ETA recording, the long-turn notification,
  // the live activity ticker, sub-agent task fan-out, transcript persistence,
  // and the stuck-turn watchdog. ProcessDocScreen's only job here is to also
  // clear `draftingNewProcess` when the SME hits restart — the rest is owned.
  const restartSession = () => {
    baseRestartSession();
    setDraftingNewProcess(false);
  };

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
        `The SME present in this session is ${user.name} (${user.role}), stable user ID ` +
        `\`${user.username}\` — stamp approvals and source context with the user ID, ` +
        `not the display name.`,
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
    const saved = loadStoredChat(PM_CHAT_STORE_PREFIX, slug);
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
    // conversation starts clean and nothing stale bleeds across. We clear
    // both the in-memory messages AND the persisted entry for the slug we
    // happen to be sitting on, otherwise useAgentChat's mount-restore
    // effect (in StrictMode or after a remount) will re-load it.
    try {
      sessionStorage.removeItem(`${PM_CHAT_STORE_PREFIX}-${currentSlug}`);
    } catch {
      /* storage unavailable — best-effort */
    }
    setMessages([]);
    setChatSessionId(null);
    // Blank the canvas while the user names + confirms the new process.
    // The fresh-process effect clears this once scaffold_process.py lands
    // files on disk and the new doc appears.
    setDraftingNewProcess(true);
    handleSend("I want to create a new process.", {
      unscoped: true,
      skill: "new-process",
    });
  }

  // The splash's "+ New process" chip enters this workspace with a non-zero
  // createNewToken — we fire the new-process flow when the token grows past
  // what we've already handled, so opening a recent chip (which resets the
  // token to 0) doesn't accidentally re-trigger it on remount.
  const lastSeenCreateToken = useRef(0);
  useEffect(() => {
    if (!createNewToken) return; // 0 / undefined → no create intent
    if (lastSeenCreateToken.current === createNewToken) return;
    lastSeenCreateToken.current = createNewToken;
    createProcess();
    // createProcess captures handleSend/setMessages/setChatOpen — exhaustive
    // deps would add it on every render and re-fire the flow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createNewToken]);

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
        `The SME present in this session is ${user.name}, stable user ID ` +
        `\`${user.username}\` — stamp approvals with the user ID, not the display name.`,
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
          {!draftingNewProcess && (
            <>
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
            </>
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
          <UserMenu
            user={user}
            onUserUpdated={onUpdateUser}
            onEnterAdmin={user.isAdmin ? onEnterAdmin : undefined}
            onSignOut={onSignOut}
          />
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
              <button
                type="button"
                className={`contrib-trigger${
                  section === "__contributors" ? " active" : ""
                }`}
                onClick={() => setSection("__contributors")}
                title="See everyone who has touched this process"
              >
                <span className="contrib-trigger-ico" aria-hidden>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="9" cy="8" r="3.4" />
                    <circle cx="17" cy="9" r="2.6" />
                    <path d="M3 19a6 6 0 0 1 12 0" />
                    <path d="M14 18a5 5 0 0 1 7 1" />
                  </svg>
                </span>
                <span className="contrib-trigger-label">Contributors</span>
                <span className="contrib-trigger-chevron">›</span>
              </button>
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
              <button
                type="button"
                className={`contrib-trigger${
                  section === "__settings" ? " active" : ""
                }`}
                onClick={() => setSection("__settings")}
                title="Per-process info, access, and danger zone"
              >
                <span className="contrib-trigger-ico" aria-hidden>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
                  </svg>
                </span>
                <span className="contrib-trigger-label">Settings</span>
                <span className="contrib-trigger-chevron">›</span>
              </button>
            </div>
          )}
        </nav>

        <main className="canvas">
          {section === "overview" ? (
            <>
              <div className="canvas-title">
                <h1>Overview</h1>
                <div className="sub">
                  {doc.process.id} — {doc.process.title}
                </div>
              </div>
              <OverviewPanel
                process={doc.process}
                elements={doc.elements}
                slug={doc.slug}
                onNavigate={setSection}
                resolveSection={resolveSection}
                onDeepDive={(id, title) =>
                  deepDive({ id, title, kind: "element" })
                }
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
          ) : section === "__contributors" ? (
            <ContributorsView
              slug={currentSlug}
              processTitle={doc.process.title}
            />
          ) : section === "__settings" ? (
            <SettingsPanel
              slug={currentSlug}
              title={doc.process.title}
              idPrefix={String(doc.process.meta.id ?? "")}
              sources={
                Array.isArray(doc.process.meta.sources)
                  ? (doc.process.meta.sources as unknown[]).map(String)
                  : doc.process.meta.source
                    ? [String(doc.process.meta.source)]
                    : []
              }
              onDeleted={() => {
                // Drop the deleted slug's transcript so a future process
                // with the same slug doesn't inherit it, then move the user
                // off the now-defunct process. The workspace lives in
                // AuthGate's React state (not the URL), so onReturnToSplash
                // is what flips the view; router.refresh() then re-fetches
                // the server-rendered `docs` so the splash drops the slug.
                try {
                  sessionStorage.removeItem(
                    `${PM_CHAT_STORE_PREFIX}-${currentSlug}`,
                  );
                } catch {
                  /* storage unavailable — fine */
                }
                if (onReturnToSplash) {
                  onReturnToSplash();
                  router.refresh();
                } else {
                  window.location.href = "/";
                }
              }}
            />
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
              {section === "pain-points" && sectionElements.length > 0 && (
                <PainPointsSummary
                  painPoints={sectionElements}
                  onPickElement={goToElement}
                  getRef={getRef}
                />
              )}
              {section === "country-variations" && sectionElements.length > 0 && (
                <CountryVariationsSummary
                  variations={sectionElements}
                  onPickElement={goToElement}
                  getRef={getRef}
                />
              )}
              {section === "controls" && sectionElements.length > 0 && (
                <ControlsSummary
                  controls={sectionElements}
                  onPickElement={goToElement}
                  getRef={getRef}
                />
              )}
              {section === "regulation" && sectionElements.length > 0 && (
                <RegulationSummary
                  regulations={sectionElements}
                  allElements={doc.elements}
                  onPickElement={goToElement}
                  getRef={getRef}
                />
              )}
              {section === "control-gaps" && sectionElements.length > 0 && (
                <ControlGapsSummary
                  gaps={sectionElements}
                  onPickElement={goToElement}
                  getRef={getRef}
                />
              )}
              {section === "audit-findings" && sectionElements.length > 0 && (
                <AuditFindingsSummary
                  findings={sectionElements}
                  onPickElement={goToElement}
                  getRef={getRef}
                />
              )}
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
                      // One section is empty but the area isn't — the primary
                      // action is "add an entry here", not "start a full
                      // multi-section walkthrough". The specialist CTA is
                      // still available as a secondary affordance.
                      return (
                        <>
                          <p className="empty-hint">
                            Let the assistant draft the first one with you —
                            or capture it yourself.
                          </p>
                          <div className="empty-cta-row">
                            <button
                              className="empty-cta"
                              onClick={() => addEntry()}
                              disabled={chatPending}
                            >
                              ✦ Add the first entry
                            </button>
                            {spec && (
                              <button
                                className="empty-cta empty-cta-secondary"
                                onClick={() =>
                                  runAreaSpecialist(sec!.specialist!)
                                }
                                disabled={chatPending}
                                title={`Run the full ${spec.label} across every section in this area`}
                              >
                                or run the full {spec.label} →
                              </button>
                            )}
                          </div>
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
                        fieldValues={schema.fieldValues}
                        requiredFields={
                          schema.elementTypes[el.type]?.frontmatter
                            ?.required ?? []
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
                      />
                    ))}
                  </section>
                  );
                })
              ) : (
                <>
                  {section === "metrics" && (
                    <MetricsSummary
                      metrics={sectionElements}
                      onPickElement={goToElement}
                      getRef={getRef}
                    />
                  )}
                  {section === "exceptions" && (
                    <ExceptionsSummary
                      exceptions={sectionElements}
                      onPickElement={goToElement}
                      getRef={getRef}
                    />
                  )}
                  {visibleElements.map((el) => (
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
                    fieldValues={schema.fieldValues}
                    requiredFields={
                      schema.elementTypes[el.type]?.frontmatter?.required ?? []
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
                  />
                  ))}
                </>
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
          showLint={!draftingNewProcess}
          unread={chatUnread}
          getRef={getRef}
          onRefClick={goToElement}
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
