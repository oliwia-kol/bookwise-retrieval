from pathlib import Path

import numpy as np

import rag_engine


class DummyIndex:
    def __init__(self, dim=3):
        self.d = dim


class DummyModel:
    def __init__(self, *_args, **_kwargs):
        pass

    def get_sentence_embedding_dimension(self):
        return 3


def test_mk_eng_reports_ready_and_failure(monkeypatch, tmp_path):
    monkeypatch.setattr(rag_engine, "CORP", {"Alpha": Path("Alpha"), "Beta": Path("Beta")})
    monkeypatch.setattr(rag_engine, "SentenceTransformer", DummyModel)
    monkeypatch.setattr(rag_engine.faiss, "read_index", lambda _path: DummyIndex(3))

    alpha = tmp_path / "Alpha"
    beta = tmp_path / "Beta"
    alpha.mkdir()
    beta.mkdir()
    for folder in (alpha, beta):
        (folder / "index.faiss").write_text("index")
        (folder / "meta.sqlite").write_text("db")
    (alpha / "manifest.json").write_text("{}")

    eng = rag_engine._mk_eng(base_out=tmp_path)

    assert "Alpha" in eng.corp
    assert "Beta" not in eng.corp
    assert eng.corp_report["Alpha"]["ready"] is True
    assert eng.corp_report["Beta"]["ready"] is False
    assert "missing" in eng.corp_report["Beta"]["failure_reason"]


def test_norm_scores_handles_flat_and_range():
    flat = [{"score": 1.0}, {"score": 1.0}]
    rag_engine.norm_scores(flat, "score")
    assert all(item["score_n"] == 0.0 for item in flat)

    varied = [{"score": 1.0}, {"score": 3.0}, {"score": 2.0}]
    rag_engine.norm_scores(varied, "score")
    assert varied[0]["score_n"] == 0.0
    assert varied[1]["score_n"] == 1.0
    assert 0.0 < varied[2]["score_n"] < 1.0


def test_hybrid_retrieve_fusion(monkeypatch):
    def fake_dense(_e, _corp, _qv, k):
        return (
            [
                {
                    "cid": 1,
                    "cidx": 0,
                    "fp": "file",
                    "tx": "dense text",
                    "sec": "sec",
                    "corp": "Pub",
                    "sem_score_n": 0.8,
                }
            ],
            {"fallback_retries": 0, "fallback_failed": 0, "clamped_k": False},
        )

    def fake_lex(_e, _corp, _q, k):
        return (
            [
                {
                    "cid": 1,
                    "cidx": 0,
                    "fp": "file",
                    "tx": "lex text",
                    "sec": "sec",
                    "corp": "Pub",
                    "lex_score_n": 0.2,
                }
            ],
            {"clamped_k": False},
        )

    monkeypatch.setattr(rag_engine, "dense_retrieve", fake_dense)
    monkeypatch.setattr(rag_engine, "lex_retrieve", fake_lex)

    eng = rag_engine.Eng(
        emb=None,
        ix={},
        dbp={},
        corp={"Pub": Path("Pub")},
        ix_dim={},
        corp_report={},
    )

    hits, meta = rag_engine.hybrid_retrieve(eng, "query", k=5, qv=np.array([1.0], dtype="float32"))

    assert hits
    expected = rag_engine.HCFG["fusion_dense_w"] * 0.8 + rag_engine.HCFG["fusion_lex_w"] * 0.2
    assert hits[0]["score"] == expected
    assert meta["dense_hits"] == 1
    assert meta["lex_hits"] == 1


def test_normalize_query_calls_faiss(monkeypatch):
    called = {"count": 0}

    def fake_norm(arr):
        called["count"] += 1

    monkeypatch.setattr(rag_engine.faiss, "normalize_L2", fake_norm)

    vec = np.array([1.0, 2.0], dtype="float32")
    out = rag_engine._normalize_query(vec)

    assert called["count"] == 1
    assert out.shape == vec.shape
