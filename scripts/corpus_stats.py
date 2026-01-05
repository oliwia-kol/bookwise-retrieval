#!/usr/bin/env python3
from __future__ import annotations

import argparse
import importlib
import importlib.util
import json
import os
import sqlite3
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable, Optional

_faiss_spec = importlib.util.find_spec("faiss")
faiss = importlib.import_module("faiss") if _faiss_spec else None

ROOT = Path(__file__).resolve().parents[1]


@dataclass
class CorpusStats:
    name: str
    path: str
    exists: bool
    index_bytes: int | None
    sqlite_bytes: int | None
    manifest_bytes: int | None
    index_ntotal: int | None
    index_dim: int | None
    chunks: int | None
    documents: int | None
    manifest_index_ntotal: int | None


def resolve_data_root(explicit: Optional[str]) -> Path:
    if explicit:
        return Path(explicit).expanduser()
    env_data_root = os.environ.get("RAG_DATA_ROOT")
    if env_data_root:
        return Path(env_data_root).expanduser()
    hidden = ROOT / ".data"
    visible = ROOT / "data"
    if hidden.exists():
        return hidden
    return visible


def discover_corpora(data_root: Path, publishers: Iterable[str]) -> list[str]:
    if publishers:
        return list(publishers)
    if data_root.exists():
        return sorted([p.name for p in data_root.iterdir() if p.is_dir()])
    return []


def _file_size(path: Path) -> int | None:
    try:
        return path.stat().st_size
    except OSError:
        return None


def _load_manifest_index_total(path: Path) -> int | None:
    try:
        with path.open("r", encoding="utf-8") as handle:
            manifest = json.load(handle)
    except (OSError, json.JSONDecodeError):
        return None
    value = manifest.get("index_ntotal")
    return int(value) if isinstance(value, int) else None


def _load_index_stats(path: Path) -> tuple[int | None, int | None]:
    if faiss is None:
        return None, None
    try:
        index = faiss.read_index(str(path))
    except Exception:
        return None, None
    return int(index.ntotal), int(index.d)


def _load_sqlite_stats(path: Path) -> tuple[int | None, int | None]:
    try:
        con = sqlite3.connect(str(path))
    except sqlite3.Error:
        return None, None
    try:
        cur = con.cursor()
        chunks = cur.execute("SELECT count(*) FROM chunks").fetchone()[0]
        documents = cur.execute("SELECT count(DISTINCT fp) FROM chunks").fetchone()[0]
        return int(chunks), int(documents)
    except sqlite3.Error:
        return None, None
    finally:
        con.close()


def gather_stats(name: str, data_root: Path) -> CorpusStats:
    path = data_root / name
    exists = path.exists()
    index_path = path / "index.faiss"
    sqlite_path = path / "meta.sqlite"
    manifest_path = path / "manifest.json"

    index_ntotal = index_dim = None
    if index_path.exists():
        index_ntotal, index_dim = _load_index_stats(index_path)

    chunks = documents = None
    if sqlite_path.exists():
        chunks, documents = _load_sqlite_stats(sqlite_path)

    manifest_index_ntotal = None
    if manifest_path.exists():
        manifest_index_ntotal = _load_manifest_index_total(manifest_path)

    return CorpusStats(
        name=name,
        path=str(path),
        exists=exists,
        index_bytes=_file_size(index_path) if index_path.exists() else None,
        sqlite_bytes=_file_size(sqlite_path) if sqlite_path.exists() else None,
        manifest_bytes=_file_size(manifest_path) if manifest_path.exists() else None,
        index_ntotal=index_ntotal,
        index_dim=index_dim,
        chunks=chunks,
        documents=documents,
        manifest_index_ntotal=manifest_index_ntotal,
    )


def print_stats(stats: list[CorpusStats]) -> None:
    if not stats:
        print("No corpora found.")
        return
    header = (
        "Corpus",
        "Chunks",
        "Docs",
        "Index NTOTAL",
        "Index Dim",
        "Manifest NTOTAL",
    )
    widths = [max(len(str(getattr(s, "name"))) for s in stats), 8, 6, 13, 9, 15]
    print(
        f"{header[0]:<{widths[0]}}  {header[1]:>8}  {header[2]:>6}  {header[3]:>13}  {header[4]:>9}  {header[5]:>15}"
    )
    print("-" * (sum(widths) + 15))
    for s in stats:
        print(
            f"{s.name:<{widths[0]}}  "
            f"{s.chunks if s.chunks is not None else '-':>8}  "
            f"{s.documents if s.documents is not None else '-':>6}  "
            f"{s.index_ntotal if s.index_ntotal is not None else '-':>13}  "
            f"{s.index_dim if s.index_dim is not None else '-':>9}  "
            f"{s.manifest_index_ntotal if s.manifest_index_ntotal is not None else '-':>15}"
        )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Report corpus statistics.")
    parser.add_argument(
        "--data-root",
        help="Override data root (defaults to RAG_DATA_ROOT, .data/, or data/).",
    )
    parser.add_argument(
        "--publisher",
        action="append",
        default=[],
        help="Limit stats to a specific publisher (repeatable).",
    )
    parser.add_argument("--json", action="store_true", help="Output stats as JSON.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    data_root = resolve_data_root(args.data_root)
    publishers = discover_corpora(data_root, args.publisher)
    stats = [gather_stats(name, data_root) for name in publishers]
    if args.json:
        print(json.dumps([asdict(s) for s in stats], indent=2))
        return 0
    print_stats(stats)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
