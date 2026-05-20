---
id: PG-DDMM-004
type: process-gap
section: process-gaps
title: IBAN Amendment — New Mandate or In-Place Change?
status: draft
confidence: high
source: ddmm-dtp-mockup.md
area: Scheme Compliance
gapStatus: open
affects: [PS-DDMM-002, PS-DDMM-005]
provenance: {"Impact": {"evidence": "SME confirmed: if in-place treatment is non-compliant, collections risk being presented under an invalid mandate reference.", "source": "elicited"}, "Next step": {"evidence": "SME confirmed: flag for Control and Compliance specialist; update procedures if scheme requires a new mandate.", "source": "elicited"}, "The gap": {"evidence": "SME (M. Vogel) confirmed current-state: IBAN change = in-place versioned amendment. Scheme compliance for this treatment (especially different debtor bank) cannot be confirmed by the ops SME.", "source": "elicited"}}
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## The gap
Current-state confirmed: a debtor IBAN change is treated as an in-place versioned amendment, not a new mandate. Whether SEPA scheme rules require a new mandate and re-signature for an IBAN change — especially to a different debtor bank — is unresolved.

## Impact
If SEPA rules require a new mandate for IBAN changes and the process treats them as amendments, collections may be presented under an invalid mandate reference, risking scheme non-compliance and collection failures.

## Next step
Flag for the Control and Compliance specialist to confirm the scheme rule; update validation and amendment procedures if a new mandate is required for IBAN changes.
