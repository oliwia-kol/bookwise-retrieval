"""FastAPI wrapper for RAG engine - run in Codespaces alongside rag_engine.py"""

import asyncio
from collections import deque
import logging
import math
import time
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator
from typing import Optional

# Import the RAG engine
try:
    import rag_engine as rag
    ENGINE = rag._mk_eng()
    ENGINE_AVAILABLE = True
except Exception as e:
    logging.warning(f"RAG engine not available: {e}")
    ENGINE = None
    ENGINE_AVAILABLE = False

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
    if ENGINE_AVAILABLE and hasattr(rag, "mode_options"):
        return {m.get("name", "").lower() for m in rag.mode_options() if m.get("name")}
    return {"quick", "balanced", "thorough"}


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
    pubs: list[str] = []
    jmin: float = 0.0
    sort: str = "Judge"
    mode: str = "balanced"
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
    history: list[dict] = []

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:
        cleaned = (value or "").strip()
        if not cleaned:
            raise ValueError("Message cannot be empty")
        return cleaned


def _format_hit(hit: dict, idx: int) -> dict:
    """Format a hit for the React frontend."""
    j = hit.get("j_score", hit.get("score", 0))
    s = hit.get("s_score", hit.get("dense_score", 0))
    l = hit.get("l_score", hit.get("lex_score", 0))
    
    # Determine tier based on judge score
    if j >= 0.7:
        tier = "Strong"
    elif j >= 0.5:
        tier = "Solid"
    elif j >= 0.3:
        tier = "Weak"
    else:
        tier = "Poor"
    
    return {
        "id": str(idx),
        "title": hit.get("title", hit.get("book", "Unknown")),
        "section": hit.get("section", f"Chunk {hit.get('chunk_idx', idx)}"),
        "snippet": hit.get("snippet", hit.get("text", "")[:200] + "..."),
        "full_text": hit.get("text", hit.get("snippet", "")),
        "publisher": hit.get("publisher", "Unknown"),
        "book": hit.get("book", "Unknown"),
        "j_score": round(j, 2),
        "s_score": round(s, 2),
        "l_score": round(l, 2),
        "tier": tier,
        "chunk_idx": hit.get("chunk_idx", idx),
    }


def _format_hits(hits: list) -> list:
    """Format a list of hits."""
    return [_format_hit(h, i) for i, h in enumerate(hits)]


@app.get("/health")
async def health():
    """Health check endpoint."""
    if not ENGINE_AVAILABLE:
        return {
            "ok": False,
            "corpus_count": 0,
            "publishers": [],
            "engine_version": "unavailable",
            "error": "RAG engine not loaded"
        }
    
    report = rag.get_startup_report(ENGINE)
    publishers = [p for p, ready in report.items() if ready]
    
    return {
        "ok": True,
        "corpus_count": len(publishers),
        "publishers": publishers,
        "engine_version": "1.0.0",
    }


@app.post("/search")
async def search(req: SearchRequest):
    """Search the corpus."""
    if not ENGINE_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail={"message": "RAG engine not available", "code": "ENGINE_UNAVAILABLE"},
        )

    available_publishers = set(getattr(ENGINE, "corp", {}) or {})
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
            ENGINE,
            req.query,
            pubs=req.pubs if req.pubs else None,
            mode=req.mode,
        )

        if not result.get("ok", True):
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

        hits = result.get("hits", [])
        near_miss = result.get("near_miss", [])
        
        # Filter by jmin
        filtered_hits = [h for h in hits if h.get("j_score", h.get("score", 0)) >= req.jmin]
        
        # Sort
        if req.sort == "Semantic":
            filtered_hits.sort(key=lambda x: x.get("s_score", x.get("dense_score", 0)), reverse=True)
        else:
            filtered_hits.sort(key=lambda x: x.get("j_score", x.get("score", 0)), reverse=True)
        
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
        confidence = filtered_hits[0].get("j_score", 0) if filtered_hits else 0
        meta = result.get("meta", {}) or {}
        meta["pagination"] = {
            "page": req.page,
            "page_size": req.page_size,
            "total_hits": count,
            "total_pages": total_pages,
        }
        
        return {
            "ok": True,
            "query": req.query,
            "hits": _format_hits(paged_hits),
            "near_miss": _format_hits(near_miss) if req.show_near_miss else [],
            "coverage": coverage,
            "confidence": round(confidence, 2),
            "answer": result.get("answer"),
            "meta": meta,
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
    if not ENGINE_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail={"message": "RAG engine not available", "code": "ENGINE_UNAVAILABLE"},
        )
    
    try:
        result = rag.run_query(ENGINE, req.message, mode="thorough")
        answer = rag.generate_answer(result) if hasattr(rag, 'generate_answer') else result.get("answer", "")
        
        return {
            "ok": True,
            "answer": answer,
            "sources": _format_hits(result.get("hits", [])[:3]),
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
async def history(limit: int = Query(5, ge=1, le=100)):
    """Get recent query history."""
    if not ENGINE_AVAILABLE or not hasattr(rag, "get_recent_queries"):
        raise HTTPException(
            status_code=503,
            detail={"message": "History not available", "code": "HISTORY_UNAVAILABLE"},
        )
    return {"ok": True, "queries": rag.get_recent_queries(limit=limit)}


@app.get("/stats")
async def stats():
    """Get corpus status and startup report."""
    if not ENGINE_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail={"message": "RAG engine not available", "code": "ENGINE_UNAVAILABLE"},
        )
    report = rag.get_startup_report(ENGINE) if hasattr(rag, "get_startup_report") else {}
    return {"ok": True, "startup_report": report, "corp_status": getattr(ENGINE, "corp_status", {})}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
