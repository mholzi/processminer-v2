---
id: SYS-FR-001
type: system
section: systems
title: Payments Workflow Tool
status: draft
confidence: high
source: funds-release-dtp-mockup.md
systemType: CORE
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-18
---
## Purpose
Workflow platform that queues, routes and tracks payment release items and runs the automated straight-through path.

## Role in this process
For STP items it is the execution engine — automating validation, generating both approval lines and triggering posting — and auto-creating held-payment queue items. For non-STP items it queues, routes and captures the human approvals, recording the audit log throughout.
