import { test } from "node:test";
import assert from "node:assert/strict";
import { isForbiddenCrossOrigin } from "./csrf.ts";

const H = "app.example.com";

test("safe methods always pass, even cross-origin", () => {
  assert.equal(isForbiddenCrossOrigin("GET", "https://evil.com", H), false);
  assert.equal(isForbiddenCrossOrigin("HEAD", "https://evil.com", H), false);
});

test("a same-origin mutation passes", () => {
  assert.equal(isForbiddenCrossOrigin("POST", `https://${H}`, H), false);
  assert.equal(isForbiddenCrossOrigin("DELETE", `https://${H}`, H), false);
});

test("a cross-origin mutation is blocked", () => {
  assert.equal(isForbiddenCrossOrigin("POST", "https://evil.com", H), true);
  assert.equal(isForbiddenCrossOrigin("PATCH", `https://${H}.evil.com`, H), true);
});

test("a missing Origin passes (non-browser caller can't CSRF)", () => {
  assert.equal(isForbiddenCrossOrigin("POST", null, H), false);
});

test("a malformed Origin is rejected", () => {
  assert.equal(isForbiddenCrossOrigin("POST", "not a url", H), true);
});

test("PM_ALLOWED_ORIGIN is the authority when set (proxy case)", () => {
  // Host differs (internal), but the Origin matches the configured public origin.
  assert.equal(
    isForbiddenCrossOrigin("POST", "https://public.example.com", "internal:3000", "https://public.example.com"),
    false,
  );
  assert.equal(
    isForbiddenCrossOrigin("POST", "https://evil.com", "internal:3000", "https://public.example.com"),
    true,
  );
});
