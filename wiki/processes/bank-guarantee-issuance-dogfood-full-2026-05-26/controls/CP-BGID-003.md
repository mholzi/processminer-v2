---
id: CP-BGID-003
type: control
section: controls
title: Facility Limit Check
status: draft
confidence: medium
source: bank-guarantee-issuance-v1.md
controlType: PREVENTIVE
execution: AUTOMATED
owner: Trade Finance
step: [PS-BGID-002]
regulatedBy: [REG-BGID-005]
updatedBy: the assistant
updatedAt: 2026-05-26T08:27:49Z
---
## What it checks
Issuance is permitted only when the client's available guarantee facility limit is sufficient to cover the requested guarantee amount.

## Control activity
The Trade Finance System blocks issuance unless the available facility limit covers the guarantee amount. If the limit is insufficient, the application is parked and routed to the Credit team.

## Risk addressed
Without this control, the bank could issue a guarantee beyond the client's approved credit limit, creating an unsecured or over-limit credit exposure.

## Timing
The control runs at the Credit and Facility Check step, once per application, before subsequent process steps proceed.
