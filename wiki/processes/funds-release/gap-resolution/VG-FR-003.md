---
id: VG-FR-003
type: gap
section: gap-resolution
title: Value-dating and threshold rules are inconsistent
status: draft
confidence: medium
source: SME interview - M. Berger
validationArea: Value dating
gapStatus: addressed-in-target
---
## The gap
Value-date and threshold rules are undefined or hard-coded to EUR: the FX rate and evaluation point for the EUR 5m threshold are undefined (PG-FR-001), there is no consistent rule for non-business-day value dates (PG-FR-004), and per-currency same-day cut-offs are not documented (PG-FR-011).

## Resolution
TS-FR-003 routes value dating, cut-offs and the threshold test through a shared currency-aware reference-data engine holding per-currency calendars, cut-off times and the FX convention, so PS-FR-002, PS-FR-005 and PS-FR-007 apply one consistent, currency-aware rule instead of ad-hoc analyst judgement.

## Status
Designed in the target state (TS-FR-003); not yet built. Prerequisite for the reservation and STP work-streams; reference-data quality is itself a risk (IR-FR-006).
