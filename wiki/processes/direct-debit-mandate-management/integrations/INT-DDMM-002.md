---
id: INT-DDMM-002
type: integration
section: integrations
title: Creditor Portal to MMS — Mandate Request Submission
status: draft
confidence: high
source: ddmm-it-architect
systems: [SYS-DDMM-001, SYS-DDMM-002]
provenance: {"What connects": {"evidence": "SME (M. Vogel): mandate requests entered or ingested by the portal pass one-directionally into MMS where they enter the processing queue (queue is part of MMS, no separate system).", "source": "elicited"}, "What flows": {"evidence": "SME confirmed: mandate request payload (UMR, CI, debtor name, IBAN, mandate type, signature date, request type) plus submitting creditor identifier so MMS can attribute the mandate.", "source": "elicited"}}
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## What connects
One-directional submission path from the Creditor Portal to the Mandate Management System; mandate requests entered or ingested by the portal pass into the MMS processing queue.

## What flows
- Mandate request payload (UMR, CI, debtor name, IBAN, mandate type, signature date, request type: new / amendment / cancellation)
- Submitting creditor identifier
