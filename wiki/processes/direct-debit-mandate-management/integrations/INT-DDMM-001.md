---
id: INT-DDMM-001
type: integration
section: integrations
title: MFT Platform to Creditor Portal — Bulk File Hand-off
status: draft
confidence: high
source: ddmm-it-architect
systems: [SYS-DDMM-006, SYS-DDMM-001]
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## What connects
One-directional push from the MFT Platform to the Creditor Portal; the MFT gateway receives SFTP bulk mandate files from large corporate creditors and forwards them for portal ingestion.

## What flows
- Bulk mandate file payload (UMR, CI, debtor name, IBAN, mandate type, signature date per record)
- File metadata (creditor identifier, submission timestamp)
