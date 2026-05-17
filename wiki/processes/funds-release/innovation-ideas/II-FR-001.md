---
id: II-FR-001
type: innovation-idea
section: innovation-ideas
title: Automated duplicate-request detection at receipt
status: draft
confidence: low
source: Derived from market trend TR-FR-005 (web-sourced)
addresses: [PG-FR-001]
fromTrend: [TR-FR-005]
---
## The idea
Add an automated duplicate-detection check at the Receive request step that fingerprints each release on facility ID, amount, currency, value date and beneficiary, and matches it against in-flight and recently settled items, flagging a likely duplicate to the Ops Analyst before processing begins.

## Expected benefit
Stops duplicate drawdowns from being released twice, removes the rework they consume, and catches the error at intake instead of leaving it to the next day's reconciliation control.

## Feasibility
Low to medium effort — a matching rule over data the queue already holds. The main work is tuning the match so genuine repeat drawdowns are not blocked, and setting the recently-settled lookback window.
