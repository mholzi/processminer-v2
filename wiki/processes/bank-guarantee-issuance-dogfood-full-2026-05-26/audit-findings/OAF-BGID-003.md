---
id: OAF-BGID-003
type: audit-finding
section: audit-findings
title: Sanctions Screening Hit Rationale Not Retained in Application Record
status: draft
confidence: medium
source: Internal Audit 2025
auditDate: 2025-02-10
findingStatus: open
severity: HIGH
provenance: {"Finding": {"evidence": "SME validated — control-compliance-specialist session 2026-05-26", "source": "elicited"}, "Recommendation": {"evidence": "SME validated — control-compliance-specialist session 2026-05-26", "source": "elicited"}}
updatedBy: admin
updatedAt: 2026-05-26T09:37:44Z
approval: in-progress
approvalBy: admin
approvalDate: 2026-05-26
---
## Finding
In a Q1 2025 review of 40 guarantee applications, internal audit found that 6 cases (15%) where the Sanctions Screening Tool returned a potential hit that was subsequently dismissed lacked a contemporaneous written analyst rationale in the application record. Dismissals were recorded as cleared in TFS without a supporting justification, contrary to AMLD5 Art. 40 record-keeping requirements.

## Recommendation
Implement a mandatory non-nullable rationale field in the TFS sanctions screening workflow that the Compliance Analyst must complete before a hit can be dismissed, ensuring the justification is captured as an immutable audit-trail entry. Remediation target: Q4 2026.
