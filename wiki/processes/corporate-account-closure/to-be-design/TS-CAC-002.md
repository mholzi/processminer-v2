---
id: TS-CAC-002
type: target-state
section: to-be-design
title: Client-facing digital closure portal with real-time status visibility
status: draft
confidence: medium
source: M. Berger; source-target synthesis — corporate-account-closure wiki
replaces: [PS-CAC-001, PS-CAC-008]
provenance: {"Rationale": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}, "Target description": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}, "What changes": {"evidence": "M. Berger batch confirmation: 'firm up coherent, well-founded stubs' — 2026-05-19", "source": "elicited"}}
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-19
---
## Target description
Corporate clients initiate account closure through an authenticated digital portal, submit supporting documentation online, and receive automated real-time status notifications as the case passes each internal stage — obligations cleared, compliance confirmed, closure executed, final statement delivered. Relationship Manager mediation is retained for bank-initiated closures and mandates requiring independent signatory validation; the portal handles intake and communication for all client-initiated request types.

## What changes
- Client-initiated closure requests are submitted through a self-service digital portal, replacing the current RM-mediated or paper-based intake at step 1
- The client receives automatic status notifications at each major stage (obligations cleared, compliance confirmed, closure executed), replacing the current opaque bank-side workflow with no client visibility
- Closure confirmation and final statement are dispatched automatically at step 8, replacing the current manual dispatch
- RM accountability for bank-initiated closures and mandate verification is preserved, maintaining control integrity

## Rationale
European institutional peers (ING, Commerzbank, HSBC) and CLM platform vendors (S&P CLM Pro, Fenergo) already treat client-facing status visibility as standard. The absence of any digital status channel is a documented benchmark gap (CXB-CAC-001, CXB-CAC-002) that competitors including Citi (CGL-CAC-001) have already closed.
