---
id: INT-PR-001
type: integration
section: integrations
title: Trigger Engine → KYC Case Manager
status: draft
confidence: medium
source: periodic-kyc-review-dtp.pdf
systems: [SYS-PR-002, SYS-PR-001]
provenance: {"What connects": {"evidence": "§7.3: 'Trigger Engine → Case Manager: event-driven, idempotent, with reconciliation against the client master nightly.'", "source": "document"}, "What flows": {"evidence": "§7.3: 'event-driven, idempotent, with reconciliation against the client master nightly.' Step 1 (§3.2): 'Output. ReviewDue event with reason code.'", "source": "document"}}
---
## What connects
The Trigger Engine (SYS-PR-002) and the KYC Case Manager (SYS-PR-001). The Trigger Engine is the event producer; the Case Manager is the consumer that opens and owns the review case.

## What flows
- ReviewDue events (with reason code) pushed event-driven from Trigger Engine to Case Manager
- Integration is idempotent (duplicate events do not create duplicate cases)
- Nightly reconciliation run against the client master detects any missed or unprocessed events
