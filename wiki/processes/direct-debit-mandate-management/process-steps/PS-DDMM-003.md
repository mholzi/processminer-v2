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
transitions: [PS-DDMM-004|branch|screening clear · bulk above 50 mandates, PS-DDMM-005|branch|screening clear · single or bulk 50 or fewer mandates, EX-DDMM-002|exception|confirmed sanctions hit]
systems: [SYS-DDMM-004]
provenance: {"Inputs": {"evidence": "Debtor and creditor names are screened against sanctions lists.", "source": "document"}, "Outputs": {"evidence": "When the engine raises a potential hit, the mandate moves to a dedicated Pending Compliance hold status in MMS with its own holding queue.", "source": "elicited"}, "What happens": {"evidence": "Screening is name-based and skipped for amendments that change only non-name fields — deliberate current-state choice. When engine raises a potential hit, mandate moves to a dedicated Pending Compliance hold status in MMS with its own holding queue; 1-business-day SLA runs against that hold state.", "source": "elicited"}, "Why it matters": {"evidence": "Why it matters wording is fair — confirm as drafted.", "source": "elicited"}}
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
