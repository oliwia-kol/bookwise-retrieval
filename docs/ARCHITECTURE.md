# Architecture Overview

## System diagram (logical)

```
┌───────────────┐        ┌─────────────────┐        ┌──────────────────────┐
│ React UI      │ <----> │ FastAPI Service │ <----> │ RAG Engine            │
│ (src/)        │        │ (api_server.py) │        │ (rag_engine.py)       │
└───────────────┘        └─────────────────┘        └──────────────────────┘
                                                             │
                                                             v
                                                    ┌──────────────────────┐
                                                    │ Data Root (.data/)    │
                                                    │ - index.faiss         │
                                                    │ - meta.sqlite         │
                                                    │ - manifest.json       │
                                                    └──────────────────────┘
```

## High-level components

- **Data root** (`.data/`, `data/`, or `RAG_DATA_ROOT`): Stores per-publisher FAISS indexes, SQLite metadata, and manifest files.
- **RAG engine** (`rag_engine.py`): Loads indexes, runs dense + lexical retrieval, and produces ranked hits and answers.
- **FastAPI service** (`api_server.py`): Wraps the engine with REST endpoints for search, chat, stats, and history.
- **React frontend** (`src/`): Browser UI for search, filtering, and chat.
- **Streamlit app** (`app.py`): Alternative UI for quick local usage.

## Data flow

1. Client submits a query via `/search` or `/chat`.
2. FastAPI calls `rag_engine.run_query(...)`.
3. The engine embeds the query, searches the FAISS index, fuses lexical results, and applies scoring.
4. Hits are formatted and returned to the client with metadata, coverage, and optional answer text.

## Retrieval pipeline

- **Dense retrieval**: FAISS index (`index.faiss`) stores embedding vectors.
- **Lexical retrieval**: SQLite FTS (`meta.sqlite`, `chunks_fts`) enables keyword matches.
- **Fusion + scoring**: Dense and lexical results are combined and re-ranked.
- **Answering**: Optional answer generation composes a response from top hits.

## Storage layout

Each publisher has a folder under the data root:

```
<DATA_ROOT>/
└── OReilly/
    ├── index.faiss
    ├── meta.sqlite
    └── manifest.json
```

The manifest captures build metadata and index size for validation.
The backend considers a publisher ready only when both `index.faiss` and `meta.sqlite` are present in its folder.

## Observability

- Request logs: `logs/query.log` (configurable via `RAG_LOG_PATH`).
- Recent queries: `logs/recent_queries.json` (configurable via `RAG_RECENT_QUERY_LOG`).
- Health reporting: `/health` and `/stats` endpoints expose corpus readiness.

## Extensibility

- Add publishers by dropping new corpus folders in the data root.
- Update retrieval weights and budgets in `rag_engine.py` (see `HCFG`).
- Frontend enhancements can call the same REST endpoints.
