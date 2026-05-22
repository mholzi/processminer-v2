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
---
## Description
Receives a new mandate from any channel (online banking, branch, paper-upload), validates the IBAN, looks up the creditor against the SEPA scheme, runs duplicate detection against active mandates, and writes an authoritative mandate record. Provides the canonical 'mandate created' event for downstream systems.

## Inputs and outputs
Inputs: party id, creditor id, IBAN, frequency, signature evidence. Outputs: a persisted mandate record with a stable mandate id, plus a 'mandate-created' event on the outbound bus.

## Boundaries
Does not handle collection scheduling (CAP-DDMM-008) or revocation (CAP-DDMM-005). Does not call the SEPA scheme directly — that happens at collection time.
