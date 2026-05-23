"use client";

// Pure browser-side helpers shared by every consumer of the /api/session
// chat pipeline. Kept side-effect-free (or localStorage-only) so the
// useAgentChat hook can import them in either workspace.

import type { ChatMessage } from "@/components/AgentChat";

export const mid = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// ETA + notification storage keys. Both apps share the same history so the
// median for a skill is meaningful regardless of which screen kicked it off.
const ETA_HISTORY_CAP = 10;
const ETA_STORAGE_KEY = "pm.skillDurationsMs.v1";
const NOTIFY_ASKED_KEY = "pm.notifyPermissionAsked.v1";
/** Don't fire a Notification for short turns — they were never painful. */
export const NOTIFY_THRESHOLD_MS = 2 * 60 * 1000;
/** Watchdog timeout while a turn is pending — see useAgentChat. */
export const CHAT_WATCHDOG_MS = 5 * 60 * 1000;

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

export function recordSkillDuration(skill: string, ms: number) {
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
  const m = Math.floor(sorted.length / 2);
  const medianMs =
    sorted.length % 2 === 0
      ? Math.round((sorted[m - 1] + sorted[m]) / 2)
      : sorted[m];
  return { medianMs, runs: list.length };
}

/** Render `ms` as a tight human label like "12 min" or "45 s". */
export function formatEta(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)} s`;
  const min = Math.round(ms / 60_000);
  return `${min} min`;
}

// Friendly name for each chat-driven skill — shown in the assistant's
// active-skill chip while a turn runs.
export const SKILL_LABEL: Record<string, string> = {
  "process-specialist": "Process Specialist",
  "control-compliance-specialist": "Control & Compliance Specialist",
  "client-journey-specialist": "Client Journey Specialist",
  "it-architect": "IT Architect",
  "domain-architect": "Domain Architect",
  "solution-architect": "Solution Architect",
  "innovation-analyst": "Innovation Analyst",
  "transformation-agent": "Transformation Agent",
  "run-lint": "Quality Check",
  "foundational-run": "Foundational Run",
  "council-review": "Target Council Review",
  "add-entry": "Add Entry",
  "comment-review": "Comment Review",
  "conflict-resolution": "Conflict Resolution",
  "document-ingest": "Document Import",
  "new-process": "New Process",
};

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
  productName: string,
) {
  if (typeof window === "undefined") return;
  if (typeof Notification === "undefined") return;
  // If the user is looking at the tab right now, they don't need a ping.
  if (!document.hidden) return;
  const label = skill ? SKILL_LABEL[skill] || skill : "Assistant";
  const body = `${label} finished after ${formatEta(durationMs)}.`;
  const fire = () => {
    try {
      new Notification(`${productName} — done`, {
        body,
        tag: `${productName.toLowerCase()}-turn-done`,
      });
    } catch {
      /* user-agent quirk — drop silently */
    }
  };
  if (Notification.permission === "granted") {
    fire();
  } else if (Notification.permission === "default") {
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

// The chat transcript + claude session id are persisted to sessionStorage
// per process, so a page reload (or dev hot-reload) restores the conversation
// instead of dropping it — a foundational run can span hours. sessionStorage
// is deliberate: it survives a reload but clears when the tab closes, so a
// transcript never goes stale across days.
export const chatStoreKey = (storePrefix: string, slug: string) =>
  `${storePrefix}-${slug}`;

export function loadStoredChat(
  storePrefix: string,
  slug: string,
): { messages: ChatMessage[]; sessionId: string | null } | null {
  try {
    const raw = sessionStorage.getItem(chatStoreKey(storePrefix, slug));
    if (!raw) return null;
    const saved = JSON.parse(raw) as {
      messages?: ChatMessage[];
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
