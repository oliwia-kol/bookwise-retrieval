# API Reference

This document summarizes the FastAPI surface in `api_server.py`. The canonical OpenAPI schema is served at:

- Swagger UI: `GET /docs`
- ReDoc: `GET /redoc`
- OpenAPI JSON: `GET /openapi.json`

## Base URL

By default the API runs on `http://localhost:8000`.

## Authentication

No authentication is required. If you deploy to production, add auth at the reverse proxy or application layer.

## Endpoints

### `GET /`

Returns API metadata and available endpoints.

**Response**

```json
{
  "name": "RAG Books API",
  "version": "1.0.0",
  "status": "running",
  "engine_available": true,
  "endpoints": {
    "GET /": "This info",
    "GET /health": "Health check with corpus status",
    "POST /search": "Search the corpus",
    "POST /chat": "Chat with the corpus",
    "GET /history": "Recent query history",
    "GET /stats": "Corpus startup stats",
    "GET /suggestions": "Get query suggestions",
    "GET /docs": "OpenAPI documentation (Swagger UI)",
    "GET /redoc": "ReDoc documentation"
  }
}
```

### `GET /health`

Health check that reports whether the RAG engine is available and which corpora are loaded.

**Response**

```json
{
  "ok": true,
  "corpus_count": 3,
  "publishers": ["OReilly", "Manning", "Pearson"],
  "engine_version": "1.0.0"
}
```

### `POST /search`

Searches the corpus and returns ranked hits.

**Request body**

```json
{
  "query": "vector databases",
  "pubs": ["OReilly"],
  "jmin": 0.3,
  "sort": "Judge",
  "mode": "balanced",
  "show_near_miss": true,
  "page": 1,
  "page_size": 10
}
```

**Response**

```json
{
  "ok": true,
  "query": "vector databases",
  "hits": [
    {
      "id": "0",
      "title": "Designing Data-Intensive Applications",
      "section": "Chunk 0",
      "snippet": "...",
      "full_text": "...",
      "publisher": "OReilly",
      "book": "Designing Data-Intensive Applications",
      "j_score": 0.82,
      "s_score": 0.77,
      "l_score": 0.42,
      "tier": "Strong",
      "chunk_idx": 0
    }
  ],
  "near_miss": [],
  "coverage": "HIGH",
  "confidence": 0.82,
  "answer": "...",
  "meta": {
    "pagination": {
      "page": 1,
      "page_size": 10,
      "total_hits": 42,
      "total_pages": 5
    }
  }
}
```

**Validation rules**

- `query` must be non-empty.
- `jmin` must be between 0 and 1.
- `sort` must be `Judge` or `Semantic`.
- `mode` must be one of the modes exposed by the engine (typically `quick`, `balanced`, `thorough`).
- `page` must be ≥ 1; `page_size` must be between 1 and 50.

### `POST /chat`

Runs a conversational query and returns a short answer plus top sources.

**Request body**

```json
{
  "message": "Explain vector search",
  "history": []
}
```

**Response**

```json
{
  "ok": true,
  "answer": "...",
  "sources": [
    {
      "id": "0",
      "title": "...",
      "section": "...",
      "snippet": "...",
      "publisher": "OReilly",
      "j_score": 0.74
    }
  ]
}
```

### `GET /suggestions`

Returns recent query suggestions, optionally filtered by a substring.

**Query parameters**

- `q` (string, optional): filter recent queries by substring.

**Response**

```json
{ "suggestions": ["vector search", "embedding size"] }
```

### `GET /history`

Returns recent query history.

**Query parameters**

- `limit` (integer, default: 20, min: 1, max: 100)

**Response**

```json
{ "ok": true, "queries": ["vector search", "bm25"] }
```

### `GET /stats`

Returns startup report and corpus status, plus per-publisher statistics when available.

**Response**

```json
{
  "ok": true,
  "startup_report": {"OReilly": true, "Manning": true},
  "corp_status": {
    "OReilly": {"exists": true, "faiss": true, "db": true, "manifest": true}
  },
  "publisher_stats": {
    "OReilly": {
      "publisher": "OReilly",
      "chunks": 12345,
      "documents": 240,
      "avg_chunk_length": 712.4,
      "index_size_bytes": 84934612
    }
  }
}
```

## Error format

Errors follow a consistent shape:

```json
{
  "ok": false,
  "error": "RAG engine not available",
  "code": "ENGINE_UNAVAILABLE"
}
```

Common error codes include `ENGINE_UNAVAILABLE`, `EMPTY_CORPUS`, `MISSING_PUBLISHERS`, `SEARCH_TIMEOUT`, and `SEARCH_ERROR`.

**Example error response**

```json
{
  "ok": false,
  "error": "Publishers not available: FooPress",
  "code": "MISSING_PUBLISHERS"
}
```
