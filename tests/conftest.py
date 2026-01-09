import importlib
import sys
from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))


@pytest.fixture
def api_server_module(monkeypatch, tmp_path):
    from hf_space import rag_engine

    dummy_engine = SimpleNamespace(corp={"Pub": tmp_path / "Pub"}, corp_status={"Pub": {"ready": True}})

    monkeypatch.setattr(rag_engine, "_mk_eng", lambda: dummy_engine)
    monkeypatch.setattr(rag_engine, "mode_options", lambda: [{"name": "balanced"}])

    from hf_space import api_server

    importlib.reload(api_server)
    api_server.ENGINE = dummy_engine
    api_server.ENGINE_AVAILABLE = True
    api_server._rate_limit_buckets.clear()
    return api_server


@pytest.fixture
def api_client(api_server_module):
    return TestClient(api_server_module.app)
