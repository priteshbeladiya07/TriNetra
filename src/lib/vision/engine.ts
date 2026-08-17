import type { EventType, TrackBox } from "./types";

/**
 * Deterministic browser simulation of the tracker output that the Python
 * pipeline (YOLOv8 -> ByteTrack -> modules) pushes to the dashboard.
 * It exists so the UI can be demoed without GPU weights present; the real
 * pipeline replaces this by pushing identical TrackBox/Event payloads.
 */

const CLASSES = ["car", "motorcycle", "truck", "bus", "person", "cow"] as const;

export interface SimTrack extends TrackBox {
  vx: number;
  vy: number;
  lane: number;
}

let nextId = 1;

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export function spawnTrack(): SimTrack {
  const cls = CLASSES[Math.floor(Math.random() * CLASSES.length)] ?? "car";
  const vehicle = cls !== "person" && cls !== "cow";
  const lane = Math.floor(rand(0, 3));
  const size = cls === "truck" || cls === "bus" ? 0.16 : cls === "person" ? 0.05 : 0.1;
  return {
    track_id: nextId++,
    cls,
    x: -0.2,
    y: 0.42 + lane * 0.14 + rand(-0.02, 0.02),
    w: size,
    h: size * (cls === "person" ? 1.8 : 0.72),
    vx: vehicle ? rand(0.09, 0.28) : rand(0.02, 0.05),
    vy: vehicle ? 0 : rand(-0.02, 0.02),
    lane,
    speed_kmh: vehicle ? Math.round(rand(22, 74)) : Math.round(rand(3, 9)),
  };
}

export function stepTracks(tracks: SimTrack[], dt: number): SimTrack[] {
  return tracks
    .map((t) => ({ ...t, x: t.x + t.vx * dt, y: Math.min(0.9, Math.max(0.1, t.y + t.vy * dt)) }))
    .filter((t) => t.x < 1.2);
}

export interface DetectedEvent {
  type: EventType;
  track: SimTrack;
  metadata: Record<string, string | number | boolean>;
  confidence: number;
}

/** Rule modules, mirroring backend/app/modules/*.py behaviour at a demo fidelity. */
export function evaluateModules(
  tracks: SimTrack[],
  opts: {
    enabled: EventType[];
    speedLimit: number;
    signalRed: boolean;
    fired: Set<string>;
    forced?: EventType[];
  },
): DetectedEvent[] {
  const out: DetectedEvent[] = [];
  const once = (key: string) => {
    if (opts.fired.has(key)) return false;
    opts.fired.add(key);
    return true;
  };

  for (const t of tracks) {
    const vehicle = t.cls !== "person" && t.cls !== "cow";
    const crossedStopLine = t.x > 0.62 && t.x < 0.72;

    if (
      opts.enabled.includes("overspeed") &&
      vehicle &&
      (t.speed_kmh ?? 0) > opts.speedLimit &&
      t.x > 0.25 &&
      once(`${t.track_id}:overspeed`)
    ) {
      out.push({
        type: "overspeed",
        track: t,
        confidence: 0.82 + Math.random() * 0.15,
        metadata: {
          speed_kmh: t.speed_kmh ?? 0,
          limit: opts.speedLimit,
          vehicle_class: t.cls,
          method: "homography",
        },
      });
    }

    if (
      opts.enabled.includes("red_light") &&
      vehicle &&
      opts.signalRed &&
      crossedStopLine &&
      once(`${t.track_id}:red_light`)
    ) {
      out.push({
        type: "red_light",
        track: t,
        confidence: 0.9,
        metadata: {
          signal_state: "RED",
          speed_at_crossing: t.speed_kmh ?? 0,
          vehicle_class: t.cls,
        },
      });
    }

    if (
      opts.enabled.includes("triple_riding") &&
      t.cls === "motorcycle" &&
      t.track_id % 4 === 0 &&
      t.x > 0.4 &&
      once(`${t.track_id}:triple`)
    ) {
      out.push({
        type: "triple_riding",
        track: t,
        confidence: 0.71,
        metadata: { persons_associated: 3, vehicle_class: "motorcycle", vote_frames: 15 },
      });
    }

    if (
      opts.enabled.includes("pedestrian_intrusion") &&
      t.cls === "person" &&
      t.x > 0.3 &&
      t.y > 0.45 &&
      once(`${t.track_id}:intrusion`)
    ) {
      out.push({
        type: "pedestrian_intrusion",
        track: t,
        confidence: 0.68,
        metadata: { zone: "road_zone", dwell_s: 2.4, in_crosswalk: false },
      });
    }

    if (
      opts.enabled.includes("animal_on_road") &&
      t.cls === "cow" &&
      t.x > 0.3 &&
      once(`${t.track_id}:animal`)
    ) {
      out.push({
        type: "animal_on_road",
        track: t,
        confidence: 0.74,
        metadata: { zone: "road_zone", species: "cow", dwell_s: 3.1 },
      });
    }
  }

  for (const forced of opts.forced ?? []) {
    const t = tracks[Math.floor(Math.random() * tracks.length)] ?? spawnTrack();
    out.push({
      type: forced,
      track: t,
      confidence: forced === "fire" ? 0.79 : 0.62,
      metadata:
        forced === "fire" || forced === "smoke"
          ? { signals: "color+flicker+flow", sustained_s: 2.3, backend: "heuristic" }
          : forced === "accident_suspected"
            ? { decel_pct: 62, iou_spike: 0.54, signals: 2, vehicle_class: t.cls }
            : forced === "no_helmet"
              ? { vehicle_class: "motorcycle", model: "custom_helmet_v1" }
              : { note: "scenario-forced" },
    });
  }

  return out;
}

export function makeEventPayload(
  d: DetectedEvent,
  streamId: string,
): {
  stream_id: string;
  event_type: EventType;
  track_id: number;
  timestamp: string;
  confidence: number;
  metadata: Record<string, string | number | boolean>;
  evidence_snapshot_path: string;
  evidence_clip_path: string | null;
} {
  const stamp = new Date().toISOString();
  return {
    stream_id: streamId,
    event_type: d.type,
    track_id: d.track.track_id,
    timestamp: stamp,
    confidence: Number(d.confidence.toFixed(2)),
    metadata: d.metadata,
    evidence_snapshot_path: `/storage/evidence/${streamId}_${d.track.track_id}.jpg`,
    evidence_clip_path: `/storage/evidence/${streamId}_${d.track.track_id}.mp4`,
  };
}
