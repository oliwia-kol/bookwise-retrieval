# Deployment Guide

This repository ships a FastAPI backend and a React frontend. You can deploy them together or separately.

## Prerequisites

- Python 3.10+
- Node.js 18+
- Corpus indexes under `.data/` or `data/` (or set `RAG_DATA_ROOT`).

## Environment variables

| Variable | Purpose | Example |
| --- | --- | --- |
| `RAG_DATA_ROOT` | Override corpus root path | `/srv/rag-data` |
| `RAG_LOG_PATH` | Query log file path | `/var/log/rag/query.log` |
| `RAG_LOG_MAX_BYTES` | Log rotation size | `1000000` |
| `RAG_LOG_BACKUP_COUNT` | Log rotation count | `3` |
| `VITE_API_URL` | React frontend API base URL | `https://rag.example.com` |
| `OMP_NUM_THREADS` | CPU thread cap | `2` |
| `MKL_NUM_THREADS` | BLAS thread cap | `2` |

## Backend (FastAPI)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn api_server:app --host 0.0.0.0 --port 8000
```

### Production WSGI/ASGI

Use Gunicorn with Uvicorn workers:

```bash
gunicorn -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:8000 api_server:app
```

Add a reverse proxy (Nginx, Caddy) in front for TLS termination and request size limits.

## Frontend (React)

```bash
npm install
cp .env.example .env
# Set VITE_API_URL to the backend URL
npm run build
```

Serve `dist/` with a static host (Netlify, Vercel, S3+CloudFront, or your own web server).

## Data deployment

The backend expects per-publisher corpora:

```
<DATA_ROOT>/
├── OReilly/
│   ├── index.faiss
│   ├── meta.sqlite
│   └── manifest.json
├── Manning/
└── Pearson/
```

Set `RAG_DATA_ROOT` when the data lives outside the repo.

## Operational checks

- Validate indexes:
  ```bash
  python scripts/validate_index.py
  ```
- Inspect corpus stats:
  ```bash
  python scripts/corpus_stats.py
  ```
- Backup indexes:
  ```bash
  python scripts/backup.py --output /backups/rag_corpus.tar.gz
  ```

## Scaling and performance

- The pipeline is CPU-only. Use `OMP_NUM_THREADS` and `MKL_NUM_THREADS` to limit thread usage.
- Scale the API horizontally behind a load balancer once the corpus is stable.
- Keep the data root on fast local storage (NVMe) for best performance.
