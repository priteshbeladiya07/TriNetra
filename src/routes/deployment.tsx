import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Minus, Pencil, Plus, X } from "lucide-react";
import { runEngine } from "@/lib/trinetra/engine";
import { actions, useAppState } from "@/lib/trinetra/store";
import { OFFICERS } from "@/lib/trinetra/data";

export const Route = createFileRoute("/deployment")({
  head: () => ({
    meta: [
      { title: "Deployment Optimizer — TriNetra Nagpur" },
      {
        name: "description",
        content:
          "Constrained officer allocation across Nagpur junctions with accept, modify and reject controls for the duty commander.",
      },
      { property: "og:title", content: "Deployment Optimizer — TriNetra" },
      {
        property: "og:description",
        content: "Human-in-the-loop police deployment recommendations under a fixed officer pool.",
      },
    ],
  }),
  component: DeploymentPage,
});

function DeploymentPage() {
  const world = useAppState((s) => s.world);
  const decisions = useAppState((s) => s.decisions);
  const { allocations, metrics } = useMemo(() => runEngine(world), [world]);
  const [shift, setShift] = useState<"all" | "A (06-14)" | "B (14-22)" | "C (22-06)">("all");

  const roster = OFFICERS.filter((o) => shift === "all" || o.shift === shift);
  const moves = allocations.filter((a) => a.delta !== 0).slice(0, 10);

  return (
    <div className="space-y-5">
      <header className="animate-rise">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-primary">Operations Research</p>
        <h1 className="mt-1 text-3xl font-bold">Deployment Optimizer</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Greedy marginal-risk-reduction allocation of {world.totalOfficers} officers. Every card carries its reason —
          the commander accepts, modifies or rejects.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-4">
        <Stat label="Officers on roster" value={`${world.totalOfficers}`} />
        <Stat label="Allocated by optimizer" value={`${metrics.officersUsed}`} />
        <Stat label="High-risk coverage" value={`${metrics.coveragePct}%`} tone="text-risk-low" />
        <Stat label="Unmanned risk zones" value={`${metrics.unmanned}`} tone="text-risk-high" />
      </section>

      <label className="flex max-w-md items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Officer pool</span>
        <input
          type="range"
          min={24}
          max={120}
          value={world.totalOfficers}
          onChange={(e) => actions.setWorld({ totalOfficers: Number(e.target.value) })}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-surface-2 accent-primary"
        />
        <span className="w-8 text-right font-mono text-sm">{world.totalOfficers}</span>
      </label>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-3">
          <h2 className="font-display text-xl font-semibold">Recommended redeployments</h2>
          {moves.map((a, i) => {
            const decision = decisions[a.junctionId];
            return (
              <article
                key={a.junctionId}
                className="panel animate-rise p-4 transition-transform duration-300 hover:-translate-y-0.5"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="flex items-center gap-1 rounded-md px-2.5 py-1 font-mono text-sm font-bold"
                    style={{
                      background: a.delta > 0 ? "color-mix(in oklab, var(--risk-low) 20%, transparent)" : "color-mix(in oklab, var(--risk-med) 20%, transparent)",
                      color: a.delta > 0 ? "var(--risk-low)" : "var(--risk-med)",
                    }}
                  >
                    {a.delta > 0 ? <Plus className="size-3.5" /> : <Minus className="size-3.5" />}
                    {Math.abs(a.delta)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{a.name}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {a.present} on post → {a.recommended} recommended · priority {a.priority}
                    </p>
                  </div>
                  {decision && (
                    <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {decision}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{a.reason}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      actions.decide(a.junctionId, "accepted");
                      actions.setManualOfficers(a.junctionId, a.recommended);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
                  >
                    <Check className="size-3.5" /> Accept
                  </button>
                  <button
                    onClick={() => {
                      actions.decide(a.junctionId, "modified");
                      actions.setManualOfficers(a.junctionId, Math.max(0, a.present + Math.sign(a.delta)));
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary"
                  >
                    <Pencil className="size-3.5" /> Modify ±1
                  </button>
                  <button
                    onClick={() => actions.decide(a.junctionId, "rejected")}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-risk-high"
                  >
                    <X className="size-3.5" /> Reject
                  </button>
                </div>
              </article>
            );
          })}
          {moves.length === 0 && (
            <p className="panel p-6 text-sm text-muted-foreground">
              Current posting already matches the optimal plan for this window.
            </p>
          )}
        </div>

        <div className="panel flex max-h-[720px] flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
            <h2 className="font-display text-lg font-semibold">Officer Roster</h2>
            <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
              {(["all", "A (06-14)", "B (14-22)", "C (22-06)"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setShift(s)}
                  className={`rounded px-2 py-1 font-mono text-[10px] transition-colors ${
                    shift === s ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s === "all" ? "ALL" : s.charAt(0)}
                </button>
              ))}
            </div>
          </div>
          <ul className="divide-y divide-border overflow-y-auto">
            {roster.map((o) => (
              <li key={o.id} className="flex items-center gap-3 px-4 py-2.5">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{
                    background:
                      o.status === "deployed" ? "var(--risk-low)" : o.status === "available" ? "var(--primary)" : "var(--risk-med)",
                  }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{o.name}</span>
                  <span className="block font-mono text-[10px] text-muted-foreground">
                    {o.id} · {o.rank} · {o.shift}
                  </span>
                </span>
                <span className="w-16 text-right font-mono text-[11px] text-muted-foreground">{o.postId}</span>
                <span
                  className="w-10 text-right font-mono text-[11px]"
                  style={{ color: o.fatigue > 0.7 ? "var(--risk-high)" : "var(--muted-foreground)" }}
                  title="fatigue index"
                >
                  {o.fatigue.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, tone = "text-foreground" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="panel p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className={`mt-2 font-display text-3xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}
