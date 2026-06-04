// Tests for the read-only orchestrator layer (R10) — run with:  npm test
// Node's built-in test runner + type stripping; no extra dependency.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildAttentionFeed,
  buildOrchestratorState,
  type ActionSpec,
} from "./orchestrator.ts";
import type { ProcessDoc, WikiPage } from "./wiki.ts";
import type { LintFinding } from "./lint.ts";

// ---- Fixture helpers -----------------------------------------------------
// Build the minimum shape of a ProcessDoc the orchestrator needs. Runtime
// inputs (lint, reviewState) are read off the hydrated doc — getProcess
// stitches them in from the runtime store (R9), so here we set them directly.

function processPage(id: string, title: string): WikiPage {
  return {
    id,
    type: "process",
    section: "overview",
    title,
    status: "draft",
    meta: {},
    body: "",
    blocks: [],
  };
}

function finding(over: Partial<LintFinding> = {}): LintFinding {
  return {
    id: "F-001",
    kind: "discrepancy",
    title: "A finding",
    detail: "Something is off.",
    elements: ["PS-001"],
    ...over,
  };
}

const EMPTY_SUMMARY = { conformance: 0, discrepancy: 0, question: 0 };

function doc(opts: {
  slug: string;
  title?: string;
  conflicts?: number;
  openLintFindings?: number;
  openComments?: number;
  runResumable?: { cursor: number; total: number; done?: boolean } | null;
}): ProcessDoc {
  const findings: LintFinding[] = [];
  for (let i = 0; i < (opts.openLintFindings ?? 0); i++) {
    findings.push(finding({ id: `F-${i + 1}` }));
  }
  const notes: Record<string, { id: string; author: string; text: string; ts: string; resolved?: boolean }[]> = {};
  if (opts.openComments && opts.openComments > 0) {
    notes["PS-001"] = [];
    for (let i = 0; i < opts.openComments; i++) {
      notes["PS-001"].push({
        id: `N-${i + 1}`,
        author: "sme",
        text: "Question",
        ts: "2026-01-01T00:00:00Z",
      });
    }
  }
  return {
    slug: opts.slug,
    process: processPage(opts.slug.toUpperCase(), opts.title ?? opts.slug),
    elements: [],
    sources: [],
    lint:
      findings.length > 0
        ? {
            generatedAt: "2026-01-01T00:00:00Z",
            slug: opts.slug,
            summary: EMPTY_SUMMARY,
            findings,
          }
        : undefined,
    ingest:
      opts.conflicts && opts.conflicts > 0
        ? {
            generatedAt: "2026-01-01T00:00:00Z",
            slug: opts.slug,
            file: "test.pdf",
            created: [],
            updated: [],
            conflicts: Array.from({ length: opts.conflicts }, (_, i) => ({
              element: `EL-${i}`,
              field: "title",
              documentSays: "a",
              wikiSays: "b",
            })),
            corrections: [],
          }
        : undefined,
    notes: Object.keys(notes).length > 0 ? notes : undefined,
    reviewState:
      opts.runResumable !== undefined && opts.runResumable !== null
        ? {
            slug: opts.slug,
            queue: [],
            cursor: opts.runResumable.cursor,
            total: opts.runResumable.total,
            done: opts.runResumable.done ?? false,
            startedAt: "2026-01-01T00:00:00Z",
            updatedAt: "2026-01-01T00:00:00Z",
          }
        : undefined,
  };
}

function kinds(actions: ActionSpec[]): string[] {
  return actions.map((a) => a.kind);
}

// ---- buildOrchestratorState ---------------------------------------------

test("buildOrchestratorState: clean process returns no actions and clean health", () => {
  const d = doc({ slug: "clean" });
  const state = buildOrchestratorState(d);
  assert.deepEqual(state.actions, []);
  assert.equal(state.topAction, null);
  assert.equal(state.health.clean, true);
  assert.equal(state.health.conflicts, 0);
  assert.equal(state.health.openLintFindings, 0);
  assert.equal(state.health.openComments, 0);
  assert.equal(state.health.runResumable, false);
});

test("buildOrchestratorState: conflicts outrank lint and comments", () => {
  // 1 conflict (weight 100) should beat 5 lint (25) and 50 comments (50).
  const d = doc({
    slug: "x",
    conflicts: 1,
    openLintFindings: 5,
    openComments: 50,
  });
  const state = buildOrchestratorState(d);
  assert.equal(state.topAction?.kind, "resolve-ingest-conflict");
});

test("buildOrchestratorState: lint outranks comments at equal counts", () => {
  // 3 lint (weight 15) vs 3 comments (weight 3).
  const d = doc({ slug: "x", openLintFindings: 3, openComments: 3 });
  const state = buildOrchestratorState(d);
  assert.deepEqual(kinds(state.actions), [
    "resolve-lint-finding",
    "address-comment",
  ]);
});

test("buildOrchestratorState: resume-run sits between conflicts and lint", () => {
  // No conflicts, but a 100-item run with 100 left (weight 50 + 100 = 150).
  // Plus 10 lint (weight 50) — the run wins.
  const dRunBeatsLint = doc({
    slug: "a",
    openLintFindings: 10,
    runResumable: { cursor: 0, total: 100 },
  });
  const sA = buildOrchestratorState(dRunBeatsLint);
  assert.equal(sA.topAction?.kind, "resume-foundational-run");

  // And a tiny run easily loses to many lint findings.
  const dLintBeatsRun = doc({
    slug: "b",
    openLintFindings: 30,
    runResumable: { cursor: 95, total: 100 },
  });
  const sB = buildOrchestratorState(dLintBeatsRun);
  assert.equal(sB.topAction?.kind, "resolve-lint-finding");
});

test("buildOrchestratorState: a done run is not resumable", () => {
  const d = doc({ slug: "x", runResumable: { cursor: 10, total: 10, done: true } });
  const state = buildOrchestratorState(d);
  assert.equal(state.health.runResumable, false);
  assert.equal(
    state.actions.find((a) => a.kind === "resume-foundational-run"),
    undefined,
  );
});

test("buildOrchestratorState: actions sorted by weight descending", () => {
  const d = doc({
    slug: "x",
    conflicts: 2,
    openLintFindings: 4,
    openComments: 7,
    runResumable: { cursor: 50, total: 100 }, // weight 50 + 50 = 100
  });
  const state = buildOrchestratorState(d);
  // Expected: conflicts (200) > run (100) > lint (20) > comments (7).
  assert.deepEqual(kinds(state.actions), [
    "resolve-ingest-conflict",
    "resume-foundational-run",
    "resolve-lint-finding",
    "address-comment",
  ]);
  // Strictly descending.
  for (let i = 0; i < state.actions.length - 1; i++) {
    assert.ok(state.actions[i].weight >= state.actions[i + 1].weight);
  }
});

test("buildOrchestratorState: dismissed lint findings don't count", () => {
  // isOpen excludes resolved/dismissed; the orchestrator should agree.
  const d = doc({ slug: "x", openLintFindings: 0 });
  d.lint = {
    generatedAt: "2026-01-01T00:00:00Z",
    slug: "x",
    summary: EMPTY_SUMMARY,
    findings: [
      finding({ id: "F-1", status: "dismissed" }),
      finding({ id: "F-2", status: "resolved" }),
      finding({ id: "F-3", status: "open" }),
    ],
  };
  const state = buildOrchestratorState(d);
  assert.equal(state.health.openLintFindings, 1);
});

test("buildOrchestratorState: resolved notes don't count", () => {
  const d = doc({ slug: "x", openComments: 0 });
  d.notes = {
    "PS-001": [
      { id: "N-1", author: "sme", text: "a", ts: "2026-01-01T00:00:00Z" },
      { id: "N-2", author: "sme", text: "b", ts: "2026-01-01T00:00:00Z", resolved: true },
      { id: "N-3", author: "sme", text: "c", ts: "2026-01-01T00:00:00Z" },
    ],
  };
  const state = buildOrchestratorState(d);
  assert.equal(state.health.openComments, 2);
});

// ---- buildAttentionFeed -------------------------------------------------

test("buildAttentionFeed: clean processes fall out into cleanProcesses", () => {
  const a = doc({ slug: "clean" });
  const b = doc({ slug: "dirty", openComments: 2 });
  const feed = buildAttentionFeed([a, b]);
  assert.deepEqual(
    feed.cleanProcesses.map((d) => d.slug),
    ["clean"],
  );
  assert.deepEqual(
    feed.attentionRows.map((r) => r.slug),
    ["dirty"],
  );
});

test("buildAttentionFeed: rows sorted by weight (highest first)", () => {
  const small = doc({ slug: "small", openComments: 1 }); // weight 1
  const big = doc({ slug: "big", conflicts: 2 }); // weight 200
  const mid = doc({ slug: "mid", openLintFindings: 10 }); // weight 50
  const feed = buildAttentionFeed([small, big, mid]);
  assert.deepEqual(
    feed.attentionRows.map((r) => r.slug),
    ["big", "mid", "small"],
  );
});

test("buildAttentionFeed: reasons preserve the legacy phrasing", () => {
  // The dashboard's existing ATTENTION column rendered exactly these strings
  // before R10. Migration must not change them.
  const d = doc({ slug: "x", conflicts: 6, openLintFindings: 21, openComments: 2 });
  const feed = buildAttentionFeed([d]);
  assert.deepEqual(feed.attentionRows[0].reasons, [
    "6 ingest conflicts",
    "21 quality findings",
    "2 comments",
  ]);
});

test("buildAttentionFeed: singular vs plural in reasons", () => {
  const d = doc({ slug: "x", conflicts: 1, openLintFindings: 1, openComments: 1 });
  const feed = buildAttentionFeed([d]);
  assert.deepEqual(feed.attentionRows[0].reasons, [
    "1 ingest conflict",
    "1 quality finding",
    "1 comment",
  ]);
});

test("buildAttentionFeed: weight matches the pre-migration formula", () => {
  // Pre-migration: weight = conflicts * 100 + lint * 5 + comments.
  // Locked in here so a future refactor can't silently change the order.
  const d = doc({ slug: "x", conflicts: 2, openLintFindings: 3, openComments: 4 });
  const feed = buildAttentionFeed([d]);
  assert.equal(feed.attentionRows[0].weight, 2 * 100 + 3 * 5 + 4);
});
