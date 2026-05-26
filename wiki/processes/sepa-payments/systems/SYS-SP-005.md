---
id: SYS-SP-005
type: system
section: systems
title: Fraud Engine
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
provenance: {"Purpose": {"evidence": "§8 Systems & Data: 'Fraud Engine | Real-time fraud scoring'; §5.1 step 5: 'The payment is scored in real time by the fraud engine'", "source": "document"}, "Role in this process": {"evidence": "", "source": "proposed"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:09:11Z
systemType: SUPPORTING
---
## Purpose
Real-time fraud scoring of individual payment instructions.

## Role in this process
Called by the Payment Hub at the Fraud Screening step (ps-5). Scores each payment in real time; low-risk items pass automatically; high-risk items are held and routed to the Fraud team for step-up verification.
