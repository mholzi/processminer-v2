---
id: SYS-FR-003
type: system
section: systems
title: Sanctions Screening Engine
status: draft
confidence: high
source: funds-release-dtp-mockup.md
systemType: CORE
approval: approved
approvalBy: m.berger
approvalDate: 2026-05-18
---
## Purpose
Engine that screens release items against external sanctions lists and AML rules.

## Role in this process
Screens every release item for sanctions and AML hits in real time, passing clean items and flagging potential hits for adjudication. It carries CP-FR-002 and depends on an inbound daily feed of the external OFAC, EU and UN sanctions lists.
