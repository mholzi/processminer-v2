// The signed-in user — identified by an immutable `username` handle plus a
// display name and role. Authentication is real: users live in
// data/users.json with bcrypt-hashed passwords (see src/lib/auth-server.ts),
// and the session is a signed HTTP-only cookie. The client only ever sees
// the redacted shape (no passwordHash).

/** Which modules the user is entitled to. Drives the welcome screen and
 *  which workspaces they can enter. Undefined = both granted (legacy /
 *  unrestricted users). Real upstream identity will set this explicitly. */
export type Entitlement = "pm" | "am";

export type User = {
  /** Immutable handle the user logs in with (e.g. "m.berger"). Never edited. */
  username: string;
  /** Display name used on approvals + the UI. Editable by the user / admin. */
  name: string;
  /** Job title / role label, shown next to the name. Editable. */
  role: string;
  /** Stream the assistant's reply word by word as it is written. */
  streamReplies?: boolean;
  /** ID of the last What's New entry the user has seen. Used to compute the
   *  unseen badge count on the Help button. */
  whatsNewSeen?: string;
  /** Modules this user can open. Undefined = both granted. */
  entitlements?: Entitlement[];
  /** True for users who can manage other users + reset passwords. */
  isAdmin?: boolean;
};

/** Whether the user has a given module entitlement. Treats undefined as
 *  "both granted" for backward-compatibility with users saved before
 *  entitlements existed. */
export function hasEntitlement(user: User, mod: Entitlement): boolean {
  return !user.entitlements || user.entitlements.includes(mod);
}

// The user is no longer stored in localStorage. The signed session cookie
// is the source of truth — set + cleared by /api/auth/login + /logout, read
// by /api/auth/me. localStorage stays in the codebase only for per-device
// UI preferences (recent processes, pinned, etc.).

/** Up to three uppercase initials from a name, for the avatar chip. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
}
