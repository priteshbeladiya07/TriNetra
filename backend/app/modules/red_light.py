from __future__ import annotations

from ..storage_io import json_store
from .base import DetectionModule, Event


def side(line, point) -> float:
    (x1, y1), (x2, y2) = line
    return (x2 - x1) * (point[1] - y1) - (y2 - y1) * (point[0] - x1)


class RedLightModule(DetectionModule):
    name = "red_light"

    def __init__(self, stream_id: str):
        zones = json_store.read(f"zones/{stream_id}.json", {})
        self.stop_line = zones.get("stop_line")
        self.signal_state = "GREEN"

    def update(self, tracks, frame, timestamp, debounce=None) -> list[Event]:
        if not self.stop_line or self.signal_state != "RED":
            return []
        events = []
        for track in tracks:
            if len(track.history) < 2:
                continue
            prev = side(self.stop_line, track.history[-2]["center"])
            curr = side(self.stop_line, track.history[-1]["center"])
            if prev * curr >= 0:  # no sign change -> no crossing
                continue
            if debounce and not debounce(track.track_id, self.name):
                continue
            events.append(Event(self.name, track.track_id, 0.9, {
                "signal_state": "RED", "vehicle_class": track.cls,
            }))
        return events
