import { createFileRoute } from "@tanstack/react-router";
import { Flame, Pause, Play, RotateCcw, Siren, Video, Webcam } from "lucide-react";
import { useState } from "react";
import { AlertBanner } from "@/components/vision/AlertBanner";
import { EventRow } from "@/components/vision/EventFeed";
import { LiveCanvas } from "@/components/vision/LiveCanvas";
import { VideoDropzone } from "@/components/vision/VideoDropzone";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useSimulation } from "@/lib/vision/useSimulation";
import { useTriNetra } from "@/lib/vision/store";
import { CRITICAL_EVENTS, EVENT_LABEL, type EventType } from "@/lib/vision/types";

export const Route = createFileRoute("/camera-vision")({
  head: () => ({
    meta: [
      { title: "Camera Vision — TriNetra Live CV Feed" },
      {
        name: "description",
        content:
          "Live camera vision for TriNetra: YOLOv8 + ByteTrack overlay with speed, red-light, intrusion, fire and accident detection on the Nagpur junction feed.",
      },
      { property: "og:title", content: "Camera Vision — TriNetra Live CV Feed" },
      {
        property: "og:description",
        content:
          "Real-time detection overlay, zone geometry and an event feed wired into the TriNetra command center.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CameraVisionPage,
});

const ALL_MODULES: EventType[] = [
  "overspeed",
  "red_light",
  "no_helmet",
  "triple_riding",
  "pedestrian_intrusion",
  "animal_on_road",
  "litter_suspected",
  "fire",
  "accident_suspected",
];

function CameraVisionPage() {
  const { events, activeStream, updateStream, reset } = useTriNetra();
  const sim = useSimulation();
  const [showZones, setShowZones] = useState(true);
  const [uploadedSource, setUploadedSource] = useState<string | undefined>(undefined);

  const critical = events.find((e) => CRITICAL_EVENTS.includes(e.event_type) && !e.reviewed);
  const enabled = activeStream.settings.modules_enabled;

  const toggleModule = (m: EventType, on: boolean) =>
    updateStream(activeStream.id, {
      settings: {
        ...activeStream.settings,
        modules_enabled: on ? [...enabled, m] : enabled.filter((x) => x !== m),
      },
    });

  return (
    <div className="space-y-5">
      <div>
        <p className="label-mono">/vision/streams/{activeStream.id}</p>
        <h1 className="font-display text-2xl font-bold tracking-wide">Camera Vision</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Computer-vision layer of the command grid: detection, tracking and rule modules running on
          the junction feed, emitting the same events the risk engine consumes.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <AlertBanner event={critical} />

          <section className="panel p-4">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <div className="flex-1">
                <p className="label-mono">{activeStream.id} · uploaded_file</p>
                <h2 className="text-lg font-semibold">{activeStream.name}</h2>
              </div>
              <Badge variant="outline" className="font-mono">
                yolov8s · bytetrack
              </Badge>
              <Badge variant="outline" className="font-mono">
                {sim.running ? `${sim.fps} fps` : "idle"}
              </Badge>
              <Button size="sm" onClick={() => sim.setRunning(!sim.running)}>
                {sim.running ? <Pause className="size-4" /> : <Play className="size-4" />}
                {sim.running ? "Pause" : "Start pipeline"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => sim.forceEvents(["accident_suspected"])}
              >
                <Siren className="size-4" /> Simulate accident
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => sim.forceEvents(["fire"])}
              >
                <Flame className="size-4" /> Simulate fire
              </Button>
              <Button size="sm" variant="secondary" onClick={reset}>
                <RotateCcw className="size-4" /> Clear log
              </Button>
            </div>

            <LiveCanvas
              tracks={sim.tracks}
              signalRed={sim.signalRed}
              showZones={showZones}
              running={sim.running}
              speed={sim.speed}
              frame={sim.frame}
              clipFps={sim.clipFps}
              src={uploadedSource}
            />

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <Label className="label-mono">Playback speed · {sim.speed}x</Label>
                <Slider
                  className="mt-2"
                  min={0.5}
                  max={4}
                  step={0.5}
                  value={[sim.speed]}
                  onValueChange={([v]) => sim.setSpeed(v ?? 1)}
                />
              </div>
              <div>
                <Label className="label-mono">
                  Speed limit · {activeStream.speed_limit_kmh} km/h
                </Label>
                <Slider
                  className="mt-2"
                  min={20}
                  max={100}
                  step={5}
                  value={[activeStream.speed_limit_kmh]}
                  onValueChange={([v]) =>
                    updateStream(activeStream.id, { speed_limit_kmh: v ?? 40 })
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="label-mono">Signal state RED</Label>
                  <Switch checked={sim.signalRed} onCheckedChange={sim.setSignalRed} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="label-mono">Zone overlay</Label>
                  <Switch checked={showZones} onCheckedChange={setShowZones} />
                </div>
              </div>
            </div>
          </section>

          <section className="panel p-4">
            <h3 className="text-sm font-semibold">Stream sources</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Ingest footage into the detection pipeline. Uploaded clips replace the junction feed
              and are analysed by the same modules.
            </p>

            <div className="mt-3">
              <VideoDropzone
                onUploaded={({ file, sourceUri, persisted }) => {
                  setUploadedSource(sourceUri);
                  updateStream(activeStream.id, {
                    name: file.name.replace(/\.[^.]+$/, ""),
                    source_uri: persisted ? sourceUri : `local://${file.name}`,
                    source_type: "uploaded_file",
                  });
                }}
                onCleared={() => setUploadedSource(undefined)}
              />
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                { icon: Video, t: "Add RTSP stream", s: "rtsp://user:pass@host:554/stream" },
                { icon: Webcam, t: "Use webcam", s: "device index 0 (OpenCV VideoCapture)" },
              ].map(({ icon: Icon, t, s: sub }) => (
                <div
                  key={t}
                  className="rounded-lg border border-border bg-surface-2/60 px-4 py-4 text-center"
                >
                  <Icon className="mx-auto size-5 text-primary" />
                  <p className="mt-2 text-sm font-medium">{t}</p>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="panel flex h-[520px] flex-col p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Live event feed</h3>
              <span className="label-mono">{events.length} records</span>
            </div>
            <ScrollArea className="-mx-1 flex-1 px-1">
              {events.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Start the pipeline to populate the event log.
                </p>
              ) : (
                events.slice(0, 60).map((e) => <EventRow key={e.id} event={e} />)
              )}
            </ScrollArea>
          </section>

          <section className="panel p-4">
            <h3 className="mb-3 text-sm font-semibold">Modules</h3>
            <div className="space-y-2.5">
              {ALL_MODULES.map((m) => (
                <div key={m} className="flex items-center justify-between gap-2">
                  <span className="text-sm">{EVENT_LABEL[m]}</span>
                  <Switch
                    checked={enabled.includes(m)}
                    disabled={m === "no_helmet"}
                    onCheckedChange={(v) => toggleModule(m, v)}
                  />
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Fire backend: <span className="font-mono">{activeStream.settings.fire_backend}</span> —
              colour + flicker + optical-flow agreement over 2s, never colour alone.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
