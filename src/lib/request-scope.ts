// Recognise the errors that definitively mean "this code is NOT running inside
// a Next HTTP request" — i.e. it's the in-process/headless AI worker (or a
// unit test), not a browser server action.
//
// wiki-write's `resolveWriter` grants the trusted system-author path ONLY for
// these. The previous code caught EVERY error and returned the trusted author,
// so any unexpected throw inside the cookies machinery would silently bypass
// the auth/ACL check (fail open — audit LIB-10). Matching only the two genuine
// "no request context" signals lets the writer fail CLOSED on anything else.
//
// Neither signal can occur mid-request in a deployed app:
//   (a) `next/headers` failing to resolve → Next isn't loadable here at all
//       (the separate `claude` worker process, or a bare-node unit test).
//   (b) Next's "called outside a request scope" error (E251 in Next 16) →
//       `next/headers` loaded, but there is no request store (the in-process
//       Gemini worker's async loop).

export function isNoRequestContextError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as {
    __NEXT_ERROR_CODE?: unknown;
    code?: unknown;
    message?: unknown;
  };

  // (a) next/headers cannot be loaded → not inside Next.
  if (
    (e.code === "ERR_MODULE_NOT_FOUND" || e.code === "MODULE_NOT_FOUND") &&
    typeof e.message === "string" &&
    e.message.includes("next/headers")
  ) {
    return true;
  }

  // (b) loaded, but called outside a request scope. Next stamps a stable
  // __NEXT_ERROR_CODE (E251 in Next 16); fall back to the message across versions.
  if (e.__NEXT_ERROR_CODE === "E251") return true;
  return (
    typeof e.message === "string" &&
    /was called outside a request scope/i.test(e.message)
  );
}
