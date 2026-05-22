---
id: REG-PR-002
type: regulation
section: regulation
title: AMLO-FINMA §22 and §23
status: draft
confidence: high
source: FINMA Anti-Money Laundering Ordinance (FINMA-RS 2016/7), §22 and §23
domain: AML/KYC/CTF
jurisdiction: CH
article: §22 and §23
asOf: 2026-05-21
sourceUrl:
provenance: {"How it is met": {"evidence": "", "source": "proposed"}, "What it requires": {"evidence": "§5.1 table: \"AMLO-FINMA (FINMA-RS 2016/7) | §22, §23 | Re-verification of identity and beneficial owners\"", "source": "document"}, "Why it applies": {"evidence": "§1.1: \"All natural-person clients of Retail Banking and Private Banking Switzerland, EU and UK booking centres.\"", "source": "document"}}
---
## What it requires
AMLO-FINMA (FINMA-RS 2016/7) §22 and §23 require re-verification of identity and beneficial owners. The document maps these clauses to that obligation.

## Why it applies
The bank operates a Private Banking Switzerland booking centre, bringing Swiss-booked clients within scope of AMLO-FINMA.

## How it is met
Case Manager pre-fills identity documents (Document Vault) and the beneficial-owner graph (Entity Resolution Service). STP engine or FCO Analyst confirms re-verification, and the completed case is sealed in the Audit Ledger with case ID, actor, policy clause, and timestamp.
