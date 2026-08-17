import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Radio, Siren } from "lucide-react";
import { runEngine } from "@/lib/trinetra/engine";
import { actions, useAppState } from "@/lib/trinetra/store";
import { JUNCTIONS, type Incident } from "@/lib/trinetra/data";
import { RiskMap } from "@/components/trinetra/RiskMap";

export const Route = createFileRoute("/incidents")({
  head: () => ({
    meta: [
      { title: "Incident Response — TriNetra Nagpur" },
      {
        name: "description",
        content:
          "Report incidents across Nagpur junctions and watch the risk engine re-optimise officer deployment instantly.",
      },
      { property: "og:title", content: "Incident Response — TriNetra" },
      {
        property: "og:description",
        content: "Live incident feed with instant risk re-optimisation for Nagpur traffic police.",
      },
    ],
  }),
  component: IncidentsPage,
});

const TYPES: Incident["type"][] = ["Accident", "Breakdown", "Waterlogging", "Signal Failure", "Crowd Surge"];
const SEVERITY: Incident["severity"][] = ["minor", "major", "critical"];
const PRESSURE: Record<Incident["severity"], number> = { minor: 0.25, major: 0.55, critical: 0.9 };

function IncidentsPage() {
  const world = useAppState((s) => s.world);
  const incidents = useAppState((s) => s.incidents);
  const { results } = useMemo(() => runEngine(world), [world]);

  const [junctionId, setJunctionId] = useState(JUNCTIONS[0]!.id);
  const [type, setType] = useState<Incident["type"]>("Accident");
  const [severity, setSeverity] = useState<Incident["severity"]>("major");
  const [note, setNote] = useState("");

  const affected = results.filter((r) => (world.incidentPressure[r.junction.id] ?? 0) > 0);

  function report() {
    const now = new Date();
    actions.addIncident(
      {
        id: `INC-${Math.floor(4500 + Math.random() * 400)}`,
        junctionId,
        type,
        severity,
        reportedAt: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
        status: "open",
        note: note || `${type} reported by field unit.`,
      },
      PRESSURE[severity],
    );
    setNote("");
  }

  return (
    <div className="space-y-5">
      <header className="animate-rise">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-risk-high">Response Desk</p>
        <h1 className="mt-1 text-3xl font-bold">Incident Command</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Every reported incident injects risk pressure at its junction and triggers instant re-optimisation of the
          deployment plan.
        </p>
      </header>

      <section className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <Siren className="size-4 text-risk-high animate-blink" />
            <h2 className="font-display text-lg font-semibold">Report incident</h2>
          </div>
          <div className="mt-4 space-y-3">
            <Field label="Junction">
              <select
                value={junctionId}
                onChange={(e) => setJunctionId(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:shadow-[var(--shadow-glow)]"
              >
                {JUNCTIONS.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Type">
              <div className="flex flex-wrap gap-1.5">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                      type === t ? "border-primary bg-surface-2 text-primary" : "border-border text-muted-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Severity">
              <div className="flex gap-1.5">
                {SEVERITY.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSeverity(s)}
                    className={`flex-1 rounded-md border px-2.5 py-1.5 text-xs capitalize transition-colors ${
                      severity === s ? "border-risk-high bg-surface-2 text-risk-high" : "border-border text-muted-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Field note">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="e.g. Two-wheeler collision, right lane blocked"
                className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:shadow-[var(--shadow-glow)]"
              />
            </Field>
            <button
              onClick={report}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Inject incident & re-optimise
            </button>
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-display text-lg font-semibold">Affected grid</h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {affected.length} junctions under incident pressure
            </p>
          </div>
          <div className="h-[420px]">
            <RiskMap results={results} selectedId={junctionId} onSelect={setJunctionId} showRoutes={false} />
          </div>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Radio className="size-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">Live incident feed</h2>
        </div>
        <ul className="divide-y divide-border">
          {incidents.map((inc, i) => {
            const j = JUNCTIONS.find((x) => x.id === inc.junctionId);
            return (
              <li
                key={inc.id}
                className="animate-rise flex flex-wrap items-center gap-3 px-4 py-3"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span
                  className="rounded px-2 py-1 font-mono text-[10px] uppercase tracking-wider"
                  style={{
                    background:
                      inc.severity === "critical"
                        ? "color-mix(in oklab, var(--risk-high) 22%, transparent)"
                        : inc.severity === "major"
                          ? "color-mix(in oklab, var(--risk-med) 22%, transparent)"
                          : "color-mix(in oklab, var(--risk-low) 20%, transparent)",
                    color:
                      inc.severity === "critical"
                        ? "var(--risk-high)"
                        : inc.severity === "major"
                          ? "var(--risk-med)"
                          : "var(--risk-low)",
                  }}
                >
                  {inc.severity}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">
                    {inc.type} · {j?.name ?? inc.junctionId}
                  </span>
                  <span className="block text-xs text-muted-foreground">{inc.note}</span>
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {inc.id} · {inc.reportedAt}
                </span>
                {inc.status === "cleared" ? (
                  <span className="font-mono text-[11px] text-risk-low">cleared</span>
                ) : (
                  <button
                    onClick={() => actions.clearIncident(inc.id)}
                    className="rounded-md border border-border px-3 py-1.5 text-xs transition-colors hover:border-primary hover:text-primary"
                  >
                    Mark cleared
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
