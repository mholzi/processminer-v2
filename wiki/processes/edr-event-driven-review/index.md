---
id: EDR
type: process
section: overview
title: EDR - Event Driven Review
status: draft
description: The process for reviewing and updating a client's KYC file in response to a triggering event.
sources: [event-driven-review.md]
confidence: high
source: event-driven-review.md
processOwner: Head of Financial Crime Operations
trigger: A review event is raised against a live customer: a transaction-monitoring alert escalated beyond first-line dismissal; a sanctions, PEP, or adverse-media screening hit confirmed; a fraud incident closing with the customer still active; a material customer data change (beneficial ownership, address, source of wealth); or an external referral from a regulator, law enforcement, or correspondent bank.
frequency:
scopeIn: Retail and corporate customers (excluding correspondent banks). Reviews triggered by transaction-monitoring escalations, sanctions/PEP screening hits, adverse media hits, fraud incidents, and material customer data changes.
scopeOut: Scheduled periodic KYC reviews (PRC-AML-0410, Periodic Review); new customer onboarding (PRC-ONB-0101); suspicious-activity reporting to authorities (PRC-AML-0420); account closure due to risk (PRC-RET-0301, Corporate Account Closure).
processInput: Trigger event; current risk rating; prior KYC pack; transaction history.
processOutput: Refreshed KYC pack; new risk rating; EDR decision (retain at standard monitoring / retain at enhanced monitoring / recommend exit); next review date.
docStatus: As-Is draft
---
The Event-Driven Review (EDR) process re-assesses a customer relationship when an event signals that the customer's risk profile may have changed. EDR sits between scheduled periodic KYC reviews — it ensures customer due diligence is refreshed when something material happens rather than waiting for the next periodic cycle. The process captures the current-state approach to event-triggered CDD refresh, risk re-assessment, and the retention or exit decision.
