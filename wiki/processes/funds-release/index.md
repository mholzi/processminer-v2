---
id: FR
type: process
title: Funds Release
status: draft
description: Releases held or pending funds to the customer once all required verification and approval checks are complete.
processOwner: Head of Payment Operations
trigger: Front-office drawdown request against an approved facility · Held payment reaching its scheduled release date · Operations analyst manually initiating release of a flagged item
frequency: Approximately 2,000 releases per day
scopeIn: Release of funds held against an approved corporate credit facility, release following completed beneficiary and sanctions verification, manual and straight-through (STP) release paths
scopeOut: Origination and approval of the underlying credit facility, retail customer payments, cross-border settlement mechanics (covered by PRC-OPS-0151)
processInput: Facility ID, amount, currency, value date, beneficiary details, supporting documents (drawdown notice, invoice)
processOutput: Posted fund movement, front-office confirmation, completed audit trail
docStatus: empty
sources: [funds-release-dtp-mockup.md]
approval: approved
approvalBy: Markus Holzhauser
approvalDate: 2026-05-17
---
Funds Release is the controlled release of funds held in a blocked or pending
state until all release conditions — validation, compliance screening, and
approvals — have been satisfied. It runs on both a straight-through and a
manual path, and carries the bank's exposure at the point funds actually leave
the held account.
