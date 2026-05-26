---
id: DEP-BGID-002
type: process-dependency
section: dependencies
title: Beneficiary Bank — SWIFT MT760 Acknowledgement
status: draft
confidence: high
source: SME interview — transformation-agent session 2026-05-26
direction: DOWNSTREAM
atStep: [PS-BGID-006]
viaSystem: [SYS-BGID-004]
provenance: {"The dependency": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}, "What crosses the boundary": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}, "Why it matters": {"evidence": "standard EU corporate-banking trade-finance modernisation thesis, SME validated", "source": "elicited"}}
updatedBy: admin
updatedAt: 2026-05-26T09:28:32Z
---
## The dependency
The beneficiary's bank — accessed via the SWIFT network — is the downstream consumer of the MT760 guarantee instrument and the source of the MT760 acknowledgement that closes the client delivery confirmation loop in TS-BGID-006.

## What crosses the boundary
The MT760 guarantee instrument is transmitted to the beneficiary's bank via SWIFT; the beneficiary's bank returns an acknowledgement message that the bank's SWIFT operations layer captures and forwards to the client as a portal notification and, for API-connected clients, as an ERP callback.

## Why it matters
Without the SWIFT acknowledgement, the client notification feature of TS-BGID-006 cannot be delivered and FP-BGID-004 remains open; delivery of the acknowledgement depends on the beneficiary bank's SWIFT configuration, which is outside the bank's control.
