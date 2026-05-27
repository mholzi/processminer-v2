---
id: TS-BGID-003
type: target-state
section: to-be-design
title: AI Wording Pre-Screener with Committed Legal-Review SLA and Queue Visibility
status: draft
confidence: high
source: SME interview — transformation-agent session 2026-05-26
replaces: [PS-BGID-003]
systems: [SYS-BGID-002]
updatedBy: admin
updatedAt: 2026-05-26T09:27:02Z
---
## Target description
An AI wording pre-screener classifies incoming guarantee wording against the bank's approved template library. Standard wording is auto-approved and advances to the credit check. Bespoke wording enters Legal review with a published maximum SLA of five business days; the client receives a milestone notification when the review begins and an alert if the SLA is at risk. Legal's queue is visible to the TFO in the Trade Finance System dashboard.

## What changes
- An AI pre-screener classifies wording as standard (auto-approved) or bespoke (Legal review) within one business day
- A published maximum SLA of five business days applies to all bespoke Legal reviews
- The client receives a milestone notification when Legal begins review and an SLA-at-risk alert if the deadline approaches
- Legal's review queue is surfaced to the TFO in the TFS dashboard
- Standard-wording cases no longer enter the Legal queue, reducing Legal's workload on routine applications

## Rationale
The AI pre-screener removes Legal from the standard-wording path entirely, reserving Legal capacity for genuinely bespoke cases; the SLA commitment converts the most trust-eroding wait in the process into a predictable, visible timeline for the client.
