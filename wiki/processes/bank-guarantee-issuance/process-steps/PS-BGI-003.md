---
id: PS-BGI-003
type: process-step
section: process-steps
title: Wording Review
status: draft
confidence: high
owner: Trade Finance Officer
condition: Sufficient facility limit confirmed
transitions: [PS-BGI-004|normal|standard wording confirmed or bespoke wording signed off by Legal, EX-BGI-003|branch|bespoke wording requested]
provenance: {"Inputs": {"evidence": "there is a library of approved guarantee templates in the Trade Finance System; the wording type is set at intake", "source": "elicited"}, "Outputs": {"evidence": "Standard-wording guarantees proceed directly. Bespoke wording is sent to the Legal team for review and sign-off before issuance.", "source": "document"}, "What happens": {"evidence": "there is a library of approved guarantee templates in the Trade Finance System; the wording type is set at intake and the TFO selects the matching approved template. Bespoke wording goes to a dedicated Trade Finance Legal desk, not a shared mailbox.", "source": "elicited"}, "Why it matters": {"evidence": "Bespoke wording is sent to the Legal team for review and sign-off before issuance. Bespoke wording adds unpredictable delay because Legal review has no committed turnaround.", "source": "document"}}
source: bank-guarantee-issuance-v1.md
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-20
---
## What happens
The TFO reviews the wording type set at intake and selects the matching approved guarantee template from the template library in the Trade Finance System. Standard-wording applications proceed directly to sanctions screening. Bespoke wording requests are sent to the Trade Finance Legal desk for review and sign-off before the process continues.

## Inputs
- Validated application package
- Wording type classification (standard or bespoke) set at intake
- Approved guarantee template library in the Trade Finance System

## Outputs
- Standard wording approved and application ready for sanctions screening
- Bespoke wording sent to Trade Finance Legal desk for review and sign-off

## Why it matters
Bespoke wording must be reviewed by Legal before issuance; bespoke wording adds unpredictable delay because Legal review has no committed turnaround.
