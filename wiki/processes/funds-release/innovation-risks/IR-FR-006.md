---
id: IR-FR-006
type: innovation-risk
section: innovation-risks
title: Reference-data quality dependency
status: draft
confidence: medium
source: SME interview - M. Berger
severity: HIGH
---
## The risk
The currency-aware reference-data engine (II-FR-005), the real-time STP rules (II-FR-008) and the Reserve-on-approval logic all depend on accurate calendars, cut-off times and FX rates. If that reference data is wrong or stale, the automated controls fail silently — confidently producing a wrong outcome rather than visibly breaking.

## Likelihood & impact
Likelihood medium — reference data drifts as holidays, rails and rates change. Impact high: a silent automated-control failure mis-dates or mis-gates releases at scale with no human noticing, and is harder to detect than an obvious manual error.

## Mitigation
Treat reference data as a controlled feed with ownership, freshness checks and validation on ingest; alert on stale or missing data; and reconcile critical values periodically against an independent source.
