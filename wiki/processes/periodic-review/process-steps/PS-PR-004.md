---
id: PS-PR-004
type: process-step
section: process-steps
title: Targeted Outreach
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
owner: Client Outreach Service
sla: 30-day hard timeout before fallback to RM-mediated outreach
condition: STP ineligible due to missing or stale data that requires client response
systems: [SYS-PR-007, SYS-PR-001]
---
## What happens
The Client Outreach Service computes the minimal data delta — what is missing or stale — and asks the client for only that. No re-collection of documents the bank holds. The primary channel is the mobile app; secure message is the secondary; RM-mediated outreach is reserved for Private Banking. Outreach uses a single thread with a hard 30-day timeout, falling back to RM-mediated outreach if the client does not respond digitally. Example: 'We last saw your ID in 2021 and it expires in July. Please upload an in-date copy and take a 30-second selfie video.'

## Inputs
- STP ineligibility reason code identifying the missing or stale data items
- Pre-filled case with existing data to avoid re-requesting held information
- Client channel preference (mobile app / secure message / RM)

## Outputs
- Client-supplied data delta (documents or confirmations) appended to the case
- Escalation flag if 30-day timeout expires without digital response

## Why it matters
Targeted outreach based on the minimal data delta removes the friction of re-uploading documents the bank already holds, reducing outreach rate from 91% to a target of 38% by Year 1 and cutting median completion time to under 1 day.
