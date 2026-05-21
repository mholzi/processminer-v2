---
id: ROLE-PR-004
type: role
section: roles
title: KYC Trigger Engine
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
systems: [SYS-PR-002]
controls: [CP-PR-001]
provenance: {"In this process": {"evidence": "", "source": "proposed"}, "Responsibility": {"evidence": "Owner. KYC Trigger Engine (system). Inputs. Client master, last-review date, risk rating, event bus (sanctions, adverse media, transaction-monitoring, BO change). Output. ReviewDue event with reason code. Triggers are deterministic and logged. (§3.2 Step 1); Start trigger: Review-due event emitted by the Trigger Engine. (§1.3)", "source": "document"}}
---
## Responsibility
The KYC Trigger Engine automatically detects and emits ReviewDue events on the risk-rating cadence and on qualifying event triggers, and is the sole deterministic trigger for the Periodic KYC Review process.

## In this process
R/A for detecting review-due (Step 1). A review fires on any of: risk-rated cadence expiry (Low 5y / Med 3y / High 1y); event-based triggers (sanctions/PEP hit, adverse-media match above threshold, transaction-monitoring RECHECK_KYC recommendation, or confirmed beneficial-owner change); or a regulatory or supervisory refresh request.
