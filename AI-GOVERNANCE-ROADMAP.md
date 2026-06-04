# AI Governance Roadmap

**Version:** 2026-05-28 · **Scope:** Bank AI Governance + EU AI Act
compliance for Processminer · **Status:** Gap analysis + remediation
backlog · **Audience:** AI Governance Committee, Model Risk Management
(2LoD), Compliance, Operational Risk, Legal, InfoSec, DPO, Internal
Audit.

---

## Executive summary

Processminer is an LLM-powered banking-process documentation engine
(Claude API + skill orchestration → file-backed wiki). The outputs flow
into bank-internal artifacts and, indirectly via Sparx/Confluence/EPM
aggregation, into regulator-facing material. Under the bank's AI
Governance framework and the EU AI Act, this footprint requires
**formal registration, independent validation, control-function
sign-off, and ongoing monitoring** — none of which the system has
today.

What the tool **does** have:
- Per-heading **provenance contract** ([HALLUCINATION-PLAN.md](HALLUCINATION-PLAN.md)) —
  every output heading carries `source` / `derived` / `proposed`
  classification with evidence quotes.
- **Schema-validated writers** (`write_element.py` / `patch_element.py` /
  `set_approval.py`) — the only mutation path; bypasses are
  CI-prevented.
- **Human-in-the-loop approval gate** (`set_approval.py`) — no element
  is "approved" without an explicit SME sign-off.
- **Wiki integrity contracts** — conformance check in Python + TypeScript
  twins (`scripts/check_conformance.py` / `src/lib/conformance.ts`).
- **Run-time orchestrator** — pure-data state machine that proposes,
  never executes (per ORCHESTRATOR-PLAN.md "Karpathy wiki is sacred").

What the tool **does NOT** have (the gap this roadmap closes):
- No entry in the bank's **model inventory**; no MRM tier classification.
- No **2LoD validation report** before any production use.
- No formal **AI Act risk classification** on file.
- No central **audit log of Claude API calls** (input hash / output hash
  / user / time / skill / model version).
- No documented **bias / robustness / adversarial-input testing**.
- No documented **DPIA** for personal data in raw-sources.
- No **incident-reporting playbook** for AI-output-driven harm.
- No **vendor-risk assessment** of Anthropic as a critical ICT third-party
  service provider under DORA.

This roadmap is **not** a research document — every item below is a
concrete, ownable workstream with an effort sizing, a severity tier, and
the control function that signs it off.

---

## Regulatory landscape — what applies, by when

The bank's AI Governance framework derives from several overlapping
sources. This roadmap pulls obligations from each.

### EU AI Act — Regulation (EU) 2024/1689

Phased application:

| Date | Obligations | Relevance to Processminer |
|---|---|---|
| **2025-02-02** | Article 4 (AI literacy) · Article 5 (prohibited practices) | **In force.** Every Processminer user needs documented AI literacy training proportionate to their role. |
| **2025-08-02** | GPAI provider obligations (Articles 51–55) · GPAI Code of Practice | Anthropic (Claude) is the GPAI provider. Processminer is a **downstream deployer**; deployer obligations under Article 26 apply if classified high-risk. |
| **2026-08-02** | High-risk AI system obligations (Articles 6–49) | If Processminer is classified high-risk under Annex III, **full Article 9–15 stack applies** (risk management, data governance, technical docs, logging, transparency, human oversight, robustness). |
| **2027-08-02** | High-risk AI systems embedded in regulated products | Likely not applicable. |

**Initial risk classification (working assumption — must be formally
confirmed by AI Governance Committee):**

- **Most uses → limited-risk under Article 50.** Processminer documents
  internal processes; outputs flow to humans who decide. Transparency
  obligation applies: users must know they interact with AI; outputs
  must be labeled AI-generated.
- **Tips into high-risk (Annex III) if used for:**
  - documenting HR processes that drive employment decisions (Annex III §4),
  - documenting credit-scoring processes (Annex III §5b),
  - documenting critical infrastructure (Annex III §2),
  - producing material the bank submits as evidence to a public authority
    in a way that influences a regulatory determination (Annex III §6).
- **Item Phase-1 #1 below makes this formal.**

### DORA — Regulation (EU) 2022/2554

Applies since **2025-01-17**. Relevant strands:

- **Article 28 — ICT third-party risk management.** Anthropic is a
  third-party ICT service provider. The bank must maintain a register,
  perform pre-contractual risk assessment, ensure contractual
  termination rights, and assess concentration risk if Anthropic
  becomes critical.
- **Article 17–23 — ICT-related incident management.** AI-output-driven
  incidents fall under this framework.
- **Article 24–27 — Digital operational resilience testing.** Periodic
  testing covers the LLM tool stack.

### Bank Model Risk Management (MRM) framework

Typically derived from US SR 11-7 / European MRM practice. Common
elements (the bank's specific framework should be referenced):

- **Model inventory** — every model registered before use.
- **Tier classification** — by materiality (financial exposure,
  regulatory exposure, customer impact). Processminer's likely tier:
  **Tier 2 or Tier 3** (decision-support, not decision-making, but
  feeding regulator-facing artifacts).
- **Independent validation by 2LoD MRM** — design + implementation +
  outcomes review.
- **Sign-off by Model Risk Officer / CRO** before go-live.
- **Annual revalidation.**
- **Ongoing performance monitoring.**

### GDPR + national data protection

GDPR applies where raw-sources or process content contain personal
data. **DPIA (Article 35)** is required when AI processes personal data
at scale.

### National banking supervisor

For a German-supervised institution: **BaFin MaRisk** notification
requirements; **ECB SSM / SREP** expectations on AI/ML use.

### Internal codes

Bank-specific: **Information Security Policy**, **Outsourcing /
Third-Party Policy**, **Records Management Policy**, **Code of
Conduct** (relevant where AI-generated content could imply
mis-statement).

---

## Severity tiers

Used throughout the roadmap to indicate regulatory criticality, not
implementation difficulty (effort is tracked separately).

- **BLOCKER** — go-live not permitted without this. Regulatory hard
  requirement or MRM framework gate.
- **HIGH** — required within first quarter of operation; finding-grade
  for Internal Audit / regulator if missing.
- **MEDIUM** — required for production maturity; finding-grade for 2LoD.
- **LOW** — best-practice; not finding-grade but expected by mature
  control environment.

**Effort sizing:** XS = 1–2 days · S = ~1 week · M = 2–3 weeks ·
L = ~1 month · XL = multi-month.

---

## Phase 1 — EU AI Act compliance (hard deadlines)

The items in this phase trace directly to specific AI Act articles.
Each carries a regulatory deadline; the bank's AI Governance Committee
owns the schedule.

#### 1. AI Act risk classification — formal determination on file
- **What:** AI Governance Committee issues a formal classification
  decision for Processminer (limited-risk vs high-risk Annex III), with
  reasoning. Re-issued whenever the scope of use changes.
- **Why:** every downstream obligation in this phase, and Phase 4 / 5 /
  6, depends on whether high-risk obligations (Articles 9–15) apply.
  Without the classification on file, the bank cannot demonstrate
  proportionate compliance.
- **Severity:** BLOCKER
- **Effort:** S
- **Owner:** AI Governance Committee + Legal
- **Touches:** Classification memo (new); link from
  `wiki/processes/*/index.md` frontmatter to the classification ID.

#### 2. Article 4 — AI literacy programme for Processminer users
- **What:** documented training programme covering: what the tool is,
  what it can / cannot do, how to read provenance, how the approval
  gate works, what to escalate. Issued before user access; refreshed
  annually. Completion tracked.
- **Why:** Article 4 has been in force since 2025-02-02; applies to all
  staff using AI in their work, regardless of risk tier.
- **Severity:** BLOCKER (already past deadline)
- **Effort:** M (course material + LMS deployment)
- **Owner:** Learning & Development + AI Governance
- **Touches:** New training module; LMS entry; access-gate hooked to
  completion record.

#### 3. Article 50 — AI-output transparency
- **What:** every UI surface that shows AI-generated content carries a
  clear "AI-generated, reviewed by [SME]" label. The wiki export
  (Confluence / Sparx / PDF) carries the same disclosure header. Chat
  responses are unambiguously machine-authored.
- **Why:** Article 50(2) — providers ensure outputs are marked as
  artificially generated; Article 50(4) — deployers of certain systems
  disclose to natural persons.
- **Severity:** HIGH
- **Effort:** S
- **Touches:** `ElementCard.tsx` (badge), `AgentChat.tsx` (header
  disclosure), export pipelines.

#### 4. GPAI deployer obligations (Articles 25, 26, 53)
- **What:** Processminer uses Claude (a GPAI) under Anthropic's terms.
  As a downstream deployer, the bank must: (a) keep Anthropic's GPAI
  documentation on file, (b) ensure use stays within the documented
  intended-use envelope, (c) maintain its own technical documentation
  layered on top of Anthropic's, (d) monitor for changes in the upstream
  model that affect performance.
- **Why:** Article 25 defines deployer chain responsibility; Article 53
  defines GPAI provider documentation that the deployer must consume.
- **Severity:** HIGH
- **Effort:** M
- **Touches:** New `governance/gpai-evidence/` folder with Anthropic's
  model cards / system cards; monitoring runbook for Claude version
  changes.

#### 5. (Conditional on high-risk) Article 9 — Risk Management System
- **What:** continuous risk-management process across the lifecycle:
  hazard identification, residual risk assessment, mitigation, post-
  market monitoring. Documented; reviewed annually.
- **Why:** triggered IF Phase-1 #1 lands as high-risk.
- **Severity:** BLOCKER (if high-risk)
- **Effort:** L
- **Owner:** 2LoD Operational Risk + AI Governance

#### 6. (Conditional on high-risk) Article 12 — Record-keeping / logging
- **What:** automatic logging of every AI interaction, traceable to: user
  / time / inputs / outputs / model version / skill / approval
  decisions. Retained for the period required (typically 10 years for
  bank records).
- **Why:** Article 12 + Annex IV-2(g). Also feeds Phase 4 #1 (audit
  log) so worth building once for both.
- **Severity:** BLOCKER (if high-risk); HIGH (if limited-risk —
  needed regardless for MRM)
- **Effort:** L
- **Touches:** New central log pipeline; see Phase 4 #1.

#### 7. (Conditional on high-risk) Article 14 — Human oversight, documented
- **What:** documented human-oversight design: who has the
  oversight role, what they can see, what they can stop, training they
  receive. Processminer's approval gate IS this — but it needs the
  documentation around it.
- **Why:** Article 14 requires the deployer to assign oversight
  competently; the existence of `set_approval.py` is the mechanism, the
  documentation is the obligation.
- **Severity:** BLOCKER (if high-risk)
- **Effort:** S
- **Touches:** New `governance/human-oversight.md` describing the gate;
  link from process `index.md`.

#### 8. (Conditional on high-risk) Article 15 — Robustness, accuracy, cybersecurity
- **What:** documented testing of accuracy (quantified hallucination
  rate per skill), robustness (adversarial input handling), and
  cybersecurity (prompt injection, data exfiltration). Reported in the
  technical documentation pack.
- **Why:** Article 15 is the technical depth obligation for high-risk
  systems. Items in Phase 6 produce the evidence.
- **Severity:** BLOCKER (if high-risk)
- **Effort:** L
- **Owner:** Model Risk Management + InfoSec
- **Touches:** Outputs of Phase 6 #1, #3, #5 fold into the Article 15
  evidence pack.

---

## Phase 2 — Model Risk Management onboarding (2LoD)

The bank's MRM framework gates production use. None of these items has
been completed.

#### 1. Model inventory entry
- **What:** register Processminer in the central model inventory:
  ID, owner, purpose, model class (LLM with prompt-orchestrated skills),
  upstream model (Claude), business unit, risk classification, validation
  status.
- **Why:** without an inventory entry the model formally does not exist
  for governance purposes; any production use is a finding.
- **Severity:** BLOCKER
- **Effort:** XS (form-filling) but depends on Phase 2 #2 (tier)
- **Owner:** Model Owner (1LoD) + MRM (2LoD)

#### 2. Tier classification per bank MRM framework
- **What:** formal tiering decision. Likely **Tier 2** (high
  materiality — feeds regulator-facing artifacts via Sparx aggregation,
  drives documented processes that auditors examine) or **Tier 3**
  (medium — internal documentation aid only). The decision drives
  validation depth.
- **Why:** depth of independent validation, frequency of revalidation,
  monitoring intensity all scale with tier.
- **Severity:** BLOCKER
- **Effort:** S
- **Owner:** MRM

#### 3. Pre-go-live independent validation (2LoD)
- **What:** MRM validation covering: model design (skill architecture,
  prompt patterns, provenance contract), implementation (code review of
  schema writers, approval gate, conformance checks), outcomes (sample
  review of ≥30 generated elements per skill against ground-truth SME
  authoring). Validation report with findings, ratings, and an
  effective-challenge log.
- **Why:** standard MRM gate. No production use without a passing
  validation rating.
- **Severity:** BLOCKER
- **Effort:** L (likely 4–8 weeks of MRM time)
- **Owner:** MRM
- **Touches:** Validation report (new); finding remediation backlog.

#### 4. Model Risk Officer / CRO sign-off
- **What:** formal sign-off on the validation report, with documented
  residual-risk acceptance. Communicated to AI Governance Committee.
- **Why:** standard MRM gate.
- **Severity:** BLOCKER
- **Effort:** XS (decision; effort is in the preceding items)
- **Owner:** Model Risk Officer + CRO

#### 5. Annual revalidation cycle
- **What:** scheduled re-validation in the model inventory; trigger
  events documented (Claude version change ≥ minor, skill schema change,
  material incident, ≥ X% drift in output quality).
- **Why:** standard MRM expectation.
- **Severity:** HIGH
- **Effort:** S (process setup; cost is the annual re-run)
- **Owner:** MRM

#### 6. Model performance monitoring — quantified output quality
- **What:** monthly sample-based scoring of generated elements against
  SME-graded ground truth. Hallucination rate, source-grounding rate,
  schema-conformance rate, edit-distance (post-approval edits as a
  quality proxy). Trend dashboard.
- **Why:** ongoing-monitoring obligation. The Phase-9 dogfood SME
  assessment already produces ad-hoc scores — this institutionalises
  them.
- **Severity:** HIGH
- **Effort:** M
- **Owner:** Model Owner (1LoD) — reviewed by MRM
- **Touches:** New sampling pipeline; dashboard; depends on Phase 4 #1
  audit log.

#### 7. Model documentation pack
- **What:** the standard MRM doc pack — purpose, intended use, scope,
  not-intended-use, data inputs, model architecture, key assumptions,
  limitations, validation summary, monitoring plan, change history. Lives
  next to the model inventory entry.
- **Why:** required artifact; consumed by Internal Audit, the regulator,
  and onboarding new business users.
- **Severity:** HIGH
- **Effort:** M
- **Touches:** New `governance/model-card-processminer.md`.

---

## Phase 3 — Control function sign-offs (2LoD / 3LoD)

Each control function maintains an independent view. Processminer
requires sign-off from each before any production use the function is
implicated in.

#### 1. Compliance — content & conduct review
- **What:** Compliance reviews: (a) outputs cannot generate market-
  manipulation-relevant statements; (b) outputs do not constitute
  unauthorised investment advice; (c) the tool does not enable code-of-
  conduct circumvention (e.g. drafting communications that bypass
  surveillance). Sign-off with a documented review.
- **Why:** standard 2LoD sign-off; codified in the bank's Compliance
  policy and MaRisk AT 4.3.4.
- **Severity:** HIGH
- **Effort:** M
- **Owner:** Compliance

#### 2. Operational Risk — assessment + incident classification
- **What:** Operational Risk performs an inherent-risk assessment;
  documents controls and residual risk; defines incident classification
  thresholds (when does an AI-output error become a reportable OpRisk
  event?). Integrated into the bank's OpRisk reporting system.
- **Why:** required by MaRisk AT 4.3.2 / Basel OpRisk framework. Also
  feeds DORA Article 17 incident management.
- **Severity:** HIGH
- **Effort:** M
- **Owner:** Operational Risk

#### 3. Legal — vendor, IP, contractual review
- **What:** Legal reviews: (a) Anthropic terms of service against bank
  requirements (zero data retention, EU data residency, audit rights);
  (b) IP of generated content (who owns the output?); (c) liability
  apportionment if AI output causes harm.
- **Why:** standard outsourcing review; Article 28 DORA contractual
  requirements.
- **Severity:** BLOCKER (Anthropic ToS review)
- **Effort:** M
- **Owner:** Legal + Procurement

#### 4. Information Security — threat model, pen test, secure SDLC
- **What:** documented threat model (STRIDE / equivalent); penetration
  test report; secure-development-lifecycle conformance review; secrets-
  handling audit (API keys to Anthropic); supply-chain scan of
  dependencies.
- **Why:** standard InfoSec sign-off; DORA Article 9.
- **Severity:** HIGH
- **Effort:** L
- **Owner:** Information Security

#### 5. Data Protection Officer — DPIA (Article 35 GDPR)
- **What:** Data Protection Impact Assessment covering: what personal
  data flows through (raw-sources may contain employee or customer PII),
  cross-border transfer (Anthropic API location), lawful basis,
  retention, data-subject rights, residual risk.
- **Why:** GDPR Article 35 — DPIA mandatory for new technologies
  processing personal data at scale.
- **Severity:** BLOCKER (where PII flows)
- **Effort:** M
- **Owner:** DPO

#### 6. Internal Audit — annual review cycle
- **What:** scheduled inclusion in the Internal Audit plan; first audit
  within 12 months of go-live; thereafter risk-based cadence.
- **Why:** 3LoD oversight; standard audit-universe addition.
- **Severity:** MEDIUM (post-go-live obligation)
- **Effort:** S (planning; cost is the audit itself)
- **Owner:** Internal Audit

#### 7. National supervisor — notification (if thresholds met)
- **What:** for German entities — assess MaRisk AT 9 outsourcing
  notification thresholds for Anthropic; assess BaFin's AI / ML use-case
  reporting expectations. File where required.
- **Why:** statutory notification obligation; failure is a regulatory
  finding.
- **Severity:** depends on threshold determination (BLOCKER if
  required, n/a otherwise)
- **Effort:** S
- **Owner:** Regulatory Reporting + Legal

---

## Phase 4 — Operational controls

Operational instrumentation needed to make Phase 1–3 obligations
auditable on an ongoing basis.

#### 1. Central audit log of every AI interaction
- **What:** every call to Anthropic logged with: timestamp, user,
  process / skill, model + version, input hash, output hash, prompt
  template version, approval-gate outcome. Append-only. Retention: 10
  years (bank-records standard).
- **Why:** AI Act Article 12 (if high-risk), MRM monitoring, OpRisk
  incident investigation, DORA Article 17 forensics, GDPR Article 30
  records of processing.
- **Severity:** BLOCKER
- **Effort:** L
- **Owner:** Model Owner + InfoSec
- **Touches:** New logging pipeline upstream of `session-worker.ts`;
  central sink (likely the bank's SIEM); retention enforcement.

#### 2. Output sample-based monitoring (quarterly)
- **What:** quarterly random sample of N (e.g. 50) generated elements
  per skill; SME re-grading against ground truth; trend report to MRM
  and AI Governance Committee. Material drift triggers re-validation.
- **Why:** ongoing monitoring obligation; produces the evidence that
  the model still performs.
- **Severity:** HIGH
- **Effort:** M (process); ongoing cost is the SME time per quarter
- **Owner:** MRM + business-unit SMEs

#### 3. Quality / drift detection signals
- **What:** automated metrics computed continuously: schema-conformance
  rate, citation-coverage rate (% of derived headings carrying an
  evidence quote), approval-gate edit rate (proxy for SME disagreement),
  lint-failure rate, conflict-resolution invocation rate. Threshold
  alerts.
- **Why:** quantitative early-warning for the monitoring obligation;
  cheaper than the manual quarterly sample at catching gross drift.
- **Severity:** HIGH
- **Effort:** M
- **Touches:** New metrics pipeline; depends on Phase 4 #1 audit log;
  feeds into Phase 4 #2 sampling cadence.

#### 4. Incident response runbook for AI-driven harm
- **What:** documented procedure: what counts as an AI incident, who
  declares it, how it's classified, who's notified internally (OpRisk,
  AI Governance, business unit), DORA Article 17 reporting decision,
  containment, remediation, post-incident review.
- **Why:** required by DORA Article 17 + bank OpRisk framework + AI Act
  Article 73 (serious incident reporting) if high-risk.
- **Severity:** HIGH
- **Effort:** S
- **Touches:** New `governance/incident-runbook.md`; integration with
  the bank's incident management system.

#### 5. SLA on output quality — defined acceptance criteria
- **What:** documented thresholds per skill: e.g. "≥ 95% schema
  conformance; ≥ 90% of derived headings carry evidence quotes;
  hallucination rate ≤ 2% on sampled outputs". Below threshold → halt.
- **Why:** acceptance criteria are the precondition for monitoring; you
  cannot monitor against an unstated baseline.
- **Severity:** HIGH
- **Effort:** S
- **Owner:** Model Owner + MRM

#### 6. Kill switch — emergency disable
- **What:** central feature flag that disables all skill invocations
  bank-wide; rolled-back access for affected business units; UI banner
  to users explaining the suspension. Tested at least annually.
- **Why:** AI Act Article 14(4)(e) human-oversight requirement to stop
  the system; DORA Article 24 resilience-testing input.
- **Severity:** HIGH
- **Effort:** S
- **Touches:** New `feature-flag` middleware at the `/api/session`
  boundary.

#### 7. Vendor SLA monitoring (Anthropic)
- **What:** Anthropic API availability monitored; incidents categorised
  per the bank's third-party-incident playbook; concentration-risk
  review annually (DORA Article 29).
- **Why:** DORA third-party risk; standard outsourcing oversight.
- **Severity:** MEDIUM
- **Effort:** S
- **Owner:** Vendor Management + InfoSec

---

## Phase 5 — Data governance

Where Processminer touches personal data, contractual data, or material
non-public information, the bank's data-governance regime applies.

#### 1. PII classification of raw-sources
- **What:** every uploaded raw-source classified at intake (no PII /
  internal PII / customer PII / special-category PII). Intake form
  blocks unclassified uploads. Classification stamped on
  `raw-sources/<slug>/<file>.meta.json`.
- **Why:** GDPR Article 5 (data minimisation); the upstream of every
  Phase-5 control.
- **Severity:** BLOCKER
- **Effort:** M
- **Touches:** Upload modal; new `meta.json` per raw-source; conformance
  check that every raw-source has classification.

#### 2. Data residency — EU containment
- **What:** Anthropic API region confirmed EU; if not available, formal
  derogation with TIA (transfer impact assessment). Audit log records
  the API endpoint per call.
- **Why:** GDPR Chapter V (transfers); bank-internal EU-only policy
  where applicable.
- **Severity:** BLOCKER (where customer PII flows)
- **Effort:** S (decision + documentation); depends on Anthropic offer
- **Owner:** DPO + InfoSec

#### 3. Zero-retention contractual guarantee with Anthropic
- **What:** contractual zero-retention on Anthropic side, no training-
  use of bank inputs, no human-review of bank traffic; documented and
  audit-tested.
- **Why:** confidentiality of bank-internal process documentation; IP
  of generated content; banking-secrecy obligations.
- **Severity:** BLOCKER
- **Effort:** S (contract review; cost is in legal time)
- **Owner:** Legal + Procurement

#### 4. Retention policy on wiki content
- **What:** documented retention period per element type; automated
  expiry / archival pipeline; legal-hold override mechanism. Disposition
  log.
- **Why:** bank records-management policy; GDPR storage limitation
  principle.
- **Severity:** HIGH
- **Effort:** M
- **Touches:** New `governance/retention-policy.md`; archival pipeline;
  legal-hold flag in frontmatter.

#### 5. Data lineage — what produced each output
- **What:** every generated element traceable to: source-document IDs,
  skill version, model version, prompt template hash, user, timestamp.
  Most pieces already exist in provenance; this is the consolidation
  into a single auditable lineage record.
- **Why:** AI Act Article 13 transparency; GDPR Article 22 right to
  explanation; MRM reproducibility.
- **Severity:** HIGH
- **Effort:** S (data exists; aggregation is the work)
- **Touches:** New lineage sidecar (outside the wiki tree per Karpathy
  principle); aggregator over existing provenance / run-manifest data.

#### 6. Right-to-explanation chain
- **What:** for any output influencing a decision about a natural
  person, the bank can produce: which source documents drove which
  headings, what the SME approved, what the AI proposed vs the human
  changed. UI-accessible to authorised users.
- **Why:** GDPR Article 22; AI Act Article 86 (right to explanation of
  individual decision-making for high-risk).
- **Severity:** HIGH (if PII flows through processed elements)
- **Effort:** M
- **Touches:** Depends on Phase 5 #5 lineage; new explanation view in UI.

#### 7. Data-Protection Impact Assessment (DPIA) — see Phase 3 #5
- Cross-reference. The DPIA is the artifact that captures #1–#6 in a
  single document for the DPO.

---

## Phase 6 — Output quality, robustness, bias

Generates the evidence pack for AI Act Article 15 (if high-risk) and
satisfies MRM ongoing-monitoring obligations.

#### 1. Quantified hallucination rate per skill
- **What:** documented test set per skill; periodic measurement of:
  fabricated facts (claims with no source backing), source-misattribution
  (claim correctly stated but wrongly cited), provenance-class
  misclassification (`source` marked where it should be `proposed`).
  Reported quarterly.
- **Why:** Article 15 accuracy; MRM monitoring; provenance contract
  effectiveness measurement.
- **Severity:** HIGH
- **Effort:** L (test set construction is the bulk)
- **Owner:** Model Owner + MRM
- **Touches:** New `governance/test-sets/<skill>/` directory; periodic
  evaluation pipeline; feeds the audit-log dashboard.

#### 2. Bias testing across roles, organisational forms, cultures
- **What:** structured prompt-and-input variations testing whether the
  same process described under different role names / hierarchies /
  cultural framings produces materially different outputs. Documented
  test cases; reviewed annually.
- **Why:** AI Act Article 10 (data governance — bias); Article 15
  accuracy; bank fairness principles.
- **Severity:** MEDIUM (HIGH if classified high-risk)
- **Effort:** M
- **Owner:** Model Risk + Diversity & Inclusion advisor

#### 3. Prompt injection / adversarial input defences
- **What:** the threat model covers: malicious source documents
  attempting to override skill prompts, attempts to exfiltrate other
  processes' content via cross-context references, attempts to coerce
  the approval gate. Test cases run as part of CI. Detection signals in
  the audit log.
- **Why:** AI Act Article 15(5) cybersecurity; DORA Article 24
  resilience testing.
- **Severity:** HIGH
- **Effort:** M
- **Owner:** InfoSec + Model Owner

#### 4. 2LoD sample review of generated outputs
- **What:** see Phase 4 #2. Cross-reference. The sample-review pipeline
  generates the bias / hallucination evidence on a continuous basis.

#### 5. Red-team exercise — annual adversarial test
- **What:** annual exercise: red team (internal or external) attempts to
  produce harmful, misleading, or non-compliant outputs from
  Processminer using realistic-but-adversarial inputs. Findings logged
  and remediated.
- **Why:** DORA Article 26 (advanced testing — TIBER-EU equivalent
  where the system qualifies); AI Act Article 15.
- **Severity:** MEDIUM
- **Effort:** M (one cycle); ongoing annually
- **Owner:** Information Security + Model Risk

#### 6. Source-grounding score per element
- **What:** per-element score: % of derived / source headings with a
  cited evidence quote that survives a deterministic match against the
  raw-source. Surfaced as a chip; aggregated for trend.
- **Why:** operationalises the HALLUCINATION-PLAN contract; makes the
  contract auditable rather than aspirational.
- **Severity:** HIGH
- **Effort:** M
- **Touches:** New `scripts/wiki/score_grounding.py`; surface in
  `ElementCard.tsx`.

#### 7. Disagreement / contradiction detection
- **What:** when the AI proposes an output that contradicts existing
  approved content elsewhere in the same wiki (e.g. role assignment
  conflict, control-owner contradiction), the proposal is flagged for
  explicit reconciliation before approval.
- **Why:** consistency obligation; lint pass already covers some of
  this — making it a hard gate rather than a finding.
- **Severity:** MEDIUM
- **Effort:** M
- **Touches:** Extension of `check_conformance.py` + `conformance.ts`;
  hard-fail in the approval gate.

---

## Phase 7 — Lifecycle & change management

Treats every skill / prompt / schema change as a model change governed
by the bank's change-management framework.

#### 1. Change Advisory Board (CAB) approval for skill changes
- **What:** every skill change (prompt edit, new skill, new element
  type, schema modification) goes through CAB review with risk impact
  assessment. CI gate enforces.
- **Why:** standard IT change management; MaRisk AT 7.2; MRM expectation
  that material model changes trigger re-validation.
- **Severity:** HIGH
- **Effort:** S
- **Touches:** New CI gate on `.claude/skills/**` and `schema/**`
  changes; CAB ticket linkage.

#### 2. Claude model version pinning + change-impact runbook
- **What:** the bank explicitly pins to a tested Claude model version.
  Upstream model updates trigger a documented impact assessment before
  rollout (regression test set, sample-output comparison, MRM sign-off
  on material changes).
- **Why:** Phase 2 #5 trigger event; AI Act Article 25 deployer
  obligation to monitor upstream model changes.
- **Severity:** HIGH
- **Effort:** S
- **Touches:** New `governance/model-version.json`; CI gate; runbook.

#### 3. Vendor BCP — Anthropic API outage scenario
- **What:** documented continuity plan: graceful degradation when
  Anthropic is unreachable, user-facing communication, manual fallback
  workflows for time-critical processes, RTO / RPO documented.
- **Why:** DORA Article 11 ICT business continuity; outsourcing
  resilience.
- **Severity:** HIGH
- **Effort:** M
- **Owner:** BCP / Resilience + Vendor Management

#### 4. Decommissioning procedure
- **What:** documented sunset process: data archival, user
  communication, audit-log retention beyond decommissioning, model-
  inventory closure entry.
- **Why:** records management; MRM lifecycle.
- **Severity:** LOW (until needed)
- **Effort:** S

#### 5. Champion / challenger evaluation
- **What:** periodic side-by-side test of an alternative LLM (e.g. for
  data-residency or concentration-risk reasons). Documented; informs
  vendor concentration-risk view.
- **Why:** concentration-risk mitigation; DORA Article 29.
- **Severity:** MEDIUM
- **Effort:** M
- **Owner:** Architecture + Model Risk

#### 6. Version registry — every output stamped
- **What:** every wiki element carries: skill version, prompt template
  hash, model version, schema version. Already partially present in
  frontmatter; consolidate.
- **Why:** lineage + reproducibility for MRM and audit.
- **Severity:** HIGH
- **Effort:** S
- **Touches:** Frontmatter additions; conformance check enforces
  presence.

#### 7. Sunset criteria — when does Processminer get retired
- **What:** documented retirement triggers: replacement by a successor
  system, structural regulatory blocker, sustained quality failure
  below threshold. Not a hot decision; documented so the option exists.
- **Why:** governance hygiene; avoids "zombie system" pattern.
- **Severity:** LOW
- **Effort:** XS

---

## Severity & sequencing summary

### BLOCKER items (no production use without them)
1. **Phase 1 #1** — AI Act risk classification
2. **Phase 1 #2** — Article 4 AI literacy programme (deadline past)
3. **Phase 1 #5, #6, #7, #8** — IF high-risk, the Article 9/12/14/15
   stack
4. **Phase 2 #1, #2, #3, #4** — MRM inventory, tier, validation,
   sign-off
5. **Phase 3 #3** — Legal review of Anthropic terms
6. **Phase 3 #5** — DPIA where PII flows
7. **Phase 3 #7** — supervisor notification where required
8. **Phase 4 #1** — central audit log
9. **Phase 5 #1, #2, #3** — PII classification, EU residency, zero-
   retention contract

### HIGH items (required in the first quarter of operation)
Phase 1 #3, #4 · Phase 2 #5, #6, #7 · Phase 3 #1, #2, #4 · Phase 4 #2, #3,
#4, #5, #6 · Phase 5 #4, #5, #6 · Phase 6 #1, #3, #6 · Phase 7 #1, #2,
#3, #6.

### MEDIUM / LOW
Phase 3 #6 · Phase 4 #7 · Phase 6 #2, #5, #7 · Phase 7 #4, #5, #7.

### Suggested sequencing
1. **Pre-go-live (≈ 3–6 months):** BLOCKERs only. Earliest production
   use is gated on completing all BLOCKERs.
2. **First quarter post-go-live:** HIGH items.
3. **First year:** MEDIUM items + first Internal Audit cycle (Phase 3
   #6).
4. **Steady state:** LOW items + annual cadence on revalidation, bias
   testing, red-team, DPIA refresh.

---

## Open questions for the AI Governance Committee

These are decisions that gate sequencing and must be resolved before
the BLOCKER list can be costed precisely.

1. **High-risk classification under Annex III.** Does Processminer's
   actual use envelope cross into HR-decision, credit-relevant, or
   regulator-evidence territory? Phase 1 #5–#8 are conditional on this.
2. **Bank MRM tier.** Tier 2 vs Tier 3 changes the depth of Phase 2 #3
   validation by an order of magnitude.
3. **PII envelope.** Are raw-sources allowed to contain customer PII at
   all? If no, Phase 5 #1 becomes a hard intake filter rather than a
   classification step.
4. **Anthropic terms — zero retention + EU residency.** What's
   currently available contractually, and what's the BCP if neither
   can be guaranteed (Phase 7 #5 champion/challenger may become
   mandatory rather than optional)?
5. **GPAI Code of Practice signature status.** Is Anthropic a signatory
   to the EU AI Act GPAI Code of Practice? Drives the evidence the bank
   can rely on for Phase 1 #4.
6. **National supervisor notification thresholds.** Has the bank
   triggered MaRisk AT 9 outsourcing notification by adopting
   Processminer? (Likely no for internal-only documentation, but Legal
   should confirm.)
7. **Internal Audit cadence.** First audit within 6 / 12 / 18 months —
   driven by the tier classification and the first material incident
   (or its absence).

---

## Cross-references

- [HALLUCINATION-PLAN.md](HALLUCINATION-PLAN.md) — the per-heading
  provenance contract that the Article 15 + MRM monitoring obligations
  build on
- [ORCHESTRATOR-PLAN.md](ORCHESTRATOR-PLAN.md) — the "Karpathy wiki is
  sacred" principle, relevant to data-lineage / immutability arguments
  in Phase 5
- [SKILLS.md](SKILLS.md) — the skill architecture; every skill is a
  Phase-7 #1 change-management object
- [schema/process-schema.json](schema/process-schema.json) — the
  schema; every modification is a Phase-7 #1 change
- [ROADMAP.md](ROADMAP.md) — the feature roadmap; several items here
  (Phase 4 #1 audit log, Phase 5 #5 lineage, Phase 6 #6 source-grounding
  score) become prerequisites for feature items there

---

*Last updated 2026-05-28. This is a living document; revise after every
material regulatory development, every AI Governance Committee decision,
and every Phase-3 control-function sign-off.*
