---
id: INT-PR-004
type: integration
section: integrations
title: Case Manager to Core Banking
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
systems: [SYS-PR-001]
---
## What connects
The KYC Case Manager (@sys-1) writes review outcomes back to Core Banking (Avaloq) via the existing client-master update API.

## What flows
- `nextReviewDate` written to the client master via the existing client-master update API
- `riskRating` written to the client master via the existing client-master update API
- Any restrictions written to the client master via the existing client-master update API
