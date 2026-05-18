---
id: PP-FR-001
type: pain-point
section: pain-points
title: Treasury funding confirmed but not earmarked
status: draft
confidence: high
source: SME interview - M. Berger
category: Liquidity
severity: MEDIUM
priority: P2
affects: [PS-FR-005]
---
## Description
At the liquidity confirmation step Treasury only confirms that funding is available at that moment; it does not earmark or reserve the funding against the specific release. The confirmation gives no claim on the funds.

## Impact
Funding confirmed for one release can be consumed by another before PS-FR-007 executes, so a release that passed liquidity confirmation can still fail or be deferred at execution — undermining the confirmation it relied on.

## Root cause
The Treasury liquidity platform records a point-in-time availability check rather than a reservation; there is no mechanism to ring-fence confirmed funding against a named release until it is posted.
