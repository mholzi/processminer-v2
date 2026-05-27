---
id: PP-BGI-006
type: pain-point
section: pain-points
title: SWIFT Rejections from Wrong BIC and Missed Utilisation Updates at Delivery
status: draft
confidence: high
category: rework
severity: MEDIUM
affects: [PS-BGI-006]
---
## Description
Wrong beneficiary bank BIC details supplied at application cause SWIFT rejections and re-transmissions at the guarantee generation and delivery step. Separately, the manual facility utilisation update that the TFO must perform after SWIFT transmission is occasionally missed.

## Impact
SWIFT rejections require the TFO to identify the correct BIC, amend the record and re-transmit, adding delay and manual rework. Missed utilisation updates leave inaccurate facility limit records in the Trade Finance System, causing downstream limit-tracking discrepancies.

## Root cause
Clients and relationship managers do not always provide verified SWIFT BIC details at application. The manual nature of the utilisation update after transmission means it depends on the TFO's attention with no system prompt or enforcement.
