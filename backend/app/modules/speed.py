from __future__ import annotations

from statistics import mean

from ..core import homography
from .base import DetectionModule, Event

VEHICLES = {"car", "motorcycle", "bus", "truck", "bicycle"}


class SpeedModule(DetectionModule):
    name = "overspeed"

    def __init__(self, stream_id: str, speed_limit_kmh: float = 40.0, smooth: int = 8):
        self.H = homography.load_homography(stream_id)
        self.limit = speed_limit_kmh
        self.smooth = smooth
        self._samples: dict[int, list[float]] = {}

    def estimate_kmh(self, track) -> float | None:
        if self.H is None or len(track.history) < 2:
            return None
        a, b = track.history[-2], track.history[-1]
        dt = b["timestamp"] - a["timestamp"]  # real timestamps survive frame drops
        if dt <= 0:
            return None
        p0 = homography.project(self.H, (a["bbox"][0] / 2 + a["bbox"][2] / 2, a["bbox"][3]))
        p1 = homography.project(self.H, (b["bbox"][0] / 2 + b["bbox"][2] / 2, b["bbox"][3]))
        d = ((p1[0] - p0[0]) ** 2 + (p1[1] - p0[1]) ** 2) ** 0.5
        samples = self._samples.setdefault(track.track_id, [])
        samples.append(d / dt * 3.6)
        del samples[:-self.smooth]
        return mean(samples)

    def update(self, tracks, frame, timestamp, debounce=None) -> list[Event]:
        events = []
        for track in tracks:
            if track.cls not in VEHICLES:
                continue
            kmh = self.estimate_kmh(track)
            if kmh is None or kmh <= self.limit:
                continue
            if debounce and not debounce(track.track_id, self.name):
                continue
            events.append(Event(self.name, track.track_id, 0.85, {
                "speed_kmh": round(kmh, 1), "limit": self.limit,
                "vehicle_class": track.cls, "accuracy_note": "estimated, +/-10-15%",
            }))
        return events
