---
id: TS-DDMM-005
type: target-state
section: to-be-design
title: Assisted R-Transaction Handling with Structured Rationale Capture
status: draft
confidence: high
source: ddmm-transformation-agent
replaces: [PS-DDMM-007]
systems: [SYS-DDMM-002]
risks: [IR-DDMM-003]
provenance: {"Rationale": {"evidence": "SME confirmed: PP-DDMM-001 and OAF-DDMM-002 share root cause; framing accepted without edit.", "source": "elicited"}, "Target description": {"evidence": "SME (M. Vogel) confirmed: accurate; mandatory structured rationale at closure makes OAF-DDMM-002 a system guarantee; IR-DDMM-003 correctly carried; accepted without edit.", "source": "elicited"}, "What changes": {"evidence": "SME confirmed all five change bullets — accepted without edit.", "source": "elicited"}}
---
## Target description
When an R-transaction enters the queue, MMS automatically pre-classifies it by reason code and presents the Mandate Clerk with a suggested resolution path for that code — the specific handling steps for MD01, MD02, AC04, or SL01. The Clerk confirms or overrides the pre-classification; the system guides them through the resolution checklist. Resolution rationale is captured in a structured mandatory field at point of closure — the item cannot be closed without it — satisfying OAF-DDMM-002 and creating a clean training corpus for model improvement over time.

## What changes
- MMS pre-classifies each inbound R-transaction by reason code on receipt
- Code-specific guided resolution checklist presented to the Clerk; override available with mandatory rationale
- Structured resolution rationale field mandatory at closure — free text replaced by structured capture
- Pre-classification accuracy and override rates reported periodically to surface model drift
- OAF-DDMM-002 closed: consistent resolution rationale enforced by system, not by convention

## Rationale
PP-DDMM-001 (manual classification) and OAF-DDMM-002 (inconsistent rationale) share a root cause — no system support at the point of R-transaction work. Pre-classification with guided handling cuts errors at source; mandatory structured rationale closes the audit finding as a system guarantee.
