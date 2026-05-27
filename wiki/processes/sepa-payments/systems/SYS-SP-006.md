---
id: SYS-SP-006
type: system
section: systems
title: CSM Gateway
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
updatedBy: the assistant
updatedAt: 2026-05-25T20:09:11Z
systemType: EXTERNAL
---
## Purpose
External clearing and settlement mechanism connecting the bank to the SEPA scheme via the STEP2 (standard SCT) and RT1 (SCT Inst) gateways.

## Role in this process
Receives pacs.008 from the Payment Hub at ps-8. RT1 settles SCT Inst within 10 seconds (timeout → E-5); STEP2 processes standard SCT in batch cycles with a 16:00 CET cut-off. CSM settlement reports are used at end-of-day reconciliation.
