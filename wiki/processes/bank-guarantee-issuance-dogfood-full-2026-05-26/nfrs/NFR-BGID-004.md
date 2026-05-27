---
id: NFR-BGID-004
type: nfr
section: nfrs
title: Corporate Portal Availability 99.5% During EU Business Hours
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
category: AVAILABILITY
target: Monthly availability ≥ 99.5% during 07:00–20:00 CET Monday to Friday
owner: Head of Digital Channels Engineering
appliesTo: [TGTAPP-BGID-005]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Definition
Measures the availability of the Corporate Portal (including ICC-SWIFT API Gateway) during EU business hours (07:00–20:00 CET, Monday to Friday). Availability ≥ 99.5% in any calendar month measured within that window.

## Measurement
Synthetic endpoint check every 60s during business hours (Datadog). Availability calculated over the business-hours window only; planned maintenance scheduled outside this window is excluded from the calculation.

## Verification
72-hour continuous availability run in UAT during simulated business hours, including a planned rolling-restart scenario. Portal must remain available throughout the rolling restart with no client-visible interruption.
