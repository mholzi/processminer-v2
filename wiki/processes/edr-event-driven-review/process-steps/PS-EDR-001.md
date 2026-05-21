---
id: PS-EDR-001
type: process-step
section: process-steps
title: Capture the event
status: draft
confidence: high
source: event-driven-review.md
owner: Financial Crime Analyst (1LoD)
sla: Within 2 business days of event
condition: A triggering event has been raised against a live customer
transitions: [PS-EDR-002|normal|always]
systems: [SYS-EDR-001]
provenance: {"Inputs": {"evidence": "", "source": "proposed"}, "Outputs": {"evidence": "the Financial Crime Analyst opens an EDR case in the case-management system. Event source, severity, and date are recorded.", "source": "document"}, "What happens": {"evidence": "When a triggering event is identified, the Financial Crime Analyst opens an EDR case in the case-management system. Event source, severity, and date are recorded.", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-21
---
## What happens
When a triggering event is identified, the Financial Crime Analyst opens an EDR case in the case-management system. The event source, severity, and date are recorded.

## Inputs
- Triggering event (TM alert escalation, sanctions/PEP/adverse-media hit, fraud incident, material customer data change, or external referral)
- Current risk rating

## Outputs
- EDR case opened in case-management system
- Event source, severity, and date recorded

## Why it matters
Ensures every review event is formally captured and tracked from the outset, establishing an audit trail and starting the SLA clock.
