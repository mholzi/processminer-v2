---
id: II-CAC-001
type: innovation-idea
section: innovation-ideas
title: Real-time FX-normalized callback threshold with automated disbursement control
status: draft
confidence: low
source: web-sourced — TR-CAC-001, CGL-CAC-001
category: automation
strategicFit: MEDIUM
complexity: LOW
addresses: [PG-CAC-001]
fromTrend: [TR-CAC-001]
fromCompetitor: [CGL-CAC-001]
provenance: {"Expected benefit": {"evidence": "", "source": "proposed"}, "Feasibility": {"evidence": "", "source": "proposed"}, "The idea": {"evidence": "", "source": "proposed"}}
---
## The idea
Resolve the EUR 250,000 callback threshold ambiguity by defining it as a fixed EUR-equivalent amount and automating real-time FX conversion in the Payments Platform. The system would calculate the EUR equivalent of any non-EUR balance at the point of disbursement and apply the callback trigger consistently.

## Expected benefit
Eliminates inconsistent callback control application across currencies: currently the threshold may be missed on large non-EUR disbursements or applied unnecessarily on smaller ones. Consistent enforcement reduces fraud risk and removes a documented process gap.

## Feasibility
Low complexity — requires a policy decision from the process owner (EUR-equivalent vs per-currency) and a configuration change in the Payments Platform to apply a live FX rate at disbursement. Depends on availability of a real-time FX feed in the Payments Platform.
