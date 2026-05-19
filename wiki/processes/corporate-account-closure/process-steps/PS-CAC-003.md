---
id: PS-CAC-003
type: process-step
section: process-steps
title: Outstanding obligations check
status: draft
confidence: high
source: account-closure-dtp-mockup.md
owner: Closure Analyst
systems: [SYS-CAC-002, SYS-CAC-006]
transitions: [PS-CAC-004|normal|no outstanding obligations, EX-CAC-002|exception|obligations are outstanding]
provenance: {"Inputs": {"evidence": "Systems: the Closure Analyst checks transactions and balances in the Core Banking System; Finance checks accounting items in the General Ledger system. Finance confirms via a workflow task in the Client Lifecycle Workflow Tool with a 2-business-day turnaround. — M. Berger", "source": "elicited"}, "Outputs": {"evidence": "Y — record those and approve in one step. — M. Berger", "source": "elicited"}, "What happens": {"evidence": "Systems: the Closure Analyst checks transactions and balances in the Core Banking System; Finance checks accounting items in the General Ledger system. Linked products in scope: overdrafts, time deposits and linked sub-accounts (all visible in Core Banking); trade finance and FX positions are out of scope here (PRC-CR-0090). Finance confirms via a workflow task in the Client Lifecycle Workflow Tool with a 2-business-day turnaround. — M. Berger", "source": "elicited"}, "Why it matters": {"evidence": "Y — record those and approve in one step. — M. Berger", "source": "elicited"}}
approval: in-progress
approvalBy: run-lint
approvalDate: 2026-05-19
---
## What happens
The Closure Analyst checks the Core Banking System for unsettled items: pending payments, uncleared cheques, fees due, and balances on linked products. Linked products in scope are overdrafts, time deposits and linked sub-accounts, all visible in the Core Banking System. Trade finance and FX positions are out of scope and handled under PRC-CR-0090. Finance checks the General Ledger for open accounting items and confirms clearance via a workflow task in the Client Lifecycle Workflow Tool; Finance has a 2-business-day turnaround to complete this confirmation. If any obligations remain outstanding, the case routes to Exception E-2.

## Inputs
- Authority-confirmed closure case from step 2
- Account transaction and balance data from the Core Banking System
- Finance confirmation of open accounting items from the General Ledger, delivered as a workflow task in the Client Lifecycle Workflow Tool (2-business-day turnaround)

## Outputs
- Obligations clearance confirmation
- Case progressed to compliance check, or suspended pending client settlement (E-2)

## Why it matters
Ensures all financial obligations are settled before closure, protecting both the bank and the client from residual liability.
