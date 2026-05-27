---
id: OAF-BGIT-001
type: audit-finding
section: audit-findings
title: AF-2024-01: Facility utilisation update delayed post-SWIFT dispatch
status: draft
confidence: high
source: control-compliance-specialist — M. Berger, 2026-05-20
auditDate: 2024-12-31
findingStatus: in-remediation
severity: MEDIUM
---
## Finding
Internal audit identified three instances in H2 2024 where the client's guarantee facility utilisation was updated in the Trade Finance System five or more business days after the SWIFT MT760 had been dispatched. In each case the guarantee was live and binding but the bank's credit-exposure records did not reflect the utilisation, creating a window of inaccurate facility reporting.

## Recommendation
Implement a system-enforced generation gate so that SWIFT dispatch and TFS utilisation update are executed as a single, inseparable transaction, eliminating the manual post-dispatch update step.
