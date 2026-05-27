---
id: PS-DCR-002
type: process-step
section: process-steps
title: Verify customer identity
status: draft
confidence: high
source: dcr-dtp-mockup.md
owner: Contact Centre Agent
systems: [SYS-DCR-002, SYS-DCR-003]
approval: in-progress
---
## What happens
The Contact Centre Agent verifies the customer's identity before any card action is taken. For phone requests this is knowledge-based verification: the customer is asked a fixed set of three security questions and must answer at least two correctly to pass. For requests raised in the mobile app the customer is already authenticated by their app login, so no further check is needed.

## Inputs
- The logged replacement request
- The customer's answers to security questions on the phone channel
- The customer's authenticated app session on the mobile channel

## Outputs
- A verified customer identity, or a failed verification
- Authorisation to proceed to blocking the card

## Why it matters
Identity verification prevents an unauthorised person from having a customer's card blocked or a replacement sent, which is the primary fraud risk at the start of the process.
