---
id: NFR-BGID-001
type: nfr
section: nfrs
title: End-to-End Processing P95 ≤ 5 Business Days
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
category: PERFORMANCE
target: P95 elapsed time from application-received event to MT760 dispatch ≤ 5 business days for standard applications
owner: Head of Trade Finance Engineering
appliesTo: [TGTAPP-BGID-001, TGTAPP-BGID-005]
drivenByADR: [ADR-BGID-001]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Definition
Measures the elapsed calendar time from the application-received Kafka event timestamp to the MT760 dispatch timestamp for standard guarantee applications. At least 95% of standard applications must complete end-to-end processing within 5 business days.

## Measurement
Derived from Kafka event timestamps: application-received to guarantee-issued event per applicationId. Reported as a daily P95 metric in the TFS operations dashboard. Breach triggers a PagerDuty alert to the trade finance operations team.

## Verification
Smoke-tested in UAT by processing 50 simulated standard applications and measuring P95 elapsed time. Load test at 3× monthly volume (1 050 applications) must maintain ≤ 5 BD P95 before Phase 1 go-live.
