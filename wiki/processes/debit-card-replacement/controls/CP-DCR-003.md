---
id: CP-DCR-003
type: control
section: controls
title: Fraud exposure review on lost or stolen cards
status: draft
confidence: high
source: dcr-dtp-mockup.md
controlType: DETECTIVE
execution: MANUAL
owner: Fraud Operations
step: [PS-DCR-004]
provenance: {"Control activity": {"evidence": "the Fraud Analyst, who reviews recent transactions for unauthorised activity", "source": "document"}, "Risk addressed": {"evidence": "S. Krause confirmed in the foundational run: Risk addressed holds as drafted.", "source": "elicited"}, "Timing": {"evidence": "Every lost/stolen request", "source": "document"}, "What it checks": {"evidence": "Fraud exposure review on lost/stolen cards | Detective / manual | Every lost/stolen request", "source": "document"}}
approval: in-progress
regulatedBy: [REG-DCR-001]
---
## What it checks
Examines recent transactions on a lost or stolen card for signs of unauthorised use.

## Control activity
The Fraud Analyst reviews the card's recent transaction history and, where suspicious activity is found, routes the case to the Card Fraud process.

## Risk addressed
Without it, fraudulent transactions on a compromised card would go undetected and the customer would not be protected.

## Timing
Performed on every card reported lost or stolen, before the replacement is ordered.
