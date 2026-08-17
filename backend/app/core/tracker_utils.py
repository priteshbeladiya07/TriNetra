"""In-memory per-track history. Never persisted — only derived events are."""
from __future__ import annotations

import time
from collections import defaultdict, deque
from dataclasses import dataclass, field

HISTORY_LEN = 90


@dataclass
class Track:
    track_id: int
    cls: str
    bbox: tuple[float, float, float, float]
    conf: float
    timestamp: float
    history: deque = field(default_factory=lambda: deque(maxlen=HISTORY_LEN))

    @property
    def center(self):
        x1, y1, x2, y2 = self.bbox
        return ((x1 + x2) / 2, (y1 + y2) / 2)

    @property
    def ground_point(self):
        x1, _, x2, y2 = self.bbox
        return ((x1 + x2) / 2, y2)


class TrackStore:
    def __init__(self):
        self._histories: dict[int, deque] = defaultdict(lambda: deque(maxlen=HISTORY_LEN))
        self._cooldowns: dict[tuple[int, str], float] = {}

    def update(self, detections) -> list[Track]:
        now = time.time()
        tracks = []
        for det in detections:
            hist = self._histories[det["track_id"]]
            track = Track(det["track_id"], det["cls"], det["bbox"], det["conf"], now, hist)
            hist.append({"bbox": det["bbox"], "center": track.center, "timestamp": now, "cls": det["cls"]})
            tracks.append(track)
        return tracks

    def debounce(self, track_id: int, event_type: str, cooldown_s: float = 20.0) -> bool:
        """Returns True at most once per track per incident window."""
        key = (track_id, event_type)
        now = time.time()
        if now - self._cooldowns.get(key, -1e9) < cooldown_s:
            return False
        self._cooldowns[key] = now
        return True
