---
id: REG-PR-006
type: regulation
section: regulation
title: GDPR Art. 5(1)(c) and Art. 25
status: draft
confidence: high
source: General Data Protection Regulation (EU) 2016/679, Art. 5(1)(c) and Art. 25
domain: data-protection
jurisdiction: EU
article: Art. 5(1)(c) and Art. 25
asOf: 2026-05-21
sourceUrl:
provenance: {"How it is met": {"evidence": "", "source": "proposed"}, "What it requires": {"evidence": "§5.1 table: \"GDPR | Art. 5(1)(c), Art. 25 | Data minimisation in outreach; privacy-by-design pre-fill\"", "source": "document"}, "Why it applies": {"evidence": "§2 As-Is: \"Over-collection. Clients are asked for documents the bank already has in onboarding, transactions, or the customer master.\"", "source": "document"}}
---
## What it requires
GDPR Art. 5(1)(c) and Art. 25 require data minimisation in outreach and privacy-by-design pre-fill. The document maps these articles to those obligations.

## Why it applies
The As-Is process over-collects data — clients are asked for documents the bank already holds from onboarding, transactions, or the customer master. This implicates the data minimisation and privacy-by-design obligations that the target process is designed to address.

## How it is met
Case Manager pre-fills all data the bank already holds (Document Vault, Client Master, Transaction Datamart, Entity Resolution Service). Outreach Service computes only the minimal data delta and requests only missing or stale items from the client.
