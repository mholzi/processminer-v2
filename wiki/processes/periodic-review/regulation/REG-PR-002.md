---
id: REG-PR-002
type: regulation
section: regulation
title: AMLO-FINMA — Swiss Anti-Money Laundering Ordinance
status: draft
confidence: medium
source: FINMA-RS 2016/7, §22, §23
domain: AML
asOf: 2026-05-21
provenance: {"How it is met": {"evidence": "§3.2 Step 2: \"Beneficial-owner graph (Entity Resolution Service)\"; §5.2: \"Every control writes to the Audit Ledger with the case ID, the actor (human or system), the policy clause it satisfies, and the timestamp.\"", "source": "document"}, "What it requires": {"evidence": "§5.1 table: \"AMLO-FINMA (FINMA-RS 2016/7) | §22, §23 | Re-verification of identity and beneficial owners\"", "source": "document"}, "Why it applies": {"evidence": "", "source": "proposed"}}
---
## What it requires
§22 and §23 of FINMA-RS 2016/7 require re-verification of client identity and beneficial owners.

## Why it applies
The bank's Swiss booking centre is regulated by FINMA (group regulator). All natural-person and legal-entity clients up to and including the SME segment (≤ CHF 50 m balance-sheet total) are in scope for Periodic KYC Review, directly engaging the re-verification obligations set out in §22

## How it is met
The target process re-verifies identity and beneficial-owner data at each review cycle. Pre-fill draws on the Entity Resolution Service for beneficial-owner graphs; the case record and Audit Ledger capture full evidence at close-out.
