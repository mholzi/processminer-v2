---
id: PS-PR-002
type: process-step
section: process-steps
title: Case Open and Pre-Fill
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
owner: KYC Case Manager
sla: ≤ 5 minutes from trigger
condition: ReviewDue event received from Trigger Engine
systems: [SYS-PR-001, SYS-PR-004, SYS-PR-005, SYS-PR-006, SYS-PR-009, SYS-PR-010]
---
## What happens
When the ReviewDue event arrives the KYC Case Manager opens a new case and pre-populates it with everything the bank already holds: identity documents and their expiry from the Document Vault; address on file from the Client Master plus the last three statement-delivery bounce-backs; source-of-funds signal from the last 12 months of transactions; beneficial-owner graph from the Entity Resolution Service; latest sanctions, PEP and adverse-media screens; and the last KYC decision with its evidence pack. The case is then assigned a completeness score (0–100) and an STP eligibility flag.

## Inputs
- ReviewDue event with reason code from Trigger Engine
- Identity documents and expiry dates (Document Vault)
- Client address, last-review date and statement bounce-back log (Client Master)
- Source-of-funds signal from last 12 months of transactions (Transaction Datamart)
- Beneficial-owner graph (Entity Resolution Service)
- Latest sanctions / PEP / adverse-media screen results and previous KYC decision pack (Screening Service)

## Outputs
- Open KYC case pre-populated with all held data
- Completeness score (0–100)
- STP eligibility flag (eligible / ineligible with reason)

## Why it matters
Pre-filling eliminates over-collection of documents the bank already holds and ensures the STP decision in Step 3 is based on a complete, machine-readable evidence snapshot rather than a manually assembled pack.
