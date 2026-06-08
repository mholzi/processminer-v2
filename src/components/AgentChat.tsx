"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type GetRef, buildComponents } from "./chat-linkify";
import { pickPerspective } from "@/lib/wait-perspective";
import type { TurnUsage } from "@/lib/agent-chat";
import { useFeatureFlag } from "@/lib/feature-flags-context";

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  /** This turn's token usage, shown as a compact receipt under an agent
   *  message when the provider reported it. */
  usage?: TurnUsage;
  /** This turn's wall-clock run-time in ms, shown alongside the token receipt. */
  durationMs?: number;
}

/** "12.3k" / "950" — compact token count. */
function fmtTokens(n: number): string {
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(2)}k`;
  return String(n);
}

/** "850ms" / "4.2s" / "3m 12s" — compact duration. */
function fmtDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60_000);
  const s = Math.round((ms % 60_000) / 1000);
  return `${m}m ${s}s`;
}

/** The dim per-turn receipt: input / output tokens, cache reads, and run-time.
 *  Shown only when the `session.token_receipt` admin flag is on. */
function UsageReceipt({ u, durationMs }: { u?: TurnUsage; durationMs?: number }) {
  const parts: string[] = [];
  if (u) {
    parts.push(`${fmtTokens(u.inputTokens)} in`, `${fmtTokens(u.outputTokens)} out`);
    if (u.cacheReadTokens > 0) parts.push(`${fmtTokens(u.cacheReadTokens)} cached`);
  }
  if (durationMs && durationMs > 0) parts.push(fmtDuration(durationMs));
  if (parts.length === 0) return null;
  return (
    <div className="chat-msg-usage" title="LLM tokens and run-time for this turn">
      {parts.join(" · ")}
    </div>
  );
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
  const showTokenReceipt = useFeatureFlag("session.token_receipt");
  const scrollRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  // Current panel width, mirrored for the resize separator's aria-valuenow.
  // The parent owns the width (via onWidthChange); we read it off the DOM.
  const [panelWidth, setPanelWidth] = useState(0);
  useEffect(() => {
    if (open && asideRef.current) setPanelWidth(asideRef.current.offsetWidth);
  }, [open]);
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
          aria-label="Open the process assistant"
          title="Open the process assistant"
          onClick={onToggle}
        >
          <span aria-hidden="true">✦</span>
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

  // Resize the panel, clamped to keep the document canvas usable. The panel is
  // flush-right, so a wider panel means its left edge moves left.
  const RESIZE_MIN = 300;
  const RESIZE_MAX = 720;
  const RESIZE_STEP = 16;
  const applyWidth = (w: number) => {
    const clamped = Math.min(RESIZE_MAX, Math.max(RESIZE_MIN, Math.round(w)));
    onWidthChange(clamped);
    setPanelWidth(clamped);
  };

  // Drag the left-edge handle to widen / narrow the panel.
  function onResizeStart(e: ReactMouseEvent) {
    e.preventDefault();
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    function onMove(ev: MouseEvent) {
      applyWidth(window.innerWidth - ev.clientX);
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

  // Keyboard equivalent for the resize separator (a11y). ←/→ nudge the width,
  // Home/End jump to the bounds. Left = wider (the panel is flush-right).
  function onResizeKey(e: ReactKeyboardEvent<HTMLDivElement>) {
    const cur = panelWidth || asideRef.current?.offsetWidth || RESIZE_MIN;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      applyWidth(cur + RESIZE_STEP);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      applyWidth(cur - RESIZE_STEP);
    } else if (e.key === "Home") {
      e.preventDefault();
      applyWidth(RESIZE_MAX);
    } else if (e.key === "End") {
      e.preventDefault();
      applyWidth(RESIZE_MIN);
    }
  }

  const restartLabel = pending
    ? "Cancel the running turn and restart the session"
    : "Restart the assistant session — clears this conversation";

  return (
    <aside ref={asideRef} className="rail rail-r chat">
      <div
        className="chat-resize"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize assistant panel"
        aria-valuemin={RESIZE_MIN}
        aria-valuemax={RESIZE_MAX}
        aria-valuenow={panelWidth || undefined}
        tabIndex={0}
        title="Drag (or use arrow keys) to resize the panel"
        onMouseDown={onResizeStart}
        onKeyDown={onResizeKey}
      />
      <div className="chat-head">
        <span className="chat-title">{title}</span>
        <button
          className="chat-restart"
          onClick={onRestart}
          disabled={!pending && messages.length === 0}
          aria-label={restartLabel}
          title={restartLabel}
        >
          <span aria-hidden="true">↻</span>
        </button>
        <button
          className="chat-collapse"
          onClick={onToggle}
          aria-label="Collapse panel"
          title="Collapse panel"
        >
          <span aria-hidden="true">⟩</span>
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
            {showTokenReceipt &&
              m.role === "agent" &&
              (m.usage || m.durationMs) && (
                <UsageReceipt u={m.usage} durationMs={m.durationMs} />
              )}
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
