---
id: TD-CAC-001
type: transformation-decision
section: transformation-decisions
title: Adopt an agentic AI orchestration platform for back-office closure automation
status: draft
confidence: medium
source: M. Berger; source-target synthesis — corporate-account-closure wiki
decisionType: build-buy-platform
decisionStatus: proposed
resolves: []
realises: [TS-CAC-001]
fromIdea: [II-CAC-002]
provenance: {"Options considered": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}, "Rationale": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}, "The decision": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}}
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-19
---
## The decision
Evaluate and adopt an agentic AI orchestration platform — whether a banking-native solution such as Fiserv agentOS or an internally-built agent framework — to automate the obligations check, compliance file assembly, and post-closure reconciliation steps.

## Options considered
- Adopt Fiserv agentOS (widely available August 2026; AML Triage Analysis and reconciliation agents included; nine fintech partners)
- Build an internal agentic orchestration layer on the existing Client Lifecycle Workflow Tool
- Extend the current workflow with RPA (lower capability; no multi-step reasoning)
- Defer adoption pending a bank-wide agentic AI programme decision

## Rationale
Fiserv agentOS offers the fastest path to a governed, audit-ready agentic deployment with pre-built AML Triage and reconciliation agents. The build option is viable if the bank has an existing AI agent framework. RPA lacks the multi-step reasoning required. The bank-wide deferral path introduces sequencing risk given the AMLA July 2027 deadline.
