---
id: TS-BGI-002
type: target-state
section: to-be-design
title: Proactive Facility Management with Real-Time Headroom Alerts
status: draft
confidence: low
replaces: [PS-BGI-002]
---
## Target description
Rather than discovering a credit limit shortfall reactively at the credit check step, the process moves to proactive monitoring: the Trade Finance System continuously tracks guarantee facility utilisation for each client and automatically alerts the relationship manager and client when available headroom falls below a configurable threshold.

## What changes
- Facility headroom monitoring shifts from reactive (triggered by application) to proactive (continuous threshold-based alerts)
- Clients and RMs are notified before headroom becomes insufficient, enabling pre-emptive limit arrangements
- Credit check step remains but EX-BGI-001 referrals become the exception rather than a recurring pattern
- Reduces SLA breach frequency caused by credit referrals adding 2–5 business days

## Rationale
PP-BGI-001 is one of the two main causes of SLA breach. Moving headroom management upstream reduces exceptions without re-architecting the credit check step, and requires only configuration changes to an existing system.
