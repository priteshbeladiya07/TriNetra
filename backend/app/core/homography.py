"""Pixel -> ground-plane mapping, persisted to /storage/calibration/{stream_id}.json."""
from __future__ import annotations

import time

import numpy as np

from ..storage_io import json_store


def compute_homography(pixel_pts, world_pts):
    import cv2
    src = np.array(pixel_pts, dtype=np.float32)
    dst = np.array(world_pts, dtype=np.float32)
    return cv2.getPerspectiveTransform(src, dst)


def save_calibration(stream_id: str, pixel_pts, world_pts, reference_frame_path: str) -> dict:
    H = compute_homography(pixel_pts, world_pts)
    record = {
        "stream_id": stream_id,
        "H": H.tolist(),
        "pixel_points": [list(map(float, p)) for p in pixel_pts],
        "world_points": [list(map(float, p)) for p in world_pts],
        "reference_frame_path": reference_frame_path,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    json_store.write(f"calibration/{stream_id}.json", record)
    return record


def load_homography(stream_id: str):
    rec = json_store.read(f"calibration/{stream_id}.json", None)
    return np.array(rec["H"], dtype=np.float32) if rec else None


def project(H, point) -> tuple[float, float]:
    vec = np.array([point[0], point[1], 1.0], dtype=np.float32)
    out = H @ vec
    return float(out[0] / out[2]), float(out[1] / out[2])
