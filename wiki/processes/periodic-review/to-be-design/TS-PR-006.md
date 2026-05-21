---
id: TS-PR-006
type: target-state
section: to-be-design
title: Step 6 — Sign-Off
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
owner: Financial Crime Officer (FCO) — 4-eyes principle
sla:
condition: Mandatory for: High-risk clients; PEPs; recommend-exit decisions; approve-with-conditions where condition restricts a regulated product; and a random 5 % QA sample of STP and analyst approvals
systems: []
provenance: {"Rationale": {"evidence": "No 4-eyes enforcement on High / PEP [G-03, §9, p.16]; BaFin §44 KWG inspection [Executive Summary, p.5]; D5 — One Audit Ledger, append-only, hash-chained — Closes the BaFin §44 finding decisively [D5, p.15]; QA sampling ad-hoc, not statistical [G-07, §9, p.16]; Sanctions-screen re-run at sign-off [KYC-C-06, §5.2, p.12]", "source": "document"}, "Target description": {"evidence": "Owner. Financial Crime Officer (FCO) — 4-eyes principle. Mandatory for: High-risk clients, PEPs, recommend-exit decisions, approve-with-conditions where the condition restricts a regulated product, and a random 5 % QA sample of STP and analyst approvals. Sign-off is recorded against the FCO's identity (SSO) and is immutable. [Step 6, p.9]; Sanctions-screen re-run at sign-off [KYC-C-06, §5.2, p.12]", "source": "document"}, "What changes": {"evidence": "", "source": "proposed"}}
---
## Target description
The Financial Crime Officer provides mandatory 4-eyes sign-off for: all High-risk clients; Politically Exposed Persons (PEPs); recommend-exit decisions; approve-with-conditions decisions where the condition restricts a regulated product; and a random 5 % QA sample of STP and analyst approvals. Sign-off is recorded against the FCO's SSO identity and is immutable. A sanctions screen is re-run by the Screening Service at the moment of sign-off before the decision is sealed.

## What changes
- FCO sign-off is systemically enforced by the Case Manager for all mandatory cases — not analyst-discretionary
- Sign-off is recorded to the immutable Audit Ledger tied to the FCO's SSO identity
- 5 % random QA sample formally covers both STP auto-approvals and analyst approvals
- Sanctions screen is re-run at the point of sign-off before the decision is sealed
- Scope of mandatory sign-off is encoded in system rules — not a policy document only

## Rationale
Systematic enforcement closes the As-Is gap of no 4-eyes enforcement on High-risk and PEP cases. Immutable recording addresses the BaFin §44 finding on evidence completeness. The 5 % QA sample closes the gap of ad-hoc, non-statistical QA sampling. The sanctions re-run at sign-off is control KYC-C-06.
