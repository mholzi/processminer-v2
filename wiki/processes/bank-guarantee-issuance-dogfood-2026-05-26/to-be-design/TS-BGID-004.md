---
id: TS-BGID-004
type: target-state
section: to-be-design
title: ISO 20022 SWIFT Delivery Rail
status: draft
confidence: low
source: wiki-synthesis-2026-05-26
replaces: [PS-BGID-006]
systems: [SYS-BGID-002, SYS-BGID-004]
risks: [IR-BGID-003]
updatedBy: admin
updatedAt: 2026-05-26T20:15:01Z
---
## Target description
Guarantee generation and delivery migrates from free-text MT760 SWIFT messages to ISO 20022 structured guarantee messages ahead of the November 2027 mandatory cut-over. The structured payload drives automated downstream reconciliation and facility utilisation updates. A fall-back to MT760 is maintained for beneficiary banks not yet ready for the cut-over, managed via a maintained routing table.

## What changes
- PS-BGID-006 generates ISO 20022 guarantee messages rather than free-text MT760 messages for ISO 20022-ready beneficiary banks.
- Structured ISO 20022 fields drive automated facility utilisation updates and reconciliation in the Trade Finance System.
- A beneficiary-bank readiness routing table determines whether ISO 20022 or MT760 fall-back is used per delivery.
- The migration is coordinated with the bank-wide ISO 20022 programme and validated by schema-checking messages before transmission.

## Rationale
MT760 is retired by SWIFT in November 2027. Early migration removes the hard-cut crunch risk, enables downstream automation from structured fields, and reduces NAK volume by schema-validating messages before transmission.
