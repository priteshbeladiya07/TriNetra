"""DEV-ONLY synthetic event injector. Never imported by the production pipeline.

Usage: python -m backend.tools.simulate_event --stream stream_01 --type fire
"""
from __future__ import annotations

import argparse
import time

from backend.app.modules.anpr_challan import generate_challan
from backend.app.modules.dispatch import dispatch_police
from backend.app.storage_io import json_store

TYPES = [
    "overspeed", "red_light", "no_helmet", "triple_riding", "pedestrian_intrusion",
    "animal_on_road", "litter_suspected", "fire", "smoke", "accident_suspected",
]


def inject(stream_id: str, event_type: str, track_id: int = 999) -> dict:
    record = {
        "id": json_store.next_id("events.json", "event"),
        "stream_id": stream_id,
        "event_type": event_type,
        "track_id": track_id,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "confidence": 0.66,
        "metadata": {"synthetic": True, "vehicle_class": "car"},
        "evidence_snapshot_path": f"/storage/evidence/synthetic_{event_type}.jpg",
        "evidence_clip_path": None,
        "reviewed": False,
        "reviewer_note": None,
    }
    json_store.append("events.json", record)
    generate_challan(record)
    dispatch_police(record)
    return record


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--stream", default="stream_01")
    parser.add_argument("--type", choices=TYPES, required=True)
    args = parser.parse_args()
    print(inject(args.stream, args.type))
