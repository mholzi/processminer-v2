---
id: VG-COB-005
type: gap
section: gap-resolution
title: No open-banking aggregation or consent capability
status: draft
confidence: low
source: Consolidated by source-target from the COB-003 wiki
validationArea: Technology Capability
gapStatus: open
provenance: {"Resolution": {"evidence": "", "source": "proposed"}, "Status": {"evidence": "", "source": "proposed"}, "The gap": {"evidence": "", "source": "proposed"}}
---
## The gap
The credit step has no open-banking aggregator integration, no client-consent handling for permissioned bank data, and a scorecard calibrated only on bureau inputs — none of which the bank has in place today.

## Resolution
The transformation must integrate an open-banking aggregator, build consent capture and management, and recalibrate the credit scorecard on cash-flow data before open-banking inputs can be trusted. Target state TS-COB-003 depends on all three being delivered together.

## Status
Open — the aggregator, consent handling and scorecard recalibration are unscoped dependencies of TD-COB-005.
