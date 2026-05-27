---
id: EX-DDMM-001
type: exception
section: exceptions
title: Invalid or Incomplete Mandate Data
status: draft
confidence: high
source: ddmm-dtp-mockup.md
category: Validation
impact: MEDIUM
handlingOwner: Mandate Clerk
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## Description
The mandate request fails completeness or plausibility checks during Step 2 validation — for example, the IBAN fails checksum, the Creditor Identifier is inactive, or the mandate type and sequence are inconsistent.

## Handling
The request is returned to the creditor via the Creditor Portal with a structured reason code from the validation error catalogue (e.g. invalid-IBAN, CI-inactive, type/sequence-mismatch). For bulk files, only the invalid mandates are returned; valid mandates proceed to registration. The creditor must correct the data and resubmit.

## Impact
Delayed registration and blocked collection for the affected mandate(s) only — for bulk files, valid mandates in the same batch proceed. The registration SLA pauses during the creditor resubmission window.
