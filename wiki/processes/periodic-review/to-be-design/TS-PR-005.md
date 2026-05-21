---
id: TS-PR-005
type: target-state
section: to-be-design
title: Step 5 — Reviewer Triage
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
owner: Financial Crime Operations Analyst (FCO Analyst)
sla: 5 working days from case ready-for-review
condition: Case routed from Step 3 (STP ineligible) or Step 4 (outreach complete or timed out)
systems: [SYS-PR-001]
provenance: {"Rationale": {"evidence": "Every fact links to its source record, the policy clause, and the reviewer's identity. [Executive Summary, p.5]; 4-eyes sign-off on High / PEP / exits [KYC-C-03, §5.2, p.12]; No 4-eyes enforcement on High / PEP [G-03, §9, p.16]; No KPI on cycle time per risk tier [G-05, §9, p.16]", "source": "document"}, "Target description": {"evidence": "", "source": "proposed"}, "What changes": {"evidence": "", "source": "proposed"}}
---
## Target description
The FCO Analyst sees a single triage screen showing: the completeness score and the explicit reason the case did not pass STP; the full evidence pack with provenance links to source records (every fact links to its origin); the risk model's rating with feature contributions; and any open screening hits with in-screen tooling to clear or escalate. The analyst selects one of four structured decision options: Approve (recorded with rationale); Approve with conditions (e.g.

## What changes
- Single triage screen replaces multi-system evidence reconstruction across four platforms
- Every fact in the evidence pack links to its source record with full provenance
- Explicit four-option decision menu (approve / approve-with-conditions / EDD / exit) enforces consistent escalation rules
- Formal 5-working-day SLA replaces the absence of any SLA in the As-Is process
- FCO Analyst (not RM) is the process owner for this step — organisational separation of client ownership from process ownership

## Rationale
Every fact links to its source record, eliminating the audit fragility of the As-Is process. The explicit decision menu removes analyst-discretionary escalation. The formal SLA addresses the As-Is absence of a cycle-time KPI per risk tier.
