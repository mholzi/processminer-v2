---
id: DEP-BGID-001
type: process-dependency
section: dependencies
title: Credit and Facility Management System — Real-Time Headroom Feed
status: draft
confidence: high
source: SME interview — transformation-agent session 2026-05-26
direction: UPSTREAM
atStep: [PS-BGID-002]
viaSystem: [SYS-BGID-002]
updatedBy: admin
updatedAt: 2026-05-26T09:28:32Z
---
## The dependency
The bank's credit and facility management system — operated by the Credit function — is an upstream dependency providing real-time facility limit and utilisation data to the guarantee process at the credit and facility check step.

## What crosses the boundary
The client's available facility headroom, current utilisation amount, facility currency and facility reference number are fed from the credit system into the Corporate Portal's headroom widget in real time at the start of every guarantee application session and at the automated credit check.

## Why it matters
If the credit system feed is unavailable or stale, the headroom widget may display inaccurate data; a client who sees sufficient headroom but is rejected at the automated credit check experiences the stall the dashboard is designed to prevent.
