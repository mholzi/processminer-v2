---
id: CG-PR-003
type: compliance-gap
section: control-gaps
title: No deterministic trigger — 18% of High-risk reviews overdue
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
severity: HIGH
gapStatus: open
control: [CP-PR-008]
---
## The gap
No system-enforced trigger exists for periodic KYC reviews. When an RM leaves, the client drops off the Excel list for a full cycle. As of Q1 2026, 18.4% of the High-risk book is overdue — findings from BaFin §44 KWG (Sep 2025) and audit IA-2025-117.

## Risk
Material regulatory exposure under AMLD6 Art. 13(1)(d), GwG Art. 6 and FATF Recommendation 10(d). Supervisors have identified this as a control failure: BaFin §44 KWG (Sep 2025) and internal audit IA-2025-117 both raised findings against control execution and evidence completeness.

## Remediation
Deploy the KYC Trigger Engine to emit ReviewDue events on risk cadence (High 1y / Med 3y / Low 5y) with re-triggers for sanctions, adverse-media and ownership changes. Unactioned events auto-open in 72 h. Owner: FCO + IT; Q4 2026.
