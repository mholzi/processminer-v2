---
id: CG-PR-004
type: compliance-gap
section: control-gaps
title: QA sampling is ad-hoc, not statistically designed
status: draft
confidence: medium
source: periodic-kyc-review-dtp.pdf
severity: MEDIUM
gapStatus: open
control: [CP-PR-004]
provenance: {"Remediation": {"evidence": "", "source": "proposed"}, "Risk": {"evidence": "Gap log G-07 severity Medium, Owner QA, Target close Q4 2026.", "source": "document"}, "The gap": {"evidence": "Gap log G-07: QA sampling ad-hoc, not statistical. Severity Medium, Owner QA, Target close Q4 2026.", "source": "document"}}
---
## The gap
QA review of analyst and STP approvals is conducted ad-hoc without a statistically valid sampling methodology. The document characterises this as 'QA sampling ad-hoc, not statistical'; the specific absence of a fixed sample rate or risk-tier stratification is inferred from this description.

## Risk
Medium exposure. Ad-hoc QA cannot reliably detect systematic errors in analyst or STP decisions. Owner: QA. Target close: Q4 2026.

## Remediation
Redesign QA sampling to be statistically valid per control KYC-C-04: a 5% random sample of STP and analyst approvals per case, routed to FCO sign-off. QA scorecards provide the evidence.
