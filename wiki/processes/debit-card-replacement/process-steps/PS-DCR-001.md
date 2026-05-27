---
id: PS-DCR-001
type: process-step
section: process-steps
title: Receive replacement request
status: draft
confidence: high
source: dcr-dtp-mockup.md
owner: Contact Centre Agent
systems: [SYS-DCR-002, SYS-DCR-003]
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-19
---
## What happens
The customer contacts the bank to report that their debit card is lost, stolen, or damaged and to request a replacement. The request arrives either through the Contact Centre, where an agent takes the call, or as a self-service request the customer raises in the mobile banking app.

## Inputs
- The customer's report that the card is lost, stolen, or damaged
- The customer identifier and the affected card number
- The channel the request arrives on — Contact Centre call or mobile app

## Outputs
- A logged replacement request carrying the reported reason
- A request ready for identity verification

## Why it matters
This is the entry point of the process; capturing the reported reason correctly determines whether a fraud check is needed and how urgently the card must be blocked.
