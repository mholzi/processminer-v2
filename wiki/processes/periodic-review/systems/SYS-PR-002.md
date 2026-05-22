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
provenance: {"Purpose": {"evidence": "§7.2 table: System 'Trigger Engine', Role 'Deterministic triggering', Build 'Build', Status 'In design'. §3.2 Step 1: 'Triggers are deterministic and logged.' Output 'ReviewDue event with reason code'.", "source": "document"}, "Role in this process": {"evidence": "", "source": "proposed"}}
---
## Purpose
Internal-build deterministic triggering service that detects when a client's KYC review is due and emits a ReviewDue event to the Case Manager. Status: In design.

## Role in this process
Sole trigger source for Step 1. Evaluates cadence expiry (Low 5y, Medium 3y, High 1y), event-based triggers (sanctions hit, adverse media, BO change), and regulatory mandates. Triggers are deterministic and logged; unactioned events auto-open a case after 72 hours.
