---
id: REQ-BGIT-004
type: requirement
section: requirements
title: TFS blocks guarantee generation and SWIFT dispatch without valid TFM approval record
status: draft
confidence: low
source: source-target — bank-guarantee-issuance-test wiki
reqType: FUNCTIONAL
moscow: MUST
derivedFrom: [TD-BGIT-004]
addresses: [CG-BGIT-002]
---
## Requirement
The Trade Finance System must prevent the generation and SWIFT dispatch of a guarantee document unless a valid, timestamped TFM approval record exists for that transaction in TFS at the time of generation.

## Rationale
A hard gate is the only mechanism that closes CG-BGIT-002 with certainty; a soft warning or audit reconciliation allows unapproved issuance to occur before detection, which is the exact failure mode the control must prevent.

## Acceptance criteria
- Attempting generation without a TFM approval record produces a system-level block, not a warning
- The approval record is linked to the generated document and retained for the guarantee validity period plus the applicable regulatory retention requirement
- No guarantee can be dispatched via SWIFT without first passing the generation gate check in TFS
