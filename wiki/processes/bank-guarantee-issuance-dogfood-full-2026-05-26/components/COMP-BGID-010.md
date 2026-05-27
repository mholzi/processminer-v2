---
id: COMP-BGID-010
type: component
section: components
title: Portal Web App
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
tech: React 18 / Next.js 14 / Node.js 20 BFF
dataStore: Redis 7 (session store, 15-min idle TTL)
hosting: EKS eu-central-1
scaling: HPA 3→12 replicas on CPU utilisation
inApp: [TGTAPP-BGID-005]
realisesCapability: [CAP-BGID-001, CAP-BGID-005]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Responsibility
Delivers the corporate client-facing guarantee application UI. Enforces mandatory field completion at submission, renders the real-time facility headroom widget, displays application status, and delivers push notifications to the client. Delegates all authentication to corporate IAM via OIDC.

## Technical detail
React 18 / Next.js 14 (SSR for initial load). Node.js 20 BFF handles Murex headroom proxy and OIDC token relay. Redis 7 session store. Server-Sent Events push notifications from bgid.notifications.v1 subscription. EKS eu-central-1; HPA 3→12 replicas on CPU utilisation.
