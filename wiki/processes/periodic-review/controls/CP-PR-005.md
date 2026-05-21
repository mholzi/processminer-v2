---
id: CP-PR-005
type: control
section: controls
title: Aged-case escalation when SLA is exceeded
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
controlType: DETECTIVE
execution: AUTOMATED
effectiveness: HIGH
owner: Financial Crime Operations
regulatedBy: [REG-PR-001, REG-PR-002]
provenance: {"Control activity": {"evidence": "KYC-C-05 evidence: Aged-case report (§5.2) | Target dashboards reviewed monthly with the Head of Financial Crime Operations (§10)", "source": "document"}, "Risk addressed": {"evidence": "18.4% of the High-Risk book overdue as of Q1 2026. (Executive Summary) | G-01: No deterministic trigger; 18% overdue on High-risk. Critical. (§9)", "source": "document"}, "Timing": {"evidence": "KYC-C-05 Frequency: Daily (§5.2)", "source": "document"}, "What it checks": {"evidence": "KYC-C-05: Aged-case escalation (> SLA). Type: Detective. Frequency: Daily. Owner: Case Manager. Evidence: Aged-case report. (§5.2) | D6: One SLA framework with risk-rating-driven tiers, applied identically across booking centres. (§8 D6)", "source": "document"}}
---
## What it checks
Cases that remain open beyond their SLA threshold — set by the single risk-rating-driven SLA framework applied identically across all booking centres (Transformation Decision D6) — are automatically detected and escalated.

## Control activity
The KYC Case Manager monitors all open cases daily. Cases exceeding their SLA threshold generate an aged-case report. The aged-case report is reviewed monthly by the Head of Financial Crime Operations. Evidence: Aged-case report.

## Risk addressed
Reviews drifting overdue without supervisory visibility — a key driver of the 18.4% High-risk overdue rate at Q1 2026. Without this control, SLA breaches accumulate silently, increasing regulatory exposure under AMLD6 and AMLO-FINMA.

## Timing
Daily — automated sweep of all open cases runs every day.
