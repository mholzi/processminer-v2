---
id: FP-BGID-004
type: friction-point
section: friction-points
title: MT760 Delivery Not Acknowledged to Client
status: draft
confidence: medium
source: SME interview
severity: MEDIUM
occursAt: [PS-BGID-006]
updatedBy: the assistant
updatedAt: 2026-05-26T20:27:02Z
approval: in-progress
approvalBy: admin
approvalDate: 2026-05-26
touchpoint: [JT-BGID-005]
---
## Description
After the bank transmits the MT760 guarantee instrument to the beneficiary's bank, the client receives no confirmation that the beneficiary's bank has acknowledged or accepted the SWIFT message.

## Root cause
The SWIFT acknowledgement from the beneficiary's bank is visible to the bank's operations team but is not captured in the client notification workflow; no process step routes it to the client.

## Client impact
Clients contact the beneficiary directly to verify receipt, introducing friction at the moment the transaction should be proceeding; the unnecessary uncertainty can delay contract execution and erodes confidence in the bank's delivery process.
