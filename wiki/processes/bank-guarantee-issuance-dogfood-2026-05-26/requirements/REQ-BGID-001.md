---
id: REQ-BGID-001
type: requirement
section: requirements
title: Portal validates intake fields and routes qualifying applications to fast lane
status: draft
confidence: low
source: wiki-synthesis-2026-05-26
reqType: FUNCTIONAL
moscow: MUST
derivedFrom: [TD-BGID-001]
addresses: [PP-BGID-001, PP-BGID-003]
provenance: {"Acceptance criteria": {"evidence": "", "source": "proposed"}, "Rationale": {"evidence": "", "source": "proposed"}, "Requirement": {"evidence": "", "source": "proposed"}}
updatedBy: admin
updatedAt: 2026-05-26T20:15:01Z
---
## Requirement
The Corporate Portal must validate the commercial contract reference, beneficiary details, wording-type flag and real-time facility headroom at submission, and must automatically route applications that pass all checks to the same-day fast lane.

## Rationale
The manual credit and facility check is the most common delay source. Absent portal validation is the root cause of PP-BGID-001 and PP-BGID-003. Automating this gate is the core enabling requirement for the fast lane.

## Acceptance criteria
- Applications with an invalid or blank commercial contract reference are rejected at submission with an inline error message.
- Applications where the requested amount exceeds available facility are flagged at submission and routed to the Credit team queue without officer intervention.
- Applications passing all portal checks are advanced to the TFS fast-lane queue within 60 seconds of submission.
- Portal validation rules are maintained and versioned by the Trade Finance team.
