/**
 * Google Maps JavaScript API loader.
 *
 * The key is never hardcoded — it comes from the environment:
 *   VITE_GOOGLE_MAPS_API_KEY                        (preferred, see .env.example)
 *   VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY  (Lovable Google Maps connector)
 */

export const GOOGLE_MAPS_API_KEY: string =
  (import.meta.env['VITE_GOOGLE_MAPS_API_KEY'] as string | undefined) ??
  (import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY'] as string | undefined) ??
  "";

const LIBRARIES = "places,geometry";

let loader: Promise<typeof google.maps> | null = null;

export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser"));
  }
  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(new Error("MISSING_GOOGLE_MAPS_API_KEY"));
  }
  if (window.google?.maps?.Map) return Promise.resolve(window.google.maps);
  if (loader) return loader;

  loader = new Promise<typeof google.maps>((resolve, reject) => {
    const callbackName = "__trinetraGoogleMapsReady";
    (window as unknown as Record<string, unknown>)[callbackName] = () => {
      resolve(window.google.maps);
    };

    // Google Maps Auth Failure hook
    (window as unknown as Record<string, unknown>)["gm_authFailure"] = () => {
      loader = null;
      console.error("Google Maps API Key Authentication Failed. Check API Key restrictions and billing.");
    };

    const script = document.createElement("script");
    const channel = import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID'] as
      | string
      | undefined;
    const params = new URLSearchParams({
      key: GOOGLE_MAPS_API_KEY,
      libraries: LIBRARIES,
      loading: "async",
      callback: callbackName,
      v: "weekly",
    });
    if (channel) params.set("channel", channel);

    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => {
      loader = null;
      reject(new Error("GOOGLE_MAPS_SCRIPT_FAILED"));
    };
    document.head.appendChild(script);
  });

  return loader;
}

/** Light, low-clutter basemap styling for the command center. */
export const LIGHT_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f5f7fa" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5b6b80" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#e8eefb" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e2e8f0" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#dbe8f7" }] },
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#eef1f6" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#cbd5e1" }] },
];

/**
 * Minimal structural types for the visualization library's HeatmapLayer.
 * (@types/google.maps only declares it when the library is loaded eagerly.)
 */
export interface HeatmapLayerLike {
  setData(data: Array<{ location: google.maps.LatLng; weight: number }>): void;
  setMap(map: google.maps.Map | null): void;
  set(key: string, value: unknown): void;
}

export interface HeatmapVisualization {
  HeatmapLayer: new (opts: {
    data: Array<{ location: google.maps.LatLng; weight: number }>;
    radius?: number;
    opacity?: number;
    maxIntensity?: number;
    dissipating?: boolean;
    gradient?: string[];
  }) => HeatmapLayerLike;
}
