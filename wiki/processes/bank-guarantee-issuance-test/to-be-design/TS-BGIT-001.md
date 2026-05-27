---
id: TS-BGIT-001
type: target-state
section: to-be-design
title: Digital-first guarantee intake with automated completeness gate
status: draft
confidence: high
source: source-target — bank-guarantee-issuance-test wiki
replaces: [PS-BGIT-001, PS-BGIT-002]
systems: [SYS-BGIT-001, SYS-BGIT-002]
---
## Target description
Corporate clients submit guarantee applications through a structured digital channel — either the enhanced Corporate Portal or, for connected clients, via the ICC-SWIFT C2B API from their ERP or treasury system. The portal enforces a completeness gate before submission, rejecting incomplete applications at source rather than returning them by comment. Available credit limit headroom is displayed to clients before they submit, reducing Credit team referrals. Standard applications satisfying the completeness gate and within pre-approved credit limits flow straight through to the Trade Finance System with no manual intake step.

## What changes
- ICC-SWIFT C2B API channel added alongside the Corporate Portal for connected clients
- Mandatory completeness validation gate blocks incomplete submissions at source before they enter TFS
- Real-time credit limit headroom displayed at application submission
- Incomplete applications are rejected structurally, eliminating the no-SLA comment-return loop (PP-BGIT-003)
- Manual intake eyeball at PS-BGIT-001 is replaced by system-enforced validation

## Rationale
Structured digital intake removes the two most common intake failure modes — incomplete applications and credit limit surprises — before human processing begins, cutting the manual exception handling that dominates PS-BGIT-001 and PS-BGIT-002 today.
