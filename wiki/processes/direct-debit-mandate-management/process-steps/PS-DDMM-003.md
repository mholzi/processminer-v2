---
id: PS-DDMM-003
type: process-step
section: process-steps
title: Sanctions Screening
status: draft
confidence: high
source: ddmm-dtp-mockup.md
owner: Compliance
sla:
condition:
systems: [SYS-DDMM-004]
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## What happens
Debtor and creditor names are screened against sanctions lists by the Sanctions Screening Engine. Screening runs on every new mandate and on any amendment that changes a party name; it is skipped for amendments that affect only non-name fields (e.g. debtor IBAN) and for cancellations, as no party names change. Clean parties pass automatically. A potential hit moves the mandate to a dedicated Pending Compliance hold status in MMS with its own holding queue; the 1-business-day SLA (M-DDMM-004) runs against that hold state. A confirmed hit triggers Exception EX-DDMM-002.

## Inputs
- Debtor name
- Creditor name
- Current sanctions lists (via Sanctions Screening Engine)

## Outputs
- Automated clear result (parties proceed to routing decision)
- Mandate moved to Pending Compliance hold status in MMS pending Compliance adjudication

## Why it matters
Processing a mandate involving a sanctioned party would expose the bank to regulatory breach; this control prevents registration of prohibited counterparties.
