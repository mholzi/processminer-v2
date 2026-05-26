---
id: PG-SP-002
type: process-gap
section: process-gaps
title: Mixed-rail bulk file handling undefined
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
area: As-Is process
gapStatus: open
affects: [PS-SP-006, PS-SP-008]
provenance: {"Impact": {"evidence": "", "source": "proposed"}, "Next step": {"evidence": "§10 open question: 'What happens when a bulk file mixes instant-eligible and standard items?'; §8 systems table: 'Payment Hub — Validation, routing, orchestration, message generation'", "source": "document"}, "The gap": {"evidence": "§5.1 step 1: 'Bulk files arrive as pain.001 messages'; §5.1 step 6: routing logic documented only for individual items with no mention of mixed-rail bulk files; §10 open question: 'What happens when a bulk file mixes instant-eligible and standard items?'", "source": "document"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:00Z
---
## The gap
The document describes routing logic for single payments but is silent on what happens when a corporate bulk payment file (pain.001) contains a mix of items — some eligible for SCT Inst and some that must travel the standard SCT rail. No split, sequencing or fallback behaviour is documented for this scenario.

## Impact
Without a defined handling rule, operations staff have no documented procedure to follow when a mixed-rail file is received. Both the routing decision (ps-6) and CSM submission (ps-8) are affected.

## Next step
Confirm with the SME whether mixed bulk files are split automatically by the Payment Hub, processed entirely on the standard rail, or rejected. Document the rule and add it to the routing-decision step and the bulk-file submission step.
