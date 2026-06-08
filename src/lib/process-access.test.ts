// Tests for the per-process authorization rule (R16). The pure decision is
// `canAccessWith`; `canAccess` just loads the record off disk and delegates.
import { test } from "node:test";
import assert from "node:assert/strict";
import { canAccessWith } from "./process-access.ts";

const owner = { username: "o.owner" };
const grantee = { username: "g.guest" };
const stranger = { username: "x.stranger" };
const admin = { username: "a.admin", isAdmin: true };

const governed = { owner: "o.owner", grants: ["g.guest"] };

test("an ungoverned process (no record) is visible to everyone", () => {
  assert.equal(canAccessWith(undefined, stranger), true);
  assert.equal(canAccessWith(undefined, admin), true);
});

test("a record without an owner counts as ungoverned", () => {
  assert.equal(canAccessWith({ owner: "", grants: [] }, stranger), true);
});

test("the owner and explicit grantees can access a governed process", () => {
  assert.equal(canAccessWith(governed, owner), true);
  assert.equal(canAccessWith(governed, grantee), true);
});

test("an admin can access any governed process", () => {
  assert.equal(canAccessWith(governed, admin), true);
});

test("a stranger cannot access a governed process", () => {
  assert.equal(canAccessWith(governed, stranger), false);
});

test("a revoked user (no longer in grants) is denied", () => {
  assert.equal(canAccessWith({ owner: "o.owner", grants: [] }, grantee), false);
});
