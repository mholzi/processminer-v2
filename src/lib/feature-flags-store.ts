// Filesystem layer for the feature flags. Server-only — imports node:fs.
//
// App-level (not per-process) config, so it lives at data/feature-flags.json,
// alongside data/users.json and the data/runtime/ store. `data/` is gitignored,
// so flag state is per-environment — testing can light up features without a
// commit. We persist only the OVERRIDES (the deltas an admin set), not the
// resolved set, so new flags added to the catalog pick up their default
// automatically. See feature-flags.ts for the catalog + resolver.

import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { atomicWriteFileSync } from "@/lib/atomic-write";
import {
  type FeatureFlagId,
  type FeatureFlags,
  resolveFlags,
} from "@/lib/feature-flags";

const DATA_DIR = join(process.cwd(), "data");
const FLAGS_PATH = join(DATA_DIR, "feature-flags.json");

interface FlagsFile {
  /** Admin-set overrides, keyed by flag ID. Absent keys use the catalog default. */
  overrides: Record<string, boolean>;
  updatedAt?: string;
  updatedBy?: string;
}

function readFile(): FlagsFile {
  if (!existsSync(FLAGS_PATH)) return { overrides: {} };
  try {
    const raw = JSON.parse(readFileSync(FLAGS_PATH, "utf8")) as Partial<FlagsFile>;
    const overrides =
      raw.overrides && typeof raw.overrides === "object"
        ? (raw.overrides as Record<string, boolean>)
        : {};
    return { overrides, updatedAt: raw.updatedAt, updatedBy: raw.updatedBy };
  } catch {
    // Unreadable/corrupt — fall back to defaults rather than failing the page.
    return { overrides: {} };
  }
}

/** The fully-resolved flag set (defaults + saved overrides). Read this on the
 *  server and hand it to the client once at load. */
export function getResolvedFlags(): FeatureFlags {
  return resolveFlags(readFile().overrides);
}

/** Set one flag's override and persist it. Returns the new resolved set. */
export function setFeatureFlag(
  id: FeatureFlagId,
  enabled: boolean,
  by?: string,
): FeatureFlags {
  const file = readFile();
  file.overrides[id] = enabled;
  file.updatedAt = new Date().toISOString();
  if (by) file.updatedBy = by;
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  atomicWriteFileSync(FLAGS_PATH, JSON.stringify(file, null, 2) + "\n");
  return resolveFlags(file.overrides);
}
