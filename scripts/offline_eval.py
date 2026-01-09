"""Run an offline evaluation suite for the RAG engine."""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from hf_space import rag_engine as rag

from eval_metrics import (
    compute_abstention_accuracy,
    compute_corpus_ready,
    compute_evidence_coverage,
    compute_false_positive_rate,
    compute_judge_distribution,
    compute_latency_metrics,
    compute_llm_stats,
    compute_validation_checks,
)

def _load_eval_set(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _norm(value: str | None) -> str:
    return (value or "").strip().lower()


def _match_expected(hit: Dict[str, Any], expected: Dict[str, Any]) -> bool:
    pub_expected = _norm(expected.get("publisher"))
    if pub_expected:
        pub_hit = _norm(hit.get("publisher") or hit.get("corp"))
        if pub_hit != pub_expected:
            return False
    fp_expected = _norm(expected.get("fp"))
    if fp_expected and _norm(hit.get("fp")) != fp_expected:
        return False
    sec_expected = _norm(expected.get("sec"))
    if sec_expected and _norm(hit.get("sec")) != sec_expected:
        return False
    return True


def _evaluate(engine: rag.Eng, eval_set: Dict[str, Any]) -> Dict[str, Any]:
    questions = eval_set.get("questions", [])
    coverage_scores = []
    abstain_results = []
    latencies = []
    all_hits = []
    per_question = []
    raw_results = []
    use_llm = bool(int(os.getenv("RAG_EVAL_USE_LLM", "0")))

    for item in questions:
        question = item.get("question")
        expected = item.get("expected_citations", [])
        expect_abstain = bool(item.get("expect_abstain"))
        mode = item.get("mode")
        t_start = time.perf_counter()
        result = rag.run_query(engine, question, mode=mode, use_llm=use_llm)
        elapsed = time.perf_counter() - t_start
        meta = result.get("meta", {}) or {}
        latency = float(meta.get("t", {}).get("total") or elapsed)
        latencies.append(latency)
        raw_results.append(result)

        hits = result.get("hits", []) or []
        matched = 0
        if expected:
            for exp in expected:
                if any(_match_expected(hit, exp) for hit in hits):
                    matched += 1
            coverage = matched / max(1, len(expected))
            coverage_scores.append(coverage)
        else:
            coverage = None

        no_evidence = bool(result.get("no_evidence"))
        abstain_correct = (no_evidence and expect_abstain) or (not no_evidence and not expect_abstain)
        abstain_results.append({
            "expected": expect_abstain,
            "no_evidence": no_evidence,
            "correct": abstain_correct,
        })

        all_hits.extend(hits)

        per_question.append(
            {
                "id": item.get("id"),
                "question": question,
                "no_evidence": no_evidence,
                "expected_citations": expected,
                "matched_citations": matched,
                "coverage": coverage,
                "latency_s": round(latency, 4),
            }
        )

    corpus_report = rag.get_startup_report(engine)
    corpus_ready, corpus_ready_count = compute_corpus_ready(corpus_report)
    coverage_avg = compute_evidence_coverage(per_question)
    abstain_accuracy = compute_abstention_accuracy(abstain_results)
    false_positive_rate = compute_false_positive_rate(abstain_results)
    judge_counts = compute_judge_distribution(all_hits)
    latency_stats = compute_latency_metrics(latencies)
    llm_stats = compute_llm_stats(raw_results)

    return {
        "summary": {
            "total_questions": len(questions),
            "evidence_coverage": round(coverage_avg, 3),
            "abstention_accuracy": round(abstain_accuracy, 3),
            "false_positive_rate": round(false_positive_rate, 3),
            "latency_mean_s": round(latency_stats["mean"], 4),
            "latency_p95_s": round(latency_stats["p95"], 4),
            "latency_max_s": round(latency_stats["max"], 4),
            "judge_distribution": judge_counts,
            "corpus_ready": sorted(corpus_ready),
            "corpus_ready_count": corpus_ready_count,
            "llm_used_count": llm_stats["llm_used"],
            "llm_abstained_count": llm_stats["llm_abstained"],
        },
        "per_question": per_question,
        "corpus_report": corpus_report,
    }


def _check_acceptance(report: Dict[str, Any], criteria: Dict[str, Any]) -> Dict[str, Any]:
    summary = report.get("summary", {})
    return compute_validation_checks(summary, criteria)


def main() -> int:
    parser = argparse.ArgumentParser(description="Run offline RAG evaluation set.")
    parser.add_argument(
        "--eval-set",
        default="hf_space/data/eval/offline_eval_set.json",
        help="Path to the evaluation set JSON file.",
    )
    parser.add_argument(
        "--output",
        default=None,
        help="Optional output path for the evaluation report JSON.",
    )
    parser.add_argument(
        "--local-only",
        action="store_true",
        help="Force local-only embedding model loading (sets RAG_EMBED_LOCAL_ONLY=1).",
    )
    args = parser.parse_args()

    eval_path = Path(args.eval_set)
    if not eval_path.exists():
        print(f"Eval set not found: {eval_path}", file=sys.stderr)
        return 2

    if args.local_only:
        os.environ["RAG_EMBED_LOCAL_ONLY"] = "1"
    else:
        proxy = os.getenv("HTTPS_PROXY") or os.getenv("https_proxy")
        if proxy and not os.getenv("RAG_EMBED_LOCAL_ONLY"):
            print(
                "Warning: HTTPS proxy detected and RAG_EMBED_LOCAL_ONLY is not set. "
                "If model downloads fail, rerun with --local-only or set RAG_EMBED_LOCAL_ONLY=1.",
                file=sys.stderr,
            )

    eval_set = _load_eval_set(eval_path)
    criteria = eval_set.get("acceptance_criteria", {})

    engine = rag._mk_eng()
    report = _evaluate(engine, eval_set)
    report["acceptance"] = _check_acceptance(report, criteria)

    output = json.dumps(report, indent=2)
    if args.output:
        Path(args.output).write_text(output, encoding="utf-8")
    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
