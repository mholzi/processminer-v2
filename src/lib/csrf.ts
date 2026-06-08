// CSRF defense (API-10): reject cross-origin state-changing requests. The
// session cookie is sameSite=strict, which already blocks the common vectors;
// this is defense-in-depth via an Origin check, enforced centrally in
// middleware.ts. Kept as a pure function so the decision is unit-testable.

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * True when a request should be rejected as a cross-origin (CSRF) mutation.
 *
 * - Safe methods (GET/HEAD/OPTIONS) always pass.
 * - A missing `Origin` passes: browsers send `Origin` on every cross-site
 *   mutation, so no-Origin means a non-browser caller, which cannot mount a
 *   CSRF attack (and shouldn't be blocked — e.g. server-to-server, curl).
 * - With `allowedOrigin` set (env `PM_ALLOWED_ORIGIN`), it is the authority —
 *   useful behind a proxy where `Host` may not equal the public origin.
 *   Otherwise the request's own `Host` must match the `Origin`'s host.
 */
export function isForbiddenCrossOrigin(
  method: string,
  origin: string | null,
  host: string | null,
  allowedOrigin?: string,
): boolean {
  if (!MUTATING.has(method.toUpperCase())) return false;
  if (!origin) return false;

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return true; // malformed Origin → reject
  }

  if (allowedOrigin) {
    let allowedHost = allowedOrigin;
    try {
      allowedHost = new URL(allowedOrigin).host;
    } catch {
      /* allow a bare host value */
    }
    return originHost !== allowedHost;
  }
  return host ? originHost !== host : true;
}
