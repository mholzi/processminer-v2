---
id: II-BGIT-001
type: innovation-idea
section: innovation-ideas
title: Adopt ICC-SWIFT C2B API for structured corporate guarantee intake
status: draft
confidence: medium
category: digitization
strategicFit: HIGH
complexity: HIGH
addresses: [PP-BGIT-003, CG-BGIT-001, PG-BGIT-002]
fromTrend: [TR-BGIT-001]
fromCompetitor: [CEU-BGIT-001, CGL-BGIT-002, CFT-BGIT-001]
provenance: {"Expected benefit": {"evidence": "https://www.sc.com/en/press-release/standard-chartered-completes-first-icc-swift-api-standards-digital-bank-guarantee-transaction-through-komgo/ — \"automates the receipt of instructions … offering clients greater speed, transparency and reliability\" — fetched 2026-05-20", "source": "web"}, "Feasibility": {"evidence": "https://ctmfile.com/story/icc-and-swift-launch-trade-finance-api-standards-industry-roundup-23-august — \"Seven banks are already in the process of implementing C2B Guarantee APIs\" — fetched 2026-05-20", "source": "web"}, "The idea": {"evidence": "https://iccwbo.org/news-publications/news/icc-and-swift-unveil-first-api-standards-for-guarantees-and-standby-letters-of-credit/ — ICC-SWIFT API standard published October 2025; production-proven via Standard Chartered January 2026 — fetched 2026-05-20", "source": "web"}}
---
## The idea
Adopt the ICC-SWIFT C2B API standard to receive corporate guarantee instructions directly from clients' ERP or treasury systems — or via a Komgo-type multi-bank portal — replacing the manual portal form with a structured, validated instruction set that is complete by construction.

## Expected benefit
Eliminates the completeness-check control gap at intake (CG-BGIT-001) and the email-only handoff bottleneck (PG-BGIT-002), reducing incomplete-application follow-up delays and their root cause documented in PP-BGIT-003.

## Feasibility
Requires Trade Finance System integration with an ICC-SWIFT API gateway; complexity is HIGH given core-system dependencies, but the standard is production-proven with seven banks live. Client-side ERP adoption is the primary dependency.
