---
id: TS-CAC-004
type: target-state
section: to-be-design
title: Codified and system-enforced closure edge-case parameters
status: draft
confidence: medium
source: M. Berger; source-target synthesis — corporate-account-closure wiki
replaces: [PS-CAC-001, PS-CAC-005, PS-CAC-007]
provenance: {"Rationale": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}, "Target description": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}, "What changes": {"evidence": "", "source": "proposed"}}
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-19
---
## Target description
Three currently undocumented process parameters — the dormancy threshold, the callback threshold currency basis, and the closure reversal window — are codified in policy and enforced through system configuration: Core Banking monitors dormancy automatically against the documented threshold; the Payments Platform applies real-time FX normalisation to disbursements and triggers the callback consistently regardless of currency; and the Client Lifecycle Workflow Tool provides a digital, time-bound reversal path for erroneous closures.

## What changes
- The dormancy threshold is defined in policy and automated in Core Banking — dormancy case creation is system-triggered, not reliant on a manual review output (resolves PG-CAC-002)
- The EUR 100,000 callback threshold is defined as EUR-equivalent with real-time FX normalisation in the Payments Platform, eliminating currency-basis ambiguity (resolves PG-CAC-001)
- A time-bound digital reversal workflow (T+5 business days or equivalent) is configured in the Client Lifecycle Workflow Tool and Core Banking System, providing a defined, auditable recovery path for erroneous closures (resolves PG-CAC-004)

## Rationale
All three parameters are undocumented today (PG-CAC-001, PG-CAC-002, PG-CAC-004), creating operational inconsistency and client-harm risk. Codifying each in policy is a prerequisite; system-enforcing each is low-to-medium complexity and eliminates the ambiguity entirely.
