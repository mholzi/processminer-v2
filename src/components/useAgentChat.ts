"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "./AgentChat";
import {
  NOTIFY_THRESHOLD_MS,
  clearStoredChat,
  loadStoredChat,
  notifyTurnComplete,
  readSkillEta,
  recordSkillDuration,
  runSession,
  saveStoredChat,
} from "@/lib/agent-chat";

let _seq = 0;
function mid(): string {
  _seq += 1;
  return `m${Date.now().toString(36)}-${_seq}`;
}

export interface SendOptions {
  /** Run after the turn settles (success or failure). */
  onComplete?: () => void;
  /** Cross-process turn — no scope preamble, fresh session. */
  unscoped?: boolean;
  /** What the user sees in the transcript, if different from the wire text. */
  displayText?: string;
  /** Skill this turn invokes — drives the active-skill chip. */
  skill?: string;
}

export interface UseAgentChatOptions {
  /** sessionStorage namespace for this canvas — "pm" or "am". */
  storePrefix: string;
  /** Current process slug — scopes persistence + reloads on change. */
  slug: string;
  /** Stream reply text token-by-token (user preference). */
  streamReplies: boolean;
  /** Skill → friendly label, for the active-skill chip + notifications. */
  skillLabels: Record<string, string>;
  /** Prepended to the first turn of a scoped session (locks scope). */
  scopePreamble: string;
  /** Called once a turn completes (a skill may have written wiki files). */
  onTurnDone?: () => void;
}

export interface AgentChatState {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  sessionId: string | null;
  setSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  pending: boolean;
  activity: string | null;
  tasks: { id: string; label: string; status: "running" | "done" }[];
  activeSkill: string | null;
  activeSkillEta: { medianMs: number; runs: number } | null;
  send: (text: string, opts?: SendOptions) => void;
  stop: () => void;
  restart: () => void;
}

// The full stateful chat pipeline for one canvas: messages, the live turn
// (pending / activity / sub-agent tasks / active skill), the claude session
// id, the stuck-turn watchdog and per-process persistence. Drives turns
// through the shared `runSession` SSE driver. Both the Processminer and the
// ArchitectMiner canvas mount this hook.
export function useAgentChat(opts: UseAgentChatOptions): AgentChatState {
  const { storePrefix, slug, streamReplies, skillLabels, scopePreamble, onTurnDone } = opts;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") return [];
    return loadStoredChat(storePrefix, slug)?.messages ?? [];
  });
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return loadStoredChat(storePrefix, slug)?.sessionId ?? null;
  });
  const [pending, setPending] = useState(false);
  const [activity, setActivity] = useState<string | null>(null);
  const [tasks, setTasks] = useState<
    { id: string; label: string; status: "running" | "done" }[]
  >([]);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [activeSkillEta, setActiveSkillEta] = useState<
    { medianMs: number; runs: number } | null
  >(null);

  const lastTurnEventRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reload the transcript when the open process changes (a canvas instance
  // that's reused across slugs picks up the right conversation).
  const slugRef = useRef(slug);
  useEffect(() => {
    if (slugRef.current === slug) return;
    slugRef.current = slug;
    const saved = loadStoredChat(storePrefix, slug);
    setMessages(saved?.messages ?? []);
    setSessionId(saved?.sessionId ?? null);
    setPending(false);
    setActivity(null);
    setTasks([]);
    setActiveSkill(null);
    setActiveSkillEta(null);
  }, [storePrefix, slug]);

  // Persist transcript + session id on every change (skip the empty initial).
  useEffect(() => {
    if (messages.length === 0) return;
    saveStoredChat(storePrefix, slug, messages, sessionId);
  }, [storePrefix, slug, messages, sessionId]);

  // Stuck-turn watchdog: if no SSE event arrives for CHAT_WATCHDOG_MS while a
  // turn is pending, the promise chain is wedged (hung worker / orphaned
  // fetch). Reset the UI so the canvas isn't stuck spinning forever.
  useEffect(() => {
    if (!pending) return;
    const CHAT_WATCHDOG_MS = 5 * 60 * 1000;
    const t = setInterval(() => {
      const silent = Date.now() - lastTurnEventRef.current;
      if (silent < CHAT_WATCHDOG_MS) return;
      setPending(false);
      setActivity(null);
      setTasks([]);
      setActiveSkill(null);
      setActiveSkillEta(null);
      setMessages((m) => [
        ...m,
        {
          id: mid(),
          role: "agent",
          text: "⚠ Lost contact with the assistant. The turn was canceled — please try again.",
        },
      ]);
    }, 30_000);
    return () => clearInterval(t);
  }, [pending]);

  const send = useCallback(
    (text: string, sendOpts?: SendOptions) => {
      setMessages((m) => [
        ...m,
        { id: mid(), role: "user", text: sendOpts?.displayText ?? text },
      ]);
      setPending(true);
      setActivity(null);
      setTasks([]);
      if (sendOpts?.skill !== undefined) {
        setActiveSkill(sendOpts.skill);
        setActiveSkillEta(sendOpts.skill ? readSkillEta(sendOpts.skill) : null);
      }
      lastTurnEventRef.current = Date.now();
      const turnStartedAt = Date.now();
      const turnSkill = sendOpts?.skill !== undefined ? sendOpts.skill : activeSkill;

      const unscoped = sendOpts?.unscoped === true;
      const turnSessionId = unscoped ? null : sessionId;
      // First turn of a scoped session: hand the open process to the CLI and
      // lock the session to it. Later turns inherit it via --resume.
      const wireText =
        !unscoped && turnSessionId === null ? scopePreamble + text : text;

      const controller = new AbortController();
      abortControllerRef.current = controller;

      let streamingId: string | null = null;

      runSession(
        {
          message: wireText,
          sessionId: turnSessionId,
          stream: streamReplies,
          skill: sendOpts?.skill || turnSkill || null,
          signal: controller.signal,
        },
        {
          onAnyEvent: () => {
            lastTurnEventRef.current = Date.now();
          },
          onProgress: (t) => setActivity(t),
          onTaskStart: (id, label) =>
            setTasks((ts) =>
              ts.some((x) => x.id === id)
                ? ts
                : [...ts, { id, label, status: "running" }],
            ),
          onTaskEnd: (id) =>
            setTasks((ts) =>
              ts.map((x) => (x.id === id ? { ...x, status: "done" } : x)),
            ),
          onDelta: (t) => {
            if (streamingId === null) {
              const id = mid();
              streamingId = id;
              setMessages((m) => [...m, { id, role: "agent", text: t }]);
            } else {
              const id = streamingId;
              setMessages((m) =>
                m.map((msg) =>
                  msg.id === id ? { ...msg, text: msg.text + t } : msg,
                ),
              );
            }
          },
          onDone: (reply, sid) => {
            if (sid) setSessionId(sid);
            if (streamingId !== null) {
              const id = streamingId;
              setMessages((m) =>
                m.map((msg) =>
                  msg.id === id && !msg.text ? { ...msg, text: reply } : msg,
                ),
              );
              streamingId = null;
            } else {
              setMessages((m) => [
                ...m,
                { id: mid(), role: "agent", text: reply || "(no reply)" },
              ]);
            }
            onTurnDone?.();
          },
          onError: (err, sid) => {
            if (sid) setSessionId(sid);
            setMessages((m) => [
              ...m,
              { id: mid(), role: "agent", text: `⚠ ${err}` },
            ]);
          },
        },
      )
        .catch((e: unknown) => {
          const isAbort = e instanceof DOMException && e.name === "AbortError";
          setMessages((m) => [
            ...m,
            {
              id: mid(),
              role: "agent",
              text: isAbort
                ? "⚠ Turn canceled by user."
                : `⚠ ${e instanceof Error ? e.message : "Request failed"}`,
            },
          ]);
        })
        .finally(() => {
          abortControllerRef.current = null;
          const durationMs = Date.now() - turnStartedAt;
          if (turnSkill) recordSkillDuration(turnSkill, durationMs);
          if (durationMs >= NOTIFY_THRESHOLD_MS) {
            notifyTurnComplete(durationMs, turnSkill, skillLabels);
          }
          setPending(false);
          setActivity(null);
          setTasks([]);
          sendOpts?.onComplete?.();
        });
    },
    [activeSkill, sessionId, scopePreamble, streamReplies, skillLabels, onTurnDone],
  );

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const restart = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setMessages([]);
    setSessionId(null);
    setPending(false);
    setActivity(null);
    setTasks([]);
    setActiveSkill(null);
    setActiveSkillEta(null);
    clearStoredChat(storePrefix, slug);
  }, [storePrefix, slug]);

  return {
    messages,
    setMessages,
    sessionId,
    setSessionId,
    pending,
    activity,
    tasks,
    activeSkill,
    activeSkillEta,
    send,
    stop,
    restart,
  };
}
