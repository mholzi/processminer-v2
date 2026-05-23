"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChatMessage } from "@/components/AgentChat";
import type { ProcessDoc } from "@/lib/wiki";
import type { User } from "@/lib/user";
import {
  CHAT_WATCHDOG_MS,
  NOTIFY_THRESHOLD_MS,
  chatStoreKey,
  loadStoredChat,
  mid,
  notifyTurnComplete,
  readSkillEta,
  recordSkillDuration,
} from "@/lib/agent-chat-utils";

export type SendOpts = {
  /** Fired after the turn completes (success or error). */
  onComplete?: () => void;
  /** Skip the per-process scope preamble for this turn — used by + New process. */
  unscoped?: boolean;
  /** Override what the user sees in the transcript while sending `text` to the CLI. */
  displayText?: string;
  /** Name of the skill this turn invokes — drives the active-skill chip. */
  skill?: string;
};

export type TaskChip = { id: string; label: string; status: "running" | "done" };

export type UseAgentChatOptions = {
  doc: ProcessDoc;
  user: User;
  /** Per-app preamble inserted on the first turn of a session, locking scope. */
  scopePreamble: (doc: ProcessDoc, user: User) => string;
  /** sessionStorage key prefix — pm-chat / am-chat keep transcripts separated. */
  storePrefix: string;
  /** Title for the long-turn browser notification — "Processminer" / "ArchitectMiner". */
  productName: string;
  /** Optional initial message (e.g. Processminer's foundational-run resume welcome). */
  initialMessage?: () => ChatMessage | null;
};

export type AgentChatApi = {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  chatPending: boolean;
  setChatPending: React.Dispatch<React.SetStateAction<boolean>>;
  chatActivity: string | null;
  chatTasks: TaskChip[];
  activeSkill: string | null;
  activeSkillEta: { medianMs: number; runs: number } | null;
  chatSessionId: string | null;
  setChatSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  handleSend: (text: string, opts?: SendOpts) => void;
  restartSession: () => void;
};

// Owns the chat-with-/api/session pipeline: transcript, SSE streaming,
// active-skill chip, ETA recording, sessionStorage persistence, and the
// stuck-turn watchdog. Single source of truth shared by Processminer and
// ArchitectMiner. The per-app scope preamble + product name keep the two
// workspaces' sessions separate without forking the pipeline.
export function useAgentChat(opts: UseAgentChatOptions): AgentChatApi {
  const { doc, user, scopePreamble, storePrefix, productName, initialMessage } = opts;
  const router = useRouter();
  const currentSlug = doc.slug;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const m = initialMessage ? initialMessage() : null;
    return m ? [m] : [];
  });
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [chatPending, setChatPending] = useState(false);
  const [chatActivity, setChatActivity] = useState<string | null>(null);
  const [chatTasks, setChatTasks] = useState<TaskChip[]>([]);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [activeSkillEta, setActiveSkillEta] = useState<{
    medianMs: number;
    runs: number;
  } | null>(null);

  // Watchdog: timestamp (ms) of the last SSE event we saw on the active turn.
  const lastTurnEventRef = useRef<number>(0);
  // Skip the mount-run persistence write so the restore below isn't clobbered.
  const chatPersistReady = useRef(false);

  // Restore transcript on mount (per process slug).
  useEffect(() => {
    const saved = loadStoredChat(storePrefix, currentSlug);
    if (saved) {
      setMessages(saved.messages);
      setChatSessionId(saved.sessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist transcript on change.
  useEffect(() => {
    if (!chatPersistReady.current) {
      chatPersistReady.current = true;
      return;
    }
    try {
      sessionStorage.setItem(
        chatStoreKey(storePrefix, currentSlug),
        JSON.stringify({ messages, sessionId: chatSessionId }),
      );
    } catch {
      /* storage full or unavailable — persistence is best-effort */
    }
  }, [messages, chatSessionId, currentSlug, storePrefix]);

  // Live document refresh while a turn is in flight — re-read the server
  // component so wiki edits made by the skill appear element-by-element.
  useEffect(() => {
    if (!chatPending) return;
    const t = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(t);
  }, [chatPending, router]);

  // Stuck-turn watchdog. If the SSE stream goes silent for more than
  // CHAT_WATCHDOG_MS while still pending, the promise chain is almost
  // certainly orphaned (HMR reload, dropped network). Self-heal.
  useEffect(() => {
    if (!chatPending) return;
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

  const handleSend = useCallback(
    (text: string, sendOpts?: SendOpts) => {
      // `text` is sent to the CLI; `displayText`, when given, is what the user
      // sees in the transcript — lets a turn carry an internal directive the
      // assistant must act on but the user should not see.
      setMessages((m) => [
        ...m,
        { id: mid(), role: "user", text: sendOpts?.displayText ?? text },
      ]);
      setChatPending(true);
      setChatActivity(null);
      setChatTasks([]);
      setActiveSkill(sendOpts?.skill ?? null);
      setActiveSkillEta(sendOpts?.skill ? readSkillEta(sendOpts.skill) : null);
      lastTurnEventRef.current = Date.now();
      const turnStartedAt = Date.now();
      const turnSkill = sendOpts?.skill ?? null;

      const unscoped = sendOpts?.unscoped === true;
      const sessionId = unscoped ? null : chatSessionId;
      const wireText =
        !unscoped && sessionId === null ? scopePreamble(doc, user) + text : text;

      type SessionEvent =
        | { type: "progress"; text: string }
        | { type: "delta"; text: string }
        | { type: "task_start"; id: string; label: string }
        | { type: "task_end"; id: string }
        | { type: "done"; reply?: string; sessionId?: string; isError?: boolean }
        | { type: "error"; error: string; sessionId?: string };

      fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: wireText,
          sessionId,
          stream: user.streamReplies === true,
        }),
      })
        .then(async (res) => {
          if (!res.body) throw new Error("Keine Antwort vom Server.");
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buf = "";
          let streamingId: string | null = null;

          const apply = (evt: SessionEvent) => {
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
          setMessages((m) => [
            ...m,
            {
              id: mid(),
              role: "agent",
              text: `⚠ ${e instanceof Error ? e.message : "Request failed"}`,
            },
          ]);
        })
        .finally(() => {
          const durationMs = Date.now() - turnStartedAt;
          if (turnSkill) recordSkillDuration(turnSkill, durationMs);
          if (durationMs >= NOTIFY_THRESHOLD_MS) {
            notifyTurnComplete(durationMs, turnSkill, productName);
          }
          setChatPending(false);
          setChatActivity(null);
          setChatTasks([]);
          setActiveSkill(null);
          setActiveSkillEta(null);
          sendOpts?.onComplete?.();
        });
    },
    [doc, user, chatSessionId, scopePreamble, productName, router],
  );

  const restartSession = useCallback(() => {
    setChatPending(false);
    setChatActivity(null);
    setChatTasks([]);
    setActiveSkill(null);
    setActiveSkillEta(null);
    setMessages([]);
    setChatSessionId(null);
    try {
      sessionStorage.removeItem(chatStoreKey(storePrefix, currentSlug));
    } catch {
      /* storage unavailable — nothing to clear */
    }
  }, [currentSlug, storePrefix]);

  return {
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
    restartSession,
  };
}
