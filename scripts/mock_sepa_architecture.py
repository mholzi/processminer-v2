#!/usr/bin/env python3
"""Generate a coherent ArchitectMiner mock for sepa-payments.

Picks the SEPA Payments process (clean architecture slate today) and authors
~50 mock elements across the 7 architecture sections — capabilities, target
applications, ADRs, target integrations, components, NFRs, migration phases —
so the dashboard renders fully populated. Cross-refs use @tempKey so an ADR
that drives a target-application or integration wires up correctly in a
single batch write.

Run once:
  python3 scripts/mock_sepa_architecture.py | python3 scripts/wiki/write_elements.py /dev/stdin --by "mock"

Or save the manifest first:
  python3 scripts/mock_sepa_architecture.py > /tmp/mock.json
  python3 scripts/wiki/write_elements.py /tmp/mock.json --by "mock"
"""
from __future__ import annotations

import json
import sys

SLUG = "sepa-payments"

# Existing SEPA Payments ids referenced from the mock — keep them real so
# cross-refs into As-Is steps / systems / gaps actually resolve in the app.
PS = {n: f"PS-SP-{n:03d}" for n in range(1, 11)}  # PS-SP-001..010
SYS = {n: f"SYS-SP-{n:03d}" for n in range(1, 8)}
PG = {n: f"PG-SP-{n:03d}" for n in range(1, 6)}


def p(source: str = "proposed", evidence: str = "") -> dict:
    return {"source": source, "evidence": evidence}


elements: list[dict] = []


def add(spec: dict) -> None:
    """Default every block heading to `proposed` provenance unless overridden."""
    if "provenance" not in spec:
        spec["provenance"] = {b["heading"]: p() for b in spec["blocks"]}
    elements.append(spec)


# ---- Capabilities ---------------------------------------------------------
add({
    "tempKey": "cap-rt-pay", "type": "capability", "title": "Real-time payment processing",
    "fields": {"criticality": "HIGH", "reuse": "NEW", "owningDomain": "Payments"},
    "relations": {"hostedIn": ["@app-hub"], "realisesStep": [PS[6], PS[8], PS[9]]},
    "blocks": [
        {"heading": "Description", "text": "Accept, validate, route and confirm a single payment instruction in seconds, end-to-end, so the bank can offer SCT Inst and instant retail flows without falling back to batch."},
        {"heading": "Inputs and outputs", "text": "Inputs are payment instructions from channels and inbound clearing messages from the CSM. Outputs are debited customer accounts, an outbound ISO 20022 clearing message and a confirmation event to the originating channel."},
        {"heading": "Boundaries", "text": "Excludes card payments (handled by the card scheme) and intra-day liquidity management (treasury). FX is out of scope — only EUR SEPA rails."},
    ],
})
add({
    "tempKey": "cap-validate", "type": "capability", "title": "Instruction validation",
    "fields": {"criticality": "HIGH", "reuse": "REUSED", "owningDomain": "Payments"},
    "relations": {"hostedIn": ["@app-hub"], "realisesStep": [PS[2]]},
    "blocks": [
        {"heading": "Description", "text": "Validate every inbound payment instruction against ISO 20022 schema, scheme rules, IBAN structure and the bank's eligibility limits before it reaches the risk engines or the core book."},
        {"heading": "Inputs and outputs", "text": "Inputs are raw payment instructions in pain.001 or proprietary channel formats. Outputs are normalised, schema-valid pain.001 messages plus a structured rejection event when validation fails."},
        {"heading": "Boundaries", "text": "Does not perform funds checks or sanctions screening. Limited to syntactic and scheme-rule validation; semantic limit checks live in Funds Check."},
    ],
})
add({
    "tempKey": "cap-sanctions", "type": "capability", "title": "Sanctions screening",
    "fields": {"criticality": "HIGH", "reuse": "REUSED", "owningDomain": "Financial Crime"},
    "relations": {"hostedIn": ["@app-risk"], "realisesStep": [PS[4]], "resolvesGap": [PG[1]]},
    "blocks": [
        {"heading": "Description", "text": "Match every party on a payment against EU and OFAC sanctions lists in real time, returning a clear pass, hold-for-review or block decision well within the SCT Inst latency budget."},
        {"heading": "Inputs and outputs", "text": "Inputs are debtor, creditor and ultimate-party fields plus the bank's configured list snapshot. Outputs are a screening verdict, a list of hits with confidence scores and an audit record for every decision."},
        {"heading": "Boundaries", "text": "Excludes transaction-monitoring patterns (AML's domain) and customer-onboarding KYC. Real-time only; batch overnight re-screening is a separate capability."},
    ],
})
add({
    "tempKey": "cap-fraud", "type": "capability", "title": "Real-time fraud detection",
    "fields": {"criticality": "HIGH", "reuse": "REUSED", "owningDomain": "Financial Crime"},
    "relations": {"hostedIn": ["@app-risk"], "realisesStep": [PS[5]]},
    "blocks": [
        {"heading": "Description", "text": "Score every outbound and inbound payment for fraud risk in real time using behavioural, device and network signals, and present a verdict to the orchestrator within the SCT Inst latency budget."},
        {"heading": "Inputs and outputs", "text": "Inputs are the instruction, the originating channel context, the customer's recent activity and the live model snapshot. Outputs are a numeric fraud score, a decision band and the top contributing features for audit."},
        {"heading": "Boundaries", "text": "Does not perform sanctions screening or AML pattern detection — those are sister capabilities. Out of scope: account takeover at login (handled by the channel)."},
    ],
})
add({
    "tempKey": "cap-aml-mon", "type": "capability", "title": "AML transaction monitoring",
    "fields": {"criticality": "MEDIUM", "reuse": "REUSED", "owningDomain": "Financial Crime"},
    "relations": {"hostedIn": ["@app-risk"], "realisesStep": [PS[4]]},
    "blocks": [
        {"heading": "Description", "text": "Detect suspicious transaction patterns across SEPA flows — structuring, smurfing, unusual corridors — and raise alerts for the AML team to triage. Operates on a near-real-time stream rather than synchronously gating each payment."},
        {"heading": "Inputs and outputs", "text": "Inputs are the live event stream of executed payments and the rule + model configuration. Outputs are alerts written to the AML case management system and a structured audit trail of every pattern hit."},
        {"heading": "Boundaries", "text": "Excludes onboarding-time KYC (separate capability) and sanctions name screening. Does not block payments synchronously; it raises post-execution alerts."},
    ],
})
add({
    "tempKey": "cap-routing", "type": "capability", "title": "Clearing routing",
    "fields": {"criticality": "HIGH", "reuse": "NEW", "owningDomain": "Payments"},
    "relations": {"hostedIn": ["@app-hub"], "realisesStep": [PS[6], PS[8]], "resolvesGap": [PG[2]]},
    "blocks": [
        {"heading": "Description", "text": "Choose the right SEPA rail for each instruction — SCT, SCT Inst, SDD Core or SDD B2B — and the right CSM endpoint, based on amount, currency, urgency, beneficiary BIC and customer eligibility."},
        {"heading": "Inputs and outputs", "text": "Inputs are a validated instruction plus the customer's product entitlements. Outputs are a chosen rail, a chosen CSM endpoint and a routed outbound message in the rail's required format."},
        {"heading": "Boundaries", "text": "Excludes correspondent banking and SWIFT cross-border routing. Limited to in-Eurozone SEPA scheme rails. Does not perform any value transformation — pure routing."},
    ],
})
add({
    "tempKey": "cap-book", "type": "capability", "title": "Account booking",
    "fields": {"criticality": "HIGH", "reuse": "REUSED", "owningDomain": "Core Banking"},
    "relations": {"hostedIn": ["@app-core"], "realisesStep": [PS[3], PS[7]]},
    "blocks": [
        {"heading": "Description", "text": "Hold funds on the originating account at validation time, then debit on execution and credit on receipt of inbound payments. Reverse holds promptly when a payment is rejected so the customer's available balance is never stale."},
        {"heading": "Inputs and outputs", "text": "Inputs are booking instructions from the payment hub. Outputs are posted account entries, an updated available balance and a booking confirmation event the hub uses to drive the SCT Inst confirmation back to the channel."},
        {"heading": "Boundaries", "text": "Excludes ledger consolidation and intra-day liquidity calculation. Limited to current-account postings; savings sweeps are out of scope."},
    ],
})
add({
    "tempKey": "cap-notify", "type": "capability", "title": "Customer notification",
    "fields": {"criticality": "MEDIUM", "reuse": "NEW", "owningDomain": "Customer Engagement"},
    "relations": {"hostedIn": ["@app-notify"], "realisesStep": [PS[9]]},
    "blocks": [
        {"heading": "Description", "text": "Push every payment outcome — success, failure, hold-for-review — to the customer over their preferred channel within seconds, so the channel UI never has to poll and a held SCT Inst is never silently dropped."},
        {"heading": "Inputs and outputs", "text": "Inputs are payment outcome events from the hub. Outputs are push notifications, in-app messages and SMS or email fallbacks, with delivery receipts captured for audit and customer-service search."},
        {"heading": "Boundaries", "text": "Excludes marketing and product communications. Limited to transactional payment events. Channel-specific rendering (push payload, SMS template) is owned by the notification service."},
    ],
})
add({
    "tempKey": "cap-recon", "type": "capability", "title": "Reconciliation",
    "fields": {"criticality": "MEDIUM", "reuse": "REUSED", "owningDomain": "Payments"},
    "relations": {"hostedIn": ["@app-hub"], "realisesStep": [PS[10]]},
    "blocks": [
        {"heading": "Description", "text": "Match outbound and inbound clearing messages against the bank's own postings and against the CSM's settlement reports, surfacing every break for operations to investigate before the cut-off."},
        {"heading": "Inputs and outputs", "text": "Inputs are the day's hub events, the core-banking postings and the CSM settlement files. Outputs are matched pairs, a break list with classification and a daily reconciliation summary for finance."},
        {"heading": "Boundaries", "text": "Excludes nostro reconciliation (treasury) and customer fee reconciliation (billing). Limited to SEPA scheme settlements."},
    ],
})

# ---- Target Applications -------------------------------------------------
add({
    "tempKey": "app-hub", "type": "target-application", "title": "Payment Hub (modernised)",
    "fields": {"verdict": "CONFIGURE", "vendor": "Modernised in-house, on the existing Payment Hub product", "owningDomain": "Payments", "costBand": "€2-4M build / €1.5M run"},
    "relations": {"drivenByADR": ["@adr-iso20022", "@adr-event-driven", "@adr-active-active"]},
    "blocks": [
        {"heading": "Rationale", "text": "Keep the existing Payment Hub but re-platform it to event-driven and ISO 20022-native. Build is too risky given vendor scheme certification; full replacement loses years of routing rule edge cases."},
        {"heading": "Tech stack", "text": "Java 21 on Kubernetes (EU-Frankfurt + EU-Amsterdam), PostgreSQL for transactional state, Kafka for the event backbone, gRPC inward to the risk engine."},
        {"heading": "Risks", "text": "- Vendor's modernised release ships H2 2026; a slip slips SCT Inst go-live with it.\n- In-flight routing-rule migration is non-trivial — dedicated workstream needed.\n- Test environment availability with the vendor is the binding constraint."},
    ],
})
add({
    "tempKey": "app-risk", "type": "target-application", "title": "Real-Time Risk Engine",
    "fields": {"verdict": "BUILD", "vendor": "Built in-house, Python + Go on a streaming platform", "owningDomain": "Financial Crime", "costBand": "€4-6M build / €2M run"},
    "relations": {"drivenByADR": ["@adr-consolidate-risk", "@adr-buy-vs-build-risk", "@adr-event-driven"]},
    "blocks": [
        {"heading": "Rationale", "text": "Three legacy engines — sanctions, fraud and AML monitoring — overlap on data and ops, and only sanctions runs synchronously. Consolidate into one streaming risk platform so SCT Inst hits the latency budget."},
        {"heading": "Tech stack", "text": "Python 3.12 + Go on Kubernetes, Kafka Streams + Flink for the streaming layer, Cassandra for time-series state and PostgreSQL for case management."},
        {"heading": "Risks", "text": "- Model lift-and-shift from the vendor fraud engine is the schedule risk.\n- Model owners are reluctant to lose their toolchain — change-management cost.\n- Operational readiness training for the consolidated team is non-trivial."},
    ],
})
add({
    "tempKey": "app-core", "type": "target-application", "title": "Core Banking System",
    "fields": {"verdict": "KEEP", "vendor": "Temenos Transact", "owningDomain": "Core Banking", "costBand": "Existing licence — no incremental"},
    "relations": {"drivenByADR": ["@adr-event-driven"]},
    "blocks": [
        {"heading": "Rationale", "text": "Core banking is out of scope for replacement in this programme. Keep as-is and integrate via the new event backbone. The core team is independently working on a 2028 modernisation; do not constrain it."},
        {"heading": "Tech stack", "text": "Temenos Transact on-premises with the existing event-emit adapter; postings synchronised to Kafka through a CDC pipeline owned by the core banking team."},
        {"heading": "Risks", "text": "- Core's release calendar constrains when integration changes can land.\n- Cross-team coordination overhead is the main programme risk.\n- Joint backlog with the core team mitigates but does not remove this risk."},
    ],
})
add({
    "tempKey": "app-csm", "type": "target-application", "title": "CSM Gateway (modernised)",
    "fields": {"verdict": "CONFIGURE", "vendor": "Modernised, ISO 20022 native with SWIFT Alliance", "owningDomain": "Payments", "costBand": "€1-2M build / €0.6M run"},
    "relations": {"drivenByADR": ["@adr-iso20022"]},
    "blocks": [
        {"heading": "Rationale", "text": "Stick with the current CSM Gateway product but upgrade it to ISO 20022-native and add SCT Inst endpoints. A rip-and-replace would require fresh scheme certification, which is not a price worth paying."},
        {"heading": "Tech stack", "text": "SWIFT Alliance Gateway with the bank's existing CSM Gateway product, ISO 20022 message library, IBM MQ for the legacy CSM endpoints during transition."},
        {"heading": "Risks", "text": "- SWIFT scheme certification windows are narrow; missing one slips by a quarter.\n- Test environment availability with the CSM is the binding constraint.\n- Vendor's ISO 20022 release calendar is on the critical path."},
    ],
})
add({
    "tempKey": "app-notify", "type": "target-application", "title": "Customer Notification Service",
    "fields": {"verdict": "BUILD", "vendor": "Built in-house on Node.js + Kafka", "owningDomain": "Customer Engagement", "costBand": "€0.8-1.2M build / €0.4M run"},
    "relations": {"drivenByADR": ["@adr-event-driven"]},
    "blocks": [
        {"heading": "Rationale", "text": "No existing component pushes transactional payment notifications. Build a thin event-driven service shared across products instead of letting each channel team poll the core for outcomes."},
        {"heading": "Tech stack", "text": "Node.js + Kafka consumers on Kubernetes, Firebase Cloud Messaging and Apple Push Notification Service for mobile, Twilio for SMS fallback and Redis for delivery state."},
        {"heading": "Risks", "text": "- Push deliverability outside the EU is variable — fallbacks must be reliable.\n- Mobile app teams' release cadence sets the integration timeline.\n- Apple and Google push token churn requires a robust re-registration path."},
    ],
})
add({
    "tempKey": "app-sanctions-legacy", "type": "target-application", "title": "Legacy Sanctions Engine",
    "fields": {"verdict": "BUILD", "vendor": "Decommissioned end of 2027", "owningDomain": "Financial Crime", "costBand": "Negative — €0.5M decom"},
    "relations": {"drivenByADR": ["@adr-consolidate-risk"]},
    "blocks": [
        {"heading": "Rationale", "text": "The standalone Sanctions Screening Engine is consolidated into the Real-Time Risk Engine. We list it here so the migration phases have a clear decommission target and the financial-crime team has a visible retirement plan."},
        {"heading": "Tech stack", "text": "Existing vendor sanctions engine on-premises, integrated by IBM MQ. End-of-life path is mirror-and-cutover: run both engines in parallel, then turn off the legacy."},
        {"heading": "Risks", "text": "- Decommission tends to slip because someone always finds a last consumer.\n- Hard cutover date plus a January 2027 freeze on new integrations mitigates.\n- Vendor contract termination clauses may need legal-led negotiation."},
    ],
})

# ---- ADRs -----------------------------------------------------------------
add({
    "tempKey": "adr-iso20022", "type": "adr", "title": "Adopt ISO 20022 as the canonical payment message",
    "fields": {"adrStatus": "accepted", "owner": "Payments Architecture", "domain": "Payments"},
    "relations": {},
    "blocks": [
        {"heading": "Context", "text": "SCT Inst, SCT and SDD all move to ISO 20022 by November 2025. The existing internal format is a proprietary fixed-width record that has accreted dozens of field aliases. Multiple translations between formats add latency and rule duplication."},
        {"heading": "Decision", "text": "Adopt ISO 20022 pain.001 / pacs.008 as the canonical internal message between every component from channel ingress through the CSM Gateway. Translate only at the edges."},
        {"heading": "Alternatives considered", "text": "- Keep the proprietary internal format and translate at the CSM boundary only.\n- Adopt ISO 20022 for inter-bank messages only, retain proprietary internally.\n- Wait for the 2027 SWIFT MX cutover and migrate everything at once.\n- Use a generic event envelope with payment payload nested inside."},
        {"heading": "Consequences", "text": "- One canonical model removes a class of translation bugs.\n- Schema validation can sit at every component boundary.\n- Vendor extensions still need a bilaterally-agreed namespace.\n- Larger messages on the wire — bandwidth modelling matters at peak.\n- Channels that emit proprietary today need an edge translator built first."},
    ],
})
add({
    "tempKey": "adr-event-driven", "type": "adr", "title": "Move the payment estate to event-driven architecture",
    "fields": {"adrStatus": "accepted", "owner": "Enterprise Architecture", "domain": "Payments"},
    "relations": {},
    "blocks": [
        {"heading": "Context", "text": "Today the payment hub orchestrates with synchronous calls and overnight batch hand-offs to risk and core. SCT Inst's 10-second SLA leaves no headroom for a synchronous fan-out to three risk engines plus core. Customer notification arrives minutes late via batch."},
        {"heading": "Decision", "text": "Kafka is the canonical event backbone. Components publish payment-state events and consume them; the hub orchestrates by event correlation, not by remote-procedure call where it can be avoided."},
        {"heading": "Alternatives considered", "text": "- Stay synchronous and parallelise the risk calls.\n- Use a service mesh with gRPC plus circuit breakers.\n- Adopt a request-response message bus (IBM MQ) instead of Kafka.\n- A hybrid where SCT Inst is event-driven but legacy SCT stays synchronous."},
        {"heading": "Consequences", "text": "- Component teams need to invest in idempotency and exactly-once semantics.\n- Observability — tracing across event boundaries — needs OpenTelemetry from day one.\n- Local development gets harder without good tooling.\n- Operational mental model shifts: outages look different in an async world.\n- New monitoring playbooks needed for consumer lag."},
    ],
})
add({
    "tempKey": "adr-consolidate-risk", "type": "adr", "title": "Consolidate sanctions, fraud and AML into one risk engine",
    "fields": {"adrStatus": "accepted", "owner": "Financial Crime Architecture", "domain": "Financial Crime"},
    "relations": {"resolvesGap": [PG[1]]},
    "blocks": [
        {"heading": "Context", "text": "Sanctions, fraud and AML monitoring each run on their own vendor or built engine, with three independent data feeds, three independent ops teams and three independent change calendars. Latency budgets for SCT Inst force a unified, streaming approach."},
        {"heading": "Decision", "text": "Build one Real-Time Risk Engine that hosts sanctions, fraud and AML logic as separate model packs on a shared streaming platform. Decommission the three legacy engines on a phased timeline."},
        {"heading": "Alternatives considered", "text": "- Keep three engines, optimise each for latency individually.\n- Replace only the sanctions engine for SCT Inst, leave fraud and AML on legacy.\n- Buy a unified vendor platform (Actimize, NICE, SAS).\n- Buy two of three and build only the bespoke fraud component."},
        {"heading": "Consequences", "text": "- One platform team replaces three siloed teams — re-org required.\n- A single point of risk-engine failure — must be active-active.\n- Lift-and-shift of model owners' toolchains is the schedule risk.\n- Lower TCO once consolidated, but higher build cost up front.\n- Audit and regulatory engagement need a unified narrative."},
    ],
})
add({
    "tempKey": "adr-buy-vs-build-risk", "type": "adr", "title": "Build, don't buy, the Real-Time Risk Engine",
    "fields": {"adrStatus": "accepted", "owner": "Financial Crime Architecture", "domain": "Financial Crime"},
    "relations": {"dependsOn": ["@adr-consolidate-risk"]},
    "blocks": [
        {"heading": "Context", "text": "Two vendor platforms can host consolidated sanctions, fraud and AML logic. Both are expensive, neither natively models SEPA SCT Inst flows, and both lock the bank into a multi-year change cycle dictated by the vendor's release schedule."},
        {"heading": "Decision", "text": "Build the Real-Time Risk Engine in-house on a streaming platform. Buy the sanctions list data and fraud feature feeds from specialised vendors; build the orchestration, model serving and ops layer."},
        {"heading": "Alternatives considered", "text": "- Buy Actimize and configure heavily for SEPA SCT Inst.\n- Buy NICE for fraud, retain a separate sanctions vendor.\n- Build everything including the feature pipeline.\n- Outsource model development to a fintech specialist."},
        {"heading": "Consequences", "text": "- Faster iteration on SEPA-specific models.\n- Higher up-front build cost; needs sustained ML engineering capacity.\n- Vendor lock-in avoided, but onus of platform reliability is fully on us.\n- Lower run cost once steady-state.\n- Hiring is the binding constraint — 6–9 month ramp."},
    ],
})
add({
    "tempKey": "adr-sct-inst-sla", "type": "adr", "title": "SCT Inst end-to-end SLA: P99 ≤ 10s",
    "fields": {"adrStatus": "accepted", "owner": "Payments Architecture", "domain": "Payments"},
    "relations": {},
    "blocks": [
        {"heading": "Context", "text": "The SEPA SCT Inst scheme requires a 10-second end-to-end execution. The bank can choose to commit to scheme minimum, or set an internal target tighter than the scheme rulebook to leave operational headroom for partial outages and peak hours."},
        {"heading": "Decision", "text": "Commit to P99 ≤ 10s end-to-end including all internal hops, with internal SLAs sized so each component has a budgeted slice: validate 100ms, screen 200ms, route 50ms, book 1s, clear-and-confirm 8s of headroom."},
        {"heading": "Alternatives considered", "text": "- Commit to scheme minimum only — no internal headroom.\n- Commit to P99 ≤ 8s — tighter than scheme, costs more in active-active capacity.\n- Tier the SLA by amount band (≤€500 stricter, > €500 looser).\n- Commit only to median, not P99 — easier to hit but less customer-visible."},
        {"heading": "Consequences", "text": "- Every component owner has a budgeted latency slice to hit.\n- Performance regressions become first-class — must be caught at PR time.\n- Capacity planning is now SLA-driven rather than peak-volume-driven.\n- Slow-path retries can blow the budget — needs fast-fail with notification.\n- SRE practice has to mature in lock-step."},
    ],
})
add({
    "tempKey": "adr-datastore", "type": "adr", "title": "Datastore: PostgreSQL for transactional, Cassandra for time-series",
    "fields": {"adrStatus": "accepted", "owner": "Platform Engineering", "domain": "Payments"},
    "relations": {"dependsOn": ["@adr-event-driven"]},
    "blocks": [
        {"heading": "Context", "text": "The Payment Hub holds short-lived transactional state per payment, while the Real-Time Risk Engine needs to query customer activity histories spanning months for behavioural features. One database does not fit both shapes; forcing it costs latency or capacity."},
        {"heading": "Decision", "text": "PostgreSQL clusters back the payment hub's transactional state. Cassandra backs the risk engine's time-series feature store and the audit trail. Both replicated across two EU regions for active-active."},
        {"heading": "Alternatives considered", "text": "- PostgreSQL everywhere; partition the activity history aggressively.\n- Cassandra everywhere; accept eventual consistency for the hub state.\n- Use the vendor's managed datastore offerings.\n- Use a single graph database to model both shapes."},
        {"heading": "Consequences", "text": "- Two database stacks, two operational learning curves.\n- Cross-store joins are application-side — design discipline required.\n- Backup, restore and disaster-recovery procedures double in surface area.\n- Right-tool-for-the-job latency profile.\n- Cassandra hiring pool in the EU is smaller than PostgreSQL — plan ahead."},
    ],
})
add({
    "tempKey": "adr-active-active", "type": "adr", "title": "Active-active deployment across two EU regions",
    "fields": {"adrStatus": "accepted", "owner": "Platform Engineering", "domain": "Payments"},
    "relations": {"dependsOn": ["@adr-sct-inst-sla"]},
    "blocks": [
        {"heading": "Context", "text": "SCT Inst is a 24/7 product; an entire-region failure cannot translate into customer-visible downtime. The existing payment hub runs active-passive with a manual failover that has not been exercised end-to-end in production conditions."},
        {"heading": "Decision", "text": "Deploy every new and modernised application active-active across EU-Frankfurt and EU-Amsterdam, with synchronous database replication for transactional state and async for the time-series store."},
        {"heading": "Alternatives considered", "text": "- Stay active-passive; invest in faster, tested failover.\n- Three regions active-active.\n- Active-active for hub, active-passive for risk.\n- Pilot light in the second region, hot only on failover."},
        {"heading": "Consequences", "text": "- Double the always-on infrastructure cost.\n- Sync replication adds a latency floor — must be measured against the SCT Inst SLA.\n- Operational maturity gain — chaos engineering becomes routine.\n- Regulatory data-residency rules constrain region choice.\n- Geographic redundancy fits PSD2 supervisory expectations."},
    ],
})
add({
    "tempKey": "adr-auth", "type": "adr", "title": "Service-to-service auth: mTLS internal, OAuth2 at the edge",
    "fields": {"adrStatus": "accepted", "owner": "Security Architecture", "domain": "Security"},
    "relations": {},
    "blocks": [
        {"heading": "Context", "text": "An event-driven estate has many more internal hops than the legacy monolithic flow. Each hop is an authentication and authorisation boundary. The existing IP-allowlist model does not scale to dozens of services and the regulator has signalled that PSD2 expects stronger inter-service controls."},
        {"heading": "Decision", "text": "Every service-to-service call uses mutual TLS with short-lived certificates rotated by a central PKI. Channel-to-hub and partner-to-hub calls use OAuth2 client credentials with token introspection at the gateway."},
        {"heading": "Alternatives considered", "text": "- IP allowlists plus a shared bearer token.\n- mTLS everywhere including channel ingress.\n- JWT-based service auth without mTLS.\n- A service mesh's built-in identity (Istio / Linkerd)."},
        {"heading": "Consequences", "text": "- Certificate rotation must be automated end-to-end.\n- Local development needs first-class mTLS support.\n- Token introspection at the edge adds a small latency cost — measured at 4ms.\n- Outage scenarios on the PKI become P1.\n- Aligns with PSD2 and the upcoming DORA expectations."},
    ],
})
add({
    "tempKey": "adr-idempotency", "type": "adr", "title": "End-to-end idempotency keyed by SCT Inst EndToEndId",
    "fields": {"adrStatus": "accepted", "owner": "Payments Architecture", "domain": "Payments"},
    "relations": {"dependsOn": ["@adr-event-driven"]},
    "blocks": [
        {"heading": "Context", "text": "Event-driven flows imply at-least-once delivery semantics. SCT Inst payments must not double-debit a customer because a Kafka consumer retried after a transient failure. Today there is no consistent idempotency key across components."},
        {"heading": "Decision", "text": "Use the ISO 20022 EndToEndId as the primary idempotency key across every component. Each component stores `(component, EndToEndId, request-hash) → outcome` for 30 days; a repeat returns the prior outcome unchanged."},
        {"heading": "Alternatives considered", "text": "- Service-level uuids minted per hop.\n- An idempotency token issued by the channel.\n- Rely on Kafka exactly-once semantics only.\n- A global idempotency service every component calls."},
        {"heading": "Consequences", "text": "- Storage cost is small per component — 30-day window is tractable.\n- EndToEndId is customer-supplied; channels must mint one if absent.\n- Replays are safe by design — operational confidence improves.\n- Late-arriving duplicates beyond 30 days are unhandled; rare but documented.\n- Audit trail naturally keys on EndToEndId, simplifying investigations."},
    ],
})
add({
    "tempKey": "adr-otel", "type": "adr", "title": "OpenTelemetry is the only observability standard",
    "fields": {"adrStatus": "accepted", "owner": "Platform Engineering", "domain": "Platform"},
    "relations": {"dependsOn": ["@adr-event-driven"]},
    "blocks": [
        {"heading": "Context", "text": "The estate has accreted three tracing systems and two metrics stacks. Correlating a slow SCT Inst across the hub, risk engine and core today requires three dashboards and a war room. The SCT Inst SLA cannot be defended without single-pane-of-glass tracing."},
        {"heading": "Decision", "text": "OpenTelemetry SDKs in every service; OTLP to a central collector; Grafana Tempo for traces, Mimir for metrics, Loki for logs. Vendor lock-in deliberately avoided in favour of an open standard."},
        {"heading": "Alternatives considered", "text": "- Datadog APM end-to-end.\n- Splunk Observability Cloud.\n- Stay with the existing per-team tooling and federate dashboards.\n- Build a thin in-house abstraction over the existing tools."},
        {"heading": "Consequences", "text": "- One vendor-neutral standard; the bank can swap backends later if needed.\n- Migration of existing tracing instrumentation is a meaningful workstream.\n- Lower licence cost than the proprietary alternatives at the bank's volume.\n- A learning curve for teams used to vendor SDKs.\n- Critical for the SCT Inst latency budget to be enforceable."},
    ],
})

# ---- Target Integrations -------------------------------------------------
add({
    "tempKey": "int-channel-hub", "type": "target-integration", "title": "Channel → Payment Hub",
    "fields": {"pattern": "REST + async events", "direction": "BIDIRECTIONAL", "contract": "OpenAPI 3.1 (REST), AsyncAPI 2.6 (events)", "volume": "Peak 500 TPS"},
    "relations": {"from": [SYS[1]], "to": ["@app-hub"], "realises": ["@cap-rt-pay"], "drivenByADR": ["@adr-iso20022", "@adr-event-driven"]},
    "blocks": [
        {"heading": "Purpose", "text": "Channels submit payment instructions and subscribe to outcome events. Single REST endpoint for synchronous submission; outcome arrives asynchronously over the channel-bound event topic, removing the need for polling."},
        {"heading": "Contract details", "text": "POST /v1/payments returns 202 with EndToEndId. Outcome events on `payments.<channel>` Kafka topic in pain.002 ISO 20022. OAuth2 client credentials at the edge; mTLS to the hub. Versioning via URI path."},
        {"heading": "Failure mode", "text": "Channel must treat absent outcome events beyond the SLA window as `unknown` and reconcile via the inquiry API — never as `failed`."},
    ],
})
add({
    "tempKey": "int-hub-risk", "type": "target-integration", "title": "Payment Hub → Real-Time Risk Engine",
    "fields": {"pattern": "gRPC sync request/response", "direction": "DOWNSTREAM", "contract": "Protobuf, versioned per release", "volume": "Peak 500 TPS"},
    "relations": {"from": ["@app-hub"], "to": ["@app-risk"], "realises": ["@cap-sanctions", "@cap-fraud"], "drivenByADR": ["@adr-consolidate-risk", "@adr-sct-inst-sla"]},
    "blocks": [
        {"heading": "Purpose", "text": "The hub calls the risk engine synchronously to obtain a combined verdict (sanctions + fraud) for the current payment. Synchronous because the SCT Inst flow cannot proceed without a decision."},
        {"heading": "Contract details", "text": "gRPC `ScreenPayment(PaymentRequest) → ScreenResult` with 250ms hard timeout. Mutual TLS, the risk engine pre-warms model state. Backwards compatible additions only; breaking changes go to a new RPC."},
        {"heading": "Failure mode", "text": "On timeout or 5xx, the hub fails the payment closed with a `risk-unavailable` reason — no fail-open. Customer is notified; operations is paged immediately."},
    ],
})
add({
    "tempKey": "int-hub-core", "type": "target-integration", "title": "Payment Hub ⇄ Core Banking",
    "fields": {"pattern": "Event stream (Kafka)", "direction": "BIDIRECTIONAL", "contract": "AsyncAPI 2.6, ISO 20022 payloads", "volume": "Peak 500 TPS, daily peak ~3M events"},
    "relations": {"from": ["@app-hub"], "to": ["@app-core"], "realises": ["@cap-book"], "drivenByADR": ["@adr-event-driven", "@adr-iso20022"]},
    "blocks": [
        {"heading": "Purpose", "text": "Hub publishes booking instructions; core consumes them and publishes booking outcomes back on a separate topic. Replaces the legacy synchronous core posting call which serialised SCT Inst behind core's response time."},
        {"heading": "Contract details", "text": "Topics `payments.booking.requested` and `payments.booking.completed`, partitioned by account number. EndToEndId carried as a header for idempotency. Retention 7 days, deeper history in the audit store."},
        {"heading": "Failure mode", "text": "Core consumer lag beyond 2s triggers a critical alert. Hub holds the payment and retries booking on a tight schedule; SCT Inst rejection if not posted within budget."},
    ],
})
add({
    "tempKey": "int-hub-csm", "type": "target-integration", "title": "Payment Hub → CSM Gateway",
    "fields": {"pattern": "ISO 20022 over MQ + SCT Inst SIPS REST", "direction": "BIDIRECTIONAL", "contract": "ISO 20022 pacs.008 / pacs.002", "volume": "Peak 500 TPS"},
    "relations": {"from": ["@app-hub"], "to": ["@app-csm"], "realises": ["@cap-routing"], "drivenByADR": ["@adr-iso20022"]},
    "blocks": [
        {"heading": "Purpose", "text": "The hub hands off outbound clearing messages to the CSM Gateway, which delivers them to STEP2 (SCT, SDD) or RT1 / TIPS (SCT Inst). Inbound clearing messages return through the same gateway."},
        {"heading": "Contract details", "text": "IBM MQ queues for STEP2; REST over mTLS for TIPS-style endpoints. ISO 20022 pacs.008 outbound and pacs.002 inbound. Routing decision is made by the hub before the hand-off."},
        {"heading": "Failure mode", "text": "CSM unavailability is the rare case — the gateway buffers up to 30 minutes. Beyond that the hub fails-closed and dispatches a regulator-visible incident notification."},
    ],
})
add({
    "tempKey": "int-core-notify", "type": "target-integration", "title": "Core Banking → Customer Notification",
    "fields": {"pattern": "Event subscription (Kafka)", "direction": "DOWNSTREAM", "contract": "AsyncAPI 2.6", "volume": "Peak 500 TPS"},
    "relations": {"from": ["@app-core"], "to": ["@app-notify"], "realises": ["@cap-notify"], "drivenByADR": ["@adr-event-driven"]},
    "blocks": [
        {"heading": "Purpose", "text": "Notification service consumes booking-outcome events from core and pushes a customer notification within seconds. Avoids the channel having to poll for outcome — core's event is the source of truth."},
        {"heading": "Contract details", "text": "Topic `payments.booking.completed`, schema versioned in the AsyncAPI catalogue. Notification service consumes with a 30-second SLA from event publish to customer-visible push."},
        {"heading": "Failure mode", "text": "Push failure falls back to SMS, then to email, with delivery state captured for the customer service search. A persistent delivery outage triggers a customer-facing incident notice."},
    ],
})
add({
    "tempKey": "int-risk-audit", "type": "target-integration", "title": "Real-Time Risk Engine → Audit Store",
    "fields": {"pattern": "Event stream (Kafka)", "direction": "DOWNSTREAM", "contract": "AsyncAPI 2.6", "volume": "Peak 1500 TPS (3× payment volume — one event per verdict + features)"},
    "relations": {"from": ["@app-risk"], "to": ["@app-risk"], "realises": ["@cap-sanctions", "@cap-fraud", "@cap-aml-mon"], "drivenByADR": ["@adr-event-driven"]},
    "blocks": [
        {"heading": "Purpose", "text": "Every risk decision — including the feature values that drove it — is written to the audit store so regulators, model-monitoring and customer disputes can trace why a payment was held or blocked."},
        {"heading": "Contract details", "text": "Topic `risk.decisions.audit`, retained 7 years in Cassandra. Encrypted at rest, accessed only through an audit query API with regulator and compliance role-based access control."},
        {"heading": "Failure mode", "text": "If the audit topic is unavailable, the risk engine fails-closed and refuses to score — a decision without an audit trail is not allowed by policy or by the regulator."},
    ],
})

# ---- Components ----------------------------------------------------------
add({
    "tempKey": "comp-orchestrator", "type": "component", "title": "Payment Orchestrator",
    "fields": {"tech": "Java 21, Spring Boot 3", "dataStore": "PostgreSQL (state) + Kafka (events)", "hosting": "Kubernetes, EU-Frankfurt + EU-Amsterdam", "scaling": "Horizontal, autoscaled on CPU + Kafka lag"},
    "relations": {"inApp": ["@app-hub"], "realisesCapability": ["@cap-rt-pay"]},
    "blocks": [
        {"heading": "Responsibility", "text": "Drives a single payment through validation, risk, routing, booking and confirmation. Owns the per-payment state machine and the latency budget for each step. The hub's brain."},
        {"heading": "Technical detail", "text": "Saga pattern over Kafka with PostgreSQL holding the per-payment state row. Step timeouts enforced by a tick scheduler; failed payments fail-closed with a customer-visible reason."},
    ],
})
add({
    "tempKey": "comp-validate", "type": "component", "title": "Validation Service",
    "fields": {"tech": "Java 21, Spring Boot 3", "dataStore": "Stateless; rules in Redis", "hosting": "Kubernetes, EU-Frankfurt + EU-Amsterdam", "scaling": "Horizontal, autoscaled on CPU"},
    "relations": {"inApp": ["@app-hub"], "realisesCapability": ["@cap-validate"]},
    "blocks": [
        {"heading": "Responsibility", "text": "Validates every inbound ISO 20022 message: schema correctness, IBAN structure, BIC validity, scheme rule eligibility (SCT Inst amount cap, SDD mandate presence)."},
        {"heading": "Technical detail", "text": "Pre-loaded JSON schema set, Redis-cached scheme rule lookups, hot rule reload on change without a restart. 100ms p99 latency budget. Rejection events carry a structured reason code."},
    ],
})
add({
    "tempKey": "comp-routing", "type": "component", "title": "Routing Decision Engine",
    "fields": {"tech": "Java 21, Drools rules engine", "dataStore": "PostgreSQL (rules)", "hosting": "Kubernetes, EU-Frankfurt + EU-Amsterdam", "scaling": "Horizontal, autoscaled on CPU"},
    "relations": {"inApp": ["@app-hub"], "realisesCapability": ["@cap-routing"]},
    "blocks": [
        {"heading": "Responsibility", "text": "Chooses the SEPA rail (SCT / SCT Inst / SDD Core / SDD B2B) and the CSM endpoint for every validated instruction, based on amount, urgency, beneficiary BIC and customer entitlements."},
        {"heading": "Technical detail", "text": "Drools rule engine with rules sourced from PostgreSQL and reloadable at runtime. Decision packs are versioned per release; audit trail records which rule pack fired for each routing decision."},
    ],
})
add({
    "tempKey": "comp-sanctions-match", "type": "component", "title": "Sanctions Matcher",
    "fields": {"tech": "Go 1.22, custom Aho-Corasick + fuzzy match", "dataStore": "Cassandra (list snapshots)", "hosting": "Kubernetes, EU-Frankfurt + EU-Amsterdam", "scaling": "Horizontal, autoscaled on RPS"},
    "relations": {"inApp": ["@app-risk"], "realisesCapability": ["@cap-sanctions"]},
    "blocks": [
        {"heading": "Responsibility", "text": "Performs the actual name match against EU, OFAC and bank-internal lists for every payment within the 200ms sanctions latency budget. Returns hit / no-hit plus confidence scores."},
        {"heading": "Technical detail", "text": "Go service hosting a hot-loaded list snapshot in memory; fuzzy match through a custom Aho-Corasick + Damerau-Levenshtein implementation. List refreshes are atomic with an interlock that prevents in-flight requests against a partial list."},
    ],
})
add({
    "tempKey": "comp-fraud-score", "type": "component", "title": "Fraud Scorer",
    "fields": {"tech": "Python 3.12, ONNX Runtime", "dataStore": "Cassandra (features) + Redis (hot cache)", "hosting": "Kubernetes, EU-Frankfurt + EU-Amsterdam", "scaling": "Horizontal, autoscaled on RPS"},
    "relations": {"inApp": ["@app-risk"], "realisesCapability": ["@cap-fraud"]},
    "blocks": [
        {"heading": "Responsibility", "text": "Scores every payment in real time using a gradient-boosted model and a behavioural feature stack. Surfaces the top contributing features for audit and explainability."},
        {"heading": "Technical detail", "text": "Models exported to ONNX and served by Python with ONNX Runtime. Feature store on Cassandra with a Redis hot cache for the last 24h of activity per customer. Champion-challenger A/B routing handled at the orchestrator level."},
    ],
})
add({
    "tempKey": "comp-aml-detect", "type": "component", "title": "AML Pattern Detector",
    "fields": {"tech": "Python 3.12, Apache Flink", "dataStore": "Cassandra (long-window features) + Kafka (events)", "hosting": "Kubernetes, EU-Frankfurt + EU-Amsterdam", "scaling": "Horizontal, autoscaled on Kafka lag"},
    "relations": {"inApp": ["@app-risk"], "realisesCapability": ["@cap-aml-mon"]},
    "blocks": [
        {"heading": "Responsibility", "text": "Detects suspicious transaction patterns (structuring, smurfing, unusual corridors) over rolling windows of customer activity and raises alerts to the AML case management system."},
        {"heading": "Technical detail", "text": "Apache Flink streaming job consuming `payments.booking.completed`, maintaining keyed-state aggregates per customer. Alerts emitted to a Kafka topic the case management system subscribes to. Rule-pack and ML-model packs deployed independently."},
    ],
})
add({
    "tempKey": "comp-position", "type": "component", "title": "Position Keeper",
    "fields": {"tech": "Java, Temenos Transact", "dataStore": "Temenos Transact native (DB2)", "hosting": "On-premises, primary site with hot DR", "scaling": "Vertical (Temenos pattern), capacity planned"},
    "relations": {"inApp": ["@app-core"], "realisesCapability": ["@cap-book"]},
    "blocks": [
        {"heading": "Responsibility", "text": "Holds the customer balance, processes holds and bookings for SEPA payments, emits the booking-completed events the hub and the notification service consume."},
        {"heading": "Technical detail", "text": "Temenos Transact native postings with a CDC pipeline that re-emits booking outcomes onto Kafka. The CDC layer is the only new component the core team owns; postings logic itself is unchanged."},
    ],
})
add({
    "tempKey": "comp-notify-dispatch", "type": "component", "title": "Notification Dispatcher",
    "fields": {"tech": "Node.js 22", "dataStore": "Redis (state)", "hosting": "Kubernetes, EU-Frankfurt + EU-Amsterdam", "scaling": "Horizontal, autoscaled on Kafka lag"},
    "relations": {"inApp": ["@app-notify"], "realisesCapability": ["@cap-notify"]},
    "blocks": [
        {"heading": "Responsibility", "text": "Receives booking-outcome events and pushes a notification to the customer over their preferred channel (push, in-app, SMS, email) with a 30-second SLA from event to device."},
        {"heading": "Technical detail", "text": "Channel-specific adapters for FCM, APNS, Twilio and SendGrid. Delivery state captured in Redis with a 30-day TTL for customer-service search. Fallback chain configured per customer preference."},
    ],
})
add({
    "tempKey": "comp-csm-adapter", "type": "component", "title": "CSM Adapter",
    "fields": {"tech": "Java 21", "dataStore": "PostgreSQL (replay buffer)", "hosting": "On-premises in the CSM zone", "scaling": "Active-active, two nodes"},
    "relations": {"inApp": ["@app-csm"], "realisesCapability": ["@cap-routing"]},
    "blocks": [
        {"heading": "Responsibility", "text": "Translates between the bank's canonical ISO 20022 form and each CSM endpoint's wire format. Handles MQ for STEP2 batch rails and REST for TIPS-style instant endpoints."},
        {"heading": "Technical detail", "text": "Hosted in the CSM security zone with no outbound internet access. PostgreSQL replay buffer holds 30 minutes of in-flight messages so a CSM blip does not lose payments. SWIFT Alliance Gateway sits in front."},
    ],
})
add({
    "tempKey": "comp-recon-worker", "type": "component", "title": "Reconciliation Worker",
    "fields": {"tech": "Java 21, Spring Batch", "dataStore": "PostgreSQL", "hosting": "Kubernetes, scheduled jobs", "scaling": "Single primary, sized for end-of-day batch"},
    "relations": {"inApp": ["@app-hub"], "realisesCapability": ["@cap-recon"]},
    "blocks": [
        {"heading": "Responsibility", "text": "Matches outbound and inbound clearing messages against the hub's own state and against the CSM settlement reports; surfaces unmatched items as breaks for operations to investigate."},
        {"heading": "Technical detail", "text": "Spring Batch jobs running on a cron schedule against the day's hub events, core postings and CSM settlement files. PostgreSQL holds match state and the break list; ops dashboards consume directly."},
    ],
})

# ---- NFRs ----------------------------------------------------------------
add({
    "tempKey": "nfr-latency", "type": "nfr", "title": "SCT Inst end-to-end latency",
    "fields": {"category": "PERFORMANCE", "target": "P99 ≤ 10s, P50 ≤ 4s", "owner": "Payments SRE"},
    "relations": {"appliesTo": ["@app-hub", "@app-risk", "@app-core", "@app-csm"], "drivenByADR": ["@adr-sct-inst-sla"]},
    "blocks": [
        {"heading": "Definition", "text": "Time from a SCT Inst submission at the channel API to the booking-completed event being published. Measured per payment, reported as a 5-minute rolling P50 and P99."},
        {"heading": "Measurement", "text": "OpenTelemetry trace spanning channel → hub → risk → core. Latency histogram exported to Mimir; SLO panels in Grafana on a per-component slice."},
        {"heading": "Verification", "text": "Continuous synthetic SCT Inst flow runs every 30 seconds in production. Regression in P99 of the synthetic flow blocks the release train."},
    ],
})
add({
    "tempKey": "nfr-availability", "type": "nfr", "title": "Payment Hub availability",
    "fields": {"category": "AVAILABILITY", "target": "99.95%, 24/7", "owner": "Payments SRE"},
    "relations": {"appliesTo": ["@app-hub"], "drivenByADR": ["@adr-active-active"]},
    "blocks": [
        {"heading": "Definition", "text": "Fraction of time the SCT Inst submission API responds with non-5xx within the latency SLO. Measured monthly; budget tracked rolling 90 days for change-control gating."},
        {"heading": "Measurement", "text": "Synthetic transactions every 30 seconds plus real-traffic 5xx rate. Both fold into a single SLO computed in the Mimir SLO dashboard."},
        {"heading": "Verification", "text": "Monthly SLO review; budget burn-down triggers a release freeze when 50% of the monthly budget has been consumed in the first ten days of a month."},
    ],
})
add({
    "tempKey": "nfr-throughput", "type": "nfr", "title": "Peak SCT Inst throughput",
    "fields": {"category": "PERFORMANCE", "target": "500 TPS sustained, 1000 TPS burst (60s)", "owner": "Payments SRE"},
    "relations": {"appliesTo": ["@app-hub", "@app-risk"]},
    "blocks": [
        {"heading": "Definition", "text": "Sustained submission rate the hub and the risk engine can process inside the latency SLO. Burst capacity sized for the busiest 60 seconds observed in the legacy SCT volumes, plus 50% headroom."},
        {"heading": "Measurement", "text": "Hourly capacity test in a production-mirror environment using replayed real volumes. Result captured in the capacity dashboard alongside cluster utilisation."},
        {"heading": "Verification", "text": "Quarterly peak-test exercise that runs the production-mirror at 1.5× burst and confirms the latency SLO holds. Sign-off feeds the next-quarter capacity plan."},
    ],
})
add({
    "tempKey": "nfr-sanctions-latency", "type": "nfr", "title": "Sanctions screening latency",
    "fields": {"category": "PERFORMANCE", "target": "P99 ≤ 200ms", "owner": "Financial Crime Engineering"},
    "relations": {"appliesTo": ["@app-risk"], "drivenByADR": ["@adr-sct-inst-sla"]},
    "blocks": [
        {"heading": "Definition", "text": "Time for the Sanctions Matcher to return a verdict for one payment. Hard sub-slice of the SCT Inst latency budget; everything downstream depends on hitting it."},
        {"heading": "Measurement", "text": "Per-call latency captured as an OpenTelemetry span attribute; histogram exported to Mimir with the per-customer-tier breakdown for slow-path analysis."},
        {"heading": "Verification", "text": "Pre-release benchmark on a representative payment volume; regression of more than 20ms blocks the release. Production SLO panel reviewed weekly."},
    ],
})
add({
    "tempKey": "nfr-audit-retention", "type": "nfr", "title": "Audit trail retention",
    "fields": {"category": "COMPLIANCE", "target": "7 years, immutable", "owner": "Financial Crime Engineering"},
    "relations": {"appliesTo": ["@app-risk"], "regulatedBy": []},
    "blocks": [
        {"heading": "Definition", "text": "Every risk decision (verdict and feature values), every booking event and every channel submission stored for at least 7 years in an immutable form accessible to regulators and compliance investigations."},
        {"heading": "Measurement", "text": "Cassandra cluster with WORM-mode storage and a regulator-facing audit query API. Storage usage and oldest-record age tracked on the platform dashboard."},
        {"heading": "Verification", "text": "Quarterly audit-trail integrity check by Internal Audit. Annual regulator-led inspection of the immutability controls and the access query trail."},
    ],
})
add({
    "tempKey": "nfr-dr", "type": "nfr", "title": "Disaster recovery",
    "fields": {"category": "RESILIENCE", "target": "RPO < 60s, RTO < 15min", "owner": "Platform SRE"},
    "relations": {"appliesTo": ["@app-hub", "@app-risk", "@app-csm", "@app-notify"], "drivenByADR": ["@adr-active-active"]},
    "blocks": [
        {"heading": "Definition", "text": "On a complete loss of one EU region, recover full SCT Inst capability in the other region with no more than 60 seconds of data loss and no more than 15 minutes of customer-visible downtime."},
        {"heading": "Measurement", "text": "Continuous replication lag tracked per data store. Automated regional failover drill runs in a production-mirror environment monthly with a quarterly real-traffic exercise."},
        {"heading": "Verification", "text": "Quarterly DR exercise with both regulator-observed and internal-only formats. Findings tracked in the operational risk register; outstanding items block major releases."},
    ],
})
add({
    "tempKey": "nfr-psd2-sca", "type": "nfr", "title": "PSD2 Strong Customer Authentication",
    "fields": {"category": "COMPLIANCE", "target": "100% compliance for in-scope transactions", "owner": "Security Architecture"},
    "relations": {"appliesTo": ["@app-hub"]},
    "blocks": [
        {"heading": "Definition", "text": "Every in-scope SEPA transaction requires Strong Customer Authentication as defined by PSD2 RTS, including the dynamic linking requirement that ties the authentication to the specific amount and beneficiary."},
        {"heading": "Measurement", "text": "Channel attaches the SCA evidence to every payment instruction; the hub validates the evidence and records the SCA method used. Reported monthly to compliance."},
        {"heading": "Verification", "text": "Annual external assurance by the PSP audit firm. Continuous internal sample-based review of SCA evidence against the PSD2 RTS criteria."},
    ],
})
add({
    "tempKey": "nfr-pci", "type": "nfr", "title": "PCI-DSS Level 1 compliance",
    "fields": {"category": "COMPLIANCE", "target": "Annual attestation maintained", "owner": "Security Architecture"},
    "relations": {"appliesTo": ["@app-hub", "@app-notify"]},
    "blocks": [
        {"heading": "Definition", "text": "Although SEPA payments do not directly carry card data, several channels share infrastructure with card payment flows. The shared environment must meet PCI-DSS Level 1 controls to keep the bank's attestation valid."},
        {"heading": "Measurement", "text": "Annual QSA-led audit; quarterly internal control review with the Information Security team. Findings tracked in the PCI register with executive escalation for unremediated highs."},
        {"heading": "Verification", "text": "Annual PCI-DSS Report on Compliance. Independent quarterly penetration testing of the shared infrastructure boundary."},
    ],
})

# ---- Migration Phases ----------------------------------------------------
add({
    "tempKey": "mig-foundation", "type": "migration-phase", "title": "Phase 1 — Foundation",
    "fields": {"phaseStatus": "in-progress", "startQuarter": "2026 Q1", "endQuarter": "2026 Q2", "owner": "Programme — Payments Modernisation"},
    "relations": {"delivers": ["@adr-iso20022", "@adr-event-driven", "@adr-otel"]},
    "blocks": [
        {"heading": "Scope", "text": "Stand up the event backbone (Kafka), the OpenTelemetry observability stack and the ISO 20022 canonical message library. No customer-facing change in this phase; the new infrastructure runs in parallel with the legacy synchronous flow."},
        {"heading": "Acceptance criteria", "text": "- Kafka cluster active-active across two EU regions with documented operational runbooks.\n- OpenTelemetry collector receiving spans from at least three pilot services.\n- ISO 20022 schema library published as an internal package, version 1.0.\n- Architecture Review Board sign-off on the foundation."},
        {"heading": "Risks", "text": "- Kafka operations is a new skill set — hiring + training is on the critical path.\n- Migrating existing telemetry to OpenTelemetry surfaces incomplete instrumentation.\n- ISO 20022 internal model needs vendor alignment that has cross-team dependencies."},
    ],
})
add({
    "tempKey": "mig-consolidate", "type": "migration-phase", "title": "Phase 2 — Risk consolidation",
    "fields": {"phaseStatus": "planned", "startQuarter": "2026 Q3", "endQuarter": "2027 Q1", "owner": "Financial Crime Engineering"},
    "relations": {"dependsOn": ["@mig-foundation"], "delivers": ["@adr-consolidate-risk", "@adr-buy-vs-build-risk"], "resolvesGap": [PG[1]]},
    "blocks": [
        {"heading": "Scope", "text": "Stand up the Real-Time Risk Engine and migrate sanctions, fraud and AML monitoring onto it. Run in shadow alongside the three legacy engines for one quarter, then cut over by rail (SCT first, SCT Inst readiness in Phase 3)."},
        {"heading": "Acceptance criteria", "text": "- Real-Time Risk Engine processes 100% of SCT volume in shadow with verdict parity > 99.5% against the legacy engines.\n- Champion-challenger framework in place for the fraud model.\n- AML alerts continuity demonstrated to the Financial Crime team and signed off."},
        {"heading": "Risks", "text": "- Verdict-parity gap with the legacy fraud engine — likely the schedule risk for the phase.\n- AML model lift-and-shift requires the original vendor's cooperation; commercial negotiation needed.\n- Operational readiness training for the consolidated team is non-trivial."},
    ],
})
add({
    "tempKey": "mig-sct-inst", "type": "migration-phase", "title": "Phase 3 — SCT Inst go-live",
    "fields": {"phaseStatus": "planned", "startQuarter": "2027 Q2", "endQuarter": "2027 Q3", "owner": "Programme — Payments Modernisation"},
    "relations": {"dependsOn": ["@mig-consolidate"], "delivers": ["@adr-sct-inst-sla", "@adr-active-active", "@adr-idempotency"], "resolvesGap": [PG[4]]},
    "blocks": [
        {"heading": "Scope", "text": "Launch SCT Inst on the modernised stack — channel, hub, risk engine, core CDC, notification — for retail customers first, with corporate SCT Inst eligibility expanding through the quarter. 24/7 SCT Inst operations from day one."},
        {"heading": "Acceptance criteria", "text": "- SCT Inst P99 ≤ 10s end-to-end in production for 30 consecutive days.\n- Customer notification reaches devices within 30 seconds of booking.\n- 24/7 on-call rota in place with at least one regional failover drill executed.\n- Regulator notification of go-live completed."},
        {"heading": "Risks", "text": "- Real-traffic peaks may exceed the capacity test envelope — capacity must be commissioned ahead of go-live.\n- 24/7 on-call needs Financial Crime cover that does not exist today.\n- TIPS / RT1 scheme certification windows are unforgiving."},
    ],
})
add({
    "tempKey": "mig-decommission", "type": "migration-phase", "title": "Phase 4 — Legacy decommission",
    "fields": {"phaseStatus": "planned", "startQuarter": "2027 Q4", "endQuarter": "2027 Q4", "owner": "Financial Crime Engineering"},
    "relations": {"dependsOn": ["@mig-sct-inst"], "delivers": ["@adr-consolidate-risk"]},
    "blocks": [
        {"heading": "Scope", "text": "Decommission the legacy Sanctions, Fraud and AML engines, their data feeds and their integration plumbing. Archive their data into the unified audit store. Repurpose or release the on-premises capacity."},
        {"heading": "Acceptance criteria", "text": "- No live consumer of any of the three legacy engines for 90 consecutive days.\n- All historical data archived into the audit store with regulator-facing access verified.\n- Vendor contracts wound down with no auto-renewal exposure."},
        {"heading": "Risks", "text": "- A latent consumer surfaces during the freeze and delays cut-off.\n- Vendor contract termination clauses may need legal-led negotiation."},
    ],
})

# ---- Emit the manifest ---------------------------------------------------
json.dump(
    {
        "slug": SLUG,
        "source": "ArchitectMiner mock — generated by scripts/mock_sepa_architecture.py",
        "elements": elements,
    },
    sys.stdout,
    indent=2,
    ensure_ascii=False,
)
print()
