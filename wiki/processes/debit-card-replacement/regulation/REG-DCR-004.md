---
id: REG-DCR-004
type: regulation
section: regulation
title: PCI DSS — Payment Card Industry Data Security Standard
status: draft
confidence: medium
source: PCI DSS — cardholder-data security standard (banking guidance)
domain: Information Security
sourceUrl: https://gdprlocal.com/gdpr-credit-card-data/
provenance: {"How it is met": {"evidence": "https://gdprlocal.com/gdpr-credit-card-data/ — \"maintaining secure networks and firewalls, and performing regular vulnerability testing\" — fetched 2026-05-19", "source": "web"}, "What it requires": {"evidence": "https://gdprlocal.com/gdpr-credit-card-data/ — \"encrypting cardholder data during transmission and storage, implementing strict access controls\" — fetched 2026-05-19", "source": "web"}, "Why it applies": {"evidence": "https://gdprlocal.com/gdpr-credit-card-data/ — \"Any banking app that processes, stores, or transmits card information must comply with PCI DSS requirements\" — fetched 2026-05-19", "source": "web"}}
asOf: 2026-05-19
---
## What it requires
PCI DSS requires that cardholder data — primary account numbers above all — is encrypted in storage and in transit, kept behind strict access controls and secure networks, and regularly tested.

## Why it applies
The process reads, blocks and reissues card numbers and instructs an external bureau to produce a card carrying a new number — all handling of cardholder data that the standard governs.

## How it is met
Cardholder-data protection is provided by the Card Management System and the bureau interface at platform level rather than by a process-specific control; the mapping is to be confirmed with the SME.
