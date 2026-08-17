// TriNetra — pure risk + deployment engine.
// Same function powers the live board and the what-if digital twin.

import { EVENTS, JUNCTIONS, OFFICERS, type Junction, type WeatherCondition } from "./data";

export interface WorldState {
  hour: number; // 0..23
  weather: WeatherCondition;
  eventsEnabled: boolean;
  totalOfficers: number;
  /** junctionId -> extra risk pressure injected by an incident (0..1) */
  incidentPressure: Record<string, number>;
  /** junctionId -> manual officer override */
  manualOfficers: Record<string, number>;
}

export const DEFAULT_STATE: WorldState = {
  hour: 18,
  weather: "light-rain",
  eventsEnabled: true,
  totalOfficers: 72,
  incidentPressure: { J18: 0.9, J05: 0.55, J13: 0.5, J03: 0.25 },
  manualOfficers: {},
};

export interface FactorBreakdown {
  congestion: number;
  accident: number;
  violation: number;
  weather: number;
  event: number;
  structural: number;
}

export interface RiskResult {
  junction: Junction;
  score: number;
  band: "low" | "medium" | "high";
  factors: FactorBreakdown; // weighted contributions (points out of 100)
  raw: FactorBreakdown; // 0..1 normalized inputs
  congestionIndex: number;
  violationsPerHour: number;
  officersPresent: number;
  officersRecommended: number;
  coverage: number; // 0..1
  priority: number;
  activeEvent?: string;
  explanation: string;
}

const WEIGHTS: FactorBreakdown = {
  congestion: 30,
  accident: 25,
  violation: 15,
  weather: 10,
  event: 10,
  structural: 10,
};

const WEATHER_IMPACT: Record<WeatherCondition, number> = {
  clear: 0,
  "light-rain": 0.4,
  "heavy-rain": 1,
  fog: 0.85,
};

/** deterministic pseudo-noise so the board is stable per (junction, hour) */
function noise(seed: string, hour: number) {
  let h = hour * 2654435761;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return ((h % 1000) / 1000) * 0.2 - 0.1;
}

/** two-peak daily demand curve */
export function demandCurve(hour: number) {
  const morning = Math.exp(-Math.pow(hour - 10, 2) / 5.5);
  const evening = Math.exp(-Math.pow(hour - 19, 2) / 6.5);
  const base = hour >= 1 && hour <= 5 ? 0.06 : 0.32;
  return Math.min(1, base + 0.72 * morning + 0.95 * evening);
}

function structuralRisk(j: Junction) {
  let s = 0;
  s += j.roadType === "arterial" ? 0.4 : j.roadType === "collector" ? 0.25 : 0.12;
  s += j.hasSignal ? 0 : 0.22;
  s += (1 - j.lighting) * 0.2;
  s += j.nearSchool ? 0.08 : 0;
  s += j.nearHospital ? 0.06 : 0;
  s += j.nearMarket ? 0.08 : 0;
  return Math.min(1, s);
}

export function scoreJunction(j: Junction, state: WorldState): RiskResult {
  const n = noise(j.id, state.hour);
  const demand = demandCurve(state.hour);
  const capacity = j.laneCount * 900;
  const flow = j.baseFlow * demand * (1 + n);
  const weatherRaw = WEATHER_IMPACT[state.weather];

  const activeEvent = state.eventsEnabled
    ? EVENTS.find(
        (e) => e.junctionId === j.id && state.hour >= e.window[0] && state.hour <= e.window[1],
      )
    : undefined;
  const eventRaw = activeEvent ? Math.min(1, 0.35 + activeEvent.crowd / 45000) : 0;

  const pressure = state.incidentPressure[j.id] ?? 0;

  const congestionRaw = Math.min(1, (flow / capacity) * (1 + weatherRaw * 0.25) + pressure * 0.35);
  const structRaw = structuralRisk(j);
  const accidentRaw = Math.min(
    1,
    0.25 * (j.historicAccidents / 60) +
      0.3 * congestionRaw +
      0.2 * structRaw +
      0.15 * weatherRaw +
      0.25 * pressure,
  );
  const violationsPerHour = Math.round(
    (6 + j.historicAccidents * 0.35) * demand * (1 + n) * (activeEvent ? 1.6 : 1),
  );
  const violationRaw = Math.min(1, violationsPerHour / 34);

  const raw: FactorBreakdown = {
    congestion: congestionRaw,
    accident: accidentRaw,
    violation: violationRaw,
    weather: weatherRaw,
    event: eventRaw,
    structural: structRaw,
  };

  const factors: FactorBreakdown = {
    congestion: raw.congestion * WEIGHTS.congestion,
    accident: raw.accident * WEIGHTS.accident,
    violation: raw.violation * WEIGHTS.violation,
    weather: raw.weather * WEIGHTS.weather,
    event: raw.event * WEIGHTS.event,
    structural: raw.structural * WEIGHTS.structural,
  };

  const score = Math.round(
    Math.min(100, factors.congestion + factors.accident + factors.violation + factors.weather + factors.event + factors.structural),
  );
  const band = score >= 71 ? "high" : score >= 41 ? "medium" : "low";
  const officersRecommended = score >= 85 ? 5 : score >= 71 ? 4 : score >= 55 ? 3 : score >= 41 ? 2 : 1;

  const baseline = OFFICERS.filter((o) => o.postId === j.id && o.status === "deployed").length;
  const officersPresent = state.manualOfficers[j.id] ?? baseline;
  const coverage = Math.min(1, officersPresent / officersRecommended);
  const priority = Math.round(score * (1 - coverage));

  const ranked = (Object.entries(factors) as [keyof FactorBreakdown, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const label: Record<keyof FactorBreakdown, string> = {
    congestion: "traffic congestion",
    accident: "accident probability",
    violation: "violation density",
    weather: "weather impact",
    event: "event / crowd pressure",
    structural: "road & structural risk",
  };
  const explanation =
    `${j.name} scores ${score}/100 — driven by ${ranked
      .map(([k, v]) => `${label[k]} (+${v.toFixed(0)})`)
      .join(", ")}.` +
    ` ${officersPresent} of ${officersRecommended} recommended officers are on post` +
    (activeEvent ? `, with "${activeEvent.name}" active in the vicinity.` : ".");

  return {
    junction: j,
    score,
    band,
    factors,
    raw,
    congestionIndex: Number(Math.min(1, flow / capacity).toFixed(2)),
    violationsPerHour,
    officersPresent,
    officersRecommended,
    coverage,
    priority,
    ...(activeEvent ? { activeEvent: activeEvent.name } : {}),
    explanation,
  };
}

export interface Allocation {
  junctionId: string;
  name: string;
  present: number;
  recommended: number;
  delta: number;
  priority: number;
  reason: string;
}

export interface EngineOutput {
  results: RiskResult[];
  allocations: Allocation[];
  metrics: {
    avgRisk: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    coveragePct: number;
    unmanned: number;
    officersUsed: number;
  };
}

export function runEngine(state: WorldState): EngineOutput {
  const results = JUNCTIONS.map((j) => scoreJunction(j, state)).sort((a, b) => b.priority - a.priority);

  // Greedy constrained allocation: fill highest marginal risk-reduction first.
  let pool = state.totalOfficers;
  const assigned = new Map<string, number>();
  for (const r of results) {
    const keep = Math.min(r.officersPresent, pool);
    assigned.set(r.junction.id, keep);
    pool -= keep;
  }
  const gaps = [...results].sort((a, b) => b.priority - a.priority);
  for (const r of gaps) {
    if (pool <= 0) break;
    const cur = assigned.get(r.junction.id) ?? 0;
    const need = Math.max(0, r.officersRecommended - cur);
    const give = Math.min(need, pool);
    if (give > 0) {
      assigned.set(r.junction.id, cur + give);
      pool -= give;
    }
  }

  const allocations: Allocation[] = results
    .map((r) => {
      const rec = assigned.get(r.junction.id) ?? 0;
      return {
        junctionId: r.junction.id,
        name: r.junction.name,
        present: r.officersPresent,
        recommended: rec,
        delta: rec - r.officersPresent,
        priority: r.priority,
        reason: r.explanation,
      };
    })
    .sort((a, b) => b.priority - a.priority || Math.abs(b.delta) - Math.abs(a.delta));

  const high = results.filter((r) => r.band === "high");
  const coveredHigh = high.filter((r) => (assigned.get(r.junction.id) ?? 0) >= r.officersRecommended).length;

  return {
    results,
    allocations,
    metrics: {
      avgRisk: Math.round(results.reduce((s, r) => s + r.score, 0) / results.length),
      highCount: high.length,
      mediumCount: results.filter((r) => r.band === "medium").length,
      lowCount: results.filter((r) => r.band === "low").length,
      coveragePct: high.length ? Math.round((coveredHigh / high.length) * 100) : 100,
      unmanned: results.filter((r) => r.officersPresent === 0 && r.band !== "low").length,
      officersUsed: state.totalOfficers - pool,
    },
  };
}

export function bandColor(band: RiskResult["band"]) {
  return band === "high" ? "var(--risk-high)" : band === "medium" ? "var(--risk-med)" : "var(--risk-low)";
}

export function hourLabel(h: number) {
  const suffix = h < 12 ? "AM" : "PM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:00 ${suffix}`;
}
