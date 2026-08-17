from __future__ import annotations

import re

from ..storage_io import json_store

PLATE_RE = re.compile(r"^[A-Z]{2}[- ]?\d{1,2}[- ]?[A-Z]{1,3}[- ]?\d{4}$")
CHALLAN_EVENTS = {"overspeed", "red_light", "no_helmet", "triple_riding"}
OCR_CONF_GATE = 0.70


def normalise(text: str) -> str:
    return re.sub(r"[^A-Z0-9]", "-", text.upper().strip())


def read_plate(vehicle_crop) -> tuple[str, float]:
    """OCR the plate. Returns ("", 0.0) when no OCR backend is installed."""
    try:
        import easyocr
    except ImportError:
        return "", 0.0
    reader = easyocr.Reader(["en"], gpu=False, verbose=False)
    best_text, best_conf = "", 0.0
    for _, text, conf in reader.readtext(vehicle_crop):
        if conf > best_conf:
            best_text, best_conf = normalise(text), float(conf)
    return best_text, best_conf


def generate_challan(event: dict, vehicle_crop=None) -> dict | None:
    """Traffic violations produce challans, never a police dispatch alert."""
    if event["event_type"] not in CHALLAN_EVENTS:
        return None
    plate, conf = read_plate(vehicle_crop) if vehicle_crop is not None else ("", 0.0)
    valid = bool(PLATE_RE.match(plate))
    record = {
        "id": json_store.next_id("challans.json", "challan"),
        "event_id": event["id"],
        "plate_number": plate if valid else "UNREADABLE",
        "plate_confidence": round(conf, 2),
        "violation_type": event["event_type"],
        "vehicle_class": event["metadata"].get("vehicle_class", "unknown"),
        "evidence_snapshot_path": event["evidence_snapshot_path"],
        "timestamp": event["timestamp"],
        "location": f"{event['stream_id']}",
        "status": "auto_generated" if (valid and conf >= OCR_CONF_GATE) else "pending_review",
    }
    return json_store.append("challans.json", record)


def issue_to_rto(challan: dict) -> dict:
    """STUB. Real issuance requires state RTO / VAHAN integration - out of scope."""
    raise NotImplementedError("Connect a state RTO / VAHAN e-challan API here.")
