"""Atomic local-JSON persistence. This module replaces a database entirely.

Every logical "table" is one JSON file under /storage. Writes go to a temp file
and are atomically renamed so a kill mid-write cannot corrupt the store.
"""
from __future__ import annotations

import json
import os
import tempfile
import threading
from pathlib import Path
from typing import Any

STORAGE_ROOT = Path(os.environ.get("TRINETRA_STORAGE", Path(__file__).resolve().parents[3] / "storage"))
_LOCKS: dict[str, threading.RLock] = {}
_LOCKS_GUARD = threading.Lock()


def _lock_for(path: Path) -> threading.RLock:
    key = str(path)
    with _LOCKS_GUARD:
        if key not in _LOCKS:
            _LOCKS[key] = threading.RLock()
        return _LOCKS[key]


def resolve(rel: str) -> Path:
    path = STORAGE_ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def read(rel: str, default: Any) -> Any:
    path = resolve(rel)
    with _lock_for(path):
        if not path.exists():
            return default
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return default


def write(rel: str, data: Any) -> None:
    path = resolve(rel)
    with _lock_for(path):
        fd, tmp = tempfile.mkstemp(dir=str(path.parent), suffix=".tmp")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as fh:
                json.dump(data, fh, indent=2, ensure_ascii=False)
                fh.flush()
                os.fsync(fh.fileno())
            os.replace(tmp, path)
        finally:
            if os.path.exists(tmp):
                os.unlink(tmp)


def append(rel: str, record: dict) -> dict:
    path = resolve(rel)
    with _lock_for(path):
        items = read(rel, [])
        items.append(record)
        write(rel, items)
    return record


def update(rel: str, record_id: str, patch: dict) -> dict | None:
    path = resolve(rel)
    with _lock_for(path):
        items = read(rel, [])
        for item in items:
            if item.get("id") == record_id:
                item.update(patch)
                write(rel, items)
                return item
    return None


def next_id(rel: str, prefix: str) -> str:
    return f"{prefix}_{len(read(rel, [])) + 1:04d}"
