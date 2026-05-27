---
id: EX-PR-001
type: exception
section: exceptions
title: Outreach non-response — 30-day timeout
status: draft
confidence: medium
source: periodic-kyc-review-dtp.pdf
category: outreach-timeout
impact: MEDIUM
handlingOwner: Relationship Manager
---
## Description
When a client does not respond to the targeted digital outreach within the hard 30-day timeout window, the single-thread outreach channel is considered exhausted and the exception is raised. At Step 4, the Outreach Service has sent the data-delta request and received no reply.

## Handling
The system falls back to RM-mediated outreach once the 30-day timeout expires. The Relationship Manager takes over the outreach using the same data-minimised payload — asking only for the specific missing or stale information — rather than restarting a full collection cycle.

## Impact
The non-response causes a delay to the review cycle and generates additional RM effort that the target process is designed to minimise. It adds manual handoff cost and extends overall cycle time beyond the target median.
