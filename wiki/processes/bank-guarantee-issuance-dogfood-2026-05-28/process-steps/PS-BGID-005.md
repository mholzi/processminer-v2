---
id: PS-BGID-005
type: process-step
section: process-steps
title: Issuance Approval
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
owner: Trade Finance Manager
sla: Same business day (Trade Finance Manager); best-effort same business day (Head of Trade Finance for guarantees above EUR 5 million)
condition: Sanctions and compliance screening has returned a clear result.
systems: [SYS-BGID-002]
updatedBy: the assistant
updatedAt: 2026-05-28T13:56:45Z
approval: approved
approvalBy: admin
approvalDate: 2026-05-28
---
## What happens
A Trade Finance Manager reviews the assembled application package and approves issuance. Guarantees above EUR 5 million additionally require sign-off by the Head of Trade Finance before the package may proceed. Approvals are recorded in the Trade Finance System.

## Inputs
- Assembled application package (application, facility confirmation, approved wording, screening result)
- Approval authority matrix (including EUR 5 million threshold)
- Trade Finance System approval workflow

## Outputs
- Issuance approval recorded in the Trade Finance System (Trade Finance Manager)
- Additional approval recorded for guarantees above EUR 5 million (Head of Trade Finance)
- Authorised application ready for Guarantee Generation and Delivery

## Why it matters
Four-eyes approval before issuance is the primary control against unauthorised issuance. The tiered authority threshold provides an additional check for guarantees above EUR 5 million.
