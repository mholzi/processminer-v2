---
id: JT-DDMM-003
type: cx-touchpoint
section: touchpoints
title: Receive Validation Rejection
status: draft
confidence: high
source: ddmm-client-journey-specialist
channel: CH-DDMM-001
occursAt: [PS-DDMM-002]
provenance: {"Experience": {"evidence": "SME confirmed: no remediation guidance is provided; especially confusing for ambiguous codes such as inactive CI or type/sequence mismatch; creditors must diagnose and correct without bank assistance.", "source": "elicited"}, "What the bank does": {"evidence": "SME confirmed: valid mandates in a bulk file proceed independently under SLA.", "source": "elicited"}, "What the client does": {"evidence": "SME (M. Vogel): portal shows structured reason code plus short standard human-readable description; for bulk files, a line-item rejection list per UMR alongside accepted/rejected counts.", "source": "elicited"}}
---
## What the client does
The creditor reviews the rejection notification in the portal — a reason code and short standard description for single mandates, or a line-item rejection list per UMR for bulk files — then corrects and resubmits the affected mandates.

## What the bank does
The portal surfaces the structured rejection with reason code and human-readable description; valid mandates in a bulk file proceed independently under SLA.

## Experience
The reason code and description give a starting point, but no remediation guidance is provided — especially confusing for ambiguous codes such as inactive CI or type/sequence mismatch. Creditors must diagnose and correct without bank assistance.
