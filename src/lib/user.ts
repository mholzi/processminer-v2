// The signed-in user — a name and a role, captured at the login gate and
// stamped onto every approval and edit, plus a few UI preferences set in the
// profile modal. There is no real auth: Processminer is a local internal
// tool, so the identity is just persisted in the browser's localStorage and
// can be changed or cleared any time.

export type User = {
  name: string;
  role: string;
  // Stream the assistant's reply word by word as it is written, instead of
  // showing it all at once when the turn finishes. Off by default.
  streamReplies?: boolean;
};

const KEY = "processminer.user";

/** Read the saved user, or null if none / unusable. SSR-safe. */
export function loadUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<User>;
    const name = typeof parsed.name === "string" ? parsed.name.trim() : "";
    const role = typeof parsed.role === "string" ? parsed.role.trim() : "";
    const streamReplies = parsed.streamReplies === true;
    return name && role ? { name, role, streamReplies } : null;
  } catch {
    return null;
  }
}

/** Persist the user for future sessions. */
export function saveUser(user: User): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(user));
  } catch {
    /* storage unavailable — the identity stays in memory for this session */
  }
}

/** Forget the saved user — the next load returns to the login gate. */
export function clearUser(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

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
