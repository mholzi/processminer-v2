"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
}

// Right-rail agent chat. Collapsed it is a thin rail; expanded it is a
// conversation panel that drives the Claude Code skills via /api/session,
// plus a wiki-wide "Run lint" action.
export default function AgentChat({
  open,
  onToggle,
  messages,
  onSend,
  pending,
  activity,
  onRestart,
  onRunLint,
  linting,
  findingCount,
}: {
  open: boolean;
  onToggle: () => void;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  pending: boolean;
  activity?: string | null;
  onRestart: () => void;
  onRunLint: () => void;
  linting: boolean;
  findingCount: number | null;
}) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <aside className="rail rail-r chat">
      <div className="chat-head">
        <span className="chat-title">Process Assistant</span>
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
      <div className="chat-sub">Runs the process skills locally via Claude Code</div>

      <div className="chat-scroll" ref={scrollRef}>
        {messages.length === 0 && !linting && !pending && (
          <div className="chat-empty">
            Ask the assistant to document a process or about any element — it
            runs the process skills. Or run a lint pass over the whole wiki.
          </div>
        )}
        {messages.map((m) => (
          <div className={`chat-msg ${m.role}`} key={m.id}>
            <ReactMarkdown>{m.text}</ReactMarkdown>
          </div>
        ))}
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
            ? "Linting…"
            : findingCount === null
              ? "⊛ Run lint on the whole wiki"
              : `⊛ Re-run lint · ${findingCount} open`}
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
