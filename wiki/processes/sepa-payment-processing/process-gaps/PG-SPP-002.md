---
id: PG-SPP-002
type: process-gap
section: process-gaps
title: Handling of mixed-content bulk files unconfirmed
status: draft
confidence: medium
source: sepa-payments-dtp-mockup.md
area: Bulk processing
gapStatus: open
affects: [PS-SPP-006]
provenance: {"Impact": {"evidence": "", "source": "proposed"}, "Next step": {"evidence": "What happens when a bulk file mixes instant-eligible and standard items?", "source": "document"}, "The gap": {"evidence": "What happens when a bulk file mixes instant-eligible and standard items?", "source": "document"}}
---
## The gap
It is not documented how a bulk file is handled when it mixes instant-eligible items with standard items at the routing decision.

## Impact
Routing behaviour for mixed bulk files is undefined, so bulk-file outcomes cannot be predicted or designed for with confidence.

## Next step
Confirm with the SME how a bulk file mixing instant-eligible and standard items is routed today.
