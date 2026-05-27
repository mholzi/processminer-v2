---
id: INT-PR-002
type: integration
section: integrations
title: Case Manager to Audit Ledger
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
systems: [SYS-PR-001, SYS-PR-008]
---
## What connects
The KYC Case Manager (@sys-1) writes every case state transition to the Audit Ledger (@sys-8), which is hash-chained and retained for 10 years per AMLD record-keeping requirements.

## What flows
- Every case state-transition event written to the Audit Ledger
- Ledger entries are hash-chained
- Records retained for 10 years to match AMLD record-keeping obligations
