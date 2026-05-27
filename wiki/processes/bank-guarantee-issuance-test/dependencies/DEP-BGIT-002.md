---
id: DEP-BGIT-002
type: process-dependency
section: dependencies
title: Beneficiary's bank — downstream recipient of issued guarantee via SWIFT
status: draft
confidence: low
source: source-target — bank-guarantee-issuance-test wiki
direction: DOWNSTREAM
atStep: [PS-BGIT-006]
viaSystem: [SYS-BGIT-004]
---
## The dependency
The executed guarantee is delivered to the beneficiary's bank via SWIFT MT798 or, in the target state, via ICC-SWIFT API standards where the beneficiary's bank supports the standard.

## What crosses the boundary
Outbound: the executed guarantee instrument containing the full guarantee text, amount, validity period and issuing bank details. The beneficiary's bank acknowledges receipt and holds the instrument against the underlying commercial obligation.

## Why it matters
If SWIFT delivery fails or the beneficiary's bank rejects the instrument format, the guarantee is not legally effective until redelivered, potentially breaching client delivery commitments and the 3-business-day SLA target.
