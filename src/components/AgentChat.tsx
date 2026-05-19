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
function linkifyText(text: string, getRef: GetRef): ReactNode {
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
function linkify(node: ReactNode, getRef: GetRef): ReactNode {
  if (typeof node === "string") return linkifyText(node, getRef);
  if (Array.isArray(node))
    return node.map((n, i) => (
      <Fragment key={i}>{linkify(n, getRef)}</Fragment>
    ));
  if (isValidElement(node)) {
    if (node.type === "code" || node.type === "pre") return node;
    const children = (node.props as { children?: ReactNode }).children;
    if (children == null) return node;
    return cloneElement(node, undefined, linkify(children, getRef));
  }
  return node;
}

// Markdown block tags whose text content may carry element-id references.
const LINKABLE = [
  "p", "li", "td", "th", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote",
] as const;

function buildComponents(getRef: GetRef): Components {
  const out: Record<
    string,
    (props: { node?: unknown; children?: ReactNode }) => ReactNode
  > = {};
  for (const tag of LINKABLE) {
    out[tag] = ({ node: _node, children, ...rest }) =>
      createElement(tag, rest, linkify(children, getRef));
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
  activeSkillLabel,
  onRestart,
  onRunLint,
  linting,
  findingCount,
  getRef,
}: {
  open: boolean;
  onToggle: () => void;
  /** Drag-resize callback — receives the new panel width in px. */
  onWidthChange: (w: number) => void;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  pending: boolean;
  activity?: string | null;
  /** Friendly name of the skill the current turn runs — null for free text. */
  activeSkillLabel?: string | null;
  onRestart: () => void;
  onRunLint: () => void;
  linting: boolean;
  findingCount: number | null;
  getRef: GetRef;
}) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const mdComponents = useMemo(() => buildComponents(getRef), [getRef]);

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
        <span className="chat-title">ProcessMiner</span>
        <button
          className="chat-restart"
          onClick={onRestart}
          disabled={pending || (messages.length === 0)}
          title="Restart the assistant session — clears this conversation"
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
      <div className="chat-sub">Documents this process with you</div>

      <div className="chat-scroll" ref={scrollRef}>
        {messages.length === 0 && !linting && !pending && (
          <div className="chat-empty">
            Ask the assistant to document a process or about any element. Or run
            a quality check over the whole process.
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
          </div>
        )}
        {pending && (
          <div className="chat-msg agent pending">
            <span className="chat-activity-dot" />
            {activity || "Working…"}
          </div>
        )}
        {linting && (
          <div className="chat-msg agent pending">Linting the wiki…</div>
        )}
      </div>

      <div className="chat-actions">
        <button className="chat-lint" onClick={onRunLint} disabled={linting}>
          {linting
            ? "Running quality check…"
            : findingCount === null
              ? "⊛ Run a quality check on the whole process"
              : `⊛ Re-run quality check · ${findingCount} open`}
        </button>
      </div>

      <div className="chat-input">
        <textarea
          value={draft}
          placeholder={pending ? "Working…" : "Message the assistant…"}
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
