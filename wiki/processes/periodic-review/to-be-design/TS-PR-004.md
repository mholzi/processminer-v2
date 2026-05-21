---
id: TS-PR-004
type: target-state
section: to-be-design
title: Step 4 — Targeted Outreach
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
owner: Client Outreach Service (system); RM-mediated for Private Banking
sla: Hard 30-day timeout on digital channel; RM fall-back triggered automatically on day 31
condition: Case did not pass STP gate (Step 3 returned ineligible) and a data gap exists
systems: [SYS-PR-007]
provenance: {"Rationale": {"evidence": "Client outreach rate: As-Is 91 %, Target (Y+2) 28 % [Headline targets table, p.5]; Mobile app outreach has a 7-day median completion in the pilot vs. 21 days for email [D4, p.15]", "source": "document"}, "Target description": {"evidence": "", "source": "proposed"}, "What changes": {"evidence": "", "source": "proposed"}}
---
## Target description
For non-STP cases with a data gap, the Client Outreach Service computes the minimal data delta — exactly what is missing or stale — and requests only that from the client. The primary channel is the bank's mobile app for non-Private-Banking clients; for Private Banking clients, outreach is RM-mediated, with secure message as a secondary channel. The system issues a single threaded request with a hard 30-day timeout. If the client does not respond on the digital channel within 30 days, the case automatically falls back to RM-mediated outreach.

## What changes
- Outreach is targeted to the data delta only — not a standard document checklist
- Mobile app is the primary channel for non-PB clients, replacing the email/phone/in-person approach used in the As-Is process
- Single-thread design with a hard 30-day timeout replaces indefinite multi-touch chasing
- RM-mediated fall-back is triggered automatically after 30 days — not ad-hoc
- Client sees a specific, plain-language request (e.g. 'We last saw your ID in 2021 and it expires in July — please upload an in-date copy')

## Rationale
Reduces client outreach rate from 91 % (As-Is) to a target of ~28 % by eliminating over-collection. The mobile app pilot achieved 7-day median completion versus 21 days for email. Addresses the As-Is pain point of outreach over-collection and the email/paper-based channel.
