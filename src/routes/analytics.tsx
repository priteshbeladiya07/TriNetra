import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { demandCurve, runEngine, hourLabel } from "@/lib/trinetra/engine";
import { useAppState } from "@/lib/trinetra/store";
import { VIOLATION_TYPES } from "@/lib/trinetra/data";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics & Audit — TriNetra Nagpur" },
      {
        name: "description",
        content:
          "Hourly risk trends, violation mix, zone comparison and operator decision audit for Nagpur traffic operations.",
      },
      { property: "og:title", content: "Analytics & Audit — TriNetra" },
      {
        property: "og:description",
        content: "Risk trends, violation mix and operator decision audit for Nagpur traffic policing.",
      },
    ],
  }),
  component: AnalyticsPage,
});

const AXIS = { stroke: "oklch(0.68 0.022 245)", fontSize: 11 };

function AnalyticsPage() {
  const world = useAppState((s) => s.world);
  const decisions = useAppState((s) => s.decisions);
  const { results } = useMemo(() => runEngine(world), [world]);

  const hourly = useMemo(
    () =>
      Array.from({ length: 24 }, (_, h) => {
        const d = demandCurve(h);
        return {
          hour: `${String(h).padStart(2, "0")}`,
          risk: Math.round(28 + d * 58),
          accidents: Number((d * 3.4).toFixed(1)),
          violations: Math.round(40 + d * 260),
        };
      }),
    [],
  );

  const zones = useMemo(() => {
    const map = new Map<string, { zone: string; total: number; n: number }>();
    for (const r of results) {
      const e = map.get(r.junction.zone) ?? { zone: r.junction.zone, total: 0, n: 0 };
      e.total += r.score;
      e.n += 1;
      map.set(r.junction.zone, e);
    }
    return [...map.values()]
      .map((e) => ({ zone: e.zone, risk: Math.round(e.total / e.n) }))
      .sort((a, b) => b.risk - a.risk);
  }, [results]);

  const violations = VIOLATION_TYPES.map((t, i) => ({
    name: t,
    value: [32, 24, 14, 12, 10, 8][i] ?? 5,
  }));
  const PIE_COLORS = ["var(--risk-high)", "var(--risk-med)", "var(--signal)", "var(--primary)", "var(--risk-low)", "oklch(0.6 0.02 250)"];

  const top = results[0];
  const radar = top
    ? [
        { factor: "Congestion", v: Math.round(top.raw.congestion * 100) },
        { factor: "Accident", v: Math.round(top.raw.accident * 100) },
        { factor: "Violation", v: Math.round(top.raw.violation * 100) },
        { factor: "Weather", v: Math.round(top.raw.weather * 100) },
        { factor: "Event", v: Math.round(top.raw.event * 100) },
        { factor: "Structural", v: Math.round(top.raw.structural * 100) },
      ]
    : [];

  const decisionList = Object.entries(decisions);

  return (
    <div className="space-y-5">
      <header className="animate-rise">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-primary">Command Analytics</p>
        <h1 className="mt-1 text-3xl font-bold">Trends & Audit</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          City-wide patterns behind the live board — and a log of every operator override, closing the feedback loop.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="24-hour risk & violation curve" caption={`current window ${hourLabel(world.hour)}`}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={hourly} margin={{ left: -18, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="gRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--risk-high)" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="var(--risk-high)" stopOpacity={0.04} />
                </linearGradient>
                <linearGradient id="gViol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--grid)" vertical={false} />
              <XAxis dataKey="hour" {...AXIS} tickLine={false} />
              <YAxis {...AXIS} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="risk" stroke="var(--risk-high)" fill="url(#gRisk)" strokeWidth={2} />
              <Area type="monotone" dataKey="violations" stroke="var(--primary)" fill="url(#gViol)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Violation mix" caption="share of e-challans">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={violations} dataKey="value" nameKey="name" innerRadius={52} outerRadius={90} paddingAngle={3}>
                {violations.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]!} stroke="var(--surface)" />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Zone risk comparison" caption="mean composite score">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={zones} margin={{ left: -18, right: 8 }}>
              <CartesianGrid stroke="var(--grid)" vertical={false} />
              <XAxis dataKey="zone" {...AXIS} interval={0} angle={-30} textAnchor="end" height={70} tickLine={false} />
              <YAxis {...AXIS} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "oklch(1 0 0 / 4%)" }}
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="risk" radius={[4, 4, 0, 0]}>
                {zones.map((z, i) => (
                  <Cell
                    key={i}
                    fill={z.risk >= 71 ? "var(--risk-high)" : z.risk >= 41 ? "var(--risk-med)" : "var(--risk-low)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title={`Factor profile — ${top?.junction.name ?? ""}`} caption="normalized 0–100">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radar} outerRadius={95}>
              <PolarGrid stroke="var(--grid)" />
              <PolarAngleAxis dataKey="factor" tick={{ fill: "oklch(0.68 0.022 245)", fontSize: 11 }} />
              <Radar dataKey="v" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.28} />
            </RadarChart>
          </ResponsiveContainer>
        </Panel>
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-lg font-semibold">Operator decision audit</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Accept / modify / reject actions are logged and fed back for model calibration.
        </p>
        <ul className="mt-4 divide-y divide-border">
          {decisionList.map(([id, d]) => {
            const r = results.find((x) => x.junction.id === id);
            return (
              <li key={id} className="flex items-center justify-between py-2.5 text-sm">
                <span>{r?.junction.name ?? id}</span>
                <span
                  className="rounded px-2 py-1 font-mono text-[10px] uppercase tracking-wider"
                  style={{
                    color: d === "accepted" ? "var(--risk-low)" : d === "rejected" ? "var(--risk-high)" : "var(--risk-med)",
                    background: "var(--surface-2)",
                  }}
                >
                  {d}
                </span>
              </li>
            );
          })}
          {decisionList.length === 0 && (
            <li className="py-3 text-sm text-muted-foreground">
              No overrides yet — act on a recommendation in the Deployment console.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

function Panel({ title, caption, children }: { title: string; caption: string; children: React.ReactNode }) {
  return (
    <div className="panel animate-rise p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{caption}</span>
      </div>
      {children}
    </div>
  );
}
