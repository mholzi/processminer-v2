---
id: PS-BGID-005
type: process-step
section: process-steps
title: Issuance Approval
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
owner: Trade Finance Manager
condition: Wording review and sanctions screening have both passed
systems: [SYS-BGID-002]
transitions: [PS-BGID-006|normal|issuance is approved by Trade Finance Manager (and Head of Trade Finance where required)]
provenance: {"Inputs": {"evidence": "", "source": "proposed"}, "Outputs": {"evidence": "", "source": "proposed"}, "What happens": {"evidence": "A Trade Finance Manager reviews the assembled package and approves issuance. Guarantees above EUR 5 million additionally require sign-off by the Head of Trade Finance. / No guarantee is issued without a Trade Finance Manager's approval, recorded in the Trade Finance System.", "source": "document"}, "Why it matters": {"evidence": "C1 — Four-eyes issuance approval. No guarantee is issued without a Trade Finance Manager's approval, recorded in the Trade Finance System.", "source": "document"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:56:10Z
---
## What happens
A Trade Finance Manager reviews the assembled application package and approves issuance, with the approval recorded in the Trade Finance System. For guarantees above EUR 5 million, the Head of Trade Finance must also provide sign-off before the approval is complete.

## Inputs
- Complete application package with credit check result, approved wording and sanctions screening result
- Guarantee amount, currency and validity period

## Outputs
- Formal issuance approval recorded in the Trade Finance System
- Additional sign-off from Head of Trade Finance (for amounts above EUR 5 million)
- Application authorised to proceed to guarantee generation

## Why it matters
No guarantee is issued without a Trade Finance Manager's explicit recorded approval, ensuring independent review of every instrument before the bank's obligation is created (four-eyes control).
