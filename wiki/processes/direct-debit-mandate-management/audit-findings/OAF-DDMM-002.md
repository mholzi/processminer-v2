---
id: OAF-DDMM-002
type: audit-finding
section: audit-findings
title: R-Transaction Resolution Rationale Not Consistently Documented
status: draft
confidence: high
source: ddmm-control-compliance-specialist
auditDate: 2026-03-20
findingStatus: OPEN
severity: MEDIUM
step: [PS-DDMM-007]
regulation: [REG-DDMM-001]
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## Finding
A SEPA scheme compliance self-assessment found that while the 2-day R-transaction resolution SLA (M-DDMM-003) is tracked, the resolution rationale per reason code (MD01 / MD02 / AC04 / SL01) is not consistently recorded against each R-transaction. The bank cannot reliably demonstrate to the scheme or an auditor that each was handled via the correct scheme-defined path.

## Recommendation
Implement a per-reason-code resolution-record template (proposed but not yet in use) capturing the investigation rationale and action taken for each R-transaction; make completion mandatory before SLA closure.
