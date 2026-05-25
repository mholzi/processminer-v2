// Per-process access control: who can open a documented process. Sits on
// top of module entitlements (Entitlement.pm/am) — a user must have `pm`
// AND be either an admin, the owner, or a grantee of the process.
//
// Storage: data/process-access.json, one record per slug. Bootstrap: the
// first time the file is missing or empty, every slug currently in
// wiki/processes/ is assigned to the first admin user as owner — so
// pre-existing processes never become inaccessible.

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getUsers, type StoredUser } from "./auth-server";

/** Read a single frontmatter key from a process index.md. Returns "" if the
 *  file or key is missing — used to pick up `createdBy` so the scaffolder's
 *  stamp can drive ownership without an extra writer. */
function readIndexField(slug: string, key: string): string {
  const path = join(WIKI_DIR, slug, "index.md");
  if (!existsSync(path)) return "";
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    return "";
  }
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return "";
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    if (line.slice(0, idx).trim() === key) return line.slice(idx + 1).trim();
  }
  return "";
}

const DATA_DIR = join(process.cwd(), "data");
const ACCESS_PATH = join(DATA_DIR, "process-access.json");
const WIKI_DIR = join(process.cwd(), "wiki", "processes");

export type ProcessAccess = {
  slug: string;
  owner: string; // username; "" means unassigned
  grantees: string[]; // usernames
  updatedAt: string;
  updatedBy: string;
};

// No in-memory cache — same reasoning as auth-server.ts (multiple Next.js
// module contexts each carry their own cache, and they drift). Reads are
// cheap (small JSON), writes are rare.
let bootstrapped = false;

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function loadFromDisk(): ProcessAccess[] {
  ensureDir();
  if (!existsSync(ACCESS_PATH)) return [];
  try {
    const raw = JSON.parse(readFileSync(ACCESS_PATH, "utf8"));
    if (!Array.isArray(raw)) return [];
    return raw as ProcessAccess[];
  } catch {
    return [];
  }
}

function saveToDisk(rows: ProcessAccess[]): void {
  ensureDir();
  writeFileSync(ACCESS_PATH, JSON.stringify(rows, null, 2) + "\n", "utf8");
}

/** List every slug that exists on disk under wiki/processes/. */
function existingSlugsOnDisk(): string[] {
  if (!existsSync(WIKI_DIR)) return [];
  return readdirSync(WIKI_DIR)
    .filter((name) => {
      try {
        return statSync(join(WIKI_DIR, name)).isDirectory();
      } catch {
        return false;
      }
    })
    .filter((name) => existsSync(join(WIKI_DIR, name, "index.md")));
}

/** Pick a bootstrap owner — the oldest admin user, falling back to the
 *  oldest user of any role. Returns "" if there are no users. */
function bootstrapOwner(): string {
  const users = getUsers();
  const admins = users.filter((u) => u.isAdmin);
  const pool = admins.length > 0 ? admins : users;
  if (pool.length === 0) return "";
  const sorted = [...pool].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  return sorted[0].username;
}

/** Run once per process: backfill access records for any slug that exists
 *  on disk but isn't yet tracked. A freshly-scaffolded process carries
 *  `createdBy` in its index.md — that wins, so the creator becomes owner.
 *  Pre-existing slugs with no creator stamp fall back to the bootstrap
 *  owner (oldest admin) so they don't become inaccessible. */
function maybeBootstrap(rows: ProcessAccess[]): ProcessAccess[] {
  if (bootstrapped) return rows;
  bootstrapped = true;
  const known = new Set(rows.map((r) => r.slug));
  const missing = existingSlugsOnDisk().filter((s) => !known.has(s));
  if (missing.length === 0) return rows;
  const fallback = bootstrapOwner();
  const users = getUsers();
  const userByName = new Map(
    users.map((u) => [u.username.toLowerCase(), u.username]),
  );
  const now = new Date().toISOString();
  const next: ProcessAccess[] = [
    ...rows,
    ...missing.map((slug): ProcessAccess => {
      const stamped = readIndexField(slug, "createdBy");
      const creator = stamped
        ? userByName.get(stamped.toLowerCase()) ?? ""
        : "";
      return {
        slug,
        owner: creator || fallback,
        grantees: [],
        updatedAt: now,
        updatedBy: creator ? "scaffold" : "bootstrap",
      };
    }),
  ];
  saveToDisk(next);
  console.warn(
    `[access] bootstrap: assigned ${missing.length} process${
      missing.length === 1 ? "" : "es"
    }: ${missing.join(", ")}`,
  );
  return next;
}

export function getAllAccess(): ProcessAccess[] {
  const rows = loadFromDisk();
  return maybeBootstrap(rows);
}

export function getAccess(slug: string): ProcessAccess | null {
  return getAllAccess().find((r) => r.slug === slug) ?? null;
}

/** Whether the user can open a given process. Admins always can. */
export function canAccess(user: StoredUser, slug: string): boolean {
  if (user.isAdmin) return true;
  const r = getAccess(slug);
  if (!r) return false;
  if (r.owner === user.username) return true;
  return r.grantees.includes(user.username);
}

/** Slugs the user is allowed to open. Admins see everything that exists
 *  on disk under wiki/processes/ — not just the slugs already tracked in
 *  the access file. The access file is for ownership + grantee bookkeeping;
 *  it is not the admin's source of truth. A process that lands on disk
 *  after server start (re-ingest, new-process skill, restored folder) is
 *  immediately visible to admins without waiting for a server restart. */
export function accessibleSlugs(user: StoredUser): Set<string> {
  if (user.isAdmin) return new Set(existingSlugsOnDisk());
  const all = getAllAccess();
  const mine = new Set<string>();
  for (const r of all) {
    if (r.owner === user.username || r.grantees.includes(user.username)) {
      mine.add(r.slug);
    }
  }
  return mine;
}

/** Processes this user owns. Drives the welcome menu's "ownsAnyProcess". */
export function ownedSlugs(user: StoredUser): string[] {
  return getAllAccess()
    .filter((r) => r.owner === user.username)
    .map((r) => r.slug);
}

// ----- mutations -----------------------------------------------------------

export class AccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccessError";
  }
}

function expect(record: ProcessAccess | null, slug: string): ProcessAccess {
  if (!record) throw new AccessError(`Process '${slug}' is not tracked.`);
  return record;
}

function findUser(username: string): StoredUser | null {
  return (
    getUsers().find((u) => u.username.toLowerCase() === username.toLowerCase()) ??
    null
  );
}

/** Admin-only: change the owner of a process. */
export function setOwner(slug: string, newOwner: string, by: string): ProcessAccess {
  const target = findUser(newOwner);
  if (!target) throw new AccessError(`User '${newOwner}' does not exist.`);
  const rows = getAllAccess();
  const idx = rows.findIndex((r) => r.slug === slug);
  if (idx < 0) throw new AccessError(`Process '${slug}' is not tracked.`);
  const next = [...rows];
  next[idx] = {
    ...next[idx],
    owner: target.username,
    // Owner is implicit — drop them from grantees if they were there.
    grantees: next[idx].grantees.filter((g) => g !== target.username),
    updatedAt: new Date().toISOString(),
    updatedBy: by,
  };
  saveToDisk(next);
  return next[idx];
}

/** Owner or admin: add a grantee. Idempotent. */
export function addGrantee(slug: string, username: string, by: string): ProcessAccess {
  const target = findUser(username);
  if (!target) throw new AccessError(`User '${username}' does not exist.`);
  const rows = getAllAccess();
  const idx = rows.findIndex((r) => r.slug === slug);
  expect(rows[idx] ?? null, slug);
  if (rows[idx].owner === target.username) {
    throw new AccessError(`User '${target.username}' already owns this process.`);
  }
  const set = new Set(rows[idx].grantees);
  set.add(target.username);
  const next = [...rows];
  next[idx] = {
    ...next[idx],
    grantees: [...set].sort(),
    updatedAt: new Date().toISOString(),
    updatedBy: by,
  };
  saveToDisk(next);
  return next[idx];
}

/** Owner or admin: remove a grantee. Idempotent. */
export function removeGrantee(
  slug: string,
  username: string,
  by: string,
): ProcessAccess {
  const rows = getAllAccess();
  const idx = rows.findIndex((r) => r.slug === slug);
  expect(rows[idx] ?? null, slug);
  const next = [...rows];
  next[idx] = {
    ...next[idx],
    grantees: next[idx].grantees.filter(
      (g) => g.toLowerCase() !== username.toLowerCase(),
    ),
    updatedAt: new Date().toISOString(),
    updatedBy: by,
  };
  saveToDisk(next);
  return next[idx];
}

/** Permission check for grantee mutations: admin OR the current owner. */
export function canManageAccess(user: StoredUser, slug: string): boolean {
  if (user.isAdmin) return true;
  const r = getAccess(slug);
  return r?.owner === user.username;
}
