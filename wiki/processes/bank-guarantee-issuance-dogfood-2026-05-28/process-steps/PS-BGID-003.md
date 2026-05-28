---
id: PS-BGID-003
type: process-step
section: process-steps
title: Wording Review
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
owner: Trade Finance Officer
sla:
condition: Client facility has been confirmed as sufficient for the requested guarantee amount.
systems: [SYS-BGID-002]
updatedBy: the assistant
updatedAt: 2026-05-28T13:52:56Z
approval: approved
approvalBy: admin
approvalDate: 2026-05-28
---
## What happens
Guarantees with standard wording proceed directly to sanctions and compliance screening. Guarantees with bespoke wording are sent to the Legal team for review and sign-off before issuance. No guarantee with bespoke wording may advance until Legal sign-off is obtained. The informal expectation for Legal review is 2 business days, though no formal SLA exists.

## Inputs
- Application record with wording type flag from Application Intake
- Proposed guarantee text (for bespoke wording)
- Standard wording templates (for standard wording)
- Client and beneficiary details

## Outputs
- Approved guarantee wording (standard template or Legal-signed-off bespoke text)
- Legal sign-off record attached to application (bespoke only)
- Application ready to proceed to Sanctions and Compliance Screening

## Why it matters
Bespoke guarantee text can create unintended legal obligations. Mandatory Legal review prevents the bank from issuing instruments with wording that exposes it to unforeseen claims or legal liability.
