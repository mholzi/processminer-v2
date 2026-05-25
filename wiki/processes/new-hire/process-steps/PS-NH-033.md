---
id: PS-NH-033
type: process-step
section: process-steps
title: Collect signed contract and onboarding documents via DocuSign
status: draft
source: new-hr-onboarding-dtp.md
owner: HR Operations
sla: T-7
condition: Welcome email sent; new hire has access to pre-boarding portal
systems: [SYS-NH-008]
transitions: [PS-NH-034|normal|always, EX-NH-017|exception|contract not signed by T-3]
provenance: {"Inputs": {"evidence": "1.4 Collect signed contract, ID, tax and bank details via DocuSign", "source": "document"}, "Outputs": {"evidence": "1.4 Collect signed contract, ID, tax and bank details via DocuSign", "source": "document"}, "What happens": {"evidence": "1.4 Collect signed contract, ID, tax and bank details via DocuSign | HR Ops | T-7", "source": "document"}, "Why it matters": {"evidence": "§8 Exceptions: Late contract signature (< T-3) | Manager + HRBP approve expedited flow; document in exception log", "source": "document"}}
updatedBy: admin
updatedAt: 2026-05-25T13:52:52Z
---
## What happens
HR Operations collects the signed employment contract, identity documentation, tax forms, and bank details from the new hire via DocuSign. The document lists these four items explicitly in step 1.4.

## Inputs
- Agreed contract terms from offer letter
- Tax form requirements
- Bank detail collection form
- ID document requirements

## Outputs
- Signed employment contract stored in DocuSign
- Completed tax forms collected
- Bank details collected
- Identity documents received

## Why it matters
A signed contract is the legal foundation of employment and tax and bank details are required for payroll set-up. Late collection (below T-3) triggers the expedited exception flow per §8.
