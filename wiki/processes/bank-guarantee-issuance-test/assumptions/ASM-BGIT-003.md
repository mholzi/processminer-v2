---
id: ASM-BGIT-003
type: assumption
section: assumptions
title: Four-eyes approval model is preserved unchanged in the target state
status: draft
confidence: low
source: source-target — bank-guarantee-issuance-test wiki
assumptionStatus: OPEN
bearsOn: [TD-BGIT-004]
provenance: {"Impact if wrong": {"evidence": "", "source": "proposed"}, "The assumption": {"evidence": "", "source": "proposed"}, "Why it is unconfirmed": {"evidence": "", "source": "proposed"}}
---
## The assumption
The generation gate assumes the existing four-eyes approval model (CP-BGIT-001) is preserved unchanged in the target state. No modification to the approval workflow — such as AI-assisted pre-approval or threshold changes — is in scope for this transformation.

## Why it is unconfirmed
No decision has been taken on whether the approval workflow itself should change as part of the transformation. A future target-state decision modifying the approval structure would require a MaRisk BT 1 compliance re-assessment before implementation.

## Impact if wrong
If the approval model changes without a MaRisk re-assessment, the process would be non-compliant with REG-BGIT-004 (MaRisk BT 1 four-eyes principle), exposing Deutsche Bank to supervisory risk.
