---
id: INT-DDMM-004
type: integration
section: integrations
title: MMS to Core Banking System — IBAN Reachability Query
status: draft
confidence: high
source: ddmm-it-architect
systems: [SYS-DDMM-002, SYS-DDMM-005]
provenance: {"What connects": {"evidence": "SME (M. Vogel) confirmed: bidirectional query/response — MMS queries Core Banking for debtor account reachability and status, Core Banking responds.", "source": "elicited"}, "What flows": {"evidence": "SME confirmed: outbound = debtor IBAN; inbound = account reachability AND account standing (active / closed / blocked); 'direct-debit eligibility status' is confirmed fair label.", "source": "elicited"}}
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## What connects
Bidirectional query/response link between the Mandate Management System and the Core Banking System; MMS queries for debtor account reachability and status and receives the response.

## What flows
- Outbound: debtor IBAN for reachability and account-status lookup
- Inbound: account reachability flag and direct-debit eligibility status (active / closed / blocked)
