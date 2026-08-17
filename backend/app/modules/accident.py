from __future__ import annotations

from .base import DetectionModule, Event


def iou(a, b) -> float:
    ax1, ay1, ax2, ay2 = a
    bx1, by1, bx2, by2 = b
    ix1, iy1 = max(ax1, bx1), max(ay1, by1)
    ix2, iy2 = min(ax2, bx2), min(ay2, by2)
    inter = max(0.0, ix2 - ix1) * max(0.0, iy2 - iy1)
    union = (ax2 - ax1) * (ay2 - ay1) + (bx2 - bx1) * (by2 - by1) - inter
    return inter / union if union > 0 else 0.0


class AccidentModule(DetectionModule):
    name = "accident_suspected"

    def __init__(self, decel_pct: float = 0.5, iou_spike: float = 0.4, min_signals: int = 2):
        self.decel_pct = decel_pct
        self.iou_spike = iou_spike
        self.min_signals = min_signals
        self.prev_speed: dict[int, float] = {}
        self.prev_iou: dict[tuple[int, int], float] = {}

    def update(self, tracks, frame, timestamp, speeds=None, debounce=None) -> list[Event]:
        speeds = speeds or {}
        events = []
        decelerated: set[int] = set()
        for track in tracks:
            speed = speeds.get(track.track_id)
            prev = self.prev_speed.get(track.track_id)
            if speed is not None:
                if prev and prev > 10 and speed < prev * (1 - self.decel_pct):
                    decelerated.add(track.track_id)
                self.prev_speed[track.track_id] = speed

        for i, a in enumerate(tracks):
            for b in tracks[i + 1:]:
                key = (a.track_id, b.track_id)
                now = iou(a.bbox, b.bbox)
                before = self.prev_iou.get(key, 0.0)
                self.prev_iou[key] = now
                signals = 0
                if now > self.iou_spike and before < self.iou_spike / 2:
                    signals += 1
                if a.track_id in decelerated or b.track_id in decelerated:
                    signals += 1
                if signals < self.min_signals:
                    continue
                if debounce and not debounce(a.track_id, self.name):
                    continue
                events.append(Event(self.name, a.track_id, 0.6, {
                    "other_track_id": b.track_id, "iou": round(now, 2), "signals": signals,
                    "note": "suspected accident - needs human confirmation",
                }))
        return events
