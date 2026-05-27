---
id: ASM-BGID-001
type: assumption
section: assumptions
title: ICC-SWIFT API Standard Is Stable Over the Three-Year Transformation Horizon
status: draft
confidence: high
source: SME interview — transformation-agent session 2026-05-26
assumptionStatus: OPEN
bearsOn: [TD-BGID-001, TS-BGID-001, TS-BGID-006]
updatedBy: admin
updatedAt: 2026-05-26T09:28:32Z
---
## The assumption
The ICC Trade Finance API standard is sufficiently stable over the three-year transformation horizon to build the bank's API channel against without requiring significant rework to maintain ERP and beneficiary-bank interoperability.

## Why it is unconfirmed
The ICC Trade Finance API standard is under active development; the roadmap beyond version 1.0 has not been published and the pace at which beneficiary banks adopt a compatible implementation is not yet observable from market data.

## Impact if wrong
A material version change in the standard requires rework of the API channel implementation; estimated remediation is six to twelve months of additional development, delaying TS-BGID-001 and TS-BGID-006 delivery.
