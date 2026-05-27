---
id: EX-SP-007
type: exception
section: exceptions
title: Missed cut-off
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
category: timing
impact: LOW
handlingOwner: Payments Operations
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:00Z
---
## Description
A standard SCT instruction is received or finalised after the 16:00 CET same-day cut-off and cannot be included in the current STEP2 processing cycle.

## Handling
The payment is rolled to the next cycle, which is the next business day per the SEPA rulebook. Payments Operations notifies the customer of the revised execution date.

## Impact
The beneficiary receives funds one business day later than expected. Impact is generally low.
