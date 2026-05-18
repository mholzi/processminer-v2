---
id: ROLE-FR-004
type: role
section: roles
title: Compliance
status: draft
confidence: high
source: funds-release-dtp-mockup.md
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-17
---
## Responsibility
Compliance owns the sanctions and AML screening control (CP-FR-002) and is accountable for adjudicating potential hits. The screening itself is run automatically by the Sanctions Screening Engine (SYS-FR-003); Compliance does not perform it manually.

## In this process
It adjudicates potential sanctions or AML hits routed from screening, with two outcomes: a false positive is cleared back into the flow at PS-FR-004, the disposition recorded in the audit log; and a confirmed hit is escalated to Financial Crime while the release stays blocked.
