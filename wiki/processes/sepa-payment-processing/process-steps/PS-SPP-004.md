---
id: PS-SPP-004
type: process-step
section: process-steps
title: Sanctions & AML screening
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
owner: Sanctions Screening Engine
systems: [SYS-SPP-004, SYS-SPP-007]
provenance: {"Inputs": {"evidence": "Debtor and creditor are screened against sanctions lists; the payment is checked by AML transaction monitoring.", "source": "document"}, "Outputs": {"evidence": "to funds check again then to fraud screening — confirmed Y", "source": "elicited"}, "What happens": {"evidence": "no this happens before payment is release; a false positive goes to funds check again then to fraud screening — confirmed Y", "source": "elicited"}, "Why it matters": {"evidence": "If a hit is confirmed -> see Exception E-3. ... Payment frozen; escalated to Compliance and Financial Crime; release blocked pending investigation.", "source": "document"}}
transitions: [PS-SPP-005|normal|when sanctions and AML are clear, EX-SPP-003|exception|when a hit is confirmed]
approval: approved
approvalBy: Markus
approvalDate: 2026-05-18
---
## What happens
Debtor and creditor are screened against sanctions lists and the payment is checked by AML transaction monitoring; both run before the payment is released. Clean items pass automatically. A potential hit is routed to Compliance for review: if Compliance clears it as a false positive, the payment loops back to the funds check and then continues to fraud screening; if the hit is confirmed, it routes to Exception E-3.

## Inputs
- Payment with debtor and creditor details
- Sanctions lists
- AML transaction-monitoring rules

## Outputs
- Screened payment cleared for fraud screening
- Potential hit routed to Compliance for review
- False-positive payment looped back to the funds check
- Confirmed hit frozen under Exception E-3

## Why it matters
Screening blocks payments to sanctioned parties or with money-laundering indicators before settlement; a confirmed hit routes to Exception E-3 and is frozen pending investigation.
