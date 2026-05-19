#!/usr/bin/env python3
"""Single source of truth for the canonical fixed strings a skill must present
to the SME word-for-word.

Each chat turn runs as a fresh `claude -p` process. A skill that re-types a
"verbatim" line from memory drifts it — observed: foundational-run's outcome
line silently lost its `[D] Deep dive` option mid-run. This script holds those
strings once. A skill prints the string (directly, or via another script that
embeds it) and relays the output instead of authoring the line itself.

  verbatim.py <key>     print the canonical string for <key>
  verbatim.py --list    list available keys

Importable:  from verbatim import get, STRINGS

Strings carry `{...}` placeholders — the skill substitutes those, but every
other character (option letters, punctuation, bullet labels, the closing
sentence) is fixed and must be reproduced exactly. `{if ...}` lines are
conditional: keep the line/block when its condition holds, omit it otherwise.
"""

from __future__ import annotations

import sys

STRINGS: dict[str, str] = {
    # ── foundational-run ────────────────────────────────────────────────
    "foundational-outcomes": (
        "**[Y] Approve** · **[E] Rework** · **[D] Deep dive** · "
        "or tell me to **move on**"
    ),
    "foundational-closeout": (
        "Foundational run complete — **{process}**:\n"
        "\n"
        "- **Approved:** {n} current-state element(s)\n"
        "- **Deferred:** {n} — visited but left in-progress; pick them off "
        "on the cards any time\n"
        "\n"
        "{if any current-state elements were created mid-run:}\n"
        "**Created during the run — still need review:** {n} current-state "
        "element(s) the queue could not cover — challenge these next:\n"
        "- **{element id} · {title}** — {type}\n"
        "\n"
        "{if any gaps were created mid-run:}\n"
        "The run also recorded {n} gap(s) — {ids} — these are open by design.\n"
        "\n"
        "The As-Is baseline is now documented and reviewed. From here, when "
        "you ingest further documents into this process, content that "
        "contradicts this baseline is a **conflict** — run the "
        "**conflict-resolution** skill to work through those."
    ),

    # ── new-process ─────────────────────────────────────────────────────
    "newprocess-choices": (
        "**[Y] Yes — accept** · **[E] Edit — I have corrections** · "
        "**[R] Rewrite — redo the description**"
    ),
    "newprocess-closeout": (
        "**{process}** has been successfully created, and the app has "
        "switched to it.\n"
        "\n"
        "The process is empty — every section is ready to be filled. The "
        "fastest way to start is to **upload a process document**: click "
        "**⬆ Upload document** in the top bar and drag in a PDF, Word or "
        "Markdown file. I'll review it, summarise it, and extract its "
        "content into the wiki.\n"
        "\n"
        "Prefer to talk it through instead? Just ask me to **run a "
        "documentation session** and I'll guide you through it question by "
        "question."
    ),

    # ── document-ingest ─────────────────────────────────────────────────
    "ingest-summary": (
        "I've reviewed **{file}**. Here is a summary:\n"
        "\n"
        "{summary}\n"
        "\n"
        "---\n"
        "Shall I extract this document's content into the **{process}** "
        "wiki?\n"
        "\n"
        "**[Y] Yes, extract it** · **[N] No, keep the upload only**"
    ),
    "ingest-report": (
        "Extraction complete — from **{file}**:\n"
        "\n"
        "- **Created:** {n} new element(s)\n"
        "- **Updated:** {n} existing element(s)\n"
        "- **Overview:** {filled | refined | left as-is — the document adds "
        "nothing}{, and: description corrected to match the document — if "
        "you corrected it}\n"
        "- **Verified:** every draft checked against the document; "
        "{n} corrected\n"
        "- **Conflicts:** {n} — left unchanged for you to resolve\n"
        "\n"
        "{one line per verification correction:}\n"
        "- **{element id} · {block or field}** — removed: "
        "{the unsupported claim}\n"
        "\n"
        "{one line per conflict:}\n"
        "- **{element id} · {block or field}** — the document says: {a}; "
        "the wiki says: {b}\n"
        "\n"
        "The document is recorded as a source of this process. Review the "
        "drafts and approve them in the app."
    ),

    # ── interactive perspective specialists — shared close-out ──────────
    # {Perspective}: Process / Risk & Compliance / Client Experience /
    # IT Architecture / Innovation / Target Process.
    "specialist-closeout": (
        "{Perspective} perspective documented — **{process}**:\n"
        "\n"
        "- **Drafted:** {n} element(s)\n"
        "- **By type:** {type} {n} · {type} {n} · …\n"
        "\n"
        "Everything is `status: draft` — review and approve the elements in "
        "the web app. Approval is your decision there."
    ),

    # ── qer-session ─────────────────────────────────────────────────────
    "qer-closeout": (
        "QER session complete — **{process}**:\n"
        "\n"
        "- **Documented:** {n} element(s) across {n} perspective(s)\n"
        "- **By type:** {type} {n} · {type} {n} · …\n"
        "\n"
        "Everything is `status: draft` — review and approve the elements in "
        "the web app. Approval is your decision there, not mine here."
    ),

    # ── conflict-resolution ─────────────────────────────────────────────
    "conflict-report": (
        "Conflict resolution complete — **{process}**:\n"
        "\n"
        "- **Document version taken:** {n}\n"
        "- **Wiki version kept:** {n}\n"
        "- **Merged:** {n}\n"
        "\n"
        "The conflicts are cleared. Review any changed elements on the cards."
    ),

    # ── run-lint ────────────────────────────────────────────────────────
    "lint-report": (
        "Lint pass complete — **{process}**:\n"
        "\n"
        "- **Discrepancies:** {n}\n"
        "- **Structure issues:** {n}\n"
        "- **Clarifying questions:** {n}\n"
        "- **Approvals re-opened:** {n}\n"
        "\n"
        "The findings are in the Review panel — click any element ID to "
        "jump to it."
    ),
    "lint-report-clean": (
        "Lint pass complete — **{process}**: no findings. Every element "
        "conforms to its template and the wiki is consistent across all "
        "five perspectives."
    ),

    # ── source-cx ───────────────────────────────────────────────────────
    "source-cx-report": (
        "Client-experience scan complete for **{process}** from the web:\n"
        "\n"
        "- **Competitor CX:** {n} drafted — {e} European, {g} global, "
        "{f} fintech\n"
        "- **CX benchmarks:** {n} drafted\n"
        "\n"
        "Sources: {comma-separated list of the studies / reports used}\n"
        "\n"
        "All are `status: draft` — review and approve them in the app, or "
        "run the client-journey-specialist to refine them and document the "
        "journey itself."
    ),

    # ── source-regulation ───────────────────────────────────────────────
    "source-regulation-report": (
        "Regulatory scan complete for **{process}** from the web:\n"
        "\n"
        "- **Regulations:** {n} drafted\n"
        "\n"
        "Sources: {comma-separated list of the regulations / publications "
        "used}\n"
        "\n"
        "All are `status: draft` — review and approve them in the app, or "
        "run the control & compliance specialist to refine them and map "
        "them to controls."
    ),

    # ── source-innovation ───────────────────────────────────────────────
    "source-innovation-report": (
        "Innovation sourced for **{process}** from the web:\n"
        "\n"
        "- **Market trends:** {n} drafted\n"
        "- **Competitor moves:** {n} drafted — {e} European, {g} global, "
        "{f} fintech\n"
        "- **Innovation ideas:** {n} drafted — each linked to the pain or "
        "friction it addresses\n"
        "\n"
        "{if web search was unavailable:}\n"
        "Web search was unavailable this run — the drafts above rest on "
        "domain knowledge only, written at `confidence: low`.\n"
        "\n"
        "{if any `sourceUrl: pending` element was filled or left pending:}\n"
        "Pending citations: {n} filled — {ids}; {n} still pending — {ids} — "
        "the web did not support them.\n"
        "\n"
        "Sources: {comma-separated list of the studies / reports used}\n"
        "\n"
        "All are `status: draft` — review and approve them in the app, or "
        "run the innovation-analyst for the deeper forward-looking work."
    ),

    # ── source-target ───────────────────────────────────────────────────
    "source-target-report": (
        "Target Process stubbed for **{process}** by consolidating the "
        "documented work:\n"
        "\n"
        "- **Target states:** {n} drafted — each linked to the As-Is steps "
        "it replaces\n"
        "- **Transformation decisions:** {n} drafted — each linked to the "
        "problems it resolves\n"
        "- **Gaps:** {n} drafted\n"
        "\n"
        "Consolidated from: {n} pain/process gaps, {n} compliance gaps / "
        "audit findings, {n} friction points, {n} innovation ideas.\n"
        "\n"
        "All are `status: draft`, `confidence: low` — a first stub. Run the "
        "**transformation-agent** to refine it with the SME, then approve "
        "in the app."
    ),
}


def get(key: str) -> str:
    """Return the canonical string for `key`; raise KeyError if unknown."""
    if key not in STRINGS:
        raise KeyError(key)
    return STRINGS[key]


def main(argv: list[str]) -> None:
    if argv == ["--list"]:
        for k in STRINGS:
            print(k)
        return
    if len(argv) != 1 or argv[0] not in STRINGS:
        sys.exit(
            "usage: verbatim.py <key|--list>\nkeys: " + ", ".join(STRINGS)
        )
    print(STRINGS[argv[0]])


if __name__ == "__main__":
    main(sys.argv[1:])
