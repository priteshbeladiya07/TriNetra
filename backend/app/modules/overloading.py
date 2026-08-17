from __future__ import annotations

from collections import defaultdict, deque

from .base import DetectionModule, Event


def center_in_box(center, box, pad=0.12) -> bool:
    x1, y1, x2, y2 = box
    w, h = (x2 - x1) * pad, (y2 - y1) * pad
    return x1 - w <= center[0] <= x2 + w and y1 - h <= center[1] <= y2 + h


class OverloadingModule(DetectionModule):
    name = "triple_riding"

    def __init__(self, threshold: int = 2, vote_frames: int = 15):
        self.threshold = threshold
        self.votes: dict[int, deque] = defaultdict(lambda: deque(maxlen=vote_frames))

    def update(self, tracks, frame, timestamp, debounce=None) -> list[Event]:
        persons = [t for t in tracks if t.cls == "person"]
        events = []
        for bike in (t for t in tracks if t.cls == "motorcycle"):
            riders = sum(1 for p in persons if center_in_box(p.center, bike.bbox))
            votes = self.votes[bike.track_id]
            votes.append(riders > self.threshold)
            if len(votes) == votes.maxlen and sum(votes) > len(votes) / 2:
                if debounce and not debounce(bike.track_id, self.name):
                    continue
                events.append(Event(self.name, bike.track_id, 0.72, {
                    "persons_associated": riders, "vehicle_class": "motorcycle",
                }))
        return events
