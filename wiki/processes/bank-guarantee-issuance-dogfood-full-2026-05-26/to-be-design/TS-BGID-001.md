---
id: TS-BGID-001
type: target-state
section: to-be-design
title: Validated Smart Intake — Mandatory Field Enforcement and API Channel
status: draft
confidence: high
source: SME interview — transformation-agent session 2026-05-26
replaces: [PS-BGID-001]
systems: [SYS-BGID-001]
updatedBy: admin
updatedAt: 2026-05-26T09:27:02Z
---
## Target description
The Corporate Portal enforces mandatory field completion — including commercial contract reference — before an application can be submitted, eliminating incomplete intake. ERP-connected corporate clients submit guarantee applications programmatically via an ICC-SWIFT-compliant API channel and receive MT760 instruments and acknowledgements back into their ERP. Standard-template applications are auto-routed to the credit check without manual TFO triage.

## What changes
- The portal submission button is disabled until all mandatory fields carry valid values
- A commercial contract reference is a mandatory field enforced at submission
- An ICC-SWIFT-compliant API channel accepts structured guarantee application submissions from ERP systems
- Standard-template applications are auto-routed to the credit and facility check without TFO intake triage
- The TFO's manual completeness check is replaced by the system-level portal and API enforcement

## Rationale
Mandatory enforcement at submission eliminates the most frequent source of rework — missing mandatory fields — and the API channel extends the bank's reach to ERP-integrated corporate clients, addressing both the completeness control gap and the channel access gap.
