---
id: REQ-BGIT-001
type: requirement
section: requirements
title: API gateway accepts ICC-SWIFT C2B instructions and validates completeness before TFS entry
status: draft
confidence: low
source: source-target — bank-guarantee-issuance-test wiki
reqType: FUNCTIONAL
moscow: MUST
derivedFrom: [TD-BGIT-001]
addresses: [PG-BGIT-002, CG-BGIT-001]
---
## Requirement
The ICC-SWIFT API gateway must accept C2B guarantee instructions conforming to the ICC-SWIFT standard, map all mandatory fields to TFS intake fields, and validate completeness at the gateway boundary before the instruction enters TFS.

## Rationale
Structured intake is only delivered if the API gateway enforces the same mandatory fields as the manual completeness check; otherwise the digital channel replicates the incompleteness problem it is designed to solve.

## Acceptance criteria
- All ICC-SWIFT C2B mandatory fields map to TFS intake fields with no manual re-entry required
- Incomplete API instructions are rejected at the gateway with a structured error response before reaching TFS
- A shadow run on 30 days of live applications validates the completeness false-positive rate below 2%
