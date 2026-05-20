---
id: PG-DDMM-006
type: process-gap
section: process-gaps
title: Sanctions Screening Coverage of IBAN-Only Amendments and Cancellations Not Assessed
status: draft
confidence: medium
source: ddmm-dtp-mockup.md
area: Controls
gapStatus: open
affects: [PS-DDMM-003]
provenance: {"The gap": {"evidence": "SME (M. Vogel) confirmed during CP-DDMM-002 review: screening skipped for IBAN-only amendments and cancellations; formal assessment of whether this exclusion is appropriate has not been done.", "source": "elicited"}, "Impact": {"evidence": "SME confirmed: unscreened IBAN amendment could register a changed IBAN on a mandate where the debtor is now sanctioned.", "source": "elicited"}, "Next step": {"evidence": "SME confirmed: control and compliance specialist to assess whether IBAN-only amendments and cancellations should trigger screening.", "source": "elicited"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-19
---
## The gap
Sanctions screening is skipped for amendments that change only non-name fields (e.g. IBAN) and for cancellations. Whether this exclusion is appropriate under current sanctions obligations has not been formally assessed.

## Impact
An unscreened amendment could register a changed IBAN on a mandate where the debtor is now sanctioned. The control gap may go undetected until the next new mandate or name-change trigger.

## Next step
Control and Compliance specialist to assess whether IBAN-only amendments and cancellations should also trigger sanctions screening under current obligations.
