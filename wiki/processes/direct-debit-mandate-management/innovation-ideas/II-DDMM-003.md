---
id: II-DDMM-003
type: innovation-idea
section: innovation-ideas
title: Inline Portal Validation and Per-Code Remediation Guidance
status: draft
confidence: high
source: ddmm-innovation-analyst
category: Customer Experience
strategicFit: HIGH
complexity: LOW
addresses: [FP-DDMM-001, FP-DDMM-002]
fromTrend: [TR-DDMM-004]
provenance: {"Expected benefit": {"evidence": "SME confirmed: per-code guidance converts the sharpest trust-loss moment (MT-DDMM-002) into a self-service recovery path; reduces RM escalations and second rejections.", "source": "elicited"}, "Feasibility": {"evidence": "SME confirmed: portal front-end change only; no MMS changes required for inline validation; per-code content is one-time authoring effort.", "source": "elicited"}, "The idea": {"evidence": "SME (M. Vogel) confirmed: portal has no client-side validation; no remediation guidance on rejection; errors only surface post-submission.", "source": "elicited"}}
---
## The idea
Add client-side format validation to the Creditor Portal submission form for UMR, CI, IBAN, and mandate-type fields, surfacing errors before submission. In the rejection notification, add per-code remediation guidance — what to change and where — as a collapsible help section alongside the existing reason code and description.

## Expected benefit
Eliminates the most avoidable resubmission cycle. Per-code guidance converts the sharpest trust-loss moment into a self-service recovery path, reducing RM escalations and second rejections on resubmission.

## Feasibility
Low complexity — portal front-end change only; no MMS changes required for inline validation. Per-code guidance requires authoring one remediation entry per validation catalogue code (one-time effort). No new systems needed; fastest idea to ship.
