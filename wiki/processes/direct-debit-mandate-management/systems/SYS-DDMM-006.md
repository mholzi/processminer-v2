---
id: SYS-DDMM-006
type: system
section: systems
title: Managed File Transfer (MFT) Platform
status: draft
confidence: high
source: ddmm-it-architect
systemType: SUPPORTING
steps: [PS-DDMM-001]
provenance: {"Purpose": {"evidence": "SME (M. Vogel): SFTP endpoint is a separate MFT platform — standard corporate MFT gateway — distinct infrastructure from the Creditor Portal, operated separately by the bank.", "source": "elicited"}, "Role in this process": {"evidence": "SME confirmed: MFT receives bulk mandate files dropped by large corporate creditors via SFTP and hands them off to the Creditor Portal for ingestion; MFT has no creditor-facing UI of its own.", "source": "elicited"}}
integrates: [SYS-DDMM-001]
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## Purpose
Corporate MFT gateway that receives bulk mandate files from large corporate creditors via SFTP and forwards them to the Creditor Portal for ingestion.

## Role in this process
Acts as the SFTP entry point for bulk mandate file submissions at Step 1. Receives files dropped by large corporate creditors and transfers them to the Creditor Portal for ingestion; the creditor-facing status view then shifts to the portal.
