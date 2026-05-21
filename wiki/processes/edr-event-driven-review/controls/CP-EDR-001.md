---
id: CP-EDR-001
type: control
section: controls
title: Mandatory case opening within 2 business days
status: draft
confidence: medium
source: event-driven-review.md
controlType: PREVENTIVE
execution: AUTOMATED
owner: Financial Crime Operations
step: [PS-EDR-001]
provenance: {"Control activity": {"evidence": "Mandatory case opened within 2 business days of event | Preventive / system", "source": "document"}, "Risk addressed": {"evidence": "", "source": "proposed"}, "Timing": {"evidence": "Mandatory case opened within 2 business days of event | Preventive / system | Every event", "source": "document"}, "What it checks": {"evidence": "Mandatory case opened within 2 business days of event | Preventive / system | Every event. Section 9: 'Case opened after event | Within 2 business days'", "source": "document"}}
---
## What it checks
That an EDR case is opened in the case-management system within 2 business days of the triggering event.

## Control activity
The case-management system enforces mandatory case creation within 2 business days of an event being raised.

## Risk addressed
Failure to initiate a timely review of a risk event, resulting in a delayed or missed EDR.

## Timing
Triggered at every review event; frequency is every case.
