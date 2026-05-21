---
id: REG-PR-005
type: regulation
section: regulation
title: BaIT — BaFin Supervisory Requirements for IT in Financial Institutions
status: draft
confidence: high
source: BaIT (DE BaFin), AT 4.3
domain: IT-governance
asOf: 2026-05-21
provenance: {"How it is met": {"evidence": "", "source": "proposed"}, "What it requires": {"evidence": "§5.1 table: \"BaIT (DE BaFin) | AT 4.3 | IT-based control execution, evidence completeness\"", "source": "document"}, "Why it applies": {"evidence": "Executive Summary: \"Two regulatory findings (BaFin §44 KWG inspection, Sep 2025; internal audit report IA-2025-117) have been raised against control execution, ageing and evidence completeness.\"", "source": "document"}}
---
## What it requires
AT 4.3 of the BaIT requires IT-based control execution with demonstrable evidence completeness.

## Why it applies
The bank's DE booking centre is supervised by BaFin. A BaFin §44 KWG inspection in September 2025 raised findings on control execution, ageing and evidence completeness in the Periodic KYC Review process, making AT 4.3 compliance a direct remediation target for this DTP.

## How it is met
Every control writes to an immutable, hash-chained Audit Ledger with the case ID, the actor (human or system), the policy clause it satisfies, and a timestamp.
