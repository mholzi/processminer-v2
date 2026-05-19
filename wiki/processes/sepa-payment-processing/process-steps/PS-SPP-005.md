---
id: PS-SPP-005
type: process-step
section: process-steps
title: Fraud screening
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
owner: Fraud Engine
systems: [SYS-SPP-005]
provenance: {"Inputs": {"evidence": "The payment is scored in real time by the fraud engine.", "source": "document"}, "Outputs": {"evidence": "yes on both — a released fraud hold loops back to the funds check, then goes straight to routing", "source": "elicited"}, "What happens": {"evidence": "yes on both — a released fraud hold loops back to the funds check, then goes straight to routing", "source": "elicited"}, "Why it matters": {"evidence": "If flagged high-risk -> see Exception E-4. ... High fraud score | Payment held; customer contacted for step-up verification", "source": "document"}}
transitions: [PS-SPP-006|normal|when the fraud score is acceptable, EX-SPP-004|exception|when the payment is flagged high-risk]
approval: approved
approvalBy: Markus
approvalDate: 2026-05-18
---
## What happens
The payment is scored in real time by the fraud engine. Low-risk items pass automatically; items scored as high-risk are held for review and step-up verification. A held payment that passes step-up verification is released and loops back to the funds check for a fresh cover check, then continues straight to routing.

## Inputs
- Screened payment instruction
- Real-time fraud-scoring model

## Outputs
- Low-risk payment passed to the routing decision
- High-risk payment held for review under Exception E-4
- Released payment looped back to the funds check, then on to routing

## Why it matters
Real-time scoring catches fraudulent payments before they are routed and submitted; high-risk items route to Exception E-4 for step-up verification.
