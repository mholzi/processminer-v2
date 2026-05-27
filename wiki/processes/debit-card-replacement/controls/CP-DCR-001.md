---
id: CP-DCR-001
type: control
section: controls
title: Customer identity verification before any card action
status: draft
confidence: high
source: dcr-dtp-mockup.md
controlType: PREVENTIVE
execution: MANUAL
owner: Contact Centre
step: [PS-DCR-002]
approval: in-progress
regulatedBy: [REG-DCR-001, REG-DCR-002]
---
## What it checks
Confirms that the person requesting the replacement is the genuine cardholder before any card is blocked or ordered.

## Control activity
The Contact Centre Agent verifies identity through knowledge-based security questions on phone requests; mobile app requests rely on the customer's authenticated login.

## Risk addressed
Without it, an impersonator could have a customer's card blocked or a replacement card sent to a fraudulent destination.

## Timing
Performed on every replacement request, before the card is blocked.
