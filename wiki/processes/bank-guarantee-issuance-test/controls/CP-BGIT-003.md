---
id: CP-BGIT-003
type: control
section: controls
title: Facility limit check
status: draft
confidence: medium
source: bank-guarantee-issuance-v1.md
controlType: PREVENTIVE
execution: AUTOMATED
owner: Trade Finance
step: [PS-BGIT-002]
provenance: {"Control activity": {"evidence": "Issuance is blocked in the Trade Finance System unless available facility limit covers the guarantee amount.", "source": "document"}, "Risk addressed": {"evidence": "M. Berger: standing approval", "source": "elicited"}, "Timing": {"evidence": "M. Berger: standing approval", "source": "elicited"}, "What it checks": {"evidence": "Issuance is blocked in the Trade Finance System unless available facility limit covers the guarantee amount.", "source": "document"}}
approval: in-progress
regulatedBy: [REG-BGIT-003, REG-BGIT-006]
---
## What it checks
Confirms that the client's available facility limit covers the guarantee amount before issuance can proceed.

## Control activity
Issuance is blocked in the Trade Finance System unless the available facility limit covers the guarantee amount.

## Risk addressed
Risk of issuing a guarantee that exceeds the client's approved credit limit, creating unplanned credit exposure.

## Timing
Checked in the Trade Finance System at Step 2 (Credit and facility check).
