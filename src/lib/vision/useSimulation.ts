import { useCallback, useEffect, useRef, useState } from "react";
import { evaluateModules, makeEventPayload, type SimTrack } from "./engine";
import { TRACK_FPS, TRACK_FRAME_COUNT, tracksAtFrame } from "./liveTracks";
import { useTriNetra } from "./store";
import type { EventType } from "./types";


export function useSimulation() {
  const { activeStream, addEvent } = useTriNetra();
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [signalRed, setSignalRed] = useState(false);
  const [tracks, setTracks] = useState<SimTrack[]>([]);
  const [fps, setFps] = useState(0);
  const [frame, setFrame] = useState(0);
  const frameRef = useRef(0);
  const loopRef = useRef(0);
  const tracksRef = useRef<SimTrack[]>([]);

  const firedRef = useRef(new Set<string>());
  const forcedRef = useRef<EventType[]>([]);
  const streamRef = useRef(activeStream);
  const signalRef = useRef(signalRed);
  const speedRef = useRef(speed);
  const addEventRef = useRef(addEvent);
  streamRef.current = activeStream;
  signalRef.current = signalRed;
  speedRef.current = speed;
  addEventRef.current = addEvent;

  const forceEvents = useCallback((types: EventType[]) => {
    forcedRef.current = [...forcedRef.current, ...types];
  }, []);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    let clipFrame = frameRef.current;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const raw = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (raw <= 0) return;
      setFps(Math.round(1 / raw));

      // advance the clip clock; the <video> element is slaved to this frame
      clipFrame += raw * TRACK_FPS * speedRef.current;
      if (clipFrame >= TRACK_FRAME_COUNT) {
        clipFrame -= TRACK_FRAME_COUNT;
        loopRef.current += 1;
        firedRef.current.clear();
      }
      const fi = Math.floor(clipFrame);
      frameRef.current = clipFrame;
      setFrame(fi);

      const next = tracksAtFrame(fi);

      const forced = forcedRef.current;
      forcedRef.current = [];
      const stream = streamRef.current;
      const detections = evaluateModules(next, {
        enabled: stream.settings.modules_enabled,
        speedLimit: stream.speed_limit_kmh,
        signalRed: signalRef.current,
        fired: firedRef.current,
        forced,
      });
      for (const d of detections) {
        addEventRef.current(makeEventPayload(d, stream.id));
        const idx = next.findIndex((t) => t.track_id === d.track.track_id);
        if (idx >= 0) next[idx] = { ...next[idx]!, flag: d.type };
      }

      tracksRef.current = next;
      setTracks(next);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running]);


  useEffect(() => {
    const t = window.setInterval(() => setSignalRed((r) => !r), 9000);
    return () => window.clearInterval(t);
  }, []);

  return {
    running,
    setRunning,
    speed,
    setSpeed,
    signalRed,
    setSignalRed,
    tracks,
    fps,
    frame,
    clipFps: TRACK_FPS,
    forceEvents,
  };
}
