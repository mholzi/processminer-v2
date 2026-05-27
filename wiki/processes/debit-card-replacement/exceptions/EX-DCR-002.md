---
id: EX-DCR-002
type: exception
section: exceptions
title: Suspicious transactions found
status: draft
confidence: high
source: dcr-dtp-mockup.md
impact: HIGH
handlingOwner: Fraud Analyst
category: Fraud
approval: approved
approvalBy: S. Krause
approvalDate: 2026-05-19
---
## Description
During the fraud exposure check on a lost or stolen card, the Fraud Analyst finds recent transactions that appear to be unauthorised.

## Handling
The request is handed to the Card Fraud process, which opens a fraud case. The replacement is held until the case is opened, then resumes from the card order step.

## Impact
Delays the replacement while the fraud case is opened, but ensures unauthorised activity is investigated rather than overlooked.
