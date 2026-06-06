"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAgentChat } from "./useAgentChat";
import { type Advisor, ADVISORS, ADVISOR_LABELS, getAdvisor } from "@/lib/advisor";
import type { User } from "@/lib/user";
import type { ProcessDoc } from "@/lib/wiki";
import AdvisorOverviewCard from "./AdvisorOverviewCard";
import AdvisorPortfolioCard from "./AdvisorPortfolioCard";
import { type GetRef, buildComponents, ELEMENT_ID } from "./chat-linkify";
import { pickPerspective } from "@/lib/wait-perspective";

function prettifyType(t: string): string {
  return t.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// The distinct element ids an advisor message cites (for "save as note").
function citedIds(text: string): string[] {
  const ids = new Set<string>();
  let m: RegExpExecArray | null;
  ELEMENT_ID.lastIndex = 0;
  while ((m = ELEMENT_ID.exec(text))) ids.add(m[0]);
  return [...ids];
}

// Long-wait perspective footer — same threshold/behaviour as the module chat.
const PERSPECTIVE_THRESHOLD_MS = 2 * 60 * 1000;
function formatElapsedMinutes(ms: number): string {
  const min = Math.max(1, Math.round(ms / 60_000));
  return min === 1 ? "1 minute" : `${min} minutes`;
}
function formatEtaShort(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)} s`;
  return `${Math.round(ms / 60_000)} min`;
}

// Deterministic card directive. A standard-question chip writes this block into
// the transcript (the CLIENT writes it, not the LLM) and the renderer swaps it
// for <AdvisorOverviewCard>. The slug is the only payload; the card computes
// everything from the ProcessDoc. Format stays human-readable + reusable.
function overviewSlug(text: string): string | null {
  const m = text.match(/```pm-overview\s+slug:\s*([a-z0-9-]+)/i);
  return m ? m[1] : null;
}
// Portfolio card directive — covers all processes, so it carries no slug.
function isPortfolio(text: string): boolean {
  return /```pm-portfolio\b/.test(text);
}

let _abSeq = 0;
function mid(): string {
  _abSeq += 1;
  return `ab${Date.now().toString(36)}-${_abSeq}`;
}

// The Advisory Board slide-over. Opens over the dashboard when the user clicks
// an advisor; the dashboard stays visible (dimmed) behind it. Reuses the full
// useAgentChat pipeline — the persona + read-only contract + allow-list are
// assembled server-side from the `advisor` id on the first turn (see
// src/lib/advisor-server.ts), so here we just drive the chat and switch persona.
export default function AdvisorChat({
  advisorId,
  onSwitch,
  onClose,
  docs,
  user,
  onOpenProcess,
}: {
  advisorId: string;
  onSwitch: (id: string) => void;
  onClose: () => void;
  /** The user's accessible processes — drives the allow-list, the picker, and
   *  the overview cards (each card is computed from its ProcessDoc). */
  docs: ProcessDoc[];
  user: User;
  /** Open a process in the main canvas (closes the slide-over). */
  onOpenProcess?: (slug: string) => void;
}) {
  const advisor = getAdvisor(advisorId) ?? ADVISORS[0];
  const allowedSlugs = docs.map((d) => d.slug);
  const [picker, setPicker] = useState(false);
  const [draft, setDraft] = useState("");

  const chat = useAgentChat({
    storePrefix: "ab",
    slug: advisor.id, // per-advisor transcript + session
    streamReplies: user.streamReplies !== false,
    skillLabels: ADVISOR_LABELS,
    scopePreamble: "", // the server builds the advisor preamble from `advisor`
    advisor: advisor.id,
    advisorSlugs: allowedSlugs,
    userName: user.name,
  });

  // Cross-process element-id linkify: resolve a cited id (e.g. CTL-COB-004)
  // against every accessible process, preview on hover, open its process on
  // click. Same mechanism as the per-process module chat (chat-linkify).
  const refIndex = useMemo(() => {
    const idx = new Map<string, { page: ProcessDoc["elements"][number]; slug: string }>();
    for (const d of docs) {
      for (const e of d.elements) {
        if (!idx.has(e.id)) idx.set(e.id, { page: e, slug: d.slug });
      }
    }
    return idx;
  }, [docs]);
  const mdComponents = useMemo(() => {
    const getRef: GetRef = (id) => {
      const hit = refIndex.get(id);
      return hit ? { page: hit.page, typeLabel: prettifyType(hit.page.type) } : undefined;
    };
    const onRefClick = (id: string) => {
      const hit = refIndex.get(id);
      if (hit) onOpenProcess?.(hit.slug);
    };
    return buildComponents(getRef, onRefClick);
  }, [refIndex, onOpenProcess]);

  // "Save as note" — capture an advisor point as a discussion comment on a
  // cited element, attributed to the advisor (the note author is the signed-in
  // user; the advisor name is prefixed for traceability). Read-only contract is
  // intact — this is a user action through the existing /api/notes writer.
  const [notePick, setNotePick] = useState<string | null>(null); // message id picking a target
  const [savedNote, setSavedNote] = useState<
    Record<string, { elementId: string; slug: string }>
  >({});
  const saveNote = async (msgId: string, text: string, elementId: string) => {
    const hit = refIndex.get(elementId);
    if (!hit) return;
    setNotePick(null);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          slug: hit.slug,
          elementId,
          text: `**${advisor.name}** (advisory): ${text}`,
        }),
      });
      if (res.ok) {
        setSavedNote((s) => ({ ...s, [msgId]: { elementId, slug: hit.slug } }));
      }
    } catch {
      /* leave the button so the user can retry */
    }
  };

  // Long-wait perspective footer — tick elapsed every 5s while pending, pick the
  // line once when the threshold is first crossed (same as the module chat).
  const [elapsedMs, setElapsedMs] = useState(0);
  const [perspective, setPerspective] = useState<string | null>(null);
  useEffect(() => {
    if (!chat.pending) {
      setElapsedMs(0);
      setPerspective(null);
      return;
    }
    const start = Date.now();
    const t = setInterval(() => setElapsedMs(Date.now() - start), 5000);
    return () => clearInterval(t);
  }, [chat.pending]);
  useEffect(() => {
    if (chat.pending && elapsedMs >= PERSPECTIVE_THRESHOLD_MS && perspective === null) {
      setPerspective(pickPerspective());
    }
  }, [chat.pending, elapsedMs, perspective]);

  const submit = () => {
    const t = draft.trim();
    if (!t || chat.pending) return;
    // Drive the running/ETA chip + per-advisor ETA history off the advisor id.
    chat.send(t, { skill: advisor.id });
    setDraft("");
  };

  // A standard-question chip → pick a process → inject a deterministic overview
  // card into the transcript. No model turn; the card renders from the doc.
  const askOverview = (slug: string) => {
    const proc = docs.find((d) => d.slug === slug);
    const label = proc ? `${proc.process.id} · ${proc.process.title}` : slug;
    chat.setMessages((m) => [
      ...m,
      { id: mid(), role: "user", text: `Overview of ${label}` },
      { id: mid(), role: "agent", text: "```pm-overview\nslug: " + slug + "\n```" },
    ]);
    setPicker(false);
  };

  // Portfolio overview — no picker, covers every process the user can see.
  const askPortfolio = () => {
    setPicker(false);
    chat.setMessages((m) => [
      ...m,
      { id: mid(), role: "user", text: "Overview of my portfolio" },
      { id: mid(), role: "agent", text: "```pm-portfolio\n```" },
    ]);
  };

  return (
    <>
      <div className="ab-scrim" onClick={onClose} aria-hidden="true" />
      <aside
        className="ab-over"
        role="dialog"
        aria-label={`Chat with the ${advisor.name}`}
      >
        <div className="ab-over-head">
          <span className="ab-av">{advisor.monogram}</span>
          <span className="ab-over-who">
            <span className="ab-over-name">{advisor.name}</span>
            <span className="ab-over-sub">Reads across all your processes</span>
          </span>
          <span className="ab-over-pill">read-only</span>
          <button
            type="button"
            className="ab-over-restart"
            onClick={chat.restart}
            disabled={!chat.pending && chat.messages.length === 0}
            title="Restart this conversation"
          >
            ↻
          </button>
          <button
            type="button"
            className="ab-over-x"
            onClick={onClose}
            title="Close"
            aria-label="Close advisor chat"
          >
            ✕
          </button>
        </div>

        <div className="ab-switch" role="tablist" aria-label="Switch advisor">
          {ADVISORS.map((a: Advisor) => (
            <button
              key={a.id}
              type="button"
              role="tab"
              aria-selected={a.id === advisor.id}
              className={`ab-pk${a.id === advisor.id ? " sel" : ""}`}
              title={`${a.name} — ${a.blurb}`}
              onClick={() => a.id !== advisor.id && onSwitch(a.id)}
            >
              {a.monogram}
            </button>
          ))}
          <span className="ab-switch-l">switch advisor</span>
        </div>

        <div className="ab-thread">
          {chat.messages.length === 0 && !chat.pending && (
            <div className="ab-msg agent ab-greeting">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {advisor.greeting}
              </ReactMarkdown>
            </div>
          )}
          {chat.messages.map((m) => {
            if (m.role === "agent" && isPortfolio(m.text)) {
              return (
                <div className="ab-msg agent ab-card-wrap" key={m.id}>
                  <AdvisorPortfolioCard
                    docs={docs}
                    onOpenProcess={onOpenProcess}
                    onOpenDashboard={onClose}
                  />
                </div>
              );
            }
            const slug = m.role === "agent" ? overviewSlug(m.text) : null;
            if (slug) {
              const doc = docs.find((d) => d.slug === slug);
              return (
                <div className="ab-msg agent ab-card-wrap" key={m.id}>
                  {doc ? (
                    <AdvisorOverviewCard doc={doc} onOpenProcess={onOpenProcess} />
                  ) : (
                    <span className="muted">Process {slug} is not available.</span>
                  )}
                </div>
              );
            }
            const cited =
              m.role === "agent"
                ? citedIds(m.text).filter((id) => refIndex.has(id))
                : [];
            return (
              <div className={`ab-msg ${m.role}`} key={m.id}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {m.text}
                </ReactMarkdown>
                {cited.length > 0 && (
                  <div className="ab-note-bar">
                    {savedNote[m.id] ? (
                      <span className="ab-note-done">
                        ✓ Saved as note on{" "}
                        <button
                          type="button"
                          className="ab-note-link"
                          onClick={() => onOpenProcess?.(savedNote[m.id].slug)}
                        >
                          {savedNote[m.id].elementId}
                        </button>
                      </span>
                    ) : notePick === m.id ? (
                      <span className="ab-note-pick">
                        Attach to:
                        {cited.map((id) => (
                          <button
                            key={id}
                            type="button"
                            className="ab-note-opt"
                            onClick={() => saveNote(m.id, m.text, id)}
                          >
                            {id}
                          </button>
                        ))}
                        <button
                          type="button"
                          className="ab-note-cancel"
                          onClick={() => setNotePick(null)}
                        >
                          cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="ab-note-btn"
                        onClick={() =>
                          cited.length === 1
                            ? saveNote(m.id, m.text, cited[0])
                            : setNotePick(m.id)
                        }
                      >
                        💬 Save as note
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {chat.pending && chat.activeSkill && (
            <div className="chat-skill-chip">
              <span className="chat-skill-glyph" aria-hidden="true">✦</span>
              {ADVISOR_LABELS[chat.activeSkill] ?? advisor.name}
              <span className="chat-skill-state">· running</span>
              {chat.activeSkillEta && (
                <span
                  className="chat-skill-eta"
                  title={`Median of ${chat.activeSkillEta.runs} past run${
                    chat.activeSkillEta.runs === 1 ? "" : "s"
                  } on this machine`}
                >
                  · est ~{formatEtaShort(chat.activeSkillEta.medianMs)}
                </span>
              )}
            </div>
          )}
          {chat.pending && chat.tasks.length > 0 && (
            <div className="chat-task-strip" aria-label="Sub-agent fan-out">
              {chat.tasks.map((t) => (
                <span
                  key={t.id}
                  className={`chat-task-chip chat-task-${t.status}`}
                  title={t.label}
                >
                  <span className="chat-task-mark" aria-hidden="true">
                    {t.status === "done" ? "✓" : "⟳"}
                  </span>
                  {t.label}
                </span>
              ))}
            </div>
          )}
          {chat.pending && (
            <div className="ab-msg agent pending">
              <span className="ab-dot" />
              {chat.activity || "Working…"}
            </div>
          )}
          {chat.pending && perspective && (
            <div className="chat-perspective" aria-hidden="true">
              You&rsquo;ve been waiting {formatElapsedMinutes(elapsedMs)}. {perspective}
            </div>
          )}
        </div>

        {/* Standard-question chips — deterministic entry points. Clicking one
            renders a defined layout (the overview card), no model guesswork. */}
        <div className="ab-chips">
          <button
            type="button"
            className={`ab-chip${picker ? " on" : ""}`}
            onClick={() => setPicker((p) => !p)}
          >
            📋 Process overview
          </button>
          <button type="button" className="ab-chip" onClick={askPortfolio}>
            📊 Portfolio overview
          </button>
          {picker && (
            <div className="ab-picker" role="menu">
              <div className="ab-picker-h">Which process?</div>
              {docs.length === 0 && (
                <div className="ab-picker-empty muted">No processes available.</div>
              )}
              {docs
                .filter((d) => d.process.id || d.process.title)
                .map((d) => (
                <button
                  key={d.slug}
                  type="button"
                  role="menuitem"
                  className="ab-picker-row"
                  onClick={() => askOverview(d.slug)}
                >
                  <span className="ab-picker-id">{d.process.id}</span>
                  <span className="ab-picker-nm">{d.process.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ab-composer">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={`Ask the ${advisor.name}…`}
            rows={1}
          />
          {chat.pending ? (
            <button
              type="button"
              className="ab-send stop"
              onClick={chat.stop}
              title="Stop"
            >
              ◼
            </button>
          ) : (
            <button
              type="button"
              className="ab-send"
              onClick={submit}
              disabled={!draft.trim()}
              title="Send"
            >
              ↑
            </button>
          )}
        </div>
        <div className="ab-hint">
          Advice only — to change a process, open it and run the specialist.
        </div>
      </aside>
    </>
  );
}
