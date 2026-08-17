import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { runEngine } from "@/lib/trinetra/engine";
import { useAppState } from "@/lib/trinetra/store";

export const Route = createFileRoute("/risk")({
  head: () => ({
    meta: [
      { title: "Risk Intelligence — TriNetra Nagpur" },
      {
        name: "description",
        content:
          "Per-junction composite risk scores for Nagpur with weighted factor decomposition and hidden-danger detection.",
      },
      { property: "og:title", content: "Risk Intelligence — TriNetra" },
      {
        property: "og:description",
        content: "Weighted factor decomposition of Nagpur junction risk scores with hidden danger detection.",
      },
    ],
  }),
  component: RiskPage,
});

type SortKey = "score" | "priority" | "congestion" | "accident";

function RiskPage() {
  const world = useAppState((s) => s.world);
  const { results } = useMemo(() => runEngine(world), [world]);
  const [sort, setSort] = useState<SortKey>("score");
  const [query, setQuery] = useState("");
  const [band, setBand] = useState<"all" | "high" | "medium" | "low">("all");

  const rows = useMemo(() => {
    return results
      .filter((r) => (band === "all" ? true : r.band === band))
      .filter((r) => r.junction.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        if (sort === "score") return b.score - a.score;
        if (sort === "priority") return b.priority - a.priority;
        if (sort === "congestion") return b.raw.congestion - a.raw.congestion;
        return b.raw.accident - a.raw.accident;
      });
  }, [results, sort, query, band]);

  const hidden = results
    .filter((r) => r.junction.historicAccidents < 30 && r.raw.violation > 0.55)
    .slice(0, 4);

  return (
    <div className="space-y-5">
      <header className="animate-rise">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-primary">Model Outputs</p>
        <h1 className="mt-1 text-3xl font-bold">Risk Intelligence</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Composite score = 0.30 congestion + 0.25 accident probability + 0.15 violations + 0.10 weather + 0.10 event +
          0.10 structural.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search junction…"
          className="w-56 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-shadow focus:shadow-[var(--shadow-glow)]"
        />
        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
          {(["all", "high", "medium", "low"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBand(b)}
              className={`rounded px-3 py-1 font-mono text-[11px] uppercase transition-colors ${
                band === b ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
          {(["score", "priority", "congestion", "accident"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`rounded px-3 py-1 font-mono text-[11px] capitalize transition-colors ${
                sort === s ? "bg-surface-2 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="bg-surface-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Junction</th>
                <th className="px-4 py-3 text-left">Zone</th>
                <th className="px-4 py-3 text-left">Factor mix</th>
                <th className="px-3 py-3 text-right">Cong.</th>
                <th className="px-3 py-3 text-right">Acc.</th>
                <th className="px-3 py-3 text-right">Viol/hr</th>
                <th className="px-3 py-3 text-right">Cover</th>
                <th className="px-3 py-3 text-right">Priority</th>
                <th className="px-4 py-3 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.junction.id} className="transition-colors hover:bg-surface-2/60">
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.junction.name}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{r.junction.id}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.junction.zone}</td>
                  <td className="px-4 py-3">
                    <div className="flex h-2 w-40 overflow-hidden rounded-full bg-surface-2">
                      {(
                        [
                          [r.factors.congestion, "var(--risk-high)"],
                          [r.factors.accident, "var(--risk-med)"],
                          [r.factors.violation, "var(--signal)"],
                          [r.factors.weather, "var(--primary)"],
                          [r.factors.event, "var(--risk-low)"],
                          [r.factors.structural, "oklch(0.6 0.02 250)"],
                        ] as const
                      ).map(([v, c], i) => (
                        <span key={i} style={{ width: `${v}%`, background: c }} />
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right font-mono">{(r.raw.congestion * 100).toFixed(0)}%</td>
                  <td className="px-3 py-3 text-right font-mono">{(r.raw.accident * 100).toFixed(0)}%</td>
                  <td className="px-3 py-3 text-right font-mono">{r.violationsPerHour}</td>
                  <td className="px-3 py-3 text-right font-mono">
                    {r.officersPresent}/{r.officersRecommended}
                  </td>
                  <td className="px-3 py-3 text-right font-mono">{r.priority}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className="inline-block rounded px-2 py-1 font-mono text-xs font-bold"
                      style={{
                        background: `color-mix(in oklab, var(--risk-${r.band === "high" ? "high" : r.band === "medium" ? "med" : "low"}) 20%, transparent)`,
                        color: `var(--risk-${r.band === "high" ? "high" : r.band === "medium" ? "med" : "low"})`,
                      }}
                    >
                      {r.score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-signal">Hidden Danger Detector</p>
        <h2 className="mt-1 font-display text-xl font-semibold">Looks safe on raw counts — isn't</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Low reported accident history but abnormally high violation pressure: likely under-reported zones.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {hidden.map((r, i) => (
            <div
              key={r.junction.id}
              className="animate-rise rounded-lg border border-border bg-surface-2 p-4"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <p className="font-medium">{r.junction.name}</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {r.junction.historicAccidents} reported accidents · {r.violationsPerHour} violations/hr
              </p>
              <p className="mt-2 font-mono text-2xl text-signal">{r.score}</p>
            </div>
          ))}
          {hidden.length === 0 && (
            <p className="text-sm text-muted-foreground">No under-reported anomalies in the current window.</p>
          )}
        </div>
      </section>
    </div>
  );
}
