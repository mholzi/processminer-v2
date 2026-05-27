---
id: PS-PR-005
type: process-step
section: process-steps
title: Reviewer Triage
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
owner: FCO Analyst
sla: 5 working days from case ready-for-review
condition: Case is STP-ineligible and ready for human review (data delta received or no outreach required)
systems: [SYS-PR-001, SYS-PR-005, SYS-PR-006]
---
## What happens
The FCO Analyst sees a single review screen showing the completeness score and the reason for non-STP, the full evidence pack with provenance (every fact linked to its source record), the risk model's rating with feature contributions, and open screening hits with tooling to clear or escalate. The analyst chooses one of four decision options: Approve (with rationale), Approve with conditions (e.g. monitoring tier raised, debit cap, product restriction), Refer to EDD (triggers the Enhanced Due Diligence subprocess), or Recommend exit (sent to FCO sign-off). High-risk clients, PEPs and exit recommendations are mandatory escalations.

## Inputs
- Case with full pre-filled evidence pack and provenance links
- Completeness score and non-STP reason
- Risk model rating with feature contributions
- Open screening hits from Screening Service
- Outreach thread and client-supplied data delta (if outreach occurred)

## Outputs
- Analyst decision recorded in Audit Ledger (Approve / Approve with conditions / Refer to EDD / Recommend exit)
- Rationale and conditions documented against the decision
- Case routed to Step 6 (FCO sign-off) or Step 7 (Close-out) depending on decision type
- EDD subprocess triggered if applicable

## Why it matters
A structured single-screen triage with provenance-linked evidence replaces the As-Is free-form memo review, making escalation criteria explicit and auditable rather than dependent on the analyst on duty.
