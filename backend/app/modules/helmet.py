from __future__ import annotations

from pathlib import Path

from .base import DetectionModule, Event

WEIGHTS = Path(__file__).resolve().parents[2] / "models" / "helmet" / "best.pt"


class HelmetModule(DetectionModule):
    """COCO has no helmet class -> requires custom fine-tuned weights."""

    name = "no_helmet"
    requires_custom_model = True

    def available(self):
        if WEIGHTS.exists():
            return True, ""
        return False, "helmet detection unavailable - no custom model loaded"

    def update(self, tracks, frame, timestamp, debounce=None) -> list[Event]:
        ok, _ = self.available()
        if not ok:
            return []  # never crash, never guess
        from ultralytics import YOLO
        model = YOLO(str(WEIGHTS))
        events = []
        for track in (t for t in tracks if t.cls == "motorcycle"):
            x1, y1, x2, y2 = (int(v) for v in track.bbox)
            crop = frame[max(0, y1):y1 + int((y2 - y1) * 0.45), max(0, x1):x2]
            if crop.size == 0:
                continue
            res = model.predict(crop, verbose=False)[0]
            names = {res.names[int(c)] for c in res.boxes.cls} if res.boxes is not None else set()
            if "no_helmet" in names and (not debounce or debounce(track.track_id, self.name)):
                events.append(Event(self.name, track.track_id, 0.8, {"vehicle_class": "motorcycle"}))
        return events
