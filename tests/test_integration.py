from fastapi.testclient import TestClient


def test_end_to_end_query_flow(api_client, api_server_module, monkeypatch):
    def fake_run_query(*_args, **_kwargs):
        return {
            "ok": True,
            "hits": [
                {
                    "title": "Flow",
                    "judge01": 0.9,
                    "sem_score_n": 0.4,
                    "lex_score_n": 0.2,
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


def test_multi_publisher_queries(api_client, api_server_module, monkeypatch):
    captured = {"pubs": None}

    def fake_run_query(_engine, _query, pubs=None, **_kwargs):
        captured["pubs"] = pubs
        return {"ok": True, "hits": [], "near_miss": [], "meta": {}}

    monkeypatch.setattr(api_server_module.rag, "run_query", fake_run_query)

    response = api_client.post(
        "/search",
        json={"query": "multi", "mode": "balanced", "pubs": ["Pub"]},
    )

    assert response.status_code == 200
    assert captured["pubs"] == ["Pub"]


def test_edge_cases_no_results(api_client, api_server_module, monkeypatch):
    def fake_run_query(*_args, **_kwargs):
        return {"ok": True, "hits": [], "near_miss": [], "meta": {}}

    monkeypatch.setattr(api_server_module.rag, "run_query", fake_run_query)

    response = api_client.post(
        "/search",
        json={"query": "missing", "mode": "balanced"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["hits"] == []
    assert payload["coverage"] == "LOW"


def test_edge_cases_all_filtered(api_client, api_server_module, monkeypatch):
    def fake_run_query(*_args, **_kwargs):
        return {
            "ok": True,
            "hits": [
                {
                    "title": "Low",
                    "judge01": 0.1,
                    "sem_score_n": 0.2,
                    "lex_score_n": 0.1,
                    "text": "low",
                    "publisher": "Pub",
                    "book": "Book One",
                    "section": "Intro",
                }
            ],
            "near_miss": [],
            "meta": {},
        }

    monkeypatch.setattr(api_server_module.rag, "run_query", fake_run_query)

    response = api_client.post(
        "/search",
        json={"query": "filtered", "mode": "balanced", "jmin": 0.5},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["hits"] == []
