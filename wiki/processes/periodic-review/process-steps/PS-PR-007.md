---
id: PS-PR-007
type: process-step
section: process-steps
title: Close-out
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
owner: KYC Case Manager
sla:
condition: Reviewer approval recorded (from Step 5) or FCO sign-off recorded (from Step 6)
systems: [SYS-PR-001, SYS-PR-008, SYS-PR-006]
---
## What happens
The KYC Case Manager executes the close-out actions automatically upon receiving the approval signal. On approval: risk rating is refreshed, next review date is written to the client master, outreach threads are archived to the case, the Audit Ledger entry is sealed, and the RM is notified informally. On exit or restriction: the Client Exit workflow is opened or product and channel restrictions are applied via the Restrictions Service, and Customer Communications is notified to draft the regulatory-compliant exit letter.

## Inputs
- Approval signal with final decision (approve / approve with conditions / exit / restriction)
- FCO or analyst decision record

## Outputs
- Risk rating refreshed and nextReviewDate written to client master (approval path)
- Audit Ledger entry sealed and immutable
- RM notified (informational)
- Client Exit workflow opened or restrictions applied (exit/restriction path)
- Customer Communications notified to draft exit letter (exit path)

## Why it matters
Automated close-out ensures every review concludes with a sealed audit record and an updated next-review date, replacing the As-Is manual update of the core banking system (Avaloq / Finnova) and eliminating the risk of a review completing without being logged.
