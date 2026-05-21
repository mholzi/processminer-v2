---
id: SYS-PR-006
type: system
section: systems
title: Risk Rating Service
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
systemType: SUPPORTING
integrates: [SYS-PR-001, SYS-PR-002]
provenance: {"Purpose": {"evidence": "§7.2 system inventory: Role = 'Client risk score'; Build/Buy = 'Existing (model rebuilt 2025)'; Status = 'Connect'. §3.2 Step 1: trigger cadence driven by risk rating (Low 5y/Med 3y/High 1y). §3.2 Step 3: STP eligibility requires 'Low or Medium risk'.", "source": "document"}, "Role in this process": {"evidence": "§3.2 Step 1 Owner KYC Trigger Engine, inputs include 'risk rating'; cadence is risk-driven. §3.2 Step 3 eligibility: 'Low or Medium risk'. §7.2: 'Existing (model rebuilt 2025)' and Status 'Connect'. §7.1 landscape diagram places Risk Rating Service under KYC Case Manager orchestration layer.", "source": "document"}}
---
## Purpose
Holds and computes the client risk score that determines review cadence and STP eligibility.

## Role in this process
Provides the risk-tier score consumed by the Trigger Engine (Step 1) when computing each client's next review due date, and by the STP Decision Engine (Step 3) as an STP eligibility input. Existing system; model rebuilt 2025. Status: Connect.
