---
id: PS-CAC-005
type: process-step
section: process-steps
title: Residual balance disbursement
status: draft
confidence: high
source: account-closure-dtp-mockup.md
owner: Finance
sla: Within 3 business days of compliance clearance
systems: [SYS-CAC-004]
transitions: [PS-CAC-006|normal|always, EX-CAC-004|exception|balance cannot be disbursed]
provenance: {"Inputs": {"evidence": "Within 3 business days of compliance clearance — Y, update both and approve in one pass. — M. Berger", "source": "elicited"}, "Outputs": {"evidence": "Within 3 business days of compliance clearance — Y, update both and approve in one pass. — M. Berger", "source": "elicited"}, "What happens": {"evidence": "", "source": "proposed"}, "Why it matters": {"evidence": "Within 3 business days of compliance clearance — Y, update both and approve in one pass. — M. Berger", "source": "elicited"}}
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-19
---
## What happens
Any credit balance is returned to the client's nominated account via the Payments Platform. Disbursements at or above EUR 100,000 equivalent require a callback confirmation of the destination account with the client before execution.

## Inputs
- Compliance-cleared closure case from step 4
- Client's nominated destination account details
- Residual balance amount

## Outputs
- Disbursement instruction executed, or balance moved to suspense (E-4)
- Case ready for 4-eyes approval

## Why it matters
Ensures the client receives their funds and that the large-disbursement callback prevents fraudulent redirection of high-value transfers.
