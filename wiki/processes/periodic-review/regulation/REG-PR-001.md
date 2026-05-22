---
id: REG-PR-001
type: regulation
section: regulation
title: AMLD6 Art. 13(1)(d)
status: draft
confidence: high
source: Directive (EU) 2018/1673 (AMLD6), Art. 13(1)(d)
domain: AML/KYC/CTF
jurisdiction: EU
article: Art. 13(1)(d)
asOf: 2026-05-21
sourceUrl:
provenance: {"How it is met": {"evidence": "", "source": "proposed"}, "What it requires": {"evidence": "§5.1 table: \"AMLD6 (EU 2018/1673) | Art. 13(1)(d) | Ongoing monitoring + periodic review\"", "source": "document"}, "Why it applies": {"evidence": "Executive Summary: \"It is the bank's primary ongoing-due-diligence control under the EU 6th Anti-Money Laundering Directive (AMLD6)\"; §1.1: \"All natural-person clients of Retail Banking and Private Banking Switzerland, EU and UK booking centres.\"; Executive Summary: \"Periodic KYC Review is the recurring re-verification of a client's identity, beneficial ownership, source of wealth, and risk classification\"", "source": "document"}}
---
## What it requires
Art. 13(1)(d) of AMLD6 (EU 2018/1673) requires ongoing monitoring and periodic review of the business relationship. The document maps this article to that obligation.

## Why it applies
Periodic KYC Review is the bank's primary ongoing-due-diligence control under AMLD6. The bank operates Retail Banking and Private Banking across Switzerland, EU and UK booking centres, and the process covers identity, beneficial ownership, source of wealth and risk classification for all in-scope clients.

## How it is met
Trigger Engine fires ReviewDue on the risk-rated cadence (Low 5y / Med 3y / High 1y) and event-based triggers. STP or FCO Analyst completes each review; decisions recorded in the Audit Ledger with case ID, actor, and timestamp.
