"""Shared evaluation and validation metric helpers."""
from __future__ import annotations

from typing import Any, Dict, Iterable, List, Tuple


def compute_evidence_coverage(per_question: List[Dict[str, Any]]) -> float:
    scored = [q.get("coverage") for q in per_question if q.get("coverage") is not None]
    if not scored:
        return 0.0
    return sum(scored) / len(scored)


def compute_abstention_accuracy(abstain_results: Iterable[Dict[str, Any]]) -> float:
    results = list(abstain_results)
    if not results:
        return 0.0
    correct = sum(1 for r in results if r.get("correct"))
    return correct / len(results)


def compute_false_positive_rate(abstain_results: Iterable[Dict[str, Any]]) -> float:
    expected = [r for r in abstain_results if r.get("expected")]
    if not expected:
        return 0.0
    false_positives = sum(1 for r in expected if not r.get("no_evidence"))
    return false_positives / len(expected)


def compute_judge_distribution(hits: Iterable[Dict[str, Any]]) -> Dict[str, int]:
    counts = {"Strong": 0, "Solid": 0, "Weak": 0, "Poor": 0}
    for hit in hits:
        score = float(hit.get("judge01", hit.get("score", 0.0)) or 0.0)
        if score >= 0.7:
            counts["Strong"] += 1
        elif score >= 0.5:
            counts["Solid"] += 1
        elif score >= 0.3:
            counts["Weak"] += 1
        else:
            counts["Poor"] += 1
    return counts


def compute_latency_metrics(latencies: List[float]) -> Dict[str, float]:
    if not latencies:
        return {"mean": 0.0, "p95": 0.0, "max": 0.0}
    ordered = sorted(latencies)
    idx = int(round(0.95 * (len(ordered) - 1)))
    p95 = ordered[idx]
    return {
        "mean": sum(latencies) / len(latencies),
        "p95": p95,
        "max": max(latencies),
    }


def compute_corpus_ready(corpus_report: Dict[str, Any]) -> Tuple[List[str], int]:
    corpora = corpus_report.get("by_corpus", {})
    if not corpora and isinstance(corpus_report, dict):
        corpora = {row.get("publisher"): row for row in corpus_report.get("rows", [])}
    ready = [name for name, row in corpora.items() if row.get("ok")]
    return sorted(ready), len(ready)


def compute_llm_stats(results: Iterable[Dict[str, Any]]) -> Dict[str, int]:
    used = 0
    abstained = 0
    for result in results:
        flags = (result.get("meta", {}) or {}).get("flags", {}) or {}
        if flags.get("llm_used"):
            used += 1
        if flags.get("llm_abstained"):
            abstained += 1
    return {"llm_used": used, "llm_abstained": abstained}


def compute_validation_checks(summary: Dict[str, Any], criteria: Dict[str, Any]) -> Dict[str, Any]:
    min_coverage = float(criteria.get("min_evidence_coverage", 0.0))
    max_fp = float(criteria.get("max_false_positive_rate", 1.0))
    sla_latency = float(criteria.get("sla_latency_p95_s", float("inf")))
    min_judge_rate = float(criteria.get("min_judge_strong_solid_rate", 0.0))
    min_corpus_ready = int(criteria.get("min_corpus_ready", 0))

    judge_dist = summary.get("judge_distribution", {}) or {}
    total_judge = sum(judge_dist.values())
    strong_solid = judge_dist.get("Strong", 0) + judge_dist.get("Solid", 0)
    judge_rate = (strong_solid / total_judge) if total_judge else 0.0

    checks = {
        "coverage_ok": summary.get("evidence_coverage", 0.0) >= min_coverage,
        "false_positive_ok": summary.get("false_positive_rate", 0.0) <= max_fp,
        "latency_ok": summary.get("latency_p95_s", 0.0) <= sla_latency,
        "judge_rate_ok": judge_rate >= min_judge_rate,
        "corpus_ready_ok": summary.get("corpus_ready_count", 0) >= min_corpus_ready,
    }
    return {
        "criteria": criteria,
        "checks": checks,
        "judge_strong_solid_rate": round(judge_rate, 3),
        "all_pass": all(checks.values()),
    }
