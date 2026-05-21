---
id: TS-PR-003
type: target-state
section: to-be-design
title: Step 3 — STP Decision
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
owner: STP Decision Engine (system)
sla:
condition: Eligibility requires ALL of: risk is Low or Medium; completeness score ≥ 92; no open screening hit; no event-based trigger fired; product mix unchanged
systems: [SYS-PR-003]
provenance: {"Rationale": {"evidence": "", "source": "proposed"}, "Target description": {"evidence": "", "source": "proposed"}, "What changes": {"evidence": "", "source": "proposed"}}
---
## Target description
The STP Decision Engine evaluates each case for straight-through processing eligibility. Eligibility requires: risk is Low or Medium AND completeness score ≥ 92 AND no open screening hit AND no event-based trigger fired AND product mix is unchanged. If eligible, the engine refreshes the client's risk rating (re-running the rating model), writes the new nextReviewDate to the client master, posts the full evidence snapshot to the Audit Ledger, and notifies the RM (FYI only) — no client contact.

## What changes
- STP auto-approval replaces mandatory human review for Low/Medium-risk clean cases (~62 % of reviews)
- Hard cap of 70 % STP share is maintained to preserve human oversight as a material control
- Every auto-approval is posted to the Audit Ledger with a full evidence snapshot
- Ineligibility routing reason is explicit and machine-written rather than analyst-discretionary
- Risk rating is refreshed by re-running the rating model at the point of STP approval — not carried forward unchanged

## Rationale
Approximately 62 % of reviews complete without human or client involvement, cutting median cycle time for Low-risk to 0 days (STP). The 70 % hard cap and the Audit Ledger trail address supervisory expectations under AMLD6 Art.
