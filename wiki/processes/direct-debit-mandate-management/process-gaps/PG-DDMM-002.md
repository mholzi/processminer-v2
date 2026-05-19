---
id: PG-DDMM-002
type: process-gap
section: process-gaps
title: Handling When Creditor CI Is Deactivated
status: draft
confidence: high
source: ddmm-dtp-mockup.md
area: Exception Handling
gapStatus: OPEN
affects: [PS-DDMM-002]
provenance: {"Impact": {"evidence": "SME (M. Vogel) confirmed: reactive-only handling — mandates only surface via R-transaction or creditor query; ad hoc resolution.", "source": "elicited"}, "Next step": {"evidence": "SME confirmed: procedure needs to be defined for suspended, cancelled, or retained mandate handling on CI deactivation.", "source": "elicited"}, "The gap": {"evidence": "SME confirmed: no automated mandate review on CI deactivation — purely reactive. Procedure for existing mandates under a deactivated CI is genuinely undocumented.", "source": "elicited"}}
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## The gap
The process describes validation of whether a Creditor Identifier is active, but does not document what happens to existing active mandates when the creditor's CI is itself deactivated after registration.

## Impact
Existing active mandates under a deactivated CI are not proactively reviewed; they surface only reactively via an R-transaction or creditor query. The handling procedure is undocumented and ad hoc.

## Next step
Define and document a procedure for existing active mandates when a creditor's CI is deactivated — specifying whether mandates are suspended, cancelled, or retained pending creditor action.
