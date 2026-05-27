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
---
## What the client does
The creditor reviews the rejection notification in the portal — a reason code and short standard description for single mandates, or a line-item rejection list per UMR for bulk files — then corrects and resubmits the affected mandates.

## What the bank does
The portal surfaces the structured rejection with reason code and human-readable description; valid mandates in a bulk file proceed independently under SLA.

## Experience
The reason code and description give a starting point, but no remediation guidance is provided — especially confusing for ambiguous codes such as inactive CI or type/sequence mismatch. Creditors must diagnose and correct without bank assistance.
