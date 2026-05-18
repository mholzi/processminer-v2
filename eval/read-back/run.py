#!/usr/bin/env python3
"""Run the scoped read-back eval (HALLUCINATION-PLAN.md T10/D9).

Each fixture in `fixtures.json` carries two reference read-backs:
  goodReadback — an honest read-back that names every AI addition
  badReadback  — a rubber-stamp that names none

The eval asserts the grader behaves: every `goodReadback` must PASS (score at
or above the threshold) and every `badReadback` must FAIL. A grader that passes
a rubber-stamp, or fails an honest read-back, is itself broken — that is what
this run catches.

To eval a real skill run: capture the read-back text the skill produced for a
case and call `grade_readback(text, case["additions"])` from grade.py. Wire
that into a skill-transcript harness when one exists; this run covers the
grader and the fixtures today.

  python3 eval/read-back/run.py        exit 0 if the eval is sound, 1 otherwise
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from grade import grade_readback  # noqa: E402

HERE = Path(__file__).resolve().parent


def main() -> None:
    data = json.loads((HERE / "fixtures.json").read_text(encoding="utf-8"))
    threshold = float(data.get("passThreshold", 0.99))
    cases = data["cases"]

    passed = 0
    failed = 0

    for case in cases:
        additions = case["additions"]
        good = grade_readback(case["goodReadback"], additions)
        bad = grade_readback(case["badReadback"], additions)

        good_ok = good["score"] >= threshold
        bad_ok = bad["score"] < threshold  # a rubber-stamp must NOT pass

        if good_ok and bad_ok:
            passed += 1
            print(f"  PASS  {case['id']} ({case['skill']})  "
                  f"good={good['score']:.2f} bad={bad['score']:.2f}")
        else:
            failed += 1
            print(f"  FAIL  {case['id']} ({case['skill']})")
            if not good_ok:
                print(f"        honest read-back scored {good['score']:.2f} "
                      f"< {threshold} — missed: {', '.join(good['missed'])}")
            if not bad_ok:
                print(f"        rubber-stamp scored {bad['score']:.2f} "
                      f">= {threshold} — grader is too loose")

    print(f"\n=========  read-back eval: {passed} passed, {failed} failed  =========")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
