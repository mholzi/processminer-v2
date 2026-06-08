// Tests for the session-cookie verifier — the authn boundary. `decodeSession`
// holds all the crypto/expiry logic (the user lookup is split into
// verifySession), so it is testable without the user store. A test secret is
// set before any call, since sessionSecret() reads PM_SESSION_SECRET at use.
import { test } from "node:test";
import assert from "node:assert/strict";

process.env.PM_SESSION_SECRET = "test-secret-at-least-16-chars-long";

const { signSession, decodeSession } = await import("./auth-server.ts");

test("decodeSession round-trips a freshly signed token to its username", () => {
  assert.equal(decodeSession(signSession("u.test")), "u.test");
});

test("decodeSession rejects a missing or empty cookie", () => {
  assert.equal(decodeSession(undefined), null);
  assert.equal(decodeSession(""), null);
});

test("decodeSession rejects the wrong number of dot-segments", () => {
  assert.equal(decodeSession("onlyonepart"), null);
  assert.equal(decodeSession("a.b.c"), null);
});

test("decodeSession rejects a tampered signature", () => {
  const tok = signSession("u.test");
  const [payload, sig] = tok.split(".");
  const flipped = (sig[0] === "A" ? "B" : "A") + sig.slice(1);
  assert.equal(decodeSession(`${payload}.${flipped}`), null);
});

test("decodeSession rejects a swapped payload (signature no longer matches)", () => {
  const evilPayload = signSession("u.evil").split(".")[0];
  const goodSig = signSession("u.test").split(".")[1];
  assert.equal(decodeSession(`${evilPayload}.${goodSig}`), null);
});

test("decodeSession rejects an expired token", () => {
  // negative TTL → expiry in the past
  assert.equal(decodeSession(signSession("u.test", -1)), null);
});

test("decodeSession rejects a token signed with a different secret", () => {
  const tok = signSession("u.test");
  const saved = process.env.PM_SESSION_SECRET;
  process.env.PM_SESSION_SECRET = "a-totally-different-secret-1234";
  try {
    assert.equal(decodeSession(tok), null);
  } finally {
    process.env.PM_SESSION_SECRET = saved;
  }
});
