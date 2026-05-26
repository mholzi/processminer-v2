"use client";

import {
  Fragment,
  cloneElement,
  createElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { WikiPage } from "@/lib/wiki";
import ElementHovercard from "./ElementHovercard";
import { pickPerspective } from "@/lib/wait-perspective";

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
}

// Resolve an element id (e.g. "PS-FR-001") to its page + type label.
export type GetRef = (
  id: string,
) => { page: WikiPage; typeLabel: string } | undefined;

// Element ids look like <PREFIX>-<SLUG>-<NUMBER>, e.g. PS-FR-001, OAF-FR-012.
const ELEMENT_ID = /\b[A-Z]{1,4}-[A-Z]{2,4}-\d{3}\b/g;

// Split a plain text run, wrapping every resolvable element id in a hovercard
// so it previews on hover. Ids that don't resolve are left as plain text.
function linkifyText(
  text: string,
  getRef: GetRef,
  onRefClick?: (id: string) => void,
): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  ELEMENT_ID.lastIndex = 0;
  while ((m = ELEMENT_ID.exec(text))) {
    const ref = getRef(m[0]);
    if (!ref) continue;
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <ElementHovercard
        key={`${m[0]}-${m.index}`}
        element={ref.page}
        typeLabel={ref.typeLabel}
        onSelect={onRefClick}
      >
        <span className="chat-ref">{m[0]}</span>
      </ElementHovercard>,
    );
    last = m.index + m[0].length;
  }
  if (out.length === 0) return text;
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// Recurse through rendered markdown children, linkifying text runs. Code and
// pre blocks are left untouched — ids inside literal code aren't references.
function linkify(
  node: ReactNode,
  getRef: GetRef,
  onRefClick?: (id: string) => void,
): ReactNode {
  if (typeof node === "string") return linkifyText(node, getRef, onRefClick);
  if (Array.isArray(node))
    return node.map((n, i) => (
      <Fragment key={i}>{linkify(n, getRef, onRefClick)}</Fragment>
    ));
  if (isValidElement(node)) {
    if (node.type === "code" || node.type === "pre") return node;
    const children = (node.props as { children?: ReactNode }).children;
    if (children == null) return node;
    return cloneElement(node, undefined, linkify(children, getRef, onRefClick));
  }
  return node;
}

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

// Markdown block tags whose text content may carry element-id references.
const LINKABLE = [
  "p", "li", "td", "th", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote",
] as const;

function buildComponents(
  getRef: GetRef,
  onRefClick?: (id: string) => void,
): Components {
  const out: Record<
    string,
    (props: { node?: unknown; children?: ReactNode }) => ReactNode
  > = {};
  for (const tag of LINKABLE) {
    out[tag] = ({ node: _node, children, ...rest }) =>
      createElement(tag, rest, linkify(children, getRef, onRefClick));
  }
  return out as Components;
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
  title = "ProcessMiner",
  subtitle = "Documents this process with you",
  emptyText,
  lintLabel,
  placeholder = "Message the assistant…",
  showLint = true,
  unread = false,
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
  /** Click handler for an element-id reference inside a chat message. */
  onRefClick?: (id: string) => void;
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
  /** Lights up the collapsed assistant rail when a turn finished while the
   *  user wasn't looking at the chat — the parent tracks this and clears
   *  it when the chat becomes visible again. */
  unread?: boolean;
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
          className={`rrail-btn${unread ? " unread" : ""}`}
          title={
            unread
              ? "The assistant finished — open to view the reply"
              : "Open the process assistant"
          }
          onClick={onToggle}
        >
          ✦
          {unread && <span className="rrail-dot" aria-hidden="true" />}
        </button>
        <span className="rrail-lbl">{unread ? "Done ✓" : "Assistant"}</span>
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
          className="chat-send"
          onClick={send}
          disabled={!draft.trim() || pending}
        >
          Send
        </button>
      </div>
    </aside>
  );
}
