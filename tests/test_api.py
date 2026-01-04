from fastapi.testclient import TestClient


def test_health_ok(api_client, api_server_module, monkeypatch):
    def fake_report(_):
        return {"Pub": True, "Other": False}

    monkeypatch.setattr(api_server_module.rag, "get_startup_report", fake_report)

    response = api_client.get("/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["ok"] is True
    assert payload["corpus_count"] == 1
    assert payload["publishers"] == ["Pub"]


def test_search_success(api_client, api_server_module, monkeypatch):
    def fake_run_query(*_args, **_kwargs):
        return {
            "ok": True,
            "hits": [
                {
                    "title": "Low Semantic",
                    "j_score": 0.7,
                    "s_score": 0.2,
                    "text": "hit one",
                    "publisher": "Pub",
                    "book": "Book One",
                    "section": "Intro",
                },
                {
                    "title": "High Semantic",
                    "j_score": 0.6,
                    "s_score": 0.9,
                    "text": "hit two",
                    "publisher": "Pub",
                    "book": "Book Two",
                    "section": "Chapter",
                },
            ],
            "near_miss": [
                {
                    "title": "Near",
                    "j_score": 0.2,
                    "s_score": 0.1,
                    "text": "near",
                    "publisher": "Pub",
                    "book": "Book Three",
                    "section": "Edge",
                }
            ],
            "meta": {"n": {"direct_hits": 2}},
            "answer": "Answer",
        }

    monkeypatch.setattr(api_server_module.rag, "run_query", fake_run_query)

    response = api_client.post(
        "/search",
        json={
            "query": "python",
            "jmin": 0.5,
            "sort": "Semantic",
            "page": 1,
            "page_size": 1,
            "mode": "balanced",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["ok"] is True
    assert payload["hits"][0]["title"] == "High Semantic"
    assert payload["meta"]["pagination"]["total_hits"] == 2
    assert payload["near_miss"][0]["title"] == "Near"


def test_search_missing_publishers(api_client, api_server_module):
    response = api_client.post(
        "/search",
        json={"query": "python", "pubs": ["Missing"], "mode": "balanced"},
    )

    assert response.status_code == 400
    payload = response.json()
    assert payload["code"] == "MISSING_PUBLISHERS"


def test_search_engine_unavailable(api_server_module):
    api_server_module.ENGINE_AVAILABLE = False
    client = TestClient(api_server_module.app)

    response = client.post("/search", json={"query": "python", "mode": "balanced"})

    assert response.status_code == 503
    payload = response.json()
    assert payload["code"] == "ENGINE_UNAVAILABLE"


def test_chat_response(api_client, api_server_module, monkeypatch):
    def fake_run_query(*_args, **_kwargs):
        return {
            "ok": True,
            "hits": [
                {
                    "title": "Chat",
                    "j_score": 0.8,
                    "s_score": 0.6,
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
    assert payload["sources"][0]["title"] == "Chat"
