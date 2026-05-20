---
id: CP-BGI-003
type: control
section: controls
title: Facility Limit Check
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
controlType: PREVENTIVE
execution: AUTOMATED
owner: Trade Finance Manager
step: [PS-BGI-005]
provenance: {"Control activity": {"evidence": "No emergency bypass in the system. The only path to issue above the limit is via a Credit-approved temporary limit increase (EX-BGI-001 resolution), which adjusts the limit and lets the block clear normally. The hard block itself is unconditional.", "source": "elicited"}, "Risk addressed": {"evidence": "Confirm and tighten — change to 'Uncovered credit exposure: issuing a guarantee that exceeds the client's approved facility and breaches delegated credit authority.'", "source": "elicited"}, "Timing": {"evidence": "The system-enforced hard block is control C3 (CP-BGI-003) and it fires at issuance, not here", "source": "elicited"}, "What it checks": {"evidence": "Issuance is blocked in the Trade Finance System unless available facility limit covers the guarantee amount.", "source": "document"}}
approval: in-progress
regulatedBy: [REG-BGI-003, REG-BGI-004]
---
## What it checks
That the client's available guarantee facility limit covers the requested guarantee amount before issuance is permitted to proceed.

## Control activity
Issuance is blocked in the Trade Finance System unless the available facility limit covers the guarantee amount. The block is unconditional — no emergency bypass exists; the only path to proceed is via a Credit-approved temporary limit increase (EX-BGI-001), which adjusts the limit and allows the block to clear normally.

## Risk addressed
Uncovered credit exposure: issuing a guarantee that exceeds the client's approved facility and breaches delegated credit authority.

## Timing
Enforced at issuance (step 5) for every application — a system-enforced hard block, not the manual look-up at step 2.
