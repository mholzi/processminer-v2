---
id: SYS-BGI-003
type: system
section: systems
title: Sanctions Screening Tool
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
systemType: SUPPORTING
provenance: {"Purpose": {"evidence": "Sanctions Screening Tool — used by Compliance for beneficiary screening.", "source": "document"}, "Role in this process": {"evidence": "The tool screens against EU consolidated, OFAC, UN and the domestic German list. The tool automatically writes the result to the application record — not manually attached. Formal API integration with the Trade Finance System (INT-BGI-002).", "source": "elicited"}}
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-19
---
## Purpose
Screens entities and countries against sanctions lists to support compliance obligations.

## Role in this process
Used by the Compliance Analyst at step 4 to screen the beneficiary and beneficiary country against EU consolidated, OFAC, UN and the domestic German list; the tool automatically writes the screening result to the Trade Finance System application record (INT-BGI-002).
