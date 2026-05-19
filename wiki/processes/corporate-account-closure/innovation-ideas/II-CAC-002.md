---
id: II-CAC-002
type: innovation-idea
section: innovation-ideas
title: AI-driven dormancy monitoring with documented and policy-governed threshold triggering
status: draft
confidence: low
source: web-sourced — TR-CAC-001, CEU-CAC-001
category: automation
strategicFit: MEDIUM
complexity: MEDIUM
addresses: [PG-CAC-002]
fromTrend: [TR-CAC-001]
fromCompetitor: [CEU-CAC-001]
provenance: {"Expected benefit": {"evidence": "", "source": "proposed"}, "Feasibility": {"evidence": "", "source": "proposed"}, "The idea": {"evidence": "", "source": "proposed"}}
---
## The idea
Document and codify the dormancy threshold in policy, then surface it in an AI-driven monitoring agent on the Core Banking System that automatically identifies accounts crossing the threshold and generates a pre-populated closure recommendation for the Closure Analyst — removing the current undocumented, manual dormancy review step.

## Expected benefit
Closes the documented gap that dormancy-triggered closures lack a defined criterion. Consistent, automated detection removes analyst discretion from the trigger, reduces missed dormancy cases, and pre-populates the case log — saving the manual effort of the current dormancy review output.

## Feasibility
Medium complexity — requires a policy decision on the threshold value and Core Banking System configuration for automated monitoring. Agentic AI integration (as deployed by ING for KYC) could drive the monitoring layer; alternative is a simpler rule-based query on the Core Banking System.
