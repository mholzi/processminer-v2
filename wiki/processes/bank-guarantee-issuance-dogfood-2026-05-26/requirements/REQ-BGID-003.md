---
id: REQ-BGID-003
type: requirement
section: requirements
title: Portal displays live milestone status within 60 seconds of TFS event
status: draft
confidence: low
source: wiki-synthesis-2026-05-26
reqType: FUNCTIONAL
moscow: SHOULD
derivedFrom: [TD-BGID-003]
addresses: []
provenance: {"Acceptance criteria": {"evidence": "", "source": "proposed"}, "Rationale": {"evidence": "", "source": "proposed"}, "Requirement": {"evidence": "", "source": "proposed"}}
updatedBy: admin
updatedAt: 2026-05-26T20:15:01Z
---
## Requirement
The Corporate Portal must display all six process milestones — intake, credit, wording, screening, approval, delivery — with timestamps and responsible function, and must refresh milestone status within 60 seconds of the underlying TFS status event.

## Rationale
CXB-BGID-004 shows 83% of corporates rate real-time visibility as high value. A 60-second threshold ensures the feed is genuinely live rather than a stale batch update, meeting the corporate expectation the benchmark establishes.

## Acceptance criteria
- All six process milestones are visible to the corporate client and the RM in the portal dashboard.
- Status changes in TFS are reflected in the portal within 60 seconds under peak-volume load of 150 applications per month.
- Push notifications are delivered to the client at the issuance approval and SWIFT delivery milestones.
