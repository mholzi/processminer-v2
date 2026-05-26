---
id: TS-BGID-006
type: target-state
section: to-be-design
title: Guarantee Delivery with Client-Facing MT760 Acknowledgement and MLETR-Ready Channel
status: draft
confidence: high
source: SME interview — transformation-agent session 2026-05-26
replaces: [PS-BGID-006]
systems: [SYS-BGID-002, SYS-BGID-004]
provenance: {"Rationale": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}, "Target description": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}, "What changes": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}}
updatedBy: admin
updatedAt: 2026-05-26T09:27:02Z
---
## Target description
The bank's SWIFT operations layer automatically forwards the MT760 acknowledgement from the beneficiary's bank to the client as a portal notification, closing the delivery confirmation gap. ERP-connected clients receive the MT760 instrument and acknowledgement via the API channel. The guarantee-generation pipeline is designed to support MLETR-compliant electronic records delivery as a future mode for eligible guarantees, positioning the bank for the regulatory shift already underway in several EU jurisdictions.

## What changes
- The SWIFT MT760 acknowledgement from the beneficiary's bank is automatically forwarded to the client as a portal notification
- ERP-connected clients receive the MT760 instrument and acknowledgement status via the API channel into their ERP
- The guarantee-generation pipeline is designed for MLETR-compliant electronic records delivery as a future delivery mode
- The TFO's manual delivery confirmation step is automated for the SWIFT channel

## Rationale
Forwarding the SWIFT acknowledgement closes FP-BGID-004 with minimal operational change; MLETR-readiness positions the bank for the regulatory shift to electronic demand guarantees, supported by TR-BGID-002 and TR-BGID-005.
