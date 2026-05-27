---
id: CP-BGID-004
type: control
section: controls
title: Collateral Block Confirmation
status: draft
confidence: medium
source: bank-guarantee-issuance-v2.md
controlType: PREVENTIVE
execution: MANUAL
owner: Trade Finance Officer
step: [PS-BGID-007]
regulatedBy: [REG-BGID-006]
updatedBy: the assistant
updatedAt: 2026-05-26T08:27:49Z
---
## What it checks
For guarantees not fully covered by an approved facility, the control verifies that cash collateral has been received and blocked before issuance can proceed.

## Control activity
The Trade Finance Officer confirms receipt and blocking of cash collateral prior to advancing the application to the issuance approval step. This check is mandatory for every partially-secured guarantee.

## Risk addressed
Without this control, a guarantee could be issued against insufficient or unblocked collateral, exposing the bank to credit loss if the guarantee is called and no collateral is available to cover the claim.

## Timing
The control runs at the Collateral Confirmation step, once per partially-secured guarantee application, before issuance approval is sought.
