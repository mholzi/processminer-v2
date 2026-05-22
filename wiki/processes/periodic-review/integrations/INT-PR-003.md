---
id: INT-PR-003
type: integration
section: integrations
title: Outreach Service to Mobile App
status: draft
confidence: medium
source: periodic-kyc-review-dtp.pdf
systems: [SYS-PR-007]
provenance: {"What connects": {"evidence": "", "source": "proposed"}, "What flows": {"evidence": "Outreach Service → Mobile App: uses the same secure-message rail as transactional approvals; supports step-up auth.", "source": "document"}}
---
## What connects
The Outreach Service (@sys-7) delivers KYC prompts to clients via the bank's mobile app, using the same secure-message rail as transactional approvals.

## What flows
- KYC outreach prompts delivered to the client via the mobile app on the secure-message rail
- Step-up authentication supported via the same rail
