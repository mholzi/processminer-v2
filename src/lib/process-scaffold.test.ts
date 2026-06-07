import { test } from "node:test";
import assert from "node:assert/strict";
import {
  slugifyProcessName,
  abbreviateProcessName,
  deriveProcessMeta,
  suggestAlternativeSlugs,
} from "./process-scaffold.ts";

const never = () => false;

test("slug is kebab-case and always non-empty", () => {
  assert.equal(slugifyProcessName("Funds Release Dogfood"), "funds-release-dogfood");
  assert.equal(slugifyProcessName("Know Your Customer (KYC)"), "know-your-customer-kyc");
  assert.equal(slugifyProcessName("!!!"), "process");
  assert.equal(slugifyProcessName("Über Zahlungen"), "uber-zahlungen");
});

test("abbreviation is always 2-6 uppercase letters (no FRD2-style reject)", () => {
  const names = [
    "Funds Release Dogfood",
    "Funds Release & Disbursement 2",
    "Onboarding",
    "Loan",
    "A",
    "Anti-Money Laundering Transaction Monitoring for Retail",
    "12345",
  ];
  for (const n of names) {
    const proc = abbreviateProcessName(n);
    assert.match(proc, /^[A-Z]{2,6}$/, `"${n}" -> "${proc}" must be 2-6 uppercase letters`);
  }
});

test("stopwords and digits never reach the abbreviation", () => {
  assert.equal(abbreviateProcessName("Funds Release & Disbursement 2"), "FRD");
  assert.equal(abbreviateProcessName("Onboarding"), "ONBO");
});

test("deriveProcessMeta flags collisions and suggests non-colliding slugs", () => {
  const taken = (s: string) => s === "onboarding" || s === "onboarding-2";
  const meta = deriveProcessMeta("Onboarding", taken);
  assert.equal(meta.slugTaken, true);
  assert.ok(meta.suggestedSlugs.length > 0);
  assert.ok(meta.suggestedSlugs.every((s) => !taken(s)));
  assert.ok(!meta.suggestedSlugs.includes("onboarding-2"));
});

test("no suggestions when the slug is free", () => {
  const meta = deriveProcessMeta("Brand New Process", never);
  assert.equal(meta.slugTaken, false);
  assert.deepEqual(meta.suggestedSlugs, []);
});

test("confirmTemplate carries the description placeholder and derived values", () => {
  const meta = deriveProcessMeta("Funds Release Dogfood", never);
  assert.match(meta.confirmTemplate, /\{\{description\}\}/);
  assert.match(meta.confirmTemplate, /`funds-release-dogfood`/);
  assert.match(meta.confirmTemplate, /`FRD`/);
});

test("derivation is deterministic across runs", () => {
  const a = deriveProcessMeta("Trade Settlement", never);
  const b = deriveProcessMeta("Trade Settlement", never);
  assert.deepEqual(a, b);
});

test("suggestAlternativeSlugs caps at three", () => {
  assert.equal(suggestAlternativeSlugs("x", never).length, 3);
});
