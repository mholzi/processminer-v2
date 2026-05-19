---
id: PS-CAC-002
type: process-step
section: process-steps
title: Verify mandate and authority
status: draft
confidence: high
source: account-closure-dtp-mockup.md
owner: Closure Analyst
systems: [SYS-CAC-002]
transitions: [PS-CAC-003|normal|authority confirmed, EX-CAC-001|exception|authority cannot be confirmed]
provenance: {"Inputs": {"evidence": "The draft is correct. Y, approve. — M. Berger", "source": "elicited"}, "Outputs": {"evidence": "The draft is correct. Y, approve. — M. Berger", "source": "elicited"}, "What happens": {"evidence": "The Closure Analyst confirms the request comes from an authorised signatory by checking the account mandate. If authority cannot be confirmed, see Exception E-1.", "source": "document"}, "Why it matters": {"evidence": "The draft is correct. Y, approve. — M. Berger", "source": "elicited"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-19
---
## What happens
The Closure Analyst confirms the request originates from an authorised signatory by checking the account mandate in the Core Banking System. If signatory authority cannot be confirmed, the case is routed to Exception E-1.

## Inputs
- Logged closure case from step 1
- Account mandate on file in the Core Banking System

## Outputs
- Confirmed authorisation status
- Case progressed to obligations check, or returned to Relationship Manager (E-1)

## Why it matters
Prevents an unauthorised or fraudulent closure instruction from being actioned, protecting the bank from acting without proper client consent.
