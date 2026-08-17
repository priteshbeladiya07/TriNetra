import { useEffect, useRef } from "react";
import type { SimTrack } from "@/lib/vision/engine";
// bundled locally in public/ so the demo runs offline / anywhere
const LIVE_FEED_SRC = "/live-feed.mp4";


const COLORS: Record<string, string> = {
  car: "#5fd8e6",
  truck: "#5fd8e6",
  bus: "#5fd8e6",
  motorcycle: "#f4c15d",
  person: "#8ee6b3",
  cow: "#c79bf0",
};

export function LiveCanvas({
  tracks,
  signalRed,
  showZones,
  running = true,
  speed = 1,
  frame = 0,
  clipFps = 24,
  src,
}: {
  tracks: SimTrack[];
  signalRed: boolean;
  showZones: boolean;
  running?: boolean;
  speed?: number;
  /** clip frame the tracker output belongs to — the video is slaved to it */
  frame?: number;
  clipFps?: number;
  /** optional uploaded/live source overriding the bundled demo clip */
  src?: string | undefined;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = Math.min(4, Math.max(0.25, speed));
    if (running) void v.play().catch(() => undefined);
    else v.pause();
  }, [running, speed]);

  // keep the footage locked to the frame the boxes came from
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const target = frame / clipFps;
    if (Math.abs(v.currentTime - target) > 0.2) v.currentTime = target;
  }, [frame, clipFps]);





  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    // transparent overlay: the real camera footage renders behind this canvas
    ctx.clearRect(0, 0, W, H);


    if (showZones) {
      ctx.font = "11px 'IBM Plex Mono', monospace";

      // carriageway polygon, traced on the actual junction in the footage
      ctx.strokeStyle = "rgba(95,216,230,0.55)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(W * 0.18, H * 0.99);
      ctx.lineTo(W * 0.34, H * 0.4);
      ctx.lineTo(W * 0.74, H * 0.4);
      ctx.lineTo(W * 0.99, H * 0.72);
      ctx.lineTo(W * 0.99, H * 0.99);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "rgba(95,216,230,0.8)";
      ctx.fillText("road_zone", W * 0.35, H * 0.4 - 6);

      // pedestrian crosswalk / sidewalk zone (right of the median island)
      ctx.strokeStyle = "rgba(142,230,179,0.5)";
      ctx.strokeRect(W * 0.66, H * 0.58, W * 0.28, H * 0.34);
      ctx.fillStyle = "rgba(142,230,179,0.8)";
      ctx.fillText("crosswalk_zone", W * 0.66 + 4, H * 0.58 - 6);

      // stop line ahead of the crosswalk
      ctx.strokeStyle = signalRed ? "#ef5f5f" : "#8ee6b3";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(W * 0.64, H * 0.45);
      ctx.lineTo(W * 0.64, H * 0.95);
      ctx.stroke();
      ctx.fillStyle = signalRed ? "#ef5f5f" : "#8ee6b3";
      ctx.fillText(signalRed ? "SIGNAL: RED" : "SIGNAL: GREEN", W * 0.64 + 8, H * 0.45 - 8);
    }


    for (const t of tracks) {
      const x = t.x * W;
      const y = t.y * H;
      const w = t.w * W;
      const h = t.h * H;
      const color = t.flag ? "#ef5f5f" : (COLORS[t.cls] ?? "#5fd8e6");
      ctx.strokeStyle = color;
      ctx.lineWidth = t.flag ? 3 : 1.6;
      ctx.strokeRect(x, y - h, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      const label = `#${t.track_id} ${t.cls}${t.speed_kmh ? ` ${t.speed_kmh}km/h` : ""}`;
      ctx.font = "11px 'IBM Plex Mono', monospace";
      const tw = ctx.measureText(label).width + 10;
      ctx.fillRect(x, y - h - 16, tw, 15);
      ctx.fillStyle = color;
      ctx.fillText(label, x + 5, y - h - 5);
    }
  }, [tracks, signalRed, showZones]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
      <video
        ref={videoRef}
        // uploaded footage when provided, otherwise the bundled demo clip
        key={src ?? LIVE_FEED_SRC}
        src={src ?? LIVE_FEED_SRC}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 size-full object-cover"
      />
      <canvas
        ref={ref}
        width={1120}
        height={630}
        className="absolute inset-0 size-full"
      />
    </div>
  );

}
