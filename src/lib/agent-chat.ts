// Shared agent-chat core — the provider-agnostic pipeline behind every chat
// surface in the app (the Processminer SME canvas and the ArchitectMiner
// architect canvas). Pure TypeScript, no React: the fetch + SSE driver, the
// per-skill ETA history, the long-turn browser notification, and the
// sessionStorage transcript codec. `useAgentChat` (the hook) composes these
// into React state; both canvases consume the hook so the pipeline lives in
// exactly one place.

// ---- Session event protocol --------------------------------------------
// Mirrors what /api/session emits over SSE (see src/app/api/session/route.ts).

export type SessionEvent =
  | { type: "progress"; text: string }
  | { type: "delta"; text: string }
  | { type: "task_start"; id: string; label: string }
  | { type: "task_end"; id: string }
  | { type: "done"; reply?: string; sessionId?: string; isError?: boolean }
  | { type: "error"; error: string; sessionId?: string };

export interface SessionHandlers {
  /** Fired for EVERY event — used to bump the stuck-turn watchdog. */
  onAnyEvent?: () => void;
  onProgress?: (text: string) => void;
  onTaskStart?: (id: string, label: string) => void;
  onTaskEnd?: (id: string) => void;
  onDelta?: (text: string) => void;
  onDone?: (reply: string, sessionId: string | null) => void;
  onError?: (error: string, sessionId: string | null) => void;
}

export interface SessionRequest {
  /** The fully-composed wire text — scope preamble already prepended if any. */
  message: string;
  /** Resume id, or null to start a fresh `claude` session. */
  sessionId: string | null;
  /** Stream reply text token-by-token (user preference). */
  stream: boolean;
  /** Skill this turn invokes, or null for free text. */
  skill: string | null;
  signal: AbortSignal;
}

// Drive one turn against /api/session: POST, then read the SSE body, framing
// on the blank-line separator and dispatching each JSON event to the typed
// handlers. Throws on a missing body or network error — the caller's catch
// owns the user-facing failure message (so it can distinguish an abort).
export async function runSession(
  req: SessionRequest,
  handlers: SessionHandlers,
): Promise<void> {
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: req.signal,
    body: JSON.stringify({
      message: req.message,
      sessionId: req.sessionId,
      stream: req.stream,
      skill: req.skill,
    }),
  });
  if (!res.body) throw new Error("Keine Antwort vom Server.");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  const apply = (evt: SessionEvent) => {
    handlers.onAnyEvent?.();
    switch (evt.type) {
      case "progress":
        handlers.onProgress?.(evt.text);
        break;
      case "task_start":
        handlers.onTaskStart?.(evt.id, evt.label);
        break;
      case "task_end":
        handlers.onTaskEnd?.(evt.id);
        break;
      case "delta":
        handlers.onDelta?.(evt.text);
        break;
      case "done":
        handlers.onDone?.(evt.reply || "", evt.sessionId ?? null);
        break;
      case "error":
        handlers.onError?.(evt.error, evt.sessionId ?? null);
        break;
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
      const line = frame.startsWith("data:") ? frame.slice(5).trim() : frame.trim();
      if (!line) continue;
      try {
        apply(JSON.parse(line) as SessionEvent);
      } catch {
        /* partial / non-JSON frame — ignore */
      }
    }
  }
}

// ---- Per-skill ETA history ----------------------------------------------
// A skill's wall-clock varies; we keep the last N run durations per skill in
// localStorage and show the median up-front so the SME has an honest ETA.

/** Don't fire a Notification for short turns — they were never painful. */
export const NOTIFY_THRESHOLD_MS = 2 * 60 * 1000;
/** Cap per-skill history so a runaway log never bloats localStorage. */
const ETA_HISTORY_CAP = 10;
const ETA_STORAGE_KEY = "pm.skillDurationsMs.v1";
const NOTIFY_ASKED_KEY = "pm.notifyPermissionAsked.v1";

function readSkillHistory(): Record<string, number[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ETA_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, number[]>)
      : {};
  } catch {
    return {};
  }
}

export function recordSkillDuration(skill: string, ms: number): void {
  if (typeof window === "undefined" || !Number.isFinite(ms) || ms <= 0) return;
  try {
    const all = readSkillHistory();
    const list = Array.isArray(all[skill]) ? all[skill].slice() : [];
    list.push(Math.round(ms));
    while (list.length > ETA_HISTORY_CAP) list.shift();
    all[skill] = list;
    window.localStorage.setItem(ETA_STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* storage full or blocked — silently skip */
  }
}

export function readSkillEta(
  skill: string,
): { medianMs: number; runs: number } | null {
  const list = readSkillHistory()[skill];
  if (!list || list.length === 0) return null;
  const sorted = [...list].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const medianMs =
    sorted.length % 2 === 0
      ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
      : sorted[mid];
  return { medianMs, runs: list.length };
}

/** Render `ms` as a tight human label like "12 min" or "45 s". */
export function formatEta(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)} s`;
  const min = Math.round(ms / 60_000);
  return `${min} min`;
}

/**
 * Browser notification on long-turn completion. Best-effort:
 *   - never asks until the first long turn actually completes (no permission
 *     prompt on first page load);
 *   - asks at most once — declines are remembered;
 *   - silent if the API is unavailable or the tab is currently focused.
 */
export function notifyTurnComplete(
  durationMs: number,
  skill: string | null,
  skillLabels: Record<string, string>,
): void {
  if (typeof window === "undefined") return;
  if (typeof Notification === "undefined") return;
  // If the user is looking at the tab right now, they don't need a ping.
  if (!document.hidden) return;
  const label = skill ? skillLabels[skill] || skill : "Assistant";
  const body = `${label} finished after ${formatEta(durationMs)}.`;
  const fire = () => {
    try {
      new Notification("Processminer — done", { body, tag: "pm-turn-done" });
    } catch {
      /* user-agent quirk — drop silently */
    }
  };
  if (Notification.permission === "granted") {
    fire();
  } else if (Notification.permission === "default") {
    // Only ask once per browser. A decline isn't asked again.
    let asked = false;
    try {
      asked = window.localStorage.getItem(NOTIFY_ASKED_KEY) === "1";
    } catch {
      /* storage blocked — assume not asked */
    }
    if (asked) return;
    try {
      window.localStorage.setItem(NOTIFY_ASKED_KEY, "1");
    } catch {
      /* storage blocked — proceed without remembering */
    }
    Notification.requestPermission()
      .then((p) => {
        if (p === "granted") fire();
      })
      .catch(() => {
        /* user dismissed — ignore */
      });
  }
}

// ---- sessionStorage transcript codec ------------------------------------
// The chat transcript + claude session id are persisted per process so a
// reload (or dev hot-reload) restores the conversation. sessionStorage is
// deliberate: it survives a reload but clears when the tab closes, so a
// transcript never goes stale across days. The `prefix` scopes a store to a
// canvas ("pm" for Processminer, "am" for ArchitectMiner) so the two never
// collide on the same slug.

export interface StoredChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
}

export function chatStoreKey(prefix: string, slug: string): string {
  return `${prefix}-chat-${slug}`;
}

export function loadStoredChat(
  prefix: string,
  slug: string,
): { messages: StoredChatMessage[]; sessionId: string | null } | null {
  try {
    const raw = sessionStorage.getItem(chatStoreKey(prefix, slug));
    if (!raw) return null;
    const saved = JSON.parse(raw) as {
      messages?: StoredChatMessage[];
      sessionId?: string | null;
    };
    if (!Array.isArray(saved.messages) || saved.messages.length === 0) {
      return null;
    }
    return {
      messages: saved.messages,
      sessionId: typeof saved.sessionId === "string" ? saved.sessionId : null,
    };
  } catch {
    return null;
  }
}

export function saveStoredChat(
  prefix: string,
  slug: string,
  messages: StoredChatMessage[],
  sessionId: string | null,
): void {
  try {
    sessionStorage.setItem(
      chatStoreKey(prefix, slug),
      JSON.stringify({ messages, sessionId }),
    );
  } catch {
    /* storage full — drop silently */
  }
}

export function clearStoredChat(prefix: string, slug: string): void {
  try {
    sessionStorage.removeItem(chatStoreKey(prefix, slug));
  } catch {
    /* ignore */
  }
}
