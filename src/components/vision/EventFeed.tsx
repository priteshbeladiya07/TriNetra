import {
  AlertTriangle,
  Bike,
  Camera,
  Dog,
  Flame,
  Gauge,
  PersonStanding,
  Trash2,
  TrafficCone,
  Users,
} from "lucide-react";
import { EVENT_LABEL, type EventType, type TriEvent } from "@/lib/vision/types";
import { cn } from "@/lib/utils";

export const EVENT_ICON: Record<EventType, typeof Gauge> = {
  overspeed: Gauge,
  red_light: TrafficCone,
  no_helmet: Bike,
  triple_riding: Users,
  pedestrian_intrusion: PersonStanding,
  animal_on_road: Dog,
  litter_suspected: Trash2,
  fire: Flame,
  smoke: Flame,
  accident_suspected: AlertTriangle,
};

export function severityClass(type: EventType) {
  if (type === "fire" || type === "smoke" || type === "accident_suspected")
    return "text-destructive";
  if (type === "litter_suspected" || type === "pedestrian_intrusion" || type === "animal_on_road")
    return "text-muted-foreground";
  return "text-warning";
}

export function EventRow({ event, onClick }: { event: TriEvent; onClick?: () => void }) {
  const Icon = EVENT_ICON[event.event_type];
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-md border border-transparent px-3 py-2.5 text-left transition-colors hover:border-border hover:bg-accent/60"
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", severityClass(event.event_type))} />
      <span className="min-w-0 flex-1 overflow-hidden">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium">{EVENT_LABEL[event.event_type]}</span>
          <span className="label-mono shrink-0">
            {new Date(event.timestamp).toLocaleTimeString()}
          </span>
        </span>
        <span className="mt-0.5 block truncate font-mono text-xs text-muted-foreground">
          track #{event.track_id} · conf {event.confidence} ·{" "}
          {Object.entries(event.metadata)
            .slice(0, 2)
            .map(([k, v]) => `${k}=${v}`)
            .join(" ")}
        </span>
      </span>
      <Camera className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
    </button>
  );
}
