from __future__ import annotations

from ..storage_io import json_store
from .base import DetectionModule, Event

ANIMALS = {"dog", "cat", "cow", "horse", "sheep"}


def point_in_polygon(point, polygon) -> bool:
    x, y = point
    inside = False
    n = len(polygon)
    for i in range(n):
        x1, y1 = polygon[i]
        x2, y2 = polygon[(i + 1) % n]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / ((y2 - y1) or 1e-9) + x1:
            inside = not inside
    return inside


class IntrusionModule(DetectionModule):
    name = "pedestrian_intrusion"

    def __init__(self, stream_id: str, dwell_s: float = 2.0):
        zones = json_store.read(f"zones/{stream_id}.json", {})
        self.road = zones.get("road_zone", [])
        self.crosswalk = zones.get("crosswalk_zone", [])
        self.dwell_s = dwell_s
        self._since: dict[int, float] = {}

    def update(self, tracks, frame, timestamp, debounce=None) -> list[Event]:
        events = []
        for track in tracks:
            if track.cls != "person" and track.cls not in ANIMALS:
                continue
            if not self.road:
                continue
            inside = point_in_polygon(track.ground_point, self.road)
            legal = self.crosswalk and point_in_polygon(track.ground_point, self.crosswalk)
            if not inside or legal:
                self._since.pop(track.track_id, None)
                continue
            start = self._since.setdefault(track.track_id, timestamp)
            if timestamp - start < self.dwell_s:
                continue
            etype = "animal_on_road" if track.cls in ANIMALS else "pedestrian_intrusion"
            if debounce and not debounce(track.track_id, etype):
                continue
            events.append(Event(etype, track.track_id, 0.7, {
                "zone": "road_zone", "dwell_s": round(timestamp - start, 1), "species": track.cls,
            }))
        return events
