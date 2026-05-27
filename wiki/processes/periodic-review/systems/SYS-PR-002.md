---
id: SYS-PR-002
type: system
section: systems
title: Trigger Engine
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
systemType: CORE
integrates: [SYS-PR-001]
---
## Purpose
Internal-build deterministic triggering service that detects when a client's KYC review is due and emits a ReviewDue event to the Case Manager. Status: In design.

## Role in this process
Sole trigger source for Step 1. Evaluates cadence expiry (Low 5y, Medium 3y, High 1y), event-based triggers (sanctions hit, adverse media, BO change), and regulatory mandates. Triggers are deterministic and logged; unactioned events auto-open a case after 72 hours.
