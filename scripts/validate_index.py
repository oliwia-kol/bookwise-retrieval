#!/usr/bin/env python3
from __future__ import annotations

import argparse
import importlib
import importlib.util
import json
import os
import sqlite3
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

_faiss_spec = importlib.util.find_spec("faiss")
faiss = importlib.import_module("faiss") if _faiss_spec else None


ROOT = Path(__file__).resolve().parents[1]
REQUIRED_FILES = ("index.faiss", "meta.sqlite", "manifest.json")
REQUIRED_MANIFEST_KEYS = ("built_at", "src", "cfg", "index_ntotal")


@dataclass
class CorpusReport:
    name: str
    path: Path
    exists: bool
    missing_files: List[str] = field(default_factory=list)
    manifest_ok: bool = False
    manifest_errors: List[str] = field(default_factory=list)
    faiss_ok: bool = False
    faiss_errors: List[str] = field(default_factory=list)
    sqlite_ok: bool = False
    sqlite_errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)

    def ok(self) -> bool:
        return (
            self.exists
            and not self.missing_files
            and self.manifest_ok
            and self.faiss_ok
            and self.sqlite_ok
        )


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


def discover_corpora(data_root: Path, publishers: Iterable[str]) -> List[str]:
    if publishers:
        return list(publishers)
    if data_root.exists():
        return sorted([p.name for p in data_root.iterdir() if p.is_dir()])
    return ["OReilly", "Manning", "Pearson"]


def _load_manifest(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _validate_manifest(report: CorpusReport, manifest_path: Path) -> Optional[Dict[str, Any]]:
    try:
        manifest = _load_manifest(manifest_path)
    except json.JSONDecodeError as exc:
        report.manifest_errors.append(f"manifest.json invalid JSON: {exc}")
        return None
    except OSError as exc:
        report.manifest_errors.append(f"manifest.json unreadable: {exc}")
        return None

    missing = [key for key in REQUIRED_MANIFEST_KEYS if key not in manifest]
    if missing:
        report.manifest_errors.append(f"manifest.json missing keys: {', '.join(missing)}")
        return manifest

    if manifest.get("src") and manifest.get("src") != report.name:
        report.warnings.append(
            f"manifest src '{manifest.get('src')}' does not match directory '{report.name}'"
        )
    report.manifest_ok = True
    return manifest


def _validate_faiss(report: CorpusReport, faiss_path: Path, manifest: Optional[Dict[str, Any]]) -> None:
    if faiss is None:
        report.faiss_errors.append("faiss not available; skipping index load")
        return
    try:
        index = faiss.read_index(str(faiss_path))
    except Exception as exc:
        report.faiss_errors.append(f"faiss index failed to load: {exc}")
        return
    report.faiss_ok = True
    if manifest:
        expected_total = manifest.get("index_ntotal")
        if isinstance(expected_total, int) and index.ntotal != expected_total:
            report.warnings.append(
                f"index.ntotal ({index.ntotal}) does not match manifest index_ntotal ({expected_total})"
            )
        cfg = manifest.get("cfg") if isinstance(manifest.get("cfg"), dict) else {}
        expected_dim = None
        for key in ("embed_dim", "embedding_dim", "vector_dim", "dim"):
            val = cfg.get(key)
            if isinstance(val, int):
                expected_dim = val
                break
        if expected_dim is not None and index.d != expected_dim:
            report.warnings.append(
                f"index dimension ({index.d}) does not match manifest embed_dim ({expected_dim})"
            )


def _validate_sqlite(report: CorpusReport, sqlite_path: Path, manifest: Optional[Dict[str, Any]]) -> None:
    try:
        con = sqlite3.connect(str(sqlite_path))
    except sqlite3.Error as exc:
        report.sqlite_errors.append(f"sqlite open failed: {exc}")
        return
    try:
        cur = con.cursor()
        tables = {row[0] for row in cur.execute(
            "SELECT name FROM sqlite_master WHERE type='table'"
        ).fetchall()}
        if "chunks" not in tables:
            report.sqlite_errors.append("sqlite missing chunks table")
            return
        if "chunks_fts" not in tables:
            report.warnings.append("sqlite missing chunks_fts table")
        chunks = cur.execute("SELECT count(*) FROM chunks").fetchone()[0]
        if chunks == 0:
            report.warnings.append("sqlite chunks table is empty")
        if manifest and isinstance(manifest.get("index_ntotal"), int):
            expected = manifest["index_ntotal"]
            if expected != chunks:
                report.warnings.append(
                    f"sqlite chunks count ({chunks}) does not match manifest index_ntotal ({expected})"
                )
        report.sqlite_ok = True
    except sqlite3.Error as exc:
        report.sqlite_errors.append(f"sqlite validation failed: {exc}")
    finally:
        con.close()


def validate_corpus(name: str, data_root: Path) -> CorpusReport:
    path = data_root / name
    exists = path.exists()
    report = CorpusReport(name=name, path=path, exists=exists)
    if not exists:
        report.missing_files = list(REQUIRED_FILES)
        report.manifest_errors.append("corpus directory missing")
        report.faiss_errors.append("corpus directory missing")
        report.sqlite_errors.append("corpus directory missing")
        return report

    for filename in REQUIRED_FILES:
        if not (path / filename).exists():
            report.missing_files.append(filename)

    manifest = None
    manifest_path = path / "manifest.json"
    if manifest_path.exists():
        manifest = _validate_manifest(report, manifest_path)
    else:
        report.manifest_errors.append("manifest.json missing")

    faiss_path = path / "index.faiss"
    if faiss_path.exists():
        _validate_faiss(report, faiss_path, manifest)
    else:
        report.faiss_errors.append("index.faiss missing")

    sqlite_path = path / "meta.sqlite"
    if sqlite_path.exists():
        _validate_sqlite(report, sqlite_path, manifest)
    else:
        report.sqlite_errors.append("meta.sqlite missing")

    return report


def render_report(reports: List[CorpusReport]) -> int:
    failures = 0
    for rep in reports:
        status = "OK" if rep.ok() else "FAIL"
        if not rep.ok():
            failures += 1
        print(f"[{status}] {rep.name} ({rep.path})")
        if rep.missing_files:
            print(f"  Missing files: {', '.join(rep.missing_files)}")
        for msg in rep.manifest_errors:
            print(f"  Manifest error: {msg}")
        for msg in rep.faiss_errors:
            print(f"  Index error: {msg}")
        for msg in rep.sqlite_errors:
            print(f"  SQLite error: {msg}")
        for msg in rep.warnings:
            print(f"  Warning: {msg}")
    if reports:
        ok_count = sum(1 for rep in reports if rep.ok())
        print(f"\nValidated {len(reports)} corpora: {ok_count} ok, {failures} failed")
    return 1 if failures else 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate corpus indexes for the RAG engine.")
    parser.add_argument(
        "--data-root",
        help="Override data root (defaults to RAG_DATA_ROOT, .data/, or data/).",
    )
    parser.add_argument(
        "--publisher",
        action="append",
        default=[],
        help="Limit validation to a specific publisher (repeatable).",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    data_root = resolve_data_root(args.data_root)
    publishers = discover_corpora(data_root, args.publisher)
    if not publishers:
        print("No corpora found to validate.")
        return 1
    reports = [validate_corpus(name, data_root) for name in publishers]
    return render_report(reports)


if __name__ == "__main__":
    raise SystemExit(main())
