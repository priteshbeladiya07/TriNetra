"""Emergency police / fire / ambulance dispatch for critical events.

Traffic violations go to the e-challan pipeline; fire, smoke and suspected
accidents create a dispatch order here so a team is sent to the location.
"""
from __future__ import annotations

from ..storage_io import json_store

CRITICAL_EVENTS = {"fire", "smoke", "accident_suspected"}

UNITS = {
    "accident_suspected": {"unit": "AMB-21 GMCH", "eta_min": 5, "responders": ["Ambulance", "Paramedic"]},
    "fire": {"unit": "FIRE-03 Civil Lines", "eta_min": 7, "responders": ["Fire tender", "Rescue crew"]},
    "smoke": {"unit": "FIRE-03 Civil Lines", "eta_min": 7, "responders": ["Fire tender", "Rescue crew"]},
}
DEFAULT_UNIT = {"unit": "PCR-07 Sitabuldi", "eta_min": 4, "responders": ["Patrol van", "2 constables"]}


def dispatch_police(event: dict) -> dict | None:
    """Create a dispatch order. Returns None for non-critical events."""
    if event["event_type"] not in CRITICAL_EVENTS:
        return None
    unit = UNITS.get(event["event_type"], DEFAULT_UNIT)
    record = {
        "id": json_store.next_id("dispatches.json", "dispatch"),
        "event_id": event["id"],
        "event_type": event["event_type"],
        "stream_id": event["stream_id"],
        "timestamp": event["timestamp"],
        "status": "pending",
        "evidence_snapshot_path": event["evidence_snapshot_path"],
        "note": None,
        **unit,
    }
    print(
        f"[DISPATCH] {record['event_type']} at {record['stream_id']} -> "
        f"{record['unit']} (ETA {record['eta_min']} min)"
    )
    return json_store.append("dispatches.json", record)


def mark_status(dispatch_id: str, status: str) -> dict | None:
    """status: pending | dispatched | on_scene | resolved"""
    return json_store.update("dispatches.json", dispatch_id, {"status": status})
