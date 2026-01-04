from fastapi.testclient import TestClient


def test_search_and_chat_flow(api_client, api_server_module, monkeypatch):
    def fake_run_query(*_args, **_kwargs):
        return {
            "ok": True,
            "hits": [
                {
                    "title": "Flow",
                    "j_score": 0.9,
                    "s_score": 0.4,
                    "text": "flow hit",
                    "publisher": "Pub",
                    "book": "Flow Book",
                    "section": "Flow",
                }
            ],
            "answer": "Flow answer",
        }

    monkeypatch.setattr(api_server_module.rag, "run_query", fake_run_query)
    monkeypatch.setattr(api_server_module.rag, "generate_answer", lambda _result: "Rendered flow")

    search_response = api_client.post(
        "/search",
        json={"query": "flow", "mode": "balanced"},
    )
    assert search_response.status_code == 200
    assert search_response.json()["hits"][0]["title"] == "Flow"

    chat_response = api_client.post("/chat", json={"message": "flow", "history": []})
    assert chat_response.status_code == 200
    assert chat_response.json()["answer"] == "Rendered flow"


def test_validation_and_rate_limit_edge_cases(api_server_module):
    api_server_module._rate_limit_buckets.clear()
    api_server_module.RATE_LIMIT_REQUESTS = 2
    api_server_module.RATE_LIMIT_WINDOW_S = 60
    client = TestClient(api_server_module.app)

    invalid = client.post("/search", json={"query": " ", "mode": "balanced"})
    assert invalid.status_code == 422
    assert invalid.json()["code"] == "VALIDATION_ERROR"

    api_server_module._rate_limit_buckets.clear()
    assert client.get("/").status_code == 200
    assert client.get("/").status_code == 200
    limited = client.get("/")
    assert limited.status_code == 429
    assert "Retry-After" in limited.headers


def test_history_and_suggestions(api_client, api_server_module, monkeypatch):
    monkeypatch.setattr(api_server_module.rag, "get_recent_queries", lambda limit=5: ["alpha", "beta"])

    history = api_client.get("/history")
    assert history.status_code == 200
    assert history.json()["queries"] == ["alpha", "beta"]

    suggestions = api_client.get("/suggestions", params={"q": "a"})
    assert suggestions.status_code == 200
    assert suggestions.json()["suggestions"] == ["alpha", "beta"]
