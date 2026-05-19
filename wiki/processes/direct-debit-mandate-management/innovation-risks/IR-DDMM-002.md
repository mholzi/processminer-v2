---
id: IR-DDMM-002
type: innovation-risk
section: innovation-risks
title: Event Notification Fatigue Dilutes Urgency of Genuine Alerts
status: draft
confidence: high
source: ddmm-innovation-analyst
severity: MEDIUM
affects: [II-DDMM-002]
provenance: {"Likelihood & impact": {"evidence": "SME confirmed: creditors receiving frequent low-urgency status pings may begin ignoring them; R-transaction resolution windows are time-sensitive — missed alerts translate to delayed responses.", "source": "elicited"}, "Mitigation": {"evidence": "SME confirmed: tiered notification model separating informational status updates from action-required alerts; allow creditors to configure notification preferences.", "source": "elicited"}, "The risk": {"evidence": "SME (M. Vogel) confirmed: increased notification volume across all creditors may lead creditors to normalise portal and email pings, reducing effective response to genuine R-transaction or SL01 alerts.", "source": "elicited"}}
---
## The risk
Real-time status events and push notifications (II-DDMM-002) increase notification volume to creditors. If all events carry equal visual weight, creditors may normalise the volume and overlook genuine action-required alerts — R-transaction responses and SL01 restriction notices — reducing effective resolution rates.

## Likelihood & impact
Moderate likelihood if notification design treats all events uniformly. Impact is MEDIUM: missed R-transaction alerts extend resolution time, increasing the risk of collections proceeding on invalid or disputed mandates.

## Mitigation
Design a tiered notification model: informational status updates separated visually and by channel from action-required alerts. Allow creditors to configure notification preferences by event type; monitor alert-acknowledgement rates post-launch.
