// Server-side authentication: user store, password hashing, signed session
// cookies, bootstrap admin. Never import this from a client component.

import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { atomicWriteFileSync } from "./atomic-write.ts";
import type { Entitlement } from "./user";

const DATA_DIR = join(process.cwd(), "data");
const USERS_PATH = join(DATA_DIR, "users.json");
const SESSION_TTL_DAYS = 30;

export const COOKIE_NAME = "pm_session";

/** The full user record as stored on disk. The passwordHash never leaves
 *  the server — clients only see the redacted shape from `redact()`. */
export type StoredUser = {
  username: string;
  name: string;
  role: string;
  passwordHash: string;
  isAdmin: boolean;
  entitlements?: Entitlement[];
  streamReplies?: boolean;
  whatsNewSeen?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  lastLoginAt?: string;
};

/** Client-safe view of a user. No password hash. */
export type SafeUser = Omit<StoredUser, "passwordHash">;

export function redact(u: StoredUser): SafeUser {
  // Strip passwordHash without leaking it through the type system.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = u;
  return rest;
}

// ----- file-backed store, with bootstrap + memoisation -------------------

let cache: StoredUser[] | null = null;
let bootstrapped = false;

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function loadFromDisk(): StoredUser[] {
  ensureDir();
  if (!existsSync(USERS_PATH)) {
    atomicWriteFileSync(USERS_PATH, "[]\n");
    return [];
  }
  try {
    const raw = JSON.parse(readFileSync(USERS_PATH, "utf8"));
    if (!Array.isArray(raw)) return [];
    return raw as StoredUser[];
  } catch {
    return [];
  }
}

function saveToDisk(users: StoredUser[]): void {
  ensureDir();
  atomicWriteFileSync(USERS_PATH, JSON.stringify(users, null, 2) + "\n");
  cache = users;
}

/** Read all users. Cached in module scope between requests. */
export function getUsers(): StoredUser[] {
  if (cache === null) {
    cache = loadFromDisk();
    maybeBootstrap();
  }
  return cache;
}

/** If the users file is empty AND env provides bootstrap credentials,
 *  seed the first admin. Idempotent — only runs once per process. */
function maybeBootstrap(): void {
  if (bootstrapped) return;
  bootstrapped = true;
  if (cache && cache.length > 0) return;
  const username = process.env.PM_BOOTSTRAP_ADMIN_USER?.trim();
  const password = process.env.PM_BOOTSTRAP_ADMIN_PASS?.trim();
  if (!username || !password) return;
  const name = process.env.PM_BOOTSTRAP_ADMIN_NAME?.trim() || "Administrator";
  const role = process.env.PM_BOOTSTRAP_ADMIN_ROLE?.trim() || "Platform Admin";
  const now = new Date().toISOString();
  const admin: StoredUser = {
    username,
    name,
    role,
    passwordHash: bcrypt.hashSync(password, 10),
    isAdmin: true,
    entitlements: ["pm", "am"],
    createdAt: now,
    createdBy: "bootstrap",
    updatedAt: now,
  };
  saveToDisk([admin]);
  // Bootstrap intentionally logs to stderr — the admin needs to know the
  // credentials are now live, and the password isn't logged.
  console.warn(
    `[auth] bootstrapped first admin '${username}' from PM_BOOTSTRAP_ADMIN_* env vars`,
  );
}

export function findByUsername(username: string): StoredUser | null {
  const u = getUsers().find(
    (x) => x.username.toLowerCase() === username.toLowerCase(),
  );
  return u ?? null;
}

export type CreateUserInput = {
  username: string;
  name: string;
  role: string;
  password: string;
  isAdmin?: boolean;
  entitlements?: Entitlement[];
};

export function createUser(
  input: CreateUserInput,
  createdBy: string,
): StoredUser {
  const username = input.username.trim();
  if (!/^[a-zA-Z0-9._-]{2,40}$/.test(username)) {
    throw new AuthError("Username must be 2-40 chars: letters, digits, . _ -");
  }
  if (input.password.length < 8) {
    throw new AuthError("Password must be at least 8 characters.");
  }
  if (findByUsername(username)) {
    throw new AuthError("Username already exists.");
  }
  const now = new Date().toISOString();
  const user: StoredUser = {
    username,
    name: input.name.trim() || username,
    role: input.role.trim() || "User",
    passwordHash: bcrypt.hashSync(input.password, 10),
    isAdmin: input.isAdmin === true,
    entitlements: input.entitlements,
    createdAt: now,
    createdBy,
    updatedAt: now,
  };
  saveToDisk([...getUsers(), user]);
  return user;
}

export type UpdateUserInput = Partial<{
  name: string;
  role: string;
  isAdmin: boolean;
  entitlements: Entitlement[];
  streamReplies: boolean;
  whatsNewSeen: string;
}>;

export function updateUser(
  username: string,
  patch: UpdateUserInput,
): StoredUser {
  const users = getUsers();
  const idx = users.findIndex(
    (x) => x.username.toLowerCase() === username.toLowerCase(),
  );
  if (idx < 0) throw new AuthError("User not found.");
  const next: StoredUser = {
    ...users[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  const copy = [...users];
  copy[idx] = next;
  saveToDisk(copy);
  return next;
}

export function setPassword(username: string, newPassword: string): void {
  if (newPassword.length < 8) {
    throw new AuthError("Password must be at least 8 characters.");
  }
  const users = getUsers();
  const idx = users.findIndex(
    (x) => x.username.toLowerCase() === username.toLowerCase(),
  );
  if (idx < 0) throw new AuthError("User not found.");
  const copy = [...users];
  copy[idx] = {
    ...copy[idx],
    passwordHash: bcrypt.hashSync(newPassword, 10),
    updatedAt: new Date().toISOString(),
  };
  saveToDisk(copy);
}

export function deleteUser(username: string): void {
  const users = getUsers();
  const next = users.filter(
    (x) => x.username.toLowerCase() !== username.toLowerCase(),
  );
  if (next.length === users.length) throw new AuthError("User not found.");
  // Guardrail: never delete the last admin — would lock out the system.
  if (!next.some((u) => u.isAdmin)) {
    throw new AuthError("Cannot delete the last admin.");
  }
  saveToDisk(next);
}

export function verifyPassword(username: string, password: string): StoredUser | null {
  const u = findByUsername(username);
  if (!u) {
    // Bcrypt a dummy to keep response time roughly constant regardless of
    // whether the username exists — small mitigation against username
    // enumeration timing attacks.
    bcrypt.compareSync(password, "$2a$10$invalidsaltinvalidsaltinvalidsaltinval");
    return null;
  }
  return bcrypt.compareSync(password, u.passwordHash) ? u : null;
}

export function touchLastLogin(username: string): void {
  const users = getUsers();
  const idx = users.findIndex(
    (x) => x.username.toLowerCase() === username.toLowerCase(),
  );
  if (idx < 0) return;
  const copy = [...users];
  copy[idx] = { ...copy[idx], lastLoginAt: new Date().toISOString() };
  saveToDisk(copy);
}

// ----- session cookies (signed, restart-safe) ---------------------------

function sessionSecret(): Buffer {
  const s = process.env.PM_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new AuthError(
      "PM_SESSION_SECRET is missing or too short. Set it in .env.local.",
    );
  }
  return Buffer.from(s, "utf8");
}

/** Build a signed cookie value: base64(username + '.' + expiresMs) + '.' + sig.
 *  Encodes the username and expiry into the cookie itself, then HMACs the
 *  whole thing with the server secret. Restart-safe: no in-memory session
 *  map. To invalidate a session early, rotate the secret. */
export function signSession(username: string, ttlDays = SESSION_TTL_DAYS): string {
  const expiresMs = Date.now() + ttlDays * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(`${username}.${expiresMs}`, "utf8").toString(
    "base64url",
  );
  const sig = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

/** Cryptographically verify a session cookie and return the encoded username
 *  if (and only if) the signature is valid and the token is unexpired — else
 *  null. The user lookup is left to `verifySession`, so this — where all the
 *  security logic lives — is unit-testable without the user store. */
export function decodeSession(cookie: string | undefined): string | null {
  if (!cookie) return null;
  const parts = cookie.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  let username: string;
  let expiresMs: number;
  try {
    const decoded = Buffer.from(payload, "base64url").toString("utf8");
    const dot = decoded.lastIndexOf(".");
    if (dot < 0) return null;
    username = decoded.slice(0, dot);
    expiresMs = Number(decoded.slice(dot + 1));
  } catch {
    return null;
  }
  if (!username || !Number.isFinite(expiresMs) || expiresMs < Date.now()) {
    return null;
  }
  return username;
}

export function verifySession(cookie: string | undefined): StoredUser | null {
  const username = decodeSession(cookie);
  return username ? findByUsername(username) : null;
}

/** Random opaque ID — currently unused, kept for future audit-log entries. */
export function newId(): string {
  return randomBytes(12).toString("base64url");
}

// ----- errors -----------------------------------------------------------

/** Thrown by user-facing operations. Safe to surface .message in the API
 *  response — never includes secrets or internal state. */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
