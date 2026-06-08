// R16 — per-process access control. A process is "ungoverned" (visible to every
// authenticated user) until an admin gives it an owner; once governed, only the
// owner, explicitly granted users, and admins can see it. Authz config, like the
// user store, lives in data/ (gitignored, per-deployment) — never in the wiki.
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { atomicWriteFileSync } from "./atomic-write.ts";

const DATA_DIR = join(process.cwd(), "data");
const ACCESS_PATH = join(DATA_DIR, "process-access.json");

/** Owner + grantees are stable usernames. */
export interface ProcessAccess {
  owner: string;
  grants: string[];
}
type AccessMap = Record<string, ProcessAccess>;

function load(): AccessMap {
  if (!existsSync(ACCESS_PATH)) return {};
  try {
    const m = JSON.parse(readFileSync(ACCESS_PATH, "utf8"));
    return m && typeof m === "object" ? (m as AccessMap) : {};
  } catch {
    return {};
  }
}

function save(map: AccessMap): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  atomicWriteFileSync(ACCESS_PATH, JSON.stringify(map, null, 2) + "\n");
}

export function getAccess(slug: string): ProcessAccess | undefined {
  const a = load()[slug];
  return a && a.owner ? a : undefined;
}

/** A process is governed once it has an owner. */
export function isGoverned(slug: string): boolean {
  return !!load()[slug]?.owner;
}

/** Whether a user may see/open a process. Ungoverned → everyone; governed →
 *  admins, the owner, and granted users only. */
/** The pure access decision for one process's access record. Split out from
 *  `canAccess` (which loads the record off disk) so the authorization rule is
 *  unit-testable without the access-map file. `undefined`/owner-less record =
 *  ungoverned = visible to everyone. */
export function canAccessWith(
  access: ProcessAccess | undefined,
  user: { username: string; isAdmin?: boolean },
): boolean {
  if (!access || !access.owner) return true; // ungoverned
  if (user.isAdmin) return true;
  return access.owner === user.username || access.grants.includes(user.username);
}

export function canAccess(
  user: { username: string; isAdmin?: boolean },
  slug: string,
): boolean {
  return canAccessWith(load()[slug], user);
}

// ----- mutations (authz is enforced by the API route, not here) -----

export function setOwner(slug: string, username: string): void {
  const map = load();
  const a = map[slug] ?? { owner: "", grants: [] };
  a.owner = username;
  a.grants = (a.grants ?? []).filter((g) => g !== username);
  map[slug] = a;
  save(map);
}

export function grant(slug: string, username: string): void {
  const map = load();
  const a = map[slug];
  if (!a || !a.owner) return; // only governed processes can be shared
  if (username !== a.owner && !a.grants.includes(username)) a.grants.push(username);
  save(map);
}

export function revoke(slug: string, username: string): void {
  const map = load();
  const a = map[slug];
  if (!a) return;
  a.grants = (a.grants ?? []).filter((g) => g !== username);
  save(map);
}

/** Drop the access record entirely — the process becomes ungoverned (open). */
export function ungovern(slug: string): void {
  const map = load();
  if (slug in map) {
    delete map[slug];
    save(map);
  }
}
