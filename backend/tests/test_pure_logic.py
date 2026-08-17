"""Unit tests for the pure-logic pieces - no model weights required."""
from __future__ import annotations

import numpy as np

from backend.app.core import homography
from backend.app.modules.accident import iou
from backend.app.modules.intrusion import point_in_polygon
from backend.app.modules.red_light import side
from backend.app.storage_io import json_store


def test_line_crossing_sign_change():
    line = ((0, 0), (0, 10))
    assert side(line, (-1, 5)) * side(line, (1, 5)) < 0


def test_zone_containment():
    poly = [(0, 0), (10, 0), (10, 10), (0, 10)]
    assert point_in_polygon((5, 5), poly)
    assert not point_in_polygon((15, 5), poly)


def test_iou():
    assert iou((0, 0, 10, 10), (0, 0, 10, 10)) == 1.0
    assert iou((0, 0, 10, 10), (20, 20, 30, 30)) == 0.0


def test_homography_projection_roundtrip():
    px = [(0, 0), (100, 0), (100, 100), (0, 100)]
    world = [(0, 0), (5, 0), (5, 5), (0, 5)]
    H = homography.compute_homography(px, world)
    assert np.allclose(homography.project(H, (100, 100)), (5, 5), atol=1e-3)


def test_json_store_roundtrip(tmp_path, monkeypatch):
    monkeypatch.setattr(json_store, "STORAGE_ROOT", tmp_path)
    json_store.write("events.json", [])
    json_store.append("events.json", {"id": "event_0001", "reviewed": False})
    json_store.update("events.json", "event_0001", {"reviewed": True})
    assert json_store.read("events.json", [])[0]["reviewed"] is True
