---
id: CAP-BGID-007
type: capability
section: capabilities
title: SWIFT MT760 Issuance & Acknowledgement
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
criticality: HIGH
reuse: NEW
owningDomain: Trade Finance
hostedIn: [TGTAPP-BGID-001]
realisesStep: [TS-BGID-006]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:00:11Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Description
Generates the guarantee instrument in SWIFT MT760 format, dispatches it via the SWIFT network to the beneficiary's bank, and captures the inbound MT760 acknowledgement. Forwards the acknowledgement to the client as a portal notification or ICC-SWIFT API callback depending on the client's channel. Designed to support MLETR-compliant electronic delivery as a future mode.

## Inputs and outputs
Inputs: approved guarantee record from four-eyes authorisation, beneficiary bank BIC, delivery channel preference. Outputs: MT760 message dispatched, SWIFT acknowledgement record, client delivery confirmation event, issuance record for archival.

## Boundaries
Does not perform the four-eyes approval — receives an approved record. Does not manage collateral blocking. Does not archive the final guarantee instrument — the archival capability handles retention.
