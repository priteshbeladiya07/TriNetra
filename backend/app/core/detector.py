"""YOLOv8 wrapper. Loads lazily so the app boots without weights present."""
from __future__ import annotations

from dataclasses import dataclass

BASE_CLASSES = [
    "person", "bicycle", "car", "motorcycle", "bus", "truck",
    "dog", "cat", "cow", "horse", "sheep",
]


@dataclass
class Detection:
    cls: str
    conf: float
    xyxy: tuple[float, float, float, float]


class Detector:
    def __init__(self, weights: str = "yolov8s.pt", conf: float = 0.35, iou: float = 0.5):
        self.weights, self.conf, self.iou = weights, conf, iou
        self._model = None

    @property
    def model(self):
        if self._model is None:
            from ultralytics import YOLO  # imported lazily
            self._model = YOLO(self.weights)
        return self._model

    def track(self, source, frame_skip: int = 0):
        """Yields (frame, results) using built-in ByteTrack with persistent IDs."""
        stream = self.model.track(
            source=source, tracker="bytetrack.yaml", persist=True,
            conf=self.conf, iou=self.iou, stream=True, verbose=False,
        )
        for i, result in enumerate(stream):
            if frame_skip and i % (frame_skip + 1):
                continue
            yield result.orig_img, result
