# RAG Books Search

CPU-only retrieval-augmented search across indexed technical books (FAISS + SQLite + CrossEncoder).

---

## Quick Start

### 1. Backend (Python)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn hf_space.api_server:app --host 0.0.0.0 --port 8000
```

### 2. Frontend (React)

```bash
npm install
npm run dev
```

### 3. Codespaces + Lovable Preview

```bash
# Terminal 1: Backend
source .venv/bin/activate
uvicorn hf_space.api_server:app --host 0.0.0.0 --port 8000

# Terminal 2: Register backend URL (one-time per session)
pip install supabase
source .env
python scripts/register_backend.py
```

The Lovable preview will auto-discover the backend URL from the database.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL (auto-set in Codespaces) |
| `VITE_USE_MOCKS` | `true` to use mock data |
| `OMP_NUM_THREADS` | Limit CPU threads (e.g., `2`) |

---

## Data Layout

```
hf_space/data/
├── OReilly/
│   ├── index.faiss
│   └── meta.sqlite
├── Manning/
│   ├── index.faiss
│   └── meta.sqlite
└── Pearson/
    ├── index.faiss
    └── meta.sqlite
```

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend (localhost) |
| `npm run dev:codespaces` | Start frontend (Codespaces) |
| `uvicorn hf_space.api_server:app --port 8000` | Start backend |
| `pytest` | Run tests |
