---
id: ROLE-PR-005
type: role
section: roles
title: KYC Case Manager
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
systems: [SYS-PR-001]
controls: [CP-PR-005, CP-PR-007]
provenance: {"In this process": {"evidence": "", "source": "proposed"}, "Responsibility": {"evidence": "KYC Case Manager — Orchestration + SoR (§7.2 system inventory); KYC CASE MANAGER (new) (orchestration + system of record) (§7.1 diagram); Buy (Fenergo / ComplyAdvantage) (§7.2); Buy a vendor case-management platform (Fenergo or ComplyAdvantage Mesh). (§8 D2)", "source": "document"}}
---
## Responsibility
The KYC Case Manager (system) is the orchestration layer and single system of record for all KYC review cases, bought from a vendor (Fenergo / ComplyAdvantage Mesh) and configured in-house.

## In this process
Consulted at detect-review-due (Step 1) — auto-opens the case if the ReviewDue event is not picked up within 72 hours. R/A for case open and pre-fill (Step 2): populates the case with identity documents, address, source-of-funds signal, beneficial-owner graph, screening results, and the last KYC decision pack, and assigns a
