import { test } from "node:test";
import assert from "node:assert/strict";
import { rateLimit, clearRateLimit, _resetAllRateLimits } from "./rate-limit.ts";

test("allows up to the limit, then blocks within the window", () => {
  _resetAllRateLimits();
  const t0 = 1_000_000;
  for (let i = 1; i <= 3; i++) {
    const r = rateLimit("k", 3, 60_000, t0);
    assert.equal(r.allowed, true, `hit ${i} should be allowed`);
    assert.equal(r.remaining, 3 - i);
  }
  const blocked = rateLimit("k", 3, 60_000, t0);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
  assert.ok(blocked.retryAfterSec > 0 && blocked.retryAfterSec <= 60);
});

test("resets once the window elapses", () => {
  _resetAllRateLimits();
  const t0 = 2_000_000;
  rateLimit("k", 1, 60_000, t0); // uses the single allowance
  assert.equal(rateLimit("k", 1, 60_000, t0).allowed, false); // still in window
  // advance past the window
  assert.equal(rateLimit("k", 1, 60_000, t0 + 60_001).allowed, true);
});

test("keys are independent", () => {
  _resetAllRateLimits();
  const t0 = 3_000_000;
  rateLimit("a", 1, 60_000, t0);
  assert.equal(rateLimit("a", 1, 60_000, t0).allowed, false);
  assert.equal(rateLimit("b", 1, 60_000, t0).allowed, true); // different key, fresh
});

test("clearRateLimit drops a key's window", () => {
  _resetAllRateLimits();
  const t0 = 4_000_000;
  rateLimit("k", 1, 60_000, t0);
  assert.equal(rateLimit("k", 1, 60_000, t0).allowed, false);
  clearRateLimit("k");
  assert.equal(rateLimit("k", 1, 60_000, t0).allowed, true); // counter reset
});
