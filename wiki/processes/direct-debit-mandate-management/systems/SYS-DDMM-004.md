---
id: SYS-DDMM-004
type: system
section: systems
title: Sanctions Screening Engine
status: draft
confidence: high
source: ddmm-dtp-mockup.md
systemType: SUPPORTING
steps: [PS-DDMM-003]
provenance: {"Purpose": {"evidence": "Sanctions Screening Engine | Real-time screening of debtor and creditor names", "source": "document"}, "Role in this process": {"evidence": "Debtor and creditor names are screened against sanctions lists. Clean parties pass automatically. Potential hits are routed to Compliance for adjudication.", "source": "document"}}
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
integrates: [SYS-DDMM-002]
---
## Purpose
Real-time screening system that checks party names against applicable sanctions lists.

## Role in this process
Used in Step 3 to automatically screen debtor and creditor names against sanctions lists. Clean parties pass automatically; potential hits are flagged for Compliance adjudication.
