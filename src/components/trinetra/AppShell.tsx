import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  FlaskConical,
  Camera,
  FileText,
  Siren,
  Map as MapIcon,
  Radar,
  Users,
  Sun,
  CloudRain,
  CloudLightning,
  CloudFog,
  Radio,
  Volume2,
  VolumeX,
  Maximize2,
  ShieldCheck,
  Zap,
  SunMedium,
  Moon,
} from "lucide-react";
import { useAppState, actions } from "@/lib/trinetra/store";
import { hourLabel, runEngine } from "@/lib/trinetra/engine";
import type { WeatherCondition } from "@/lib/trinetra/data";
import { useTheme } from "@/lib/theme";
import { LiveClock } from "./LiveClock";

const logoPath = "/trinetra-logo.png";

interface NavItem {
  to: string;
  label: string;
  icon: typeof MapIcon;
  desc: string;
  badge: string;
  alert?: boolean;
}

const NAV: NavItem[] = [
  { to: "/", label: "Command Center", icon: MapIcon, desc: "Live risk grid", badge: "CORE" },
  { to: "/risk", label: "Risk Intelligence", icon: Radar, desc: "Factor decomposition", badge: "AI FUSION" },
  { to: "/deployment", label: "Deployment", icon: Users, desc: "Officer allocation", badge: "72 ROSTER" },
  { to: "/incidents", label: "Incidents", icon: AlertTriangle, desc: "Live response", badge: "ACTIVE", alert: true },
  { to: "/simulator", label: "Digital Twin", icon: FlaskConical, desc: "What-if rehearsal", badge: "WHAT-IF" },
  { to: "/camera-vision", label: "Camera Vision", icon: Camera, desc: "Live CV feed", badge: "LIVE CV" },
  { to: "/e-challan", label: "E-Challan", icon: FileText, desc: "Violation fines", badge: "FINES" },
  { to: "/dispatch", label: "Police Dispatch", icon: Siren, desc: "Emergency response", badge: "DISPATCH" },
  { to: "/analytics", label: "Analytics", icon: BarChart3, desc: "Trends & audit", badge: "METRICS" },
];

const WEATHERS: { id: WeatherCondition; label: string; icon: typeof Sun }[] = [
  { id: "clear", label: "Clear", icon: Sun },
  { id: "light-rain", label: "Rain", icon: CloudRain },
  { id: "heavy-rain", label: "Storm", icon: CloudLightning },
  { id: "fog", label: "Fog", icon: CloudFog },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const world = useAppState((s) => s.world);
  const incidents = useAppState((s) => s.incidents);
  const { metrics } = runEngine(world);
  const { theme, toggleTheme, setTheme } = useTheme();

  const [audioAlerts, setAudioAlerts] = useState(true);
  const activeIncidentsCount = incidents.filter((i) => i.status !== "cleared").length;

  const threatLevel =
    metrics.highCount >= 6
      ? { label: "THREAT: CRITICAL", color: "bg-red-500/15 text-red-600 border-red-500/30", dot: "bg-red-500 animate-ping" }
      : metrics.highCount >= 3
        ? { label: "THREAT: ELEVATED", color: "bg-amber-500/15 text-amber-600 border-amber-500/30", dot: "bg-amber-500 animate-pulse" }
        : { label: "THREAT: NOMINAL", color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", dot: "bg-emerald-500" };

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
    } else {
      document.exitFullscreen().catch(() => { });
    }
  }

  return (
    <div className="flex min-h-screen bg-background" data-weather={world.weather}>
      {/* ========================================================================= */}
      {/* 1. CRAZY SIDE DASHBOARD (TACTICAL CYBER SIDEBAR)                         */}
      {/* ========================================================================= */}
      <aside className="sticky top-0 z-20 hidden h-screen w-[272px] shrink-0 flex-col border-r border-border/80 bg-surface/95 backdrop-blur-xl lg:flex shadow-[4px_0_24px_-4px_rgba(15,23,42,0.04)]">
        {/* Brand & Holographic Radar Status Header */}
        <div className="relative overflow-hidden border-b border-border/80 p-4 pb-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="group flex items-center gap-2.5">
              <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-blue-500/15 to-purple-500/20 p-1.5 shadow-sm ring-1 ring-primary/30 transition-transform group-hover:scale-105">
                <Radar className="size-6 text-primary animate-radar-slow" />
                <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-surface animate-pulse" />
              </div>
              <div>
                <img
                  src={logoPath}
                  alt="TriNetra"
                  width={200}
                  height={50}
                  className="h-7 w-auto object-contain"
                />
                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-primary/80 font-bold">
                  Command Defense Grid
                </p>
              </div>
            </Link>
          </div>

          {/* Micro Status Chip */}
          <div className="mt-3 flex items-center justify-between rounded-lg border border-border/70 bg-surface-2/80 px-2.5 py-1.5 font-mono text-[10px]">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              NAGPUR SECTOR 01
            </span>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">
              28 NODES OK
            </span>
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-3">
          <div className="px-2 pb-1 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground font-bold">
            Tactical Operations
          </div>
          {NAV.map(({ to, label, icon: Icon, desc, badge, alert }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200 ${active
                    ? "bg-gradient-to-r from-primary/15 via-primary/8 to-transparent text-primary font-semibold shadow-sm border border-primary/25"
                    : "text-muted-foreground hover:bg-surface-2/90 hover:text-foreground border border-transparent"
                  }`}
              >
                {/* Active Neon Laser Indicator */}
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary shadow-[0_0_10px_#2563eb]" />
                )}

                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${active
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                      : "bg-surface-2 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    }`}
                >
                  <Icon className="size-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-[13px] leading-snug">{label}</span>
                    {alert && activeIncidentsCount > 0 ? (
                      <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-1.5 py-0.2 font-mono text-[9px] font-bold text-red-600 border border-red-500/40 animate-pulse">
                        {activeIncidentsCount}
                      </span>
                    ) : (
                      <span
                        className={`font-mono text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider ${active
                            ? "bg-primary/15 text-primary font-bold"
                            : "text-muted-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity"
                          }`}
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                  <span className="block truncate font-mono text-[10px] text-muted-foreground/80">
                    {desc}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Diagnostics & Readiness Footer */}
        <div className="border-t border-border/80 bg-surface-2/50 p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                High-Risk Coverage
              </span>
              <span className="font-mono text-xs font-bold text-foreground">
                {metrics.coveragePct}%
              </span>
            </div>

            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-2 p-0.5 border border-border/70">
              <div
                className="h-full rounded-full transition-all duration-700 shadow-sm"
                style={{
                  width: `${metrics.coveragePct}%`,
                  background: "linear-gradient(90deg, #10b981, #f59e0b, #ef4444)",
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground border-t border-border/60 pt-2.5">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3 text-emerald-600" />
              {metrics.officersUsed}/{world.totalOfficers} Ready
            </span>
            <span className="flex items-center gap-1 text-[10px] text-primary">
              <Zap className="size-3" />
              12ms LATENCY
            </span>
          </div>

          {/* Sidebar Theme Switcher */}
          <div className="flex items-center justify-between rounded-lg border border-border/70 bg-surface-2/80 p-1 font-mono text-[10px]">
            <span className="px-1.5 font-bold text-muted-foreground uppercase tracking-wider">THEME</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex items-center gap-1 rounded-md px-2 py-0.5 transition-all ${
                  theme === "light"
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <SunMedium className="size-3 text-amber-400" /> Light
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex items-center gap-1 rounded-md px-2 py-0.5 transition-all ${
                  theme === "dark"
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon className="size-3" /> Dark
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. CRAZY TITLE BAR (TOP COMMAND RIBBON)                                   */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-[500] border-b border-border/90 bg-surface/90 backdrop-blur-md shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
            {/* Left: Mobile Brand & Live Radar Feed */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center lg:hidden">
                <img
                  src={logoPath}
                  alt="TriNetra"
                  width={140}
                  height={35}
                  className="h-7 w-auto object-contain"
                />
              </Link>

              <div className="hidden items-center gap-2 rounded-lg border border-primary/25 bg-primary/5 px-2.5 py-1.5 sm:flex">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                <span className="font-mono text-[11px] font-bold tracking-wider text-primary">
                  RADAR ACTIVE
                </span>
              </div>

              {/* Threat Level Badge */}
              <div
                className={`hidden items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[11px] font-bold md:flex ${threatLevel.color}`}
              >
                <span className={`size-2 rounded-full ${threatLevel.dot}`} />
                {threatLevel.label}
              </div>
            </div>

            {/* Middle: Live Military Clock & Simulation Scrubber */}
            <div className="flex items-center gap-2 sm:gap-3">
              <LiveClock />

              {/* Simulation Hour Scrubber */}
              <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-surface-2/80 px-3 py-1.5 shadow-sm">
                <Radio className="size-3.5 text-primary shrink-0" />
                <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:inline font-semibold">
                  Hour
                </span>
                <input
                  type="range"
                  min={0}
                  max={23}
                  value={world.hour}
                  onChange={(e) => actions.setWorld({ hour: Number(e.target.value) })}
                  className="h-1.5 w-16 cursor-pointer appearance-none rounded-full bg-muted accent-primary sm:w-28"
                  aria-label="Simulation hour"
                />
                <span className="font-mono text-xs font-bold text-foreground min-w-[56px] text-right">
                  {hourLabel(world.hour)}
                </span>
              </div>

              {/* Weather Condition Toggle */}
              <div className="flex rounded-lg border border-border/80 bg-surface-2/80 p-1 shadow-sm">
                {WEATHERS.map(({ id, label, icon: WIcon }) => (
                  <button
                    key={id}
                    onClick={() => actions.setWorld({ weather: id })}
                    title={`Scenario: ${label}`}
                    className={`flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[11px] transition-all ${world.weather === id
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface"
                      }`}
                  >
                    <WIcon className="size-3.5" />
                    <span className="hidden xl:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Live Risk Telemetry Counters & Action Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 font-mono text-xs">
                {/* High Risk Counter */}
                <div className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 font-bold text-red-600 shadow-sm">
                  <span className="size-1.5 rounded-full bg-red-500 animate-ping" />
                  <span>HIGH {metrics.highCount}</span>
                </div>

                {/* Medium Risk Counter */}
                <div className="hidden sm:flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1 font-semibold text-amber-600">
                  <span>MED {metrics.mediumCount}</span>
                </div>

                {/* Low Risk Counter */}
                <div className="hidden md:flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 font-semibold text-emerald-600">
                  <span>LOW {metrics.lowCount}</span>
                </div>
              </div>

              {/* Action Icons + DEDICATED THEME TOGGLE BUTTON */}
              <div className="flex items-center gap-1.5 border-l border-border/80 pl-2">
                {/* Separate Theme Toggle Button (Light/Dark) */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  title={theme === "dark" ? "Switch to White/Light Theme (Maps stay light)" : "Switch to Black/Dark Theme (Maps stay light)"}
                  className="flex items-center gap-1.5 rounded-lg border border-border/90 bg-surface-2/90 px-2.5 py-1.5 font-mono text-xs font-bold transition-all duration-200 hover:border-primary/50 hover:bg-surface shadow-xs cursor-pointer"
                >
                  {theme === "dark" ? (
                    <>
                      <SunMedium className="size-3.5 text-amber-400 animate-spin-slow" />
                      <span className="hidden sm:inline text-[11px] text-foreground font-bold tracking-wider">LIGHT</span>
                    </>
                  ) : (
                    <>
                      <Moon className="size-3.5 text-primary" />
                      <span className="hidden sm:inline text-[11px] text-foreground font-bold tracking-wider">DARK</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setAudioAlerts(!audioAlerts)}
                  title={audioAlerts ? "Audio Alerts Enabled" : "Audio Alerts Muted"}
                  className={`rounded-lg border p-1.5 transition-colors ${audioAlerts
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-surface-2"
                    }`}
                >
                  {audioAlerts ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
                </button>

                <button
                  onClick={toggleFullscreen}
                  title="Toggle Fullscreen Command Mode"
                  className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors"
                >
                  <Maximize2 className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Bottom Navigation Strip */}
          <nav className="flex gap-1 overflow-x-auto border-t border-border/80 px-3 py-1.5 lg:hidden bg-surface-2/60">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${pathname === to
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-surface"
                  }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </header>

        {/* Main Operational Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7">{children}</main>
      </div>
    </div>
  );
}
