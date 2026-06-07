// Feature flags for the live-testing feedback features — the client-safe half
// of the module. Each flag gates one feedback-collection mechanism that can be
// turned on or off per environment from the admin area, so we can ship the
// machinery dark and light it up channel by channel during testing.
//
// This file has NO filesystem imports, so UI components and the React context
// can import it freely. The disk read/write lives in feature-flags-store.ts;
// the values are resolved server-side and handed to the client once at load.
//
// The flag IDs are stable string keys — never renumber or reuse them, since a
// saved override in data/feature-flags.json is keyed by ID. To add a feature,
// append a new entry here (and read it with useFeatureFlag in the UI).

export interface FeatureFlagDef {
  /** Stable key, also the override key on disk. Dotted: `feedback.<feature>`. */
  id: string;
  /** Short admin-facing name. */
  label: string;
  /** One line on what turning it on does — shown under the toggle. */
  description: string;
  /** Section heading the toggle is grouped under in the admin UI. */
  group: string;
  /** Value when no admin override has been saved. New features ship off. */
  default: boolean;
}

// The catalog. Order here is the order shown in the admin area.
export const FEATURE_FLAGS = [
  {
    id: "feedback.floating_button",
    label: "Floating feedback button",
    description:
      "A persistent pill, bottom-right on every screen, that opens a quick feedback box from wherever the tester is.",
    group: "Live feedback",
    default: false,
  },
  {
    id: "feedback.auto_context",
    label: "Auto-capture page context",
    description:
      "Silently attach the current route, active process, user and viewport to every submission, so testers don't have to describe where they were.",
    group: "Live feedback",
    default: false,
  },
  {
    id: "feedback.element_comments",
    label: "Point-and-click element feedback",
    description:
      "Let a tester drop a note pinned to a specific element card, anchoring feedback to the exact thing on screen.",
    group: "Live feedback",
    default: false,
  },
  {
    id: "feedback.screenshot",
    label: "One-click screenshot attach",
    description:
      "Grab the current screen with the feedback submission, with an optional highlight box.",
    group: "Live feedback",
    default: false,
  },
  {
    id: "session.token_receipt",
    label: "Show token receipt in chat",
    description:
      "Print a small per-turn token tally (input / output / cached) under each assistant reply in the chat. Per-skill totals are always recorded and visible in Admin → Token usage regardless of this toggle.",
    group: "Session",
    default: true,
  },
] as const satisfies readonly FeatureFlagDef[];

/** The union of valid flag IDs, derived from the catalog. */
export type FeatureFlagId = (typeof FEATURE_FLAGS)[number]["id"];

/** A fully-resolved set of flag values — every catalog ID present. */
export type FeatureFlags = Record<FeatureFlagId, boolean>;

const ID_SET = new Set<string>(FEATURE_FLAGS.map((f) => f.id));

export function isFeatureFlagId(v: unknown): v is FeatureFlagId {
  return typeof v === "string" && ID_SET.has(v);
}

/** Every flag at its catalog default — the baseline before overrides. */
export function defaultFlags(): FeatureFlags {
  const out = {} as FeatureFlags;
  for (const f of FEATURE_FLAGS) out[f.id] = f.default;
  return out;
}

/** Merge saved overrides onto the defaults. Unknown keys are ignored, missing
 *  keys fall back to the catalog default — so adding a new flag is safe even
 *  with an existing overrides file. */
export function resolveFlags(
  overrides: Readonly<Record<string, boolean>> | null | undefined,
): FeatureFlags {
  const out = defaultFlags();
  if (overrides) {
    for (const f of FEATURE_FLAGS) {
      const v = overrides[f.id];
      if (typeof v === "boolean") out[f.id] = v;
    }
  }
  return out;
}
