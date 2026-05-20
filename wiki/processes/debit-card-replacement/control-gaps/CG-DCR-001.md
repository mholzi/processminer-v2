---
id: CG-DCR-001
type: compliance-gap
section: control-gaps
title: No control confirms the replacement card reached the customer
status: draft
confidence: medium
source: Foundational run - S. Krause
severity: MEDIUM
gapStatus: open
provenance: {"Remediation": {"evidence": "Elicited from S. Krause during the foundational-run deepening probe.", "source": "elicited"}, "Risk": {"evidence": "Elicited from S. Krause during the foundational-run deepening probe.", "source": "elicited"}, "The gap": {"evidence": "Elicited from S. Krause during the foundational-run deepening probe.", "source": "elicited"}}
---
## The gap
No control verifies that the replacement card was actually delivered to and received by the customer. The Confirm Dispatch step ends when the bureau is instructed, not when the card arrives.

## Risk
A card-not-received case is detected only when the customer complains, leaving a window in which an intercepted card could be activated and used fraudulently.

## Remediation
Introduce a delivery-confirmation or activation-tracking control that closes the process only once the customer has received and activated the replacement card.
