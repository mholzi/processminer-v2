---
id: EX-COB-002
type: exception
section: exceptions
title: KYC Screening Hit
status: confirmed
confidence: high
source: DTP-BB-ONB-001 v2.3
category: Compliance
frequencyPct: 5
impact: HIGH
handlingOwner: Compliance Officer
affects: [PS-COB-002]
---
## Description
Triggered when screening returns a match on a director or beneficial owner. It occurs on about 5% of applications.

## Handling
The case is escalated to the Compliance Officer, who reviews the match, decides whether it is a true hit, and either clears it or stops onboarding.

## Impact
High — a genuine hit can mean declining the client and filing a regulatory report.
