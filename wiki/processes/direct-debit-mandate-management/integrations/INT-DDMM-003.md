---
id: INT-DDMM-003
type: integration
section: integrations
title: MMS to Sanctions Screening Engine — Party Screening
status: draft
confidence: high
source: ddmm-it-architect
systems: [SYS-DDMM-002, SYS-DDMM-004]
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## What connects
Bidirectional link between the Mandate Management System and the Sanctions Screening Engine; MMS sends party names for screening and receives a clear or potential-hit result.

## What flows
- Outbound: debtor name and creditor name for sanctions list matching (new mandates and party-name-changing amendments only)
- Inbound: screening result — clear pass or potential hit with match details
