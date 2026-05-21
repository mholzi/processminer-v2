---
id: SYS-PR-001
type: system
section: systems
title: KYC Case Manager
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
systemType: CORE
integrates: [SYS-PR-002, SYS-PR-003, SYS-PR-004, SYS-PR-005, SYS-PR-006, SYS-PR-007, SYS-PR-008]
provenance: {"Purpose": {"evidence": "KYC CASE MANAGER (new) (orchestration + system of record) [§7.1 diagram]; Buy (Fenergo / ComplyAdvantage) … RFP Q3 2026 [§7.2 inventory table]", "source": "document"}, "Role in this process": {"evidence": "", "source": "proposed"}}
---
## Purpose
Orchestration layer and system of record for all KYC review cases. Procured as a vendor buy (Fenergo or ComplyAdvantage Mesh); RFP Q3 2026.

## Role in this process
Central hub in the target landscape (Section 7.1). Opens cases on ReviewDue events from the Trigger Engine (Step 2 — Case Open & Pre-Fill), orchestrates STP routing through the STP Decision Engine (Step 3), drives targeted outreach via the Outreach
