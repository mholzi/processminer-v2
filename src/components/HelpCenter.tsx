"use client";

import { useEffect, useMemo, useState } from "react";
import type { Schema } from "@/lib/wiki";

type Tab = "overview" | "concepts" | "glossary" | "workflow" | "shortcuts";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "concepts", label: "How it works" },
  { id: "glossary", label: "Glossary" },
  { id: "workflow", label: "Workflow" },
  { id: "shortcuts", label: "Shortcuts" },
];

// The core mental models — explained as prose, distinct from the Glossary's
// term definitions. The concepts an SME needs to use the tool with judgement.
const CONCEPTS: { heading: string; paragraphs: string[] }[] = [
  {
    heading: "Approval vs. triage",
    paragraphs: [
      "Documentation elements — process steps, controls, regulations, systems and the like — capture the truth about the process. You move them from In progress to Approved once they are accurate, or Rejected if they are wrong. Approving one is your sign-off that it documents the process correctly.",
      "Web-sourced and ideated elements — market trends, competitors, innovation ideas, CX benchmarks — are external signals, not statements about the process. You triage them instead: Relevant, Disregard, or leave them To review. Here you judge whether the signal matters, not whether it is right.",
      "Two models, because the questions differ: a process step is either accurate or not, but a market trend is never 'wrong' — only relevant or not.",
    ],
  },
  {
    heading: "Provenance & trust",
    paragraphs: [
      "Every element heading carries a provenance tag showing where its content came from: SME (you confirmed it), DOC (taken from an imported document), PROPOSED (AI-proposed, unconfirmed), WEB (web-sourced, unconfirmed) or LEGACY (approved before provenance tracking began).",
      "PROPOSED and WEB are the ones to scrutinise — they are not yet SME-confirmed. When a document is imported, the assistant deliberately strips any detail it cannot ground in the source and flags it, rather than inventing — so an element is only as trustworthy as its tags.",
      "Once you approve an element, its card drops the 'AI-drafted' note: your sign-off becomes the record.",
    ],
  },
  {
    heading: "Triage & the foundational run",
    paragraphs: [
      "After a document is imported, the app opens the triage screen — the draft elements the import produced, with their confidence, before anything is approved. It is your first look at what the assistant extracted.",
      "The foundational run (the play icon in the top bar) then walks every imported element with you, one at a time: the assistant challenges each element, reworks it on your input, and approves it. This is how a trustworthy As-Is baseline is built.",
      "The run is resumable — if it is interrupted it picks up where it left off, and the top-bar badge shows how many items remain.",
    ],
  },
  {
    heading: "Findings & quality checks",
    paragraphs: [
      "A quality check sweeps the whole process for consistency and records what it finds. Findings come in three kinds: Discrepancy (two parts of the documentation disagree), Structure (an element does not match its template) and Question (something the documentation leaves unanswered).",
      "Findings appear on the element cards they implicate and in the quality review, opened from the checklist icon in the top bar. A quality check can re-open an already-approved element when a finding implicates it.",
      "To act on a finding, deep-dive it — a focused session that works the issue with you — or dismiss it if it does not apply.",
    ],
  },
];

// Review-state vocabulary — the same for every process, so it lives here
// rather than in any one process's wiki.
const STATUS_TERMS: { term: string; def: string }[] = [
  {
    term: "Draft",
    def: "An element the assistant has drafted but the SME has not yet confirmed.",
  },
  {
    term: "In progress",
    def: "A documentation element being worked — not yet approved.",
  },
  {
    term: "Approved",
    def: "A documentation element the SME has signed off as accurate.",
  },
  {
    term: "Rejected",
    def: "A documentation element the SME judged wrong — kept for the record.",
  },
  {
    term: "To review / Relevant / Disregard",
    def: "The triage states for web-sourced and ideated elements (trends, competitors, ideas, benchmarks). The SME judges whether the signal matters, not whether it documents the process.",
  },
];

// Per-heading provenance tags — mirror PROV_LABEL in ElementCard.
const PROVENANCE_TERMS: { term: string; def: string }[] = [
  { term: "SME", def: "Confirmed by the subject-matter expert." },
  { term: "DOC", def: "Taken from an imported source document." },
  { term: "PROPOSED", def: "AI-proposed — not yet confirmed by the SME." },
  { term: "WEB", def: "Web-sourced — not yet SME-confirmed." },
  {
    term: "LEGACY",
    def: "Approved before per-heading provenance tracking began.",
  },
];

const WORKFLOW_STEPS: { title: string; body: string }[] = [
  {
    title: "Create or pick a process",
    body: "Start a new process from the top bar, or switch to an existing one.",
  },
  {
    title: "Bring in the source material",
    body: "Upload a process document for the assistant to import, or have a perspective specialist map the As-Is process directly with you.",
  },
  {
    title: "Triage the drafts",
    body: "After an import the app lands on a triage screen — review what was drafted before the foundational run.",
  },
  {
    title: "Run the foundational walkthrough",
    body: "The assistant challenges every imported element with you, reworking and approving each in turn.",
  },
  {
    title: "Source the forward-looking view",
    body: "Have the assistant source regulations, competitor CX and market trends from the web, then refine them with the specialists.",
  },
  {
    title: "Develop the target state",
    body: "Design the to-be process, the transformation decisions and the gaps to close.",
  },
  {
    title: "Review and quality-check",
    body: "Run the council review on the target state, and a quality check over the whole process to catch cross-section discrepancies.",
  },
];

const SHORTCUTS: { keys: string; what: string }[] = [
  { keys: "⌘K  /  Ctrl+K", what: "Open search — jump to any element or section." },
  { keys: "Esc", what: "Close the open panel, modal or palette." },
  { keys: "Enter", what: "Send the current message in the assistant chat." },
  { keys: "Shift+Enter", what: "New line in the assistant chat input." },
];

// Help center — a tabbed reference modal opened from the top-bar "?" button.
export default function HelpCenter({
  open,
  onClose,
  schema,
  onReplayTour,
  onOpenFeedback,
}: {
  open: boolean;
  onClose: () => void;
  schema: Schema;
  onReplayTour: () => void;
  onOpenFeedback: () => void;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // The element-type glossary builds itself from the schema, so it never
  // drifts from the actual types. Each row: ID prefix + label + area.
  const typeTerms = useMemo(() => {
    const sectionArea = new Map<string, string>();
    for (const area of schema.areas)
      for (const s of area.sections) sectionArea.set(s.id, area.label);
    return Object.values(schema.elementTypes)
      .map((t) => ({
        prefix: t.idPrefix,
        label: t.label,
        area: sectionArea.get(t.section) ?? "",
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [schema]);

  if (!open) return null;

  const query = q.trim().toLowerCase();
  const matchTerm = (...s: string[]) =>
    !query || s.some((x) => x.toLowerCase().includes(query));

  return (
    <div className="help-overlay" onClick={onClose}>
      <div
        className="help-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Help"
      >
        <div className="help-head">
          <span className="help-title">ProcessMiner — Help</span>
          <button className="help-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="help-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`help-tab${tab === t.id ? " active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="help-body">
          {tab === "overview" && (
            <div className="help-prose">
              <p>
                ProcessMiner documents a banking process end to end. AI
                specialists elicit knowledge from you, the subject-matter
                expert, and develop it into a target state.
              </p>
              <p>
                Each process is a living set of elements organised into six
                areas: As-Is Process, Risk &amp; Compliance, Client Experience,
                Innovation, Target Process and IT Architecture.
              </p>
              <p>
                <b>Every element is AI-drafted until you approve it.</b> The
                assistant proposes; you confirm, correct or reject. Your
                sign-off is what makes the documentation authoritative.
              </p>
              <button className="help-action" onClick={onReplayTour}>
                ✦ Replay the guided tour
              </button>
              <div className="help-gloss-group">Feedback &amp; support</div>
              <p>
                Found a bug, or have an idea for the tool itself? Log it on the
                App Feedback page — that is where feedback on ProcessMiner is
                collected and tracked.
              </p>
              <button
                className="help-action"
                onClick={() => {
                  onClose();
                  onOpenFeedback();
                }}
              >
                Open the App Feedback page
              </button>
            </div>
          )}

          {tab === "concepts" && (
            <div className="help-prose">
              {CONCEPTS.map((c) => (
                <section className="help-concept" key={c.heading}>
                  <div className="help-gloss-group">{c.heading}</div>
                  {c.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </section>
              ))}
            </div>
          )}

          {tab === "glossary" && (
            <>
              <input
                className="help-search"
                placeholder="Filter the glossary…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <div className="help-gloss-group">Element types</div>
              {typeTerms
                .filter((t) => matchTerm(t.prefix, t.label, t.area))
                .map((t) => (
                  <div className="help-gloss-row" key={t.prefix + t.label}>
                    <span className="help-gloss-term">
                      <span className="help-prefix">{t.prefix}</span>
                      {t.label}
                    </span>
                    <span className="help-gloss-def">{t.area}</span>
                  </div>
                ))}
              <div className="help-gloss-group">Review states</div>
              {STATUS_TERMS.filter((t) => matchTerm(t.term, t.def)).map((t) => (
                <div className="help-gloss-row" key={t.term}>
                  <span className="help-gloss-term">{t.term}</span>
                  <span className="help-gloss-def">{t.def}</span>
                </div>
              ))}
              <div className="help-gloss-group">Provenance tags</div>
              {PROVENANCE_TERMS.filter((t) => matchTerm(t.term, t.def)).map(
                (t) => (
                  <div className="help-gloss-row" key={t.term}>
                    <span className="help-gloss-term">
                      <span className="help-prefix">{t.term}</span>
                    </span>
                    <span className="help-gloss-def">{t.def}</span>
                  </div>
                ),
              )}
            </>
          )}

          {tab === "workflow" && (
            <ol className="help-workflow">
              {WORKFLOW_STEPS.map((s) => (
                <li key={s.title}>
                  <span className="help-wf-title">{s.title}</span>
                  <span className="help-wf-body">{s.body}</span>
                </li>
              ))}
            </ol>
          )}

          {tab === "shortcuts" && (
            <div className="help-shortcuts">
              {SHORTCUTS.map((s) => (
                <div className="help-gloss-row" key={s.keys}>
                  <span className="help-keys">{s.keys}</span>
                  <span className="help-gloss-def">{s.what}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
