"""FastAPI wrapper for RAG engine - run in Codespaces alongside rag_engine.py"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import logging

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


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


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
        raise HTTPException(status_code=503, detail="RAG engine not available")
    
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    try:
        result = rag.run_query(
            ENGINE,
            req.query,
            pubs=req.pubs if req.pubs else None,
            mode=req.mode,
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
        
        confidence = filtered_hits[0].get("j_score", 0) if filtered_hits else 0
        
        return {
            "ok": True,
            "query": req.query,
            "hits": _format_hits(filtered_hits),
            "near_miss": _format_hits(near_miss) if req.show_near_miss else [],
            "coverage": coverage,
            "confidence": round(confidence, 2),
            "answer": result.get("answer"),
            "meta": result.get("meta", {}),
        }
    except Exception as e:
        logging.exception("Search error")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat")
async def chat(req: ChatRequest):
    """Chat endpoint for conversational queries."""
    if not ENGINE_AVAILABLE:
        raise HTTPException(status_code=503, detail="RAG engine not available")
    
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
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/suggestions")
async def suggestions(q: str = ""):
    """Get query suggestions."""
    if not ENGINE_AVAILABLE or not hasattr(rag, 'get_recent_queries'):
        return {"suggestions": []}
    
    recent = rag.get_recent_queries()
    if q:
        recent = [r for r in recent if q.lower() in r.lower()]
    
    return {"suggestions": recent[:5]}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
