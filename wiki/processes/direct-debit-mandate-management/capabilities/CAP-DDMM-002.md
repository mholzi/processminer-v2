---
id: CAP-DDMM-002
type: capability
section: capabilities
title: Mandate lifecycle
status: draft
confidence: high
criticality: HIGH
reuse: NEW
owningDomain: Payments · Mandate management
hostedIn: [TGTAPP-DDMM-001]
provenance: {"Boundaries": {"evidence": "", "source": "proposed"}, "Description": {"evidence": "", "source": "proposed"}, "Inputs and outputs": {"evidence": "", "source": "proposed"}}
---
## Description
Owns mandate state transitions across its lifetime — active, paused, revoked, lapsed. Enforces SEPA-mandated rules (e.g. a mandate not used in 36 months auto-lapses; revocation requires party authentication). Emits one canonical event per state transition.

## Inputs and outputs
Inputs: state-change requests (party-initiated, scheme-initiated, time-triggered). Outputs: updated mandate record, lifecycle event on the outbound bus, audit log entry.

## Boundaries
Does not own collection scheduling. Does not perform party authentication itself — delegates to the identity service. Does not write to the general ledger; emits events for the ledger to consume.
