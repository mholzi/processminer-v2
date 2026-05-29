# AI Governance — Engineering Changeset

**Companion to** [AI-GOVERNANCE-ROADMAP.md](AI-GOVERNANCE-ROADMAP.md).
That doc is the **Committee view** — articles, sign-offs, control
functions, deadlines. This doc is the **engineering view** — what
literally changes in this repository to satisfy those obligations.

Of the 49 items in AI-GOVERNANCE-ROADMAP.md, **26 require code or UI
changes**; the remaining 23 are documentation, contractual, sign-off,
or process workstreams that need to land in parallel but produce no
`git diff`. This doc covers the 26.

The 23 non-code items are summarised in the [Out-of-scope](#out-of-scope-for-this-doc)
section at the bottom — they still belong on the programme plan, they
just don't ship through engineering.

---

## TL;DR — five architectural moves

Everything below collapses into five structural changes:

1. **New top-level `governance/` directory** outside `wiki/`, holding
   audit log, lineage, test sets, GPAI evidence, model version pin,
   incident/BCP runbooks, retention policy, model card. Respects the
   "Karpathy wiki is sacred" rule by keeping governance state out of
   `wiki/`.
2. **API-call wrapper** around every Anthropic invocation, enforcing
   audit logging + kill-switch + model-version-pin + region check
   before the call proceeds.
3. **Schema + writer additions** that require every element to carry
   `modelVersion` / `skillVersion` / `promptHash` / `schemaVersion`,
   and force a contradiction check before approval.
4. **Raw-source intake gate** that requires PII classification at
   upload and stamps `meta.json` alongside the file.
5. **UI surface additions** — AI disclosure badges, grounding-score
   chips, right-to-explanation view, governance dashboard, kill-switch
   banner, PII classification input.

These are then accompanied by **7 new Python scripts** and **4 new CI
gates**.

---

## A. New file-system boundaries

### A.1 — `governance/` directory at repo root *(new)*

Single home for everything the AI Governance Committee, MRM, Internal
Audit, and the regulator need to read. **None of this lives inside
`wiki/`** — that boundary is enforced by `scripts/check_skill_blocks.py`
plus a new path-guard in CI.

```
governance/
├── model-version.json             # Pinned Claude version (Phase 7 #2)
├── model-card-processminer.md     # MRM doc pack (Phase 2 #7)
├── human-oversight.md             # Art. 14 documentation (Phase 1 #7)
├── incident-runbook.md            # AI-incident playbook (Phase 4 #4)
├── retention-policy.md            # Per-element retention (Phase 5 #4)
├── classification-memo.md         # AIA risk tier (Phase 1 #1)
├── audit-log/                     # Append-only API call log (Phase 4 #1)
│   ├── 2026-05-28.jsonl
│   └── ...
├── lineage/                       # Per-session lineage records (Phase 5 #5)
│   └── <run-id>.json
├── gpai-evidence/                 # Anthropic model + system cards (Phase 1 #4)
│   ├── claude-opus-4-7.model-card.pdf
│   └── ...
├── test-sets/                     # Hallucination + bias test sets (Phase 6 #1, #2)
│   └── <skill>/
│       ├── inputs/
│       └── expected/
├── sla.json                       # Per-skill output quality SLAs (Phase 4 #5)
└── vendor-sla/                    # Anthropic availability log (Phase 4 #7)
    └── <YYYY-MM>.jsonl
```

**CI guard:** `scripts/check_governance_boundary.py` — refuses any PR
that places governance artefacts under `wiki/` or any element-writer
output under `governance/`.

---

## B. Backend changes (TypeScript)

### B.1 — Audit-log wrapper around every Anthropic call
**Closes:** Phase 4 #1 (Blocker) · Phase 1 #6 (if high-risk) · Phase 5 #5 input

| Action | File |
|---|---|
| **New** | `src/lib/audit-log.ts` — append-only JSONL writer; one record per Anthropic call |
| **New** | `src/lib/anthropic-wrapper.ts` — thin wrapper over `@anthropic-ai/sdk` enforcing audit + kill-switch + region + version checks |
| **Modify** | `src/lib/session-worker.ts` — replace direct SDK use with `anthropic-wrapper` |
| **New** | `governance/audit-log/<YYYY-MM-DD>.jsonl` — daily-rotated sink |
| **New** | `scripts/audit/audit_log_schema.json` — record shape |

**Record shape:**
```json
{
  "ts": "2026-05-28T22:34:00Z",
  "user": "markus.holzhauser",
  "processSlug": "bank-guarantee-issuance",
  "skill": "process-specialist",
  "skillVersion": "sha256:...",
  "model": "claude-opus-4-7",
  "modelVersion": "20260301",
  "promptHash": "sha256:...",
  "inputHash": "sha256:...",
  "outputHash": "sha256:...",
  "approvalOutcome": null,
  "apiRegion": "eu-central-1",
  "tokensIn": 12450,
  "tokensOut": 3200,
  "durationMs": 18432
}
```

### B.2 — Kill switch feature flag
**Closes:** Phase 4 #6 (High)

| Action | File |
|---|---|
| **New** | `src/lib/feature-flag.ts` — reads `PROCESSMINER_DISABLED` env + optional `governance/disabled.flag` file |
| **Modify** | `src/app/api/session/route.ts` — return 503 with explanation when disabled |
| **Modify** | `src/lib/anthropic-wrapper.ts` — refuse to call upstream when disabled |
| **New** | `src/components/SystemDisabledBanner.tsx` — bank-wide banner shown to users |
| **Modify** | `src/app/layout.tsx` — render the banner when flag is set |

### B.3 — Anthropic region + version pin check
**Closes:** Phase 5 #2 (Blocker) · Phase 7 #2 (High)

| Action | File |
|---|---|
| **New** | `governance/model-version.json` — `{ "pinned": "claude-opus-4-7", "region": "eu-central-1" }` |
| **Modify** | `src/lib/anthropic-wrapper.ts` — refuse call if API endpoint region or model version drifts from pin |
| **New** | `scripts/wiki/check_model_version_pin.py` — CI check that the runtime endpoint config matches the pin |

### B.4 — Drift / quality signals pipeline
**Closes:** Phase 4 #3 (High) · Phase 2 #6 input (High)

| Action | File |
|---|---|
| **New** | `src/lib/quality-metrics.ts` — computes schema-conformance rate, citation-coverage rate, approval-gate edit rate, lint-failure rate, conflict-resolution invocation rate |
| **New** | `src/app/api/governance/metrics/route.ts` — JSON endpoint returning rolling 30-day signals |
| **Source data** | `governance/audit-log/*.jsonl` + existing `provenance.json` + existing `lint.json` |

### B.5 — Retention pipeline
**Closes:** Phase 5 #4 (High)

| Action | File |
|---|---|
| **New** | `scripts/wiki/apply_retention.py` — reads `governance/retention-policy.md`'s structured rules; moves expired elements to `governance/disposed/` |
| **New** | Cron job entry (host-OS / k8s) — daily execution |
| **Modify** | Schema — add optional `legalHold: boolean` to all element types; retention skips when set |

### B.6 — Vendor SLA monitor
**Closes:** Phase 4 #7 (Medium)

| Action | File |
|---|---|
| **New** | `scripts/audit/probe_anthropic.py` — periodic health check; logs to `governance/vendor-sla/<YYYY-MM>.jsonl` |
| **Source for dashboard** | feeds Phase B.4 + UI U.5 |

### B.7 — Champion / challenger harness
**Closes:** Phase 7 #5 (Medium)

| Action | File |
|---|---|
| **New** | `src/lib/llm-router.ts` — abstraction over Anthropic / Mistral / EU-hosted alternative |
| **Refactor** | `anthropic-wrapper.ts` → `llm-wrapper.ts`, accepting a provider injection |
| **New** | `scripts/audit/run_champion_challenger.py` — runs identical prompts against both providers and diffs outputs |

---

## C. Schema + writer changes (Python + JSON)

### C.1 — Element governance frontmatter
**Closes:** Phase 7 #6 (High) · enables Phase 2 #6 + Phase 5 #5

| Action | File |
|---|---|
| **Modify** | `schema/process-schema.json` — add to every element type's frontmatter contract: |

```yaml
modelVersion: claude-opus-4-7@20260301        # which Claude generated this
skillVersion: sha256:abc...                    # SHA of the skill's SKILL.md
promptHash: sha256:def...                      # SHA of the rendered prompt
schemaVersion: 0.4.0                           # schema version at write time
generatedAt: 2026-05-28T22:34:00Z              # set once on first author
disclosureLabel: AI-generated                  # transparency surface (Art. 50)
```

| **Modify** | `scripts/wiki/write_element.py` — refuse to write without these |
| **Modify** | `scripts/wiki/patch_element.py` — preserve / update on patch |
| **Modify** | `scripts/check_conformance.py` — ERROR if any are missing |
| **Modify** | `src/lib/conformance.ts` — same check on the TS side (parity test enforces) |
| **Regenerate** | `schema/.derived/*.llm.json` — bump on every relevant type |

### C.2 — PII classification on raw-sources
**Closes:** Phase 5 #1 (Blocker)

| Action | File |
|---|---|
| **New** | `raw-sources/<slug>/<file>.meta.json` schema — `{ "piiClass": "none"\|"internal"\|"customer"\|"special" }` |
| **Modify** | `src/app/api/upload/route.ts` — reject upload if `piiClass` is missing or invalid |
| **Modify** | Upload modal (see U.3) — required select field |
| **New** | `scripts/wiki/check_pii_classification.py` — fails CI if any raw-source lacks `meta.json` |

### C.3 — Lineage sidecar (outside wiki tree)
**Closes:** Phase 5 #5 (High) · Phase 5 #6 input

| Action | File |
|---|---|
| **New** | `governance/lineage/<run-id>.json` per session — full reproducibility record |
| **New** | `scripts/wiki/build_lineage.py` — assembles lineage from `provenance.json` + run manifest + audit log |
| **Modify** | `src/lib/session-worker.ts` — emit lineage record at session close |
| **New** | `src/lib/lineage.ts` — read-side helper for UI U.4 |

**Lineage record shape:**
```json
{
  "runId": "2026-05-28-2234",
  "user": "markus.holzhauser",
  "process": "bank-guarantee-issuance",
  "skill": "process-specialist",
  "skillVersion": "sha256:...",
  "model": "claude-opus-4-7@20260301",
  "promptHash": "sha256:...",
  "sourceDocIds": ["doc-1", "doc-2"],
  "elementsWritten": [
    { "id": "PS-BGID-001", "headings": ["Inputs", "Outputs"], "auditLogRef": "2026-05-28T22:34:00Z" }
  ],
  "approvals": [
    { "id": "PS-BGID-001", "approver": "markus", "ts": "..." }
  ]
}
```

### C.4 — Contradiction check before approval
**Closes:** Phase 6 #7 (Medium)

| Action | File |
|---|---|
| **Modify** | `scripts/check_conformance.py` — add contradiction rules: role assignment conflict, control-owner contradiction, SLA conflict |
| **Modify** | `src/lib/conformance.ts` — parity |
| **Modify** | `scripts/wiki/set_approval.py` — hard-fail if a contradiction is detected; require explicit `--override <reason>` |

### C.5 — Source-grounding score
**Closes:** Phase 6 #6 (High)

| Action | File |
|---|---|
| **New** | `scripts/wiki/score_grounding.py` — per-element score: % of derived/source headings with cited quote that survives deterministic match against raw-source |
| **New** | `wiki/processes/<slug>/grounding.json` sidecar — **stays inside the wiki tree** because it's derived from wiki content and re-buildable; this is the existing precedent (`lint.json`, `raci.json`) |
| **Modify** | `src/components/ElementCard.tsx` — surface chip (see U.2) |

---

## D. UI changes (React / Next.js)

### D.1 — AI disclosure across surfaces
**Closes:** Phase 1 #3 (High)

| Action | File |
|---|---|
| **New** | `src/components/AiDisclosureBadge.tsx` — "AI-generated · reviewed by [SME]" |
| **Modify** | `src/components/ElementCard.tsx` — render badge in header; pull approver from frontmatter |
| **Modify** | `src/components/AgentChat.tsx` — persistent banner above transcript: "You're talking to an AI assistant" |
| **Modify** | `src/app/print/[slug]/page.tsx` — disclosure header on PDF export |
| **Modify** | `scripts/wiki/publish_confluence.py` (when built — see Feature ROADMAP P6 #1) — disclosure in page header |
| **Modify** | `scripts/wiki/export_sparx.py` (when built — see Feature ROADMAP P1 #3) — disclosure in XML attribute |

### D.2 — Source-grounding chip on ElementCard
**Closes:** Phase 6 #6 (High)

| Action | File |
|---|---|
| **Modify** | `src/components/ElementCard.tsx` — read from `grounding.json`; surface coloured chip (green ≥ 90%, amber 70–89%, red < 70%) |
| **Modify** | `src/lib/process-view.ts` — expose `groundingFor(id)` |

### D.3 — PII classification at upload
**Closes:** Phase 5 #1 (Blocker)

| Action | File |
|---|---|
| **Modify** | `src/components/UploadModal.tsx` (currently inline in `WelcomeScreen.tsx`) — required `<select>`: None / Internal / Customer PII / Special Category |
| **Modify** | `src/app/api/upload/route.ts` — write `meta.json` alongside the file |

### D.4 — Right-to-explanation view
**Closes:** Phase 5 #6 (High)

| Action | File |
|---|---|
| **New** | `src/app/explain/[slug]/[id]/page.tsx` — per-element explanation: source docs → headings → SME approval → AI proposal → human change |
| **New** | `src/components/ExplanationChain.tsx` — visual timeline |
| **Source** | `governance/lineage/*.json` + `provenance.json` + run manifest |
| **Access** | Restricted to authorised users — new role check in middleware |

### D.5 — Governance dashboard
**Closes:** Phase 2 #6 (High) · Phase 4 #2 / #3 / #7 surface

| Action | File |
|---|---|
| **New** | `src/app/governance/page.tsx` — single-page dashboard |
| **New** | `src/components/governance/MetricCards.tsx` — schema conformance rate, citation coverage, edit rate, hallucination samples, lint trend |
| **New** | `src/components/governance/DriftChart.tsx` — 30-day trend |
| **New** | `src/components/governance/VendorSLATile.tsx` — Anthropic availability |
| **Source** | `B.4 quality-metrics.ts` + `audit-log` + `vendor-sla/*.jsonl` |
| **Access** | Restricted to AI Governance / MRM / IA roles |

### D.6 — Kill-switch banner (already listed as B.2)
Cross-reference. The component is `SystemDisabledBanner.tsx`.

### D.7 — Lineage drawer on ElementCard
**Closes:** Phase 5 #5 surface (High)

| Action | File |
|---|---|
| **Modify** | `src/components/ElementCard.tsx` — existing provenance drawer gets a "Lineage" tab |
| **New** | `src/components/LineageDrawer.tsx` — reads `governance/lineage/*` via `src/lib/lineage.ts` |

---

## E. CI gates (4)

### E.1 — Governance frontmatter required
**Closes:** Phase 7 #6 (High) enforcement

```yaml
# .github/workflows/ci.yml (existing) — add step
- name: Governance frontmatter check
  run: python3 scripts/check_conformance.py --strict-governance
```
Fails: any element missing `modelVersion` / `skillVersion` / `promptHash` / `schemaVersion`.

### E.2 — CAB ticket required on skill / schema changes
**Closes:** Phase 7 #1 (High)

```yaml
# .github/workflows/cab-gate.yml (new)
on:
  pull_request:
    paths:
      - '.claude/skills/**'
      - 'schema/**'
      - 'governance/model-version.json'
jobs:
  cab-check:
    runs-on: ubuntu-latest
    steps:
      - name: Require CAB-NNNN reference
        run: |
          if ! gh pr view --json body -q .body | grep -qE 'CAB-[0-9]+'; then
            echo "::error::PRs touching skills/schema require a CAB-NNNN reference"
            exit 1
          fi
```

### E.3 — Model version pin check
**Closes:** Phase 7 #2 (High)

```yaml
- name: Pinned model version check
  run: python3 scripts/wiki/check_model_version_pin.py
```
Fails: runtime endpoint config doesn't match `governance/model-version.json`.

### E.4 — PII classification + governance boundary
**Closes:** Phase 5 #1 enforcement + governance/ vs wiki/ boundary

```yaml
- name: PII classification check
  run: python3 scripts/wiki/check_pii_classification.py
- name: Governance boundary
  run: python3 scripts/check_governance_boundary.py
```

---

## F. New Python scripts (7)

| # | Script | Closes | Purpose |
|---|---|---|---|
| F.1 | `scripts/wiki/score_grounding.py` | P6 #6 | Per-element grounding score |
| F.2 | `scripts/wiki/build_lineage.py` | P5 #5 | Assemble lineage sidecar |
| F.3 | `scripts/wiki/check_pii_classification.py` | P5 #1 CI | Conformance check on raw-source meta |
| F.4 | `scripts/wiki/check_model_version_pin.py` | P7 #2 CI | Verify runtime ↔ pin alignment |
| F.5 | `scripts/wiki/apply_retention.py` | P5 #4 | Retention enforcement pipeline |
| F.6 | `scripts/audit/probe_anthropic.py` | P4 #7 | Vendor SLA probe (cron) |
| F.7 | `scripts/audit/run_skill_test_set.py` | P6 #1 + #2 | Periodic hallucination + bias eval |
| F.8 | `scripts/audit/run_champion_challenger.py` | P7 #5 | Side-by-side LLM eval |
| F.9 | `scripts/check_governance_boundary.py` | path guard | Refuses governance/ vs wiki/ leakage |

---

## G. File inventory — flat list

A complete index of files touched by this changeset.

### New files (24)
```
governance/                                          # directory (A.1)
governance/model-version.json                        # B.3
governance/model-card-processminer.md                # P2 #7
governance/human-oversight.md                        # P1 #7
governance/incident-runbook.md                       # P4 #4
governance/retention-policy.md                       # P5 #4
governance/classification-memo.md                    # P1 #1
governance/sla.json                                  # P4 #5
governance/disabled.flag                             # B.2 (created at runtime)
src/lib/audit-log.ts                                 # B.1
src/lib/anthropic-wrapper.ts                         # B.1 + B.3
src/lib/feature-flag.ts                              # B.2
src/lib/quality-metrics.ts                           # B.4
src/lib/lineage.ts                                   # C.3 read-side
src/lib/llm-router.ts                                # B.7
src/components/AiDisclosureBadge.tsx                 # D.1
src/components/SystemDisabledBanner.tsx              # B.2 / D.6
src/components/ExplanationChain.tsx                  # D.4
src/components/LineageDrawer.tsx                     # D.7
src/components/governance/MetricCards.tsx            # D.5
src/components/governance/DriftChart.tsx             # D.5
src/components/governance/VendorSLATile.tsx          # D.5
src/app/api/governance/metrics/route.ts              # B.4
src/app/explain/[slug]/[id]/page.tsx                 # D.4
src/app/governance/page.tsx                          # D.5
scripts/wiki/score_grounding.py                      # F.1
scripts/wiki/build_lineage.py                        # F.2
scripts/wiki/check_pii_classification.py             # F.3
scripts/wiki/check_model_version_pin.py              # F.4
scripts/wiki/apply_retention.py                      # F.5
scripts/audit/probe_anthropic.py                     # F.6
scripts/audit/run_skill_test_set.py                  # F.7
scripts/audit/run_champion_challenger.py             # F.8
scripts/audit/audit_log_schema.json                  # B.1
scripts/check_governance_boundary.py                 # F.9
.github/workflows/cab-gate.yml                       # E.2
```

### Modified files (12)
```
schema/process-schema.json                           # C.1 — governance frontmatter on every type
schema/.derived/*.llm.json                           # C.1 — regenerated
scripts/wiki/write_element.py                        # C.1 — refuse without governance frontmatter
scripts/wiki/patch_element.py                        # C.1 — preserve/update
scripts/wiki/set_approval.py                         # C.4 — contradiction hard-fail
scripts/check_conformance.py                         # C.1 + C.4
src/lib/conformance.ts                               # C.1 + C.4 (parity)
src/lib/session-worker.ts                            # B.1 — use anthropic-wrapper; emit lineage
src/lib/process-view.ts                              # D.2 — expose groundingFor
src/components/ElementCard.tsx                       # D.1 + D.2 + D.7
src/components/AgentChat.tsx                         # D.1 — banner
src/components/WelcomeScreen.tsx                     # D.3 — PII classification on upload modal
src/app/layout.tsx                                   # B.2 — render kill-switch banner
src/app/api/session/route.ts                         # B.2 — kill-switch 503
src/app/api/upload/route.ts                          # C.2 — write meta.json
src/app/print/[slug]/page.tsx                        # D.1 — disclosure header
.github/workflows/ci.yml                             # E.1 + E.3 + E.4
```

---

## H. Effort estimate

Engineering-only effort across the 26 items. Documentation /
sign-off / contract workstreams (the other 23 items in
AI-GOVERNANCE-ROADMAP.md) run in parallel and are not in this number.

| Slice | Items | Eng effort |
|---|---|---|
| **Architectural + Blocker backend** | A.1 governance/ dir · B.1 audit log · B.2 kill switch · B.3 region/version pin · C.2 PII intake · C.3 lineage · C.1 governance frontmatter | **~6 weeks** |
| **Blocker UI** | D.1 disclosure (partial) · D.3 PII upload | **~1 week** |
| **High-tier monitoring + dashboard** | B.4 quality metrics · D.5 dashboard · B.6 vendor SLA · D.7 lineage drawer | **~3 weeks** |
| **High-tier quality controls** | C.4 contradiction · C.5 grounding · D.2 grounding chip · F.1 + F.2 scripts | **~2 weeks** |
| **High-tier UX** | D.4 explanation view · D.1 remaining surfaces | **~1.5 weeks** |
| **CI gates** | E.1 / E.2 / E.3 / E.4 | **~3 days** |
| **Medium / Low** | B.5 retention · B.7 champion-challenger · F.7 / F.8 scripts | **~1.5 weeks** |
| **Total** | 26 items | **~14 weeks of focused dev** |

Calendar: with **two engineers in parallel, ≈8 calendar weeks**. With
one engineer, ≈14.

---

## I. Governance item ↔ engineering change — mapping table

Reading direction: governance roadmap → engineering items.

| Governance item | Severity | Engineering ID(s) |
|---|---|---|
| **P1 #3** Article 50 transparency | High | D.1 |
| **P1 #4** GPAI deployer evidence | High | A.1 (`gpai-evidence/` folder) |
| **P1 #6** Article 12 logging *(if high-risk)* | Blocker | B.1 |
| **P1 #7** Article 14 oversight *(if high-risk)* | Blocker | A.1 (`human-oversight.md` — existing `set_approval.py` IS the mechanism) |
| **P1 #8** Article 15 robustness pack *(if high-risk)* | Blocker | F.7 produces evidence; collated in `model-card` |
| **P2 #6** Performance monitoring | High | B.4 + D.5 |
| **P2 #7** Model documentation pack | High | A.1 (`model-card-processminer.md`) |
| **P4 #1** Central audit log | Blocker | B.1 |
| **P4 #2** Sample-based monitoring | High | F.7 + D.5 |
| **P4 #3** Drift detection | High | B.4 |
| **P4 #5** SLA thresholds | High | A.1 (`sla.json`) + B.4 (enforcement) |
| **P4 #6** Kill switch | High | B.2 |
| **P4 #7** Vendor SLA monitoring | Medium | B.6 |
| **P5 #1** PII classification | Blocker | C.2 + D.3 + F.3 |
| **P5 #2** EU residency check | Blocker | B.3 |
| **P5 #4** Retention pipeline | High | B.5 + F.5 |
| **P5 #5** Lineage | High | C.3 + D.7 |
| **P5 #6** Right-to-explanation | High | D.4 |
| **P6 #1** Hallucination eval | High | F.7 + `governance/test-sets/` |
| **P6 #2** Bias testing | Medium | F.7 + `governance/test-sets/` |
| **P6 #3** Prompt injection defences | High | F.7 + ad-hoc detection signals in B.1 |
| **P6 #6** Source-grounding score | High | C.5 + D.2 + F.1 |
| **P6 #7** Contradiction detection | Medium | C.4 |
| **P7 #1** CAB approval | High | E.2 |
| **P7 #2** Model version pinning | High | B.3 + E.3 + F.4 |
| **P7 #5** Champion / challenger | Medium | B.7 + F.8 |
| **P7 #6** Version registry | High | C.1 + E.1 |

---

## J. Out-of-scope for this doc

These 23 governance items are **non-code** workstreams. They show up in
AI-GOVERNANCE-ROADMAP.md and need to land in parallel, but produce no
PR. Listed here so the engineering team knows what's on the parallel
track:

**Documentation artefacts** (5)
- P1 #1 Classification memo · P1 #5 Risk Management System document ·
  P2 #3 Validation report · P4 #4 Incident runbook (the runbook itself
  — the wiring is B.1+B.2) · P7 #3 Vendor BCP plan.

**Control function sign-offs** (7)
- P3 #1 Compliance · P3 #2 Operational Risk · P3 #3 Legal · P3 #4
  InfoSec (process — but findings could spawn engineering work) ·
  P3 #5 DPO/DPIA · P3 #6 Internal Audit · P3 #7 Supervisor
  notification.

**Decisions / programme items** (4)
- P1 #2 AI literacy programme (LMS course) · P2 #1 Model inventory
  entry (form filling) · P2 #2 Tier classification (decision) ·
  P2 #4 MRO/CRO sign-off (decision).

**Contractual** (1)
- P5 #3 Anthropic zero-retention + EU residency contract — Legal owns;
  blocks B.3.

**Procedural / scheduled** (4)
- P2 #5 Annual revalidation cadence · P6 #5 Annual red-team · P7 #4
  Decommissioning procedure · P7 #7 Sunset criteria.

**Cross-references** (2)
- P1 #1 (classification gates which P1 conditional items apply) ·
  P5 #7 DPIA (consolidates P5 #1–#6 in a single artefact for DPO).

---

## K. Implementation order — suggested

Sequenced so that each step unblocks the next without rework. **Blockers
first** (everything is blocked on B.3 contract, but engineering can
build to a stub contract).

### Sprint 1–2 (Architectural backbone — Blocker)
1. A.1 `governance/` directory + boundary CI (F.9)
2. C.1 schema governance frontmatter + writer enforcement + parity (E.1)
3. B.1 audit log wrapper
4. B.2 kill switch
5. C.2 + D.3 + F.3 PII at intake

### Sprint 3–4 (Blocker close-out + High disclosures)
6. B.3 region + version pin + E.3
7. D.1 AI disclosure across surfaces
8. C.3 lineage + F.2

### Sprint 5–6 (High monitoring + dashboard)
9. B.4 quality metrics
10. D.5 governance dashboard
11. B.5 + F.5 retention
12. B.6 vendor SLA

### Sprint 7 (High quality controls)
13. C.5 + F.1 + D.2 grounding
14. C.4 contradiction
15. D.4 + D.7 explanation + lineage drawer

### Sprint 8 (CI + Medium / Low)
16. E.2 + E.4 remaining gates
17. B.7 + F.8 champion-challenger
18. F.7 skill test set runner

After Sprint 8 the 26 engineering items are complete. The non-code
items in section J continue on the Committee track.

---

## L. Cross-references

- [AI-GOVERNANCE-ROADMAP.md](AI-GOVERNANCE-ROADMAP.md) — Committee view
  of all 49 items
- [ORCHESTRATOR-PLAN.md](ORCHESTRATOR-PLAN.md) — "Karpathy wiki is
  sacred" — the rule that puts everything in `governance/` instead of
  `wiki/`
- [HALLUCINATION-PLAN.md](HALLUCINATION-PLAN.md) — per-heading
  provenance contract; C.5 grounding score operationalises it
- [SKILLS.md](SKILLS.md) — skill architecture; C.1 stamping happens at
  skill execution time
- [schema/process-schema.json](schema/process-schema.json) — where C.1
  governance frontmatter lands
- [ROADMAP.md](ROADMAP.md) — feature roadmap; the Confluence/Sparx
  export items there share D.1 disclosure wiring

---

*Last updated 2026-05-28.*
