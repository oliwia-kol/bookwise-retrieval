# Deployment Guide

This repository ships a FastAPI backend and a React frontend. You can deploy them together or separately.

## Prerequisites

- Python 3.10+
- Node.js 18+
- Corpus indexes under `hf_space/.data` or `hf_space/data` (or set `RAG_DATA_ROOT`).

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
uvicorn hf_space.api_server:app --host 0.0.0.0 --port 8000
```

### Production WSGI/ASGI

Use Gunicorn with Uvicorn workers:

```bash
gunicorn -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:8000 hf_space.api_server:app
```

Add a reverse proxy (Nginx, Caddy) in front for TLS termination and request size limits.

### Managed platforms (Railway/Render/Fly)

Use the FastAPI entrypoint in `hf_space/api_server.py` and expose port 8000.

**Start commands**

- Development:
  ```bash
  uvicorn hf_space.api_server:app --host 0.0.0.0 --port 8000
  ```
- Production:
  ```bash
  gunicorn -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:8000 hf_space.api_server:app
  ```

**Platform-specific notes**

- **Railway/Render**: set the start command to one of the above and expose port 8000.
- **Codespaces**: forward port 8000 and use the public URL for `VITE_API_URL`.
- **Dependencies**: ensure deploys install from `requirements.txt`.

## Codespaces setup

1. Launch the Codespace from the repository.
2. Open a terminal and install dependencies:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
3. Ensure corpus data is mounted under `hf_space/.data` or `hf_space/data` (or set `RAG_DATA_ROOT`).
4. Start the API:
   ```bash
   uvicorn hf_space.api_server:app --host 0.0.0.0 --port 8000
   ```
5. For the frontend, run `npm install` and `npm run dev` with `VITE_API_URL` pointing at the forwarded backend port.

## Production deployment options

- **VM + systemd**: run Gunicorn/Uvicorn under systemd with `RAG_DATA_ROOT` set to a persistent volume.
- **Containers**: package the backend and data volume into a Docker image or bind-mount the data root.
- **Managed platforms**: deploy the API to services like Render, Fly.io, or AWS ECS, and host the frontend on a static host.

## Hugging Face Spaces

The Hugging Face Space deployment uses the `hf_space/` subtree only. The Dockerfile and `requirements.txt` in that folder are published to the Space repository.

- **Port**: expose FastAPI on port **7860** (HF Spaces default).
- **GitHub Actions secrets**:
  - `HF_TOKEN` (required): Hugging Face access token with write access to the Space repo.
  - `HF_USERNAME` (optional): overrides the target HF account (defaults to the GitHub repository owner).
  - `SPACE_NAME` (optional): overrides the target Space name (defaults to the GitHub repository name).

The GitHub workflow pushes the subtree to `spaces/<HF_USERNAME>/<SPACE_NAME>`.

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

Set `RAG_DATA_ROOT` when the data lives outside the repo (for example, a persistent volume on Railway/Render).
Confirm the mounted volume includes both `index.faiss` and `meta.sqlite` per publisher so the backend reports the corpus as ready.

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
