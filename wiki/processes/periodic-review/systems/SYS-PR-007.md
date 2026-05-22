---
id: SYS-PR-007
type: system
section: systems
title: Outreach Service
status: draft
confidence: high
source: periodic-kyc-review-dtp.pdf
systemType: SUPPORTING
integrates: [SYS-PR-001]
provenance: {"Purpose": {"evidence": "§7.2: 'Outreach Service | Client-facing digital outreach | Existing mobile platform | Extend'; §3.2 Step 4: 'Owner. Client Outreach Service. Channel. Mobile app (primary), secure message (secondary), RM-mediated for Private Banking.'", "source": "document"}, "Role in this process": {"evidence": "", "source": "proposed"}}
---
## Purpose
Delivers targeted, data-minimised client-facing outreach via the bank's mobile app (primary), secure message (secondary), or RM-mediated contact for Private Banking.

## Role in this process
Owns Step 4 (Targeted Outreach). Computes the minimal data delta and requests only missing or stale items. Enforces a single thread with a 30-day timeout before falling back to RM-mediated contact. Uses the bank's secure-message rail with step-up authentication.
