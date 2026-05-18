---
id: PG-FR-007
type: process-gap
section: process-gaps
title: Integration footprint of the release systems undocumented
status: draft
confidence: high
source: SME interview - M. Berger
area: IT Architecture
gapStatus: open
affects: [SYS-FR-001, SYS-FR-003]
---
## The gap
The release systems have no documented integrations. SYS-FR-001 orchestrates four systems — it reads facility data from SYS-FR-005, sends items to SYS-FR-003, ties to SYS-FR-004 and posts to SYS-FR-002 — and SYS-FR-003 has an inbound feed of external sanctions lists. The integrations section is empty.

## Impact
Without documented integrations the data flows, interfaces and failure modes of the release systems cannot be reviewed, risk-assessed or maintained — including the external sanctions-list feed behind CP-FR-002's list-freshness exposure.

## Next step
In the IT Architect pass, document each integration as an integration element — SYS-FR-001 with SYS-FR-002/003/004/005, and SYS-FR-003's external OFAC, EU and UN sanctions-list feeds.
