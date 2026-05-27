---
id: CP-PR-008
type: control
section: controls
title: Deterministic trigger of every review
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
controlType: PREVENTIVE
execution: AUTOMATED
effectiveness: HIGH
owner: Financial Crime Operations
step: [PS-PR-001]
regulatedBy: [REG-PR-001, REG-PR-002, REG-PR-003, REG-PR-004]
---
## What it checks
Whether every client's review is triggered on schedule by a rule-engine event rather than by RM memory or a manual list, and that no ReviewDue event expires unacted-upon.

## Control activity
The KYC Trigger Engine emits a ReviewDue event when a client cadence expires (Low 5y / Medium 3y / High 1y) or a trigger fires (sanctions hit, adverse-media flag, BO change). Events not actioned within 72 hours auto-open a case and alert the queue owner. Nightly reconciliation detects gaps.

## Risk addressed
Without a deterministic trigger, reviews depend on RM recall and monthly Excel extracts that are not reconciled against the client master. The Executive Summary notes 18.4 % of High-risk reviews were overdue as of Q1 2026.

## Timing
Continuous; the Trigger Engine runs event-driven with a 72-hour auto-escalation window. The reconciliation report runs nightly.
