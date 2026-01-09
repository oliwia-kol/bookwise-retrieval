#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import tarfile
from datetime import datetime
from pathlib import Path
from typing import Iterable, Optional

ROOT = Path(__file__).resolve().parents[1]


def resolve_data_root(explicit: Optional[str]) -> Path:
    if explicit:
        return Path(explicit).expanduser()
    env_data_root = os.environ.get("RAG_DATA_ROOT")
    if env_data_root:
        return Path(env_data_root).expanduser()
    hidden = ROOT / "hf_space" / ".data"
    visible = ROOT / "hf_space" / "data"
    if hidden.exists():
        return hidden
    return visible


def discover_corpora(data_root: Path, publishers: Iterable[str]) -> list[str]:
    if publishers:
        return list(publishers)
    if data_root.exists():
        return sorted([p.name for p in data_root.iterdir() if p.is_dir()])
    return []


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Backup RAG corpus indexes.")
    parser.add_argument(
        "--data-root",
        help="Override data root (defaults to RAG_DATA_ROOT, hf_space/.data, or hf_space/data).",
    )
    parser.add_argument(
        "--publisher",
        action="append",
        default=[],
        help="Limit backup to a specific publisher (repeatable).",
    )
    parser.add_argument(
        "--output",
        help="Output tar.gz path (defaults to rag_corpus_backup_<timestamp>.tar.gz).",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite the output file if it already exists.",
    )
    parser.add_argument(
        "--metadata-json",
        help="Write metadata JSON describing the backup contents.",
    )
    parser.add_argument(
        "--since",
        help="Only include files modified after this timestamp (epoch seconds or ISO 8601).",
    )
    return parser.parse_args()


def _parse_since(value: Optional[str]) -> Optional[float]:
    if not value:
        return None
    try:
        return float(value)
    except ValueError:
        pass
    try:
        return datetime.fromisoformat(value).timestamp()
    except ValueError:
        return None


def main() -> int:
    args = parse_args()
    data_root = resolve_data_root(args.data_root)
    publishers = discover_corpora(data_root, args.publisher)
    if not publishers:
        print("No corpora found to back up.")
        return 1

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    output_path = Path(args.output or f"rag_corpus_backup_{timestamp}.tar.gz")

    if output_path.exists() and not args.force:
        print(f"Output file already exists: {output_path}. Use --force to overwrite.")
        return 1

    output_path.parent.mkdir(parents=True, exist_ok=True)

    since_ts = _parse_since(args.since)
    metadata = {
        "created_at": datetime.utcnow().isoformat() + "Z",
        "data_root": str(data_root),
        "publishers": [],
        "since": since_ts,
    }

    with tarfile.open(output_path, mode="w:gz") as tar:
        for name in publishers:
            corpus_path = data_root / name
            if not corpus_path.exists():
                print(f"Skipping missing corpus: {name}")
                continue
            entries = []
            for path in corpus_path.rglob("*"):
                if path.is_dir():
                    continue
                stat = path.stat()
                if since_ts is not None and stat.st_mtime < since_ts:
                    continue
                arcname = path.relative_to(data_root)
                tar.add(path, arcname=arcname)
                entries.append(
                    {
                        "path": str(arcname),
                        "bytes": stat.st_size,
                        "mtime": stat.st_mtime,
                    }
                )
            metadata["publishers"].append(
                {
                    "name": name,
                    "path": str(corpus_path),
                    "entries": entries,
                    "entry_count": len(entries),
                }
            )
            print(f"Added {name} from {corpus_path} ({len(entries)} files)")

    print(f"Backup written to {output_path}")
    metadata_path = args.metadata_json
    if metadata_path:
        out_path = Path(metadata_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with out_path.open("w", encoding="utf-8") as handle:
            json.dump(metadata, handle, indent=2)
        print(f"Metadata written to {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
