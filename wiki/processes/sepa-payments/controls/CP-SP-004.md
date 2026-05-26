---
id: CP-SP-004
type: control
section: controls
title: Sanctions and AML screening control
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
controlType: PREVENTIVE
execution: AUTOMATED
effectiveness: HIGH
owner: Compliance
step: [PS-SP-004]
provenance: {"Control activity": {"evidence": "Step 4: 'Clean items pass automatically; potential hits route to Compliance.' E-3: 'Payment frozen; escalated to Compliance and Financial Crime.' Section 8 lists Sanctions Screening Engine and AML Transaction Monitoring as systems.", "source": "document"}, "Risk addressed": {"evidence": "", "source": "proposed"}, "Timing": {"evidence": "Step sequence: step 3 (funds check) -> step 4 (sanctions/AML) -> step 5 (fraud). Section 7 C-4: 'Every item'.", "source": "document"}, "What it checks": {"evidence": "Step 4: 'Debtor and creditor are screened against sanctions lists; the payment is checked by AML transaction monitoring.' Phrase 'known financial-crime patterns or watchlist entries' removed — not stated in the document.", "source": "document"}}
updatedBy: the assistant
updatedAt: 2026-05-25T20:05:00Z
---
## What it checks
Screens the debtor and creditor against sanctions lists and runs the payment through AML transaction monitoring.

## Control activity
The Sanctions Screening Engine and AML Transaction Monitoring system check each payment automatically. Clean items pass without intervention. Potential hits are routed to Compliance for manual review; confirmed hits cause the payment to be frozen and escalated to Compliance and Financial Crime.

## Risk addressed
Processing payments to or from sanctioned parties or in connection with money laundering, exposing the bank to regulatory enforcement, fines, and reputational damage.

## Timing
Runs on every item after funds earmarking and before fraud scoring.
