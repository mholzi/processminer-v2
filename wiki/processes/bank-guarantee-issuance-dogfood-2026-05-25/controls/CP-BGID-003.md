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
owner: Trade Finance Officer
step: [PS-BGID-002]
regulatedBy: []
updatedBy: the assistant
updatedAt: 2026-05-25T20:56:10Z
---
## What it checks
That the client holds an approved guarantee facility with sufficient available limit to cover the requested guarantee amount before any further processing continues.

## Control activity
Issuance is blocked in the Trade Finance System unless the available facility limit covers the guarantee amount. If the limit is insufficient, the application is parked and routed to the Credit team for limit review.

## Risk addressed
Without this check, a guarantee could be issued in excess of the client's approved credit limit, creating an unsanctioned credit exposure for the bank.

## Timing
Runs at the credit and facility check step for every application, before wording review or compliance screening commences.
