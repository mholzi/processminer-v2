---
id: PP-DDMM-005
type: pain-point
section: pain-points
title: Repetitive Manual Context-Gathering for Sanctions Triage
status: draft
confidence: high
source: M. Vogel, Senior Payments Operations Analyst
category: Process Efficiency
severity: MEDIUM
priority: P2
affects: [PS-DDMM-003]
provenance: {"Description": {"evidence": "Pull mandate record from MMS, debtor and creditor details, and screening match detail from engine, assemble context pack for Compliance — same sequence every time, done by hand, switching between MMS, Sanctions Screening Engine and Creditor Portal.", "source": "elicited"}, "Impact": {"evidence": "Compliance frequently comes back asking for something the Clerk did not include, causing a round-trip that adds latency to the adjudication path. Repetitive low-value work, slows sanctions resolution.", "source": "elicited"}, "Root cause": {"evidence": "Same sequence of steps every time, done by hand, switching between three systems. No automation. SME confirmed 'standard template' as a fair sub-case of 'no tool'.", "source": "elicited"}}
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## Description
When the Sanctions Screening Engine raises a potential hit, the Mandate Clerk manually pulls the mandate record, debtor and creditor details, and match detail from MMS, the screening engine, and the Creditor Portal, then assembles a context pack for Compliance. The same sequence is repeated for every hit.

## Impact
Compliance frequently requests information not included in the initial pack, triggering a round-trip that adds latency to the adjudication path and risks extending the 1-day sanctions SLA (M-DDMM-004). The context-gathering is repetitive low-value work on a compliance-critical path.

## Root cause
No standard template or system integration exists to assemble the context pack automatically. The Clerk switches manually between three systems (MMS, Sanctions Screening Engine, Creditor Portal) to gather data that Compliance needs for each adjudication.
