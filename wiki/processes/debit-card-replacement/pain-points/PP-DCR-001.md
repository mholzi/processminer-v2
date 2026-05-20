---
id: PP-DCR-001
type: pain-point
section: pain-points
title: Reported reason re-keyed across two intake channels
status: draft
confidence: medium
source: Foundational run - S. Krause
category: Data quality
severity: MEDIUM
priority: P2
affects: [PS-DCR-001]
provenance: {"Description": {"evidence": "Elicited from S. Krause during the foundational-run deepening probe.", "source": "elicited"}, "Impact": {"evidence": "Elicited from S. Krause during the foundational-run deepening probe.", "source": "elicited"}, "Root cause": {"evidence": "Elicited from S. Krause during the foundational-run deepening probe.", "source": "elicited"}}
---
## Description
The reported reason — lost, stolen, or damaged — is captured separately on each intake channel. Phone agents key it into the Card Management System by hand, while the mobile app captures it in its own form, and the two are not unified.

## Impact
Manual re-keying on the phone channel is slow and occasionally records the wrong reason, which then misroutes the request — a damaged card sent through the fraud check, or a stolen card that skips it.

## Root cause
The Contact Centre and the mobile app were built as separate intake paths and never reconciled onto a single shared request-capture form.
