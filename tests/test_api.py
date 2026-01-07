from fastapi.testclient import TestClient


def test_root_endpoint_returns_info(api_client):
    response = api_client.get("/")

    assert response.status_code == 200
    payload = response.json()
    assert payload["name"] == "RAG Books API"
    assert payload["version"] == "1.0.0"
    assert "endpoints" in payload


def test_health_with_engine_available(api_client, api_server_module, monkeypatch):
    def fake_report(_):
        return {"Pub": True, "Other": False}

    monkeypatch.setattr(api_server_module.rag, "get_startup_report", fake_report)

    response = api_client.get("/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["ok"] is True
    assert payload["corpus_count"] == 1
    assert payload["publishers"] == ["Pub"]


def test_health_without_engine(api_server_module):
    api_server_module.ENGINE_AVAILABLE = False
    client = TestClient(api_server_module.app)

    response = client.get("/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["ok"] is False
    assert payload["engine_version"] == "unavailable"


def test_search_empty_query_returns_400(api_client):
    response = api_client.post("/search", json={"query": " ", "mode": "balanced"})

    assert response.status_code == 400
    payload = response.json()
    assert payload["code"] == "VALIDATION_ERROR"


def test_search_valid_query_returns_hits(api_client, api_server_module, monkeypatch):
    def fake_run_query(*_args, **_kwargs):
        return {
            "ok": True,
            "hits": [
                {
                    "title": "Hit",
                    "judge01": 0.7,
                    "sem_score_n": 0.2,
                    "lex_score_n": 0.1,
                    "text": "hit one",
                    "publisher": "Pub",
                    "book": "Book One",
                    "section": "Intro",
                }
            ],
            "near_miss": [],
            "meta": {"n": {"direct_hits": 1}},
            "answer": "Answer",
        }

    monkeypatch.setattr(api_server_module.rag, "run_query", fake_run_query)

    response = api_client.post(
        "/search",
        json={"query": "python", "jmin": 0.1, "mode": "balanced", "page": 1, "page_size": 10},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["ok"] is True
    assert payload["hits"]


def test_search_publisher_filter(api_client):
    response = api_client.post(
        "/search",
        json={"query": "python", "pubs": ["Missing"], "mode": "balanced"},
    )

    assert response.status_code == 400
    payload = response.json()
    assert payload["code"] == "MISSING_PUBLISHERS"


def test_search_jmin_filter(api_client, api_server_module, monkeypatch):
    def fake_run_query(*_args, **_kwargs):
        return {
            "ok": True,
            "hits": [
                {
                    "title": "Low",
                    "judge01": 0.2,
                    "sem_score_n": 0.2,
                    "lex_score_n": 0.1,
                    "text": "low",
                    "publisher": "Pub",
                    "book": "Book One",
                    "section": "Intro",
                },
                {
                    "title": "High",
                    "judge01": 0.9,
                    "sem_score_n": 0.3,
                    "lex_score_n": 0.2,
                    "text": "high",
                    "publisher": "Pub",
                    "book": "Book Two",
                    "section": "Chapter",
                },
            ],
            "near_miss": [],
            "meta": {"n": {"direct_hits": 2}},
            "answer": "Answer",
        }

    monkeypatch.setattr(api_server_module.rag, "run_query", fake_run_query)

    response = api_client.post(
        "/search",
        json={"query": "python", "jmin": 0.5, "mode": "balanced"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert len(payload["hits"]) == 1
    assert payload["hits"][0]["title"] == "High"


def test_chat_endpoint(api_client, api_server_module, monkeypatch):
    def fake_run_query(*_args, **_kwargs):
        return {
            "ok": True,
            "hits": [
                {
                    "title": "Chat",
                    "judge01": 0.8,
                    "sem_score_n": 0.6,
                    "lex_score_n": 0.4,
                    "text": "chat hit",
                    "publisher": "Pub",
                    "book": "Chat Book",
                    "section": "Chat",
                }
            ],
            "answer": "Raw",
        }

    monkeypatch.setattr(api_server_module.rag, "run_query", fake_run_query)
    monkeypatch.setattr(api_server_module.rag, "generate_answer", lambda _result: "Rendered")

    response = api_client.post("/chat", json={"message": "hello", "history": []})

    assert response.status_code == 200
    payload = response.json()
    assert payload["ok"] is True
    assert payload["answer"] == "Rendered"


def test_suggestions_endpoint(api_client, api_server_module, monkeypatch):
    monkeypatch.setattr(api_server_module.rag, "get_recent_queries", lambda limit=5: ["alpha", "beta"])

    response = api_client.get("/suggestions", params={"q": "a"})

    assert response.status_code == 200
    payload = response.json()
    assert payload["suggestions"] == ["alpha", "beta"]
