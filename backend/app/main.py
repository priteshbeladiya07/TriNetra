"""TriNetra entry point. Single local process, local JSON persistence only."""
from __future__ import annotations

import argparse
import time
from dataclasses import asdict

from .core.detector import Detector
from .core.tracker_utils import TrackStore
from .modules.accident import AccidentModule
from .modules.anpr_challan import generate_challan
from .modules.dispatch import dispatch_police
from .modules.fire_smoke import FireSmokeModule
from .modules.helmet import HelmetModule
from .modules.intrusion import IntrusionModule
from .modules.litter import LitterModule
from .modules.overloading import OverloadingModule
from .modules.red_light import RedLightModule
from .modules.speed import SpeedModule
from .storage_io import json_store

CRITICAL = {"fire", "smoke", "accident_suspected"}


def register_stream(name: str, source_uri: str, source_type: str, speed_limit_kmh: int = 40) -> dict:
    record = {
        "id": json_store.next_id("streams.json", "stream"),
        "name": name,
        "source_uri": source_uri,
        "source_type": source_type,
        "speed_limit_kmh": speed_limit_kmh,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "settings": {"fire_backend": "heuristic", "modules_enabled": ["overspeed", "red_light"]},
    }
    return json_store.append("streams.json", record)


def log_event(stream_id: str, event, frame=None) -> dict:
    record = {
        "id": json_store.next_id("events.json", "event"),
        "stream_id": stream_id,
        **asdict(event),
        "evidence_snapshot_path": "",
        "evidence_clip_path": None,
        "reviewed": False,
        "reviewer_note": None,
    }
    if frame is not None:
        import cv2
        path = json_store.resolve(f"evidence/{record['id']}.jpg")
        cv2.imwrite(str(path), frame)
        record["evidence_snapshot_path"] = f"/storage/evidence/{record['id']}.jpg"
    json_store.append("events.json", record)
    if record["event_type"] in CRITICAL:
        print(f"[ALERT] police dispatch -> {record['event_type']} ({record['id']})")
        dispatch_police(record)
    else:
        generate_challan(record, frame)
    return record


def run(stream_id: str, source: str, weights: str = "yolov8s.pt", frame_skip: int = 0):
    detector = Detector(weights)
    store = TrackStore()
    speed = SpeedModule(stream_id)
    modules = [
        RedLightModule(stream_id), OverloadingModule(), IntrusionModule(stream_id),
        LitterModule(), FireSmokeModule(), HelmetModule(), AccidentModule(),
    ]
    for module in modules:
        ok, msg = module.available()
        if not ok:
            print(f"[warn] {module.name}: {msg}")

    for frame, result in detector.track(source, frame_skip=frame_skip):
        detections = []
        boxes = getattr(result, "boxes", None)
        if boxes is not None and boxes.id is not None:
            for box, tid, cls, conf in zip(boxes.xyxy, boxes.id, boxes.cls, boxes.conf):
                detections.append({
                    "track_id": int(tid), "cls": result.names[int(cls)],
                    "bbox": tuple(float(v) for v in box), "conf": float(conf),
                })
        tracks = store.update(detections)
        now = time.time()
        speeds = {t.track_id: speed.estimate_kmh(t) for t in tracks}
        for event in speed.update(tracks, frame, now, debounce=store.debounce):
            log_event(stream_id, event, frame)
        for module in modules:
            kwargs = {"speeds": speeds} if isinstance(module, AccidentModule) else {}
            for event in module.update(tracks, frame, now, debounce=store.debounce, **kwargs):
                log_event(stream_id, event, frame)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="TriNetra CV pipeline (local JSON storage, no DB)")
    parser.add_argument("--source", required=True, help="video file path, rtsp:// URL, or webcam index")
    parser.add_argument("--stream-id", default="stream_01")
    parser.add_argument("--weights", default="yolov8s.pt")
    parser.add_argument("--frame-skip", type=int, default=0)
    args = parser.parse_args()
    run(args.stream_id, args.source, args.weights, args.frame_skip)
