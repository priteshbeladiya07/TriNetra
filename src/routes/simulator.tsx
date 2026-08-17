import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { runEngine, hourLabel, type WorldState } from "@/lib/trinetra/engine";
import { useAppState } from "@/lib/trinetra/store";
import { JUNCTIONS, type WeatherCondition } from "@/lib/trinetra/data";
import { RiskMap } from "@/components/trinetra/RiskMap";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { title: "Digital Twin Simulator — TriNetra Nagpur" },
      {
        name: "description",
        content:
          "Rehearse redeployment decisions on a digital twin of Nagpur's junctions before committing officers on ground.",
      },
      { property: "og:title", content: "Digital Twin Simulator — TriNetra" },
      {
        property: "og:description",
        content: "What-if rehearsal of weather, events and officer moves against Nagpur's live risk grid.",
      },
    ],
  }),
  component: SimulatorPage,
});

const WEATHERS: WeatherCondition[] = ["clear", "light-rain", "heavy-rain", "fog"];

function SimulatorPage() {
  const live = useAppState((s) => s.world);
  const [draft, setDraft] = useState<WorldState>(live);
  const [moveFrom, setMoveFrom] = useState(JUNCTIONS[0]!.id);
  const [moveTo, setMoveTo] = useState(JUNCTIONS[3]!.id);

  const before = useMemo(() => runEngine(live), [live]);
  const after = useMemo(() => runEngine(draft), [draft]);

  function moveOfficers(n: number) {
    setDraft((d) => {
      const baseFrom = before.results.find((r) => r.junction.id === moveFrom)?.officersPresent ?? 0;
      const baseTo = before.results.find((r) => r.junction.id === moveTo)?.officersPresent ?? 0;
      return {
        ...d,
        manualOfficers: {
          ...d.manualOfficers,
          [moveFrom]: Math.max(0, (d.manualOfficers[moveFrom] ?? baseFrom) - n),
          [moveTo]: (d.manualOfficers[moveTo] ?? baseTo) + n,
        },
      };
    });
  }

  const deltaCoverage = after.metrics.coveragePct - before.metrics.coveragePct;
  const deltaRisk = after.metrics.avgRisk - before.metrics.avgRisk;

  return (
    <div className="space-y-5">
      <header className="animate-rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-signal">Decision Rehearsal</p>
          <h1 className="mt-1 text-3xl font-bold">Nagpur Digital Twin</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Edit the hypothetical world state — the same risk engine and optimiser re-run instantly, without touching the
            live board.
          </p>
        </div>
        <button
          onClick={() => setDraft(live)}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm transition-colors hover:border-primary"
        >
          <RotateCcw className="size-4" /> Reset to live
        </button>
      </header>

      <section className="panel grid gap-4 p-5 lg:grid-cols-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Hypothetical time</p>
          <input
            type="range"
            min={0}
            max={23}
            value={draft.hour}
            onChange={(e) => setDraft((d) => ({ ...d, hour: Number(e.target.value) }))}
            className="mt-3 h-1 w-full cursor-pointer appearance-none rounded-full bg-surface-2 accent-primary"
          />
          <p className="mt-2 font-mono text-sm">{hourLabel(draft.hour)}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Weather scenario</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {WEATHERS.map((w) => (
              <button
                key={w}
                onClick={() => setDraft((d) => ({ ...d, weather: w }))}
                className={`rounded-md border px-2.5 py-1.5 text-xs capitalize transition-colors ${
                  draft.weather === w ? "border-primary bg-surface-2 text-primary" : "border-border text-muted-foreground"
                }`}
              >
                {w.replace("-", " ")}
              </button>
            ))}
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={draft.eventsEnabled}
              onChange={(e) => setDraft((d) => ({ ...d, eventsEnabled: e.target.checked }))}
              className="accent-primary"
            />
            City events active (festivals, matches, rallies)
          </label>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Officer move</p>
          <div className="mt-3 flex items-center gap-2">
            <select
              value={moveFrom}
              onChange={(e) => setMoveFrom(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-2 py-2 text-xs"
            >
              {JUNCTIONS.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name}
                </option>
              ))}
            </select>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            <select
              value={moveTo}
              onChange={(e) => setMoveTo(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-2 py-2 text-xs"
            >
              {JUNCTIONS.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2 flex gap-2">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => moveOfficers(n)}
                className="flex-1 rounded-md bg-primary/90 py-1.5 text-xs font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Move {n}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Delta label="High-risk coverage" before={`${before.metrics.coveragePct}%`} after={`${after.metrics.coveragePct}%`} delta={deltaCoverage} good="up" />
        <Delta label="Average city risk" before={`${before.metrics.avgRisk}`} after={`${after.metrics.avgRisk}`} delta={deltaRisk} good="down" />
        <Delta
          label="High-risk zones"
          before={`${before.metrics.highCount}`}
          after={`${after.metrics.highCount}`}
          delta={after.metrics.highCount - before.metrics.highCount}
          good="down"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <TwinPanel title="Current plan" caption="Live state" results={before.results} />
        <TwinPanel title="Simulated plan" caption="Hypothetical state" results={after.results} accent />
      </section>

      <section className="panel p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-signal" />
          <h2 className="font-display text-lg font-semibold">Commander briefing</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Under this scenario ({hourLabel(draft.hour)}, {draft.weather.replace("-", " ")}
          {draft.eventsEnabled ? ", events active" : ", no events"}), high-risk coverage moves from{" "}
          <span className="text-foreground">{before.metrics.coveragePct}%</span> to{" "}
          <span className="text-foreground">{after.metrics.coveragePct}%</span> and average city risk shifts by{" "}
          <span className="text-foreground">
            {deltaRisk > 0 ? "+" : ""}
            {deltaRisk}
          </span>{" "}
          points. Top pressure point:{" "}
          <span className="text-foreground">{after.results[0]?.junction.name}</span> at{" "}
          {after.results[0]?.score}/100.
        </p>
      </section>
    </div>
  );
}

function Delta({
  label,
  before,
  after,
  delta,
  good,
}: {
  label: string;
  before: string;
  after: string;
  delta: number;
  good: "up" | "down";
}) {
  const positive = good === "up" ? delta >= 0 : delta <= 0;
  return (
    <div className="panel p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-lg text-muted-foreground line-through">{before}</span>
        <ArrowRight className="size-4 text-muted-foreground" />
        <span className="font-display text-3xl font-bold">{after}</span>
        <span
          className="font-mono text-xs"
          style={{ color: positive ? "var(--risk-low)" : "var(--risk-high)" }}
        >
          {delta > 0 ? "+" : ""}
          {delta}
        </span>
      </div>
    </div>
  );
}

function TwinPanel({
  title,
  caption,
  results,
  accent = false,
}: {
  title: string;
  caption: string;
  results: ReturnType<typeof runEngine>["results"];
  accent?: boolean;
}) {
  return (
    <div className={`panel overflow-hidden ${accent ? "shadow-[var(--shadow-glow)]" : ""}`}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{caption}</span>
      </div>
      <div className="h-[360px]">
        <RiskMap results={results} showRoutes={false} />
      </div>
      <ul className="divide-y divide-border">
        {results.slice(0, 4).map((r) => (
          <li key={r.junction.id} className="flex items-center justify-between px-4 py-2 text-sm">
            <span className="truncate">{r.junction.name}</span>
            <span className="font-mono text-xs text-muted-foreground">
              {r.officersPresent}/{r.officersRecommended} · {r.score}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
