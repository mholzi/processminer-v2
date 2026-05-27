---
id: EX-DDMM-003
type: exception
section: exceptions
title: Duplicate UMR Detected
status: draft
confidence: high
source: ddmm-dtp-mockup.md
category: Validation
impact: LOW
handlingOwner: Mandate Clerk
approval: approved
approvalBy: M. Vogel
approvalDate: 2026-05-19
---
## Description
The mandate reference (UMR) submitted by the creditor already exists in the Mandate Management System, violating the uniqueness requirement for mandate references.

## Handling
The Clerk first checks the status of the existing UMR in MMS. For a creditor-side numbering error, the request is rejected and the creditor asked to supply a unique UMR. If the existing mandate should have been cancelled but remains Active or Dormant, the case is treated as a system-state issue and escalated internally.

## Impact
Minimal impact in the common case — the creditor supplies a corrected UMR and resubmits. A stuck-cancellation variant requires internal escalation but does not block other mandates.
