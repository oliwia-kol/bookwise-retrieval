from pathlib import Path

import numpy as np

import rag_engine


class DummyIndex:
    def __init__(self, dim=3):
        self.d = dim


class DummyModel:
    def __init__(self, *_args, **_kwargs):
        self.name_or_path = "dummy"

    def get_sentence_embedding_dimension(self):
        return 3

    def encode(self, text, convert_to_numpy=True):
        if isinstance(text, list):
            return np.array([[1.0, 2.0, 3.0] for _ in text], dtype="float32")
        return np.array([1.0, 2.0, 3.0], dtype="float32")


def test_engine_initialization(monkeypatch, tmp_path):
    monkeypatch.setattr(rag_engine, "CORP", {"Alpha": Path("Alpha")})
    monkeypatch.setattr(rag_engine, "SentenceTransformer", DummyModel)
    monkeypatch.setattr(rag_engine.faiss, "read_index", lambda _path: DummyIndex(3))

    alpha = tmp_path / "Alpha"
    alpha.mkdir()
    (alpha / "index.faiss").write_text("index")
    (alpha / "meta.sqlite").write_text("db")
    (alpha / "manifest.json").write_text("{}")

    eng = rag_engine._mk_eng(base_out=tmp_path)

    assert "Alpha" in eng.corp
    assert eng.corp_report["Alpha"]["ready"] is True


def test_corpus_loading(monkeypatch, tmp_path):
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
    assert eng.corp_report["Beta"]["ready"] is False


def test_embedding_generation(monkeypatch):
    monkeypatch.setattr(rag_engine, "SentenceTransformer", DummyModel)

    eng = rag_engine.Eng(
        emb=DummyModel(),
        ix={},
        dbp={},
        corp={},
        ix_dim={},
        corp_report={},
    )

    vec = rag_engine.embed_query(eng, "hello")

    assert vec.shape == (3,)
    assert np.allclose(vec, np.array([1.0, 2.0, 3.0], dtype="float32"))


def test_dense_retrieval(monkeypatch):
    def fake_faiss_search(_e, _corp, _qv, _k):
        return ([{"sem_score": 0.5}], {"fallback_retries": 0, "fallback_failed": 0, "k_clamped": False})

    monkeypatch.setattr(rag_engine, "faiss_search", fake_faiss_search)

    eng = rag_engine.Eng(
        emb=None,
        ix={"Pub": object()},
        dbp={},
        corp={"Pub": Path("Pub")},
        ix_dim={},
        corp_report={},
    )

    hits, meta = rag_engine.dense_retrieve(eng, "Pub", np.array([1.0], dtype="float32"), k=5)

    assert hits
    assert "score" in hits[0]
    assert meta["fallback_retries"] == 0


def test_lexical_retrieval(monkeypatch):
    def fake_fts_search(_e, _corp, _q, _k):
        return [{"lex_score": 0.2}]

    monkeypatch.setattr(rag_engine, "fts_search", fake_fts_search)

    eng = rag_engine.Eng(
        emb=None,
        ix={},
        dbp={"Pub": Path("meta.sqlite")},
        corp={"Pub": Path("Pub")},
        ix_dim={},
        corp_report={},
    )

    hits, meta = rag_engine.lex_retrieve(eng, "Pub", "query", k=5)

    assert hits
    assert "score" in hits[0]
    assert "clamped_k" in meta


def test_hybrid_fusion(monkeypatch):
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


def test_score_normalization():
    flat = [{"score": 1.0}, {"score": 1.0}]
    rag_engine.norm_scores(flat, "score")
    assert all(item["score_n"] == 0.0 for item in flat)

    varied = [{"score": 1.0}, {"score": 3.0}, {"score": 2.0}]
    rag_engine.norm_scores(varied, "score")
    assert varied[0]["score_n"] == 0.0
    assert varied[1]["score_n"] == 1.0
    assert 0.0 < varied[2]["score_n"] < 1.0
