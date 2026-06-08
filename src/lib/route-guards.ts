// Shared HTTP route guards. Every API handler that needs authentication,
// admin rights, or per-process access should go through one of these so the
// checks can't drift or be half-applied per route (audit API-16). Each guard
// returns the verified `StoredUser` on success, or a ready-to-return failure
// response (401/403).
//
// Guards return the web-standard `Response` on failure (not NextResponse), so
// the module stays decoupled from the Next runtime and is unit-testable. All
// callers check `if (r instanceof Response) return r;`.

import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifySession, type StoredUser } from "./auth-server.ts";
import { canAccess } from "./process-access.ts";

/** Canonical process-slug grammar: kebab-case, no dots or slashes — so a slug
 *  can never traverse out of a `<dir>/<slug>` path. Use everywhere a slug is
 *  read from a request (audit API-8). */
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: unknown): slug is string {
  return typeof slug === "string" && SLUG_RE.test(slug);
}

/** 401 unless the request carries a valid session cookie. */
export function requireUser(req: NextRequest): StoredUser | Response {
  const user = verifySession(req.cookies.get(COOKIE_NAME)?.value);
  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }
  return user;
}

/** 401 if not signed in, 403 if not an admin. */
export function requireAdmin(req: NextRequest): StoredUser | Response {
  const r = requireUser(req);
  if (r instanceof Response) return r;
  if (!r.isAdmin) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }
  return r;
}

/** 401 if not signed in, 403 if the user can't access this process (R16).
 *  Admins and ungoverned processes always pass — see `canAccess`. */
export function requireAccess(
  req: NextRequest,
  slug: string,
): StoredUser | Response {
  const r = requireUser(req);
  if (r instanceof Response) return r;
  if (!canAccess(r, slug)) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }
  return r;
}
