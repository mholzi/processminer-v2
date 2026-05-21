---
id: CP-PR-001
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
regulatedBy: [REG-PR-001, REG-PR-002, REG-PR-003]
provenance: {"Control activity": {"evidence": "", "source": "proposed"}, "Risk addressed": {"evidence": "", "source": "proposed"}, "Timing": {"evidence": "KYC-C-01 Frequency: Continuous (§5.2) | Trigger Engine → Case Manager: reconciliation against the client master nightly (§7.3)", "source": "document"}, "What it checks": {"evidence": "", "source": "proposed"}}
---
## What it checks
Every review-due event is deterministically fired and logged by the KYC Trigger Engine, ensuring no client review expires silently. Triggers fire on cadence expiry (Low 5y / Med 3y / High 1y), on qualifying events (sanctions/PEP hit, adverse-media match above

## Control activity
The KYC Trigger Engine fires a ReviewDue event on cadence expiry or a qualifying event. If a ReviewDue event is not picked up within 72 hours, the Case Manager auto-opens the case and notifies the queue owner. Every ReviewDue event is logged.

## Risk addressed
Reviews becoming overdue because no deterministic trigger exists and client ownership is tied to individual RMs — the root cause of the 18.4% High-risk overdue rate documented at Q1 2026 and cited in regulatory findings (BaFin §44 KWG inspection Sep

## Timing
Continuous — fires automatically as cadence dates expire or qualifying events are detected. Reconciliation against the client master runs nightly.
