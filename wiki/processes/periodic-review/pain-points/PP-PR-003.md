---
id: PP-PR-003
type: pain-point
section: pain-points
title: Over-collection of documents from clients
status: draft
confidence: medium
source: periodic-kyc-review-dtp.pdf
category: manual effort
severity: HIGH
priority: P1
affects: []
provenance: {"Description": {"evidence": "Over-collection. Clients are asked for documents the bank already has in onboarding, transactions, or the customer master.", "source": "document"}, "Impact": {"evidence": "Client outreach rate As-Is (Q1 2026): 91 % [Executive Summary headline targets table]. GDPR Art. 5(1)(c), Art. 25: Data minimisation in outreach; privacy-by-design pre-fill [§5.1 Regulations addressed].", "source": "document"}, "Root cause": {"evidence": "", "source": "proposed"}}
---
## Description
Clients are asked for documents and data the bank already holds from onboarding, transactions, or the customer master. There is no pre-fill step to eliminate unnecessary requests.

## Impact
91% of reviews require client outreach, creating client friction and delays. The over-collection pattern implicates GDPR data-minimisation obligations (Art. 5(1)(c), Art. 25).

## Root cause
No data-aggregation capability before outreach; the RM requests the same set of documents regardless of what data the bank already holds.
