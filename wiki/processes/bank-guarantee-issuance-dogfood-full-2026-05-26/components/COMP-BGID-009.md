---
id: COMP-BGID-009
type: component
section: components
title: Facility Utilisation Write Subscriber
status: draft
confidence: high
source: Markus Holzhäuser, Domain Architect — batch review session 2026-05-26
tech: Java 11 / Spring Boot 2.7 / Spring Kafka
dataStore: Murex Oracle operational database (write)
hosting: On-prem Murex infrastructure, EU data centre
scaling: Single consumer (serialised writes to avoid Murex concurrency conflicts)
inApp: [TGTAPP-BGID-004]
realisesCapability: [CAP-BGID-005]
updatedBy: Markus Holzhäuser
updatedAt: 2026-05-26T15:58:45Z
approval: approved
approvalBy: Markus Holzhäuser
approvalDate: 2026-05-26
---
## Responsibility
Subscribes to bgid.facility.utilisation.v1 and writes post-issuance facility utilisation updates back into Murex MX.3. Guarantees idempotent processing of re-delivered events; ensures utilisation is reflected in Murex within 1 business day of guarantee issuance.

## Technical detail
Java 11, Spring Boot 2.7, Spring Kafka. Consumer group bgid-murex-util-write (single consumer for serialised writes). Writes to Murex MX.3 Position API. Idempotency: applicationId checked against a Murex deduplication table before write. Dead-letter to bgid.facility.dlq on persistent failure. Murex on-prem cluster, EU data centre.
