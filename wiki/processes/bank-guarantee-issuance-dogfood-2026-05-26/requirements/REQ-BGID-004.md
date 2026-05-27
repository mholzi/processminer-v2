---
id: REQ-BGID-004
type: requirement
section: requirements
title: TFS generates ISO 20022 messages with MT760 fall-back by beneficiary-bank tier
status: draft
confidence: low
source: wiki-synthesis-2026-05-26
reqType: FUNCTIONAL
moscow: MUST
derivedFrom: [TD-BGID-004]
addresses: []
updatedBy: admin
updatedAt: 2026-05-26T20:15:01Z
---
## Requirement
The Trade Finance System must generate ISO 20022 guarantee messages for all ISO 20022-ready beneficiary banks and must fall back to MT760 for non-ready banks, with routing driven by a maintained beneficiary-bank readiness table.

## Rationale
TR-BGID-002 establishes a mandatory SWIFT November 2027 deadline. A tiered fall-back manages the beneficiary-bank readiness risk documented in IR-BGID-003 and prevents delivery failures from premature ISO 20022 transmission.

## Acceptance criteria
- The beneficiary-bank readiness table is reviewed and updated at least monthly.
- ISO 20022 messages are schema-validated before transmission for all ready beneficiary banks.
- MT760 fall-back is triggered automatically with no manual intervention for non-ready banks.
- Zero delivery NAKs attributable to format errors on the issuing bank's side after go-live.
