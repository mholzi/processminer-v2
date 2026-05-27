---
id: SYS-DDMM-006
type: system
section: systems
title: Managed File Transfer (MFT) Platform
status: draft
confidence: high
source: ddmm-it-architect
systemType: SUPPORTING
integrates: [SYS-DDMM-001]
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## Purpose
Corporate MFT gateway that receives bulk mandate files from large corporate creditors via SFTP and forwards them to the Creditor Portal for ingestion.

## Role in this process
Acts as the SFTP entry point for bulk mandate file submissions at Step 1. Receives files dropped by large corporate creditors and transfers them to the Creditor Portal for ingestion; the creditor-facing status view then shifts to the portal.
