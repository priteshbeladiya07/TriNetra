import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Ambulance, MapPin, Radio, Siren, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTriNetra } from "@/lib/vision/store";
import {
  DISPATCH_UNITS,
  EVENT_LABEL,
  type DispatchStatus,
  type PoliceDispatch,
} from "@/lib/vision/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dispatch")({
  head: () => ({
    meta: [
      { title: "Police Dispatch — TriNetra Emergency Response" },
      {
        name: "description",
        content:
          "Immediate police, fire and ambulance dispatch for accidents and fire detected by TriNetra camera vision, with unit assignment, ETA and on-scene tracking.",
      },
      { property: "og:title", content: "Police Dispatch — TriNetra Emergency Response" },
      {
        property: "og:description",
        content:
          "Critical events escalate straight to a dispatch card with location, responding unit and ETA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DispatchPage,
});

const STATUS_STYLE: Record<DispatchStatus, string> = {
  pending: "text-destructive border-destructive/60",
  dispatched: "text-warning border-warning/60",
  on_scene: "text-primary border-primary/60",
  resolved: "text-success border-success/60",
};

function DispatchCard({ d }: { d: PoliceDispatch }) {
  const { dispatchTeam, updateDispatch } = useTriNetra();
  return (
    <article
      className={cn(
        "rounded-lg border p-4",
        d.status === "pending"
          ? "alert-pulse border-destructive/60 bg-destructive/10"
          : "border-border bg-surface/60",
      )}
    >
      <div className="flex flex-wrap items-start gap-3">
        <Siren
          className={cn(
            "mt-0.5 size-5",
            d.status === "pending" ? "text-destructive" : "text-muted-foreground",
          )}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {EVENT_LABEL[d.event_type]} — immediate response required
          </p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {d.id} · {d.event_id} · {new Date(d.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <Badge variant="outline" className={cn("font-mono", STATUS_STYLE[d.status])}>
          {d.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="mt-3 grid gap-3 text-xs sm:grid-cols-3">
        <p className="flex items-center gap-2 font-mono text-muted-foreground">
          <MapPin className="size-3.5 text-primary" /> {d.lat.toFixed(4)}, {d.lng.toFixed(4)}
        </p>
        <p className="flex items-center gap-2 font-mono text-muted-foreground">
          <Radio className="size-3.5 text-primary" /> {d.unit}
        </p>
        <p className="flex items-center gap-2 font-mono text-muted-foreground">
          <Timer className="size-3.5 text-primary" /> ETA {d.eta_min} min
        </p>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {d.location} · responders: {d.responders.join(", ")}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={d.unit}
          onChange={(e) => {
            const u = DISPATCH_UNITS.find((x) => x.unit === e.target.value);
            if (u) updateDispatch(d.id, { unit: u.unit, eta_min: u.eta, responders: u.responders });
          }}
          className="h-8 rounded-md border border-border bg-surface px-2 font-mono text-xs"
        >
          {DISPATCH_UNITS.map((u) => (
            <option key={u.unit} value={u.unit}>
              {u.unit}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          variant={d.status === "pending" ? "destructive" : "secondary"}
          disabled={d.status !== "pending"}
          onClick={() => dispatchTeam(d.id)}
        >
          <Siren className="size-4" /> Deploy now
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={d.status !== "dispatched"}
          onClick={() => updateDispatch(d.id, { status: "on_scene" })}
        >
          Mark on scene
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={d.status === "resolved" || d.status === "pending"}
          onClick={() => updateDispatch(d.id, { status: "resolved" })}
        >
          Resolve
        </Button>
      </div>
    </article>
  );
}

function DispatchPage() {
  const { dispatches } = useTriNetra();

  const stats = useMemo(
    () => ({
      pending: dispatches.filter((d) => d.status === "pending").length,
      active: dispatches.filter((d) => d.status === "dispatched" || d.status === "on_scene").length,
      resolved: dispatches.filter((d) => d.status === "resolved").length,
    }),
    [dispatches],
  );

  return (
    <div className="space-y-5">
      <div>
        <p className="label-mono">/response/police-dispatch</p>
        <h1 className="font-display text-2xl font-bold tracking-wide">Police Dispatch</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Accidents, fire and smoke bypass the challan pipeline entirely and raise a dispatch order
          with the nearest unit, location and ETA so a team reaches the scene immediately.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Awaiting deployment", value: stats.pending, icon: Siren },
          { label: "Units en route / on scene", value: stats.active, icon: Ambulance },
          { label: "Resolved", value: stats.resolved, icon: Radio },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="panel p-4">
            <div className="flex items-center justify-between">
              <p className="label-mono">{label}</p>
              <Icon className="size-4 text-primary" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <section className="panel p-4">
        <h2 className="mb-3 text-sm font-semibold">Dispatch orders</h2>
        <ScrollArea className="h-[560px]">
          {dispatches.length === 0 ? (
            <p className="px-3 py-16 text-center text-sm text-muted-foreground">
              No emergencies. Dispatch orders appear the moment fire, smoke or a suspected accident
              is detected on any stream.
            </p>
          ) : (
            <div className="space-y-3 pr-2">
              {dispatches.map((d) => (
                <DispatchCard key={d.id} d={d} />
              ))}
            </div>
          )}
        </ScrollArea>
      </section>
    </div>
  );
}
