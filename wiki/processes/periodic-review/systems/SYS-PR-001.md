---
id: SYS-PR-001
type: system
section: systems
title: KYC Case Manager
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
systemType: CORE
integrates: [SYS-PR-002, SYS-PR-003, SYS-PR-004, SYS-PR-005, SYS-PR-006, SYS-PR-007, SYS-PR-008, SYS-PR-009, SYS-PR-010]
provenance: {"Purpose": {"evidence": "§7.2 table: System 'KYC Case Manager', Role 'Orchestration + SoR', Build/Buy 'Buy (Fenergo / ComplyAdvantage)', Status 'RFP Q3 2026'. §7.1 diagram: 'KYC CASE MANAGER (new) (orchestration + system of record)'. §8 D2: 'Buy a vendor case-management platform (Fenergo or ComplyAdvantage Mesh).'", "source": "document"}, "Role in this process": {"evidence": "", "source": "proposed"}}
---
## Purpose
Vendor case-management platform serving as the central orchestration hub and system of record for all Periodic KYC Review cases. Procurement approach: Buy (Fenergo / ComplyAdvantage); RFP Q3 2026.

## Role in this process
Orchestration hub and system of record. Opens a case within 5 minutes of a ReviewDue event, pre-fills data from five source systems, routes to STP or Reviewer Triage, records 4-eyes sign-off, and writes risk rating to Core Banking on close-out.
