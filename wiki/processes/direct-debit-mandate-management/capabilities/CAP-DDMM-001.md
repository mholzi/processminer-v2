---
id: CAP-DDMM-001
type: capability
section: capabilities
title: Mandate capture & validation
status: draft
confidence: high
criticality: HIGH
reuse: NEW
owningDomain: Payments · Mandate management
hostedIn: [TGTAPP-DDMM-001]
provenance: {"Boundaries": {"evidence": "", "source": "proposed"}, "Description": {"evidence": "", "source": "proposed"}, "Inputs and outputs": {"evidence": "", "source": "proposed"}}
updatedBy: admin
updatedAt: 2026-05-24T09:11:50Z
---
## Description
Receives a new mandate from any channel (online banking, branch, paper-upload), validates the IBAN, looks up the creditor against the SEPA scheme, runs duplicate detection against active mandates, and writes an authoritative mandate record. Provides the canonical 'mandate created' event for downstream systems.

## Inputs and outputs
Inputs: party id, creditor id, IBAN, frequency, signature evidence. Outputs: a persisted mandate record with a stable mandate id, plus a 'mandate-created' event on the outbound bus.

## Boundaries
Does not schedule collections (CAP-DDMM-008), process revocations (CAP-DDMM-005), or handle dispute resolution (disputes team). SEPA scheme calls occur at collection time, not here.
