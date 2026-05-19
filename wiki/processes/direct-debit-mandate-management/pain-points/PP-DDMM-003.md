---
id: PP-DDMM-003
type: pain-point
section: pain-points
title: Daily MMS / Payment Hub Reconciliation Rework
status: draft
confidence: high
source: M. Vogel, Senior Payments Operations Analyst
category: System Integration
severity: MEDIUM
priority: P3
affects: [PS-DDMM-005]
provenance: {"Description": {"evidence": "Daily reconciliation (CP-DDMM-004) regularly surfaces discrepancies — mandates registered in MMS but not yet, or wrongly, reflected in the Payment Hub store. Must chase each one down.", "source": "elicited"}, "Impact": {"evidence": "Low severity per item but a daily tax on the team that never goes away. Must decide benign sync lag or genuine failed sync, and re-trigger sync or raise IT ticket.", "source": "elicited"}, "Root cause": {"evidence": "Root cause is architectural — batch rather than real-time sync — not procedural. SME confirmed 'structural byproduct of the sync gap' as correct framing.", "source": "elicited"}}
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## Description
The daily MMS-to-Payment-Hub reconciliation (CP-DDMM-004) regularly surfaces discrepancies caused by the intraday batch sync: mandates registered in MMS are not yet, or incorrectly, reflected in the Payment Hub mandate store. Each discrepancy must be manually triaged and resolved.

## Impact
Low severity per item but a daily recurring cost: Payments Operations must classify each discrepancy (benign sync lag vs genuine failed sync), re-trigger the affected sync, or raise an IT ticket. The effort accumulates as a permanent background tax on the team.

## Root cause
The Payment Hub mandate store is updated by an intraday batch sync from MMS, not in real time. This is an architectural constraint: discrepancies are a structural byproduct of the sync gap, not a procedural failure.
