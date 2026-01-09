# Offline Evaluation

This repository includes an offline evaluation set and a runner to measure retrieval quality and operational readiness.

## Evaluation set

* **Path**: `hf_space/data/eval/offline_eval_set.json`
* **Contents**: Representative questions with expected citations (publisher, file path, section) plus abstention cases.
* **Acceptance criteria**: Defined alongside the evaluation set (`min_evidence_coverage`, `max_false_positive_rate`, `sla_latency_p95_s`).

## Metrics tracked

The offline runner reports:

* **Evidence coverage**: Average fraction of expected citations that appear in returned hits.
* **Abstention accuracy**: Whether the engine abstains when it should (no evidence) and answers when it should not.
* **Judge distribution**: Counts of Strong/Solid/Weak/Poor buckets based on `judge01` scores.
* **Latency**: Mean, p95, and max total query time from the engine metadata.
* **Corpus readiness**: Publisher readiness summary from the startup report.
* **LLM usage**: Counts of LLM calls and LLM abstentions when the optional LLM evaluation mode is enabled.

## Running the evaluation

```bash
python scripts/offline_eval.py --eval-set hf_space/data/eval/offline_eval_set.json
```

To include the LLM knowledge foundation checks (requires `RAG_LLM_ENDPOINT` and credentials):

```bash
RAG_EVAL_USE_LLM=1 python scripts/offline_eval.py --eval-set hf_space/data/eval/offline_eval_set.json
```

To save a report:

```bash
python scripts/offline_eval.py --output reports/offline_eval_report.json
```

If you need to avoid network downloads for embeddings, use `--local-only`:

```bash
python scripts/offline_eval.py --local-only --eval-set hf_space/data/eval/offline_eval_set.json
```

The output is a JSON report that includes per-question coverage, overall metrics, and acceptance checks.

## Validation checklist and thresholds

After major retrieval or judge changes, validate the following categories:

### RAG base tests

1. **Corpus readiness**: `corpus_ready_count` meets `min_corpus_ready`.
2. **Evidence coverage**: `evidence_coverage` meets `min_evidence_coverage`.
3. **Abstention accuracy**: `abstention_accuracy` is stable and `false_positive_rate` stays below `max_false_positive_rate`.
4. **Latency SLA**: `latency_p95_s` is below `sla_latency_p95_s`.

### Judge tests

1. **Judge distribution**: `judge_strong_solid_rate` meets `min_judge_strong_solid_rate`.
2. **Regression scan**: review per-question coverage for any missing expected citations.

### LLM knowledge foundation tests (optional)

1. Enable `RAG_EVAL_USE_LLM=1` and confirm non-zero `llm_used_count` when LLM is configured.
2. Verify LLM abstentions align with `no_evidence` cases via `llm_abstained_count` and per-question coverage.

Thresholds are defined in the evaluation set (`hf_space/data/eval/offline_eval_set.json`) under `acceptance_criteria`.
