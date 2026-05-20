---
id: PP-DCR-002
type: pain-point
section: pain-points
title: Knowledge-based identity verification is slow and fails often
status: draft
confidence: medium
source: Foundational run - S. Krause
category: Identity verification
severity: HIGH
priority: P1
affects: [PS-DCR-002]
provenance: {"Description": {"evidence": "Elicited from S. Krause during the foundational-run deepening probe.", "source": "elicited"}, "Impact": {"evidence": "Elicited from S. Krause during the foundational-run deepening probe.", "source": "elicited"}, "Root cause": {"evidence": "Elicited from S. Krause during the foundational-run deepening probe.", "source": "elicited"}}
---
## Description
On the phone channel, identity is verified with knowledge-based security questions. Customers often cannot answer them because the stored answers are stale, and the exchange is slow even when it succeeds.

## Impact
A high share of phone callers fail verification and are sent to a branch with photo identification, delaying the replacement by days and frustrating customers who are already without a working card.

## Root cause
Knowledge-based verification relies on data the customer set up years ago and rarely refreshes, and there is no stronger verification fallback on the phone channel.
