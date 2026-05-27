---
id: DEP-BGID-002
type: process-dependency
section: dependencies
title: Beneficiary bank receiving the executed guarantee via SWIFT
status: draft
confidence: low
source: wiki-synthesis-2026-05-26
direction: DOWNSTREAM
atStep: [PS-BGID-006]
viaSystem: [SYS-BGID-004]
updatedBy: admin
updatedAt: 2026-05-26T20:15:01Z
---
## The dependency
The executed bank guarantee is transmitted via SWIFT to the beneficiary's bank at the end of the process. The beneficiary bank must successfully process the message for the guarantee to be legally in force.

## What crosses the boundary
The executed guarantee instrument — wording, amount, validity period, beneficiary details and SWIFT reference — is transmitted from the issuing bank to the beneficiary's bank via MT760 (current) or ISO 20022 (target state).

## Why it matters
If SWIFT delivery fails or the beneficiary bank cannot process the message format, the guarantee is not legally in force and the client's underlying commercial transaction is blocked.
