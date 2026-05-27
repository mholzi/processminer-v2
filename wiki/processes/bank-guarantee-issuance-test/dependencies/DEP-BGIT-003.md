---
id: DEP-BGIT-003
type: process-dependency
section: dependencies
title: Credit team facility-limit check
status: draft
confidence: high
source: transformation-agent — M. Berger, 2026-05-20
direction: UPSTREAM
atStep: [PS-BGIT-002]
viaSystem: [SYS-BGIT-002]
---
## The dependency
The Trade Finance Operations team depends on the Credit team to confirm that the client's guarantee facility has sufficient headroom before the application can advance beyond the credit check stage at PS-BGIT-002.

## What crosses the boundary
Inbound to the process: a credit-decision response (approve, decline or refer) indicating available facility headroom and any conditions. The credit team consumes the application reference and requested guarantee amount submitted by Trade Finance Operations.

## Why it matters
The credit check is the primary source of queue-time variability: no SLA governs the Credit team's response, so a two-hour wait and a two-day wait are equally possible. This dependency is the root cause of PP-BGIT-001 and PG-BGIT-001.
