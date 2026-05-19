---
id: PP-DDMM-001
type: pain-point
section: pain-points
title: Manual R-Transaction Handling
status: draft
confidence: high
source: M. Vogel, Senior Payments Operations Analyst
category: Operations
severity: HIGH
priority: P1
affects: [PS-DDMM-007]
provenance: {"Description": {"evidence": "Every inbound R-transaction lands in the Mandate Clerk's queue and is worked entirely by hand: the Clerk reads the reason code, looks up the mandate in MMS, decides which of the four handling paths applies (MD01/MD02/AC04/SL01), and executes it. There is no automation and no decision support.", "source": "elicited"}, "Impact": {"evidence": "Volume is unpredictable (a debtor-bank batch can dump dozens at once); four codes need genuinely different actions — error-prone; an MD02 correction done in a hurry can itself trigger a fresh R-transaction; deprioritised behind new registrations, which risks the 2-day resolution SLA (M-DDMM-003).", "source": "elicited"}, "Root cause": {"evidence": "No automation and no decision support. Four codes need genuinely different actions. SME confirmed 'structurally different resolution paths' and 'no pre-classification' as fair framing.", "source": "elicited"}}
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## Description
Every inbound R-transaction is worked by hand: the Mandate Clerk reads the reason code, looks up the mandate in MMS, determines which of four handling paths applies (MD01/MD02/AC04/SL01), and executes it. There is no automation or decision support.

## Impact
Volume is unpredictable — a debtor-bank batch can dump dozens at once. Each code requires genuinely different actions, making errors likely; an MD02 correction done hurriedly can itself trigger a fresh R-transaction. R-transaction work is deprioritised behind new registrations, risking the 2-day resolution SLA (M-DDMM-003).

## Root cause
No automated routing or decision-support tool exists for R-transaction handling. The four reason codes map to structurally different resolution paths, and the system does no pre-classification to guide the Clerk.
