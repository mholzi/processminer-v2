"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type GetRef, buildComponents } from "./chat-linkify";
import { pickPerspective } from "@/lib/wait-perspective";

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
}

export type { GetRef };

/** Short label for the active-skill chip's ETA — "12 min" / "45 s". */
function formatEtaShort(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)} s`;
  return `${Math.round(ms / 60_000)} min`;
}

/** Don't show the perspective line before the turn has run this long. */
const PERSPECTIVE_THRESHOLD_MS = 2 * 60 * 1000;

/** "1 minute" / "14 minutes" — perspective copy reads better in whole minutes. */
function formatElapsedMinutes(ms: number): string {
  const min = Math.max(1, Math.round(ms / 60_000));
  return min === 1 ? "1 minute" : `${min} minutes`;
}

/** Cap the activity-as-placeholder so a long line doesn't wrap awkwardly. */
function truncateForPlaceholder(text: string): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > 64 ? `${t.slice(0, 61)}…` : t;
}

// Right-rail agent chat. Collapsed it is a thin rail; expanded it is a
// conversation panel that drives the Claude Code skills via /api/session,
// plus a wiki-wide "Run lint" action.
export default function AgentChat({
  open,
  onToggle,
  onWidthChange,
  messages,
  onSend,
  pending,
  activity,
  tasks,
  activeSkillLabel,
  activeSkillEta,
  onRestart,
  onRunLint,
  linting,
  findingCount,
  getRef,
  onRefClick,
  onStop,
  title = "ProcessMiner",
  subtitle = "Documents this process with you",
  emptyText,
  lintLabel,
  placeholder = "Message the assistant…",
  showLint = true,
}: {
  open: boolean;
  onToggle: () => void;
  /** Drag-resize callback — receives the new panel width in px. */
  onWidthChange: (w: number) => void;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  pending: boolean;
  activity?: string | null;
  /** Live sub-agent fan-out for the current turn — one chip per Task. */
  tasks?: { id: string; label: string; status: "running" | "done" }[];
  /** Friendly name of the skill the current turn runs — null for free text. */
  activeSkillLabel?: string | null;
  /** Median wall-clock ETA from past runs of the active skill, if any. */
  activeSkillEta?: { medianMs: number; runs: number } | null;
  onRestart: () => void;
  onRunLint: () => void;
  linting: boolean;
  findingCount: number | null;
  getRef: GetRef;
  onRefClick?: (id: string) => void;
  onStop?: () => void;
  /** Brand title rendered in the chat header. Default "ProcessMiner". */
  title?: string;
  /** One-line subtitle under the title. */
  subtitle?: string;
  /** Override the empty-state body shown when there are no messages. */
  emptyText?: ReactNode;
  /** Override the lint button's idle label. Defaults to the SME one. */
  lintLabel?: string;
  /** Textarea placeholder when no turn is pending. */
  placeholder?: string;
  /** Whether to render the lint/quality-check action row. */
  showLint?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const mdComponents = useMemo(
    () => buildComponents(getRef, onRefClick),
    [getRef, onRefClick],
  );

  // Long-wait perspective footer — a dry one-liner shown once the turn has
  // been running for >2 min. We tick elapsed every 5s (minute-precision is
  // enough; saves a re-render every second). The line is picked exactly
  // once per turn — the first time the threshold is crossed — so the user
  // can read it without it flickering on every refresh.
  const [elapsedMs, setElapsedMs] = useState(0);
  const [perspective, setPerspective] = useState<string | null>(null);
  useEffect(() => {
    if (!pending) {
      setElapsedMs(0);
      setPerspective(null);
      return;
    }
    const start = Date.now();
    const t = setInterval(() => setElapsedMs(Date.now() - start), 5000);
    return () => clearInterval(t);
  }, [pending]);
  useEffect(() => {
    if (pending && elapsedMs >= PERSPECTIVE_THRESHOLD_MS && perspective === null) {
      setPerspective(pickPerspective());
    }
  }, [pending, elapsedMs, perspective]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, linting, pending, activity]);

  if (!open) {
    return (
      <aside className="rail rail-r">
        <button
          className="rrail-btn"
          title="Open the process assistant"
          onClick={onToggle}
        >
          ✦
        </button>
        <span className="rrail-lbl">Assistant</span>
      </aside>
    );
  }

  function send() {
    const t = draft.trim();
    if (!t || pending) return;
    onSend(t);
    setDraft("");
  }

  // Drag the left-edge handle to widen / narrow the panel. The panel is
  // flush-right, so its width is the distance from the cursor to the
  // viewport's right edge; clamped to keep the document canvas usable.
  function onResizeStart(e: ReactMouseEvent) {
    e.preventDefault();
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    function onMove(ev: MouseEvent) {
      const w = window.innerWidth - ev.clientX;
      onWidthChange(Math.min(720, Math.max(300, w)));
    }
    function onUp() {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <aside className="rail rail-r chat">
      <div
        className="chat-resize"
        title="Drag to resize the panel"
        onMouseDown={onResizeStart}
      />
      <div className="chat-head">
        <span className="chat-title">{title}</span>
        <button
          className="chat-restart"
          onClick={onRestart}
          disabled={!pending && messages.length === 0}
          title={
            pending
              ? "Cancel the running turn and restart the session"
              : "Restart the assistant session — clears this conversation"
          }
        >
          ↻
        </button>
        <button
          className="chat-collapse"
          onClick={onToggle}
          title="Collapse panel"
        >
          ⟩
        </button>
      </div>
      <div className="chat-sub">{subtitle}</div>

      <div className="chat-scroll" ref={scrollRef}>
        {messages.length === 0 && !linting && !pending && (
          <div className="chat-empty">
            {emptyText ?? (
              <>
                Ask the assistant to document a process or about any element.
                Or run a quality check over the whole process.
              </>
            )}
          </div>
        )}
        {messages.map((m) => (
          <div className={`chat-msg ${m.role}`} key={m.id}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {m.text}
            </ReactMarkdown>
          </div>
        ))}
        {pending && activeSkillLabel && (
          <div className="chat-skill-chip">
            <span className="chat-skill-glyph" aria-hidden="true">
              ✦
            </span>
            {activeSkillLabel}
            <span className="chat-skill-state">· running</span>
            {activeSkillEta && (
              <span
                className="chat-skill-eta"
                title={`Median of ${activeSkillEta.runs} past run${
                  activeSkillEta.runs === 1 ? "" : "s"
                } on this machine`}
              >
                · est ~{formatEtaShort(activeSkillEta.medianMs)}
              </span>
            )}
          </div>
        )}
        {pending && tasks && tasks.length > 0 && (
          <div className="chat-task-strip" aria-label="Sub-agent fan-out">
            {tasks.map((t) => (
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
        {pending && (
          <div className="chat-msg agent pending">
            <span className="chat-activity-dot" />
            {activity || "Working…"}
          </div>
        )}
        {pending && perspective && (
          <div className="chat-perspective" aria-hidden="true">
            You&rsquo;ve been waiting {formatElapsedMinutes(elapsedMs)}.{" "}
            {perspective}
          </div>
        )}
        {linting && (
          <div className="chat-msg agent pending">Linting the wiki…</div>
        )}
      </div>

      {showLint && (
        <div className="chat-actions">
          <button className="chat-lint" onClick={onRunLint} disabled={linting}>
            {linting
              ? "Running quality check…"
              : findingCount === null
                ? lintLabel ?? "⊛ Run a quality check on the whole process"
                : `⊛ Re-run quality check · ${findingCount} open`}
          </button>
        </div>
      )}

      <div className="chat-input">
        <textarea
          value={draft}
          // While a turn is in flight, the activity ticker already shows
          // in the pending bubble above — keep the textarea placeholder
          // static so it doesn't duplicate that text.
          placeholder={pending ? "Working…" : placeholder}
          disabled={pending}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button
          className={pending ? "chat-stop" : "chat-send"}
          onClick={pending ? onStop : send}
          disabled={pending ? !onStop : !draft.trim()}
        >
          {pending ? "Stop" : "Send"}
        </button>
      </div>
    </aside>
  );
}
