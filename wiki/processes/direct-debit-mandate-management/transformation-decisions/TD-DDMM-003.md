---
id: TD-DDMM-003
type: transformation-decision
section: transformation-decisions
title: Publish Stage-Level Mandate Events and Opt-In Push Notifications
status: draft
confidence: high
source: ddmm-transformation-agent
decisionType: TECHNOLOGY
decisionStatus: DECIDED
resolves: [FP-DDMM-003, FP-DDMM-004, FP-DDMM-006]
realises: [TS-DDMM-003]
fromIdea: [II-DDMM-002]
provenance: {"Options considered": {"evidence": "SME confirmed options and rationale — accepted without edit.", "source": "elicited"}, "Rationale": {"evidence": "SME confirmed rationale — accepted without edit.", "source": "elicited"}, "The decision": {"evidence": "SME (M. Vogel) accepted all ten decisions without edit.", "source": "elicited"}}
---
## The decision
Enrich MMS to emit stage-level events at key processing milestones, surface them in the Creditor Portal as a live mandate timeline, and offer opt-in email and webhook push notifications for action-required events.

## Options considered
- Expand polling-based status page with more detail (no event model, still requires login)
- Stage-level MMS event emission with portal timeline and opt-in push (chosen)
- Proactive outbound email-only notification (no portal timeline, different channel risk)

## Rationale
A richer polling page still requires login to discover changes. Email-only push leaves creditors without a reference timeline. Stage events plus opt-in push addresses both: passive visibility in the portal and proactive notification at action-required milestones.
