---
id: PS-BGI-006
type: process-step
section: process-steps
title: Guarantee Generation and Delivery
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
owner: Trade Finance Officer
condition: Issuance approved
systems: [SYS-BGI-002, SYS-BGI-004]
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-20
---
## What happens
The Trade Finance Officer generates the guarantee instrument in the Trade Finance System and transmits it to the beneficiary's bank via SWIFT. After transmission, the TFO performs a separate manual step to update the client's facility utilisation in the Trade Finance System — this update is not a system-automatic consequence of SWIFT transmission and can be missed.

## Inputs
- Approved application package with recorded approval
- Beneficiary bank details for SWIFT transmission
- Trade Finance System and SWIFT access

## Outputs
- Executed guarantee instrument in the Trade Finance System
- SWIFT transmission to the beneficiary's bank
- Client facility utilisation updated by TFO as a separate manual post-transmission step

## Why it matters
Guarantee generation and delivery completes the process; it ends when the executed guarantee is delivered to the beneficiary and the client's facility is updated.
