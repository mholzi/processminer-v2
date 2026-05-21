---
id: CP-EDR-004
type: control
section: controls
title: Automated re-screening before case closure
status: draft
confidence: high
source: event-driven-review.md
controlType: DETECTIVE
execution: AUTOMATED
owner: Financial Crime Operations
step: [PS-EDR-004]
provenance: {"Control activity": {"evidence": "", "source": "proposed"}, "Risk addressed": {"evidence": "", "source": "proposed"}, "Timing": {"evidence": "Control C-4: 'Automated re-screening before case closure | Detective / automated | Every case'", "source": "document"}, "What it checks": {"evidence": "Step 4: 'the customer and beneficial owners are re-run through sanctions, PEP, and adverse-media screening'; Control C-4: 'Automated re-screening before case closure | Detective / automated | Every case'", "source": "document"}}
---
## What it checks
That the customer and beneficial owners have been re-screened against sanctions, PEP, and adverse-media lists before the case is closed.

## Control activity
Before the case is closed, an automated re-screening run is triggered against sanctions, PEP, and adverse-media databases.

## Risk addressed
Cases being closed without a final screening check, allowing sanctioned or high-risk individuals to remain active without detection.

## Timing
Executed automatically for every case before case closure.
