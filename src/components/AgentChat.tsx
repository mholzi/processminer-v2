"use client";

import { useEffect, useRef, useState } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
}

// Right-rail agent chat. Collapsed it is a thin rail; expanded it is a
// conversation panel with a wiki-wide "Run lint" action. Agent replies are
// stubbed in this build — the model is wired in a later slice.
export default function AgentChat({
  open,
  onToggle,
  messages,
  onSend,
  onRunLint,
  linting,
  findingCount,
}: {
  open: boolean;
  onToggle: () => void;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onRunLint: () => void;
  linting: boolean;
  findingCount: number | null;
}) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, linting]);

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
    if (!t) return;
    onSend(t);
    setDraft("");
  }

  return (
    <aside className="rail rail-r chat">
      <div className="chat-head">
        <span className="chat-title">Process Assistant</span>
        <button
          className="chat-collapse"
          onClick={onToggle}
          title="Collapse panel"
        >
          ⟩
        </button>
      </div>
      <div className="chat-sub">Stubbed agent · whole COB-003 wiki in context</div>

      <div className="chat-scroll" ref={scrollRef}>
        {messages.length === 0 && !linting && (
          <div className="chat-empty">
            Ask the assistant about any element — or run a lint pass to check
            the whole wiki for gaps and cross-section discrepancies.
          </div>
        )}
        {messages.map((m) => (
          <div className={`chat-msg ${m.role}`} key={m.id}>
            {m.text}
          </div>
        ))}
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
          placeholder="Message the assistant…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button className="chat-send" onClick={send} disabled={!draft.trim()}>
          Send
        </button>
      </div>
    </aside>
  );
}
