---
id: TS-FR-003
type: target-state
section: to-be-design
title: Currency-aware value dating and thresholds
status: draft
confidence: medium
source: SME interview - M. Berger
replaces: [PS-FR-002, PS-FR-005, PS-FR-007]
systems: [SYS-FR-001, SYS-FR-004]
risks: [IR-FR-006]
---
## Target description
Value dating, cut-offs and the Treasury threshold test all read from a shared currency-aware reference-data engine instead of ad-hoc per-analyst judgement and a single EUR figure. The engine holds per-currency business calendars, same-day-value cut-off times and the FX rate source and timestamp. Validation rolls or returns a non-business-day value date by a consistent currency-aware rule, execution dates each release against its own currency cut-off, and the EUR 5m threshold is tested with a defined FX rate and evaluation point.

## What changes
- Per-currency business calendars and same-day-value cut-offs replace the single 14:00 CET EUR figure
- Non-business-day value dates roll or return by a consistent, currency-aware rule rather than ad-hoc analyst judgement
- The EUR 5m Treasury threshold is tested with a defined FX rate source, timestamp and evaluation point
- PS-FR-002, PS-FR-005 and PS-FR-007 read value-date and threshold rules from one shared reference-data service

## Rationale
Three documented gaps — the FX threshold definition, non-business-day value dates and per-currency cut-offs — all stem from value-date and threshold rules being undefined or hard-coded to EUR. A shared reference-data engine removes the per-analyst inconsistency and is the dependency both the reservation and STP target states rely on.
