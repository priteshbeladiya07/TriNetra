from __future__ import annotations

from .base import DetectionModule, Event


class LitterModule(DetectionModule):
    """Abandoned-object heuristic via background subtraction. Low-confidence review only."""

    name = "litter_suspected"

    def __init__(self, dwell_s: float = 45.0, move_px: float = 6.0):
        import cv2
        self.bg = cv2.createBackgroundSubtractorMOG2(detectShadows=True)
        self.dwell_s = dwell_s
        self.move_px = move_px
        self._blobs: dict[tuple[int, int], dict] = {}

    def update(self, tracks, frame, timestamp, debounce=None) -> list[Event]:
        import cv2
        mask = self.bg.apply(frame)
        _, mask = cv2.threshold(mask, 200, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        events = []
        for cnt in contours:
            if cv2.contourArea(cnt) < 120:
                continue
            x, y, w, h = cv2.boundingRect(cnt)
            key = (x // 20, y // 20)
            blob = self._blobs.setdefault(key, {"first_seen": timestamp, "reported": False})
            if blob["reported"] or timestamp - blob["first_seen"] < self.dwell_s:
                continue
            blob["reported"] = True
            events.append(Event(self.name, -1, 0.35, {
                "bbox": [x, y, w, h], "dwell_s": round(timestamp - blob["first_seen"], 1),
                "note": "review required - parked vehicles/shadows cause false positives",
            }))
        return events
