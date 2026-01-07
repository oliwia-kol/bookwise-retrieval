# RAG Books Search

CPU-only retrieval-augmented search across indexed technical books (FAISS + SQLite + CrossEncoder).

---

## Quick Start

### 1. Backend (Python)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn api_server:app --host 0.0.0.0 --port 8000
```

### 2. Frontend (React)

```bash
npm install
npm run dev
```

### 3. Codespaces

```bash
# Terminal 1: Backend
source .venv/bin/activate
uvicorn api_server:app --host 0.0.0.0 --port 8000

# Terminal 2: Frontend (auto-detects Codespaces URL)
npm run dev:codespaces
```

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
data/
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
| `uvicorn api_server:app --port 8000` | Start backend |
| `pytest` | Run tests |
