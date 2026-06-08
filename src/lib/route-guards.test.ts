import { test } from "node:test";
import assert from "node:assert/strict";
import type { NextRequest } from "next/server";
import { isValidSlug, requireUser, requireAdmin, requireAccess } from "./route-guards.ts";

// A minimal NextRequest stand-in: the guards only touch `req.cookies.get`.
function reqWithCookie(value?: string): NextRequest {
  return {
    cookies: { get: () => (value === undefined ? undefined : { value }) },
  } as unknown as NextRequest;
}

test("isValidSlug accepts kebab-case slugs", () => {
  assert.equal(isValidSlug("cob-003"), true);
  assert.equal(isValidSlug("funds-release-dogfood-3"), true);
  assert.equal(isValidSlug("a"), true);
  assert.equal(isValidSlug("a1b2"), true);
});

test("isValidSlug rejects traversal, dots, slashes, uppercase, empties", () => {
  assert.equal(isValidSlug("../../wiki/processes"), false); // traversal
  assert.equal(isValidSlug(".."), false);
  assert.equal(isValidSlug("a.b"), false); // dot
  assert.equal(isValidSlug("a/b"), false); // slash
  assert.equal(isValidSlug("COB-003"), false); // uppercase
  assert.equal(isValidSlug("-leading"), false);
  assert.equal(isValidSlug("trailing-"), false);
  assert.equal(isValidSlug("double--dash"), false);
  assert.equal(isValidSlug(""), false);
  assert.equal(isValidSlug(undefined), false);
  assert.equal(isValidSlug(123), false);
});

test("requireUser returns 401 when no session cookie is present", () => {
  const r = requireUser(reqWithCookie());
  assert.ok(r instanceof Response);
  assert.equal((r as Response).status, 401);
});

test("requireUser returns 401 for a garbage cookie", () => {
  const r = requireUser(reqWithCookie("not-a-valid-token"));
  assert.ok(r instanceof Response);
  assert.equal((r as Response).status, 401);
});

test("requireAdmin returns 401 when unauthenticated (fails before the admin check)", () => {
  const r = requireAdmin(reqWithCookie());
  assert.ok(r instanceof Response);
  assert.equal((r as Response).status, 401);
});

test("requireAccess returns 401 when unauthenticated (fails before the access check)", () => {
  const r = requireAccess(reqWithCookie(), "cob-003");
  assert.ok(r instanceof Response);
  assert.equal((r as Response).status, 401);
});
