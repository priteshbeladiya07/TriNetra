import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Flame, Layers, Loader2, Navigation, Route as RouteIcon } from "lucide-react";
import type { RiskResult } from "@/lib/trinetra/engine";
import {
  GOOGLE_MAPS_API_KEY,
  LIGHT_MAP_STYLE,
  loadGoogleMaps,
} from "@/lib/maps/googleMaps";
import { GoogleHeatmapOverlay } from "@/lib/maps/googleHeatmapOverlay";

const NAGPUR = { lat: 21.1458, lng: 79.0882 };

function color(band: RiskResult["band"]) {
  return band === "high" ? "#dc2626" : band === "medium" ? "#f59e0b" : "#16a34a";
}

interface Props {
  results: RiskResult[];
  selectedId?: string | undefined;
  onSelect?: (id: string) => void;
  showHeat?: boolean;
  showRoutes?: boolean;
}

function popupHtml(r: RiskResult) {
  const bandColor = color(r.band);
  return `
    <div style="font-family:Inter,system-ui,sans-serif;min-width:240px;color:#0f172a;padding:2px 0;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:6px;">
        <strong style="font-size:15px;font-weight:700;color:#0f172a;">${r.junction.name}</strong>
        <span style="background:${bandColor};color:#fff;border-radius:6px;padding:3px 8px;font:700 12px ui-monospace,monospace;letter-spacing:0.04em;">${r.score}</span>
      </div>
      <div style="font-size:11px;color:#64748b;margin-bottom:8px;font-weight:500;">
        Zone: ${r.junction.zone} · ${r.junction.roadType.toUpperCase()} · ${r.junction.laneCount} Lanes
      </div>
      <p style="margin:0 0 10px;font-size:12px;line-height:1.45;color:#334155;">${r.explanation}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font:11px ui-monospace,monospace;color:#475569;background:#f8fafc;padding:8px;border-radius:6px;border:1px solid #e2e8f0;">
        <div><strong>Congestion:</strong> ${(r.congestionIndex * 100).toFixed(0)}%</div>
        <div><strong>Violations:</strong> ${r.violationsPerHour}/hr</div>
        <div><strong>Officers:</strong> ${r.officersPresent}/${r.officersRecommended}</div>
        <div><strong>Priority:</strong> #${r.priority}</div>
      </div>
    </div>`;
}

export default function RiskMapInner({
  results,
  selectedId,
  onSelect,
  showHeat = true,
  showRoutes = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const routesRef = useRef<google.maps.Polyline[]>([]);
  const heatRef = useRef<GoogleHeatmapOverlay | null>(null);
  const infoRef = useRef<google.maps.InfoWindow | null>(null);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;

  const [heatActive, setHeatActive] = useState(showHeat);
  const [routesActive, setRoutesActive] = useState(showRoutes);
  const [mapType, setMapType] = useState<"roadmap" | "satellite" | "hybrid">("roadmap");

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Sync props to internal state
  useEffect(() => {
    setHeatActive(showHeat);
  }, [showHeat]);

  useEffect(() => {
    setRoutesActive(showRoutes);
  }, [showRoutes]);

  // --- Map bootstrap -------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current) return;
        const map = new maps.Map(containerRef.current, {
          center: NAGPUR,
          zoom: 12,
          styles: LIGHT_MAP_STYLE,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          clickableIcons: false,
          gestureHandling: "greedy",
          backgroundColor: "#f5f7fa",
        });
        mapRef.current = map;
        infoRef.current = new maps.InfoWindow({
          pixelOffset: new maps.Size(0, -12),
        });
        setStatus("ready");
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setErrorMessage(err.message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Heatmap (real risk scores as weights) -------------------------
  const heatPoints = useMemo(
    () =>
      results.map((r) => ({
        lat: r.junction.lat,
        lng: r.junction.lon,
        weight: Math.max(0.08, r.score / 100),
      })),
    [results],
  );

  useEffect(() => {
    const map = mapRef.current;
    if (status !== "ready" || !map) return;

    if (!heatRef.current) {
      heatRef.current = new GoogleHeatmapOverlay({
        radius: 48,
        blur: 26,
        opacity: 0.82,
        maxIntensity: 1.0,
      });
    }

    heatRef.current.setData(heatPoints);
    heatRef.current.setMap(heatActive ? map : null);
  }, [heatPoints, heatActive, status]);

  // --- Junction markers + info windows -------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (status !== "ready" || !map) return;
    const maps = window.google.maps;
    const seen = new Set<string>();

    for (const r of results) {
      seen.add(r.junction.id);
      const selected = selectedId === r.junction.id;
      const markerColor = color(r.band);

      const icon: google.maps.Symbol = {
        path: maps.SymbolPath.CIRCLE,
        scale: selected ? 11 : 7 + (r.score / 100) * 4,
        fillColor: markerColor,
        fillOpacity: 0.95,
        strokeColor: selected ? "#1d4ed8" : "#ffffff",
        strokeWeight: selected ? 3.5 : 2,
      };

      let marker = markersRef.current.get(r.junction.id);
      if (!marker) {
        marker = new maps.Marker({
          position: { lat: r.junction.lat, lng: r.junction.lon },
          map,
          icon,
          title: `${r.junction.name} — Risk: ${r.score}`,
          zIndex: selected ? 999 : Math.round(r.score),
        });
        const created = marker;
        marker.addListener("click", () => {
          selectRef.current?.(r.junction.id);
          infoRef.current?.setContent(popupHtml(r));
          infoRef.current?.open({ map, anchor: created });
        });
        markersRef.current.set(r.junction.id, marker);
      } else {
        marker.setIcon(icon);
        marker.setTitle(`${r.junction.name} — Risk: ${r.score}`);
        marker.setZIndex(selected ? 999 : Math.round(r.score));
        maps.event.clearListeners(marker, "click");
        const m = marker;
        marker.addListener("click", () => {
          selectRef.current?.(r.junction.id);
          infoRef.current?.setContent(popupHtml(r));
          infoRef.current?.open({ map, anchor: m });
        });
      }
    }

    for (const [id, marker] of markersRef.current) {
      if (!seen.has(id)) {
        marker.setMap(null);
        markersRef.current.delete(id);
      }
    }
  }, [results, selectedId, status]);

  // --- Dispatch corridors to top high-risk junctions ------------------
  useEffect(() => {
    const map = mapRef.current;
    if (status !== "ready" || !map) return;
    const maps = window.google.maps;

    routesRef.current.forEach((p) => p.setMap(null));
    routesRef.current = [];
    if (!routesActive) return;

    const hub = results.find((r) => r.junction.id === "J01");
    if (!hub) return;
    const high = results.filter((r) => r.band === "high").slice(0, 6);

    routesRef.current = high.map(
      (r) =>
        new maps.Polyline({
          map,
          path: [
            { lat: hub.junction.lat, lng: hub.junction.lon },
            { lat: r.junction.lat, lng: r.junction.lon },
          ],
          strokeOpacity: 0,
          icons: [
            {
              icon: { path: "M 0,-1 0,1", strokeOpacity: 0.75, strokeColor: "#2563eb", scale: 3.5 },
              offset: "0",
              repeat: "14px",
            },
          ],
        }),
    );
  }, [results, routesActive, status]);

  // --- Pan to selection ----------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (status !== "ready" || !map || !selectedId) return;
    const target = results.find((r) => r.junction.id === selectedId);
    if (target) {
      map.panTo({ lat: target.junction.lat, lng: target.junction.lon });
      const marker = markersRef.current.get(selectedId);
      if (marker && infoRef.current) {
        infoRef.current.setContent(popupHtml(target));
        infoRef.current.open({ map, anchor: marker });
      }
    }
  }, [selectedId, results, status]);

  // --- Cleanup ---------------------------------------------------------
  useEffect(
    () => () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current.clear();
      routesRef.current.forEach((p) => p.setMap(null));
      routesRef.current = [];
      heatRef.current?.setMap(null);
      heatRef.current = null;
    },
    [],
  );

  function handleRecenter() {
    if (mapRef.current) {
      mapRef.current.setCenter(NAGPUR);
      mapRef.current.setZoom(12);
    }
  }

  function handleMapTypeToggle() {
    if (!mapRef.current) return;
    const next = mapType === "roadmap" ? "satellite" : mapType === "satellite" ? "hybrid" : "roadmap";
    setMapType(next);
    mapRef.current.setMapTypeId(next);
    if (next === "roadmap") {
      mapRef.current.setOptions({ styles: LIGHT_MAP_STYLE });
    } else {
      mapRef.current.setOptions({ styles: [] });
    }
  }

  if (status === "error") {
    const missingKey = !GOOGLE_MAPS_API_KEY || errorMessage === "MISSING_GOOGLE_MAPS_API_KEY";
    return (
      <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 p-6">
        <div className="max-w-md text-center">
          <AlertTriangle className="mx-auto size-6 text-warning" />
          <p className="mt-3 text-sm font-semibold text-foreground">
            {missingKey ? "Google Maps API key not configured" : "Google Maps failed to load"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {missingKey ? (
              <>
                Add <code className="font-mono">VITE_GOOGLE_MAPS_API_KEY</code> to your{" "}
                <code className="font-mono">.env</code> file and restart the dev server.
              </>
            ) : (
              <>
                Please ensure the Maps JavaScript API is enabled in your Google Cloud Console project and
                has billing or valid referrer permissions.
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-surface-2">
      <div ref={containerRef} className="h-full w-full" />

      {/* Floating Control Toolbar */}
      {status === "ready" && (
        <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5 rounded-lg border border-border/80 bg-surface/90 p-1.5 shadow-md backdrop-blur-md">
          <button
            type="button"
            onClick={() => setHeatActive(!heatActive)}
            title="Toggle Live Heatmap Layer"
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${heatActive
                ? "bg-risk-high/15 text-risk-high border border-risk-high/30 font-semibold"
                : "text-muted-foreground hover:bg-surface-2"
              }`}
          >
            <Flame className="size-3.5" />
            Heatmap {heatActive ? "ON" : "OFF"}
          </button>

          <button
            type="button"
            onClick={() => setRoutesActive(!routesActive)}
            title="Toggle Dispatch Corridors"
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${routesActive
                ? "bg-primary/15 text-primary border border-primary/30 font-semibold"
                : "text-muted-foreground hover:bg-surface-2"
              }`}
          >
            <RouteIcon className="size-3.5" />
            Corridors
          </button>

          <div className="h-4 w-px bg-border mx-0.5" />

          <button
            type="button"
            onClick={handleMapTypeToggle}
            title="Switch Map Layer (Roadmap / Satellite / Hybrid)"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-surface-2 transition-colors capitalize"
          >
            <Layers className="size-3.5" />
            {mapType}
          </button>

          <button
            type="button"
            onClick={handleRecenter}
            title="Recenter Map to Nagpur"
            className="flex items-center gap-1 rounded-md p-1 text-xs text-muted-foreground hover:bg-surface-2 transition-colors"
          >
            <Navigation className="size-3.5" />
          </button>
        </div>
      )}

      {status === "loading" && (
        <div className="absolute inset-0 grid place-items-center bg-muted/60">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading Nagpur Google Maps SDK…
          </p>
        </div>
      )}
    </div>
  );
}
