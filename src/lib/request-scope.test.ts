import { test } from "node:test";
import assert from "node:assert/strict";
import { isNoRequestContextError } from "./request-scope.ts";

// (a) next/headers can't be loaded — the bare-node / separate-worker case.
function moduleNotFound(): Error {
  const e = new Error(
    "Cannot find module '/app/node_modules/next/headers' imported from /app/src/lib/wiki-write.ts",
  );
  (e as { code?: string }).code = "ERR_MODULE_NOT_FOUND";
  return e;
}

// (b) loaded but outside a request scope — the in-process worker case.
function nextOutsideScopeError(): Error {
  const e = new Error("`cookies` was called outside a request scope. Read more: …");
  Object.defineProperty(e, "__NEXT_ERROR_CODE", { value: "E251", enumerable: false });
  return e;
}

test("recognises a next/headers module-not-found as no-request-context", () => {
  assert.equal(isNoRequestContextError(moduleNotFound()), true);
});

test("recognises the Next outside-request-scope error by code", () => {
  assert.equal(isNoRequestContextError(nextOutsideScopeError()), true);
});

test("recognises outside-request-scope by message even without the code", () => {
  assert.equal(
    isNoRequestContextError(new Error("`headers` was called outside a request scope.")),
    true,
  );
});

test("does NOT match an unrelated error (resolveWriter fails closed)", () => {
  assert.equal(isNoRequestContextError(new Error("ENOENT: users.json not found")), false);
  // a module-not-found for some OTHER module is not our signal
  const otherModule = new Error("Cannot find module 'left-pad'");
  (otherModule as { code?: string }).code = "ERR_MODULE_NOT_FOUND";
  assert.equal(isNoRequestContextError(otherModule), false);
  // a different Next error code must not be treated as no-request-context
  const afterErr = new Error("used `cookies()` inside `after()`");
  Object.defineProperty(afterErr, "__NEXT_ERROR_CODE", { value: "E843", enumerable: false });
  assert.equal(isNoRequestContextError(afterErr), false);
});

test("tolerates non-error inputs", () => {
  assert.equal(isNoRequestContextError(null), false);
  assert.equal(isNoRequestContextError(undefined), false);
  assert.equal(isNoRequestContextError("outside a request scope"), false);
  assert.equal(isNoRequestContextError({}), false);
});
