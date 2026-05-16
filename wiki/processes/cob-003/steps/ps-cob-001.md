---
id: PS-COB-001
type: process-step
section: process-steps
title: Application Receipt & Initial Triage
status: confirmed
confidence: high
source: DTP-BB-ONB-001 v2.3
sequence: 1
owner: Operations Officer
sla: Same business day
systems: [SYS-COB-001, SYS-COB-002, SYS-COB-007]
approval: in-progress
approvalBy: M. Berger
approvalDate: 2026-05-16
---
## What happens
The Operations Officer receives the incoming application from one of the four intake channels and performs an initial triage. They confirm the mandatory documents are present, that the business is eligible for BizBanking, and that the case is routed to the correct downstream queue. Incomplete applications are flagged and returned to the client before they consume pipeline capacity.fghfh

## Inputs
A submitted client application (online portal, paper, branch referral or partner channel) together with whatever supporting documents the client attached.

## Outputs
A triaged application that has formally entered the pipeline with a CRM case record — or a rejection sent back to the client listing exactly what was missing.

## Why it matters
This is the gate that protects the rest of the process. Catching an incomplete or ineligible application here costs minutes; catching it three steps later costs days of rework and a frustrated client.
