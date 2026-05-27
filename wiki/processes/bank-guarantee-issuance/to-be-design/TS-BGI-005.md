---
id: TS-BGI-005
type: target-state
section: to-be-design
title: Resilient Issuance Approval with Digital Delegation
status: draft
confidence: low
replaces: [PS-BGI-005]
---
## Target description
The issuance approval step operates with a formally documented deputy policy: when the primary TFM is unavailable, the Trade Finance System routes applications to the designated deputy, preventing the approval queue from stalling. The EUR 5 million escalation path includes a documented cover arrangement for the Head of Trade Finance.

## What changes
- Formal deputy approval policy documented for both TFM and Head of Trade Finance roles
- Trade Finance System configured to route to the designated deputy when primary approver is unavailable
- Approval queue no longer stalls on TFM absence
- EUR 5 million escalation path includes a cover arrangement so Head of TF absence does not block high-value applications

## Rationale
PP-BGI-005 is a structural bottleneck from a single point of authority with no documented cover. Formalising the deputy policy and configuring system routing resolves it with low implementation risk and no headcount change.
