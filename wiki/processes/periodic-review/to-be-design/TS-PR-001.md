---
id: TS-PR-001
type: target-state
section: to-be-design
title: Step 1 — Trigger
status: draft
confidence: medium
source: periodic-kyc-review-dtp.pdf
owner: KYC Trigger Engine (system)
sla:
condition: Any of: risk-rated review cadence expires (Low 5y / Medium 3y / High 1y); event-based trigger fires (sanctions-list hit, adverse-media match above threshold, TM case closure with RECHECK_KYC, or confirmed BO change); regulatory or supervisory request mandates a refresh
systems: [SYS-PR-002]
provenance: {"Rationale": {"evidence": "The current process is paper-trailed, owned by Relationship Managers in spreadsheets, and overdue on roughly 18.4 % of the High-Risk book as of Q1 2026. [Executive Summary, p.5]; RM receives a monthly Excel extract from Compliance listing her clients due for review. [As-Is §2, p.7]; BaFin §44 KWG inspection, Sep 2025 [Executive Summary, p.5]", "source": "document"}, "Target description": {"evidence": "Triggers are deterministic and logged. A review fires when any of: The client's review cadence expires (Low 5y / Med 3y / High 1y). An event-based trigger fires: a sanctions/PEP hit, an adverse-media match above threshold, a transaction-monitoring case closure with recommendation RECHECK_KYC, or a confirmed beneficial-owner change. A regulatory or supervisory request mandates a refresh (e.g. country list change). A ReviewDue event never silently expires. If it is not picked up within 72 hours, the Case Manager auto-opens the case and notifies the queue owner.", "source": "document"}, "What changes": {"evidence": "", "source": "proposed"}}
---
## Target description
The KYC Trigger Engine fires a deterministic ReviewDue event when any of the following occurs: the client's risk-rated review cadence expires (Low 5y / Medium 3y / High 1y); an event-based trigger fires (sanctions-list hit, adverse-media match above threshold, transaction-monitoring case closure with recommendation RECHECK_KYC, or a confirmed beneficial-owner change); or a regulatory or supervisory request mandates a refresh. The ReviewDue event carries a reason code. If not picked up within 72 hours, the Case Manager auto-opens the case and notifies the queue owner. Triggers never silently expire.

## What changes
- Review is triggered automatically by the Trigger Engine — never by an RM remembering a date
- ReviewDue event carries a reason code on every fire
- Event-based triggers (sanctions, adverse media, TM case closure, BO change) replace ad-hoc RM escalation
- 72-hour auto-open by the Case Manager prevents cases from being silently missed

## Rationale
Eliminates the 18.4 % High-risk overdue rate driven by RM-owned Excel-based triggering. Every review fires deterministically, closing the gap of no deterministic trigger and directly addressing the BaFin §44 KWG inspection finding.
