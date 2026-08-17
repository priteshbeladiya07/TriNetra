from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Any


@dataclass
class Event:
    event_type: str
    track_id: int
    confidence: float
    metadata: dict[str, Any] = field(default_factory=dict)
    timestamp: str = field(default_factory=lambda: time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))


class DetectionModule:
    """Common interface: modules are pluggable without touching the core loop."""

    name = "base"
    requires_custom_model = False

    def available(self) -> tuple[bool, str]:
        return True, ""

    def update(self, tracks, frame, timestamp: float) -> list[Event]:
        raise NotImplementedError
