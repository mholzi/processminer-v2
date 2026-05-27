---
id: CP-DCR-004
type: control
section: controls
title: Dispatch only to the registered address
status: draft
confidence: high
source: dcr-dtp-mockup.md
controlType: PREVENTIVE
execution: AUTOMATED
owner: Card Operations
step: [PS-DCR-005]
approval: in-progress
regulatedBy: [REG-DCR-002]
---
## What it checks
Confirms the replacement card is sent only to the customer's registered address held on file.

## Control activity
The card order is released to the bureau only against the registered address; an unconfirmed or stale address holds the order until it is corrected.

## Risk addressed
Without it, a replacement card could be posted to an address the customer no longer controls, enabling card-not-received fraud.

## Timing
Applied on every replacement card order.
