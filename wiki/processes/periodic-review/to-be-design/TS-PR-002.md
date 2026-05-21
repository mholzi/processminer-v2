---
id: TS-PR-002
type: target-state
section: to-be-design
title: Step 2 — Case Open & Pre-Fill
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
owner: KYC Case Manager (system)
sla: ≤ 5 minutes from ReviewDue trigger
condition: ReviewDue event received from Trigger Engine
systems: [SYS-PR-001]
provenance: {"Rationale": {"evidence": "Pre-fill completeness ≥ 92 for STP [KYC-C-02, §5.2, p.12]; ~62 % of Low- and Medium-risk reviews complete straight-through using authoritative data already held by the bank (no client contact). [Executive Summary, p.5]", "source": "document"}, "Target description": {"evidence": "", "source": "proposed"}, "What changes": {"evidence": "", "source": "proposed"}}
---
## Target description
Within ≤ 5 minutes of the ReviewDue event, the KYC Case Manager opens a case pre-populated with all data the bank already holds: identity documents and their expiry from the Document Vault; address on file plus the last three statement-delivery bounce-backs from Client Master; source-of-funds signal from the last 12 months of transactions from the Transaction Datamart; the beneficial-owner graph from the Entity Resolution Service; the latest sanctions / PEP / adverse-media screens from the Screening Service; and the last KYC decision with its full evidence pack.

## What changes
- Case opens automatically within ≤ 5 minutes of the ReviewDue trigger — not manually opened by an RM
- Pre-fill draws from six internal data sources before any client contact is attempted
- Completeness score (0–100) replaces informal analyst judgement on data adequacy
- STP eligibility flag is set automatically at case open
- RM is informed but is no longer the process owner for this step

## Rationale
Exhausts all internal data sources before asking the client for anything, directly reducing over-collection. The completeness score is the objective input to the STP gate in Step 3, replacing analyst discretion with a measurable threshold (≥ 92 required for STP).
