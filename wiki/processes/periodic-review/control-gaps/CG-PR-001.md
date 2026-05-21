---
id: CG-PR-001
type: compliance-gap
section: control-gaps
title: No deterministic trigger — 18.4% High-risk overdue
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
severity: HIGH
gapStatus: open
control: [CP-PR-001]
provenance: {"Remediation": {"evidence": "", "source": "proposed"}, "Risk": {"evidence": "", "source": "proposed"}, "The gap": {"evidence": "", "source": "proposed"}}
approval: in-progress
---
## The gap
No system enforces that every High-risk client's review fires on cadence. Review ownership sits with the RM via an Excel-based distribution list; lists are not reconciled against the client master, and a client whose RM leaves drops off the list entirely.

## Risk
Critical regulatory exposure under AMLD6 Art. 13(1)(d), AMLO-FINMA §22/§23 and FATF Recommendation 10. A BaFin §44 KWG inspection (Sep 2025) and internal audit report IA-2025-117 both raised findings against control execution, ageing and evidence completeness — areas that include this

## Remediation
Implement the KYC Trigger Engine (Step 1 of the target process) with deterministic, cadence- and event-based triggering. The Trigger Engine emits a ReviewDue event that never silently expires — if not picked up within 72 hours the Case Manager auto-opens
