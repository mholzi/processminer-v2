---
id: OAF-BGID-002
type: audit-finding
section: audit-findings
title: MaRisk BTO 1.2 Four-Eyes Approval Timestamp Gap — BaFin Sonderprüfung
status: draft
confidence: medium
source: BaFin Sonderprüfung 2023
auditDate: 2023-09-20
findingStatus: closed
severity: MEDIUM
updatedBy: admin
updatedAt: 2026-05-26T09:37:44Z
approval: in-progress
approvalBy: admin
approvalDate: 2026-05-26
---
## Finding
During the September 2023 BaFin Sonderprüfung of trade finance operations, examiners found that the Trade Finance System recorded the four-eyes issuance approval (CP-BGID-001) using the server timestamp rather than the authenticated officer's sign-off time. The discrepancy between the actual authorisation and the logged timestamp undermined the audit trail's integrity under MaRisk BTO 1.2.

## Recommendation
Enhance the TFS to capture the authenticated user's session timestamp at the moment of the approval action, ensuring the audit trail entry is bound to the officer's authenticated sign-off. Remediation target: Q1 2024. Enhancement delivered and verified by BaFin; finding closed Q1 2024.
