// Tests for the R6b author display-name resolver — run with:  npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveAuthor } from "./wiki.ts";

const roster = new Map([
  ["m.berger", "M. Berger"],
  ["a.klein", "Anna Klein"],
]);

test("resolveAuthor maps a known username to its current display name", () => {
  assert.equal(resolveAuthor("m.berger", roster), "M. Berger");
  assert.equal(resolveAuthor("a.klein", roster), "Anna Klein");
});

test("resolveAuthor falls back to the stored value (legacy display-name records)", () => {
  // A stored display name is not a username key, so it passes through unchanged.
  assert.equal(resolveAuthor("M. Berger", roster), "M. Berger");
  assert.equal(resolveAuthor("SME", roster), "SME");
});

test("resolveAuthor passes through non-strings and empties", () => {
  assert.equal(resolveAuthor(undefined, roster), undefined);
  assert.equal(resolveAuthor(null, roster), null);
  assert.equal(resolveAuthor("", roster), "");
});
