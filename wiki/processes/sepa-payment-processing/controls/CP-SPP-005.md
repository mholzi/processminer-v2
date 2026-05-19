---
id: CP-SPP-005
type: control
section: controls
title: Real-time fraud scoring
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
controlType: DETECTIVE
execution: AUTOMATED
owner: Fraud
step: [PS-SPP-005]
provenance: {"Control activity": {"evidence": "The payment is scored in real time by the fraud engine. Low-risk items pass; high-risk items are held for review.", "source": "document"}, "Risk addressed": {"evidence": "", "source": "proposed"}, "Timing": {"evidence": "Real-time fraud scoring | Detective / automated | Every item", "source": "document"}, "What it checks": {"evidence": "Real-time fraud scoring ... The payment is scored in real time by the fraud engine.", "source": "document"}}
---
## What it checks
Whether a payment shows fraud indicators, expressed as a real-time risk score.

## Control activity
The fraud engine scores every payment in real time; low-risk items pass and high-risk items are held for review.

## Risk addressed
Without it, fraudulent payments could be settled before anyone reviews them.

## Timing
Runs automatically and in real time on every payment item.
