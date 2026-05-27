---
id: DEP-BGIT-001
type: process-dependency
section: dependencies
title: Corporate client ERP and treasury system — upstream guarantee instruction source
status: draft
confidence: low
source: source-target — bank-guarantee-issuance-test wiki
direction: UPSTREAM
atStep: [PS-BGIT-001]
viaSystem: [SYS-BGIT-001]
---
## The dependency
Corporate clients submit guarantee instructions from their ERP, treasury management system or directly via the Corporate Portal. In the target state, ICC-SWIFT-connected clients transmit structured C2B API instructions without portal interaction.

## What crosses the boundary
Inbound: structured guarantee instruction including beneficiary details, amount, currency, validity period, wording type and underlying commercial contract reference. Outbound to client: application acknowledgement, status updates and the issued guarantee confirmation once delivered.

## Why it matters
The quality of client-side data determines the benefit realised from the digital intake investment. Incomplete or non-standard instructions stall the process at intake — the root cause of PP-BGIT-003 — regardless of the channel used.
