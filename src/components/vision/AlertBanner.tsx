import { Link } from "@tanstack/react-router";
import { Siren } from "lucide-react";
import { EVENT_LABEL, type TriEvent } from "@/lib/vision/types";
import { Button } from "@/components/ui/button";
import { useTriNetra } from "@/lib/vision/store";

export function AlertBanner({ event }: { event: TriEvent | undefined }) {
  const { dispatches, dispatchTeam } = useTriNetra();
  const order = event ? dispatches.find((d) => d.event_id === event.id) : undefined;
  if (!event) {
    return (
      <div className="panel flex items-center gap-3 px-4 py-3">
        <span className="size-2.5 rounded-full bg-success" />
        <span className="text-sm text-muted-foreground">
          No active emergency. Traffic violations route silently to the challan pipeline.
        </span>
      </div>
    );
  }
  return (
    <div className="alert-pulse flex items-center gap-3 rounded-lg border border-destructive/60 bg-destructive/15 px-4 py-3">
      <Siren className="size-5 text-destructive" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-destructive">
          POLICE DISPATCH — {EVENT_LABEL[event.event_type]}
        </p>
        <p className="truncate font-mono text-xs text-muted-foreground">
          {event.id} · track #{event.track_id} · confidence {event.confidence} ·{" "}
          {new Date(event.timestamp).toLocaleTimeString()}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {order && order.status === "pending" ? (
          <Button size="sm" variant="destructive" onClick={() => dispatchTeam(order.id)}>
            <Siren className="size-4" /> Deploy police team
          </Button>
        ) : (
          <span className="label-mono text-warning">
            {order ? `${order.unit} · ${order.status.replace("_", " ")}` : "high priority"}
          </span>
        )}
        <Button asChild size="sm" variant="outline">
          <Link to="/dispatch">Dispatch board</Link>
        </Button>
      </div>
    </div>
  );
}
