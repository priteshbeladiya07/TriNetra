import raw from "./live-tracks.json";
import type { SimTrack } from "./engine";

/**
 * Real tracker output baked from the demo clip.
 * Produced offline with YOLOv8 detection + ByteTrack association on
 * src/assets/live-feed.mp4 (1344x768 @ 24 fps), boxes normalised to 0..1.
 * The dashboard therefore draws boxes on the actual vehicles in the footage
 * instead of a synthetic animation.
 */

interface RawBox {
  id: number;
  cls: string;
  conf: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  kmh: number;
}

const DATA = raw as { fps: number; frames: RawBox[][] };

export const TRACK_FPS = DATA.fps;
export const TRACK_FRAME_COUNT = DATA.frames.length;
export const CLIP_DURATION_S = TRACK_FRAME_COUNT / DATA.fps;

/** Tracker boxes for a given clip frame (wraps around on loop). */
export function tracksAtFrame(frame: number): SimTrack[] {
  const idx = ((frame % TRACK_FRAME_COUNT) + TRACK_FRAME_COUNT) % TRACK_FRAME_COUNT;
  const row = DATA.frames[idx] ?? [];
  return row.map((b) => ({
    track_id: b.id,
    cls: b.cls,
    // canvas draws boxes from the baseline (y is the bottom edge)
    x: b.x,
    y: b.y + b.h,
    w: b.w,
    h: b.h,
    vx: b.vx,
    vy: b.vy,
    lane: b.y + b.h > 0.78 ? 0 : b.y + b.h > 0.62 ? 1 : 2,
    speed_kmh: b.kmh,
  }));
}
