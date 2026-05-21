---
id: REG-PR-003
type: regulation
section: regulation
title: FATF Recommendation 10
status: draft
confidence: medium
source: FATF Recommendation 10, clause (d)
domain: AML
asOf: 2026-05-21
provenance: {"How it is met": {"evidence": "", "source": "proposed"}, "What it requires": {"evidence": "§5.1 table: \"FATF Recommendation 10 | (d) | Ongoing due diligence\"", "source": "document"}, "Why it applies": {"evidence": "Executive Summary: \"the FATF Recommendation 10\"; §1.1: \"Retail Banking and Private Banking Switzerland, EU and UK booking centres\"", "source": "document"}}
---
## What it requires
The document maps Recommendation 10, clause (d) to the obligation of ongoing due diligence.

## Why it applies
The bank is subject to FATF standards across its multi-jurisdictional booking centres (Switzerland, EU and UK). Periodic KYC Review is the primary vehicle for satisfying the ongoing due diligence obligation under Recommendation 10(d), as mapped in the document's regulatory register (§5.1).

## How it is met
The Trigger Engine fires a ReviewDue event on the risk-rated cadence and on event-based triggers (sanctions hit, adverse-media flag, beneficial-owner change). Automated and human review steps verify client data, screening status, and beneficial ownership, with every decision logged to the
