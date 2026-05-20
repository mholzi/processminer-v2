---
id: PG-CAC-001
type: process-gap
section: process-gaps
title: Callback threshold currency basis undefined
status: draft
confidence: high
source: account-closure-dtp-mockup.md
area: Process Design
gapStatus: open
affects: [PS-CAC-005]
provenance: {"Impact": {"evidence": "Auto-approve: internally coherent and conformant. — M. Berger", "source": "elicited"}, "Next step": {"evidence": "Is the EUR 250k callback threshold a fixed EUR equivalent or per-currency?", "source": "document"}, "The gap": {"evidence": "", "source": "proposed"}}
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-19
---
## The gap
The EUR 100,000 verification threshold for callback confirmation during residual balance disbursement (lowered from EUR 250,000 per Q2 controls review, 2026-05-19) does not specify whether it is a fixed EUR equivalent across all currencies or a per-currency nominal amount.

## Impact
The callback control may be applied inconsistently across currencies, potentially skipping the check for large non-EUR disbursements or triggering it unnecessarily for smaller ones.

## Next step
Confirm with the process owner whether the threshold is a fixed EUR equivalent or defined per currency.
