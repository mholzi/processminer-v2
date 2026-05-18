---
id: FR
type: process
section: overview
title: Funds Release
status: draft
description: The process by which the bank releases funds held against an approved corporate credit facility to a client or counterparty once the agreed release conditions have been met.
confidence: high
source: funds-release-dtp-mockup.md
processOwner: Head of Payment Operations
trigger: Primary: a front-office drawdown request against an approved corporate credit facility. Secondary entry points into the same release queue: a held payment reaching its scheduled release date, and a manual analyst initiation of a flagged item.
frequency: Continuous during business hours — roughly 120 corporate releases per business day.
scopeIn: Release of funds held against an approved corporate credit facility, on both the manual and the straight-through (STP) paths.
scopeOut: Origination and approval of the underlying credit facility; retail customer payments; cross-border settlement mechanics (covered by PRC-OPS-0151).
processInput: A release request carrying the facility ID, amount, currency, value date and beneficiary details, with supporting documents such as the drawdown notice and invoice.
processOutput: Funds posted from the held account to the beneficiary instruction, a release confirmation sent to the front office, and a closed workflow item with a complete audit trail.
docStatus: As-Is draft
approval: approved
approvalBy: M. Berger
approvalDate: 2026-05-17
---
Funds Release is the process by which the bank releases funds held against an approved corporate credit facility to a client or counterparty once the agreed release conditions have been met. It runs continuously during business hours at a volume of roughly 120 corporate releases per business day, on both a straight-through path for clean items and a manual path for items needing analyst handling.

The process is owned end-to-end by the Head of Payment Operations. It is triggered primarily by a front-office drawdown request against an approved facility, and also by a held payment reaching its scheduled release date or a manual analyst initiation of a flagged item. It ends when funds have been posted from the held account to the beneficiary, the front office has been confirmed, and the workflow item is closed with a complete audit trail.
