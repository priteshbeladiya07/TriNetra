from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np

from .base import DetectionModule, Event

WEIGHTS = Path(__file__).resolve().parents[2] / "models" / "fire_smoke" / "best.pt"


class FireSmokeModule(DetectionModule):
    """Colour alone NEVER classifies fire. The heuristic backend requires
    colour + flicker + turbulent optical flow to agree for a sustained window."""

    name = "fire"

    def __init__(self, backend: str = "heuristic", sustain_s: float = 2.0):
        self.backend = backend
        self.sustain_s = sustain_s
        self.window: deque = deque(maxlen=16)
        self._hot_since: float | None = None
        self._prev_gray = None

    def available(self):
        if self.backend == "custom_model" and not WEIGHTS.exists():
            return False, "fire/smoke custom model not loaded - falling back to heuristic"
        return True, ""

    def _colour_mask(self, frame):
        import cv2
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        lower = np.array([0, 120, 150]); upper = np.array([35, 255, 255])
        return cv2.inRange(hsv, lower, upper)

    def update(self, tracks, frame, timestamp, debounce=None) -> list[Event]:
        import cv2
        mask = self._colour_mask(frame)
        colour_ratio = float(mask.mean()) / 255.0
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        self.window.append(cv2.bitwise_and(gray, gray, mask=mask).mean())

        flicker = float(np.std(self.window)) if len(self.window) == self.window.maxlen else 0.0
        turbulence = 0.0
        if self._prev_gray is not None:
            flow = cv2.calcOpticalFlowFarneback(self._prev_gray, gray, None, 0.5, 2, 15, 2, 5, 1.2, 0)
            turbulence = float(np.std(flow))
        self._prev_gray = gray

        signals = {
            "color": colour_ratio > 0.01,
            "flicker": flicker > 2.0,
            "motion_irregularity": turbulence > 0.6,
        }
        if not all(signals.values()):
            self._hot_since = None
            return []
        self._hot_since = self._hot_since or timestamp
        if timestamp - self._hot_since < self.sustain_s:
            return []
        if debounce and not debounce(-1, self.name):
            return []
        return [Event(self.name, -1, 0.78, {
            "backend": self.backend, "signals": "+".join(k for k, v in signals.items() if v),
            "sustained_s": round(timestamp - self._hot_since, 1),
        })]
