---
id: CP-BGID-003
type: control
section: controls
title: Facility Limit Check
status: draft
source: bank-guarantee-issuance-v1.md
controlType: PREVENTIVE
execution: MANUAL
effectiveness:
owner: Trade Finance
step: [PS-BGID-002]
regulatedBy: []
updatedBy: the assistant
updatedAt: 2026-05-26T05:18:45Z
---
## What it checks
Verifies that the client's available guarantee facility limit is sufficient to cover the requested guarantee amount before issuance proceeds.

## Control activity
The Trade Finance Officer confirms the client holds an approved guarantee facility with sufficient available limit. If the limit does not cover the guarantee amount, issuance is blocked and the application is parked and routed to the Credit team.

## Risk addressed
Without this control, the bank could issue a guarantee exceeding the client's approved credit limit, creating an unsanctioned exposure and potential credit loss.

## Timing
The check is performed at step 2 — Credit and Facility Check — for every application before it advances to wording review.
