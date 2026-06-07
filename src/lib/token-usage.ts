// Per-skill LLM token accounting.
//
// Both session backends already surface usage on the turn's `result` event —
// the claude CLI (`--output-format stream-json`) puts it on `usage` +
// `total_cost_usd`; the Gemini SDK exposes `usageMetadata`. The session route
// read neither. This module normalises whichever shape arrives into a
// `TokenUsage` and folds it into the runtime store, keyed by the skill the chat
// was running. The tally is derived/orchestration state, so it lives in the
// runtime store (never the wiki — Karpathy guardrail).

import {
  getRuntime,
  writeRuntime,
  type TokenUsage,
  type SkillUsage,
  type SkillUsageEntry,
} from "./runtime-store.ts";

const num = (v: unknown): number => (typeof v === "number" && isFinite(v) ? v : 0);

/**
 * Pull a normalised `TokenUsage` off a worker `result` event, handling both
 * providers. Returns `null` when the event carries no usage at all (or only
 * zeros), so a caller can cheaply skip recording.
 */
export function extractUsage(evt: Record<string, unknown>): TokenUsage | null {
  // claude CLI: { usage: { input_tokens, output_tokens,
  //   cache_read_input_tokens, cache_creation_input_tokens }, total_cost_usd }
  const cu = evt.usage as Record<string, unknown> | undefined;
  if (cu && typeof cu === "object") {
    const u: TokenUsage = {
      inputTokens: num(cu.input_tokens),
      outputTokens: num(cu.output_tokens),
      cacheReadTokens: num(cu.cache_read_input_tokens),
      cacheCreationTokens: num(cu.cache_creation_input_tokens),
      costUsd: num(evt.total_cost_usd),
    };
    return isEmpty(u) ? null : u;
  }
  // Gemini SDK: { usageMetadata: { promptTokenCount, candidatesTokenCount,
  //   cachedContentTokenCount } } — no cost is reported by the SDK.
  const gm = evt.usageMetadata as Record<string, unknown> | undefined;
  if (gm && typeof gm === "object") {
    const cached = num(gm.cachedContentTokenCount);
    const u: TokenUsage = {
      // promptTokenCount includes cached tokens; surface the cached slice
      // separately and net it out of the billed input, mirroring claude.
      inputTokens: Math.max(0, num(gm.promptTokenCount) - cached),
      outputTokens: num(gm.candidatesTokenCount),
      cacheReadTokens: cached,
      cacheCreationTokens: 0,
      costUsd: 0,
    };
    return isEmpty(u) ? null : u;
  }
  return null;
}

function isEmpty(u: TokenUsage): boolean {
  return (
    u.inputTokens === 0 &&
    u.outputTokens === 0 &&
    u.cacheReadTokens === 0 &&
    u.cacheCreationTokens === 0 &&
    u.costUsd === 0
  );
}

function zero(): SkillUsageEntry {
  return {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheCreationTokens: 0,
    costUsd: 0,
    turns: 0,
    lastAt: "",
  };
}

function fold(into: SkillUsageEntry, u: TokenUsage, at: string): SkillUsageEntry {
  return {
    inputTokens: into.inputTokens + u.inputTokens,
    outputTokens: into.outputTokens + u.outputTokens,
    cacheReadTokens: into.cacheReadTokens + u.cacheReadTokens,
    cacheCreationTokens: into.cacheCreationTokens + u.cacheCreationTokens,
    costUsd: into.costUsd + u.costUsd,
    turns: into.turns + 1,
    lastAt: at,
  };
}

/**
 * Fold one turn's usage into a process's runtime tally, under `skill` (and the
 * process total). `skill` is the value the chat passed; pass `"free-chat"` when
 * a turn ran with no skill. `at` is the turn-boundary timestamp (injectable for
 * tests). A no-op when `usage` is null.
 */
export function recordSkillUsage(
  slug: string,
  skill: string,
  usage: TokenUsage | null,
  at: string = new Date().toISOString(),
): void {
  if (!usage) return;
  const prev = getRuntime(slug).skillUsage;
  const su: SkillUsage = prev ?? { total: zero(), bySkill: {}, updatedAt: "" };
  su.total = fold(su.total ?? zero(), usage, at);
  su.bySkill[skill] = fold(su.bySkill[skill] ?? zero(), usage, at);
  su.updatedAt = at;
  writeRuntime(slug, { skillUsage: su });
}
