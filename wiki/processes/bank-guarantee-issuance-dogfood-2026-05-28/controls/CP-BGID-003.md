---
id: CP-BGID-003
type: control
section: controls
title: Facility Limit Check
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
controlType: PREVENTIVE
execution: AUTOMATED
effectiveness: HIGH
owner: Trade Finance Operations
step: [PS-BGID-002, PS-BGID-006]
regulatedBy: []
updatedBy: the assistant
updatedAt: 2026-05-28T14:11:34Z
approval: approved
approvalBy: admin
approvalDate: 2026-05-28
---
## What it checks
Verifies that the client's approved guarantee facility has sufficient available limit to cover the requested guarantee amount before issuance is permitted.

## Control activity
The Trade Finance System enforces a hard block that prevents issuance unless the client's available facility limit covers the guarantee amount. No manual override is permitted — the platform exposes no code path to bypass this check. Applications that fail at step 2 are parked and routed to the Credit team. The same check fires again at guarantee generation (PS-BGID-006) to confirm the approved amount matches the instrument being generated.

## Risk addressed
Issuing a guarantee that exceeds the client's approved credit facility, creating unsanctioned credit exposure for the bank.

## Timing
Runs automatically on every application at Credit and Facility Check (PS-BGID-002) and again at Guarantee Generation and Delivery (PS-BGID-006), enforced by the Trade Finance System.
