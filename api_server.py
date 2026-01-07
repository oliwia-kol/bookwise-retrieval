"""FastAPI wrapper for RAG engine - run in Codespaces alongside rag_engine.py"""

import asyncio
import inspect
from collections import deque
import logging
import math
import os
import sqlite3
import threading
import time
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator
from typing import Optional

# Import the RAG engine
rag = None
ENGINE = None
ENGINE_AVAILABLE = False
ENGINE_ERROR: str | None = None
_ENGINE_LOCK = threading.Lock()

try:
    import rag_engine as rag
except Exception as e:
    logging.warning("RAG engine module not available: %s", e)


def _should_skip_embed() -> bool:
    return os.getenv("RAG_SKIP_EMBED_MODEL", "").strip().lower() in {"1", "true", "yes"}


def _get_engine():
    global ENGINE, ENGINE_AVAILABLE, ENGINE_ERROR
    if ENGINE_AVAILABLE:
        return ENGINE
    if rag is None:
        return None
    with _ENGINE_LOCK:
        if ENGINE_AVAILABLE:
            return ENGINE
        try:
            emb_model = os.getenv("RAG_EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
            if _should_skip_embed():
                emb_model = None
            ENGINE = rag._mk_eng(emb_model=emb_model)
            ENGINE_AVAILABLE = True
            ENGINE_ERROR = None
        except Exception as e:
            logging.warning("RAG engine not available: %s", e)
            ENGINE = None
            ENGINE_AVAILABLE = False
            ENGINE_ERROR = str(e)
    return ENGINE

app = FastAPI(title="RAG Books API", version="1.0.0")

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HTTP_ERROR_CODES = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    405: "METHOD_NOT_ALLOWED",
    408: "REQUEST_TIMEOUT",
    409: "CONFLICT",
    422: "VALIDATION_ERROR",
    429: "RATE_LIMITED",
    500: "INTERNAL_ERROR",
    503: "SERVICE_UNAVAILABLE",
    504: "GATEWAY_TIMEOUT",
}
RATE_LIMIT_REQUESTS = 60
RATE_LIMIT_WINDOW_S = 60
_rate_limit_buckets: dict[str, deque[float]] = {}


def _error_response(message: str, code: str, status_code: int, headers: Optional[dict] = None) -> JSONResponse:
    payload = {"ok": False, "error": message, "code": code}
    return JSONResponse(status_code=status_code, content=payload, headers=headers or {})


def _available_modes() -> set[str]:
    if rag is not None and hasattr(rag, "mode_options"):
        return {m.get("name", "").lower() for m in rag.mode_options() if m.get("name")}
    return {"quick", "exact"}


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    status_code = exc.status_code
    code = HTTP_ERROR_CODES.get(status_code, "HTTP_ERROR")
    message = exc.detail
    headers = exc.headers
    if isinstance(exc.detail, dict):
        message = exc.detail.get("message") or exc.detail.get("error") or "Request error"
        code = exc.detail.get("code", code)
    return _error_response(str(message), code, status_code, headers=headers)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    logging.warning("Validation error: %s", exc)
    return _error_response("Validation error", "VALIDATION_ERROR", 400)


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    logging.exception("Unhandled error: %s", exc)
    return _error_response("Internal server error", "INTERNAL_ERROR", 500)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    ip = request.client.host if request.client else "unknown"
    now = time.monotonic()
    bucket = _rate_limit_buckets.setdefault(ip, deque())
    while bucket and now - bucket[0] > RATE_LIMIT_WINDOW_S:
        bucket.popleft()
    if len(bucket) >= RATE_LIMIT_REQUESTS:
        retry_after = max(1, int(RATE_LIMIT_WINDOW_S - (now - bucket[0])))
        return _error_response(
            "Rate limit exceeded",
            "RATE_LIMITED",
            429,
            headers={"Retry-After": str(retry_after)},
        )
    bucket.append(now)
    return await call_next(request)


@app.get("/")
async def root():
    """API root - shows available endpoints."""
    return {
        "name": "RAG Books API",
        "version": "1.0.0",
        "status": "running",
        "engine_available": ENGINE_AVAILABLE,
        "endpoints": {
            "GET /": "This info",
            "GET /health": "Health check with corpus status",
            "POST /search": "Search the corpus",
            "POST /chat": "Chat with the corpus",
            "GET /history": "Recent query history",
            "GET /stats": "Corpus startup stats",
            "GET /suggestions": "Get query suggestions",
            "GET /docs": "OpenAPI documentation (Swagger UI)",
            "GET /redoc": "ReDoc documentation",
        }
    }


class SearchRequest(BaseModel):
    query: str
    pubs: list[str] = Field(default_factory=list)
    jmin: float = 0.0
    sort: str = "Judge"
    mode: str = "quick"
    show_near_miss: bool = True
    page: int = 1
    page_size: int = 10

    @field_validator("query")
    @classmethod
    def validate_query(cls, value: str) -> str:
        cleaned = (value or "").strip()
        if not cleaned:
            raise ValueError("Query cannot be empty")
        return cleaned

    @field_validator("jmin")
    @classmethod
    def validate_jmin(cls, value: float) -> float:
        if value < 0 or value > 1:
            raise ValueError("jmin must be between 0 and 1")
        return value

    @field_validator("sort")
    @classmethod
    def validate_sort(cls, value: str) -> str:
        normalized = (value or "").strip().lower()
        if normalized not in {"judge", "semantic"}:
            raise ValueError("sort must be Judge or Semantic")
        return "Judge" if normalized == "judge" else "Semantic"

    @field_validator("mode")
    @classmethod
    def validate_mode(cls, value: str) -> str:
        normalized = (value or "").strip().lower()
        if normalized not in _available_modes():
            raise ValueError("Unsupported mode")
        return normalized

    @field_validator("page")
    @classmethod
    def validate_page(cls, value: int) -> int:
        if value < 1:
            raise ValueError("page must be >= 1")
        return value

    @field_validator("page_size")
    @classmethod
    def validate_page_size(cls, value: int) -> int:
        if value < 1 or value > 50:
            raise ValueError("page_size must be between 1 and 50")
        return value


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = Field(default_factory=list)

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:
        cleaned = (value or "").strip()
        if not cleaned:
            raise ValueError("Message cannot be empty")
        return cleaned


class HitResponse(BaseModel):
    id: str
    title: str
    section: str
    snippet: str
    full_text: str
    publisher: str
    book: str
    judge01: float = Field(ge=0.0, le=1.0)
    sem_score_n: float = Field(ge=0.0, le=1.0)
    lex_score_n: float = Field(ge=0.0, le=1.0)
    tier: str
    chunk_idx: int = Field(ge=-1)


def _filter_valid_hits(hits: list) -> list:
    if rag is None or not hasattr(rag, "validate_pub_hit"):
        return hits
    valid = []
    for hit in hits:
        if rag.validate_pub_hit(hit):
            valid.append(hit)
        else:
            logging.debug("Passing through unvalidated hit payload: %s", hit)
            valid.append(hit)
    return valid


def _format_hit(hit: dict, idx: int) -> dict:
    """Format a hit for the React frontend."""
    j = hit.get("judge01", hit.get("score", 0))
    s = hit.get("sem_score_n", hit.get("sem_score", 0))
    l = hit.get("lex_score_n", hit.get("lex_score", 0))
    
    # Determine tier based on judge score
    if j >= 0.7:
        tier = "Strong"
    elif j >= 0.5:
        tier = "Solid"
    elif j >= 0.3:
        tier = "Weak"
    else:
        tier = "Poor"
    
    payload = {
        "id": str(idx),
        "title": hit.get("title", hit.get("book", "Unknown")),
        "section": hit.get("section", f"Chunk {hit.get('cidx', hit.get('chunk_idx', idx))}"),
        "snippet": hit.get("snippet", hit.get("text", "")[:200] + "..."),
        "full_text": hit.get("text", hit.get("snippet", "")),
        "publisher": hit.get("publisher", "Unknown"),
        "book": hit.get("book", "Unknown"),
        "judge01": round(j, 2),
        "sem_score_n": round(s, 2),
        "lex_score_n": round(l, 2),
        "tier": tier,
        "chunk_idx": hit.get("chunk_idx", hit.get("cidx", idx)),
    }
    return HitResponse.model_validate(payload).model_dump()


def _format_hits(hits: list) -> list:
    """Format a list of hits."""
    return [_format_hit(h, i) for i, h in enumerate(hits)]


def _compose_chat_answer(query: str, result: dict) -> str:
    if not hasattr(rag, "generate_answer"):
        return result.get("answer", "")
    generate_answer = rag.generate_answer
    try:
        signature = inspect.signature(generate_answer)
    except (TypeError, ValueError):
        return generate_answer(query, result.get("hits", []), result.get("answer"))
    params = list(signature.parameters.values())
    if any(p.kind == inspect.Parameter.VAR_POSITIONAL for p in params):
        return generate_answer(query, result.get("hits", []), result.get("answer"))
    positional_params = [
        p for p in params if p.kind in (inspect.Parameter.POSITIONAL_ONLY, inspect.Parameter.POSITIONAL_OR_KEYWORD)
    ]
    if len(positional_params) <= 1:
        return generate_answer(result)
    kwargs = {}
    if any(p.name == "no_evidence" for p in params):
        kwargs["no_evidence"] = result.get("no_evidence", False)
    if any(p.name == "coverage" for p in params):
        kwargs["coverage"] = result.get("coverage")
    return generate_answer(query, result.get("hits", []), result.get("answer"), **kwargs)


@app.get("/health")
async def health():
    """Health check endpoint."""
    engine = _get_engine()
    if not ENGINE_AVAILABLE or engine is None:
        return {
            "ok": False,
            "corpus_count": 0,
            "publishers": [],
            "engine_version": "unavailable",
            "engine_available": False,
            "corpora_ok": False,
            "ready": False,
            "error": ENGINE_ERROR or "RAG engine not loaded",
        }
    
    report = rag.get_startup_report(engine)
    publishers = list(report.get("ok", []))
    if not publishers and isinstance(report, dict):
        if "by_corpus" in report:
            publishers = [name for name, row in report["by_corpus"].items() if row.get("ok")]
        else:
            publishers = [name for name, ok in report.items() if ok is True]
    corpora_ok = len(publishers) > 0
    
    return {
        "ok": True,
        "corpus_count": len(publishers),
        "publishers": publishers,
        "engine_version": "1.0.0",
        "engine_available": True,
        "corpora_ok": corpora_ok,
        "ready": corpora_ok,
    }


@app.post("/search")
async def search(req: SearchRequest):
    """Search the corpus."""
    engine = _get_engine()
    if not ENGINE_AVAILABLE or engine is None:
        raise HTTPException(
            status_code=503,
            detail={"message": ENGINE_ERROR or "RAG engine not available", "code": "ENGINE_UNAVAILABLE"},
        )

    available_publishers = set(getattr(engine, "corp", {}) or {})
    if not available_publishers:
        raise HTTPException(
            status_code=503,
            detail={"message": "No corpus indexes available", "code": "EMPTY_CORPUS"},
        )

    if req.pubs:
        missing = sorted(set(req.pubs) - available_publishers)
        if missing:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": f"Publishers not available: {', '.join(missing)}",
                    "code": "MISSING_PUBLISHERS",
                },
            )
    
    try:
        result = rag.run_query(
            engine,
            req.query,
            pubs=req.pubs if req.pubs else None,
            mode=req.mode,
        )

        result_ok = result.get("ok", True)
        if not result_ok:
            meta = result.get("meta", {}) or {}
            err = meta.get("err") or {}
            err_msg = err.get("msg")
            if err.get("missing"):
                raise HTTPException(
                    status_code=400,
                    detail={"message": err_msg or "Publishers unavailable", "code": "MISSING_PUBLISHERS"},
                )
            if err_msg and "No corpus indexes" in err_msg:
                raise HTTPException(
                    status_code=503,
                    detail={"message": err_msg, "code": "EMPTY_CORPUS"},
                )

        hits = _filter_valid_hits(result.get("hits", []))
        near_miss = _filter_valid_hits(result.get("near_miss", []))
        no_evidence = bool(result.get("no_evidence"))
        err = (result.get("meta", {}) or {}).get("err", {}) or {}
        err_msg = err.get("msg")
        err_id = err.get("id") or err.get("error_id")
        
        # Filter by jmin
        filtered_hits = [h for h in hits if float(h.get("judge01", h.get("score", 0)) or 0.0) >= req.jmin]
        
        # Sort
        if req.sort == "Semantic":
            filtered_hits.sort(key=lambda x: x.get("sem_score_n", x.get("sem_score", 0)), reverse=True)
        else:
            filtered_hits.sort(key=lambda x: x.get("judge01", x.get("score", 0)), reverse=True)
        
        # Calculate coverage
        count = len(filtered_hits)
        if count >= 3:
            coverage = "HIGH"
        elif count >= 1:
            coverage = "MEDIUM"
        else:
            coverage = "LOW"

        total_pages = math.ceil(count / req.page_size) if count else 0
        start = (req.page - 1) * req.page_size
        end = start + req.page_size
        paged_hits = filtered_hits[start:end]
        confidence = filtered_hits[0].get("judge01", 0) if filtered_hits else 0
        meta = result.get("meta", {}) or {}
        meta["pagination"] = {
            "page": req.page,
            "page_size": req.page_size,
            "total_hits": count,
            "total_pages": total_pages,
        }
        
        return {
            "ok": bool(result_ok),
            "query": req.query,
            "hits": _format_hits(paged_hits),
            "near_miss": _format_hits(near_miss) if req.show_near_miss else [],
            "coverage": coverage,
            "confidence": round(confidence, 2),
            "answer": result.get("answer") or "",
            "no_evidence": no_evidence,
            "meta": meta,
            "error": err_msg if not result_ok else None,
            "error_id": err_id if not result_ok else None,
        }
    except (TimeoutError, asyncio.TimeoutError):
        raise HTTPException(
            status_code=504,
            detail={"message": "Search timed out", "code": "SEARCH_TIMEOUT"},
        )
    except Exception as e:
        logging.exception("Search error")
        raise HTTPException(
            status_code=500,
            detail={"message": str(e), "code": "SEARCH_ERROR"},
        )


@app.post("/chat")
async def chat(req: ChatRequest):
    """Chat endpoint for conversational queries."""
    engine = _get_engine()
    if not ENGINE_AVAILABLE or engine is None:
        raise HTTPException(
            status_code=503,
            detail={"message": ENGINE_ERROR or "RAG engine not available", "code": "ENGINE_UNAVAILABLE"},
        )
    
    try:
        preferred_mode = "exact" if "exact" in _available_modes() else "quick"
        result = rag.run_query(engine, req.message, mode=preferred_mode)
        answer = _compose_chat_answer(req.message, result)
        
        return {
            "ok": True,
            "answer": answer,
            "sources": _format_hits(_filter_valid_hits(result.get("hits", []))[:3]),
        }
    except Exception as e:
        logging.exception("Chat error")
        raise HTTPException(
            status_code=500,
            detail={"message": str(e), "code": "CHAT_ERROR"},
        )


@app.get("/suggestions")
async def suggestions(q: str = ""):
    """Get query suggestions."""
    if not ENGINE_AVAILABLE or not hasattr(rag, 'get_recent_queries'):
        return {"suggestions": []}
    
    recent = rag.get_recent_queries()
    if q:
        recent = [r for r in recent if q.lower() in r.lower()]
    
    return {"suggestions": recent[:5]}


@app.get("/history")
async def history(limit: int = Query(20, ge=1, le=100)):
    """Get recent query history."""
    engine = _get_engine()
    if not ENGINE_AVAILABLE or engine is None or not hasattr(rag, "get_recent_queries"):
        raise HTTPException(
            status_code=503,
            detail={"message": ENGINE_ERROR or "History not available", "code": "HISTORY_UNAVAILABLE"},
        )
    return {"ok": True, "queries": rag.get_recent_queries(limit=limit)}


def _publisher_stats(engine) -> dict[str, dict]:
    stats = {}
    for pub, db_path in getattr(engine, "dbp", {}).items():
        db_stats = {
            "publisher": pub,
            "chunks": None,
            "documents": None,
            "avg_chunk_length": None,
            "index_size_bytes": None,
        }
        try:
            if db_path.exists():
                con = sqlite3.connect(str(db_path))
                cur = con.cursor()
                db_stats["chunks"] = cur.execute("SELECT count(*) FROM chunks").fetchone()[0]
                db_stats["documents"] = cur.execute("SELECT count(DISTINCT fp) FROM chunks").fetchone()[0]
                avg_len = cur.execute("SELECT avg(length(tx)) FROM chunks").fetchone()[0]
                db_stats["avg_chunk_length"] = float(avg_len) if avg_len is not None else None
                con.close()
        except Exception:
            pass
        try:
            ix_path = db_path.parent / "index.faiss"
            if ix_path.exists():
                db_stats["index_size_bytes"] = ix_path.stat().st_size
        except Exception:
            pass
        stats[pub] = db_stats
    return stats


@app.get("/stats")
async def stats():
    """Return detailed corpus statistics per publisher."""
    engine = _get_engine()
    if not ENGINE_AVAILABLE or engine is None:
        raise HTTPException(
            status_code=503,
            detail={"message": ENGINE_ERROR or "RAG engine not available", "code": "ENGINE_UNAVAILABLE"},
        )
    report = rag.get_startup_report(engine) if hasattr(rag, "get_startup_report") else {}
    detailed = _publisher_stats(engine)
    return {
        "ok": True,
        "startup_report": report,
        "corp_status": getattr(engine, "corp_status", {}),
        "publisher_stats": detailed,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
