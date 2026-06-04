# Processminer — Post-Migration Requirements Roadmap

**Purpose.** After replacing `main` with the JSON-native baseline (`b6f7b64`), this document triages every code-touching commit that the old main line carried but the new baseline dropped (see [`SUPERSEDED-MAIN-COMMITS.md`](SUPERSEDED-MAIN-COMMITS.md)), and turns the still-relevant ones into candidate requirements.

**Status of this doc.** Every requirement below is **Proposed — pending your cross-read and prioritization.** Nothing is scheduled or accepted yet. The phase grouping in §3 is my *recommendation*, not a commitment. Use the requirement IDs (R1…Rn) to accept / reject / reorder.

**Method.** All 41 commits were assessed against the actual files on the current baseline. Each was classed:
- **PRESENT** — the functionality already exists on the new baseline → no action.
- **OBSOLETE** — the JSON-native rewrite supersedes or makes it irrelevant → no action.
- **GAP** — still-relevant functionality that is now missing → becomes a requirement.

The superseded commits are all recoverable from the safety tag `pre-json-native-main`.

---

## 1. Executive summary

The migration left **four kinds of gap**:

1. **ArchitectMiner is effectively non-functional.** The branch forked *immediately before* all the ArchitectMiner wiring landed, so the whole module reverted to mock/view-only state: the chat is a no-op (`onSend={() => {}}`), the Diagram/Traceability views are hardcoded illustrations, the Personal/Library tiers show fabricated data, and there are no architect-side AI specialists. This is the largest functional hole.

2. **Two data-integrity / security regressions returned.** The wiki again stores *display names* as author strings (renames drift, approvals attributed to a mutable string) and the API trusts a client-supplied author field (impersonation). Separately, two stringly-typed DSLs the team had deliberately structured — transitions (`to|kind|when`) and RACI (`step:level`) — survived the migration verbatim, unvalidated, inside `meta`.

3. **An architectural guardrail is violated.** Runtime/orchestration state (`reviewState`, `lint`) now lives **inside** `wiki/processes/cob-003.json`, contradicting the project's sacred rule that runtime state lives *above* the wiki layer. The design doc that codified that rule (`ORCHESTRATOR-PLAN.md`) and the read-only orchestrator that embodied it are both gone.

4. **A set of self-contained UX features were dropped:** delete-a-process, per-section summary UIs, Overview editing, the contributors/activity feed, and small polish (chat overlay, clickable chat refs).

**Good news:** the entire `get_context.py` / Python-context-script cluster (8 commits) is **legitimately obsolete** — Progressive Disclosure (the Document Map + `expandElement` in `gemini-worker.ts`/`claude-mcp-server.ts`) replaces it by design. And the docs/tooling cluster is mostly skippable. So ~16 of 41 commits need no action.

**Coverage:** of 41 code-touching commits → **~21 GAPs** (across ~17 requirements, several commits fold together), **~16 OBSOLETE/PRESENT**, **~4 product-decision** items.

---

## 2. Requirements (candidate set)

Each requirement: source commit(s), what's missing, impact, effort (S/M/L), recommendation, and where state lives in the JSON model. **Effort is rough.**

### Theme A — ArchitectMiner (module is currently view-only/mock)

#### R1 — Architect chat pipeline + Add/Elicit wiring
- **Source:** `c00ea31`
- **Gap:** The ArchitectMiner canvas chat is a no-op (`onSend={() => {}}`); every "+ Add X" and "Elicit with architect" button is an unwired `<button>`. The SME-side chat pipeline (ETA, watchdog, SKILL_LABEL, sessionStorage persistence) exists but is inlined in `ProcessDocScreen.tsx`, never extracted into a reusable `useAgentChat` hook, so the architect side can't reuse it.
- **Impact:** ArchitectMiner has no agent interaction at all — can't add/elicit ADRs, capabilities, integrations, NFRs. The functional heart of the workspace is dead.
- **Effort:** M–L · **Recommendation:** Redesign for JSON model (extract shared chat hook; target the new dual-track backend + `wiki-write.ts`/MCP write path, not the old Python skills).
- **Dependency:** Unblocks R2; R2 unblocks the rest of Theme A.

#### R2 — Domain-architect + solution-architect specialists
- **Source:** `98faa19`
- **Gap:** The two architect-side perspective specialists (domain-architect: capability/target-application/ADR; solution-architect: integration/component/NFR/migration-phase) don't exist as skills. No architect authoring intelligence.
- **Impact:** Even with R1 done, there's no agent to elicit architecture content.
- **Effort:** M · **Recommendation:** Redesign — mine the old SKILL.md prose for elicitation logic, reframe as pure reasoning prompts under `CORE_SYSTEM_PROMPT.md`. Drop the old verbatim BATCHING/WRITING-PROCEDURE/PROVENANCE blocks and `check_skill_blocks.py` (those were the Python-toolkit contract; provenance is now enforced by `conformance.ts`).

#### R3 — Diagram + Traceability real data wiring
- **Source:** `db525cf` (part 1 of 2)
- **Gap:** The ArchitectMiner Diagram is hardcoded SVG paths; Traceability shows a hardcoded "63 / illustrative" stat. Neither derives from `doc.elements`.
- **Impact:** The two headline architect analysis views are decorative mockups.
- **Effort:** M · **Recommendation:** Redesign — mostly mechanical; retarget relation-reading code at `doc.elements[].relations` inside `<slug>.json` (no schema change). Auto-position caps/apps, draw hostedIn + integration edges, bucket relations OK/partial/orphan.

#### R4 — Personal-work + Library tiers from real data
- **Source:** `de91eef`
- **Gap:** `PersonalViews.tsx` and `LibraryViews.tsx` are entirely mock (capability catalog, application register w/ BUILD/BUY verdicts, NFR templates, ADR ownership, migration plans, cross-process reuse).
- **Impact:** Personal/Library tiers show fabricated numbers; the cross-process-intelligence pitch doesn't function.
- **Effort:** M · **Recommendation:** Redesign — aggregate across all `<slug>.json` docs. ⚠️ Cross-process reuse will look empty until more than `cob-003` is migrated.

#### R5 — Per-edit attribution + contributors/activity feed
- **Source:** `27d68e4` + `08bbc07`
- **Gap:** `wiki-write.ts` stamps only `approvalBy`/`relevanceBy`, not general per-edit `updatedBy`/`updatedAt` on content. No `contributors.ts`, no `ContributorsView` (roster + paginated activity feed with per-person filter).
- **Impact:** Can't see who changed what; no activity timeline.
- ✅ **FIXED.** `updateElement` now stamps `updatedBy`/`updatedAt` (stable username, resolved to a display name at read time) on every content edit. A new `ContributorsView` (top-bar people icon → `__contributors`) is a per-process roster + activity feed built off the loaded `ProcessDoc`: element approvals (approved / rejected / **re-opened**, reading the *current* approval state), edits, note comments + resolutions, and source uploads — with per-person filter, clickable element targets (`goToElement`), and "show more" paging. Verified on `cob-003`: 2 contributors (run-lint, M. Berger), 6 correctly-labelled events. **Deferred:** lint resolved/dismissed events and a *global* (cross-process) feed — this view is per-process.
- *(Cleanup chores `ab4e351`, `ddbea02` fold into R3/R4 — don't reintroduce the mock fixtures when redesigning the canvas. `8df5961` mock seed is obsolete.)*

### Theme B — Data integrity & security (regressions that returned)

#### R6 — Stable user IDs + server-side author injection  ⚠️ security
- **Source:** `5980ed4`
- **Gap:** The wiki stores display names (`approvalBy: "M. Berger"`) instead of stable usernames, so renames never propagate and layers drift. API routes (`/api/notes`, `/api/findings`, `/api/upload`) take the author from the **request body**, not the session cookie → any client can impersonate any author. The infra exists (`user.ts` has immutable `username` vs editable `name`) but the wiki + write path ignore it.
- **Impact:** Impersonation vulnerability + attribution drift. Real on the current baseline regardless of storage shape.
- **R6a — server-side author injection (impersonation):** ✅ **FIXED.** `setApproval`/`setRelevance` (`wiki-write.ts`) and the `notes` / `findings` / `upload` routes now derive the author from the verified session cookie (`verifySession`) and ignore any client-supplied `author`/`by`/`uploadedBy`. Verified: a POST to `/api/notes` with a forged `author` stores the session user instead. The client signatures are kept (the passed value is ignored) to avoid render/prop churn.
- **R6b — rename propagation (drift):** ✅ **FIXED.** The wiki write paths now store the stable `username` (`sessionAuthor`/route helpers), and `getProcess` resolves each stored handle to the current display name via `resolveAuthor()` + the `getUsers()` roster — applied to element/overview `approvalBy`/`relevanceBy`, note `author`/`resolvedBy`, source `uploadedBy`, and lint `resolvedBy`/`dismissedBy`. So a rename in `data/users.json` now propagates everywhere on the next read. The resolver falls back to the stored value, so legacy display-name records (and the migrated `cob-003` data) still render correctly. Covered by `wiki.test.ts`. *(Feedback authorship is intentionally excluded — it's a separate non-wiki store still keyed by display name.)*

#### R7 — Typed transitions (`to|kind|when` → structured)
- **Source:** `bbcf8f0` (transitions half; provenance half is already DONE)
- **Gap:** Transitions are still a pipe-DSL inside `meta` (`"PS-COB-002|normal|"`), parsed with `split("|")` in `ElementCard.tsx`/`ProcessFlow.tsx`, with no AJV validation of target/kind and a `when` clause that must avoid commas.
- **Impact:** Fragile, unvalidated; reintroduces the brittleness the original refactor removed.
- ✅ **FIXED (scope A).** Transitions are now stored as `{to, kind, when}` objects (canonical) and validated by the AJV schema. The read-DTO bridge stringifies them to `"to|kind|when"` so display/flow stay unchanged (`transitionToString`/`transitionTarget` in `wiki.ts` accept either form). Fixed a latent bug: MCP/Gemini `checkTransitions` did `if (typeof t !== "string") continue`, silently skipping object-form transitions; now they read either form. `cob-003` data migrated; custom-schema note describes the object shape (guides the LLM). Display-side `split("|")` is retained (it parses the bridge's generated, schema-valid strings — safe).

#### R8 — Typed RACI (`step:level` → structured)
- **Source:** `5d85738`
- **Gap:** Roles carry `raci: ["PS-COB-001:A", …]` string DSL, parsed with `split(":")` in `RaciMatrix.tsx`/`ProcessFlow.tsx`, no validation that step resolves or level ∈ {R,A,C,I}.
- **Impact:** Same brittleness class as R7.
- ✅ **FIXED (scope A, with R7).** RACI is now stored as `{step, level}` objects and the AJV schema validates `level ∈ {R,A,C,I}` (was `array of string`). The bridge stringifies to `"step:level"` via `raciToString`, so `RaciMatrix`/`ProcessFlow` are unchanged. `cob-003` data migrated; custom-schema note describes the object shape. Verified: the RACI matrix renders 44 badges (R/A/C/I) from the structured data.

### Theme C — Architectural integrity (the guardrail)

#### R9 — Re-establish the "runtime above the wiki" principle + lift runtime state out of the JSON doc
- **Source:** `8a6f355` (ORCHESTRATOR-PLAN.md) + the live guardrail violation
- **Gap:** `reviewState` and `lint` are top-level keys **inside** `wiki/processes/cob-003.json`. The design doc that ruled "persistence lives outside `wiki/processes/`" is gone.
- **Impact:** Direct violation of the project's sacred Karpathy-wiki guardrail; runtime/orchestration state co-mingled with durable knowledge.
- ✅ **FIXED.** Runtime state (`reviewState`, `lint`, `findingDismissals`) now lives in a sibling **runtime store** (`src/lib/runtime-store.ts` → `data/runtime/<slug>.json`, gitignored). `getProcess` reads it; `applyLint` (MCP + Gemini) and `/api/findings` write it (and `delete doc.lint` as a guardrail so the wiki JSON can never carry it). `cob-003` migrated; `cob-003.json` now holds zero runtime keys. Verified: the welcome screen still shows the resume-run widget + lint findings, sourced from the runtime store. *(The full `ORCHESTRATOR-PLAN.md` doc + the read-only orchestrator consumer remain R10, optional.)*

#### R10 — Read-only orchestrator layer
- **Source:** `947ee0d`
- **Gap:** `src/lib/orchestrator.ts` (`buildOrchestratorState`, `buildAttentionFeed`) + 13 tests are gone. The attention weight formula (`conflicts*100 + lint*5 + comments`) survives **byte-identically inlined** in `WelcomeScreen.tsx:47`, at risk of drift; the typed action vocabulary and cross-process `attentionRows`/`cleanProcesses` split are lost.
- **Impact:** Low functional impact today (dashboard still renders) but no single tested home for routing logic; nothing for the chat router / TriagePanel to share.
- **Effort:** M · **Recommendation:** Redesign — re-establish as the canonical read layer over the JSON `ProcessDoc`, delete the inline `pmAttentionForDoc`. Pairs with R9 (the orchestrator is the natural consumer of the lifted runtime state).

### Theme D — Core PM feature gaps

#### R11 — Delete a process (in-app)
- **Source:** `3b51a56` + `b262fa1` (onDeleted)
- **Gap:** No in-app way to delete a process — orphaned `<slug>.json` + `raw-sources/` must be removed by hand. No Settings surface.
- **Impact:** Biggest user-facing functional hole after ArchitectMiner.
- ✅ **FIXED.** New `DELETE /api/processes/[slug]` (admin-only) removes the wiki JSON, `raw-sources/<slug>/`, the runtime store (`data/runtime/<slug>.json`), and any `.sessions.json` entries for the slug. A per-process **Settings** view (admin-only ⚙ in the top bar) shows process facts + a **Danger Zone** with a slug-typed confirm; on delete it returns to the welcome screen and refreshes. Verified end-to-end against a throwaway process (all artifacts removed; 200/404/403 paths; the confirm button arms only on the exact slug). *(Owner/grantee access summary dropped — no per-process access model; see R16.)*

#### R12 — Per-section summary UIs + Overview editing
- **Source:** `ecc57f1` (2 of its 3 features; the 3rd, country-variations, is R15)
- **Gap:** Eight at-a-glance summary widgets (`MetricsSummary`, `ExceptionsSummary`, `PainPointsSummary`, `ControlsSummary`, `ControlGapsSummary`, `RegulationSummary`, `AuditFindingsSummary`, + the country one) are all gone — sections show raw cards only. `OverviewPanel.tsx` is read-only (facts like trigger/scope/I-O can't be edited in-app).
- **Impact:** Loss of matrix/heatmap/severity roll-ups; Overview not editable.
- **R12a — Overview editing:** ✅ **FIXED.** `OverviewPanel` has an admin/SME Edit mode — a Purpose textarea + inputs for the 7 fact fields (processOwner, trigger, frequency, scopeIn/Out, processInput/Output), saved via `updateElement(slug, processId, { content })`. Editing the overview content **re-opens its approval** (`approved → in-progress`), consistent with elements (added to `updateElement`'s root branch). Verified: save persists content + resets approval; the edit form renders with all fields; Cancel reverts.
- **R12b — section summary UIs:** ✅ **FIXED** (unified, not 8 bespoke). Instead of 8 hand-crafted matrix/heatmap widgets, one **config-driven `SectionSummary`** renders an at-a-glance strip above each section's cards: the item count + a breakdown by the section's key enum field (exceptions→impact, pain-points/audit-findings/control-gaps→severity, controls→controlType, process-gaps→gapStatus, innovation-ideas→strategicFit, market-trends→horizon), with severity-toned chips. Renders nothing for sections that already have a bespoke widget (roles→RACI, process-steps→flow, to-be-design→synthesis) or whose breakdown field is empty. Verified: Controls "5 items · Type · PREVENTIVE 5", Process Gaps "3 items · Status · open 3". *(Note: some migrated `impact` fields hold prose, not the enum, so those sections gracefully show no breakdown — a data-quality matter, not a UI one. Clickable chip→filter is a possible enhancement.)*

### Theme E — Polish & hygiene

#### R13 — Shared helpers dedup (`linkify`, `meta`, summary registry)
- **Source:** `1a42d19`
- **Gap:** `src/lib/linkify.tsx`, `src/lib/meta.ts`, `SectionSummary.tsx`, perspective-rotation hook all missing; `asList`/`str`/`linkify` re-duplicated across 11+ files.
- **Impact:** Maintainability debt; copies drift. No correctness impact.
- ✅ **FIXED (asList/str).** Extracted `asList` (was copy-pasted **identically into 8 files**) and `str` into a shared, dependency-free `src/lib/meta.ts`; repointed all 8 `asList` consumers. Verified the consumers (RaciMatrix, ProcessFlow, ElementCard) still render. *(`linkify`/`SectionSummary`/perspective-rotation are component-specific and left as-is — low-value to share.)*

#### R14 — Small UX polish
- **Source:** `711f6f1` (chat overlay), `b262fa1` (clickable chat refs), `641078f` (runSourcing via handleSend)
- **Gaps:** (a) Chat panel is a grid column that narrows the canvas instead of floating over it (pure CSS). (b) Element-id refs in chat are hoverable but **not** clickable — `goToElement` exists everywhere else, just not wired to `.chat-ref`. (c) `runSourcing` uses a raw `fetch` again so web-sourcing runs bypass the chat transcript/active-skill chip/watchdog (partly mitigated by a separate progress banner).
- **Impact:** Minor each.
- ✅ **(a) + (b) FIXED.** Chat panel now floats over the canvas when expanded (`position:absolute` + the grid keeps the 56px rail column, so opening the chat no longer reflows/narrows the document — verified: canvas width identical open vs closed). Chat element-id refs are clickable → `goToElement` (threaded `onRefClick` through `AgentChat`'s linkify chain; `cursor:pointer`).
- ✅ **(c) FIXED.** `runSourcing` now routes through `handleSend` (the chat pipeline) instead of a raw `fetch` — the web-sourcing run shows in the transcript with the active-skill chip + watchdog, and opens the chat. The section's `sourcing` "running" indicator is kept and cleared by `handleSend`'s `onComplete` (fires on done + error); `handleSend` refreshes the doc on completion.

### Theme F — Product decisions (not technical givens)

#### R15 — Country-variations element type — **product decision: YES**
- **Source:** `ecc57f1` (3rd feature)
- **Decision:** Add it. ✅ **DONE.** New `country-variation` element type (idPrefix `CV`; field `country`; `affects → process-step`; template **What differs / Why it differs / Impact**) added to **both** schema files (custom + AJV — drift-guard parity holds), plus a **Country Variations** section in the As-Is area. Verified: the section shows in the As-Is nav with an Add-entry CTA; the generic ElementCard + a per-country `SectionSummary` breakdown render it. SMEs document jurisdictional differences as first-class elements.

#### R16 — Per-process access control — **product decision: YES**
- **Source:** `db525cf` (part 2), `1772a5c` (grant-access UI), `3b51a56` (Settings access summary)
- **Decision:** Add it. ✅ **DONE.** New `src/lib/process-access.ts` store (`data/process-access.json`, gitignored — authz config, never in the wiki). A process is **ungoverned** (visible to all) until an admin gives it an **owner**; then only the owner, granted users, and admins see it. **Enforced server-side** in `page.tsx` (`canAccess` filters the process list before it reaches the browser); `AuthGate` does `router.refresh()` on login/logout so the list re-filters. Endpoints: `GET/POST /api/processes/[slug]/access` (set-owner/ungovern = admin; grant/revoke = owner-or-admin) + `GET /api/users/roster`. UI: an **Access** section in the Settings panel (restrict / share / revoke / make-open). Delete cleans the access record. Verified: `canAccess` correct across owner/granted/other/admin × governed/ungoverned; the full restrict→share→open round-trip works in the app. *(`7a84443`, the old admin-visibility fix, stays OBSOLETE — `page.tsx` reads the disk fresh each request.)*

### Theme G — Verify-then-decide (low-priority loose ends)

#### R17 — Broken-relation visibility
- **Source:** `80f764a` (only sub-feature without a confirmed successor)
- **Gap:** The old context CLI flagged dangling relation targets as "(target not found in this process)". Unclear whether the Document Map or `lint.ts` surfaces unresolved relation targets.
- **Effort:** S · **Recommendation:** Verify; add a small lint check if missing.

#### R18 — ProcessView join layer (RACI pivot + flow lanes)
- **Source:** `318d817`
- **Gap:** `process-view.ts` (+22 tests) gone; `relations.ts` absorbed the relation-index slice, but RACI-pivot and flow-lane joins are re-inlined in components, and `contextFor` is gone (had no consumer anyway).
- **Effort:** M full / S for RACI+flow only · **Recommendation:** Verify-then-decide — only worth it if R10 wants a `view` input. In-component joins work today.

#### R19 — Slim per-type schema slices (token optimization)
- **Source:** `4c6d1e1` (only piece of the get_context cluster without a full successor)
- **Gap:** Several skills still instruct the LLM to read the full ~2,800-line `schema/process-schema.json` (comment-review, add-entry, area-summary, document-ingest, council-review). The old `.derived/<type>.llm.json` slices (~50–80 lines) are gone.
- **Effort:** M · **Recommendation:** Verify-then-decide — measure runtime token cost; only build a TS per-type emitter if it's actually painful (schema is already enforced at the MCP tool boundary, so the model may not need the full body).

### Theme H — Docs & standalone artifacts (separate track, no app impact)

#### R20 — Onepager pitch deck + PDF
- **Source:** `b858dff` (supersedes `44f8ffa`)
- **Gap:** The finished 4-slide product deck + print-ready PDF + `pm-pdf.mjs` are gone. Standalone `public/` artifacts, never imported by app code.
- **Effort:** S restore-as-is / M regenerate · **Recommendation:** Verify-then-decide — narrative still holds but slide 4 screenshots + v0.x framing predate the rewrite. Fully recoverable from the tag.

#### R21 — Phase-2 product roadmap + AI-governance docs
- **Source:** `1e347a6`
- **Gap:** `ROADMAP.md`, `AI-GOVERNANCE-ROADMAP.md`, `AI-GOVERNANCE-CHANGESET.md` — no new doc covers these, and governance is a live concern (referenced in project memory).
- **Effort:** S recover · **Recommendation:** Recover roadmap + governance-roadmap for reference; treat the changeset (targets old codebase) as Update-or-Skip.

#### R22 — pm-shot screenshot helpers
- **Source:** `7899697` (+ `pm-shot-competitor.mjs` from `b858dff`)
- **Gap:** CDP/cookie screenshot harness gone. Selectors target the old UI.
- **Effort:** S restore / M re-point · **Recommendation:** Only if R20 is accepted.

---

## 3. Proposed phasing (my recommendation — re-prioritize freely)

| Phase | Theme | Requirements | Rationale |
|---|---|---|---|
| **Phase 1 — Integrity & guardrail** | B, C | R6 (security), R7+R8 (typed relations), R9 (guardrail doc + lift state) | Fix the impersonation hole and the architectural violation *before* building on the model. Small–medium, high leverage. |
| **Phase 2 — Make ArchitectMiner work** | A | R1 → R2 (unblockers), then R3, R4 | The biggest functional hole. R1+R2 are prerequisites for everything else in the module. |
| **Phase 3 — Core PM features** | D | R11 (delete), R12 (summaries + Overview edit) | High-value user-facing gaps, independent of storage. |
| **Phase 4 — Attribution & polish** | A, E | R5 (attribution + feed), R10 (orchestrator), R13 (dedup), R14 (polish) | R5 pairs with R6; R10 pairs with R9. |
| **Backlog — decisions & loose ends** | F, G | R15, R16, R17, R18, R19 | Need your product call or a measurement first. |
| **Docs track (parallel/anytime)** | H | R20, R21, R22 | No app impact; do whenever. |

**Suggested cross-read order:** start with Phase 1 (are the security + guardrail items P0 for you?), then decide whether ArchitectMiner (Phase 2) is a near-term priority or can wait, then triage the product-decision items (R15, R16) since they gate other work.

---

## 4. Explicitly excluded (no action — recorded so nothing is silently dropped)

**OBSOLETE — superseded by the JSON-native architecture:**
- `80f764a, 9641985, 255ba7b, 30131bf, 85c256e, 927d764, 80726a0` — the entire `get_context.py` skill-context cluster. Replaced by Progressive Disclosure (Document Map + `expandElement`). *(One loose end split out as R17/R19.)*
- `7a84443` — admin process-visibility fix; the access subsystem it patched was deleted. `listProcesses()` now reads all JSON off disk ungated.
- `cbac4d2` — test for `derive_process_meta.py` (deleted Python script).
- `8df5961` — mock sepa-payments seed (depended on deleted Python toolkit + dropped process).
- `d3eedb8` — architecture-comparison HTML; superseded by `TARGET-ARCHITECTURE.md`.
- `28d27b1` + `f49e7d1` — BMAD install/remove (net-zero, deliberately abandoned).
- `953f817` — docs cleanup (deletion only).
- `44f8ffa` — original onepager (superseded by `b858dff` = R20).

**Already PRESENT / reimplemented natively:**
- New-process splash flow (`draftingNewProcess`/`WelcomeScreen`/`onReturnToSplash`) — part of `b262fa1`, already on baseline.
- Admin user CRUD + password reset (`AdminScreen` + `/api/admin/users`) — part of `db525cf`, present.
- Provenance as structured `meta.provenance` — the goal of `bbcf8f0`'s provenance half, achieved natively (better than the old form).

**Cleanup chores folded into other requirements:** `ab4e351`, `ddbea02` → fold into R3/R4. `53c8ead` → skip (doc edit on a dropped plan file).

---

## 5. Appendix — Related architectural findings (NOT from the superseded commits)

Surfaced during the earlier baseline review; captured here because they sit alongside Theme B/C. Not part of the 41-commit triage — flagged for your awareness.

- **A1 — Approval gate is dead code (regression in the rewrite itself).** ✅ **FIXED.** The legacy `set_approval.py` blocked `approved` while any heading was still `proposed`/`web`; on the baseline `UNCONFIRMED_SOURCES` was defined but referenced nowhere, so any AI-proposed content could be approved. Now `updateElement`/`setApproval` (`src/lib/wiki-write.ts`) call `unconfirmedHeadings()` (`conformance.ts`) and refuse to set `approved` while any heading is `proposed`/`web`, naming the blocking headings; covered by `conformance.test.ts`. *(This was the live half of the same hallucination-countermeasure contract that R9 protects.)*
- **A2 — Only `cob-003` migrated.** Every other process (funds-release, sepa-payment-processing, periodic-review, bank-guarantee-issuance, etc.) had its Markdown deleted with no JSON replacement. If that content matters, a migration backfill is its own work item. *(Affects R4 cross-process views, which will look empty until backfilled.)*
- **A3 — Metadata writes were coupled to content conformance.** ✅ **FIXED.** `updateElement` ran the full content-conformance check on *every* write, so a metadata-only state change (approve / **reject** / relevance / status) was blocked whenever the element's existing content wasn't fully conformant — leaving the approval/relevance controls dead on the many non-conformant migrated elements, and contradicting the warn-and-allow model (`SKILLS.md §10`). Now the conformance hard-block runs only when the patch actually changes content; metadata-only writes proceed, while the A1 approval gate still hard-blocks approving unconfirmed content. Covered by `wiki-write.test.ts`.
- **A4 — `applyLint` element re-open checked the wrong field.** ✅ **FIXED.** The Claude MCP `applyLint` re-opened implicated elements with `el.meta.status === "approved"` → `el.meta.status = "in-progress"`, but approval lives in `el.meta.approval` (status is `draft`/`confirmed`/`empty`), so the re-open **never fired** — a lint finding could implicate an approved element without re-opening it. Now mirrors the Gemini path: checks `meta.approval === "approved"`, sets `in-progress` + `approvalBy: "run-lint"` + date. *(Found while building R9.)*
