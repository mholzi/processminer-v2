---
id: INT-PR-001
type: integration
section: integrations
title: Trigger Engine to Case Manager
status: draft
confidence: low
source: periodic-kyc-review-dtp.pdf
systems: [SYS-PR-002, SYS-PR-001]
---
## What connects
The KYC Trigger Engine (@sys-2) pushes review-due events to the KYC Case Manager (@sys-1) via an event-driven, idempotent integration.

## What flows
- Review-due events pushed event-driven from Trigger Engine to Case Manager
- Integration is idempotent
- Nightly reconciliation against the client master to detect any missed or dropped events
