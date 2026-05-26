---
id: REQ-BGID-004
type: requirement
section: requirements
title: Facility Headroom Widget Must Display Real-Time Available Limit Before Application Entry
status: draft
confidence: high
source: SME interview — transformation-agent session 2026-05-26
reqType: FUNCTIONAL
moscow: MUST
derivedFrom: [TD-BGID-004]
addresses: []
provenance: {"Acceptance criteria": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}, "Rationale": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}, "Requirement": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}}
updatedBy: admin
updatedAt: 2026-05-26T09:28:32Z
---
## Requirement
The Corporate Portal must display the client's current available facility headroom — drawn from the live credit system — on the guarantee application screen before the client begins entering application details, with a data freshness timestamp showing the last refresh time.

## Rationale
The headroom widget must be visible before the client invests application effort; a post-submission warning does not prevent the stall scenario the dashboard is designed to eliminate, and a batch-refreshed widget may mislead a client applying on the same day as a limit change.

## Acceptance criteria
- Available headroom is displayed in the same currency as the guarantee being applied for, before any application field is entered
- The displayed value is refreshed from the credit system with a maximum staleness of 15 minutes; a staleness warning appears if the last refresh exceeded 15 minutes
- A client applying within their headroom proceeds to submission without a facility rejection at the credit check step
