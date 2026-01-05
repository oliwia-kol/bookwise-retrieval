#!/usr/bin/env python3
from __future__ import annotations

import argparse
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


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Backup RAG corpus indexes.")
    parser.add_argument(
        "--data-root",
        help="Override data root (defaults to RAG_DATA_ROOT, .data/, or data/).",
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
    return parser.parse_args()


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

    with tarfile.open(output_path, mode="w:gz") as tar:
        for name in publishers:
            corpus_path = data_root / name
            if not corpus_path.exists():
                print(f"Skipping missing corpus: {name}")
                continue
            tar.add(corpus_path, arcname=corpus_path.relative_to(data_root))
            print(f"Added {name} from {corpus_path}")

    print(f"Backup written to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
