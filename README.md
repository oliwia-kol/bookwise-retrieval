# RAG Books Search (CPU-only)

Streamlit UI for retrieval-augmented search across indexed technical books. The pipeline is CPU-only (FAISS + sqlite + CrossEncoder judge), so no GPU/CUDA is required or supported.

## React Frontend + FastAPI Backend

For the React UI with FastAPI backend:

### Backend Setup (venv)

```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# or: .venv\Scripts\activate  # Windows

# Install dependencies
pip install -U pip
pip install -r requirements.txt

# Run FastAPI server
uvicorn api_server:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
# Install Node dependencies
npm install

# Create .env with your backend URL
cp .env.example .env
# Edit .env and set VITE_API_URL to your backend URL

# Run React dev server
npm run dev
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | FastAPI backend URL | `http://localhost:8000` or Codespaces URL |
| `OMP_NUM_THREADS` | Limit CPU threads | `2` |
| `MKL_NUM_THREADS` | Limit BLAS threads | `2` |

---

## Streamlit UI (Quick start)

```bash
git clone <REPO_URL>
cd rag-books-search
python -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
streamlit run app.py
```

Then open http://localhost:8501.

## Chat mode (app.py)

The custom UI includes a chat panel above the main answer/evidence area. It
uses the same RAG retrieval engine and a stubbed answer composer, so it runs on
CPU-only (no GPU/CUDA required).

How to use:

1. Start the custom app: `streamlit run app.py`
2. Type a question in the chat input and press Enter.
3. The assistant replies with an answer or a short summary of sources.

The chat history is stored in `st.session_state`, so it persists across
Streamlit reruns during the session.

### Requirements

- Python 3.10+ (same as the rest of the app)
- Streamlit (installed via `requirements.txt`)
- CPU-only environment (FAISS + sqlite + CrossEncoder judge)

### Local install & run (custom UI)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
streamlit run app.py
```

## Data layout (required corpora)

Place CPU-friendly indexes under `.data/` (preferred for keeping artifacts out of sight) or `data/` using the same structure for each publisher. You can also override the location with `RAG_DATA_ROOT`.

```
.data/
├── OReilly/
│   ├── index.faiss
│   ├── meta.sqlite
│   └── manifest.json
├── Manning/
│   ├── index.faiss
│   ├── meta.sqlite
│   └── manifest.json
└── Pearson/
    ├── index.faiss
    ├── meta.sqlite
    └── manifest.json
```

Only the index artifacts are needed; source PDFs/EPUBs are not required.

## Checks and tests

- Quick environment sanity check (Python, deps, corpus files): `python scripts/check_env.py`
- Contract smoke for UI + engine modules: `python smoke_ui_contract.py`
- Compile entrypoints: `python -m py_compile app.py rag_engine.py ui_adapter.py ui_shell.py ui_theme.py smoke_ui_contract.py`
- Full test suite: `pytest`

## Keep CPU usage in check

If your local CPU is pegged when running the app, cap the BLAS thread count before launching Streamlit:

```bash
export OMP_NUM_THREADS=2
export MKL_NUM_THREADS=2
streamlit run app.py
```
