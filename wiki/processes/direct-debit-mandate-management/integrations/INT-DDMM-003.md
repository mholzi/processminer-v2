---
id: INT-DDMM-003
type: integration
section: integrations
title: MMS to Sanctions Screening Engine — Party Screening
status: draft
confidence: high
source: ddmm-it-architect
systems: [SYS-DDMM-002, SYS-DDMM-004]
provenance: {"What connects": {"evidence": "SME (M. Vogel) confirmed: bidirectional — MMS sends party names for screening, Sanctions Screening Engine returns clear or potential-hit result.", "source": "elicited"}, "What flows": {"evidence": "SME confirmed: outbound = debtor/creditor names (new mandates and party-name-changing amendments only, per CP-DDMM-002); inbound = screening result (clear pass or potential hit with match details).", "source": "elicited"}}
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## What connects
Bidirectional link between the Mandate Management System and the Sanctions Screening Engine; MMS sends party names for screening and receives a clear or potential-hit result.

## What flows
- Outbound: debtor name and creditor name for sanctions list matching (new mandates and party-name-changing amendments only)
- Inbound: screening result — clear pass or potential hit with match details
