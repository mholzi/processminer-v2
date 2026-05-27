---
id: SYS-BGI-001
type: system
section: systems
title: Corporate Portal
status: draft
confidence: high
source: bank-guarantee-issuance-v1.md
systemType: EXTERNAL
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-19
---
## Purpose
Client-facing application capture channel for bank guarantee requests.

## Role in this process
Submission channel at step 1. Basic capture fields flow to the Trade Finance System via API (INT-BGI-001); supporting documents attached manually by the TFO. Mandatory-fields-only validation — full completeness not enforced (CG-BGI-001). Role-based: clients see own drafts, RMs see portfolio.
