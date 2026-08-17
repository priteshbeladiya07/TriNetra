import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Gauge,
  ShieldAlert,
  Users,
  Compass,
  Zap,
  Radio,
  Flame,
  CheckCircle2,
  TrendingUp,
  Cpu,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { RiskMap } from "@/components/trinetra/RiskMap";
import { runEngine } from "@/lib/trinetra/engine";
import { useAppState, actions } from "@/lib/trinetra/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TriNetra — Nagpur Traffic Risk & Deployment Command Center" },
      {
        name: "description",
        content:
          "Live AI risk heatmap of Nagpur junctions with explainable scores and police deployment recommendations.",
      },
      { property: "og:title", content: "TriNetra — Nagpur Traffic Command Center" },
      {
        property: "og:description",
        content: "Live AI risk heatmap and explainable police deployment decision support for Nagpur city.",
      },
    ],
  }),
  component: CommandCenter,
});

export default function CommandCenter() {
  const world = useAppState((s) => s.world);
  const incidents = useAppState((s) => s.incidents);
  const { results, metrics } = useMemo(() => runEngine(world), [world]);
  const [selected, setSelected] = useState<string | undefined>(results[0]?.junction.id);
  const active = results.find((r) => r.junction.id === selected) ?? results[0];

  const activeIncidents = incidents.filter((i) => i.status !== "cleared").length;

  const kpis = [
    {
      label: "Average City Risk",
      value: `${metrics.avgRisk}`,
      unit: "/100",
      sub: "Composite risk score",
      icon: Gauge,
      tone: "text-primary",
      bgGlow: "rgba(37, 99, 235, 0.12)",
      trend: "+1.8% vs last hr",
      badgeColor: "bg-primary/10 text-primary border-primary/25",
    },
    {
      label: "Critical Risk Zones",
      value: `${metrics.highCount}`,
      unit: "Junctions",
      sub: "Score ≥ 71 (Immediate action)",
      icon: ShieldAlert,
      tone: "text-red-600",
      bgGlow: "rgba(239, 68, 68, 0.12)",
      trend: "High pressure",
      badgeColor: "bg-red-500/10 text-red-600 border-red-500/30",
    },
    {
      label: "Force Readiness",
      value: `${metrics.officersUsed}`,
      unit: `/${world.totalOfficers}`,
      sub: "Active field units on duty",
      icon: Users,
      tone: "text-emerald-600",
      bgGlow: "rgba(16, 185, 129, 0.12)",
      trend: "100% roster ready",
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    },
    {
      label: "Active Incidents",
      value: `${activeIncidents}`,
      unit: "Alerts",
      sub: "Emergency dispatch queue",
      icon: AlertTriangle,
      tone: "text-amber-600",
      bgGlow: "rgba(245, 158, 11, 0.12)",
      trend: "Real-time feed",
      badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    },
  ];

  function handleQuickDeploy(junctionId: string) {
    actions.setWorld({
      manualOfficers: {
        ...world.manualOfficers,
        [junctionId]: (world.manualOfficers[junctionId] ?? 0) + 1,
      },
    });
  }

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TACTICAL COMMAND HEADER                                                */}
      {/* ========================================================================= */}
      <header className="relative flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-border/80 bg-surface/90 p-5 shadow-sm backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-primary font-bold">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <span>Nagpur Defense Sector · Grid Telemetry</span>
            <span className="text-muted-foreground/60">|</span>
            <span className="text-muted-foreground">21.1458° N, 79.0882° E</span>
          </div>

          <h1 className="mt-1.5 text-3xl font-extrabold sm:text-4xl">
            Nagpur City <span className="text-gradient">Operational Risk Grid</span>
          </h1>

          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Multi-source sensor fusion: live traffic volume, camera violations, accident histories, weather factors,
            and event crowds scored in real-time with explainable triage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-surface-2/80 px-3 py-2 font-mono text-xs shadow-sm">
            <Cpu className="size-4 text-primary animate-pulse" />
            <span className="text-muted-foreground">AI FUSION:</span>
            <span className="font-bold text-foreground">ONLINE (60 FPS)</span>
          </div>

          <Link
            to="/deployment"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/35"
          >
            <Zap className="size-4" />
            Deploy Police Force
          </Link>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO CYBER KPI CARDS                                                   */}
      {/* ========================================================================= */}
      <section className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <div
            key={k.label}
            className="hud-corner group relative overflow-hidden rounded-2xl border border-border/80 bg-surface/95 p-4.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/40"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">
                {k.label}
              </span>
              <div
                className="flex size-8 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                style={{ background: k.bgGlow }}
              >
                <k.icon className={`size-4.5 ${k.tone}`} />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="font-display text-4xl font-extrabold tracking-tight text-foreground">
                {k.value}
              </span>
              <span className="font-mono text-xs font-semibold text-muted-foreground">
                {k.unit}
              </span>
            </div>

            <div className="mt-2.5 flex items-center justify-between border-t border-border/60 pt-2 font-mono text-[11px]">
              <span className="text-muted-foreground">{k.sub}</span>
              <span className={`rounded px-1.5 py-0.5 font-bold border text-[10px] ${k.badgeColor}`}>
                {k.trend}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* ========================================================================= */}
      {/* 3. MAIN COCKPIT: GOOGLE MAPS HEATMAP + ACT HERE FIRST TRIAGE              */}
      {/* ========================================================================= */}
      <section className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        {/* Left: Google Maps Live Heatmap HUD Panel */}
        <div className="relative flex h-[580px] flex-col overflow-hidden rounded-2xl border border-border/90 bg-surface shadow-sm">
          {/* Panel Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 bg-surface-2/60 px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                <Flame className="size-4 animate-pulse" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-foreground">
                  Live Risk Heatmap Cockpit
                </h2>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  28 Monitored Junctions · Real-Time Gaussian Overlay
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px] rounded-lg border border-border/70 bg-surface px-3 py-1.5 shadow-xs">
              <Legend color="#10b981" label="0–40 Safe" />
              <Legend color="#f59e0b" label="41–70 Warning" />
              <Legend color="#ef4444" label="71–100 Critical" />
            </div>
          </div>

          {/* Map Container */}
          <div className="flex-1 w-full relative min-h-0">
            <RiskMap results={results} selectedId={selected} onSelect={setSelected} />
          </div>
        </div>

        {/* Right: Act Here First Ranked Triage List */}
        <div className="flex h-[580px] flex-col overflow-hidden rounded-2xl border border-border/90 bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-border/80 bg-surface-2/60 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-red-500 animate-ping" />
              <div>
                <h2 className="font-display text-base font-bold text-foreground">Act Here First</h2>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Prioritized by Risk × (1 − Coverage)
                </p>
              </div>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-primary">
              TOP 12 QUEUE
            </span>
          </div>

          <ol className="flex-1 divide-y divide-border/60 overflow-y-auto p-2 space-y-1">
            {results.slice(0, 12).map((r, i) => {
              const isSelected = selected === r.junction.id;
              const isCritical = r.band === "high";

              return (
                <li key={r.junction.id}>
                  <button
                    onClick={() => setSelected(r.junction.id)}
                    className={`group relative flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-200 ${
                      isSelected
                        ? "bg-primary/10 border border-primary/30 shadow-sm"
                        : "hover:bg-surface-2/80 border border-transparent"
                    }`}
                  >
                    {/* Rank Badge */}
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                        i === 0
                          ? "bg-red-500 text-white shadow-sm shadow-red-500/40"
                          : i < 3
                          ? "bg-amber-500/20 text-amber-600 font-bold"
                          : "bg-surface-2 text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </span>

                    {/* Junction Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {r.junction.name}
                        </span>
                        {isCritical && (
                          <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                        <span>{r.junction.zone}</span>
                        <span>·</span>
                        <span className="font-medium text-foreground/80">
                          {r.officersPresent}/{r.officersRecommended} Officers
                        </span>
                        {r.activeEvent && (
                          <>
                            <span>·</span>
                            <span className="truncate text-amber-600 font-semibold max-w-[100px]">
                              {r.activeEvent}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Score Tag */}
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className="rounded-lg px-2.5 py-1 font-mono text-xs font-bold shadow-xs"
                        style={{
                          background:
                            r.band === "high"
                              ? "rgba(239, 68, 68, 0.15)"
                              : r.band === "medium"
                              ? "rgba(245, 158, 11, 0.15)"
                              : "rgba(16, 185, 129, 0.15)",
                          color:
                            r.band === "high"
                              ? "#dc2626"
                              : r.band === "medium"
                              ? "#d97706"
                              : "#059669",
                          border: `1px solid ${
                            r.band === "high"
                              ? "rgba(239, 68, 68, 0.3)"
                              : r.band === "medium"
                              ? "rgba(245, 158, 11, 0.3)"
                              : "rgba(16, 185, 129, 0.3)"
                          }`,
                        }}
                      >
                        {r.score}
                      </span>

                      {/* Quick +1 Officer Button */}
                      {r.officersPresent < r.officersRecommended && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickDeploy(r.junction.id);
                          }}
                          title="Deploy +1 Officer"
                          className="font-mono text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                        >
                          + Deploy 1
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. AI EXPLAINABILITY & NEURAL FACTOR BREAKDOWN                            */}
      {/* ========================================================================= */}
      {active && (
        <section className="grid gap-5 lg:grid-cols-[1.1fr_1.3fr]">
          {/* Explainability Summary Card */}
          <div className="hud-corner relative flex flex-col justify-between rounded-2xl border border-border/90 bg-surface/95 p-5 shadow-sm backdrop-blur-sm">
            <div>
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary font-bold">
                  AI Explainability Layer
                </p>
                <span className="rounded-full bg-surface-2 px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground font-semibold">
                  NODE: {active.junction.id}
                </span>
              </div>

              <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
                {active.junction.name}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground bg-surface-2/60 p-3.5 rounded-xl border border-border/70">
                {active.explanation}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 font-mono text-[11px]">
                <Chip>{active.junction.roadType.toUpperCase()}</Chip>
                <Chip>{active.junction.laneCount} LANES</Chip>
                <Chip>{active.junction.hasSignal ? "SIGNALLED" : "UNSIGNALLED"}</Chip>
                {active.junction.nearSchool && <Chip>SCHOOL ZONE</Chip>}
                {active.junction.nearHospital && <Chip>HOSPITAL ACCESS</Chip>}
                {active.activeEvent && <Chip>{active.activeEvent.toUpperCase()}</Chip>}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 pt-4 border-t border-border/60">
              <Link
                to="/deployment"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-transform duration-200 hover:-translate-y-0.5"
              >
                Open Full Deployment Plan <ArrowUpRight className="size-4" />
              </Link>

              <button
                onClick={() => handleQuickDeploy(active.junction.id)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-surface-2 px-3.5 py-2.5 text-sm font-medium text-foreground hover:bg-surface transition-colors"
              >
                <Users className="size-4 text-primary" /> +1 Officer
              </button>
            </div>
          </div>

          {/* Factor Contribution Graph */}
          <div className="rounded-2xl border border-border/90 bg-surface/95 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-bold">
                Neural Risk Factor Decomposition
              </p>
              <span className="font-mono text-xs font-bold text-foreground">
                Total: {active.score} / 100
              </span>
            </div>

            <div className="mt-4 space-y-3.5">
              {(
                [
                  ["Traffic Congestion", active.factors.congestion, 30, "#3b82f6"],
                  ["Accident Probability", active.factors.accident, 25, "#ef4444"],
                  ["Violation Density", active.factors.violation, 15, "#f59e0b"],
                  ["Weather Penalty", active.factors.weather, 10, "#06b6d4"],
                  ["Event / Crowd Pressure", active.factors.event, 10, "#8b5cf6"],
                  ["Road & Structural Hazard", active.factors.structural, 10, "#64748b"],
                ] as const
              ).map(([label, val, max, barColor]) => (
                <div key={label}>
                  <div className="flex justify-between font-mono text-[11px] mb-1">
                    <span className="text-muted-foreground font-medium">{label}</span>
                    <span className="font-bold text-foreground">
                      +{val.toFixed(1)}{" "}
                      <span className="text-muted-foreground font-normal">/ {max} pts</span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2 border border-border/60">
                    <div
                      className="h-full rounded-full transition-all duration-700 shadow-xs"
                      style={{
                        width: `${Math.min(100, (val / max) * 100)}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. LIVE REAL-TIME TELEMETRY STREAM TICKER                                 */}
      {/* ========================================================================= */}
      <section className="overflow-hidden rounded-2xl border border-border/80 bg-surface/90 shadow-sm">
        <div className="flex items-center border-b border-border/60 bg-surface-2/60 px-4 py-1.5 font-mono text-[10px] text-muted-foreground">
          <span className="flex size-1.5 rounded-full bg-primary animate-ping mr-2" />
          <span className="font-bold text-foreground uppercase tracking-wider">Live Node Stream:</span>
          <span className="ml-2">28 Monitored Intersections Active</span>
        </div>
        <div className="flex whitespace-nowrap py-2.5">
          <div className="ticker-track flex gap-8 pr-8 font-mono text-xs text-muted-foreground">
            {[...results, ...results].map((r, i) => (
              <span
                key={i}
                onClick={() => setSelected(r.junction.id)}
                className="cursor-pointer hover:text-foreground transition-colors inline-flex items-center gap-1.5"
              >
                <span className="font-bold text-primary">{r.junction.id}</span>
                <span className="font-medium text-foreground">{r.junction.name}</span>
                <span>·</span>
                <span
                  className="font-bold"
                  style={{
                    color:
                      r.band === "high"
                        ? "#dc2626"
                        : r.band === "medium"
                        ? "#d97706"
                        : "#059669",
                  }}
                >
                  RISK {r.score}
                </span>
                <span>·</span>
                <span>CONG {(r.congestionIndex * 100).toFixed(0)}%</span>
                <span>·</span>
                <span>VIOL {r.violationsPerHour}/HR</span>
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
      <span className="size-2.5 rounded-full shadow-xs" style={{ background: color }} />
      {label}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg border border-border/80 bg-surface-2 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground shadow-2xs">
      {children}
    </span>
  );
}
