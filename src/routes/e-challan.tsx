import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, FileText, Gavel, IndianRupee, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTriNetra } from "@/lib/vision/store";
import { EVENT_LABEL, FINE_AMOUNTS, type Challan, type ChallanStatus } from "@/lib/vision/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/e-challan")({
  head: () => ({
    meta: [
      { title: "E-Challan — TriNetra Automated Violation Fines" },
      {
        name: "description",
        content:
          "Automated e-challan pipeline: ANPR plate reads, statutory fine slabs, evidence snapshots and issue / dispute workflow for Nagpur traffic violations.",
      },
      { property: "og:title", content: "E-Challan — TriNetra Automated Violation Fines" },
      {
        property: "og:description",
        content:
          "Review, issue and audit e-challans generated from live camera-vision traffic violations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EChallanPage,
});

const STATUS_STYLE: Record<ChallanStatus, string> = {
  auto_generated: "text-warning border-warning/50",
  pending_review: "text-muted-foreground border-border",
  issued: "text-success border-success/50",
  disputed: "text-destructive border-destructive/50",
};

const FILTERS: (ChallanStatus | "all")[] = [
  "all",
  "auto_generated",
  "pending_review",
  "issued",
  "disputed",
];

function fineFor(c: Challan) {
  return FINE_AMOUNTS[c.violation_type] ?? 500;
}

function EChallanPage() {
  const { challans, updateChallan } = useTriNetra();
  const [filter, setFilter] = useState<ChallanStatus | "all">("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(
    () =>
      challans.filter(
        (c) =>
          (filter === "all" || c.status === filter) &&
          (query.trim() === "" ||
            c.plate_number.toLowerCase().includes(query.trim().toLowerCase()) ||
            c.id.includes(query.trim())),
      ),
    [challans, filter, query],
  );

  const totals = useMemo(() => {
    const issued = challans.filter((c) => c.status === "issued");
    return {
      count: challans.length,
      issued: issued.length,
      pending: challans.filter((c) => c.status !== "issued" && c.status !== "disputed").length,
      revenue: issued.reduce((sum, c) => sum + fineFor(c), 0),
    };
  }, [challans]);

  const exportCsv = () => {
    const head = [
      "challan_id",
      "event_id",
      "plate_number",
      "plate_confidence",
      "violation_type",
      "fine_inr",
      "vehicle_class",
      "location",
      "timestamp",
      "status",
    ];
    const body = challans.map((c) =>
      [
        c.id,
        c.event_id,
        c.plate_number,
        c.plate_confidence,
        c.violation_type,
        fineFor(c),
        c.vehicle_class,
        `"${c.location}"`,
        c.timestamp,
        c.status,
      ].join(","),
    );
    const blob = new Blob([[head.join(","), ...body].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trinetra_echallans.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const issueAllReadable = () =>
    challans
      .filter((c) => c.status === "auto_generated" && c.plate_number !== "UNREADABLE")
      .forEach((c) => updateChallan(c.id, { status: "issued" }));

  return (
    <div className="space-y-5">
      <div>
        <p className="label-mono">/enforcement/e-challan</p>
        <h1 className="font-display text-2xl font-bold tracking-wide">E-Challan</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Every traffic violation detected by the vision layer is converted into an e-challan with
          plate read, evidence snapshot and statutory fine. Emergencies never come here — they route
          to police dispatch instead.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total challans", value: totals.count, icon: FileText },
          { label: "Issued", value: totals.issued, icon: Gavel },
          { label: "Awaiting action", value: totals.pending, icon: ShieldAlert },
          {
            label: "Recovered fines",
            value: `₹${totals.revenue.toLocaleString("en-IN")}`,
            icon: IndianRupee,
          },
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
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
                filter === f
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {f.replace("_", " ")}
            </button>
          ))}
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plate or challan id"
            className="h-8 w-56 font-mono text-xs"
          />
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="secondary" onClick={issueAllReadable}>
              <Gavel className="size-4" /> Issue all readable
            </Button>
            <Button size="sm" variant="outline" onClick={exportCsv}>
              <Download className="size-4" /> Export CSV
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[520px]">
          {rows.length === 0 ? (
            <p className="px-3 py-16 text-center text-sm text-muted-foreground">
              No challans yet — start the pipeline on Camera Vision to generate violations.
            </p>
          ) : (
            <div className="space-y-2 pr-2">
              {rows.map((c) => (
                <article
                  key={c.id}
                  className="grid gap-3 rounded-md border border-border bg-surface/60 p-3 md:grid-cols-[150px_1fr_auto] md:items-center"
                >
                  <div>
                    <p className="font-mono text-sm font-semibold tracking-wider">
                      {c.plate_number}
                    </p>
                    <p className="label-mono">OCR {c.plate_confidence}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {EVENT_LABEL[c.violation_type]} · ₹{fineFor(c).toLocaleString("en-IN")}
                    </p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {c.id} · {c.vehicle_class} · {c.location} ·{" "}
                      {new Date(c.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={cn("font-mono", STATUS_STYLE[c.status])}>
                      {c.status.replace("_", " ")}
                    </Badge>
                    <Button
                      size="sm"
                      disabled={c.status === "issued" || c.plate_number === "UNREADABLE"}
                      onClick={() => updateChallan(c.id, { status: "issued" })}
                    >
                      Issue
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={c.status === "disputed"}
                      onClick={() => updateChallan(c.id, { status: "disputed" })}
                    >
                      Dispute
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </ScrollArea>
      </section>
    </div>
  );
}
