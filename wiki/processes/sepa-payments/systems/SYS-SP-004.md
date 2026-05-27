---
id: SYS-SP-004
type: system
section: systems
title: Sanctions Screening Engine
status: draft
confidence: high
source: sepa-payments-dtp-mockup.md
updatedBy: the assistant
updatedAt: 2026-05-25T20:09:11Z
systemType: SUPPORTING
---
## Purpose
Real-time screening of payment parties against sanctions lists.

## Role in this process
Called by the Payment Hub at the Sanctions and AML Screening step (ps-4). Screens debtor and creditor against current sanctions lists; clean items pass automatically; potential hits are flagged and routed to Compliance for manual review.
