---
id: REG-PR-003
type: regulation
section: regulation
title: FATF Recommendation 10(d)
status: draft
confidence: high
source: FATF Recommendation 10, clause (d)
domain: AML/KYC/CTF
jurisdiction: Global
article: Recommendation 10(d)
asOf: 2026-05-21
sourceUrl:
provenance: {"How it is met": {"evidence": "", "source": "proposed"}, "What it requires": {"evidence": "§5.1 table: \"FATF Recommendation 10 | (d) | Ongoing due diligence\"", "source": "document"}, "Why it applies": {"evidence": "Executive Summary: \"It is the bank's primary ongoing-due-diligence control under [...] the FATF Recommendation 10.\"; §1.1: \"Retail Banking and Private Banking Switzerland, EU and UK booking centres\"", "source": "document"}}
---
## What it requires
FATF Recommendation 10, clause (d) requires ongoing due diligence. The document maps this clause to that obligation.

## Why it applies
The executive summary identifies FATF Recommendation 10 as one of the three primary regulatory drivers for Periodic KYC Review. The bank operates Retail Banking and Private Banking across Switzerland, EU and UK booking centres.

## How it is met
Deterministic Trigger Engine (risk-rated cadence plus event-based triggers) fires reviews; data pre-fill keeps CDD current; minimal-delta outreach requests only missing or stale items. Every review decision is recorded in the Audit Ledger with case ID, actor, policy clause, and timestamp.
