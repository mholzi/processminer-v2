---
id: ADR-BGID-007
type: adr
section: architecture-decisions
title: Synchronous Facility Read at Intake, Async Utilisation Write Post-Issuance
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
adrStatus: ACCEPTED
owner: Domain Architect
domain: Credit & Trade Finance
decision: [TD-BGID-004]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T14:59:49Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Context
The real-time facility headroom widget (TD-BGID-004) requires a low-latency read that reflects the client's current facility position. The post-issuance utilisation update writes back to Murex MX.3. The architecture must decide the integration pattern for both paths, balancing accuracy against issuance SLA.

## Decision
Implement facility headroom as a synchronous read at intake time and post-issuance utilisation update as a non-blocking asynchronous write. The synchronous read ensures clients see their current position; the async write avoids blocking the issuance path on Murex write latency.

## Alternatives considered
- **Asynchronous read for headroom** — rejected: introduces a staleness window that makes client self-serve pre-qualification unreliable; the key value of TD-BGID-004 is current-position visibility
- **Synchronous write at issuance** — rejected: Murex MX.3 write latency is non-deterministic under load; blocking the issuance critical path creates an SLA risk on guarantee delivery
- **Cache headroom at intake, re-validate at issuance only** — rejected: reintroduces the staleness problem the widget is designed to solve; does not prevent false clears for concurrent in-flight applications

## Consequences
- Murex MX.3 must expose a low-latency synchronous facility-read API; performance must be profiled under peak load
- Async write introduces a brief utilisation staleness window (existing exception EX-BGID-006)
- Solution Architect to design the async write retry mechanism and idempotency pattern
