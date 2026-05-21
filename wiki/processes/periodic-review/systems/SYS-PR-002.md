---
id: SYS-PR-002
type: system
section: systems
title: Trigger Engine
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
systemType: CORE
integrates: [SYS-PR-001]
provenance: {"Purpose": {"evidence": "Trigger Engine … Deterministic triggering … Build … In design [§7.2 inventory table]; 'Triggers are deterministic and logged. A review fires when any of: The client's review cadence expires … An event-based trigger fires …' [§3.2 Step 1]", "source": "document"}, "Role in this process": {"evidence": "", "source": "proposed"}}
---
## Purpose
Deterministic rule-and-event engine that fires ReviewDue events on risk-rated cadence and on qualifying event triggers.

## Role in this process
Drives Step 1 (Trigger). Publishes event-driven, idempotent ReviewDue messages to the KYC Case Manager, with nightly reconciliation against the client master. Consumes risk ratings, the sanctions/adverse-media event bus, TM alerts, and beneficial-owner change notifications.
