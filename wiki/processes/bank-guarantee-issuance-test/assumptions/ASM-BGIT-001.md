---
id: ASM-BGIT-001
type: assumption
section: assumptions
title: Corporate clients will adopt ICC-SWIFT C2B API within the transformation planning horizon
status: draft
confidence: low
source: source-target — bank-guarantee-issuance-test wiki
assumptionStatus: OPEN
bearsOn: [TD-BGIT-001]
---
## The assumption
The target intake model assumes that a material share of corporate clients will connect their ERP or treasury system to the ICC-SWIFT C2B API within the planning horizon, making structured digital intake the primary channel rather than a niche capability.

## Why it is unconfirmed
Client-side API adoption depends on each client's ERP vendor roadmap, treasury system capabilities and willingness to invest in integration. No client commitments to the ICC-SWIFT standard have been confirmed for Deutsche Bank at the time of this draft.

## Impact if wrong
If clients do not adopt the standard, the API channel is unused and the intake completeness benefits (CG-BGIT-001, PP-BGIT-003) are not realised; the portal remains the primary channel with its existing manual check.
