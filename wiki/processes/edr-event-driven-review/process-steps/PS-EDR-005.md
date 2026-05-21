---
id: PS-EDR-005
type: process-step
section: process-steps
title: Re-assess risk rating
status: draft
confidence: high
source: event-driven-review.md
owner: Financial Crime Analyst (1LoD)
condition: Re-screening completed with no true sanctions hit
transitions: [PS-EDR-006|normal|always]
systems: [SYS-EDR-005]
provenance: {"Inputs": {"evidence": "", "source": "proposed"}, "Outputs": {"evidence": "RACI: FCO Accountable for risk rating; step 5: 'approved by the Financial Crime Officer; high-risk ratings additionally require MLRO sign-off.'", "source": "document"}, "What happens": {"evidence": "The Analyst recalculates the customer risk rating using the refreshed inputs. The rating is approved by the Financial Crime Officer; high-risk ratings additionally require MLRO sign-off.", "source": "document"}, "Why it matters": {"evidence": "", "source": "proposed"}}
---
## What happens
The Analyst recalculates the customer risk rating using the refreshed CDD inputs. The rating is approved by the Financial Crime Officer. High-risk ratings additionally require MLRO sign-off.

## Inputs
- Refreshed CDD data
- Screening results
- Current risk rating

## Outputs
- Recalculated customer risk rating
- Financial Crime Officer approval
- MLRO sign-off (for high-risk ratings)

## Why it matters
Establishes the customer's current risk profile based on up-to-date information, forming the basis for the retention or exit decision.
